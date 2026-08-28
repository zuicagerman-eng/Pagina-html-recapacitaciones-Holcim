# Carpeta de audio

Coloca aquí los archivos de audio del curso (MP3).

## Cómo usar un MP3 en el curso
En `index.html`, dentro de la diapositiva donde quieras el audio, agrega:

```html
<audio controls preload="none" style="width:100%;margin-top:14px">
  <source data-audio="audio/narracion.mp3" type="audio/mpeg">
  Tu navegador no soporta audio.
</audio>
```

El script convierte automáticamente `data-audio="audio/..."` en la URL
absoluta correcta (variable BASE), para que funcione también cuando el
HTML corre dentro de Google Apps Script / el portal.

Sugerencias:
- Usa `preload="none"` para que el audio no descargue hasta que se use.
- GitHub Pages sirve MP3 correctamente y permite adelantar/retroceder.
