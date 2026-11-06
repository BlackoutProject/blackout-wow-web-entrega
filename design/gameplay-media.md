# Material real de Blackout

La galería está integrada en la portada. Las clases y los sistemas también admiten capturas y vídeos en su propio apartado. Sin material, no se renderizan tarjetas, controles ni espacios reservados.

## Incorporar capturas o clips

1. Colocar los archivos en `public/blackout-media/`. Conservar fuera de `public` los originales de edición.
2. Añadir una entrada a `gameplayMedia` en `src/lib/gameplay-media.ts` con un identificador único, tema, tipo, archivo, miniatura, dimensiones y descripción en `es`, `en` y `pt`.
3. Temas: `collection` (portada); `evoker`, `demon-hunter`, `monk` (clases); `aio`, `paragon`, `battle-pass`, `transmog`, `druid`, `mall`, `convenience` (sistemas).
4. Usar exclusivamente capturas o grabaciones verificadas del servidor. No presentar ilustraciones, recursos de Blizzard ni vídeos generados como gameplay de Blackout.
5. Las imágenes se amplían sin recortar en el visor. Para clips, usar MP4 H.264 con miniatura WebP/JPEG. Los vídeos se reproducen a petición del visitante, con controles; no descargan el vídeo completo en las tarjetas.
6. Ejecutar `node scripts/check-gameplay-media.mjs` y revisar escritorio y móvil antes de publicar.

## Tráiler y tutorial

- `NEXT_PUBLIC_YOUTUBE_TRAILER_ID`: ID de 11 caracteres del tráiler. La portada mantiene el aviso de próximo estreno hasta que exista.
- `NEXT_PUBLIC_YOUTUBE_TUTORIAL_ID`: ID de 11 caracteres del tutorial. Aparece tras las dos opciones de instalación, antes del esquema de carpetas. Se oculta si no está configurado.
- Ambos usan YouTube sin cookies y cargan el reproductor al pulsar. Cambiar estas variables requiere reconstruir la web.

Las noticias deben añadirse a partir de anuncios reales con fecha y traducciones. No hay publicaciones de ejemplo en la web.
