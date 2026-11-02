import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
import { mkdir, readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { products, categories } from '../../js/data/products.js';
import { checkAssets } from './check-assets.mjs';

const base = (process.env.TEST_URL || 'http://127.0.0.1:5502').replace(/\/$/, '');
const mode = 'static';
const output = resolve('artifacts/static-migration/images');
await mkdir(output, { recursive: true });
const urls = await checkAssets();
const report = { date: new Date().toISOString(), base, mode, originals: [], views: [], network: [], errors: [], inventory: [] };
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });

async function inventory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (['.git', '.backups', '.cache', 'node_modules', 'artifacts'].includes(entry.name)) continue;
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) await inventory(absolute);
    else if (/\.(jpe?g|png|webp|avif|gif|svg|ico|bmp|tiff?|heic)$/i.test(entry.name)) {
      report.inventory.push({ absolute, relative: relative(process.cwd(), absolute).replaceAll('\\', '/'),
        name: entry.name, extension: extname(entry.name), bytes: (await stat(absolute)).size });
    }
  }
}

async function navigate(page, path, cold = false) {
  if (cold) await page.goto(`${base}/#${path}`);
  else {
    await page.evaluate((route) => { location.hash = route; }, path);
    await page.waitForFunction((route) => location.hash === `#${route}`, path);
  }
  await page.locator('main h1').waitFor();
  await page.evaluate(() => document.fonts.ready);
  // The real application must load images; the test never changes loading/src.
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
}

async function auditView(page, viewport, label) {
  for (const image of await page.locator('img').all()) {
    // Closed dialogs are checked when opened, rather than forced visible by QA.
    if (await image.evaluate((element) => Boolean(element.closest('dialog:not([open])')))) continue;
    // The existing mobile design shows two related cards and hides the third.
    // Its file must still decode; preserve that deliberate responsive layout.
    if (viewport === 'mobile' && await image.evaluate((element) => Boolean(element.closest('.related .catalog-grid .product-card:last-child')))) {
      assert.equal(await image.isVisible(), false);
      continue;
    }
    await image.scrollIntoViewIfNeeded();
    await page.waitForFunction((element) => {
      const box = element.getBoundingClientRect();
      if (box.width < 1 || box.height < 1) return false;
      for (let ancestor = element; ancestor; ancestor = ancestor.parentElement) {
        const style = getComputedStyle(ancestor);
        if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) < .98) return false;
        if (/^inset\(0(?:px|%) 0(?:px|%) 100% 0(?:px|%)\)$/.test(style.clipPath)) return false;
      }
      return element.complete && element.naturalWidth > 0;
    }, await image.elementHandle());
  }
  const images = await page.evaluate(() => [...document.images].map((image) => {
    const box = image.getBoundingClientRect(), style = getComputedStyle(image);
    return { src: image.currentSrc || image.src, loaded: image.complete && image.naturalWidth > 0,
      naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
      width: box.width, height: box.height, objectFit: style.objectFit,
      closedDialog: Boolean(image.closest('dialog:not([open])')),
      responsiveHidden: Boolean(image.closest('.related .catalog-grid .product-card:last-child')) && box.width === 0 };
  }));
  assert.ok(images.every((image) => image.loaded), `${viewport} ${label}: imagen rota`);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${viewport} ${label}: desbordamiento`);
  report.views.push({ viewport, label, url: page.url(), images });
  console.log(`PASS ${mode} ${viewport} ${label}: ${images.length} imágenes cargadas`);
}

async function capture(page, viewport, label, fullPage = true) {
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${output}/${mode}-${viewport}-${label}.png`, fullPage });
}

try {
  await inventory(process.cwd());
  for (const viewport of ['desktop', 'mobile']) {
    const context = await browser.newContext(viewport === 'mobile'
      ? { ...devices['iPhone 13'], defaultBrowserType: 'chromium' }
      : { viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    page.on('pageerror', (error) => report.errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error') report.errors.push(message.text()); });
    page.on('requestfailed', (request) => report.errors.push(`${request.failure()?.errorText}: ${request.url()}`));
    page.on('response', (response) => {
      const type = response.headers()['content-type'] || '';
      if (response.request().resourceType() === 'image' || response.status() >= 400) {
        report.network.push({ viewport, url: response.url(), status: response.status(), type });
        if (response.status() >= 400 || !type.startsWith('image/')) report.errors.push(`HTTP/imagen inválida: ${response.status()} ${type} ${response.url()}`);
      }
    });
    await navigate(page, '/', true);
    // Explicit HTTP MIME + binary signature + browser decode for all originals,
    // including gallery-only images not requested by the homepage.
    for (const url of urls) {
      const response = await context.request.get(new URL(url, `${base}/`).href);
      const bytes = await response.body();
      const type = response.headers()['content-type'];
      assert.equal(response.status(), 200, url);
      assert.match(type, /^image\//, url);
      const png = bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
      const jpeg = bytes.subarray(0, 3).toString('hex') === 'ffd8ff';
      assert.ok(png || jpeg, `Firma incorrecta: ${url}`);
      assert.equal(type, png ? 'image/png' : 'image/jpeg');
      const dimensions = await page.evaluate(async (src) => {
        const image = new Image(); image.src = src; await image.decode();
        return { width: image.naturalWidth, height: image.naturalHeight };
      }, url);
      const source = await readFile(resolve(url));
      assert.ok(bytes.equals(source), `HTTP no devuelve el original: ${url}`);
      report.originals.push({ viewport, url, absolute: resolve(url), relative: url,
        bytes: bytes.length, type, signature: png ? 'PNG' : 'JPEG', status: response.status(), ...dimensions,
        sha256: createHash('sha256').update(source).digest('hex') });
    }
    await auditView(page, viewport, 'homepage');
    await capture(page, viewport, 'home');
    await capture(page, viewport, 'hero', false);
    for (const [index, carousel] of (await page.locator('[data-carousel]').all()).entries()) {
      const slider = carousel.locator('.carousel-viewport');
      await slider.scrollIntoViewIfNeeded();
      await slider.evaluate((element) => element.scrollTo({ left: 0, behavior: 'instant' }));
      await carousel.locator('[data-next]').click();
      await page.waitForFunction((element) => element.scrollLeft > 30, await slider.elementHandle());
      for (const image of await carousel.locator('img').all()) {
        await image.scrollIntoViewIfNeeded();
        assert.ok(await image.evaluate((element) => element.complete && element.naturalWidth > 0));
      }
      await auditView(page, viewport, `carousel-${index + 1}`);
    }
    if (viewport === 'mobile') {
      await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
      await page.locator('#menu-dialog .brand-logo img').waitFor({ state: 'visible' });
      await auditView(page, viewport, 'menu');
      await capture(page, viewport, 'menu', false);
      await page.keyboard.press('Escape');
    }
    await navigate(page, '/catalogo');
    await auditView(page, viewport, 'catalogo');
    await capture(page, viewport, 'catalogo');
    for (const category of categories.filter((category) => category.id !== 'todos')) {
      await page.locator(`[data-filter="${category.id}"]`).click();
      await page.waitForFunction((id) => document.querySelector(`[data-filter="${id}"]`)?.getAttribute('aria-pressed') === 'true', category.id);
      await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
      await auditView(page, viewport, `categoria-${category.id}`);
      assert.equal(await page.locator('[data-product-card]').count(), products.filter((product) => product.category === category.id).length);
    }
    for (const product of products) {
      await navigate(page, `/producto/${product.id}`);
      await page.locator(`.product-page[data-product="${product.id}"]`).waitFor();
      await auditView(page, viewport, `producto-${product.id}`);
      for (const thumbnail of await page.locator('[data-gallery]').all()) {
        const expected = await thumbnail.getAttribute('data-gallery');
        await thumbnail.click();
        await page.waitForFunction((src) => {
          const image = document.querySelector('#product-main-image');
          return image.getAttribute('src') === src && image.complete && image.naturalWidth > 0;
        }, expected);
        await auditView(page, viewport, `galeria-${product.id}-${await thumbnail.getAttribute('data-gallery-index')}`);
      }
      if (product.id === 'eslabon') await capture(page, viewport, 'producto');
    }
    for (const slug of ['marca', 'seleccion', 'privacidad']) {
      await navigate(page, `/informacion/${slug}`);
      await auditView(page, viewport, `informacion-${slug}`);
    }
    await page.getByRole('button', { name: 'Buscar joyas', exact: true }).click();
    await page.locator('#search-input').fill('corazon');
    await page.waitForFunction(() => document.querySelectorAll('.search-result').length === 2);
    await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
    await auditView(page, viewport, 'buscador');
    await capture(page, viewport, 'buscador', false);
    await page.keyboard.press('Escape');
    await navigate(page, '/catalogo');
    await navigate(page, '/');
    await page.reload();
    await page.locator('.hero').waitFor();
    await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
    await auditView(page, viewport, 'homepage-recarga');
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  report.summary = { uniqueOriginals: new Set(report.originals.map((image) => image.url)).size,
    views: report.views.length, imageChecks: report.views.reduce((sum, view) => sum + view.images.length, 0),
    brokenImages: report.views.flatMap((view) => view.images).filter((image) => !image.loaded).length,
    networkErrors: report.errors.length };
  console.log(JSON.stringify(report.summary, null, 2));
} finally {
  await writeFile(`${output}/${mode}-report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
