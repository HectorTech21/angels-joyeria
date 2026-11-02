import { homePage } from './pages/home.js';
import { catalogPage, initCatalog } from './pages/catalog.js';
import { productPage, initProduct } from './pages/product.js';
import { infoPage, notFoundPage } from './pages/info.js';
import { getProduct } from './data/products.js';
import { hydrateIcons } from './components/icons.js';
import { initDialogs, closeDialog } from './components/dialogs.js';
import { initSearch } from './components/search.js';
import { initCarousels } from './components/carousel.js';
import { animatePage, refreshMotion, reducedMotion } from './lib/motion.js';
import { readRoute } from './lib/router.js';

const main = document.querySelector('#contenido');
let cleanupMotion = () => {};
let cleanupCarousels = () => {};
let firstRender = true;
let preserveScroll = false;
let currentPath = '';

export function navigate(path, options = {}) {
  preserveScroll = Boolean(options.preserveScroll);
  if (location.hash === `#${path}`) {
    if (!preserveScroll) window.scrollTo({ top: 0, behavior: 'instant' });
    preserveScroll = false;
    return;
  }
  location.hash = path;
}

function render() {
  const { path, params, anchor } = readRoute(location.hash);
  // Home anchors retain the mounted home. Back from another route must restore it.
  if (!firstRender && anchor && currentPath === path) { focusAnchor(anchor); return; }
  cleanupMotion(); cleanupCarousels(); closeDialog({ instant: true });
  let title = 'ANGELS JOYERÍA — Tu brillo. Tus reglas.';
  if (path === '/') main.innerHTML = homePage();
  else if (path === '/catalogo') { main.innerHTML = catalogPage(params); title = 'La selección — ANGELS JOYERÍA'; }
  else if (path.startsWith('/producto/')) {
    const product = getProduct(path.split('/')[2]);
    main.innerHTML = product ? productPage(product) : notFoundPage();
    title = product ? `${product.name} — ANGELS JOYERÍA` : 'Referencia no encontrada — ANGELS JOYERÍA';
  } else if (path.startsWith('/informacion/')) { main.innerHTML = infoPage(path.split('/')[2]); title = `${main.querySelector('h1').textContent} — ANGELS JOYERÍA`; }
  else { main.innerHTML = notFoundPage(); title = 'Página no encontrada — ANGELS JOYERÍA'; }
  document.title = title;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const current = link.dataset.nav === 'inicio' ? path === '/' : path === '/catalogo' && params.get('categoria') === link.dataset.nav;
    if (current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  if (!firstRender && !preserveScroll) { window.scrollTo({ top: 0, behavior: 'instant' }); main.focus({ preventScroll: true }); }
  initCatalog(navigate);
  initProduct();
  cleanupCarousels = initCarousels(main);
  cleanupMotion = animatePage(main, { initial: firstRender, home: path === '/' });
  main.querySelectorAll('img').forEach((image) => { if (!image.complete) image.addEventListener('load', refreshMotion, { once: true }); });
  requestAnimationFrame(() => { refreshMotion(); if (anchor) focusAnchor(anchor); });
  currentPath = path; firstRender = false; preserveScroll = false;
}

function focusAnchor(id) {
  const target = document.getElementById(id);
  if (!target) return;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start' });
}

hydrateIcons();
initDialogs();
initSearch(navigate);
document.querySelector('#year').textContent = new Date().getFullYear();
window.addEventListener('hashchange', render);
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => { document.querySelector('#header').classList.toggle('is-scrolled', window.scrollY > 30); scrollTicking = false; });
}, { passive: true });
document.addEventListener('click', (event) => {
  if (event.target.closest('.skip-link')) { event.preventDefault(); focusAnchor('contenido'); return; }
  const scrollLink = event.target.closest('[data-scroll]');
  if (!scrollLink) return;
  const section = document.getElementById(scrollLink.dataset.scroll);
  if (section) { event.preventDefault(); section.scrollIntoView({ behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start' }); }
});
document.fonts.ready.then(refreshMotion);
render();
