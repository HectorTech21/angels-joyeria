# Angels Joyería → tema de Shopify

Plan preparado el 26 de octubre de 2026. Este proyecto es un MVP local para aprobar el diseño. No se ha accedido a Shopify, subido un tema, conectado un catálogo ni modificado angelsjoyeria.es.

La siguiente fase debe aprovechar la tienda existente mediante un tema Online Store 2.0. No necesitamos un ecommerce paralelo, un backend, un panel administrativo ni una aplicación headless para reproducir esta experiencia.

## 1. Código que podemos reutilizar

- Identidad visual: variables de color, tipografías, tamaños, composición, responsive, estados de foco y microinteracciones de `src/styles/`. Son CSS estándar; `src/styles.css` solo organiza sus importaciones. En Shopify se pueden reunir en un asset o cargar los bloques necesarios por plantilla, conservando su orden.
- Estructura y clases de hero, categorías, tarjetas, carruseles, fotografías editoriales, cabecera, footer y paneles. El HTML actual sirve como referencia exacta del diseño aprobado.
- `src/components/carousel.js`: desplazamiento nativo, flechas, teclado, arrastre y limpieza de eventos, sin dependencia de las rutas ni de Vite.
- `src/lib/motion.js`: GSAP, ScrollTrigger, secuencia inicial, revelados, aparición de tarjetas y composición editorial. Recibe un contenedor y devuelve una función de limpieza. Los efectos de inicio comprueban qué elementos existen, de modo que pueden inicializarse por sección.
- `src/components/dialogs.js`: presentación y cierre de los diálogos. En el tema habrá que conectar sus disparadores y asegurar una única inicialización global.
- Fotografías originales y fuentes locales con sus licencias. Subir las imágenes comerciales a Shopify para servir tamaños adaptados desde su CDN; conservar los avisos de licencia de las fuentes y librerías.

No se trasladan `dist/`, `node_modules/`, las capturas ni los scripts del servidor al tema. Los archivos GSAP de `public/vendor/` pasan a assets, revisando su licencia vigente en el momento de la integración.

Las funciones JavaScript son reutilizables, pero no basta con copiar sus imports actuales a una carpeta `assets` plana: hay que generar un bundle del tema o ajustar los nombres y rutas de los módulos. Las URLs CSS `/fonts/...` también se adaptarán a URLs de assets de Shopify, por ejemplo declarando las fuentes desde Liquid con `asset_url`. Las referencias `/assets/...` de las vistas se sustituyen por imágenes de los objetos Liquid. Vite, si se usa para preparar assets, será solo una herramienta de build; la tienda no dependerá de su servidor ni de su router.

## 2. Qué convertir a Liquid

| Origen del MVP | Destino propuesto | Conversión |
| --- | --- | --- |
| Estructura de `index.html` | `layout/theme.liquid` y grupos de cabecera/pie | Mantener el shell; usar `content_for_header` y `content_for_layout`; menús y enlaces del comercio. |
| Hero de `src/pages/home.js` | `sections/angels-hero.liquid` | Ajustes para imagen, texto, etiqueta, enlace y alineación; conservar mallas, máscaras y clases. |
| Categorías de la portada | `sections/angels-categories.liquid` | Bloques de colecciones elegibles desde el editor. |
| `product-rail.js` y `merchandising.js` | `sections/angels-product-rail.liquid` | Selector de colección, título, cantidad de productos y CTA. Se puede añadir varias veces a la portada. |
| `product-card.js` | `snippets/angels-product-card.liquid` | Datos del objeto `product`, imagen, precio, URL y disponibilidad reales. |
| Historias de anillos, cadenas y marca | Secciones editoriales independientes | Imágenes, textos y vínculos editables, con atributos de animación conservados. |
| `catalog.js` | `sections/angels-main-collection.liquid` | Iterar `collection.products`, filtros, orden y paginación reales. |
| `product.js` | `sections/angels-main-product.liquid` | Galería, opciones, variante, cantidad, formulario de producto y disponibilidad. |
| `info.js` | Plantillas de páginas y políticas | Contenido real del comercio y políticas existentes, validado por el propietario. |
| Carrito y búsqueda | Secciones/snippets para paneles | Conservar su aspecto; cambiar la fuente de datos y las acciones. |

Los `schema` de las secciones expondrán textos, imágenes, colecciones, botones y opciones de composición. Los identificadores del DOM incorporarán `section.id` para que dos carruseles o galerías no creen IDs duplicados. Cada panel global existirá una sola vez.

El HTML comercial se renderizará en Liquid en el servidor. El JavaScript mejorará interacción y movimiento; no será el responsable de que aparezcan productos o títulos. Se elimina el router hash de `src/main.js` y `src/lib/router.js`: los enlaces serán URLs nativas de productos, colecciones, páginas y búsqueda. La arquitectura de Shopify separa layout, plantillas JSON, secciones y snippets. [Referencia oficial de arquitectura](https://shopify.dev/docs/storefronts/themes/architecture).

## 3. Funcionalidades que sustituye Shopify

`src/data/products.js` y los precios provisionales se sustituyen por productos, variantes y colecciones existentes. `cart-store.js` y su localStorage se retiran: la fuente de verdad del carrito será Shopify. Tampoco se trasladan como lógica comercial `filterProducts`, la búsqueda local o la ordenación en memoria.

Shopify gestionará inventario, precios, variantes, descuentos, pedidos, checkout, pagos, clientes y configuración de envío. El tema presenta esa información y respeta la configuración actual del negocio. No se desarrolla ninguna de estas funciones por separado.

Antes de mapear datos, revisar las siete referencias demo con el dueño: algunas fotos agrupan varias piezas y no corresponden necesariamente a un producto vendible. No importar automáticamente esos grupos como conjuntos, ni tomar sus identificadores demo como IDs de variante. La categoría de pendientes necesitará material real si debe mostrarse con productos.

## 4. Organización del tema

```text
layout/
  theme.liquid
templates/
  index.json
  collection.json
  product.json
  search.json
  cart.json
  page.json
  404.json
sections/
  header-group.json
  footer-group.json
  angels-header.liquid
  angels-footer.liquid
  angels-hero.liquid
  angels-categories.liquid
  angels-product-rail.liquid
  angels-heart-story.liquid
  angels-statement.liquid
  angels-brand-story.liquid
  angels-closing-cta.liquid
  angels-main-collection.liquid
  angels-main-product.liquid
  angels-main-search.liquid
  angels-main-cart.liquid
  angels-cart-drawer.liquid
snippets/
  angels-product-card.liquid
  angels-icon.liquid
  angels-price.liquid
  angels-quantity.liquid
  angels-search-drawer.liquid
assets/
  angels.css
  angels-motion.js
  angels-carousel.js
  angels-dialogs.js
  angels-cart.js
  angels-theme.js
  gsap.min.js
  ScrollTrigger.min.js
  fuentes locales
config/
  settings_schema.json
locales/
  es.default.json
```

Las plantillas JSON ordenarán las secciones. La portada podrá conservar las dos tiras de producto o cambiar sus colecciones desde el editor. El CSS no necesita depender de URLs ni de IDs del catálogo.

## 5. Migración de las animaciones

Mantener las clases y los atributos `data-reveal`, `data-image-reveal`, `data-carousel` y `data-statement-word`. Cargar GSAP y ScrollTrigger una sola vez y respetar su orden antes de inicializar los módulos. Sus fallos deben dejar accesible la tienda, como sucede ahora.

Inicializar carruseles y `animatePage(section, { home: true })` dentro de cada sección de portada, guardando sus funciones de limpieza. La entrada del header se ejecutará una sola vez; el editor podrá mostrar el hero inmediatamente para facilitar la edición. Tras cargar fuentes o imágenes, llamar a `refreshMotion()`.

El controlador del tema escuchará `shopify:section:load` para montar y `shopify:section:unload` para limpiar cada instancia; antes de sustituir HTML por AJAX hará la misma limpieza. No acumular listeners ni ScrollTriggers al reordenar secciones. Las animaciones ligadas a media queries ya usan `gsap.matchMedia()` y su `revert()`, que permiten deshacer los efectos cuando cambia la preferencia de movimiento. [Documentación de GSAP](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).

Conservar el scroll nativo y el movimiento reducido, incluyendo el cambio de preferencia mientras un menú está entrando. No reproducir la transición del hero en cada actualización del carrito.

## 6. Conectar catálogo y carrito reales

**Catálogo y ficha.** Renderizar nombre, imágenes y precio desde Liquid. Usar `product.url`, `collection.url`, filtros `image_url`/`image_tag`, `money` y escape de textos; emitir tamaños de imagen y `srcset`. Mostrar la disponibilidad de la variante seleccionada y un formulario de producto nativo. Cambiar una talla o material debe cambiar el ID de variante, la imagen, el precio y el estado de compra cuando corresponda. La búsqueda y filtros se conectarán a los recursos de Shopify y mantendrán una alternativa mediante formularios y navegación normal.

**Carrito.** Conservar el drawer visual, pero enviar el ID real de variante y cantidad a `cart/add.js`. Consultar `cart.js` y actualizar o eliminar una línea con `cart/change.js` usando su clave de línea. Construir URLs con `window.Shopify.routes.root` para respetar el idioma. Deshabilitar temporalmente el botón durante la petición y mostrar errores de existencias o red sin perder la selección.

Precios y totales se toman siempre de la respuesta de Shopify. Tras una mutación, el HTML del drawer y contador puede actualizarse con bundled section rendering. Conservar acceso a `/cart` y el checkout nativo, sin implementar pagos. Estas operaciones están documentadas en la [Cart Ajax API](https://shopify.dev/docs/api/ajax/reference/cart) y la [Section Rendering API](https://shopify.dev/docs/api/ajax/section-rendering).

Los formularios nativos deben permitir añadir y actualizar aunque una mejora JavaScript falle. No incrustar claves de Admin API en los assets del navegador.

## 7. Desarrollar sin afectar al tema publicado

1. Tras la aprobación visual, obtener acceso autorizado al tema y confirmar el dominio interno `*.myshopify.com`; no se deduce a partir de angelsjoyeria.es. Descargar una copia del tema publicado y su configuración para conservar un punto de retorno, sin editar el original.
2. Trabajar en una carpeta y repositorio propios del tema. Evaluar el tema actual y sus integraciones antes de decidir qué base conservar. Crear primero una tienda de desarrollo con un catálogo de prueba representativo.
3. Usar Shopify CLI y un tema de desarrollo; comprobar allí Liquid, animaciones, variantes y carrito. Ejemplos para esa fase, **no ejecutados en este MVP**:

   ```sh
   shopify theme dev --store TIENDA-DE-DESARROLLO.myshopify.com
   shopify theme check
   ```

4. Cuando proceda validar contra el catálogo del cliente, trabajar con un tema de desarrollo o una copia sin publicar. No modificar productos, navegación o políticas compartidos sin una revisión específica: son recursos de la tienda, no están aislados por cambiar de tema.
5. Crear un tema sin publicar para compartir una previsualización estable: `shopify theme push --unpublished --store TIENDA.myshopify.com`. Este comando será una operación autorizada de la siguiente fase; no se ha ejecutado. No usar opciones que permitan sobrescribir el tema activo.
6. Revisar escritorio y móvil, editor y recarga de secciones, todas las variantes, agotados, errores de red, carrito, idioma, imágenes, teclado y movimiento reducido. Probar pedidos y pagos solo en la tienda de desarrollo con su configuración de prueba, sin alterar el checkout del negocio.
7. Presentar la previsualización y recoger aprobación del dueño. La publicación, si se autoriza más adelante, tendrá su propia comprobación final y conservará el tema anterior para volver atrás.

Shopify documenta los temas de desarrollo como temas ocultos y temporales; una copia sin publicar permite compartir una revisión más duradera. [Shopify CLI para temas](https://shopify.dev/docs/storefronts/themes/tools/cli).

## Criterio para comenzar la integración

Diseño aprobado; productos, variantes y fotografías confirmados; copia del tema actual disponible; alcance de las apps existentes entendido; entorno de pruebas y acceso autorizados. El MVP actual está organizado para esa conversión, pero todavía no es un tema Liquid instalable.
