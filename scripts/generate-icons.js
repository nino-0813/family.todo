const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, '../public/icons/69C7B426-07FB-47FE-832A-B13A5850417A_1_105_c.jpeg');
const outputDir = path.join(__dirname, '../public/icons');

// Icon sizes for PWA
const sizes = [32, 72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    // Read the JPEG image
    const imageBuffer = fs.readFileSync(imagePath);
    
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(imageBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      
      console.log(`Generated: icon-${size}x${size}.png`);
    }
    
    console.log('All icons generated successfully from custom image!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
