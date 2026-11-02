import { createCartStore, CART_KEY } from '../lib/cart-store.js';
import { getProduct, imageUrl, money } from '../data/products.js';
import { icon } from './icons.js';
import { openDialog, closeDialog } from './dialogs.js';

let storage;
try { storage = window.localStorage; } catch { storage = { getItem() { return null; }, setItem() { throw new Error('Storage unavailable'); } }; }
export const cart = createCartStore(storage);

function renderCart() {
  const previous = document.activeElement;
  const focusedId = previous?.closest('[data-cart-item]')?.dataset.cartItem;
  const focusedAction = previous?.dataset.cartAction;
  document.querySelectorAll('[data-cart-count]').forEach((element) => { element.textContent = cart.count; });
  document.querySelector('[data-open="cart"]').setAttribute('aria-label', `Abrir carrito, ${cart.count} ${cart.count === 1 ? 'artículo' : 'artículos'}`);
  const content = document.querySelector('#cart-content');
  content.innerHTML = cart.items.length ? cart.items.map((item) => {
    const product = getProduct(item.id);
    return `<article class="cart-item" data-cart-item="${item.id}"><a class="cart-item-image" href="#/producto/${item.id}" aria-label="Ver ${product.name}"><img src="${imageUrl(product.image)}" alt="${product.alt}" width="85" height="118" style="object-position:${product.position}" /></a><div><div class="cart-item-heading"><h3><a href="#/producto/${item.id}">${product.name}</a></h3><button class="remove-item" data-cart-action="remove" aria-label="Eliminar ${product.name}">${icon('trash')}</button></div><p class="cart-item-price">${money(product.price * item.quantity)}<small>precio demo</small></p><div class="quantity-control"><button data-cart-action="decrease" aria-label="Reducir cantidad de ${product.name}" ${item.quantity === 1 ? 'disabled' : ''}>${icon('minus')}</button><output aria-label="Cantidad de ${product.name}">${item.quantity}</output><button data-cart-action="increase" aria-label="Aumentar cantidad de ${product.name}" ${item.quantity === 99 ? 'disabled' : ''}>${icon('plus')}</button></div></div></article>`;
  }).join('') : `<div class="empty-state"><span class="empty-symbol" aria-hidden="true">✧</span><h2>Tu próximo detalle<br>está por descubrir.</h2><p>Guarda aquí las piezas que van contigo.<br>Esto es solo el comienzo.</p><a href="#/catalogo" class="button button-primary">Explorar la colección ${icon('diagonal')}</a></div>`;
  document.querySelector('#cart-summary').innerHTML = cart.items.length ? `<div class="cart-total"><span>Total demo</span><span>${money(cart.total)}</span></div><p class="cart-summary-note">${cart.persisted ? 'Tu selección se guarda en este navegador.' : 'El navegador no permite guardar tu selección. Se conservará solo durante esta sesión.'}<br>No se generan pedidos ni se procesan pagos. <a href="#/informacion/compra">Más información</a></p><button class="button button-primary cart-continue" data-continue>Seguir explorando ${icon('arrow')}</button>` : '';
  if (focusedId && focusedAction) {
    const restored = content.querySelector(`[data-cart-item="${focusedId}"] [data-cart-action="${focusedAction}"]:not(:disabled)`);
    (restored || content.querySelector('[data-cart-action]:not(:disabled)') || content.querySelector('a'))?.focus({ preventScroll: true });
  }
}

export function addToCart(id, quantity = 1) {
  if (!cart.add(id, quantity)) return;
  document.querySelector('#status').textContent = `${getProduct(id).name} añadido al carrito. ${cart.count} artículos en tu selección.`;
  openDialog('cart');
}

export function initCart() {
  cart.subscribe(renderCart); renderCart();
  document.addEventListener('click', (event) => {
    const add = event.target.closest('[data-add]');
    if (add) addToCart(add.dataset.add);
    if (event.target.closest('[data-continue]')) closeDialog();
    const action = event.target.closest('[data-cart-action]');
    if (!action) return;
    const id = action.closest('[data-cart-item]').dataset.cartItem;
    const item = cart.items.find((entry) => entry.id === id);
    if (!item) return;
    if (action.dataset.cartAction === 'remove') cart.remove(id);
    else cart.setQuantity(id, item.quantity + (action.dataset.cartAction === 'increase' ? 1 : -1));
    document.querySelector('#status').textContent = `Carrito actualizado. ${cart.count} artículos. Total de demostración: ${money(cart.total)}.`;
  });
  window.addEventListener('storage', (event) => { if (event.key === CART_KEY || event.key === null) cart.sync(); });
}
