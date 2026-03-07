const fs = require('fs');
const path = require('path');

const outputDir = path.join(process.cwd(), '.vercel/output/static/_worker.js');
const distDir = path.join(outputDir, '__next-on-pages-dist__/wasm');

if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    files.forEach(file => {
        if (file.endsWith('.wasm')) {
            const filePath = path.join(distDir, file);
            const stats = fs.statSync(filePath);
            console.log(`Removing WASM file: ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
            fs.unlinkSync(filePath);
        }
    });
    console.log('Cleanup complete.');
} else {
    console.log('WASM directory not found in output. Skipping cleanup.');
}
