const fs = require('fs');
const path = require('path');

// Minimal valid 1x1 PNG in base64
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Create a larger PNG by repeating the minimal one
function createPNG(width, height) {
  // For simplicity, we'll create a minimal valid PNG
  // In production, use proper image libraries
  return minimalPNG;
}

const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create placeholder assets - these are minimal valid PNGs
// They will be replaced by Expo during build if needed
fs.writeFileSync(path.join(assetsDir, 'icon.png'), minimalPNG);
fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), minimalPNG);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), minimalPNG);
fs.writeFileSync(path.join(assetsDir, 'favicon.png'), minimalPNG);

console.log('✅ Created minimal placeholder assets');
console.log('Note: These are placeholders. Expo will generate proper assets during build if needed.');

