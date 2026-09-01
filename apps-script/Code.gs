/**
 * Proyecto Apps Script "Reinducción HS Web".
 *
 * Sirve el curso HSE (pegado como archivo index.html en este mismo proyecto)
 * dentro del portal interno, y recibe los reportes de problemas del botón ⚠️
 * para enviarlos por correo automáticamente.
 *
 * Archivos del proyecto:
 *   - Código.gs  → este archivo
 *   - index.html → pega aquí TODO el contenido del index.html de GitHub
 */

// ►► CORREO donde quieres recibir los reportes de problemas ◄◄
var CORREO_REPORTES = "zuica.german@gmail.com";

/** Sirve el curso (archivo index.html del proyecto) y permite embeberlo en el portal. */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('HSE-001 Reinducción H&S 2026')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXAMEN FINAL → HOJA DE CÁLCULO

   NO tienes que crear la hoja a mano: la primera vez que alguien presente el
   examen, el script crea una hoja llamada "HSE-001 · Resultados examen" en tu
   Google Drive y recuerda su identificador. En el correo de la cuenta que
   despliega el script aparecerá en "Mi unidad".

   Si prefieres usar una hoja que ya tengas, pega su ID aquí (el trozo largo de
   la URL entre /d/ y /edit) y el script escribirá en esa:
   ═══════════════════════════════════════════════════════════════════════════ */
var ID_HOJA = "";   // opcional: déjalo vacío para que el script cree la hoja solo

var NOMBRE_HOJA     = "HSE-001 · Resultados examen";
var PESTANA_RESUMEN = "Resultados";
var PESTANA_DETALLE = "Respuestas";

/** Devuelve la hoja de cálculo, creándola la primera vez si hace falta. */
function obtenerHoja_() {
  var props = PropertiesService.getScriptProperties();
  var id = ID_HOJA || props.getProperty('ID_HOJA');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch (e) { /* se recrea abajo */ }
  }
  var ss = SpreadsheetApp.create(NOMBRE_HOJA);
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
 * Escribe una fila de resumen y una fila por cada pregunta respondida.
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

/** Ejecútala una vez desde el editor para ver la URL de la hoja de resultados. */
function verHojaDeResultados() {
  var ss = obtenerHoja_();
  Logger.log('Hoja de resultados: ' + ss.getUrl());
  return ss.getUrl();
}

/** Llamado por el curso con google.script.run (modo nativo, sin URLs ni CORS). */
function enviarReporte(d) {
  return enviarCorreoReporte(d);
}

/** Llamado por POST (si el curso estuviera en GitHub Pages y usara fetch). */
function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    enviarCorreoReporte(d);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/** Arma y envía el correo con el reporte. */
function enviarCorreoReporte(d) {
  d = d || {};
  var asunto = d.asunto || ("Problema en la diapositiva " + (d.diapositiva || "?"));
  var cuerpo =
    "Se reportó un problema en el curso HSE-001.\n\n" +
    "• Diapositiva: " + (d.diapositiva || "?") + " / " + (d.total || "?") + "\n" +
    "• Módulo: " + (d.modulo || "-") + "\n" +
    "• Reporta: " + (d.nombre || "(anónimo)") + "\n" +
    "• Fecha: " + (d.fecha || "-") + "\n\n" +
    "Descripción del problema:\n" + (d.mensaje || "(sin descripción)") + "\n\n" +
    "-----\n" +
    "URL: " + (d.url || "-") + "\n" +
    "Navegador: " + (d.navegador || "-");
  MailApp.sendEmail(CORREO_REPORTES, asunto, cuerpo);
  return { ok: true };
}

/* ─────────────────────────────────────────────────────────────────────────
   ALTERNATIVA (opcional): en vez de pegar el HTML en index.html, puedes hacer
   que este script LEA el index.html desde GitHub Pages (una sola fuente de
   verdad). Para usarlo, reemplaza el doGet de arriba por este:

   function doGet() {
     var html = UrlFetchApp.fetch(
       "https://zuicagerman-eng.github.io/Pagina-html-recapacitaciones-Holcim/index.html",
       { muteHttpExceptions: true }
     ).getContentText();
     return HtmlService.createHtmlOutput(html)
       .setTitle('HSE-001 Reinducción H&S 2026')
       .addMetaTag('viewport', 'width=device-width, initial-scale=1')
       .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
   }
   (Con esta variante, el reporte usa doPost; en index.html pon REPORTE_URL con
    la URL /exec de este script.)
   ───────────────────────────────────────────────────────────────────────── */
