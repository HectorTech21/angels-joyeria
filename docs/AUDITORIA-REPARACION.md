# Auditoría y reparación del MVP

Este informe conserva el estado de la primera reparación. La posterior corrección de marca e imágenes está documentada en [CORRECCION-VISUAL.md](CORRECCION-VISUAL.md); la paleta vigente es negro y dorado, con el logo original integrado en la navegación.

Revisión del 26 de octubre de 2026 sobre la carpeta existente. No se ha empezado otro proyecto ni modificado la tienda Shopify.

## Estado inicial y protección

No existe repositorio `.git` en esta carpeta. Antes de editar se guardaron `src`, `public`, `scripts`, `tests`, `docs`, HTML y configuración en `.backups/angels-before-repair-20261026.zip` (3.352.560 bytes). La copia conserva el código anterior; no contiene dependencias ni cachés. Se añadió `.backups/` al listado de exclusiones para un futuro repositorio.

Se revisaron los archivos fuente, las entradas HTML/JS/CSS, configuración, dependencias, servidor, build, rutas, componentes, pruebas, documentación y recursos. No se detectaron archivos fuente truncados ni una corrupción de caracteres visible en el navegador. Los acentos están correctamente codificados en UTF-8; la salida inicial de PowerShell los representaba mal si no se indicaba la codificación.

## Estructura encontrada

| Carpeta/archivo | Función y estado inicial |
| --- | --- |
| `index.html` | Shell con anuncio, cabecera, `<main id="contenido">`, footer y diálogos; entrada ES module. |
| `src/main.js` | Renderizado por `innerHTML` de páginas JS y navegación mediante hash. |
| `src/pages/` | Portada, catálogo, ficha e información; su implementación ya existía. |
| `src/components/` | Tarjetas, iconos, búsqueda, carrito, diálogos y controlador de carruseles. |
| `src/data/products.js` | Siete referencias demo; datos separados de las vistas. |
| `src/lib/` | Estado de carrito, escape de consultas y animación. |
| `src/styles.css` | CSS completo con responsive; inicialmente concentrado en un único archivo. |
| `public/assets/` | Once imágenes locales: nueve fotografías de joyas, fachada y emblema. |
| `public/fonts/` | Manrope y Cormorant Garamond locales, con licencias. |
| `public/vendor/` | GSAP y ScrollTrigger 3.15.0 locales, con avisos de licencia. |
| `package.json`, `vite.config.js` | Vite declarado pero ausente; Playwright disponible. No había lockfile. |
| `scripts/` | Desarrollo/build con alternativa estática y comprobaciones de navegador. |
| `tests/`, `artifacts/` | Pruebas de carrito y resultados antiguos, que se han vuelto a comprobar. |
| `dist/` | Distribución anterior; se ha regenerado desde el código reparado. |
| `.cache/` | Dependencias y utilidades de la sesión anterior; no se usan como fuente de la aplicación. |

## Por qué podía verse solo el header y el footer

La portada no faltaba: en una visita normal a `/` o `/#/`, el JavaScript insertaba las ocho secciones originales en el main. El elemento vacío en el HTML es intencional en este prototipo con renderizado por JavaScript.

Se reprodujeron dos fallos independientes en Edge mediante Playwright:

1. **Ancla al abrir un documento nuevo.** El router contenía `if (!hash.startsWith('/')) return;`. Una entrada directa a `/#contenido` o `/#seleccion` dejaba el main con **cero elementos y cero píxeles de altura**, sin error de consola. El resto del shell sí aparecía. `artifacts/audit-blank-main.png` conserva la reproducción anterior a la reparación.
2. **Fallo de una librería de movimiento.** Al bloquear expresamente `vendor/gsap.min.js`, `motion.js` ejecutaba `gsap.registerPlugin(...)` sobre `undefined`. La excepción se producía durante la evaluación de imports, antes de ejecutar `render()`. El main volvía a quedar vacío. También había llamadas sin protección a `ScrollTrigger.refresh()`.

No se ha recibido la captura original ni un registro de su URL/consola. Por tanto, no se puede atribuir con certeza aquel incidente concreto al apagado o a uno de estos dos casos; sí se ha reproducido exactamente el síntoma y corregido ambas causas verificadas. No se encontró un estilo que ocultase permanentemente todo el main.

## Reparaciones

- `src/lib/router.js` diferencia rutas y anclas. Las anclas resuelven una portada montable al cargar por primera vez y conservan la portada si ya está montada. Volver desde otra ruta a una URL inicial con ancla restaura la portada. El enlace de salto enfoca el main conservando la ruta actual.
- GSAP y ScrollTrigger son mejoras opcionales para la navegación. Si falta cualquiera, portada, catálogo, búsqueda, menú y carrito siguen funcionando sin las animaciones.
- `refreshMotion()` centraliza el refresco seguro. `gsap.matchMedia()` devuelve un ciclo de limpieza por contenedor y elimina sus efectos al cambiar la preferencia de movimiento.
- `src/bootstrap.js` captura un fallo de importación y muestra un diagnóstico con reintento. No sustituye la portada por una copia estática: el contenido real se sigue generando desde las páginas y los datos.
- Los paneles evitan animar listas de enlaces vacías y reaccionan a movimiento reducido durante su entrada.
- El carrusel libera el arrastre al cancelar el puntero o perder el foco de la ventana; mantiene desplazamiento nativo táctil y limpieza al cambiar de página.

## Finalización y preparación del diseño

Se ha preservado la dirección burdeos/marfil, los titulares editoriales, la fotografía real y los módulos existentes. Se añadió una segunda selección horizontal de collares mediante `product-rail.js`, con configuración editorial en `merchandising.js`. Ambas secciones reutilizan las mismas referencias, sin inventar productos para rellenar el catálogo.

El CSS queda separado en base, shell, portada, comercio, diálogos, responsive y movimiento. Los recortes de las tarjetas se declaran en los datos y variables CSS; se eliminó el selector que dependía de una URL concreta. Se aumentó el tamaño de textos importantes y controles de producto en móvil. No se añadieron librerías ni servicios externos.

El MVP conserva buscador, filtros, orden, siete fichas, galería, cantidad, relacionados, carrito con persistencia local y páginas informativas. Pendientes conserva un estado vacío explícito porque no hay fotografías de esa categoría. No hay pagos ni administración propia.

## Movimiento

Secuencia inicial de cabecera y hero; tipografía que entra mediante máscaras; fotografía revelada por recorte y escala contenida; sello con entrada breve; revelados al scroll de títulos e imágenes; aparición escalonada de tarjetas; composición burdeos con desplazamiento y giro asociados al scroll; paneles laterales y menú escalonado; hover en fotografías, enlaces y botones. No se fija el scroll ni se bloquea la lectura esperando una animación.

Los efectos se eliminan con `prefers-reduced-motion`. Los carruseles permanecen manuales: flechas, teclado, ratón y gesto táctil. El usuario conserva el control de la navegación.

## Dependencias y build

`npm run dev` funciona mediante el servidor local existente. `npm run build` genera una distribución estática de módulos ES en `dist/`. El intento de instalar dependencias volvió a fallar al acceder a `registry.npmjs.org/vite` con `EACCES`; no se ha ejecutado Vite ni afirmado que su bundling esté validado. El respaldo anuncia expresamente este límite.

La distribución no depende de un framework ni del router de Vite y puede previsualizarse con `npm run preview`. Al disponer de acceso al registro, instalar dependencias y ejecutar `npm run build:vite` permitirá validar también la optimización opcional de Vite. Esta limitación no impide presentar la versión estática comprobada.

Los resultados actuales, capturas y límites de dispositivo constan en [VALIDACION.md](VALIDACION.md). El plan completo de conversión a tema está en [SHOPIFY-MIGRATION.md](SHOPIFY-MIGRATION.md).
