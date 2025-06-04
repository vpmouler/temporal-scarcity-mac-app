const { execSync } = require('child_process');

console.log('🔄 Quick DMG preview...');

try {
  // Convert SVG to PNG
  execSync('qlmanage -t -s 660 -o . dmg-background.svg && mv dmg-background.svg.png dmg-background-preview.png', { stdio: 'inherit' });
  
  // Open the preview
  execSync('open dmg-background-preview.png');
  
  console.log('✅ Preview opened! dmg-background-preview.png');
} catch (error) {
  console.error('Error creating preview:', error.message);
  console.log('💡 Try: open dmg-background.svg (to view in browser)');
} 