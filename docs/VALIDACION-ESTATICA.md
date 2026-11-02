# Validación de la migración

La aplicación original pasó la batería funcional antes de modificar sus archivos. Se guardaron referencias de escritorio y móvil. La web estática se comprobó con Microsoft Edge headless mediante Playwright 1.64.1.

## Resultados funcionales

- Siete tests de router, búsqueda y store interno de carrito: todos correctos. El carrito sigue desconectado de la interfaz pública.
- Homepage, header, logos, hero, secciones editoriales y dos carruseles: correctos.
- Catálogo de siete referencias; filtros de anillos, pulseras y collares; ordenación alfabética y búsqueda con y sin tildes: correctos.
- Las siete fichas, ambas galerías con fotos adicionales y páginas informativas: correctas.
- Navegación por header, productos, menú móvil, atrás del navegador, entrada por anclas y recarga de hashes: correcta.
- Los 17 destinos públicos distintos se abrieron y recargaron conservando la vista.
- Carruseles mediante botones, teclado y desplazamiento táctil real emulado: correctos.
- Responsive a 320, 360, 390, 580, 768, 1024 y 1440 px: sin desbordamiento horizontal.
- GSAP, ScrollTrigger, revelados, diálogos, movimiento reducido y diagnóstico de módulos interrumpidos: correctos.
- Imágenes: **47 vistas, 611 comprobaciones, 11 originales, cero imágenes rotas y cero errores de red**. Se verificaron HTTP, MIME, firma JPEG/PNG, decodificación e igualdad binaria con los archivos locales.
- Cero errores o advertencias de consola y cero solicitudes fallidas en la batería funcional normal.

## Servidores comprobados

1. HTTP estático `tests/serve.mjs`, puerto 5502: sirve los archivos existentes sin remapear `public`, sin fallback SPA y sin build. Baterías funcional y de imágenes completas.
2. Motor real de la extensión instalada `ritwickdey.liveserver` 5.7.10, arrancado por API en el puerto 5503: **30 vistas de escritorio/móvil con acceso por `index.html`, recargas, fuentes, GSAP, imágenes, navegación y búsqueda**. No se automatizó el botón de VS Code; se ejecutó el servidor que utiliza la extensión.
3. Copia aislada con solo los archivos publicables, sin `package.json`, `node_modules`, `public` ni `dist`, servida en `/angels-joyeria/`: la misma batería de hosting verifica rutas relativas y recargas dentro de una subcarpeta.

No se ha desplegado en Vercel. Se contrastó su configuración con la documentación oficial; no se alteraron dominios ni ajustes remotos.

## Conservación y evidencias

La comparación final de **17 pares de capturas dio cero píxeles diferentes**: inicio completo, hero, catálogo, categoría, ficha, marca, búsqueda y menú móvil. También coincidieron los parámetros de GSAP/ScrollTrigger y el estado final del hero animado. Se revisaron visualmente las capturas de escritorio y móvil. Las primeras capturas mostraron variaciones de decodificación y remuestreo; se repitió la comparación esperando `image.decode()` y con renderizado por software y perfil sRGB, sin modificar la aplicación.

`tests/qa/verify-static.mjs` comprueba 63 referencias, configuración de Vercel, ausencia de arquitectura obsoleta, los 23 recursos públicos idénticos y los 27 archivos originales de la aplicación. Solo admite los cambios de rutas y comentarios documentados. También verifica que el `dist` original usado como referencia coincidía con los fuentes y recalcula los hashes de los 1.048 archivos del respaldo.

- `artifacts/static-migration/before/`: capturas previas al traslado y parámetros de movimiento originales.
- `artifacts/static-migration/after/`: primera captura de la web estática.
- `artifacts/static-migration/before-stable/` y `after-stable/`: pares tras esperar la decodificación de imágenes y estabilizar el renderizado. La referencia se sirve desde el `dist` del respaldo, contrastado con los fuentes originales.
- `artifacts/static-migration/visual-comparison.json`: comparación de píxeles y parámetros GSAP/ScrollTrigger.
- `artifacts/static-migration/images/static-report.json`: imágenes y HTTP.
- `artifacts/static-migration/live-server.json`: Live Server.
- `artifacts/static-migration/isolated-subdirectory.json` y `deployment-report.json`: copia aislada sin build.
- `artifacts/static-migration/architecture-report.json`: conservación de archivos y respaldo.
- `artifacts/verification.json`: batería funcional completa del servidor estático.

## Repetir pruebas opcionales

Son herramientas de mantenimiento; **no se ejecutan para abrir o publicar la web**. Playwright está aislado en `tests/`. En otra máquina, si falta, se puede instalar con `npm --prefix tests ci`. Edge debe estar disponible, o se puede elegir un canal compatible con `BROWSER_CHANNEL`.

Desde la raíz, comprobaciones sin navegador:

```powershell
node --test tests/*.test.mjs
node tests/qa/check-assets.mjs
node tests/qa/verify-static.mjs
```

Servidor opcional para QA, en otra terminal:

```powershell
node tests/serve.mjs
```

Después, desde la raíz:

```powershell
node tests/qa/verify-browser.mjs
node tests/qa/verify-images.mjs
node tests/qa/verify-deployment.mjs
```

Para otro servidor, definir `TEST_URL` sin barra final. `verify-hosting.mjs` usa por defecto `http://127.0.0.1:5503` y añade `/index.html`; el resto usa el puerto 5502.

Verificación adicional del respaldo:

```powershell
$env:MIGRATION_BACKUP = '.backups/static-migration-2026-11-02T18-46-34-233Z'
node tests/qa/verify-static.mjs
```

Para repetir capturas, el servidor original debe estar disponible; definir `TEST_URL` y `SNAPSHOT_LABEL=before-stable`. Repetir contra el sitio estático con `SNAPSHOT_LABEL=after-stable` y ejecutar `node tests/qa/compare-visual.mjs`. Exige iguales dimensiones y parámetros de movimiento; solo admite redondeos de hasta 1/255 por canal. Las capturas de composición usan movimiento reducido; `hero-animated` se captura con animaciones activadas y terminadas.
