import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const root = 'public/warcraft';
await mkdir(`${root}/battle-scenes`, { recursive: true });
const report = [];
for (const [name, file, widths] of [
  ['ulduar', 'ulduar-original.jpg', [960, 1920, 3840, 7680]],
  ['factions', 'faction-war-original.jpg', [960, 1920, 3840]],
]) {
  const input = `${root}/high-resolution/${file}`;
  const meta = await sharp(input).metadata();
  for (const width of widths) {
    const output = `${root}/battle-scenes/${name}-${width}.webp`;
    const result = await sharp(input).resize({ width, withoutEnlargement: true }).webp({ quality: 90, effort: 5 }).toFile(output);
    report.push({ name, source: file, sourceWidth: meta.width, sourceHeight: meta.height, ...result, output });
  }
}
await writeFile('design/battle-art-resolutions.json', JSON.stringify(report, null, 2));
console.log(report.map(({ output, width, height, size }) => ({ output, width, height, size })));
