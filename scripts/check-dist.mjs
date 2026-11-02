import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, relative, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('../', import.meta.url));
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const lists = await Promise.all(entries.map((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  }));
  return lists.flat();
}

export async function checkDist() {
  const output = resolve(project, 'dist');
  const originals = await files(resolve(project, 'public'));
  for (const source of originals) {
    const path = relative(resolve(project, 'public'), source);
    assert.ok((await readFile(source)).equals(await readFile(resolve(output, path))), `Recurso modificado o ausente: ${path}`);
  }
  // Audit the delivered entry point and every JS/CSS dependency, including imports.
  for (const source of await files(output)) {
    if (!['.html', '.css', '.js'].includes(extname(source))) continue;
    const body = await readFile(source, 'utf8');
    const references = extname(source) === '.html'
      ? [...body.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)].map((match) => match[1])
      : extname(source) === '.css'
        ? [...body.matchAll(/(?:url\(\s*['"]?|@import\s+['"])([^'"\s)]+)/g)].map((match) => match[1])
        : [...body.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"]([./][^'"]+)['"]/g)].map((match) => match[1]);
    for (const reference of references) {
      const target = reference.startsWith('/') ? resolve(output, `.${reference}`) : resolve(dirname(source), reference);
      assert.ok((await stat(target)).isFile(), `Referencia no distribuida: ${relative(output, source)} → ${reference}`);
    }
  }
  console.log(`Dist: ${originals.length} recursos de public idénticos al original; entradas, módulos y CSS verificados.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await checkDist();
