import { products } from './products.js';

// Editorial content stays separate from the section markup and interactions.
// Shopify will supply these settings and collections through the theme editor.
export const featuredSelection = {
  id: 'seleccion', eyebrow: 'UNA SELECCIÓN CON MUCHO QUE DECIR',
  title: 'Piezas que', emphasis: 'se sienten.',
  href: '#/catalogo', linkLabel: 'Ver todas las piezas',
  products: products.slice(0, 5),
};

export const necklaceSelection = {
  id: 'cadenas', eyebrow: 'ESLABONES, SÍMBOLOS Y MUCHA PERSONALIDAD',
  title: 'Llévalo', emphasis: 'a tu manera.',
  href: '#/catalogo?categoria=collares', linkLabel: 'Todos los collares',
  products: products.filter((product) => product.category === 'collares'),
};
