# Imágenes de productos

Sube las imágenes dentro de una carpeta por producto, fuera de public.
Ejemplo: productos/kit-sutura-modelo-s/01.jpg, 02.jpg, ... 07.jpg.
Usa carpetas separadas para modelos distintos. Puedes crear productos/fonendoscopio/ cuando lo necesites.
Formatos: JPG, JPEG, PNG, WebP y AVIF. Orden: nombre de archivo, con orden numérico natural. Se recomienda 01.jpg, 02.jpg, etc.
Solo se copian imágenes directamente dentro de cada carpeta; no se siguen enlaces simbólicos ni se publican README u otros documentos.
El script no redimensiona, recorta, comprime ni elimina metadatos de las imágenes. Evita subir información privada.

## Cloudflare
Cuando exista scripts/build.mjs en main, cambia Build command a: node scripts/build.mjs
Mantén Build output: public y Root directory vacío.
Ejecuta un nuevo despliegue y revisa los logs.
El script genera public/productos/manifest.json con {version:1,products:{carpeta:[url,...]}} y añade el favicon a HTML que no lo tenga.
No borra archivos antiguos. Una carpeta vacía produce una lista vacía.
Esto prepara los recursos: el carrusel y su conexión con cada tarjeta requieren una implementación posterior. Crear una carpeta no crea automáticamente un producto, precio ni stock.
