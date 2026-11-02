import { productCard } from './product-card.js';
import { icon } from './icons.js';
import { escapeHtml } from '../lib/html.js';

// One collection-like section, ready to map to a Liquid section + card snippet.
export function productRail({ id, eyebrow, title, emphasis, href, linkLabel, products: selection }) {
  const label = `${title} ${emphasis}`;
  return `<section class="featured section-space" id="${id}" aria-labelledby="${id}-title">
    <div class="section-heading wrap"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h2 class="section-title" id="${id}-title" data-reveal>${escapeHtml(title)} <em>${escapeHtml(emphasis)}</em></h2></div><a class="text-link desktop-all" href="${href}">${escapeHtml(linkLabel)} ${icon('diagonal')}</a></div>
    <div class="wrap"><div class="carousel" data-carousel role="region" aria-roledescription="carrusel" aria-label="${escapeHtml(label)}">
      <div class="carousel-viewport" tabindex="0" aria-label="Productos. Usa las flechas del teclado para explorar."><div class="carousel-track">${selection.map((product, index) => `<div class="carousel-slide" role="group" aria-roledescription="diapositiva" aria-label="${index + 1} de ${selection.length}">${productCard(product, index)}</div>`).join('')}</div></div>
      <div class="carousel-bottom"><span class="carousel-hint">DESLIZA. DESCUBRE. ENCUENTRA.</span><div class="carousel-progress" aria-hidden="true"><span></span></div><div class="carousel-controls"><span class="carousel-count" aria-live="polite">01 / ${String(selection.length).padStart(2, '0')}</span><button class="round-button" data-prev aria-label="Productos anteriores">${icon('left')}</button><button class="round-button" data-next aria-label="Productos siguientes">${icon('arrow')}</button></div></div>
    </div></div>
  </section>`;
}
