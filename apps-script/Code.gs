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
