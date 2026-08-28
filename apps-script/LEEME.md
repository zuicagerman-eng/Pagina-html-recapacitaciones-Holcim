# Publicar el curso en el portal con Google Apps Script

## 1. Crear el proyecto
1. Entra a https://script.google.com → **Nuevo proyecto**.
2. Borra el contenido y pega el archivo **Code.gs** de esta carpeta.
3. Verifica que `URL_CURSO` apunte a tu index.html en GitHub Pages.

## 2. Desplegar como aplicación web
1. Botón **Implementar → Nueva implementación**.
2. Tipo: **Aplicación web**.
3. **Ejecutar como:** Yo.
4. **Quién tiene acceso:** Cualquiera (o "Cualquiera dentro de tu organización"
   si el portal es interno). 
5. **Implementar** → copia la **URL /exec**.

## 3. Embeber en el portal
En el portal interno, inserta un iframe con esa URL:

```html
<iframe src="https://script.google.com/macros/s/XXXXX/exec"
        style="width:100%;height:100vh;border:0"
        allow="autoplay; fullscreen; picture-in-picture"></iframe>
```

## Notas
- Cada vez que actualices GitHub, el portal muestra la última versión
  automáticamente (este script lee el HTML en vivo).
- Requisito: **GitHub Pages activado** y la variable **BASE** del index.html
  igual a la URL de tu GitHub Pages.
- Si cambias el HTML de sitio, actualiza `URL_CURSO` aquí.
