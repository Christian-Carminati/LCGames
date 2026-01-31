
const fs = require('fs');
const path = require('path');

// Minimal D64 logic to list files
function getSectorOffset(track, sector) {
    const SEC_PER_TRACK = [0, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 19, 19, 19, 19, 19, 19, 19, 18, 18, 18, 18, 18, 18, 17, 17, 17, 17, 17];
    let offset = 0;
    for (let t = 1; t < track; t++) offset += (SEC_PER_TRACK[t] || 17) * 256;
    offset += sector * 256;
    return offset;
}

function petsciiToAscii(buffer) {
    let str = '';
    for (const b of buffer) {
        if (b === 0xA0) continue; 
        if (b >= 0x41 && b <= 0x5A) str += String.fromCharCode(b).toLowerCase();
        else str += String.fromCharCode(b);
    }
    return str.trim();
}

function listFiles(filePath) {
    const buffer = fs.readFileSync(filePath);
    console.log(`\nFiles in ${path.basename(filePath)}:`);
    
    const bamOffset = getSectorOffset(18, 0);
    let track = buffer[bamOffset];
    let sector = buffer[bamOffset + 1];

    while (track !== 0) {
        const offset = getSectorOffset(track, sector);
        for (let i = 0; i < 8; i++) {
            const entryStart = offset + (i * 32);
            if (buffer[entryStart + 2] === 0) continue; // Deleted
            
            const rawName = buffer.subarray(entryStart + 5, entryStart + 5 + 16);
            const name = petsciiToAscii(rawName);
            const type = buffer[entryStart + 2] & 0x07; // DEL, SEQ, PRG, USR, REL
            const typeStr = ['DEL', 'SEQ', 'PRG', 'USR', 'REL'][type] || '???';
            
            console.log(`- "${name}" (${typeStr})`);
        }
        track = buffer[offset];
        sector = buffer[offset + 1];
    }
}

listFiles('./public/roms/HeroIsBack.d64');
listFiles('./public/roms/DigDugRevival.d64');
