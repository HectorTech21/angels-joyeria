// Optional migration evidence; never loaded by the website.
import { chromium, devices } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = (process.env.TEST_URL || 'http://127.0.0.1:5502').replace(/\/$/, '');
const label = process.env.SNAPSHOT_LABEL || 'after';
const output = resolve('artifacts/static-migration', label);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true, args: ['--disable-gpu', '--force-color-profile=srgb'] });
const report = { base, label, captures: [], motion: [], errors: [] };
try {
  for (const mobile of [false, true]) {
    const viewport = mobile ? 'mobile' : 'desktop';
    const context = await browser.newContext({ ...(mobile ? devices['iPhone 13'] : { viewport: { width: 1440, height: 1000 } }), reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', (e) => report.errors.push(e.message));
    page.on('response', (r) => { if (r.status() >= 400) report.errors.push(`${r.status()} ${r.url()}`); });
    page.on('requestfailed', (r) => report.errors.push(`${r.failure()?.errorText} ${r.url()}`));
    async function ready() {
      await page.locator('main h1').waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => [...document.images].every(i => i.complete && i.naturalWidth > 0));
      // decoding="async" may report complete before offscreen images are painted.
      await page.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
      await page.waitForTimeout(750);
    }
    async function capture(name, fullPage = true) {
      await page.screenshot({ path: resolve(output, `${viewport}-${name}.png`), fullPage });
      report.captures.push({ viewport, name, fullPage });
    }
    for (const [name, route] of [['home', '/'], ['catalog', '/catalogo'], ['anillos', '/catalogo?categoria=anillos'], ['product', '/producto/eslabon'], ['brand', '/informacion/marca']]) {
      await page.goto(`${base}/#${route}`);
      await ready();
      await capture(name);
      if (name === 'home') await capture('hero', false);
    }
    await page.getByRole('button', { name: 'Buscar joyas', exact: true }).click();
    await page.locator('#search-input').fill('corazon');
    await ready();
    await capture('search', false);
    await page.locator('#search-dialog [data-close]').click();
    if (mobile) {
      await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
      await capture('menu', false);
      await page.keyboard.press('Escape');
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`${base}/#/`);
    await ready();
    await page.waitForTimeout(3500);
    report.motion.push(await page.evaluate((viewport) => ({
      viewport, gsap: gsap.version, scrollTrigger: ScrollTrigger.version,
      triggers: ScrollTrigger.getAll().map(t => ({
        target: t.trigger.className, start: t.vars.start, end: t.vars.end || null,
        scrub: t.vars.scrub || false, once: t.vars.once || false,
        duration: t.animation?.duration(), ease: t.animation?.vars.ease || null,
      })),
      heroTransform: getComputedStyle(document.querySelector('.hero-photo img')).transform,
      heroClip: getComputedStyle(document.querySelector('.hero-photo')).clipPath,
    }), viewport));
    await capture('hero-animated', false);
    await context.close();
  }
  if (report.errors.length) throw new Error(JSON.stringify(report.errors));
} finally {
  await writeFile(resolve(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
}
console.log(`${label}: ${report.captures.length} capturas y configuración de animaciones guardadas en ${output}`);
