import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { products, imageUrl } from '../src/data/products.js';
import { homePage } from '../src/pages/home.js';
import { catalogPage } from '../src/pages/catalog.js';
import { productPage } from '../src/pages/product.js';
import { infoPage } from '../src/pages/info.js';

// Check rendered URLs as well as source filenames: a real file does not make
// an incorrect header URL valid. Exact spelling also catches Linux-only failures.
export async function checkAssets() {
  const project = fileURLToPath(new URL('../', import.meta.url));
  const names = await readdir(resolve(project, 'public/assets'));
  const references = new Map();
  const pages = [
    ['index.html', await readFile(resolve(project, 'index.html'), 'utf8')],
    ['src/pages/home.js', homePage()],
    ['src/pages/catalog.js', catalogPage(new URLSearchParams())],
    ['src/pages/info.js', infoPage('marca')],
    ...products.map((product) => [`src/pages/product.js (${product.id})`, productPage(product)]),
  ];
  for (const [source, html] of pages) {
    for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)) {
      const url = match[1];
      if (!url.startsWith('/assets/') || !names.includes(url.slice('/assets/'.length))) {
        throw new Error(`Imagen inexistente o ruta incorrecta en ${source}: ${url}`);
      }
      references.set(url, [...(references.get(url) || []), source]);
    }
  }
  for (const product of products) {
    for (const file of [product.image, ...(product.gallery || [])]) {
      if (!references.has(imageUrl(file))) throw new Error(`Imagen no verificada: ${product.id} / ${file}`);
    }
  }
  console.log(`Recursos: ${references.size} imágenes originales con rutas y nombres exactos verificados.`);
  return [...references.keys()];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await checkAssets();
