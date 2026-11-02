# Presentación de Angels Joyería y preparación para Vercel

Revisión: 2 de noviembre de 2026. Cambios aplicados en el proyecto local. No se ha publicado la web, accedido a Shopify ni cambiado dominios.

## Experiencia pública

- Retiradas las etiquetas MVP, tienda demo, demostración, prototipo, nombres/precios demo y descripción provisional de la barra superior, footer, catálogo, tarjetas, fichas, buscador y metadatos.
- Sustituidas las páginas técnicas públicas por contenido de marca, una explicación de la selección y una descripción del funcionamiento de la privacidad. Las antiguas rutas de información `demo` y `compra` muestran ahora la información sobre la selección, para conservar enlaces anteriores.
- Precios ocultos en todas las vistas. Ordenación comercial por precio sustituida por orden alfabético, con validación de los parámetros de URL.
- Eliminados del shell el carrito, su contador y su diálogo. El módulo del carrito no se importa ni inicializa. No se lee ni escribe su almacenamiento desde la aplicación pública.
- Retirados añadir al carrito, selección de cantidades, totales y acciones de compra. Las tarjetas y fichas llevan a fotografías, categorías y páginas existentes.
- No se ha creado una consulta de disponibilidad: no consta un canal de contacto validado en el código. No se ha convertido en enlace ningún dato incrustado en las fotografías originales.
- Nombres descriptivos de lo fotografiado, sin inventar referencias comerciales. Las imágenes agrupadas se explican como composiciones, sin atribuirles venta conjunta, materiales, variantes ni existencias.
- La categoría sin material de pendientes deja de anunciarse en navegación, filtros y footer. Su espacio editorial en portada conduce al catálogo completo.

## Acabado visual

Se conservan colores, logotipo, fotografías originales, fuentes locales, composición del hero, estructura editorial, ambos carruseles, animaciones GSAP y microinteracciones.

Se han ajustado la disposición y separación de los enlaces de exploración de las fichas, los nombres largos, el enlace de productos relacionados y el nuevo enlace del footer. Los iconos de añadir se han sustituido por flechas de descubrimiento. Se ha corregido la restauración del texto alternativo al volver a la primera imagen de una galería, que antes dependía del formulario de compra.

La descripción del navegador ya no anuncia una tienda de demostración. Las páginas informativas tienen títulos propios con la marca. Se han añadido metadatos Open Graph de título, descripción, idioma y tipo, sin inventar URL canónica o dominio. Se conserva el favicon basado en el logotipo original, cuya ruta queda incluida en la verificación de distribución.

## Auditoría y build definitivo

Al comenzar, `npm ls --depth=0` mostraba Vite ausente y Playwright 1.64.1 instalado. `npm run build` terminaba mediante la alternativa estática; su comportamiento habría cambiado si Vite estuviera instalado. No había package-lock.json ni repositorio Git.

El proceso definitivo es estático, mediante Node.js y módulos ES nativos. Se han retirado la dependencia, configuración y scripts opcionales de Vite. El build ya no cambia según el contenido de node_modules. No realiza bundling ni minificación; la compresión HTTP corresponde al alojamiento.

`npm run build`:

1. Comprueba las referencias de imágenes renderizadas y sus nombres exactos, sensibles a mayúsculas.
2. Regenera exclusivamente la carpeta dist del proyecto.
3. Copia public íntegro, src e index.html.
4. Comprueba los 23 archivos de public byte a byte en dist y verifica las referencias HTML, módulos JS y dependencias CSS.

La distribución contiene index.html, assets (11 originales), fonts (fuentes y licencias), vendor (GSAP y ScrollTrigger), favicon.svg auxiliar y src (módulos y estilos). La página utiliza el logo original como favicon; el SVG auxiliar no está enlazado.

El componente y store del carrito permanecen como código desconectado, junto con sus pruebas. Los importes históricos del catálogo solo se conservan para esas pruebas; no se renderizan. Al convertir a Shopify deben sustituirse los datos completos y la lógica comercial por los recursos auténticos.

`package-lock.json` fija Playwright, la única dependencia de desarrollo. La generación de la web y los tests de Node no necesitan paquetes de terceros. Se ha comprobado con una copia aislada, sin dist ni node_modules, ejecutando `npm ci --omit=dev`, `npm test` y `npm run build`: la distribución coincide byte a byte con la local. El informe está en `artifacts/clean-build-report.json`.

## Configuración exacta de Vercel

| Campo | Valor |
| --- | --- |
| Framework Preset | Other |
| Root Directory | Carpeta que contiene package.json |
| Install Command | npm ci --omit=dev |
| Build Command | npm run build |
| Output Directory | dist |
| Node.js | Versión disponible de 22 o superior |
| Variables de entorno | Ninguna |

Usar Override para los valores anteriores cuando corresponda. La salida que debe servirse es dist, no public. Referencia: [configuración oficial de builds de Vercel](https://vercel.com/docs/builds/configure-a-build).

No se necesita vercel.json: las rutas son hash (`/#/catalogo`, `/#/producto/corazon`), de modo que una recarga o entrada directa solicita `/` al servidor. Las rutas sin hash no son rutas de esta aplicación. No se ha añadido una reescritura general que pudiera ocultar errores 404 de recursos.

Para despliegue desde Git se necesitan los fuentes del proyecto en un repositorio; actualmente no está inicializado. Deben incluirse public, src, scripts, index.html, package.json y package-lock.json. El build limpio demuestra que no hacen falta cachés ni archivos ignorados. `.vercelignore` excluye artefactos, copias, cachés y archivos de entorno al desplegar con CLI. `.gitignore` también excluye archivos de entorno. No se han añadido secretos ni credenciales.

## Verificación y alcance

- `npm test`: siete pruebas internas de carrito, catálogo y router superadas.
- Build y comprobación de distribución correctos.
- Instalación limpia de producción y comparación binaria correctas.
- Playwright con Microsoft Edge headless en desarrollo y preview de producción, escritorio e iPhone 13 emulado.
- Las auditorías de imágenes de cada entorno recorren 47 vistas y realizan 611 comprobaciones: 11 originales, cero imágenes rotas y cero errores de recursos.
- Pruebas funcionales de fotografías, logo, carruseles mediante botones, teclado y gesto táctil, búsqueda, filtros, ordenación, galerías, menú móvil, Escape, movimiento reducido y recuperación ante fallos de GSAP/ScrollTrigger o módulos.
- Verificación de ausencia de precios, controles de compra y etiquetas técnicas en las vistas públicas, incluidas rutas informativas antiguas.
- Sin desbordamiento horizontal en portada, catálogo y ficha a 320, 360, 390, 580, 768, 1024 y 1440 píxeles.
- Recorrido de todos los destinos de enlace descubiertos y recargas directas de las rutas hash en producción.

Informes: `artifacts/verification.json`, `artifacts/image-repair/dev-report.json`, `artifacts/image-repair/preview-report.json`. Capturas en artifacts y artifacts/image-repair. Son archivos locales ignorados, sin dependencia para publicar.

La revisión verifica el alojamiento estático local de dist. No se ha comprobado una URL real de Vercel porque no se ha autorizado la publicación. La emulación móvil comprueba diseño y tacto con Chromium; no sustituye una prueba en Safari de un iPhone físico.

## Antes de una tienda Shopify real

Confirmar productos y nombres oficiales, variantes, materiales, fotografías por producto, precios, inventario, contacto y contenido legal/comercial. Convertir las vistas a plantillas y secciones Liquid, adaptar assets y editor del tema, y conectar catálogo, carrito y checkout nativos. No reutilizar precios de ejemplo ni tomar las agrupaciones fotográficas como productos vendibles. No es todavía un tema instalable ni una tienda que acepte pedidos. El plan técnico previo sigue en SHOPIFY-MIGRATION.md.
