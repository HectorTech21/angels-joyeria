import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve('artifacts/static-migration');
const beforeLabel = process.env.BEFORE_LABEL || 'before-stable';
const afterLabel = process.env.AFTER_LABEL || 'after-stable';
const before = JSON.parse(await readFile(resolve(root, beforeLabel, 'report.json'), 'utf8'));
const after = JSON.parse(await readFile(resolve(root, afterLabel, 'report.json'), 'utf8'));
assert.deepEqual(after.motion, before.motion, 'GSAP/ScrollTrigger settings and final hero state changed');
assert.deepEqual(after.captures, before.captures);
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const results = [];
try {
  const page = await browser.newPage();
  for (const name of (await readdir(resolve(root, beforeLabel))).filter(n => n.endsWith('.png'))) {
    const original = await readFile(resolve(root, beforeLabel, name));
    const current = await readFile(resolve(root, afterLabel, name));
    const difference = original.equals(current) ? { differentPixels: 0, identicalBytes: true } : await page.evaluate(async ({ a, b }) => {
      const decode = async src => {
        const image = new Image(); image.src = `data:image/png;base64,${src}`; await image.decode();
        const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
        return { width: canvas.width, height: canvas.height, data: ctx.getImageData(0, 0, canvas.width, canvas.height).data };
      };
      const first = await decode(a), second = await decode(b);
      if (first.width !== second.width || first.height !== second.height) return { dimensionsChanged: true };
      let differentPixels = 0, significantPixels = 0, largestChannelDifference = 0;
      for (let i = 0; i < first.data.length; i += 4) {
        const delta = Math.max(...[0, 1, 2, 3].map(c => Math.abs(first.data[i + c] - second.data[i + c])));
        if (delta) differentPixels++;
        if (delta > 1) significantPixels++;
        largestChannelDifference = Math.max(delta, largestChannelDifference);
      }
      return { width: first.width, height: first.height, differentPixels, significantPixels, largestChannelDifference, fraction: differentPixels / (first.width * first.height) };
    }, { a: original.toString('base64'), b: current.toString('base64') });
    results.push({ name, ...difference });
    console.log(`${name}: ${JSON.stringify(difference)}`);
  }
} finally {
  await browser.close();
  await writeFile(resolve(root, 'visual-comparison.json'), JSON.stringify({ beforeLabel, afterLabel, motionIdentical: true, captures: results }, null, 2));
}
assert.ok(results.every(r => !r.dimensionsChanged && (r.significantPixels || 0) === 0), 'Visual differences require review');
console.log(`PASS ${results.length} capturas sin diferencias superiores a 1/255 por canal; configuración de movimiento idéntica.`);
