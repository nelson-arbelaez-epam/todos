import { mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const sourceSvgPath = require.resolve('@todos/branding/favicon.svg');
const assetsDir = resolve(__dirname, '../assets');

const targets = [
  { name: 'icon.png', size: 1024 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'splash-icon.png', size: 1024 },
  { name: 'favicon.png', size: 48 },
];

async function generate() {
  await mkdir(assetsDir, { recursive: true });

  await Promise.all(
    targets.map(async ({ name, size }) => {
      const outputPath = resolve(assetsDir, name);
      await sharp(sourceSvgPath)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(outputPath);
    }),
  );

  console.log('Generated mobile icons from branding package SVG.');
}

generate().catch((error) => {
  console.error('Failed to generate mobile icons:', error);
  process.exitCode = 1;
});
