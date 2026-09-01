# Puesta en marcha · HSE-001 Reinducción H&S

Guía para dejar el curso funcionando de punta a punta.
Tiempo estimado: **20 minutos**.

---

## Qué cuenta usar: la **personal**

Usa tu cuenta **personal de Google** (`zuica.german@gmail.com`), no la de Holcim.

**Por qué:** el Workspace de Holcim tiene restringido publicar aplicaciones de
Apps Script hacia fuera de la organización. Con la cuenta de Holcim, quien abra
el curso desde otro correo ve *"No se pudo abrir el archivo en este momento"*.
Ya lo comprobamos: con la cuenta personal carga, con la de Holcim no.

**Los datos de los empleados no quedan expuestos por esto.** Ver el paso 6 si
quieres que la hoja de resultados sea de Holcim y no de tu cuenta personal.

---

## Cómo queda armado

```
GitHub Pages   →  muestra el curso (esto es lo que reparte)
     ↓ manda los datos por POST
Apps Script    →  el cartero: envía correos y escribe en la hoja
     ↓
Google Sheets  →  guarda los resultados
```

Los participantes **nunca abren `script.google.com`**, así que el bloqueo de
Holcim no estorba.

---

## Paso 1 · Crear el proyecto de Apps Script

1. Entra a <https://script.google.com> con tu **cuenta personal**.
2. **Nuevo proyecto**.
3. Arriba a la izquierda, donde dice *"Proyecto sin título"*, ponle:

   ```
   HSE-001 Reinduccion HS - Registro
   ```

   El nombre es solo para que lo reconozcas en tu Drive.
4. Borra todo el contenido de `Código.gs` y pega el archivo **`apps-script/Code.gs`**
   del repositorio.
5. **No** crees ningún archivo HTML. Ya no hace falta: el curso vive en GitHub.

---

## Paso 2 · Revisar dos variables de `Code.gs`

| Variable | Déjala así |
|---|---|
| `CORREO_REPORTES` | `"german.zuica@holcim.com"` — es donde te llegan los reportes del botón ⚠️ |
| `ID_HOJA` | `""` vacío, para que el script cree la hoja solo |

---

## Paso 3 · Autorizar

1. En el desplegable de funciones elige **`verHojaDeResultados`** y presiona **Ejecutar** ▶.
2. Google pedirá autorización. Acepta **Hojas de cálculo**, **Drive** y **Gmail**.
3. Si sale *"Google no ha verificado esta aplicación"*:
   **Configuración avanzada → Ir a HSE-001 Reinduccion HS - Registro (no seguro)**.
   Es normal en cuentas personales y solo lo ves tú, una vez.
4. En el **Registro de ejecución** aparecerá la URL de tu hoja de resultados.
   Guárdala en favoritos.

---

## Paso 4 · Publicar

**Implementar → Nueva implementación → ⚙ Tipo → Aplicación web.**

| Campo | Valor |
|---|---|
| Descripción | `Produccion` |
| Ejecutar como | **Yo (zuica.german@gmail.com)** |
| Quién tiene acceso | **Cualquiera** |

> ⚠️ Ojo con las dos opciones parecidas. **"Cualquiera"** deja entrar sin
> iniciar sesión; *"Cualquier persona que tenga una Cuenta de Google"* exige
> sesión y no sirve.

**Implementar** → copia la **URL que termina en `/exec`**.

> No uses la que termina en `/dev`: esa solo funciona para ti.

Borra las implementaciones viejas ("Sin título", "V1.0") para no confundirte.

---

## Paso 5 · Conectar el curso con el cartero

En GitHub, edita **`index.html`** y busca:

```js
var REPORTE_URL   = "";
```

Pega ahí la URL `/exec` del paso 4:

```js
var REPORTE_URL   = "https://script.google.com/macros/s/AKfy...TU_URL.../exec";
```

Guarda el cambio (*Commit changes*). Es **la única vez** que hay que hacer esto:
por esa misma URL viajan los reportes, el examen y cualquier formulario que
agregues en el futuro.

---

## Paso 6 (opcional) · Que la hoja sea de Holcim

Por defecto la hoja con **nombres y cédulas** queda en tu Drive personal. Como
es dato personal de empleados, quizá prefieras que viva en Holcim:

1. Con tu cuenta **Holcim**, crea una hoja de cálculo vacía en Drive.
2. Compártela con **permiso de editor** a tu cuenta personal.
3. Copia su **ID** de la URL (lo que va entre `/d/` y `/edit`).
4. En `Code.gs` pega ese ID:

   ```js
   var ID_HOJA = "AQUI_EL_ID";
   ```

5. Publica **versión nueva**.

Así el curso se sirve desde la cuenta personal pero **los datos se guardan en
una hoja de Holcim**.

> Si Holcim no permite compartir archivos hacia fuera, este paso no se puede
> hacer y la hoja se queda en tu cuenta personal.

---

## Paso 7 · Repartir el enlace

Reparte **esta**, no la de `script.google.com`:

```
https://zuicagerman-eng.github.io/Pagina-html-recapacitaciones-Holcim/index.html
```

Si vas a embeberlo en el portal interno:

```html
<iframe src="https://zuicagerman-eng.github.io/Pagina-html-recapacitaciones-Holcim/index.html"
        style="width:100%;height:100vh;border:0"
        allow="autoplay; fullscreen; picture-in-picture"></iframe>
```

---

## Paso 8 · Probar antes de repartir

1. Abre el enlace en **incógnito, sin iniciar sesión**, desde el **celular**.
   Debe cargar el curso.
2. Entra al examen (`Ctrl+Shift+A` con PIN `2026` desbloquea todo para revisar).
3. Preséntalo con un nombre de prueba y califica.
4. **Al calificar debe salir el aviso VERDE**: *"✓ Resultado registrado a
   nombre de…"*.
   - Si sale **amarillo**, el dato no llegó: revisa que `REPORTE_URL` esté bien
     pegada y que la implementación esté en *Cualquiera*.
5. Abre la hoja y confirma que llegó la fila.

**Haz esta prueba desde un equipo de Holcim**, que es donde puede aparecer un
bloqueo de red a `script.google.com`. Si el aviso sale amarillo solo ahí, el
curso se ve bien pero los resultados no se están guardando: avísame y buscamos
otra vía.

---

## De aquí en adelante: dónde se cambia cada cosa

| Qué quieres cambiar | Dónde | ¿Republicar en Apps Script? |
|---|---|---|
| Diapositivas, textos, imágenes, GIFs | **GitHub** | No |
| Preguntas del examen (`var BANCO`) | **GitHub** | No |
| Nota mínima, número de preguntas | **GitHub** | No |
| PIN de administrador | **GitHub** | No |
| Correo que recibe los reportes | Apps Script | Sí |
| Hoja de destino (`ID_HOJA`) | Apps Script | Sí |

Casi todo es GitHub, y se ve al instante.

---

## Ajustes rápidos en `index.html`

```js
var PIN_ADMIN            = "2026";   // Ctrl+Shift+A para revisar sin barreras
var PREGUNTAS_EXAMEN     = 20;       // cuántas se sortean del banco de 50
var NOTA_MINIMA          = 80;       // % para aprobar
var EXIGIR_EXAMEN        = true;     // el curso solo se completa al aprobar
var EXIGIR_VIDEO_COMPLETO= true;     // obligar a ver el video entero
var VIDEO_INICIO         = 9;        // segundo donde arranca el video
```
