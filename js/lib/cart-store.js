import { getProduct } from '../data/products.js';
export const CART_KEY = 'angels-cart-v1';
export const MAX_QUANTITY = 99;
export function sanitizeCart(value) {
  if (!Array.isArray(value)) return [];
  const grouped = new Map();
  for (const item of value) {
    if (!item || !getProduct(item.id) || !Number.isFinite(item.quantity) || item.quantity < 1) continue;
    grouped.set(item.id, Math.min(MAX_QUANTITY, (grouped.get(item.id) || 0) + Math.trunc(item.quantity)));
  }
  return [...grouped].map(([id, quantity]) => ({ id, quantity }));
}
export function createCartStore(storage) {
  let items = [];
  let persisted = true;
  const listeners = new Set();
  try { items = sanitizeCart(JSON.parse(storage.getItem(CART_KEY) || '[]')); } catch { /* Invalid or blocked storage starts with a safe, empty cart. */ }
  const save = () => {
    try { storage.setItem(CART_KEY, JSON.stringify(items)); persisted = true; } catch { persisted = false; }
    listeners.forEach((listener) => listener());
  };
  return {
    get items() { return items.map((item) => ({ ...item })); },
    get count() { return items.reduce((count, item) => count + item.quantity, 0); },
    get total() { return items.reduce((total, item) => total + Math.round(getProduct(item.id).price * 100) * item.quantity, 0) / 100; },
    get persisted() { return persisted; },
    add(id, quantity = 1) {
      if (!getProduct(id) || !Number.isFinite(quantity) || quantity < 1) return false;
      items = sanitizeCart([...items, { id, quantity }]); save(); return true;
    },
    setQuantity(id, quantity) {
      if (!Number.isFinite(quantity)) return;
      items = sanitizeCart(items.map((item) => item.id === id ? { ...item, quantity } : item)); save();
    },
    remove(id) { items = items.filter((item) => item.id !== id); save(); },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    sync() { try { items = sanitizeCart(JSON.parse(storage.getItem(CART_KEY) || '[]')); listeners.forEach((listener) => listener()); } catch { /* Keep the in-memory selection if storage becomes unavailable. */ } },
  };
}
