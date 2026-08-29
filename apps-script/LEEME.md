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

## 4. Reporte de problemas por correo (recomendado)
El curso tiene un botón flotante ⚠️ "Reportar un problema". Para que los
reportes te lleguen por correo automáticamente:

1. En **Code.gs**, revisa `CORREO_REPORTES` (por defecto tu correo).
2. Copia la **URL /exec** de tu implementación (paso 2).
3. En `index.html` (GitHub), pega esa URL en la variable **`REPORTE_URL`**.
4. La primera vez que se use, Google pedirá **autorizar** el envío de correo
   (MailApp). Acepta.

Si dejas `REPORTE_URL = ""`, el botón abrirá el correo del usuario ya
diligenciado (modo respaldo), sin envío automático.

> Tras editar Code.gs, crea una **Nueva implementación** (o "Administrar
> implementaciones → editar → Nueva versión") para que los cambios apliquen.
