import { products, filterProducts, imageUrl, categoryName } from '../data/products.js';
import { icon } from './icons.js';
import { closeDialog } from './dialogs.js';

export function initSearch(navigate) {
  const input = document.querySelector('#search-input');
  const results = document.querySelector('#search-results');
  const status = document.querySelector('#search-status');
  function render() {
    const query = input.value.trim();
    const selection = query ? filterProducts({ query }) : products.slice(0, 4);
    status.textContent = query ? `${selection.length} ${selection.length === 1 ? 'referencia encontrada' : 'referencias encontradas'}` : 'UNAS PIEZAS PARA EMPEZAR';
    results.innerHTML = selection.length ? selection.map((product) => `<a class="search-result" href="#/producto/${product.id}"><img src="${imageUrl(product.image)}" alt="${product.alt}" width="65" height="80" style="object-position:${product.position}" /><div><h3>${product.name}</h3><small>${categoryName(product.category)}</small></div>${icon('diagonal')}</a>`).join('') : '<p class="search-empty">Prueba con otro detalle.</p>';
  }
  input.addEventListener('input', render);
  document.querySelector('#search-form').addEventListener('submit', (event) => { event.preventDefault(); closeDialog({ instant: true }); navigate(`/catalogo?q=${encodeURIComponent(input.value.trim())}`); });
  render();
}
