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


## 7. "No se pudo abrir el archivo en este momento" (pantalla de Google Drive)

Ese mensaje NO viene del curso: lo muestra Google cuando quien abre el enlace
no tiene permiso para ejecutar la aplicación web. Revisa estas tres cosas, en
este orden.

### 7.1 Estás usando la URL equivocada (la causa más común)

Una implementación tiene DOS direcciones y solo una sirve para los demás:

| URL | Termina en | Quién puede abrirla |
|-----|-----------|---------------------|
| Prueba | `/dev` | **solo tú y los editores del proyecto** |
| Producción | `/exec` | **quien indiques en "Quién tiene acceso"** |

La `/dev` falla en el celular aunque a ti te funcione en el computador, porque
en el teléfono normalmente hay otra cuenta de Google (o ninguna).

Copia la de `/exec`: **Implementar → Administrar implementaciones →** la URL
que aparece bajo *"Aplicación web"*.

### 7.2 El acceso no está en "Cualquier usuario"

**Implementar → Administrar implementaciones → ✏️ Editar:**

- **Ejecutar como:** *Yo (tu-correo)* ← no lo cambies. Así el script escribe en
  TU hoja de resultados aunque quien conteste sea otra persona.
- **Quién tiene acceso:** *Cualquier usuario* ← esta es la que hay que cambiar.

En el desplegable hay dos opciones parecidas:

- **Cualquier usuario**: necesita haber iniciado sesión con una cuenta de Google.
- **Cualquier usuario, incluso los anónimos**: entra cualquiera, sin sesión.
  Es la que hay que elegir si el curso debe abrirse para todos, sean o no de
  Holcim. (En el manifiesto `appsscript.json` corresponde a `ANYONE_ANONYMOUS`.)

Después de cambiarlo, **Versión: Nueva versión → Implementar**. El cambio no
aplica hasta publicar versión nueva.

### 7.3 Tu organización bloquea el uso externo

Si el desplegable NO ofrece "Cualquier usuario" (solo aparece *"Cualquier
usuario de Holcim"* o *"Solo yo"*), no es un problema que se pueda resolver
desde el código: el administrador de Google Workspace de Holcim tiene
restringido publicar aplicaciones hacia fuera de la organización.

Opciones en ese caso:

1. Pedirle a TI que habilite la publicación externa de Apps Script para tu
   cuenta o para el proyecto.
2. Dejarlo en *"Cualquier usuario de Holcim"*, si todos los que van a
   presentar la reinducción tienen correo corporativo.
3. Desplegar el curso desde una cuenta de Google personal, que sí permite
   "Cualquier usuario, incluso los anónimos". La hoja de resultados quedaría
   en el Drive de esa cuenta.

### 7.4 Comprobación

Abre la URL `/exec` en una **ventana de incógnito y sin iniciar sesión**. Si
carga el curso, cualquier persona podrá entrar. Si pide iniciar sesión, todavía
está en "Cualquier usuario" y no en "incluso los anónimos".


## 8. Si la cuenta de Holcim no puede abrir la aplicación

Puede pasar que el curso abra sin problema desde una cuenta personal pero
muestre "No se pudo abrir el archivo en este momento" desde el perfil de
Holcim, aun con la implementación en *Ejecutar como: Yo* y *Acceso:
Cualquiera*. Eso ya no es configuración del despliegue: el Workspace de la
organización tiene restringido abrir aplicaciones de Apps Script que son de
fuera. No hay nada que se pueda cambiar en el código para saltarse eso.

### Salida recomendada: servir el curso desde GitHub Pages

El curso no necesita Apps Script para mostrarse; solo lo necesitaba para
enviar los correos de reporte y guardar el examen. Esas dos cosas también
funcionan por POST, así que se puede repartir la URL de Pages:

```
https://zuicagerman-eng.github.io/Pagina-html-recapacitaciones-Holcim/index.html
```

Configuración necesaria:

1. En `index.html`, pon la URL **/exec** de tu implementación en la variable
   `REPORTE_URL`:

   ```js
   var REPORTE_URL = "https://script.google.com/macros/s/AKfy.../exec";
   ```

2. Sube el cambio a GitHub. Con eso, el curso enviará por POST tanto los
   reportes del botón ⚠️ como los resultados del examen, y estos seguirán
   llegando a la misma hoja de cálculo.

Ventajas: la página la abre cualquiera sin cuenta de Google y sin depender de
las políticas de la organización. La única parte que sigue tocando Google es
el envío de datos, que va por una petición POST y no por una sesión de usuario.

Si la red corporativa también bloqueara `script.google.com`, el curso se vería
igual pero la pantalla del examen avisaría que no pudo confirmar el registro,
en vez de darlo por guardado.


## 9. Conectar un formulario nuevo con la hoja de cálculo

Aunque el curso se sirva desde GitHub Pages, sí puede escribir en Sheets: lo
hace enviando los datos por POST a la URL `/exec`. Esa tubería ya está montada
y es reutilizable, así que **para un formulario nuevo no hay que programar nada
en Apps Script**.

Desde cualquier parte del `index.html`:

```js
enviarASheet('Asistencia', {
  nombre: 'Ana María Pérez',
  cedula: '0102030405',
  sede:   'Bogotá'
})
.then(function(){  /* llegó y quedó confirmado */ })
.catch(function(e){ /* no se pudo confirmar: avísale a la persona */ });
```

El primer parámetro es el nombre de la pestaña. Lo que pasa del otro lado:

- Si la pestaña no existe, se crea con esos campos como encabezados.
- Se agrega siempre una columna **Fecha** al inicio.
- Si más adelante mandas un campo nuevo, se añade la columna al final **sin
  dañar** lo ya guardado.
- Los campos que empiezan por `cedula` o `documento` se guardan como texto,
  para que la hoja no borre los ceros de la izquierda.

Requisito único: tener `REPORTE_URL` con la URL `/exec`. Si el curso corre
dentro de Apps Script, funciona igual sin configurar nada.

## 10. Certificados guardados en una carpeta de Drive

Cuando alguien **aprueba**, el curso arma el certificado en PDF y lo manda junto
con el resultado. El script lo archiva en Drive y deja su enlace en la columna
**`Vinculo`** de la hoja. Quien no aprueba no genera certificado.

### Qué hay que hacer

1. En `Code.gs` no hace falta tocar nada: la carpeta **`HSE-001 · Certificados`**
   se crea sola, en "Mi unidad" de la cuenta que despliega el script.
   Si prefieres una carpeta tuya, pega su ID en `ID_CARPETA_CERTIFICADOS`
   (el trozo de la URL que va después de `/folders/`).
2. En el editor, elige la función **`verCarpetaDeCertificados`** y presiona
   **Ejecutar**. Google pedirá autorizar **Drive**; acepta.
   En el *Registro de ejecución* saldrá el enlace de la carpeta.
3. **Implementar → Administrar implementaciones → ✏️ Editar → Versión: Nueva
   versión → Implementar.** Sin este paso la implementación sigue con los
   permisos y el código viejos.

### Quién puede abrir el enlace

`CERTIFICADOS_PUBLICOS` está en **`false`**, que es lo recomendado: el enlace
solo lo abre quien tenga acceso a la carpeta (tú y con quien la compartas). El
certificado lleva **nombre y número de cédula**, que son datos personales, así
que no conviene dejarlos abiertos a cualquiera con el enlace.

Si de todas formas necesitas que el enlace lo abra cualquiera, ponlo en `true`
y publica una versión nueva. Si la organización tiene prohibido compartir hacia
fuera, el archivo se guarda igual y el enlace seguirá sirviendo dentro de Holcim.

### Nombre de los archivos

`Nombre Apellido - 12025044 - 2026-05-05 1057.pdf`

Lleva la fecha y la hora porque una misma persona puede presentar el examen
varias veces: así quedan todos los intentos aprobados, sin pisarse.

### Si el certificado no llega

El resultado del examen **siempre** se guarda, aunque el certificado falle: son
dos cosas separadas a propósito. Si en la hoja ves la fila pero la columna
`Vinculo` trae la dirección del curso en vez de un enlace de Drive, es que el
PDF no se pudo archivar. Revisa que hayas autorizado Drive (paso 2) y que la
implementación esté en la versión nueva (paso 3).

### Columnas nuevas en una hoja que ya venías usando

La hoja no se reordena ni se borra: el script agrega al final las columnas que
le falten (`Tipo_Usuario`, `ID_Identificacion`, `Nombre_Completo`, `Empresa`,
`Capacitacion`, `Puntaje`, `Resultado`, `Vinculo`) y escribe cada dato buscando
su columna **por el nombre del encabezado**. Si quieres el orden del formato
impreso, reordena las columnas a mano en la hoja: el script las seguirá
encontrando igual.

### La pestaña "Respuestas" ya no se usa

El detalle pregunta por pregunta **ya no se escribe en la hoja**: va dentro del
PDF del certificado, a partir de la hoja 2, con lo que marcó la persona y cuál
era la correcta.

Si en tu hoja todavía existe la pestaña `Respuestas` de las versiones
anteriores, el script ya no le escribe nada. Para borrarla, ejecuta una vez la
función **`borrarPestanaRespuestas`** desde el editor (o bórrala a mano). Ojo:
borra los datos que tenga.

**Ten en cuenta:** quien NO aprueba no genera certificado, así que de esos
intentos queda la fila del resumen (fecha, nombre, puntaje, resultado) pero ya
no el detalle de cada pregunta. Si necesitas ese soporte también para los
reprobados, avísame y lo generamos aparte.

### El enlace del certificado

La celda de `Vinculo` queda como **hipervínculo**: el texto es la dirección del
PDF y es clicable. Si por permisos no se pudiera aplicar el formato, la celda
igual conserva la URL en texto plano.

### Apuntar a una carpeta que ya tienes

1. Abre tu carpeta en Drive y **copia la URL de la barra del navegador**.
2. Pégala tal cual en `ID_CARPETA_CERTIFICADOS`, dentro de las comillas:

   ```js
   var ID_CARPETA_CERTIFICADOS = "https://drive.google.com/drive/folders/1AbC...";
   ```

   No hace falta recortar nada: el script acepta la URL completa o solo el
   identificador. Lo mismo vale para `ID_HOJA`.
3. Guarda y publica una **versión nueva** de la implementación.

### Dónde cae la columna del enlace

El script escribe buscando cada dato **por el nombre del encabezado**, así que
la columna del enlace queda donde tú pongas el rótulo `Vinculo` en la fila 1.

- Si escribes `Vinculo` en **J1**, el enlace se guarda en la columna J.
- Si no existe esa columna, el script la crea al final de la hoja.

Vale para todas: puedes ordenar los encabezados como quieras y el script los
sigue encontrando.
