# Auditoría y migración estática

Fecha: 2 de noviembre de 2026.

## Estado anterior, comprobado antes de modificar la aplicación

- `package.json` utilizaba Node >=22 y scripts propios `dev`, `build` y `preview`. La única dependencia era Playwright 1.64.1 para pruebas. No había Vite, React, Next ni Webpack instalados, ni `vite.config.js`.
- Un único `index.html` montaba las vistas con `src/bootstrap.js` y `src/main.js`. Los imports ya eran módulos ES relativos. No se usaban `import.meta.env`, `import.meta.glob` ni imports npm en el navegador.
- La navegación ya usaba hashes. Buscador, filtros, ordenación, fichas y galerías se renderizaban en el navegador.
- `src/styles.css` importaba siete hojas CSS con diseño, responsive, transiciones y hovers. Las siete fuentes WOFF2 estaban en `public/fonts/`.
- `public/assets/` contenía 11 archivos: nueve fotografías de joyas, `logo.jpeg` y `tienda.png`. Los iconos se generaban como SVG desde el módulo de iconos.
- GSAP y ScrollTrigger 3.15.0 estaban en `public/vendor/`. Los carruseles utilizaban scroll, snapping, puntero, teclado y gestos nativos. No había otra librería de carruseles que sustituir.
- El servidor remapeaba `/assets`, `/fonts` y `/vendor` a `public/`. Live Server sirve la carpeta real y no hacía ese remapeo: esa era la causa de las imágenes rotas.
- El build comprobaba imágenes y copiaba `public/`, `src/` e `index.html` a `dist/`. No transpilaba ni minificaba. La configuración documentada de Vercel exigía instalar y generar `dist`.
- No existía `.vercel/` ni configuración local que permitiera comprobar los ajustes remotos de Vercel. No se accedió ni modificó ningún proyecto remoto.

## Respaldo

Antes de cambiar el código se copió el árbol completo a `.backups/static-migration-2026-11-02T18-46-34-233Z/original/`, excluyendo únicamente el nuevo directorio del propio respaldo para evitar recursión. Son 1.048 archivos y 110.266.677 bytes. Se comparó cada copia byte a byte y se registró su SHA-256 en `manifest.json`. También incluye los respaldos anteriores.

Para recuperar el estado previo, copia `original/` a una carpeta vacía y consulta su README. Evita mezclar su `.git/` con otro repositorio. El respaldo se conserva íntegro; los archivos retirados después están en un directorio independiente.

## Cambios realizados

| Antes | Ahora |
| --- | --- |
| JavaScript de `src/` | `js/`, con la misma organización |
| `src/styles.css`, `src/styles/` | `css/styles.css`, `css/styles/` |
| `public/assets/` | `assets/` |
| `public/fonts/` | `fonts/` |
| `public/vendor/` | `vendor/` |
| `public/favicon.svg` | `favicon.svg` |
| Recursos con rutas desde `/` | Rutas relativas al documento o CSS |
| npm y copia a dist para publicar | Publicación directa de la raíz |
| Scripts y dependencias de prueba en la raíz | Herramientas opcionales en `tests/` |

En la aplicación solo cambiaron las rutas del documento, `imageUrl`, la ruta del logo de la página de marca, las rutas de fuentes de `base.css` y un comentario del router. No se modificaron selectores, valores de diseño, dimensiones, tipografías, textos visibles, datos editoriales, navegación ni implementación del movimiento.

Imágenes, fuentes, licencias y librerías permanecen idénticas byte a byte. No se generaron ni sustituyeron fotografías. GSAP y ScrollTrigger siguen siendo locales y de la misma versión.

Después de validar el sitio se retiraron del árbol activo `dist/`, el `public/` vacío, los scripts antiguos, los manifiestos npm de la raíz, la caché y la documentación obsoleta. Se trasladaron a `.backups/retired-static-20261102/`. No existe una segunda entrada activa. Las evidencias de pruebas quedan en `artifacts/`, excluido de publicación.

`vercel.json` desactiva framework, instalación y build y publica `.`. No se necesita reescritura porque se conservan los hashes. `.vercelignore` excluye pruebas, documentación, respaldos y capturas.
