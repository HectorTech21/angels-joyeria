# Reparación de imágenes — 2 de noviembre de 2026

## Causa comprobada

En `index.html:18`, el logo del header tenía `src="2/assets/logo.jpeg"`.
Edge/Playwright solicitaba `http://127.0.0.1:5173/2/assets/logo.jpeg` y recibía **404**.
El elemento quedaba con `complete: true` pero `naturalWidth: 0`.
Se corrigió a **`/assets/logo.jpeg`**. El archivo original es
`C:\Users\hector\Desktop\angels-joyeria\public\assets\logo.jpeg`:
JPEG de 1414 × 935 píxeles, proporción 1,5123:1, emblema dorado sobre negro.
Los tamaños responsive y `object-fit: contain` existentes conservan su proporción.

La auditoría inicial encontró **22 de 23 elementos de imagen cargados en la portada**.
El único roto era el logo del header. Las fotografías del hero, tarjetas, carruseles
y secciones editoriales sí cargaban en esta copia local antes de modificarla.
No se atribuye a esas fotografías un fallo que no se ha podido reproducir.
Los once originales también se decodificaron individualmente antes de la reparación.
La evidencia está en [el informe inicial](../artifacts/images-before-20261102.json)
y [su captura](../artifacts/images-before-20261102.png).

## Originales

Directorio absoluto: `C:\Users\hector\Desktop\angels-joyeria\public\assets`.
Todos los archivos se conservan sin mover, renombrar, eliminar o modificar.

| Archivo en `public/assets/` | Bytes | Dimensiones | URL pública |
| --- | ---: | --- | --- |
| `anillos.jpeg` | 452998 | 1320 × 1790 | `/assets/anillos.jpeg` |
| `cadena-cruz-oro.jpeg` | 156173 | 1320 × 1502 | `/assets/cadena-cruz-oro.jpeg` |
| `cadena-jesus.jpeg` | 278350 | 1282 × 2400 | `/assets/cadena-jesus.jpeg` |
| `cadena-oro2.jpeg` | 265151 | 1320 × 2318 | `/assets/cadena-oro2.jpeg` |
| `cadena-plata-corazon.jpeg` | 248676 | 1320 × 2245 | `/assets/cadena-plata-corazon.jpeg` |
| `cadena-pulsera-oro.jpeg` | 374873 | 1320 × 2513 | `/assets/cadena-pulsera-oro.jpeg` |
| `cadenas-oro-jesus.jpeg` | 403287 | 1320 × 2372 | `/assets/cadenas-oro-jesus.jpeg` |
| `cadenas-oro1.jpg` | 238118 | 1512 × 2016 | `/assets/cadenas-oro1.jpg` |
| `cadenas-plata1.jpg` | 315673 | 1512 × 2016 | `/assets/cadenas-plata1.jpg` |
| `logo.jpeg` | 133675 | 1414 × 935 | `/assets/logo.jpeg` |
| `tienda.png` | 340425 | 382 × 510 | `/assets/tienda.png` |

Los informes finales contienen un inventario recursivo de archivos de imagen del proyecto:
ruta absoluta y relativa, nombre, extensión y bytes. Incluye las copias en `dist/`,
las capturas en `artifacts/` y el SVG de favicon sin uso. Los ZIP de `.backups/`
se conservan como archivos históricos y no sirven imágenes a la web.
No existen `src/assets`, `src/images` ni `public/images`; las fotografías activas están en `public/assets`.

## Resultado por grupo

| Grupo | Resultado |
| --- | --- |
| Header | Ruta incorrecta con prefijo `2/`; corregida en `index.html`. |
| Footer, menú, sello del hero, bloque y página de marca | Ya utilizaban `/assets/logo.jpeg`; original comprobado en todos los usos. |
| Hero | `cadenas-oro1.jpg`: nombre y extensión correctos; carga y decodificación comprobadas. |
| Tarjetas, buscador, carrito y relacionados | Usan `imageUrl(product.image)`; los siete productos coinciden con sus archivos. |
| Galerías | `cadena-oro2.jpeg` y `cadenas-oro-jesus.jpeg`: comprobado el cambio real de fotografía al pulsar cada miniatura. |
| Editoriales | `anillos.jpeg`, `cadenas-plata1.jpg`, `tienda.png`, `logo.jpeg`: URLs y carga correctas. |
| Carruseles | Dos carruseles; carga, visibilidad y navegación comprobadas. |
| Pendientes | Estado vacío ya existente: no hay fotografía de pendientes ni se ha inventado una. |

Se buscaron referencias en HTML, CSS y JavaScript. No se encontraron diferencias de
mayúsculas, tildes, espacios o extensiones en las demás rutas. Las firmas binarias
confirman JPEG en `.jpg`/`.jpeg` y PNG en `tienda.png`. No se detectaron errores de
importación, generación dinámica de URLs o lazy loading; las imágenes ya se solicitaban
al montar las vistas.

La prueba recorre las imágenes y espera a que sus ancestros sean visibles y alcancen
opacidad ≥ 0,98 con GSAP funcionando. No modifica `src`, `loading`, estilos o preferencias
de movimiento para hacer pasar las comprobaciones. Se conserva la regla responsive
de `src/styles/responsive.css` que muestra dos tarjetas de relacionados en móvil y
oculta la tercera. Su archivo también debe cargar; el informe distingue ese elemento
de las imágenes que deben estar visibles y de los diálogos cerrados.

## Prevención

`scripts/check-assets.mjs` verifica las URLs del shell y del HTML generado por portada,
catálogo, fichas y marca, además de todas las fotografías de producto y galería.
Exige coincidencia exacta con los nombres de `public/assets`. El build ejecuta esta
comprobación antes de compilar: el error original del header impediría generar `dist/`.
Se mantiene la función centralizada `imageUrl()` de `src/data/products.js`.

Archivos de aplicación corregidos: **`index.html`** y su copia regenerada en `dist/index.html`.
Archivos de prevención y verificación: `scripts/check-assets.mjs`, `scripts/build.mjs`,
`scripts/verify-images.mjs` y los comandos de `package.json`. Documentación: este informe y `README.md`.

## Verificación final

Playwright con Microsoft Edge, escritorio 1440 × 1000 y emulación iPhone 13 de 390 × 664:

| Prueba | Desarrollo | Preview de `dist/` |
| --- | ---: | ---: |
| Originales distintos verificados | 11 | 11 |
| Vistas/estados comprobados | 53 | 53 |
| Comprobaciones de elementos de imagen | 671 | 671 |
| Imágenes rotas | 0 | 0 |
| Errores de red | 0 | 0 |

Las 1342 comprobaciones reutilizan imágenes; representan **11 archivos originales distintos**.
En cada entorno se comprueban portada, editoriales, ambos carruseles, cuatro categorías,
siete fichas, todas sus miniaturas, cuatro páginas de información, menú móvil, buscador,
carrito y recarga después de navegar. La portada inicial carga sus 23 imágenes.

Cada original supera HTTP 200, MIME de imagen, firma binaria, decodificación en el
navegador y comparación de bytes con el archivo fuente. En preview también se compara
con la copia en `dist`. Los informes incluyen dimensiones, SHA-256, resultados de
`document.images`, medidas renderizadas, ajuste CSS y respuestas de red:

- [Desarrollo](../artifacts/image-repair/dev-report.json).
- [Producción estática](../artifacts/image-repair/preview-report.json).
- [Regresión funcional](../artifacts/verification.json): pruebas existentes de carruseles,
  swipe táctil, navegación/atrás, carrito, búsqueda, tamaños 320–1440, movimiento reducido
  y recuperación sin GSAP superadas; sin errores de consola ni recursos fallidos en la revisión normal.
- Capturas nuevas en `artifacts/image-repair/`: portada completa, hero, catálogo, ficha,
  menú, buscador y carrito en escritorio/móvil, tanto en dev como en preview.
- `npm test`: 7 pruebas superadas.

Para repetir, iniciar `npm run dev` y ejecutar `npm run test:images` o `npm run test:browser`.
Para producción, iniciar `npm run preview` y ejecutar en PowerShell:

```powershell
$env:TEST_URL = 'http://127.0.0.1:4173'
npm run test:images
```

## Build y alcance

**`npm run build` termina correctamente**: valida los 11 recursos y genera `dist/`.
Vite está declarado pero no instalado. Se intentó instalar con npm; el acceso a
`https://registry.npmjs.org/vite` falló con `EACCES`. El build y los servidores usan
el respaldo estático explícito ya incluido en el proyecto. La distribución estática
de producción está probada por HTTP con `npm run preview`. El bundling y la optimización
de Vite quedan sin ejecutar por esa limitación del entorno.

No se cambiaron CSS, tipografías, colores, distribución, animaciones GSAP ni originales.
No se añadieron placeholders ni fotografías externas. Esta validación corresponde
al proyecto local y a `dist/`; no se ha desplegado una web externa.
