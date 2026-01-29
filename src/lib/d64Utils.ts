export interface ScoreEntry {
  pos: number;
  score: string;
  name: string;
}

// D64 Geometry
const SEC_PER_TRACK = [
  0, // Track 0 unused
  21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, // 1-17
  19, // 18
  19, 19, 19, 19, 19, 19, // 19-24
  18, 18, 18, 18, 18, 18, // 25-30
  17, 17, 17, 17, 17 // 31-35 (Standard D64 stops here usually)
];

function getSectorOffset(track: number, sector: number): number {
  let offset = 0;
  for (let t = 1; t < track; t++) {
    offset += (SEC_PER_TRACK[t] || 17) * 256; // Default to 17 if out of bounds (extended tracks?)
  }
  offset += sector * 256;
  return offset;
}

function petsciiToAscii(bytes: Buffer | Uint8Array): string {
  let str = '';
  for (const b of bytes) {
    if (b === 0xA0) continue; // Padding
    if (b >= 0x41 && b <= 0x5A) {
      str += String.fromCharCode(b).toLowerCase();
    } else {
      str += String.fromCharCode(b);
    }
  }
  return str.trim();
}

function findFile(buffer: Buffer, filename: string): { track: number; sector: number; size: number } | null {
  // Directory is at Track 18, Sector 1 (Usually pointed to by 18/0)
  const bamOffset = getSectorOffset(18, 0);
  let track = buffer[bamOffset];
  let sector = buffer[bamOffset + 1];

  while (track !== 0) {
    const offset = getSectorOffset(track, sector);
    const nextTrack = buffer[offset];
    const nextSector = buffer[offset + 1];

    // 8 entries per sector. Entry 0 starts at offset+0 (bytes 0,1 are link, but first entry overlaps... see previous logic)
    // Actually, standard: Bytes 00-01 Link. Bytes 02-21 Entry 0.
    // My previous script assumed this structure and it "should" work if standard D64.
    
    for (let i = 0; i < 8; i++) {
        // Entries start at byte 2, then 34, 66...?
        // Let's stick to the 32 byte grid starting at 0, where first entry is shifted or special.
        // Actually, many sources say:
        // Byte 0-1: Link.
        // Byte 2-33: File Entry #1
        // Byte 34-65: File Entry #2
        // ...
        // Byte 226-257: File Entry #8? (226+31 = 257 overflow).
        // Let's assume the previous logic: `offset + (i * 32)` but check `entryStart + 2`.
        // If i=0, start=0. Type at 2. Track/Sec at 3,4. Name at 5.
        // This aligns with "Byte 2-33 is Entry 1" IF we consider the "header" part of the sector as consumed by the fact that i*32=0 is the first slot.
        // Wait. If Entry 1 is at 2. Then `i * 32` would need to be offset by 2?
        // No, let's look at the offsets:
        // i=0 -> start=0. Type=2. Name=5.
        // i=1 -> start=32. Type=34. Name=37.
        // This perfectly matches "Byte 34-65 is Entry 2".
        
        const entryStart = offset + (i * 32);
        
        // Safety check
        if (entryStart + 32 > offset + 256) continue;

        const fileType = buffer[entryStart + 2];
        if (fileType === 0) continue; // Deleted/Empty/Scratched

        const fileTrack = buffer[entryStart + 3];
        const fileSector = buffer[entryStart + 4];
        
        const rawName = buffer.subarray(entryStart + 5, entryStart + 5 + 16);
        const name = petsciiToAscii(rawName);

        const normalizedName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const normalizedTarget = filename.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

        if (normalizedName.includes(normalizedTarget)) {
            return { track: fileTrack, sector: fileSector, size: 0 };
        }
    }
    
    track = nextTrack;
    sector = nextSector;
    if (track === 0) break; 
  }
  return null;
}

function readFileChain(buffer: Buffer, startTrack: number, startSector: number): Buffer {
  let track = startTrack;
  let sector = startSector;
  let fileBuffer = Buffer.alloc(0);

  // Prevent infinite loops with a max block count
  let safetyCounter = 0;
  const MAX_BLOCKS = 683; // Standard D64 size

  while (track !== 0 && safetyCounter < MAX_BLOCKS) {
    safetyCounter++;
    const offset = getSectorOffset(track, sector);
    const nextTrack = buffer[offset];
    const nextSector = buffer[offset + 1];

    let dataStart = offset + 2;
    let dataEnd = offset + 256;

    if (nextTrack === 0) {
      // Last block, nextSector is pointer to last byte + 1
      dataEnd = offset + nextSector;
    }

    // Append data
    if (dataEnd > dataStart) {
        const chunk = buffer.subarray(dataStart, dataEnd);
        fileBuffer = Buffer.concat([fileBuffer, chunk]);
    }

    track = nextTrack;
    sector = nextSector;
  }
  return fileBuffer;
}

function parseScores(buffer: Buffer): ScoreEntry[] {
    const scores: ScoreEntry[] = [];
    const START_OFFSET = 2; // raw[2]
    const STRIDE = 7;
    
    // Check buffer length
    if (buffer.length < START_OFFSET + 5 * STRIDE) {
        console.warn("Buffer too small for expected score data");
        return [];
    }

    for (let i = 0; i < 5; i++) {
        const base = START_OFFSET + (i * STRIDE);
        
        if (base + 6 >= buffer.length) break;

        // Score: 2 bytes
        const s1 = buffer[base];
        const s2 = buffer[base+1];
        const scoreStr = s1.toString(16).padStart(2, '0') + s2.toString(16).padStart(2, '0');
        
        // Name: 4 bytes (offset base+3)
        const nameBytes = [buffer[base+3], buffer[base+4], buffer[base+5], buffer[base+6]];
        let nameStr = "";
        for (const b of nameBytes) {
            if (b >= 1 && b <= 26) {
                nameStr += String.fromCharCode(b + 64);
            }
        }
        
        scores.push({ pos: i+1, score: scoreStr, name: nameStr });
    }
    return scores;
}

export function extractScoresFromD64(buffer: Buffer): ScoreEntry[] {
  const fileInfo = findFile(buffer, 'topscores');
  if (!fileInfo) {
    throw new Error('TOPSCORES file not found in D64 image');
  }
  const fileData = readFileChain(buffer, fileInfo.track, fileInfo.sector);
  return parseScores(fileData);
}
