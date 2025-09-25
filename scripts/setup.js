// scripts/setup.js
const fs = require('fs');
const path = require('path');

// Create directories if they don't exist
const dirs = ['public/images'];
dirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Create placeholder images
const createPlaceholderImage = (name) => {
  const filePath = path.join(process.cwd(), 'public/images', name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created placeholder image: ${name}`);
  }
};

// Create placeholder images for the app
[
  'hero-nft.png',
  'hero-community.png',
  'nft-showcase.png',
  'community-showcase.png',
  'merch-1.png',
  'merch-2.png',
  'merch-3.png',
  'tb12-nft.png',
  'merch-jersey.png',
  'merch-hoodie.png',
  'merch-football.png',
  'merch-cap.png',
  'merch-tshirt.png',
  'merch-photo.png',
  'coming-soon.png',
  'default-nft.png',
  'default-merch.png'
].forEach(createPlaceholderImage);

console.log('Setup completed successfully!');