#!/usr/bin/env node
// Makes phone-sized copies of large photos so phones don't download full-size images.
//   npm run images
// For every photo in public/images wider than 900px it writes <name>-800w.webp beside it,
// recompresses very large originals, and lists the copies in src/data/imageVariants.json
// (src/utils/responsiveImage.ts uses that list to add srcset to <img> tags).
// Also makes the small header icon, favicons and the default link-preview image.
// Run it again after adding photos. Safe to re-run: existing copies are rebuilt.
import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/routes.mjs';

const IMAGES = path.join(ROOT, 'public/images');
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const toUrl = (f) => '/' + path.relative(path.join(ROOT, 'public'), f).split(path.sep).join('/');

const variants = [];
for (const file of walk(IMAGES)) {
  if (!/\.(webp|jpe?g|png)$/i.test(file) || /-\d+w\.webp$/.test(file) || /[\\/](logos|og)[\\/]/.test(file)) continue;
  let input = readFileSync(file); // read into memory: Windows won't overwrite a file sharp has open
  const meta = await sharp(input).metadata();
  if (!meta.width || meta.width <= 900) continue;
  // Very large originals: cap at 1600px wide and recompress (only once: later runs see 1600px).
  if (input.length > 250_000 && meta.width > 1600 && /\.webp$/i.test(file)) {
    const smaller = await sharp(input).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 74 }).toBuffer();
    if (smaller.length < input.length) {
      writeFileSync(file, smaller);
      input = smaller;
    }
  }
  const out = file.replace(/\.(webp|jpe?g|png)$/i, '-800w.webp');
  writeFileSync(out, await sharp(input).resize({ width: 800 }).webp({ quality: 70 }).toBuffer());
  variants.push(toUrl(file));
}
variants.sort();
writeFileSync(path.join(ROOT, 'src/data/imageVariants.json'), JSON.stringify(variants, null, 2) + '\n');
console.log(`images: ${variants.length} phone-sized copies`);

// Header icon (shown about 40px high) and favicons, from the full-size teal icon.
const icon = path.join(IMAGES, 'logos/crca-icon-teal.jpg');
if (existsSync(icon)) {
  await sharp(readFileSync(icon)).resize({ height: 96 }).webp({ quality: 85 }).toFile(path.join(IMAGES, 'logos/crca-icon-teal-96.webp'));
  await sharp(readFileSync(icon)).resize(64, 64, { fit: 'contain', background: '#ffffff' }).png().toFile(path.join(IMAGES, 'logos/favicon-64.png'));
  await sharp(readFileSync(icon)).resize(180, 180, { fit: 'contain', background: '#ffffff' }).png().toFile(path.join(IMAGES, 'logos/apple-touch-icon.png'));
}

// Default link-preview image (1200 x 630): the stacked logo on white.
const stacked = path.join(IMAGES, 'logos/crca-logo-stacked.jpg');
if (existsSync(stacked)) {
  mkdirSync(path.join(IMAGES, 'og'), { recursive: true });
  const logo = await sharp(readFileSync(stacked)).resize({ height: 440, width: 1000, fit: 'inside' }).toBuffer();
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
    .composite([{ input: logo, gravity: 'center' }])
    .jpeg({ quality: 85 })
    .toFile(path.join(IMAGES, 'og/crca-default.jpg'));
}
