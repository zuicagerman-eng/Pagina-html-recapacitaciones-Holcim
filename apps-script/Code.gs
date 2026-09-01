/**
 * Proyecto Apps Script "Reinducción HS Web".
 *
 * Sirve el curso HSE (pegado como archivo index.html en este mismo proyecto)
 * dentro del portal interno, recibe los reportes del botón ⚠️ por correo y
 * guarda los resultados del examen final en una hoja de cálculo.
 *
 * Archivos del proyecto:
 *   - Código.gs  → este archivo
 *   - index.html → pega aquí TODO el contenido del index.html de GitHub
 */

// ►► CORREO donde quieres recibir los reportes ◄◄
var CORREO_REPORTES = "german.zuica@holcim.com";

/* ═══════════════════════════════════════════════════════════════════════════
   DÓNDE VIVE EL CURSO

   El curso se reparte desde GitHub Pages, no desde aquí. Así lo abre cualquiera
   sin cuenta de Google y sin depender de las políticas de la organización.

   Este script ya solo hace dos cosas: enviar los correos del botón ⚠️ y guardar
   los resultados del examen en la hoja de cálculo. Ambas llegan por doPost.

   doGet se deja para que cualquier enlace /exec viejo que alguien tenga
   guardado lleve al curso actualizado, en vez de mostrar una copia vieja.
   ═══════════════════════════════════════════════════════════════════════════ */
var URL_CURSO = "https://zuicagerman-eng.github.io/Pagina-html-recapacitaciones-Holcim/index.html";

function doGet() {
  var destino = URL_CURSO.replace(/"/g, '');
  return HtmlService.createHtmlOutput(
      '<!DOCTYPE html><meta charset="utf-8">' +
      '<title>HSE-001 Reinducción H&amp;S 2026</title>' +
      '<p style="font:15px/1.5 system-ui;padding:24px">Abriendo la reinducción… ' +
      'Si no avanza sola, <a id="ir" href="' + destino + '">entra aquí</a>.</p>' +
      '<script>var u="' + destino + '";try{top.location.replace(u)}catch(e){location.replace(u)}<\/script>')
    .setTitle('HSE-001 Reinducción H&S 2026')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


/* ═══════════════════════════════════════════════════════════════════════════
   EXAMEN FINAL → HOJA DE CÁLCULO

   NO tienes que crear la hoja a mano. La primera vez que alguien presente el
   examen, el script crea en tu Drive una hoja llamada
   "HSE-001 · Resultados examen" y recuerda su identificador.

   ¿Dónde queda? En "Mi unidad" de la cuenta con la que despliegas el script.
   Para ver el enlace directo, ejecuta una vez la función verHojaDeResultados().

   Si prefieres usar una hoja que ya tengas, pega su ID abajo (el trozo largo
   de la URL, entre /d/ y /edit) y el script escribirá en esa.
   ═══════════════════════════════════════════════════════════════════════════ */
var ID_HOJA = "";   // opcional: déjalo vacío para que el script la cree solo

var NOMBRE_HOJA     = "HSE-001 · Resultados examen";
var PESTANA_RESUMEN = "Resultados";
var PESTANA_DETALLE = "Respuestas";

/** Devuelve la hoja de cálculo, creándola la primera vez si hace falta. */
function obtenerHoja_() {
  var props = PropertiesService.getScriptProperties();
  var id = ID_HOJA || props.getProperty('ID_HOJA');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* si ya no existe, se recrea */ }
  }
  var ss;
  try {
    ss = SpreadsheetApp.create(NOMBRE_HOJA);
  } catch (e) {
    // Suele pasar por una de dos razones, y el mensaje de Google no lo aclara:
    //  1. La implementación se autorizó ANTES de añadir el código de Hojas, así
    //     que sus permisos son los viejos → hay que volver a autorizar y crear
    //     una NUEVA versión de la implementación.
    //  2. La organización no permite que un script cree archivos en Drive → hay
    //     que crear la hoja a mano y pegar su ID en la variable ID_HOJA.
    throw new Error(
      'No se pudo crear la hoja de resultados. Revisa dos cosas: (1) ejecuta ' +
      'verHojaDeResultados() desde el editor y acepta los permisos de Hojas de ' +
      'cálculo y Drive, y luego publica una NUEVA versión de la implementación; ' +
      '(2) si tu organización no permite crear archivos desde un script, crea la ' +
      'hoja a mano y pega su ID en la variable ID_HOJA. Detalle: ' + e.message);
  }
  props.setProperty('ID_HOJA', ss.getId());

  var r = ss.getActiveSheet();
  r.setName(PESTANA_RESUMEN);
  r.appendRow(['Fecha', 'Nombre', 'Cédula', 'Aciertos', 'Total', 'Porcentaje',
               'Aprobado', 'Duración (s)', 'Navegador']);
  r.setFrozenRows(1);

  var d = ss.insertSheet(PESTANA_DETALLE);
  d.appendRow(['Fecha', 'Nombre', 'Cédula', 'N° pregunta', 'Módulo', 'Pregunta',
               'Respuesta marcada', 'Respuesta correcta', '¿Acertó?']);
  d.setFrozenRows(1);
  return ss;
}

/** Devuelve una pestaña, creándola con sus encabezados si no existe. */
function pestana_(ss, nombre, encabezados) {
  var h = ss.getSheetByName(nombre);
  if (!h) {
    h = ss.insertSheet(nombre);
    h.appendRow(encabezados);
    h.setFrozenRows(1);
  }
  return h;
}

/**
 * Llamado desde el curso con google.script.run al calificar el examen.
 * Escribe una fila de resumen del intento y una fila por pregunta respondida.
 * La cédula se guarda con un apóstrofo delante para que la hoja no le quite
 * los ceros de la izquierda.
 */
function guardarExamen(d) {
  d = d || {};
  var ss = obtenerHoja_();
  var fecha = d.fecha || new Date().toLocaleString();

  pestana_(ss, PESTANA_RESUMEN,
    ['Fecha', 'Nombre', 'Cédula', 'Aciertos', 'Total', 'Porcentaje',
     'Aprobado', 'Duración (s)', 'Navegador'])
    .appendRow([fecha, d.nombre || '', "'" + (d.cedula || ''), d.aciertos, d.total,
                d.porcentaje, d.aprobado, d.segundos, d.navegador || '']);

  var respuestas = d.respuestas || [];
  if (respuestas.length) {
    var detalle = pestana_(ss, PESTANA_DETALLE,
      ['Fecha', 'Nombre', 'Cédula', 'N° pregunta', 'Módulo', 'Pregunta',
       'Respuesta marcada', 'Respuesta correcta', '¿Acertó?']);
    var filas = respuestas.map(function (r) {
      return [fecha, d.nombre || '', "'" + (d.cedula || ''), r.n, r.modulo,
              r.pregunta, r.respondio, r.correcta, r.acierto ? 'SÍ' : 'NO'];
    });
    detalle.getRange(detalle.getLastRow() + 1, 1, filas.length, filas[0].length)
           .setValues(filas);
  }
  return { ok: true };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FORMULARIOS NUEVOS (cualquier cosa que quieras guardar a futuro)
 *
 * No hace falta programar nada aquí para añadir un formulario. Desde el curso
 * basta con llamar a enviarASheet('NombreDeLaPestana', { campo: valor, ... })
 * y esta función se encarga del resto:
 *
 *   · Crea la pestaña con ese nombre si no existe.
 *   · Toma los encabezados de los campos que le mandes.
 *   · Si más adelante añades un campo nuevo, agrega la columna al final sin
 *     dañar lo que ya estaba guardado.
 *   · Siempre agrega una columna "Fecha" al inicio.
 *
 * Los campos que empiezan por "cedula" o "documento" se guardan como texto,
 * para que la hoja no borre los ceros de la izquierda.
 * ═══════════════════════════════════════════════════════════════════════════
 */
function guardarFormulario(d) {
  d = d || {};
  var ss = obtenerHoja_();
  var nombre = String(d.tipo || 'Formulario').substring(0, 90);
  var hoja = ss.getSheetByName(nombre);

  // "tipo" es el nombre de la pestaña y "fecha" ya va en su propia columna
  var campos = [];
  for (var k in d) { if (d.hasOwnProperty(k) && k !== 'tipo' && k !== 'fecha') campos.push(k); }

  if (!hoja) {
    hoja = ss.insertSheet(nombre);
    hoja.appendRow(['Fecha'].concat(campos));
    hoja.setFrozenRows(1);
  }

  var encabezados = hoja.getRange(1, 1, 1, Math.max(1, hoja.getLastColumn()))
                        .getValues()[0].map(String);

  // campos nuevos → columnas nuevas al final, sin tocar lo ya guardado
  campos.forEach(function (c) {
    if (encabezados.indexOf(c) < 0) {
      encabezados.push(c);
      hoja.getRange(1, encabezados.length).setValue(c);
    }
  });

  var fila = encabezados.map(function (c) {
    if (c === 'Fecha') return d.fecha || new Date();
    var v = d[c];
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') return JSON.stringify(v);
    if (/^(cedula|cédula|documento)/i.test(c)) return "'" + v;   // conserva ceros
    return v;
  });

  hoja.appendRow(fila);
  return { ok: true, pestana: nombre };
}

/** Ejecútala UNA VEZ desde el editor para ver la URL de la hoja de resultados. */
function verHojaDeResultados() {
  var url = obtenerHoja_().getUrl();
  Logger.log('Hoja de resultados: ' + url);
  return url;
}


/* ═══════════════════════════════════════════════════════════════════════════
   REPORTE DE PROBLEMAS (botón ⚠️ del curso)
   ═══════════════════════════════════════════════════════════════════════════ */

// Llamado por el curso con google.script.run (nativo, sin URLs ni CORS).
function enviarReporte(d) {
  return enviarCorreoReporte(d);
}

/**
 * Entrada por POST. La usa el curso cuando NO se sirve desde Apps Script
 * (por ejemplo desde GitHub Pages), donde google.script.run no existe.
 * Distingue entre un reporte de problema y un examen por el campo "tipo".
 */
function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    var r;
    if (d.tipo === 'examen')                      r = guardarExamen(d);
    else if (!d.tipo || d.tipo === 'reporte')     r = enviarCorreoReporte(d);
    else                                          r = guardarFormulario(d);
    return ContentService.createTextOutput(JSON.stringify(r || { ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function enviarCorreoReporte(d) {
  d = d || {};
  var asunto = d.asunto || ("Problema en la diapositiva " + (d.diapositiva || "?"));
  var cuerpo =
    "Se reportó un problema en el curso HSE-001.\n\n" +
    "• Diapositiva: " + (d.diapositiva || "?") + " / " + (d.total || "?") + "\n" +
    "• Módulo: " + (d.modulo || "-") + "\n" +
    "• Reporta: " + (d.nombre || "(anónimo)") + "\n" +
    "• Fecha: " + (d.fecha || "-") + "\n\n" +
    "Descripción:\n" + (d.mensaje || "(sin descripción)") + "\n\n" +
    "-----\nURL: " + (d.url || "-") + "\nNavegador: " + (d.navegador || "-");
  MailApp.sendEmail(CORREO_REPORTES, asunto, cuerpo);
  return { ok: true };
}
