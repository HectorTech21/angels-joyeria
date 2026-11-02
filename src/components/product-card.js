import { categoryName, imageUrl } from '../data/products.js';
import { icon } from './icons.js';
export function productCard(product, index = 0) {
  return `<article class="product-card" data-product-card>
    <div class="product-photo"><a href="#/producto/${product.id}" class="product-image-link" aria-label="Ver ${product.name}"><img src="${imageUrl(product.image)}" alt="${product.alt}" loading="eager" decoding="async" width="660" height="800" style="object-position:${product.position};--photo-scale:${product.cardScale || 1};--photo-origin:${product.cardOrigin || 'center'}" /></a>
      <span class="product-index">${String(index + 1).padStart(2, '0')}</span><span class="photo-tag">SELECCIÓN ANGELS</span>
      <a class="product-view" href="#/producto/${product.id}">Descubrir pieza ${icon('diagonal')}</a>
      <a class="quick-add" href="#/producto/${product.id}" aria-label="Ver detalles: ${product.name}">${icon('diagonal')}</a>
    </div>
    <div class="product-meta"><div><span class="product-category">${categoryName(product.category)}</span><h3><a href="#/producto/${product.id}">${product.name}</a></h3></div></div>
  </article>`;
}
