import { cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkAssets } from './check-assets.mjs';

await checkAssets();

// Browser-native ES modules: one reproducible build, with no optional bundler.
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(projectRoot, 'dist');
if (process.cwd() !== projectRoot || output !== resolve(process.cwd(), 'dist')) throw new Error('Unexpected build directory');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(resolve(projectRoot, 'public'), output, { recursive: true });
await cp(resolve(projectRoot, 'src'), resolve(output, 'src'), { recursive: true });
await writeFile(resolve(output, 'index.html'), await readFile(resolve(projectRoot, 'index.html')));
const { checkDist } = await import('./check-dist.mjs');
await checkDist();
console.log('Distribución estática de módulos ES generada y verificada en dist/. Sin dependencias de compilación.');
