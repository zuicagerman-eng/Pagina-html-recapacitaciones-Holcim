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


## 5. Resultados del examen en una hoja de cálculo

La hoja **NO hay que crearla a mano**: el script crea "HSE-001 · Resultados
examen" en el Drive de la cuenta que despliega, con dos pestañas (`Resultados`
y `Respuestas`). Para ver su enlace, ejecuta una vez `verHojaDeResultados()`
desde el editor y mira el **Registro de ejecución**.

### Error "No cuentas con el permiso para llamar a SpreadsheetApp.create"

Es el fallo más común y **no es un error del código**: la implementación se
autorizó antes de que el script tuviera código de Hojas de cálculo, así que
sigue corriendo con los permisos viejos. Se arregla así:

1. En el editor, elige la función **`verHojaDeResultados`** y presiona
   **Ejecutar**.
2. Google mostrará la pantalla de autorización. Acepta **Hojas de cálculo** y
   **Drive** (antes solo habías aceptado el envío de correo).
3. **Implementar → Administrar implementaciones → ✏️ Editar → Versión: Nueva
   versión → Implementar.** Este paso es obligatorio: la versión anterior
   conserva los permisos antiguos aunque ya hayas autorizado.
4. Vuelve a presentar el examen: debe salir el aviso verde "Resultado
   registrado".

El archivo `appsscript.json` de esta carpeta ya declara los permisos necesarios.
Para usarlo, en el editor entra a **Configuración del proyecto ⚙** y activa
*"Mostrar el archivo de manifiesto appsscript.json en el editor"*, luego pega
su contenido.

### Si tu organización no permite que un script cree archivos en Drive

Algunas cuentas corporativas lo bloquean. En ese caso:

1. Crea tú una hoja de cálculo vacía en Drive.
2. Copia su **ID** de la URL (el trozo entre `/d/` y `/edit`).
3. Pégalo en `Code.gs`, en la variable `ID_HOJA`.
4. Publica una nueva versión de la implementación.

El script creará las pestañas y los encabezados dentro de esa hoja.

## 6. Banco de preguntas del examen

Las 50 preguntas, con su respuesta correcta marcada, están en
`EXAMEN-banco-de-preguntas.md`, en la raíz del repositorio. Para editarlas se
cambia el bloque `var BANCO = [` dentro de `index.html`.
