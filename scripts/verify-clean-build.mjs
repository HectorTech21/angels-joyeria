import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const project = fileURLToPath(new URL('../', import.meta.url));
await mkdir(resolve(project, 'artifacts'), { recursive: true });
const clean = await mkdtemp(resolve(project, 'artifacts/clean-build-'));
// An explicit source list prevents local caches, dist and node_modules leaking in.
for (const path of ['package.json', 'package-lock.json', 'index.html', 'src', 'public', 'scripts', 'tests']) {
  await cp(resolve(project, path), resolve(clean, path), { recursive: true });
}
async function npm(args) {
  await new Promise((accept, reject) => {
    const child = spawn(process.execPath, [process.env.npm_execpath, ...args], { cwd: clean, stdio: 'inherit' });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? accept() : reject(new Error(`npm ${args.join(' ')}: ${code}`)));
  });
}
await npm(['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund', '--cache', resolve(project, '.cache/npm')]);
await npm(['test']);
await npm(['run', 'build']);
async function compare(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = resolve(directory, entry.name);
    if (entry.isDirectory()) await compare(file);
    else {
      const path = relative(resolve(clean, 'dist'), file);
      assert.ok((await readFile(file)).equals(await readFile(resolve(project, 'dist', path))), `Build no reproducible: ${path}`);
    }
  }
}
await compare(resolve(clean, 'dist'));
await writeFile(resolve(project, 'artifacts/clean-build-report.json'), JSON.stringify({ date: new Date().toISOString(), clean, install: 'npm ci --omit=dev', node: process.version, identicalToLocalDist: true }, null, 2));
console.log('Instalación limpia sin dependencias de desarrollo: tests y build correctos; dist idéntico byte a byte.');
