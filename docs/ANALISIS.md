# Dirección visual y análisis

Actualización: la decisión posterior del cliente sustituye la paleta y el wordmark descritos en este análisis inicial. La versión actual utiliza negro y dorado, y el logo real en cabecera, pie, menú y hero. Véase [CORRECCION-VISUAL.md](CORRECCION-VISUAL.md). La composición editorial y los movimientos se conservan.

## Alcance real de las referencias

La herramienta web permitió leer ambas páginas el 23 de octubre de 2026. Esta lectura verifica la organización del contenido y los controles presentes en el documento, pero no la apariencia de las páginas ni el comportamiento de las animaciones.

En [Perreo Snkrs](https://www.perreosnkrs.com/) se identificaron una barra de anuncios, navegación por categorías, búsqueda, aviso de carrito y múltiples secciones de productos con enlaces «Ver todo» y contadores de carrusel. Se adapta esa organización comercial, con encabezados de sección claros y desplazamiento horizontal con controles.

En [Reyes Boutique](https://reyesboutique07.es/) se identificaron navegación de catálogo, un artículo destacado con cantidad y acción de carrito, acceso a sus detalles y bloques por categoría. Se adapta la facilidad de pasar de fotografía a ficha y de ficha a carrito.

Se intentó abrir cada referencia en Microsoft Edge mediante Playwright para inspeccionar escritorio, móvil, menú y carruseles. Ambas devolvieron `net::ERR_NETWORK_ACCESS_DENIED`. No se atribuye a estas marcas ningún hover, transición o animación que no se haya podido observar. Los movimientos del MVP son decisiones propias basadas en el encargo.

No existe carpeta local `references`. Los informes del intento de acceso pueden regenerarse con `node scripts/inspect-references.mjs`, con Playwright y Edge disponibles.

## Material disponible

Se revisaron visualmente las once imágenes de `public/assets`, además de sus dimensiones. Las nueve fotografías de joyas tienen una anchura de 1320 o 1512 px; la imagen del establecimiento tiene 382 × 510 px y se utiliza en tamaño contenido. El logotipo tiene 1414 × 935 px.

Las fotos limpias de expositores sobre blanco admiten composiciones más grandes. Las capturas de Instagram conservan sus anotaciones originales; no se toman sus textos como certificación de materiales. El listado contiene siete referencias únicas y dos fotos adicionales de contexto, sin duplicar artículos para rellenar el catálogo.

## Dirección artística

Se toma el contraste entre los expositores negros y el brillo de las joyas como punto de partida. El burdeos aporta una voz propia y cálida sin repetir el binomio habitual de fondo beige y botones dorados. El marfil frío y los espacios blancos mantienen la lectura y dejan respirar las fotografías.

Paleta: burdeos `#561f30`, fondo `#f6f5f2`, tinta `#242322`, blanco y líneas `#dad7d2`. Cormorant Garamond para titulares, con cursivas de contraste; Manrope para navegación, precios y controles. Ambas se alojan localmente y conservan sus licencias.

La cabecera utiliza un wordmark tipográfico adaptado al espacio; el emblema original se conserva en la sección de marca. No se añade ninguna afirmación de marca registrada.

## Estructura

Anuncio → cabecera y navegación → hero asimétrico → franja de marca → categorías → carrusel de selección → composición de anillos → sección burdeos de cadenas → tienda y emblema → acceso final al catálogo → footer.

El catálogo ofrece búsqueda, filtros y orden. La ficha mantiene la fotografía completa, precio y descripción demo, cantidad, información desplegable y referencias relacionadas. El carrito permanece en un panel lateral y no introduce un checkout ficticio.

## Movimiento

1. Entrada: wordmark y navegación, etiqueta, líneas del título mediante máscaras, fotografía y controles en una única secuencia corta.
2. Scroll: títulos revelados desde su máscara; fotografías descubiertas por recorte, con distinta duración y sin ocultar toda la sección.
3. Sección burdeos: fotografía que cambia ligeramente de posición y giro; líneas de texto con desplazamientos opuestos. Sin fijar la sección ni secuestrar el scroll.
4. Productos: escala pequeña y aparición de la acción «Descubrir pieza» en escritorio; botón de añadir siempre accesible. El táctil no depende de hover.
5. Menú y carrito: entrada lateral y fondo progresivo. Los enlaces del menú entran escalonados.
6. Movimiento reducido: los contenidos se muestran de inmediato; no se crean las secuencias de entrada ni los ScrollTriggers.

## Adaptación móvil

El hero cambia de composición y coloca la foto debajo del título con un desplazamiento lateral. Las categorías forman una tira desplazable. El carrusel muestra aproximadamente una tarjeta y parte de la siguiente; el catálogo utiliza dos columnas. La cabecera concentra las categorías en un menú modal. Los paneles ocupan el ancho del dispositivo y respetan la altura dinámica de la pantalla.

## Skills

Se inspeccionaron las skills anunciadas por el entorno y los archivos `SKILL.md` de las carpetas locales de skills. No estaban disponibles las tres skills de diseño nombradas en el encargo. Se leyó y aplicó `sites/SKILL.md` y su referencia `preview/local.md`, usando el proyecto actual como trabajo local y sin publicar. No se usaron skills de generación de imágenes porque el encargo exige las fotografías reales.
