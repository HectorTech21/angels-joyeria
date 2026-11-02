# Angels Joyería

La misma web editorial servida directamente como HTML, CSS y JavaScript. No necesita Vite, npm, compilación, `dist/` ni backend. Conserva el logotipo, las fotografías, los estilos, las fuentes locales, los carruseles y las animaciones originales.

## Abrir con Go Live

1. Abre esta carpeta `angels-joyeria` en Visual Studio Code.
2. Abre **`index.html` de la raíz**.
3. Pulsa **Go Live** en la extensión Live Server.
4. Explora la web en la dirección que abra la extensión. La configuración local existente usa el puerto 5501.

No hace falta abrir una terminal ni instalar paquetes. La web usa módulos ES mediante `<script type="module">` y necesita un servidor HTTP estático como Live Server; el doble clic con `file://` no es el modo de apertura.

## Estructura activa

```text
index.html                 Entrada, header, footer y diálogos
css/styles.css             Entrada de estilos
css/styles/                Siete hojas originales por sección y responsive
js/bootstrap.js            Inicio y diagnóstico de carga
js/main.js                 Renderizado y coordinación
js/pages/                  Inicio, catálogo, fichas e información
js/components/             Carruseles, tarjetas, buscador, iconos y diálogos
js/data/                   Productos y selecciones editoriales
js/lib/                    Router, GSAP y utilidades
assets/                    Las 11 imágenes originales
fonts/                     Manrope y Cormorant Garamond, con licencias
vendor/                    GSAP 3.15.0 y ScrollTrigger 3.15.0 locales
vercel.json                Publicación sin instalación ni build
tests/                     Herramientas opcionales de verificación
docs/                      Informes de migración y pruebas
.backups/                  Respaldo y archivos retirados; no publicar
artifacts/                 Capturas e informes locales; no publicar
```

El logo está en `assets/logo.jpeg`. Todas las fotografías conservan sus nombres. HTML y vistas usan `./assets/...`; las fuentes se resuelven con `../../fonts/...` desde `css/styles/base.css`. Los imports JavaScript son relativos y tienen extensión `.js`. La web no importa paquetes npm.

GSAP y ScrollTrigger se cargan desde `vendor/` antes del módulo de entrada. No dependen de CDN ni de conexión externa. Se conserva el código de animaciones, diálogos y carruseles.

## Navegación

Se mantiene el router con hashes existente:

- `/#/`
- `/#/catalogo`
- `/#/catalogo?categoria=anillos`
- `/#/producto/corazon`
- `/#/informacion/marca`

También funciona desde `index.html#/...` y dentro de una subcarpeta. Cada recarga solicita el documento HTML existente; no se necesitan reescrituras SPA. Conserva el `#` al compartir categorías y fichas.

La web permite explorar, filtrar, buscar y ver fotografías. La compra online ya estaba deshabilitada y mantiene ese comportamiento. El componente interno de carrito y sus tests siguen desconectados de la interfaz pública.

## Vercel, sin compilación

No se ha publicado el proyecto ni se han cambiado dominios. Para importar el repositorio o revisar un proyecto existente:

| Ajuste | Valor exacto |
| --- | --- |
| Framework Preset | **Other** |
| Root Directory | La carpeta de este `index.html`; `./` si es la raíz del repositorio |
| Install Command | Override activado, campo **vacío** |
| Build Command | Override activado, campo **vacío** |
| Output Directory | Override activado: **`.`** |
| Variables de entorno | Ninguna |

`vercel.json` fija `framework: null`, `installCommand: ""`, `buildCommand: ""` y `outputDirectory: "."`, evitando comandos anteriores. No selecciones `tests/`, `public/` ni `dist/` como raíz o salida.

Publica `index.html`, `css/`, `js/`, `assets/`, `fonts/`, `vendor/`, `favicon.svg` y `vercel.json`. Incluye `.vercelignore` para las exclusiones al subir con CLI. `.gitignore` excluye respaldos, capturas y dependencias de pruebas del repositorio.

Configuración contrastada con la documentación oficial: [omitir el build y servir la raíz](https://vercel.com/docs/builds/configure-a-build), [propiedades de vercel.json](https://vercel.com/docs/project-configuration/vercel-json).

## Respaldo y pruebas

El respaldo completo anterior a la migración está en `.backups/static-migration-2026-11-02T18-46-34-233Z/`. Contiene `original/` con los 1.048 archivos anteriores, incluidos Git, dependencias, distribución, capturas y respaldos previos. `manifest.json` registra tamaño y SHA-256. Se verificó al crearlo y después de migrar. No se ha sobrescrito ni borrado.

Los archivos obsoletos y documentación anterior se trasladaron a `.backups/retired-static-20261102/`. Playwright está aislado en `tests/`; no es una dependencia de la web ni del despliegue.

[Auditoría y decisiones](docs/MIGRACION-ESTATICA.md). [Pruebas y evidencias](docs/VALIDACION-ESTATICA.md).
