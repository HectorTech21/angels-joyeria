import { categories, categoryName, filterProducts } from '../data/products.js';
import { productCard } from '../components/product-card.js';
import { icon } from '../components/icons.js';
import { escapeHtml } from '../lib/html.js';

export function catalogPage(params) {
  const category = categories.some((c) => c.id === params.get('categoria')) ? params.get('categoria') : 'todos';
  const query = params.get('q') || '';
  const sort = ['nombre-asc', 'nombre-desc'].includes(params.get('orden')) ? params.get('orden') : 'seleccion';
  const selection = filterProducts({ category, query, sort });
  const emptyText = 'No hay piezas que coincidan con esta búsqueda. Prueba con otro detalle o explora toda la selección.';
  return `<div class="catalog-page wrap"><nav class="breadcrumb" aria-label="Migas de pan"><a href="#/">Inicio</a><span aria-hidden="true">/</span><span>Catálogo</span></nav>
    <div class="catalog-header"><div><p class="eyebrow">EL UNIVERSO ANGELS, A TU MANERA</p><h1>${category === 'todos' ? 'Todas las piezas.' : `${categoryName(category)}.`}</h1></div><p>Detalles con presencia propia.<br>Encuentra el que habla de ti.</p></div>
    <div class="catalog-toolbar"><div class="filters" role="group" aria-label="Filtrar por categoría">${categories.map((c) => `<button class="filter-chip ${c.id === category ? 'active' : ''}" data-filter="${c.id}" aria-pressed="${c.id === category}">${c.name}</button>`).join('')}</div><label class="sort-field" for="catalog-sort">Ordenar por <select id="catalog-sort"><option value="seleccion" ${sort === 'seleccion' ? 'selected' : ''}>Selección Angels</option><option value="nombre-asc" ${sort === 'nombre-asc' ? 'selected' : ''}>Nombre: A–Z</option><option value="nombre-desc" ${sort === 'nombre-desc' ? 'selected' : ''}>Nombre: Z–A</option></select></label></div>
    <form id="catalog-search" class="catalog-search" role="search"><label for="catalog-query" class="sr-only">Buscar en el catálogo</label>${icon('search')}<input id="catalog-query" name="q" type="search" placeholder="Buscar un detalle, un nombre…" value="${escapeHtml(query)}" /><button class="icon-button" aria-label="Buscar en catálogo" type="submit">${icon('arrow')}</button></form>
    <div class="catalog-summary" aria-live="polite"><span>${selection.length} ${selection.length === 1 ? 'selección' : 'selecciones'}${query ? ` para «${escapeHtml(query)}»` : ''}</span><a href="#/informacion/seleccion">Sobre la selección ↗</a></div>
    <div class="catalog-grid">${selection.length ? selection.map(productCard).join('') : `<div class="empty-state"><span class="empty-symbol" aria-hidden="true">✧</span><h2>Seguimos buscando tu brillo.</h2><p>${emptyText}</p><a class="button button-primary" href="#/catalogo">Explorar todas las piezas ${icon('arrow')}</a></div>`}</div>
  </div>`;
}

export function initCatalog(navigate) {
  const update = (key, value) => {
    const params = new URLSearchParams(location.hash.split('?')[1]);
    if (!value || value === 'todos' || value === 'seleccion') params.delete(key);
    else params.set(key, value);
    const query = params.toString();
    navigate(`/catalogo${query ? `?${query}` : ''}`, { preserveScroll: true });
  };
  document.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => update('categoria', button.dataset.filter)));
  document.querySelector('#catalog-sort')?.addEventListener('change', (event) => update('orden', event.target.value));
  document.querySelector('#catalog-search')?.addEventListener('submit', (event) => {
    event.preventDefault(); update('q', new FormData(event.currentTarget).get('q').trim());
  });
}
