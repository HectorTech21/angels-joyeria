import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('artifacts/references', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const report = [];
try {
  for (const [name, url] of [['perreo', 'https://www.perreosnkrs.com'], ['reyes', 'https://reyesboutique07.es/']]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.screenshot({ path: `artifacts/references/${name}-desktop.png`, fullPage: true });
      const desktop = await page.evaluate(() => ({ title: document.title, headings: [...document.querySelectorAll('h1,h2')].map((e) => e.textContent.trim()).slice(0, 15), sliders: document.querySelectorAll('slider-component,slideshow-component').length, customElements: [...document.querySelectorAll('button')].map((e) => ({ label: e.getAttribute('aria-label'), text: e.textContent.trim().slice(0, 40) })).slice(0, 35) }));
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({ path: `artifacts/references/${name}-mobile.png`, fullPage: true });
      const menu = page.locator('header summary, .header__icon--menu, button[aria-label*="Menú"], button[aria-label*="menú"]').first();
      if (await menu.isVisible().catch(() => false)) { await menu.click(); await page.screenshot({ path: `artifacts/references/${name}-menu.png` }); }
      report.push({ name, url, inspected: true, desktop });
    } catch (error) { report.push({ name, url, inspected: false, error: error.message }); }
    await page.close();
  }
} finally { await browser.close(); }
await writeFile('artifacts/references/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
