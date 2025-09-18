const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Copy HTML file
fs.copyFileSync('src/index.html', 'dist/index.html');

console.log('Build completed! HTML file copied to dist directory.');
console.log('Run "npm run build" to compile TypeScript files.');