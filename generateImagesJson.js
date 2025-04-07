// generateImagesJson.js
const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'images');
const outputFile = path.join(imageDir, 'images.json');

// Filter only image files (jpeg, jpg, png, gif, etc.)
const allowedExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.webp'];

fs.readdir(imageDir, (err, files) => {
  if (err) {
    console.error('Failed to read images directory:', err);
    return;
  }

  const imageFiles = files
    .filter(file => allowedExtensions.includes(path.extname(file).toLowerCase()))
    .map(file => `images/${file}`);

  fs.writeFile(outputFile, JSON.stringify(imageFiles, null, 2), (err) => {
    if (err) {
      console.error('Error writing images.json:', err);
    } else {
      console.log(`images.json generated with ${imageFiles.length} image(s).`);
    }
  });
});
