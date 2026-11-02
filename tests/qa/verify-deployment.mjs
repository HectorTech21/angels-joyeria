// Publishable files only, served from a subdirectory without npm/build/fallbacks.
import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

await mkdir('artifacts/static-migration', { recursive: true });
const directory = await mkdtemp(resolve('artifacts/static-migration/deployment-'));
const site = resolve(directory, 'angels-joyeria');
await mkdir(site);
const entries = ['index.html', 'css', 'js', 'assets', 'fonts', 'vendor', 'favicon.svg', 'vercel.json'];
for (const entry of entries) await cp(resolve(entry), resolve(site, entry), { recursive: true });
for (const absent of ['node_modules', 'package.json', 'dist', 'public']) await assert.rejects(stat(resolve(site, absent)), { code: 'ENOENT' });
const server = spawn(process.execPath, ['tests/serve.mjs'], { env: { ...process.env, PORT: '5505', TEST_ROOT: directory }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
try {
  await new Promise((accept, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('Static server did not start')), 10000);
    server.once('error', reject);
    server.once('exit', code => { clearTimeout(timeout); reject(new Error(`Static server exited: ${code}`)); });
    server.stdout.on('data', chunk => { output += chunk; if (output.includes('Static QA:')) { clearTimeout(timeout); accept(); } });
  });
  const verification = spawn(process.execPath, ['tests/qa/verify-hosting.mjs'], {
    env: { ...process.env, TEST_URL: 'http://127.0.0.1:5505/angels-joyeria', HOSTING_LABEL: 'isolated-subdirectory' },
    stdio: 'inherit', windowsHide: true,
  });
  const [code] = await once(verification, 'exit');
  assert.equal(code, 0, 'Isolated deployment failed');
  await writeFile('artifacts/static-migration/deployment-report.json', JSON.stringify({ directory, entries, npm: false, build: false, subdirectory: true, passed: true }, null, 2));
} finally {
  server.kill();
}
