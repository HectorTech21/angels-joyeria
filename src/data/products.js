// One record per photographic reference. Group photos stay grouped.
// Names describe the photographs; they are not official product names or SKUs.
// Legacy sample prices are retained ONLY for the disconnected cart's internal tests.
// Never render these amounts or use them as Shopify product/variant data.
export const products = [
  { id: 'corazon', name: 'Collar con corazón', category: 'collares', price: 79, image: 'cadena-plata-corazon.jpeg', alt: 'Collar de eslabones con colgante en forma de corazón sobre expositor negro', position: 'center 53%', label: 'Un detalle que dice mucho', description: 'Un collar de eslabones con un colgante en forma de corazón. Su silueta es la protagonista de esta selección.' },
  { id: 'cruz', name: 'Collar con cruz', category: 'collares', price: 89, image: 'cadena-cruz-oro.jpeg', alt: 'Cadena con colgante en forma de cruz sobre expositor negro', position: 'center 56%', label: 'Tu símbolo, tu historia', description: 'Una cadena con un colgante en forma de cruz. Una composición de líneas definidas para explorar el estilo Angels.' },
  { id: 'eslabon', name: 'Collar y pulsera de eslabones', category: 'pulseras', price: 149, image: 'cadena-pulsera-oro.jpeg', alt: 'Collar y pulsera de eslabones fotografiados juntos sobre un expositor', position: 'center 43%', label: 'Mejor en compañía', description: 'Un collar y una pulsera de eslabones comparten protagonismo en esta composición. Descubre sus formas y la manera en que dialogan sobre el expositor.', gallery: ['cadena-oro2.jpeg'] },
  { id: 'anillos-corazones', name: 'Anillos de corazón', category: 'anillos', price: 45, image: 'anillos.jpeg', alt: 'Cuatro anillos de corazón con detalles de varios colores sobre un guante negro', position: 'center 26%', cardScale: 1.3, cardOrigin: 'center 24%', label: 'Un flechazo a primera vista', description: 'Cuatro anillos con silueta de corazón y detalles de color. Una composición que invita a descubrir cada forma de cerca.' },
  { id: 'rostro', name: 'Collar con rostro', category: 'collares', price: 129, image: 'cadena-jesus.jpeg', alt: 'Collar con un colgante de rostro de inspiración religiosa sobre expositor negro', position: 'center 48%', label: 'Presencia propia', description: 'Un collar de eslabones con un colgante de inspiración religiosa. La galería invita a explorar otra composición de la misma familia de joyas.', gallery: ['cadenas-oro-jesus.jpeg'] },
  { id: 'cadenas-doradas', name: 'Cadenas de tono dorado', category: 'collares', price: 110, image: 'cadenas-oro1.jpg', alt: 'Dos expositores negros con una selección de cadenas de apariencia dorada', position: 'center 58%', label: 'Encuentra tu combinación', description: 'Cadenas de distintas siluetas y tonos dorados sobre dos expositores negros. Los eslabones dan ritmo a una composición con presencia propia.' },
  { id: 'cadenas-plateadas', name: 'Cadenas de tono plateado', category: 'collares', price: 95, image: 'cadenas-plata1.jpg', alt: 'Selección de cadenas de apariencia plateada con diferentes eslabones sobre expositor negro', position: 'center 48%', label: 'Todos los ojos en ti', description: 'Una selección de cadenas de tonos plateados. Distintos eslabones, volúmenes y formas de expresar tu estilo.' },
];

export const categories = [
  { id: 'todos', name: 'Todas las piezas' },
  { id: 'anillos', name: 'Anillos' },
  { id: 'pulseras', name: 'Pulseras' },
  { id: 'collares', name: 'Collares' },
];
export const imageUrl = (file) => `/assets/${file}`;
export const money = (amount) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
export const getProduct = (id) => products.find((product) => product.id === id);
export const categoryName = (id) => categories.find((category) => category.id === id)?.name || 'Todas las piezas';
export const normalize = (text) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function filterProducts({ category = 'todos', query = '', sort = 'seleccion' } = {}) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  const result = products.filter((p) => (category === 'todos' || p.category === category) && words.every((word) => normalize(`${p.name} ${p.category} ${p.label}`).includes(word)));
  if (sort === 'precio-asc') result.sort((a, b) => a.price - b.price);
  if (sort === 'precio-desc') result.sort((a, b) => b.price - a.price);
  if (sort === 'nombre-asc') result.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  if (sort === 'nombre-desc') result.sort((a, b) => b.name.localeCompare(a.name, 'es'));
  return result;
}
