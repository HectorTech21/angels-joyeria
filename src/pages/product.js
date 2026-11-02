import { products, categoryName, imageUrl } from '../data/products.js';
import { productCard } from '../components/product-card.js';
import { icon } from '../components/icons.js';

export function productPage(product) {
  const photos = [product.image, ...(product.gallery || [])];
  return `<div class="product-page wrap" data-product="${product.id}"><nav class="breadcrumb" aria-label="Migas de pan"><a href="#/">Inicio</a><span aria-hidden="true">/</span><a href="#/catalogo?categoria=${product.category}">${categoryName(product.category)}</a><span aria-hidden="true">/</span><span>${product.name}</span></nav><div class="product-layout">
    <div class="product-gallery"><div class="product-main-photo"><img id="product-main-image" src="${imageUrl(product.image)}" alt="${product.alt}" width="1320" height="1790" fetchpriority="high" /></div><div class="gallery-caption"><span>FOTOGRAFÍA REAL · ANGELS JOYERÍA</span><span id="gallery-count">01 / ${String(photos.length).padStart(2, '0')}</span></div>${photos.length > 1 ? `<div class="gallery-thumbnails" role="group" aria-label="Fotografías de la referencia">${photos.map((photo, index) => `<button class="${index === 0 ? 'active' : ''}" data-gallery="${imageUrl(photo)}" data-gallery-index="${index}" aria-label="Ver fotografía ${index + 1}" aria-pressed="${index === 0}"><img src="${imageUrl(photo)}" alt="" loading="eager" width="62" height="72" /></button>`).join('')}</div>` : ''}</div>
    <div class="product-details"><p class="eyebrow">${categoryName(product.category).toUpperCase()} / LA SELECCIÓN ANGELS</p><h1>${product.name}</h1><p class="product-tagline">${product.label}.</p><div class="product-description"><p>${product.description}</p></div>
    <div class="product-explore"><a class="button button-primary" href="#/catalogo?categoria=${product.category}">Explorar ${categoryName(product.category).toLowerCase()} ${icon('diagonal')}</a><a class="text-link" href="#/informacion/seleccion">Sobre la selección ${icon('arrow')}</a></div>
    <details><summary>La pieza, de cerca</summary><p>Los nombres describen las piezas de las fotografías. Los tonos de color no indican el material de la joya. Las imágenes con varias piezas muestran una composición y no implican su venta conjunta.</p></details><details><summary>Disponibilidad y compra</summary><p>Esta selección permite descubrir las joyas de Angels. La compra online no está habilitada y no se aceptan pedidos ni reservas desde esta web.</p></details>
    </div></div><section class="related" aria-labelledby="related-title"><div class="section-heading"><div><p class="eyebrow">SIGUE ENCONTRANDO TU ESTILO</p><h2 class="section-title" id="related-title">También va <em>contigo.</em></h2></div><a class="text-link" href="#/catalogo">Ver todo ${icon('diagonal')}</a></div><div class="catalog-grid">${products.filter((p) => p.id !== product.id).slice(0, 3).map(productCard).join('')}</div></section></div>`;
}

export function initProduct() {
  const product = products.find((item) => item.id === document.querySelector('.product-page')?.dataset.product);
  const thumbnails = document.querySelectorAll('[data-gallery]');
  thumbnails.forEach((button) => button.addEventListener('click', () => {
    const image = document.querySelector('#product-main-image');
    image.src = button.dataset.gallery;
    image.alt = Number(button.dataset.galleryIndex) === 0 ? product.alt : 'Otra composición de la misma familia de joyas Angels';
    document.querySelector('#gallery-count').textContent = `${String(Number(button.dataset.galleryIndex) + 1).padStart(2, '0')} / ${String(thumbnails.length).padStart(2, '0')}`;
    thumbnails.forEach((thumb) => { thumb.classList.toggle('active', thumb === button); thumb.setAttribute('aria-pressed', String(thumb === button)); });
  }));
}
