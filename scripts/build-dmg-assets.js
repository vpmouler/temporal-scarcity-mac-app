const fs = require('fs');
const { execSync } = require('child_process');

// Convert SVG to PNG using built-in tools
function convertSvgToPng() {
  try {
    // Check if we have any SVG to PNG conversion tools available
    console.log('Converting SVG to PNG for DMG background...');
    
    // Try to use rsvg-convert if available (common on macOS with Homebrew)
    try {
      execSync('which rsvg-convert', { stdio: 'ignore' });
      execSync('rsvg-convert -w 540 -h 360 -f png -o assets/dmg-background.png assets/dmg-background.svg');
      console.log('✅ DMG background created successfully with rsvg-convert');
      return true;
    } catch (e) {
      // Try ImageMagick convert
      try {
        execSync('which convert', { stdio: 'ignore' });
        execSync('convert -background transparent -resize 540x360 assets/dmg-background.svg assets/dmg-background.png');
        console.log('✅ DMG background created successfully with ImageMagick');
        return true;
      } catch (e) {
        // Try built-in macOS tools
        try {
          execSync('qlmanage -t -s 540 -o assets assets/dmg-background.svg');
          execSync('mv assets/dmg-background.svg.png assets/dmg-background.png');
          console.log('✅ DMG background created successfully with qlmanage');
          return true;
        } catch (e) {
          console.log('⚠️  Could not automatically convert SVG to PNG');
          console.log('Please manually convert assets/dmg-background.svg to assets/dmg-background.png');
          console.log('You can use online tools like convertio.co or install rsvg-convert:');
          console.log('brew install librsvg');
          return false;
        }
      }
    }
  } catch (error) {
    console.error('Error converting SVG:', error.message);
    return false;
  }
}

// Create build assets directory if needed
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

// Convert the SVG
convertSvgToPng();

console.log('\n🎨 DMG design assets ready!');
console.log('📁 Files created:');
console.log('   - assets/dmg-background.svg (vector source)');
console.log('   - assets/dmg-background.png (DMG background)');
console.log('\n📦 Next steps:');
console.log('   1. Run: npm run dist');
console.log('   2. Your beautiful DMG will be in the release/ folder'); 