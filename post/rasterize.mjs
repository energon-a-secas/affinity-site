// ── SVG → PNG ────────────────────────────────────────────────
// Medium accepts raster only. Renders each diagram at 2x on the
// site's background colour, since Medium composites on white and a
// transparent PNG would show light bars around a dark diagram.
// Run: node post/rasterize.mjs

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire('/Users/lucianoadonisvillarroel/Documents/Projects/Personal/');
const sharp = require('sharp');

const OUT = dirname(fileURLToPath(import.meta.url));
const PNG_DIR = join(OUT, 'png');
mkdirSync(PNG_DIR, { recursive: true });

const SCALE = 2;
const BG = { r: 4, g: 7, b: 20, alpha: 1 };

const files = readdirSync(OUT).filter((f) => f.endsWith('.svg')).sort();

for (const name of files) {
  const svg = readFileSync(join(OUT, name));
  const [, w, h] = svg.toString().match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const target = join(PNG_DIR, name.replace(/\.svg$/, '.png'));
  // "-bare" diagrams are for compositing into another image, so they
  // keep their alpha channel instead of being flattened onto the site
  // background.
  const keepAlpha = name.includes('-bare');

  let img = sharp(svg, { density: 72 * SCALE }).resize(w * SCALE, h * SCALE, { fit: 'fill' });
  if (!keepAlpha) img = img.flatten({ background: BG });

  await img.png({ compressionLevel: 9 }).toFile(target);

  console.log(`${name} → png/${name.replace(/\.svg$/, '.png')}  ${w * SCALE}×${h * SCALE}${keepAlpha ? '  (transparent)' : ''}`);
}
