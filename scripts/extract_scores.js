const fs = require('fs');
const path = require('path');

// Configuration
const D64_PATH = path.join(__dirname, '../roms/digdugrevival.d64');
const TARGET_FILENAME = 'topscores'; // Case insensitive search usually
const DEBUG = false;

// D64 Geometry
const SEC_PER_TRACK = [
    0, // Track 0 unused
     21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, // 1-17
     19, // 18
     19, 19, 19, 19, 19, 19, // 19-24
     18, 18, 18, 18, 18, 18, // 25-30
     17, 17, 17, 17, 17 // 31-35 (Standard D64 stops here usually)
];

function getSectorOffset(track, sector) {
    let offset = 0;
    for (let t = 1; t < track; t++) {
        offset += SEC_PER_TRACK[t] * 256;
    }
    offset += sector * 256;
    return offset;
}

function readD64(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }
    return fs.readFileSync(filePath);
}

function petsciiToAscii(bytes) {
    // Simplified PETSCII to ASCII for filenames
    // Only handling A-Z, 0-9 and space for now
    let str = '';
    for (const b of bytes) {
        if (b === 0xA0) continue; // Padding
        // A-Z
        if (b >= 0x41 && b <= 0x5A) {
            str += String.fromCharCode(b).toLowerCase(); // Usually files are lowercase? Or uppercase?
            // Actually C64 filenames are often stored as 0x41='A' but appear as 'a' in some contexts or 'A' in others.
            // Let's just keep them as uppercase for matching.
        } else {
             str += String.fromCharCode(b);
        }
    }
    return str.trim();
}

function findFile(buffer, filename) {
    // Directory is at Track 18, Sector 1
    let track = 18;
    let sector = 1;

    // Track 18 Sector 0 is BAM, Byte 0,1 is ptr to first directory block (usually 18,1)
    const bamOffset = getSectorOffset(18, 0);
    track = buffer[bamOffset];
    sector = buffer[bamOffset + 1];

    if (DEBUG) console.log(`Directory starts at T:${track} S:${sector}`);

    while (track !== 0) {
        const offset = getSectorOffset(track, sector);
        
        // Loop through 8 entries per sector (32 bytes each)
        // Entry starts at byte 2, then 34, 66...
        // Format: T, S to NEXT Dir Block (bytes 0-1 of the SECTOR)
        
        const nextTrack = buffer[offset];
        const nextSector = buffer[offset + 1];

        for (let i = 0; i < 8; i++) {
            const entryOffset = offset + i * 32; // This is WRONG.
            // Real layout:
            // Byte 0,1: Link to next dir sector.
            // Byte 2..33: File Entry 1
            // Byte 34..65: File Entry 2
            // ...
            
            // Wait, byte 0,1 is the link for the SECTOR. The entries start at index 2?
            // Actually, the entries are 32 bytes long.
            // 256 bytes total. 2 bytes link. 254 bytes remaining.
            // 254 / 32 = 7.93...
            // Standard C64 directory sector: 
            // Bytes 00-01: Next sector track/sector (00 00 or 00 FF if last)
            // Bytes 02-21: File Entry 1 (32 bytes? No, entry is 32 bytes generally stated but lets check offsets)
            // Entry 1: 0x02 - 0x21 (32 bytes)
            // Entry 2: 0x22 - 0x41
            // Entry 3: 0x42 - 0x61
            // Entry 4: 0x62 - 0x81
            // Entry 5: 0x82 - 0xA1
            // Entry 6: 0xA2 - 0xC1
            // Entry 7: 0xC2 - 0xE1
            // Entry 8: 0xE2 - 0x101 (258 bytes? Overflow)
            // Wait. 8 * 32 = 256. Perfect fit.
            // But bytes 0-1 are used?
            // "The first two bytes of a directory block point to the next directory block... Since there are 256 bytes in a block and 2 are used for the link, that leaves 254 bytes. Each directory entry is 32 bytes... 8 * 32 = 256. So the last entry overlaps? No."
            //
            // "In a directory block, the first two bytes are the link... The 8 directory entries follow immediately."
            // "Entry 0 is at offset 0? No, bytes 0-1 are T/S link."
            // ACTUALLY, the directory entries are aligned such that the first byte of the NEXT sector link is treated separately?
            // No, the standard says 8 entries PER SECTOR. The entries *technically* follow a 32-byte grid but the first 2 bytes of the SECTOR are the link.
            // SO:
            // Entry 0: Bytes 0-31? No, 0-1 are link. Maybe Entry 0 is skipped or special?
            // Wikipedia: "A directory block contains up to 8 file entries. The first two bytes... point to the next block... The following bytes contain the entries. 
            // But 2 + 8*32 = 258 > 256. 
            // Explanation: The valid entries are bytes 0x02 + i*0x20. But does that fit 8?
            // 0x02 + 7 * 0x20 = 0xE2. 0xE2 + 0x20 = 0x102 (258).
            // So: ONLY 8 ENTRIES IF one is partial? Or maybe only 7 entries?
            // "Normally, a directory block can hold 8 file entries."
            // Actually: The entries are at 0, 32, 64... BUT the first entry must be shifted or something?
            // Ah, usually Entry 0 in a directory block is NOT used for a file? Or bytes 0-1 overlap with the first entry's unused bytes?
            // Wait, File Type byte is at offset 2 of the ENTRY. 
            // If Entry 0 starts at 0, its Type is at 2. This does not conflict with Link at 0,1.
            // So yes, entries start at 0, 32, 64... 
            // Entry 0 (bytes 0-31): Bytes 0,1 are Link. Byte 2 is Type.
            // So Entry 0 is a valid file slot!
            
            const entryStart = offset + (i * 32);
            
            // Check File Type (Byte 2 of entry relative to entry start).
            // But for Entry 0 (i=0), entryStart = offset. Byte 2 is at offset+2.
            // This is correct.
            
            const fileType = buffer[entryStart + 2];
            if (fileType === 0) continue; // Deleted/Empty

            const fileTrack = buffer[entryStart + 3];
            const fileSector = buffer[entryStart + 4];
            
            const rawName = buffer.slice(entryStart + 5, entryStart + 5 + 16);
            const name = petsciiToAscii(rawName);

            // Clean name for comparison (remove special chars, trim)
            // The user's file is "topscores.bin" but on disk it might be "TOPSCORES" or space padded.
            // Also need to be careful about matching. user search string "topscores" (case insensitive).
            
            // Normalize name
            const normalizedName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const normalizedTarget = filename.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

            if (DEBUG) console.log(`Found file: ${name} (${fileType.toString(16)}) at ${fileTrack}/${fileSector} -> Norm: ${normalizedName}`);
            
            if (normalizedName.includes(normalizedTarget)) {
                return { track: fileTrack, sector: fileSector, size: 0 }; // Size not calculated yet
            }
        }
        
        track = nextTrack;
        sector = nextSector;
        if (track === 0) break; // formatting end of chain? usually 0 for next track means end.
    }
    return null;
}

function readFileChain(buffer, startTrack, startSector) {
    let track = startTrack;
    let sector = startSector;
    let fileBuffer = Buffer.alloc(0);

    while (track !== 0) {
        const offset = getSectorOffset(track, sector);
        // First 2 bytes are link to next block
        const nextTrack = buffer[offset];
        const nextSector = buffer[offset + 1]; // If nextTrack is 0, this is number of bytes + 1 used in this sector.
        
        let dataStart = offset + 2;
        let dataEnd = offset + 256;
        
        if (nextTrack === 0) {
            // Last block
            // nextSector contains the index of the last valid byte + 1.
            // E.g. if 1 byte used, nextSector = 1? No.
            // "Pointer to last byte + 1". So if nextSector is 10, valid data is 2 to 9?
            // Let's verify standard D64.
            // "if track is 0, sector is (bytes in last block) + 1".
            // So available data is bytes 2 ... (nextSector-1).
            // Length = (nextSector - 1) - 2 + 1 ??
            // Length = nextSector - 1. (Since it starts at 2? Wait.)
            // Example: 1 byte of data. stored at [2]. Last valid byte is [2]. Pointer is 3.
            // Length = 3 - 2 = 1. Correct.
            dataEnd = offset + nextSector;
        }

        const chunk = buffer.slice(dataStart, dataEnd);
        fileBuffer = Buffer.concat([fileBuffer, chunk]);

        track = nextTrack;
        sector = nextSector;
    }
    return fileBuffer;
}

function parseScores(buffer) {
    // Logic from user python script:
    // d = f.read()[1:] # Skips first byte
    // entries = d[1:3] ...
    // Note: Python slice [1:] removes item at index 0. New array starts at index 0 (old 1).
    // Then d[1:3] (old 2,3) is Score.
    
    // Equivalent in Node currently reading from BUFFER (raw file data):
    // raw[0] -> Skipped (Load address? or just byte 0)
    // raw[1] -> Skipped (by loop start?)
    // User logic:
    // `d = f.read()[1:]` -> d is raw[1...]
    // `d[0]` is raw[1].
    // `d[1:3]` is raw[2], raw[3]. -> Score
    // `d[4:8]` is raw[5], raw[6], raw[7], raw[8]. -> Name
    // Next entry?
    // User loop: `for i, (score, name) in enumerate(names)` where names is a hardcoded list of slices.
    // The loop iterates 5 times.
    
    // Slice 1: d[1:3], d[4:8] -> raw[2,3], raw[5-8]
    // Slice 2: d[8:10], d[11:15] -> raw[9,10], raw[12-15]
    // Delta: 8-1 = 7. 15-8 = 7.
    // So Stride is 7.
    // Entry 0 offset (relative to raw): 2.
    // Pattern:
    // Entry P:
    //   Score: raw[2 + P*7] ... raw[3 + P*7]
    //   Name:  raw[5 + P*7] ... raw[8 + P*7]
    
    // Checking byte 4 (relative to d start): d[3] (index 3).
    // d[3] is raw[4]. It is skipped.
    
    const scores = [];
    const START_OFFSET = 2; // raw[2]
    const STRIDE = 7;
    
    // Check buffer length
    if (buffer.length < START_OFFSET + 5 * STRIDE) {
        console.warn("Buffer too small for expected score data");
    }

    for (let i = 0; i < 5; i++) {
        const base = START_OFFSET + (i * STRIDE);
        
        // Score: 2 bytes
        const s1 = buffer[base];
        const s2 = buffer[base+1];
        // Display as hex string as per python `f'{b:02x}' for b in score`
        const scoreStr = s1.toString(16).padStart(2, '0') + s2.toString(16).padStart(2, '0');
        
        // Name: 4 bytes
        // Python: `chr(b + 64) if 1 <= b <= 26 else ''`
        // 1=A (65), 26=Z (90).
        // base + 3 (skip 1 byte gap at base+2)
        const n1 = buffer[base+3];
        const n2 = buffer[base+4];
        const n3 = buffer[base+5];
        const n4 = buffer[base+6];
        
        const nameBytes = [n1, n2, n3, n4];
        let nameStr = "";
        for (const b of nameBytes) {
            if (b >= 1 && b <= 26) {
                nameStr += String.fromCharCode(b + 64);
            } else {
                // Should we output nothing? Python code: `else ''`
                // Could be space or null.
            }
        }
        
        scores.push({ pos: i+1, score: scoreStr, name: nameStr });
    }
    return scores;
}

// Main execution
const buffer = readD64(D64_PATH);
if (DEBUG) console.log(`D64 loaded, size: ${buffer.length}`);

const fileInfo = findFile(buffer, TARGET_FILENAME);
if (!fileInfo) {
    console.error(`File '${TARGET_FILENAME}' not found in D64.`);
    // Try to list files to help debug?
    // console.log("Listing files...");
    // listFiles(buffer);
    process.exit(1);
}

if (DEBUG) console.log(`Found '${TARGET_FILENAME}' at T:${fileInfo.track} S:${fileInfo.sector}`);

const fileData = readFileChain(buffer, fileInfo.track, fileInfo.sector);
if (DEBUG) console.log(`Extracted ${fileData.length} bytes.`);

const scores = parseScores(fileData);

// Output Table
console.log('POS  PUNTI    NOME');
scores.forEach(s => {
    // Format to align with python: f'{i+1:<4} {score_str:<8} {name_str}'
    console.log(`${s.pos.toString().padEnd(4)} ${s.score.padEnd(8)} ${s.name}`);
});
