# Corrección de imágenes y marca

Revisión del 26 de octubre de 2026. Se conserva el proyecto existente, su composición, páginas, tipografías y animaciones. Copia anterior a esta intervención: `.backups/angels-before-brand-correction-20261026.zip`.

## Imágenes: comprobación real

La carpeta correcta es **`public/assets`**, no `public/images`. Sus archivos se solicitan con **`/assets/nombre.ext`**, tanto en Vite como en el servidor estático incluido. No se encontró ninguna referencia a un archivo inexistente, error de mayúsculas/minúsculas, extensión falsa ni respuesta 404 entre los once originales.

Se leyó la firma binaria de cada archivo, se solicitó su URL HTTP y se decodificó en Edge. Resultado:

| Archivo y ruta pública | Dimensiones | HTTP / decodificación |
| --- | --- | --- |
| `/assets/anillos.jpeg` | 1320 × 1790 | 200 / correcta |
| `/assets/cadena-cruz-oro.jpeg` | 1320 × 1502 | 200 / correcta |
| `/assets/cadena-jesus.jpeg` | 1282 × 2400 | 200 / correcta |
| `/assets/cadena-oro2.jpeg` | 1320 × 2318 | 200 / correcta |
| `/assets/cadena-plata-corazon.jpeg` | 1320 × 2245 | 200 / correcta |
| `/assets/cadena-pulsera-oro.jpeg` | 1320 × 2513 | 200 / correcta |
| `/assets/cadenas-oro-jesus.jpeg` | 1320 × 2372 | 200 / correcta |
| `/assets/cadenas-oro1.jpg` | 1512 × 2016 | 200 / correcta |
| `/assets/cadenas-plata1.jpg` | 1512 × 2016 | 200 / correcta |
| `/assets/logo.jpeg` | 1414 × 935 | 200 / correcta |
| `/assets/tienda.png` | 382 × 510 | 200 / correcta |

El registro está en `artifacts/visual-image-audit-before.json`. Las firmas confirman JPEG en `.jpg` y `.jpeg`, y PNG en `tienda.png`.

## Qué se corrigió

En una visita fría, la portada anterior conservaba imágenes sin solicitar por su `loading="lazy"`, especialmente en secciones y tiras horizontales fuera de pantalla. Tras recorrer la página llegaban a cargar. Las pruebas anteriores cambiaban ese atributo a `eager` desde Playwright antes de tomar capturas: eso no verificaba el comportamiento original de la aplicación y podía ocultar el problema observado en capturas o en una visita sin ese recorrido.

Para esta colección pequeña se eliminó la carga diferida en tarjetas, bloques editoriales y miniaturas. Ahora la aplicación solicita las fotos al montar la página; la prioridad alta del hero se conserva. No se ha sustituido ninguna fotografía por un placeholder ni añadido una imagen externa. Las URLs válidas `/assets/...` se mantienen, sin renombrar archivos ni inventar correcciones de rutas que ya eran correctas.

Las pruebas **ya no modifican el atributo `loading`**. Comprueban antes de hacer scroll que todas las imágenes del documento hayan terminado de cargar y tengan anchura natural positiva. Se comprobó también una entrada independiente en escritorio de 1440 px y móvil de 390 px: 23 elementos de imagen cargados, cero imágenes fallidas y cero desbordamiento horizontal. Los archivos se reutilizan entre tarjetas y bloques; el navegador puede compartir su descarga.

No se ha recibido una captura nueva con URL y consola. Por ello se distingue entre lo comprobado —archivos y rutas válidos, carga diferida y pruebas que la forzaban— y una posible causa externa no reproducida. No se afirma haber encontrado un error 404 inexistente.

## Logo original

Se utiliza **`public/assets/logo.jpeg`** sin alterar el archivo: emblema dorado con alas, halo, diamante y nombre Angels Joyería sobre fondo negro.

Se sustituyó el wordmark tipográfico en header y footer y se integró el mismo archivo en el menú móvil y el sello del hero. Se conserva en la sección de marca y su página informativa. El favicon también apunta al archivo real. El antiguo SVG queda sin utilizar y con colores neutros, sin granate.

El contenedor reutilizable `.brand-logo` controla el tamaño responsive sin deformar ni recortar el logo. Todos los usos solicitan `/assets/logo.jpeg`; sustituir ese archivo actualiza la identidad en todos ellos.

## Sistema de color

| Variable | Color | Uso |
| --- | --- | --- |
| `--brand-surface` | `#000000` | Header, footer y menú; coincide con el fondo del logo. |
| `--black` | `#0b0b0b` | Botones principales y bloque editorial oscuro. |
| `--ink` | `#181714` | Titulares y texto principal. |
| `--gold` | `#c6a65d` | Contadores, detalles y bordes de acento. |
| `--gold-light` | `#e2c982` | Texto y detalles sobre negro; hover de botones. |
| `--accent` | `#85662b` | Dorado oscuro para texto legible sobre marfil. |
| `--accent-hover` | `#6c5120` | Estados de interacción en superficies claras. |
| `--paper` | `#f7f5ef` | Fondo marfil. |
| `--muted` | `#706c63` | Texto secundario. |
| `--line` | `#ded8cb` | Divisores discretos sobre claro. |
| `--soft` | `#eee9de` | Fondos de apoyo. |

Se eliminaron `--wine`, `--wine-hover`, los tonos granates y los fondos rosados del código activo. Se revisaron botones, enlaces, iconos, filtros, búsqueda, carrito, menú, borde del sello, franja superior, footer y bloque editorial. Se mantiene el contraste tipográfico y el movimiento existente.

## Archivos modificados

- `index.html`: logo real en shell y menú, favicon y color del navegador.
- `src/pages/home.js`: sello con logo y carga inmediata de imágenes editoriales.
- `src/pages/product.js`: miniaturas con carga inmediata.
- `src/components/product-card.js`: fotografías de tarjetas con carga inmediata.
- `src/lib/motion.js`: la entrada del header apunta al nuevo contenedor del logo.
- `src/styles/base.css`, `shell.css`, `home.css`, `commerce.css`, `dialogs.css`, `responsive.css`: variables, marca, estados y tamaños del logo; retirados selectores del wordmark.
- `public/favicon.svg`: retirado su granate; la página utiliza el JPEG real como favicon.
- `scripts/verify-browser.mjs`: carga fría y logo real comprobados sin alterar el comportamiento de las imágenes.
- `README.md` y documentos de auditoría, análisis y validación: actualización de identidad y resultados.

Los once originales de `public/assets` no se han editado ni eliminado. No se ha accedido a Shopify.

## Ejecutar

```sh
npm run dev
```

Abrir `http://127.0.0.1:5173/`. Para la distribución: `npm run build` y `npm run preview`, que sirve `http://127.0.0.1:4173/`.

Vite sigue ausente en este entorno; el build utiliza el respaldo estático de módulos ES e informa de ello. Las pruebas actuales y capturas están en [VALIDACION.md](VALIDACION.md).
