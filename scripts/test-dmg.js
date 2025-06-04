const { execSync } = require('child_process');

console.log('🚀 Quick DMG test build (Intel Mac compatible)...');

try {
  // Convert SVG to ultra-high-res PNG to fix pixelation completely
  console.log('📸 Converting background to ultra-high-res PNG...');
  console.log('   Using 4x resolution: 2640x1800...');
  
  try {
    // Try multiple methods for ultra-high resolution
    execSync('qlmanage -t -s 2640 -o . dmg-background.svg && mv dmg-background.svg.png dmg-background.png', { stdio: 'inherit' });
  } catch (e) {
    console.log('Trying alternative conversion method...');
    execSync('convert -density 400 -background transparent dmg-background.svg -resize 660x450 dmg-background.png', { stdio: 'inherit' });
  }
  
  // Quick build
  console.log('⚡ Quick build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Build DMG for Intel Mac specifically
  console.log('📦 Building DMG for Intel Mac...');
  execSync('electron-builder --mac dmg --x64', { stdio: 'inherit' });
  
  console.log('✅ Intel Mac DMG created!');
  console.log('📁 Check: release/Temporal Focus-1.1.0-x64.dmg');
  
  // Auto-open the Intel DMG
  execSync('open "release/Temporal Focus-1.1.0-x64.dmg"');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\n💡 If conversion failed, try installing:');
  console.log('   brew install imagemagick');
  console.log('   brew install librsvg');
} 