import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.resolve(__dirname, '../public/images');
const images = ['commute', 'diet', 'energy'];

async function convert() {
  console.log('Starting image conversion to WebP...');
  for (const name of images) {
    const pngPath = path.join(imagesDir, `${name}.png`);
    const webpPath = path.join(imagesDir, `${name}.webp`);

    if (fs.existsSync(pngPath)) {
      try {
        console.log(`Converting ${name}.png to WebP...`);
        await sharp(pngPath).webp({ quality: 80 }).toFile(webpPath);
        console.log(`Successfully created ${name}.webp`);

        // Delete the original png file
        fs.unlinkSync(pngPath);
        console.log(`Deleted original ${name}.png`);
      } catch (err) {
        console.error(`Error converting ${name}:`, err);
      }
    } else {
      console.log(`${name}.png does not exist at ${pngPath}, skipping.`);
    }
  }
  console.log('Image conversion phase complete!');
}

convert();
