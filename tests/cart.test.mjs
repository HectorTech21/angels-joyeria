import test from 'node:test';
import assert from 'node:assert/strict';
import { createCartStore, sanitizeCart, CART_KEY } from '../js/lib/cart-store.js';
import { products, filterProducts } from '../js/data/products.js';

function memoryStorage(initial = null) {
  const values = new Map(initial ? [[CART_KEY, initial]] : []);
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
test('cart merges items, calculates total and restores persistence', () => {
  const storage = memoryStorage();
  const cart = createCartStore(storage);
  cart.add('corazon', 2); cart.add('corazon', 1); cart.add('cruz', 2);
  assert.equal(cart.count, 5);
  assert.equal(cart.total, 79 * 3 + 89 * 2);
  assert.deepEqual(createCartStore(storage).items, cart.items);
  cart.setQuantity('corazon', 1); cart.remove('cruz');
  assert.equal(cart.total, 79); assert.equal(cart.count, 1);
});
test('invalid data cannot inject unknown products, non-finite quantities or excessive quantities', () => {
  assert.deepEqual(sanitizeCart([{ id: 'unknown', quantity: 2 }, null, { id: 'cruz', quantity: '3' }, { id: 'cruz', quantity: -1 }, { id: 'cruz', quantity: 0.5 }, { id: 'cruz', quantity: Infinity }]), []);
  assert.deepEqual(sanitizeCart([{ id: 'cruz', quantity: 60 }, { id: 'cruz', quantity: 60 }]), [{ id: 'cruz', quantity: 99 }]);
  const cart = createCartStore(memoryStorage('{broken'));
  assert.deepEqual(cart.items, []); assert.equal(cart.add('unknown', 1), false);
  cart.add('corazon'); cart.setQuantity('corazon', NaN); assert.equal(cart.count, 1);
});
test('blocked localStorage keeps a usable in-memory cart', () => {
  const cart = createCartStore({ getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } });
  cart.add('corazon', 2); assert.equal(cart.total, 158); assert.equal(cart.persisted, false);
});
test('external storage changes synchronize without retaining removed items', () => {
  const storage = memoryStorage(); const cart = createCartStore(storage);
  cart.add('corazon'); storage.setItem(CART_KEY, '[]'); cart.sync(); assert.equal(cart.count, 0);
});
test('search ignores accents, filters real categories and sorts prices', () => {
  assert.equal(filterProducts({ category: 'pendientes' }).length, 0);
  assert.equal(filterProducts({ query: 'corazon' }).length, 2);
  assert.equal(filterProducts({ query: 'COLLAR CORAZÓN' })[0].id, 'corazon');
  const sorted = filterProducts({ sort: 'precio-asc' });
  assert.deepEqual(sorted.map((p) => p.price), [...sorted.map((p) => p.price)].sort((a, b) => a - b));
  assert.equal(new Set(products.map((p) => p.image)).size, products.length);
});
