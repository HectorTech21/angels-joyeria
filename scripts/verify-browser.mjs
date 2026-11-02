import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { products } from '../src/data/products.js';
const base = process.env.TEST_URL || 'http://127.0.0.1:5173';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const errors = [], failedRequests = [], checks = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
context.on('page', (page) => {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' || message.type() === 'warning') errors.push(`${message.type()}: ${message.text()}`); });
  page.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()}: ${response.url()}`); });
  page.on('requestfailed', (request) => failedRequests.push(`${request.failure()?.errorText}: ${request.url()}`));
});
const page = await context.newPage();
page.setDefaultTimeout(8000);
const check = (name) => { checks.push(name); console.log(`PASS ${name}`); };
async function go(path = '/', target = page) {
  await target.goto(`${base}/#${path}`);
  await target.locator('main h1').waitFor();
  await target.evaluate(() => document.fonts.ready);
  assert.doesNotMatch(await target.locator('body').innerText(), /€|\bMVP\b|demo(?:straci[oó]n)?|prototipo|provisional|pr[oó]ximamente/i);
  assert.equal(await target.locator('[data-add], [data-open="cart"], #product-purchase, #cart-dialog').count(), 0);
  const description = await target.locator('meta[name="description"]').getAttribute('content');
  assert.doesNotMatch(description, /demo|prototipo|MVP/i);
}
async function settle(target = page) { await target.waitForTimeout(650); }
async function scrollThrough(target = page) {
  const height = await target.evaluate(() => document.body.scrollHeight);
  const viewport = target.viewportSize().height;
  for (let y = 0; y < height; y += viewport * .75) { await target.evaluate((top) => window.scrollTo(0, top), y); await target.waitForTimeout(85); }
  await target.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 8000 });
  await target.evaluate(() => window.scrollTo(0, 0)); await target.waitForTimeout(1300);
}
async function assertNoOverflow(target = page) {
  const sizes = await target.evaluate(() => ({ viewport: innerWidth, page: document.documentElement.scrollWidth }));
  assert.ok(sizes.page <= sizes.viewport + 1, `Overflow: ${JSON.stringify(sizes)}`);
}
try {
  for (const hash of ['#contenido', '#seleccion', '#ancla-inexistente']) {
    const coldPage = await context.newPage();
    await coldPage.goto(`${base}/${hash}`);
    await coldPage.locator('main h1').waitFor();
    assert.match(await coldPage.locator('main h1').innerText(), /Tu brillo/);
    await coldPage.close();
  }
  check('Cold anchor URLs mount the actual JavaScript homepage');
  await page.goto(`${base}/#contenido`);
  await page.locator('.hero').waitFor();
  await page.locator('.hero .button').click();
  await page.locator('.catalog-grid').waitFor();
  await page.goBack();
  await page.locator('.hero').waitFor();
  check('Browser Back restores home when the original URL was an anchor');
  await go('/');
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0), null, { timeout: 8000 });
  check('All homepage photographs load on cold entry without changing loading attributes');
  for (const selector of ['header .brand-logo img', 'footer .brand-logo img', '#menu-dialog .brand-logo img']) {
    assert.equal(await page.locator(selector).getAttribute('src'), '/assets/logo.jpeg');
    assert.ok(await page.locator(selector).evaluate((image) => image.complete && image.naturalWidth > 0));
  }
  check('Original company logo is loaded in header, footer and mobile menu');
  await page.waitForTimeout(2100); await scrollThrough();
  assert.equal(await page.locator('main h1').innerText(), 'Tu brillo.\nTus reglas.');
  await assertNoOverflow();
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
  await page.screenshot({ path: 'artifacts/home-desktop-hero.png' });
  check('Desktop homepage, fonts, images and scroll reveals');
  assert.equal(await page.locator('[data-carousel]').count(), 2);
  for (const carousel of await page.locator('[data-carousel]').all()) {
    const slider = carousel.locator('.carousel-viewport');
    await slider.scrollIntoViewIfNeeded();
    await carousel.locator('[data-next]').click(); await settle();
    assert.ok(await slider.evaluate((el) => el.scrollLeft) > 50);
    await slider.focus(); await page.keyboard.press('ArrowRight'); await settle();
    await carousel.locator('[data-prev]').click(); await settle();
  }
  check('Both product carousels respond to arrows and keyboard');
  assert.equal(await page.locator('[data-open="cart"], [data-add], #product-purchase, #cart-dialog').count(), 0);
  assert.doesNotMatch(await page.locator('body').innerText(), /€|\bMVP\b|demo(?:straci[oó]n)?|prototipo|provisional|pr[oó]ximamente/i);
  check('Public homepage has no unverified prices, checkout controls or prototype labels');
  await go('/catalogo'); await settle();
  assert.equal(await page.locator('.catalog-grid [data-product-card]').count(), 7);
  assert.equal(await page.getByRole('button', { name: 'Pendientes', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Collares', exact: true }).click(); await settle();
  assert.equal(await page.locator('.catalog-grid [data-product-card]').count(), 5);
  await page.selectOption('#catalog-sort', 'nombre-asc'); await settle();
  assert.match(await page.locator('.catalog-grid .product-card').first().innerText(), /Cadenas de tono dorado/);
  await go('/catalogo'); await scrollThrough();
  await page.screenshot({ path: 'artifacts/catalog-desktop.png', fullPage: true });
  check('Catalog, populated category filters and alphabetical sorting');
  // Visit every product, including both gallery images, and verify actual decoding.
  for (const product of products) {
    await go(`/producto/${product.id}`);
    await page.waitForFunction(() => {
      const image = document.querySelector('#product-main-image');
      return image.complete && image.naturalWidth > 0;
    });
    for (const thumbnail of await page.locator('[data-gallery]').all()) {
      await thumbnail.click();
      await page.waitForFunction(() => {
        const image = document.querySelector('#product-main-image');
        return image.complete && image.naturalWidth > 0;
      });
    }
  }
  check('All seven product routes and all nine original jewelry photographs decode');
  await page.getByRole('button', { name: 'Buscar joyas', exact: true }).click(); await settle();
  await page.locator('#search-input').fill('corazon');
  assert.equal(await page.locator('.search-result').count(), 2);
  await page.locator('#search-input').press('Enter'); await settle();
  assert.equal(await page.locator('.catalog-grid [data-product-card]').count(), 2);
  await go('/catalogo?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E'); await settle();
  assert.equal(await page.locator('main script').count(), 0);
  check('Accent-insensitive search and safe query rendering');
  await go('/producto/eslabon'); await settle();
  await page.locator('[data-gallery-index="1"]').click();
  assert.match(await page.locator('#product-main-image').getAttribute('src'), /cadena-oro2/);
  await scrollThrough();
  await page.screenshot({ path: 'artifacts/product-desktop.png', fullPage: true });
  await page.locator('[data-gallery-index="0"]').click();
  assert.match(await page.locator('#product-main-image').getAttribute('alt'), /Collar y pulsera/);
  await page.getByText('Disponibilidad y compra', { exact: true }).click();
  assert.ok(await page.getByText(/La compra online no está habilitada/).isVisible());
  assert.equal(await page.locator('[data-add], #product-purchase, #product-quantity').count(), 0);
  await page.locator('.product-explore .button').click();
  await page.waitForURL('**/#/catalogo?categoria=pulseras');
  check('Product gallery restores its main photograph and exploration links work without simulated purchases');
  for (const route of ['/informacion/marca', '/informacion/compra', '/informacion/privacidad', '/informacion/seleccion', '/informacion/demo', '/producto/inexistente', '/inexistente']) { await go(route); await assertNoOverflow(); }
  check('Information pages and unknown-route recovery');
  for (const width of [320, 360, 390, 580, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/catalogo', '/producto/corazon']) { await go(path); await settle(); await assertNoOverflow(); }
  }
  check('No horizontal page overflow at 320, 360, 390, 580, 768, 1024 and 1440 px');

  const mobileContext = await browser.newContext({ ...devices['iPhone 13'], defaultBrowserType: 'chromium' });
  mobileContext.on('page', (target) => {
    target.on('pageerror', (error) => errors.push(error.message));
    target.on('console', (message) => { if (['error', 'warning'].includes(message.type())) errors.push(`${message.type()}: ${message.text()}`); });
    target.on('response', (response) => { if (response.status() >= 400) failedRequests.push(`${response.status()}: ${response.url()}`); });
    target.on('requestfailed', (request) => failedRequests.push(`${request.failure()?.errorText}: ${request.url()}`));
  });
  const mobile = await mobileContext.newPage();
  await go('/', mobile); await scrollThrough(mobile);
  await mobile.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  await mobile.screenshot({ path: 'artifacts/home-mobile-hero.png' });
  await mobile.getByRole('button', { name: 'Abrir menú', exact: true }).click(); await settle(mobile);
  await mobile.screenshot({ path: 'artifacts/menu-mobile.png' });
  assert.ok(await mobile.locator('#menu-dialog').isVisible());
  await mobile.locator('.mobile-nav').getByRole('link', { name: /Anillos/ }).click(); await settle(mobile);
  assert.equal(await mobile.locator('dialog[open]').count(), 0);
  assert.equal(await mobile.locator('.catalog-grid [data-product-card]').count(), 1);
  await scrollThrough(mobile);
  await mobile.screenshot({ path: 'artifacts/catalog-mobile.png', fullPage: true });
  await go('/producto/corazon', mobile); await scrollThrough(mobile);
  await mobile.screenshot({ path: 'artifacts/product-mobile.png', fullPage: true });
  await assertNoOverflow(mobile);
  await go('/', mobile); await mobile.waitForTimeout(2000);
  const touchSlider = mobile.locator('.carousel-viewport').first();
  await touchSlider.scrollIntoViewIfNeeded();
  const box = await touchSlider.boundingBox();
  const session = await mobileContext.newCDPSession(mobile);
  const y = Math.round(box.y + 150);
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 310, y }] });
  for (const x of [285, 250, 200, 150, 90]) { await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] }); await mobile.waitForTimeout(30); }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await settle(mobile);
  assert.ok(await touchSlider.evaluate((el) => el.scrollLeft) > 30);
  check('Mobile menu, catalog, product and real touch swipe');
  await mobile.getByRole('button', { name: 'Abrir menú', exact: true }).click();
  await mobile.emulateMedia({ reducedMotion: 'reduce' });
  await mobile.waitForFunction(() => getComputedStyle(document.querySelector('.mobile-nav a')).opacity === '1');
  assert.equal(await mobile.locator('.mobile-nav a').first().evaluate((element) => getComputedStyle(element).opacity), '1');
  await mobile.keyboard.press('Escape');
  assert.equal(await mobile.locator('dialog[open]').count(), 0);
  check('Enabling reduced motion during mobile-menu entry restores visible links');
  await mobileContext.close();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await go('/');
  assert.equal(await page.locator('.text-mask > span').evaluate((el) => getComputedStyle(el).transform), 'none');
  await page.getByRole('button', { name: 'Buscar joyas', exact: true }).click();
  assert.equal(await page.locator('.sheet-search .sheet-inner').evaluate((el) => getComputedStyle(el).transform), 'matrix(1, 0, 0, 1, 0, 0)');
  await page.keyboard.press('Escape');
  assert.equal(await page.evaluate(() => window.ScrollTrigger.getAll().length), 0);
  check('Reduced-motion content visibility and immediate modal transitions');
  // Follow every unique link destination from the shell and homepage.
  const destinations = new Set(await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href'))));
  for (const destination of destinations) {
    if (destination.startsWith('#/')) {
      await go(destination.slice(1));
      assert.ok((await page.locator('main').innerText()).trim().length > 20);
      assert.equal(await page.locator('main').getByText('Ese detalle no está aquí.', { exact: true }).count(), 0);
      const title = await page.title();
      await page.reload();
      await page.locator('main h1').waitFor();
      assert.equal(await page.title(), title);
      for (const link of await page.locator('a[href]').evaluateAll((links) => links.map((link) => link.getAttribute('href')))) destinations.add(link);
    } else {
      assert.ok(['#contenido', '#seleccion'].includes(destination), `Unexpected link: ${destination}`);
    }
  }
  check(`All ${destinations.size} distinct public links resolve and route reloads preserve the page`);
  assert.deepEqual(errors, [], 'Browser console errors or warnings');
  assert.deepEqual(failedRequests, [], 'Failed HTTP assets');
  check('No console errors, warnings or failed local assets');
  // Intentional network failures have their own context, separate from healthy QA.
  const resilience = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  for (const vendor of ['gsap.min.js', 'ScrollTrigger.min.js']) {
    const isolated = await resilience.newPage();
    const runtimeErrors = [];
    isolated.on('pageerror', (error) => runtimeErrors.push(error.message));
    await isolated.route(`**/vendor/${vendor}`, (route) => route.abort());
    await go('/', isolated);
    assert.match(await isolated.locator('main h1').innerText(), /Tu brillo/);
    await isolated.getByRole('button', { name: 'Abrir menú', exact: true }).click();
    await isolated.locator('.mobile-nav a[href="#/catalogo?categoria=anillos"]').click();
    await isolated.waitForURL('**/#/catalogo?categoria=anillos');
    await isolated.locator('.product-image-link').click();
    await isolated.locator('.product-details h1').waitFor();
    assert.equal(await isolated.locator('#product-purchase').count(), 0);
    assert.deepEqual(runtimeErrors, []);
    await isolated.close();
  }
  const interrupted = await resilience.newPage();
  await interrupted.route('**/pages/home.js', (route) => route.abort());
  await interrupted.goto(`${base}/`);
  await interrupted.locator('main [role="alert"]').waitFor();
  assert.ok(await interrupted.getByRole('button', { name: 'Volver a intentar' }).isVisible());
  await resilience.close();
  check('Missing GSAP or ScrollTrigger preserves browsing; interrupted modules show a retry diagnostic');
} finally {
  await writeFile('artifacts/verification.json', JSON.stringify({ date: new Date().toISOString(), base, checks, errors, failedRequests }, null, 2));
  await browser.close();
}
