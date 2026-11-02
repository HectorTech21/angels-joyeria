import assert from 'node:assert/strict';
import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, dirname, extname } from 'node:path';
import { createHash } from 'node:crypto';

const root = process.cwd();
const report = { references: 0, unchangedAssets: 0, preservedSourceFiles: 0, backupFilesVerified: 0 };
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    result.push(...entry.isDirectory() ? await files(path) : [path]);
  }
  return result;
}
const code = [resolve('index.html'), ...await files('js'), ...await files('css')];
for (const file of code) {
  const text = await readFile(file, 'utf8');
  assert.doesNotMatch(text, /import\.meta\.(?:env|glob)|@vite\/client|[A-Z]:\\/);
  const references = extname(file) === '.html'
    ? [...text.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1])
    : extname(file) === '.css'
      ? [...text.matchAll(/(?:url\(\s*['"]?|@import\s+['"])([^'"\s)]+)/g)].map(m => m[1])
      : [...text.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"]([^'"]+)['"]/g)].map(m => m[1]);
  for (const ref of references) {
    assert.ok(ref.startsWith('./') || ref.startsWith('../'), `Nonrelative reference: ${file} → ${ref}`);
    assert.ok((await stat(resolve(dirname(file), ref))).isFile(), `Missing reference: ${file} → ${ref}`);
    report.references++;
  }
}
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
assert.equal(config.framework, null);
assert.equal(config.buildCommand, '');
assert.equal(config.installCommand, '');
assert.equal(config.outputDirectory, '.');
for (const obsolete of ['public', 'src', 'dist', 'scripts', 'node_modules', 'package.json', 'package-lock.json', 'vite.config.js']) {
  await assert.rejects(stat(obsolete), { code: 'ENOENT' }, `Obsolete active path: ${obsolete}`);
}
const backup = process.env.MIGRATION_BACKUP;
if (backup) {
  const original = resolve(backup, 'original');
  const manifest = JSON.parse(await readFile(resolve(backup, 'manifest.json'), 'utf8'));
  for (const file of manifest.files) {
    const bytes = await readFile(resolve(original, file.path));
    assert.equal(bytes.length, file.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, `Backup modified: ${file.path}`);
    report.backupFilesVerified++;
  }
  // Also prove that the restored original dist used for reference captures equals
  // the pre-migration source, rather than assuming an old build was up to date.
  for (const file of await files(resolve(original, 'public'))) {
    const rel = relative(resolve(original, 'public'), file);
    assert.ok((await readFile(file)).equals(await readFile(resolve(original, 'dist', rel))));
    assert.ok((await readFile(file)).equals(await readFile(resolve(root, rel))), `Asset changed: ${rel}`);
    report.unchangedAssets++;
  }
  const normalize = s => s.replaceAll('\r\n', '\n');
  for (const file of await files(resolve(original, 'src'))) {
    const rel = relative(resolve(original, 'src'), file).replaceAll('\\', '/');
    const old = await readFile(file, 'utf8');
    assert.equal(normalize(await readFile(resolve(original, 'dist/src', rel), 'utf8')), normalize(old));
    const target = rel === 'styles.css' || rel.startsWith('styles/') ? resolve('css', rel) : resolve('js', rel);
    let expected = old;
    if (rel === 'styles/base.css') expected = expected.replaceAll("url('/fonts/", "url('../../fonts/");
    if (rel === 'pages/info.js') expected = expected.replaceAll('src="/assets/', 'src="./assets/');
    if (rel === 'data/products.js') expected = expected.replace('export const imageUrl = (file) => `/assets/${file}`;', '// Image URLs resolve from index.html; hash navigation never changes its directory.\nexport const imageUrl = (file) => `./assets/${file}`;');
    if (rel === 'lib/router.js') expected = expected.replace('// Hash navigation for the local prototype, independent of Vite.', '// Browser-native hash navigation: direct links and reloads need no server rewrites.');
    assert.equal(normalize(await readFile(target, 'utf8')), normalize(expected), `Unexpected visual/behavior change: ${rel}`);
    report.preservedSourceFiles++;
  }
  const oldHtml = await readFile(resolve(original, 'index.html'), 'utf8');
  assert.ok((await readFile(resolve(original, 'index.html'))).equals(await readFile(resolve(original, 'dist/index.html'))));
  const expectedHtml = oldHtml.replaceAll('"/assets/', '"./assets/').replaceAll('"/fonts/', '"./fonts/').replaceAll('"/vendor/', '"./vendor/').replace('"/src/styles.css"', '"./css/styles.css"').replace('"/src/bootstrap.js"', '"./js/bootstrap.js"');
  assert.equal(normalize(await readFile('index.html', 'utf8')), normalize(expectedHtml));
}
await mkdir('artifacts/static-migration', { recursive: true });
await writeFile('artifacts/static-migration/architecture-report.json', JSON.stringify(report, null, 2));
console.log(`PASS static architecture: ${JSON.stringify(report)}`);
