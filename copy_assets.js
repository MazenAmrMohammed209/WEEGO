const fs = require('fs');
const path = require('path');

const publicAssetsDir = path.join(__dirname, 'public', 'assets');
const appAssetsDir = path.join(__dirname, 'src', 'app', 'assets');

if (!fs.existsSync(publicAssetsDir)) {
  fs.mkdirSync(publicAssetsDir, { recursive: true });
}

fs.copyFileSync(path.join(appAssetsDir, 'heroimg.jpg'), path.join(publicAssetsDir, 'heroimg.jpg'));
fs.copyFileSync(path.join(appAssetsDir, 'icon.png'), path.join(publicAssetsDir, 'icon.png'));

console.log('Successfully copied assets.');
