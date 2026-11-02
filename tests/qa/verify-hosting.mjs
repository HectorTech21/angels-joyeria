// The same smoke test runs against Live Server and an isolated static copy.
import assert from 'node:assert/strict';
import { chromium, devices } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { products } from '../../js/data/products.js';

const base = (process.env.TEST_URL || 'http://127.0.0.1:5503').replace(/\/$/, '');
const label = process.env.HOSTING_LABEL || 'live-server';
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const report = { base, label, views: [], resources: [], errors: [] };
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext(mobile ? devices['iPhone 13'] : { viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', message => { if (['error', 'warning'].includes(message.type())) report.errors.push(message.text()); });
    page.on('requestfailed', request => report.errors.push(`${request.failure()?.errorText}: ${request.url()}`));
    page.on('response', response => {
      if (response.status() >= 400) report.errors.push(`${response.status()}: ${response.url()}`);
      if (['stylesheet', 'script', 'font', 'image'].includes(response.request().resourceType())) report.resources.push({ url: response.url(), status: response.status(), type: response.headers()['content-type'] });
    });
    const routes = ['/', '/catalogo', ...['anillos', 'pulseras', 'collares'].map(c => `/catalogo?categoria=${c}`), ...products.map(p => `/producto/${p.id}`), '/informacion/marca', '/informacion/seleccion', '/informacion/privacidad'];
    for (const route of routes) {
      await page.goto(`${base}/index.html#${route}`);
      await page.locator('main h1').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].every(image => image.complete && image.naturalWidth > 0));
      assert.equal(await page.evaluate(() => gsap.version), '3.15.0');
      assert.equal(await page.evaluate(() => ScrollTrigger.version), '3.15.0');
      assert.ok(await page.evaluate(() => document.fonts.check('400 16px Manrope') && document.fonts.check('400 16px "Cormorant Garamond"')));
      const title = await page.locator('main h1').innerText();
      await page.reload();
      await page.locator('main h1').waitFor();
      assert.equal(await page.locator('main h1').innerText(), title);
      report.views.push({ mobile, route, title, reloaded: true });
    }
    await page.goto(`${base}/index.html#/`);
    await page.locator('.hero').waitFor();
    await page.waitForTimeout(2200);
    if (mobile) {
      await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
      await page.locator('.mobile-nav a[href="#/catalogo?categoria=anillos"]').click();
      await page.locator('.catalog-grid').waitFor();
      assert.equal(await page.locator('.catalog-grid [data-product-card]').count(), 1);
      assert.equal(await page.locator('dialog[open]').count(), 0);
    } else {
      await page.locator('.desktop-nav [data-nav="collares"]').click();
      await page.locator('.catalog-grid').waitFor();
      assert.equal(await page.locator('.catalog-grid [data-product-card]').count(), 5);
    }
    await page.getByRole('button', { name: 'Buscar joyas', exact: true }).click();
    await page.locator('#search-input').fill('corazon');
    assert.equal(await page.locator('.search-result').count(), 2);
    await page.locator('.search-result').first().click();
    await page.locator('.product-details h1').waitFor();
    await context.close();
  }
  assert.deepEqual(report.errors, []);
  console.log(`PASS ${label}: ${report.views.length} vistas con recarga, fuentes, imágenes, GSAP, navegación y búsqueda; cero errores.`);
} finally {
  await browser.close();
  await mkdir('artifacts/static-migration', { recursive: true });
  await writeFile(`artifacts/static-migration/${label}.json`, JSON.stringify(report, null, 2));
}
