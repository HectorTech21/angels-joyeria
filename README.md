# Angels Joyería

Presentación de la selección de Angels Joyería, preparada para compartir mediante un alojamiento estático. Conserva el diseño editorial, negro y dorado, el logotipo original, las fotografías, fuentes locales y animaciones GSAP.

La interfaz permite explorar fotografías, categorías y fichas. No muestra precios, cantidades ni carrito y no permite comprar, pagar ni reservar. Los nombres son descripciones de las fotografías, no denominaciones comerciales verificadas. No se han añadido canales de contacto, promociones, existencias ni condiciones comerciales.

## Desarrollo y producción local

Requisito: Node.js 22 o superior y npm.

```sh
npm ci --omit=dev
npm run dev
```

Abrir http://127.0.0.1:5173/. El servidor incluido sirve los módulos ES directamente; hay que recargar el navegador después de editar. No abrir index.html como archivo local.

Para revisar la distribución:

```sh
npm test
npm run build
npm run preview
```

Abrir http://127.0.0.1:4173/. El build comprueba las rutas de imágenes, regenera dist, copia public íntegro y src, y verifica las referencias HTML/JS/CSS y la igualdad binaria de los recursos originales.

## Sistema de build real

Node.js + módulos ES nativos del navegador. No utiliza Vite, no ejecuta bundling y no necesita dependencias de compilación. Se ha eliminado la selección automática que antes cambiaba a Vite al encontrarlo instalado, junto con sus scripts, configuración y dependencia. Así, desarrollo y producción usan los mismos módulos y estilos.

Playwright es la única dependencia de desarrollo, fijada en package.json y package-lock.json. Solo se necesita para las comprobaciones de navegador; no forma parte de la web publicada.

## Configuración de Vercel

| Ajuste | Valor |
| --- | --- |
| Framework Preset | Other |
| Root Directory | La carpeta que contiene package.json |
| Install Command | npm ci --omit=dev |
| Build Command | npm run build |
| Output Directory | dist |
| Node.js | Una versión disponible de 22 o superior |
| Variables de entorno | Ninguna |

Activar Override en los comandos y en Output Directory si la interfaz de Vercel muestra otros valores. No servir public directamente: el punto de entrada está en dist/index.html tras el build. [Referencia oficial de configuración](https://vercel.com/docs/builds/configure-a-build).

Las rutas mantienen el formato hash: /#/, /#/catalogo, /#/catalogo?categoria=anillos, /#/producto/corazon y /#/informacion/seleccion. El fragmento se resuelve en el navegador y cada entrada HTTP carga /. Por eso no hace falta vercel.json ni una reescritura SPA. Las rutas /producto/corazon sin # no son rutas de esta versión.

No se ha publicado nada ni cambiado dominios. Esta carpeta no tiene repositorio Git inicializado. Para importar desde Git en Vercel, habrá que subir los fuentes a un repositorio cuando se autorice el despliegue. Incluir index.html, package.json, package-lock.json, src/, scripts/ y public/ completos; dist se regenera y no necesita versionarse. .vercelignore excluye cachés, capturas y copias locales al usar la CLI. No subir credenciales ni archivos .env.

## Comprobaciones

```sh
npm test
npm run check:assets
npm run build
npm run check:dist
npm run test:clean
```

La última orden crea una copia aislada en artifacts/ sin node_modules ni dist, instala con npm ci --omit=dev, pasa los tests, genera la distribución y la compara byte a byte con dist local.

Para navegador, instalar también las dependencias de desarrollo:

```sh
npm ci
npm run test:browser
npm run test:images
```

Estos scripts usan Playwright y Microsoft Edge headless de forma predeterminada. Si no existe Edge, instalar un navegador de Playwright y adaptar BROWSER_CHANNEL al entorno. Debe estar levantado npm run dev. Para probar producción, arrancar npm run preview y ejecutar en PowerShell:

```powershell
$env:TEST_URL = 'http://127.0.0.1:4173'
npm run test:browser
npm run test:images
```

Los informes y capturas se guardan en artifacts/. La auditoría comprueba recursos, consola, responsive, galerías, animaciones, menús, búsqueda, enlaces y recargas directas de las rutas hash.

## Preparación para Shopify

Los componentes visuales, datos editoriales, estilos, carruseles y animaciones siguen separados. El componente de carrito y su store permanecen en el código con sus tests, desconectados de la aplicación y sin interfaz montada. Sus importes de ejemplo solo sirven para esos tests internos: no se muestran y no deben importarse en Shopify.

Para vender habrá que confirmar catálogo, nombres oficiales, materiales, variantes, precios, disponibilidad, fotografías individuales, contacto y textos legales/comerciales. Después se adaptarán las vistas a Liquid y se conectarán catálogo, carrito y checkout reales de Shopify. El proyecto todavía no es un tema Shopify instalable.

[Informe de presentación y Vercel](docs/VERCEL-PRESENTACION.md). [Plan de migración](docs/SHOPIFY-MIGRATION.md). Los demás informes de docs describen revisiones anteriores; sus menciones a MVP, Vite y carrito demo son documentación histórica.
