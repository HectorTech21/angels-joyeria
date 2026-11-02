# Verificación del MVP — 26 de octubre de 2026

## Entorno y alcance

La aplicación se abrió realmente con Microsoft Edge mediante Playwright, en modo headless. Se inspeccionaron capturas de portada en escritorio y móvil, catálogo, ficha, carrito y menú. Se revisó la distribución estática generada, además del servidor de desarrollo. Esta revisión incluye la corrección de identidad a negro/dorado y el logo original; véase [CORRECCION-VISUAL.md](CORRECCION-VISUAL.md).

No se ha probado en dispositivos físicos ni en Safari/WebKit. La emulación iPhone de Playwright usa Chromium y no equivale a validar Safari en un iPhone.

## Comandos comprobados

| Comprobación | Resultado |
| --- | --- |
| `npm run dev` | Inicia en `http://127.0.0.1:5173/`, mediante el servidor estático incluido. |
| `npm test` | Siete pruebas aprobadas: carrito, saneamiento, persistencia, almacenamiento bloqueado, sincronización, filtros y regresiones del router. |
| `npm run build` | Genera correctamente `dist/` como distribución estática de módulos ES. |
| `npm run preview` | Sirve `dist/` en `http://127.0.0.1:4173/`. |
| Revisión de entrada fría en desarrollo | Imágenes y logo cargados sin intervención de las pruebas en 1440 y 390 px; capturas `brand-desktop-hero.png` y `brand-mobile-hero.png`. |
| Revisión final de navegador en `dist/` | 19 grupos, incluyendo fotos cargadas antes de hacer scroll y logo original en header, footer y menú; informe `artifacts/verification-preview.json`. |
| Comprobaciones adicionales | GSAP activo, hover, arrastre de ratón, salto por teclado y botón Atrás; `artifacts/interaction-checks.json`. |
| Sintaxis de los módulos fuente | Comprobada con `node --check`. |

**Vite no está instalado.** El intento de `npm install` falla con `EACCES` al acceder al registro npm. Por ello no se ha ejecutado `npm run build:vite` ni validado bundling/minificación de Vite. El build estático de respaldo se anuncia explícitamente en consola y se ha probado en navegador; no se presenta como una compilación Vite.

## Revisión funcional

- El main se monta desde las páginas JavaScript reales al abrir la raíz, rutas compartidas y anclas frías (`#contenido`, `#seleccion` y ancla desconocida).
- El botón Atrás restaura la portada cuando la URL inicial tenía un ancla. El salto por teclado enfoca el main sin abandonar la ruta del catálogo.
- Portada: hero visible, fotografías, fuentes locales y revelados al recorrer la página.
- Ambos carruseles: flechas, teclado, progreso y gesto táctil real enviado mediante CDP. También se comprobó arrastre con ratón y que no se abra una ficha por accidente al terminarlo.
- Catálogo: siete referencias, filtros por categoría, estado vacío de pendientes, ordenación por precio y búsqueda con/sin acentos.
- Todas las fichas y las nueve fotografías originales de joyería: carga y decodificación de imágenes principales y adicionales. Fachada y logotipo se comprueban al recorrer la portada.
- Galería de producto, selección de cantidad y adición al carrito.
- Carrito: cantidades, total, eliminación, persistencia tras recarga, Escape y cierre con botón.
- Menú móvil: apertura, enlaces y cierre al navegar. Ficha, catálogo y carrito en contexto táctil.
- Los 19 destinos distintos enlazados desde shell y portada resuelven. Se comprueban además las rutas desconocidas con una página 404 útil.
- Consultas escapadas: el texto de una búsqueda no se inserta como HTML ejecutable.
- Sin errores ni avisos de consola ni recursos HTTP fallidos durante los recorridos normales en desarrollo y distribución.

## Responsive y movimiento

No se detectó desbordamiento horizontal accidental en inicio, catálogo y ficha a **320, 360, 390, 580, 768, 1024 y 1440 px**. Los carruseles y las tiras de categorías conservan su desplazamiento horizontal intencional dentro de su contenedor.

Se verificó que GSAP y ScrollTrigger están activos en el inicio normal y que el hover aumenta gradualmente la escala de la foto. Los revelados aparecen al recorrer las secciones; no se utiliza scroll bloqueado ni avance automático de los carruseles.

Con `prefers-reduced-motion: reduce`, los títulos se muestran sin transformaciones de entrada, no quedan ScrollTriggers activos y los diálogos abren y cierran inmediatamente. También se probó activar esta preferencia durante la entrada del menú: sus enlaces terminan visibles y el menú sigue cerrándose.

## Pruebas de fallo deliberado

En contextos de navegador aislados, separados del informe de consola normal:

1. Se bloqueó `gsap.min.js`: portada, menú, categoría y carrito siguieron funcionando.
2. Se bloqueó `ScrollTrigger.min.js`: la tienda siguió funcionando sin movimiento.
3. Se bloqueó el módulo `pages/home.js`: apareció el diagnóstico accesible de arranque con el botón «Volver a intentar», en lugar de un main vacío silencioso.

Los fallos de red de estos tres casos son intencionales; no se mezclan con las peticiones fallidas del recorrido normal. No hubo excepciones de la aplicación en los dos casos de librería ausente.

## Capturas

Antes del recorrido se comprueba que las fotos hayan cargado sin cambiar sus atributos desde Playwright. Las capturas completas se toman después de recorrer la página para completar las animaciones de aparición al scroll. El MVP ya no depende de la carga diferida para mostrar estas imágenes.

- [Portada escritorio](../artifacts/home-desktop.png) y [primer viewport](../artifacts/home-desktop-hero.png).
- [Portada móvil](../artifacts/home-mobile.png) y [primer viewport](../artifacts/home-mobile-hero.png).
- [Catálogo escritorio](../artifacts/catalog-desktop.png) y [catálogo móvil](../artifacts/catalog-mobile.png).
- [Ficha escritorio](../artifacts/product-desktop.png) y [ficha móvil](../artifacts/product-mobile.png).
- [Carrito escritorio](../artifacts/cart-desktop.png) y [carrito móvil](../artifacts/cart-mobile.png).
- [Menú móvil](../artifacts/menu-mobile.png).
- [Reproducción del main vacío antes de reparar](../artifacts/audit-blank-main.png).

## Límites y estado de presentación

**Preparado para presentar localmente como MVP visual y funcional.** Los datos comerciales son demo y no hay pedidos ni pagos. Pendientes carece de material fotográfico; algunas referencias agrupan varias piezas. El código todavía no es un tema Liquid instalable.

Quedan la validación visual del dueño, el catálogo real y su conversión al tema Shopify, además de revisar dispositivos físicos/Safari y el build optimizado de Vite cuando haya acceso al registro. El plan de integración está en [SHOPIFY-MIGRATION.md](SHOPIFY-MIGRATION.md).

Las referencias externas se pudieron leer con la herramienta web, pero Edge devolvió `ERR_NETWORK_ACCESS_DENIED` al abrirlas. No se ha inspeccionado visualmente su comportamiento ni se han copiado animaciones atribuyéndoles una verificación inexistente.
