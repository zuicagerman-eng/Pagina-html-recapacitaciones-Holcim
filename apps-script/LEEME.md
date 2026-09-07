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

---

## Encuesta de satisfacción

Al terminar el examen, cuando la persona pulsa **Descargar certificado (PDF)**,
antes de generar el archivo aparece una encuesta corta: cinco estrellas, un
espacio para "¿qué cambiarías o mejorarías?" y el nombre, que es opcional.

**No hay que tocar nada en Apps Script.** La encuesta viaja por el mismo camino
que el botón ⚠️ **Reportar**, así que llega al correo de `CORREO_REPORTES` —hoy
`german.zuica@holcim.com`— sin cambiar el script ni volver a publicar.

Los correos llegan con el asunto **`Satisfacción HSE-001 · 4/5 estrellas`**, de
modo que puedes filtrarlos en Gmail con `asunto: Satisfacción HSE-001` y llevar
el seguimiento aparte de los reportes de fallos.

Cosas que conviene saber:

- **Nunca bloquea el certificado.** Si la persona pulsa *Omitir*, cierra con la
  ✕ o con Escape, o si el envío falla porque no hay red, el PDF se genera igual.
- **Sale una sola vez por persona.** Queda una marca en el navegador, así que
  quien descargue el certificado dos veces no la vuelve a ver.
- **Cuenta contra el límite de correos.** Una cuenta gratuita de Gmail permite
  100 destinatarios al día, y ahora cada examen aprobado puede gastar uno. Con
  el ritmo previsto (unas 100 personas al mes) sobra de largo; solo habría que
  vigilarlo si algún día se citan más de 100 personas el mismo día.
- Si prefieres apagarla, borra el bloque `ENCUESTA` de `index.html` o cambia
  `ENCUESTA.pedir(function(){ … })` por el contenido de esa función.

---

## Poner al día el script (y por qué hoy el enlace no es un PDF)

En la hoja, la columna **Vínculo** trae la dirección del curso
(`.../index.html`) en vez del enlace al PDF, y la carpeta de Drive está vacía.
Las dos cosas son el mismo síntoma: **el despliegue publicado está corriendo
una versión vieja del script**, anterior a que se le añadiera lo de Drive.

Cuando el script no consigue guardar el PDF, deja en la columna la dirección
desde donde se presentó el examen, que es el respaldo. Por eso el enlace lleva
a la reinducción y no a un archivo.

Editar el código en el editor **no cambia lo que está publicado**. Apps Script
sirve la *versión* que elegiste al implementar, así que hay que publicar una
versión nueva.

### Paso a paso

1. Abre el proyecto de Apps Script.
2. Copia el contenido de `apps-script/Code.gs` de este repositorio y pégalo
   encima de todo lo que haya en `Código.gs`. **Reemplaza todo, no lo pegues
   al final.**
3. Vuelve a poner tus dos valores, que el pegado se lleva por delante:
   - `var CORREO_REPORTES = "german.zuica@holcim.com";`
   - `var ID_CARPETA_CERTIFICADOS = "1LExNIvC0PP0CSRVn79bg1m4yPfdvXJ4l";`
     (sirve igual el identificador suelto o la URL completa de la carpeta)
4. Guarda (💾).
5. Ejecuta la función **`probarTodo`** desde el editor y mira el registro.
   Hace el recorrido completo con una persona inventada —fila en la hoja, PDF
   en Drive y copia por correo— y después borra la fila y el PDF de prueba.
   Si algo falla, el mensaje dice en qué paso.
   La primera vez Google pedirá autorización: acéptala.
6. **Implementar → Administrar implementaciones → ✏️ (editar) → Versión:
   «Versión nueva» → Implementar.**
   Este es el paso que faltaba. Si creas una implementación distinta en vez de
   editar la que ya existe, cambia la URL `/exec` y habría que actualizar
   `REPORTE_URL` en `index.html`; editando la que ya está, la URL no cambia.
7. Comprueba que la línea final de `probarTodo` (la URL `/exec`) sea idéntica
   a `REPORTE_URL` en `index.html`.

### Qué cambia cuando quede publicado

- El PDF del certificado se guarda en **Certificados Reinducciones** y la
  columna **Vínculo** pasa a llevar el enlace a ese archivo, como hipervínculo.
- Llega además **una copia del PDF por correo** a `CORREO_REPORTES` —el mismo
  buzón de los reportes de problemas y de la encuesta—, con el asunto
  `Certificado HSE-001 · Nombre · APROBADO`.

### La copia por correo (segunda ruta)

Es un respaldo por si Drive falla, se llena la cuota o alguien borra la carpeta
sin querer. Si el PDF **no** se pudo guardar en Drive, el correo lo dice
expresamente, para que sepas que esa copia es la única que queda.

Si un día quieres apagarla, pon `COPIA_CERTIFICADO_CORREO = false`.

**Cuota de correo:** una cuenta gratuita permite 100 destinatarios al día.
Ahora cada examen aprobado gasta uno, más otro si la persona responde la
encuesta de satisfacción: hasta 2 por persona. Con unas 100 personas al mes
(≈3 al día) sobra de largo, pero si algún día citas a más de 50 el mismo día,
conviene apagar la copia por correo ese día.


---

## Si `probarTodo` dice «FALLÓ: You do not have permission to call DriveApp»

No es la carpeta ni el identificador: **es que el script todavía no tiene
permiso para tocar Drive**. Pasa cuando la autorización se dio antes de que el
script tuviera la parte de Drive: el permiso que Google guardó entonces no la
incluía, y no se amplía solo.

Se ve así en el registro:

```
1. Hoja de resultados ...... OK
2-3. Drive ................. FALLÓ: You do not have permission to call
     DriveApp.getFoldersByName. Required permissions: .../auth/drive
4. Copia por correo ........ OK
5. Escribir la fila ........ OK
```

Fíjate en que los pasos 1, 4 y 5 sí funcionan: la hoja y el correo ya estaban
autorizados desde antes. Solo falta Drive.

### Cómo arreglarlo

1. En el editor, arriba a la izquierda, abre **`appsscript.json`**. Si no lo
   ves: ⚙️ **Configuración del proyecto → “Mostrar el archivo de manifiesto
   appsscript.json en el editor”**.
2. Pega encima el `appsscript.json` de este repositorio. Lo que importa es que
   la lista `oauthScopes` incluya:
   ```
   "https://www.googleapis.com/auth/drive"
   ```
3. Guarda 💾.
4. Vuelve a ejecutar **`probarTodo`**. Ahora Google mostrará la pantalla de
   permisos otra vez, y esta vez pedirá también el acceso a Drive: **acéptala**.
   Si aparece «Google no ha verificado esta aplicación», entra en
   **Configuración avanzada → Ir a (nombre del proyecto)**. Es tu propio
   script, en tu propia cuenta.
5. El paso 2-3 debe quedar en OK, con la URL de tu carpeta.

Comprueba que esa URL sea **la misma** de tu carpeta *Certificados
Reinducciones*. Si sale otra distinta, el identificador no coincidió; a partir
de ahora el script lo dice en vez de crear una carpeta nueva en silencio.

### La URL que sale al final de `probarTodo`

Ejecutando desde el editor, Google devuelve la dirección de **pruebas**, que
termina en **`/dev`**. Esa lleva un código distinto al de la publicada y **no
hay que compararla** con `REPORTE_URL`. La publicada termina en `/exec` y la
ves en **Implementar → Administrar implementaciones**.


---

## Si al autorizar aparece una cuenta que no es la tuya

Síntoma: cada vez que el script pide permisos, la pantalla sale con otra cuenta
(por ejemplo una de Hotmail) en vez de la que tiene la carpeta.

Pasa cuando el navegador tiene **varias cuentas de Google abiertas a la vez**.
Google elige una y el permiso se concede a esa. Como esa cuenta no ve la
carpeta *Certificados Reinducciones*, Drive sigue fallando por mucho que
aceptes: no es un problema del identificador de la carpeta.

**Regla:** el script tiene que ejecutarse y autorizarse con la **misma cuenta
que es dueña de la carpeta y de la hoja**.

### Cómo saber con qué cuenta está corriendo

Ejecuta `probarTodo` y mira la primera línea del registro:

```
0. Cuenta que ejecuta ...... zuica.german@gmail.com
   Tiene que ser la DUEÑA de la carpeta de Drive.
```

Si ahí sale otra cuenta, ese es el problema.

### Cómo arreglarlo

La forma más segura es trabajar con una sola cuenta abierta:

1. Abre una **ventana de incógnito** (Ctrl+Shift+N).
2. Entra a **script.google.com** e inicia sesión **solo** con la cuenta dueña
   de la carpeta.
3. Abre el proyecto, ejecuta `probarTodo` y acepta los permisos.
4. Publica desde ahí la versión nueva de la implementación.

En una ventana normal también sirve: pulsa tu foto arriba a la derecha en
script.google.com y comprueba que la cuenta activa sea la correcta antes de
ejecutar nada. Si no lo es, cierra las demás sesiones
(**Cerrar sesión en todas las cuentas**) y vuelve a entrar solo con esa.

**Importante:** revocar el permiso en `myaccount.google.com/permissions`
también hay que hacerlo **dentro de la cuenta correcta**; esa página solo
muestra los permisos de la cuenta en la que estás.

### Y la implementación

Quien publica la implementación debe ser esa misma cuenta: el script corre
como `USER_DEPLOYING`, es decir, con los permisos de quien la publicó. Si la
publica otra cuenta, los certificados intentarían guardarse en el Drive de esa
otra cuenta.


---

## Dejar `ID_HOJA` en blanco: cuidado con lo que el script recuerda

Dejar las variables vacías **no significa «empezar limpio»**. Significa «usa lo
que recordaste». El script guarda la hoja y la carpeta que usó la primera vez,
y sigue apuntando ahí aunque el código quede vacío.

Eso muerde cuando alguna vez se creó una hoja o una carpeta por error: quedan
recordadas y los resultados nuevos se van ahí, lejos de los de siempre, sin
ningún aviso.

**Para ver a dónde apunta de verdad**, ejecuta `verLoRecordado()`:

```
Hoja recordada:    1HTWzcTXPudUu0vfNjxA8nfYIgMA_7yJp1WjctbtwiOo
Carpeta recordada: 1LExNIvC0PP0CSRVn79bg1m4yPfdvXJ4l
```

**Para que olvide todo**, ejecuta `olvidarLoRecordado()`. No borra archivos:
solo olvida las direcciones.

### Lo recomendable

Escribir las tuyas de verdad en las dos variables, y no depender de lo
recordado. Así, lo que apunta el script se ve leyendo el código:

```js
var ID_HOJA = "https://docs.google.com/spreadsheets/d/TU_HOJA/edit";
var ID_CARPETA_CERTIFICADOS = "https://drive.google.com/drive/folders/TU_CARPETA";
```

Y recuerda cuál va en cuál: `ID_HOJA` lleva el enlace de
**docs.google.com/spreadsheets/**, y `ID_CARPETA_CERTIFICADOS` el de
**drive.google.com/drive/folders/**.


---

## Mudar los datos al dominio Holcim

Los certificados y la hoja llevan nombre y número de documento de 870 personas.
Eso no debería vivir en una cuenta personal: si un día se pierde el acceso a
esa cuenta, se van con ella. El curso en sí (GitHub) no tiene datos personales
y puede quedarse donde está.

### El punto que decide si funciona

El script escribe **con la identidad de la cuenta que publicó la
implementación** (está desplegado como `USER_DEPLOYING`). Hoy esa cuenta es la
personal. Así que hay dos caminos, y conviene elegir a conciencia:

**Camino A — mover solo los datos.** La carpeta y la hoja se crean en el Drive
de Holcim y se **comparten con la cuenta personal como Editor**. Se cambian dos
líneas y listo.
- A favor: son 10 minutos.
- En contra: muchas organizaciones **bloquean compartir con cuentas de fuera**.
  Y si un día TI cierra esa compartición, el curso deja de guardar sin avisar.

**Camino B — mover también el script.** El proyecto se recrea en la cuenta de
Holcim y se publica desde ahí. Entonces la carpeta y la hoja no necesitan
compartirse con nadie de fuera.
- A favor: nada depende ya de la cuenta personal, y el límite de correos sube
  de 100 a 1.500 al día.
- En contra: cambia la URL `/exec`, así que hay que actualizar `REPORTE_URL`
  en `index.html` y volver a publicar el curso.

**Recomendación:** si TI permite compartir hacia fuera, empieza por A —
funciona hoy mismo. Pero deja B previsto: es el único que quita de verdad la
dependencia de una cuenta personal.

### Camino A, paso a paso

1. Con la cuenta **Holcim**, crea en su Drive la carpeta
   `HSE-001 · Certificados` y una hoja `HSE-001 · Resultados examen`.
2. Comparte **las dos** con la cuenta personal, con permiso de **Editor**.
   Si Google no deja añadir esa dirección, el camino A está bloqueado: ve al B.
3. Copia los datos que ya tienes: pega las filas de la hoja vieja en la nueva
   (respetando los encabezados) y arrastra los certificados ya emitidos a la
   carpeta nueva.
4. En el script, cambia las dos direcciones por las nuevas:
   ```js
   var ID_HOJA = "URL de la hoja de Holcim";
   var ID_CARPETA_CERTIFICADOS = "URL de la carpeta de Holcim";
   ```
5. Ejecuta `probarTodo` y mira las dos líneas de **dueño**:
   ```
   1. Hoja de resultados ...... OK  ...
      dueño: german.zuica@holcim.com      ← tiene que ser la de Holcim
   2. Carpeta de Drive ........ OK  ...
      dueño: german.zuica@holcim.com
   ```
   Si ahí sigue saliendo la cuenta de gmail, **los datos no se movieron**: solo
   se cambió el enlace y siguen en el Drive personal.
6. Publica una **versión nueva** de la implementación.

### Camino B, si hace falta

1. Con la cuenta **Holcim**, crea un proyecto nuevo en script.google.com.
2. Pega `Code.gs` y `appsscript.json` de este repositorio.
3. Pon `CORREO_REPORTES`, `ID_HOJA` e `ID_CARPETA_CERTIFICADOS` con los de
   Holcim (ya no hace falta compartir nada hacia fuera).
4. Ejecuta `probarTodo` y acepta los permisos.
5. Implementa como aplicación web: **Ejecutar como: yo**, **Quién tiene
   acceso: cualquier persona**.
6. Copia la URL `/exec` nueva y pégala en `REPORTE_URL` dentro de `index.html`.
   Súbelo a GitHub. **Sin este paso el curso seguiría hablándole al script
   viejo.**
7. Cuando el nuevo funcione, apaga la implementación vieja.

### Lo que NO hay que mover

El repositorio de GitHub. Solo tiene el material del curso —ni un nombre, ni
una cédula— y si pasara a una organización de Holcim en modo privado, GitHub
Pages dejaría de publicarlo salvo con GitHub Enterprise: el curso dejaría de
abrirse para los 870.


---

## Mudanza completa a Holcim (camino B) — lista de pasos

Decidido: todo en el dominio Holcim, nada en la cuenta personal. La carpeta de
destino está en una **unidad compartida**, que es lo mejor que podía pasar: los
archivos pertenecen a la unidad y no a una persona, así que no se van con nadie
que cambie de rol.

### 1. Crear el proyecto en la cuenta Holcim

- Entra a **script.google.com con la cuenta de Holcim** (comprueba la foto de
  arriba a la derecha antes de nada) y crea un proyecto nuevo.
- Pega `Code.gs` de este repositorio, encima de todo.
- Muestra el manifiesto (⚙️ Configuración del proyecto → «Mostrar
  appsscript.json») y pega también el `appsscript.json` de aquí. Sin él vuelve
  a faltar el permiso de Drive.

### 2. Poner las tres direcciones

```js
var CORREO_REPORTES        = "german.zuica@holcim.com";
var ID_HOJA                = "URL de la hoja en Drive de Holcim";
var ID_CARPETA_CERTIFICADOS = "URL de la carpeta en la unidad compartida";
```

Pega las URL completas copiadas de la barra del navegador; el script extrae lo
que necesita. Y recuerda cuál va en cuál: la de `docs.google.com/spreadsheets`
en `ID_HOJA`, la de `drive.google.com/drive/folders` en la otra.

### 3. Probar antes de publicar

Ejecuta `probarTodo` y acepta los permisos. Fíjate en las líneas de **dueño**:

```
1. Hoja de resultados ...... OK  ...
   dueño: german.zuica@holcim.com
2. Carpeta de Drive ........ OK  ...
   dueño: (sin dueño visible: unidad compartida)   ← correcto en unidad compartida
```

En una unidad compartida no hay dueño personal: ese mensaje es la señal de que
está bien puesto. Lo que NO debe aparecer es una dirección de gmail.

### 4. Publicar — el paso donde puede aparecer el obstáculo

**Implementar → Nueva implementación → Aplicación web**, con:

- **Ejecutar como:** Yo
- **Quién tiene acceso: Cualquier persona** ← imprescindible

⚠️ **Muchas organizaciones bloquean esa última opción.** El curso vive en
GitHub Pages y le habla al script sin iniciar sesión, así que si solo se puede
elegir «Cualquier usuario de Holcim», el script no recibirá nada y no se
guardará ningún resultado.

Si «Cualquier persona» no aparece, no sigas: hay que pedirle a TI que permita
el acceso anónimo para este proyecto. Es una configuración de Workspace
(«Apps Script → acceso a aplicaciones web»), no algo que se arregle desde aquí.

### 5. Cambiar la dirección en el curso

Copia la URL `/exec` nueva y ponla en `index.html`:

```js
var REPORTE_URL = "la nueva URL /exec";
```

Sin este paso el curso seguiría hablándole al script viejo y todo iría a parar
a la cuenta personal.

### 6. Llevarse lo que ya hay

- Pega en la hoja nueva las filas de la vieja, respetando los encabezados.
- Mueve a la carpeta nueva los certificados ya emitidos.

### 7. Apagar lo viejo

Cuando el nuevo funcione de punta a punta, en el proyecto personal:
**Implementar → Administrar implementaciones → Inhabilitar**. Así, si algún
enlace viejo sigue por ahí, no seguirá guardando en la cuenta personal.

### Lo que se gana

- Ningún dato personal en una cuenta particular.
- Los archivos pertenecen a la unidad compartida, no a una persona.
- El límite de correos pasa de 100 a 1.500 al día, con lo que la copia del
  certificado y la encuesta dejan de ser una preocupación aunque se cite a
  mucha gente el mismo día.


---

## Guardar en la cuenta personal y trasladar a Holcim

El obstáculo era este: para recibir del curso hace falta una implementación que
acepte peticiones **sin iniciar sesión**, y en el dominio de Holcim eso está
bloqueado. Pero para **escribir en una carpeta** solo hace falta tener permiso
en ella, y eso sí se tiene.

Así que se separan las dos cosas:

1. El curso escribe al script de la cuenta personal, que es el único que puede
   recibir sin sesión.
2. El certificado se guarda en la carpeta de esa cuenta.
3. **Acto seguido se traslada** a la carpeta de la unidad compartida de Holcim.

El PDF pasa por la cuenta personal apenas un segundo. Donde queda —y donde se
queda para siempre— es en Holcim.

### Cómo se configura

Rellena la cuarta dirección, que es opcional:

```js
var ID_CARPETA_CERTIFICADOS = "carpeta de paso, en el Drive personal";
var ID_CARPETA_FINAL        = "carpeta de la unidad compartida de Holcim";
```

Déjala vacía y no se traslada nada: todo se queda como estaba.

### Si el traslado falla, no se pierde nada

Es lo primero que se pensó al escribirlo. Si el traslado no sale —permisos,
red, lo que sea— el certificado **se queda en la carpeta de paso** y el examen
queda registrado igual, con su enlace funcionando. Nada se pierde.

Para recogerlos después está **`moverPendientes()`**: recorre la carpeta de
paso y traslada todo lo que encuentre. Sirve también para llevarse de una vez
los certificados que ya estaban guardados de antes.

**Déjala programada y olvídate:** en el editor, ⏰ **Activadores → Añadir
activador → `moverPendientes` → Según tiempo → Temporizador por horas → Cada
hora**. Así, aunque algún traslado falle, a la hora siguiente se recupera solo.

### Comprobarlo

Ejecuta `probarTodo` y mira el paso nuevo:

```
3. Guardar el PDF .......... OK  ...
3b. Traslado a Holcim ...... OK
    quedó en: 3. SOPORTES CAPACITACION DEL PERSONAL
```

Si dice `NO se traslado`, la cuenta no tiene permiso de **escritura** en esa
carpeta: con permiso de solo lectura no basta.

### Lo que queda en la cuenta personal

- El proyecto de Apps Script (no hay alternativa: es lo único que puede recibir
  sin sesión).
- La carpeta de paso, que queda vacía en cuanto el traslado funciona.
- La hoja de resultados, salvo que crees una en Holcim y la compartas con la
  cuenta personal como Editor; en ese caso basta con ponerla en `ID_HOJA`.

### Y el día que TI habilite el acceso anónimo

Nada de esto estorba: se mueve el script a Holcim, se deja `ID_CARPETA_FINAL`
vacía y se apunta `ID_CARPETA_CERTIFICADOS` directamente a la carpeta buena.


---

## Cada centro de trabajo a su propia carpeta

Cada uno de los 15 centros tiene su carpeta, y en Drive no cuelgan todas del
mismo sitio ni a la misma profundidad. Por eso se indican una por una: es
explícito y no depende de que ninguna carpeta conserve su nombre.

En el bloque de configuración, arriba del archivo, están los quince nombres ya
escritos. Solo hay que pegar la URL de cada carpeta:

```js
var CARPETAS_POR_CENTRO = {
  'BARRANCA GEO'        : "https://drive.google.com/drive/folders/1AbC...",
  'BELLO RMX'           : "https://drive.google.com/drive/folders/1DeF...",
  ...
};
```

**No cambies los nombres de la izquierda:** son los que llegan del examen. Si
no coinciden, ese centro se queda sin carpeta.

Pega las URL completas, tal cual las copias de la barra del navegador; el
script extrae lo que necesita.

### Se puede ir llenando poco a poco

El centro que dejes vacío no rompe nada: su certificado va a
`ID_CARPETA_FINAL` y queda anotado en el registro. Así puedes empezar por las
plantas con más gente y completar el resto después.

Por eso conviene dejar `ID_CARPETA_FINAL` puesta aunque llenes los quince: es
la red para quien elija "Otra", y para el día que se abra una planta que
todavía no esté en la tabla.

### Compruébalo antes de confiar

```
verCarpetasDeCentros()
```

```
Centros con carpeta propia: 13 de 15
(los que faltan van a ID_CARPETA_FINAL, no se pierden)

OK  BARRANCA GEO           → BARRANCA GEO
OK  BELLO RMX              → SOPORTES CAPACITACION DEL PERSONAL
FALTA  MEDELLIN            → iria a la carpeta general
...
```

Ejecútala cada vez que añadas direcciones. Es mucho más rápido que descubrir
dentro de un mes que tres centros llevaban semanas cayendo en la carpeta de
repuesto.

Si una URL está mal, el registro lo dice con nombre y apellidos: *"La carpeta
puesta para X no se pudo abrir — revisa esa URL en CARPETAS_POR_CENTRO"*.

### Añadir una planta nueva

Dos pasos: añadirla a `SEDES` en el `index.html` (la lista del desplegable) y
añadir su línea a `CARPETAS_POR_CENTRO`. Mientras no esté, sus certificados
caen en la carpeta general.

### La alternativa automática, por si algún día sirve

Si alguna vez todas las carpetas acaban colgando del mismo sitio y con el
mismo nombre que el desplegable, existe `CARPETA_RAIZ_CENTROS`: se pone esa
carpeta madre y el script busca dentro la que se llame igual. Solo se usa para
los centros que hayas dejado vacíos en la tabla, así que las dos formas pueden
convivir.

### Nunca se pierde un certificado

El orden es: carpeta del centro → `ID_CARPETA_FINAL` → si tampoco, se queda en
la carpeta de paso y lo recoge `moverPendientes()`. Cada salto queda anotado
en el registro de Ejecuciones.
