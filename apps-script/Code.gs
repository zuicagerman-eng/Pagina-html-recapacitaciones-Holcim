/**
 * Sirve el curso HSE (alojado en GitHub Pages) dentro del portal interno.
 *
 * IDEA:
 *  - Todo el contenido (HTML + imágenes + audio + PDF) vive en GitHub.
 *  - Este Apps Script LEE el index.html desde GitHub Pages y lo entrega.
 *  - El portal embebe la URL /exec de este script en un <iframe>.
 *
 * VENTAJA: al actualizar GitHub, el portal muestra la última versión
 * automáticamente (no hay que volver a pegar el HTML aquí).
 */

// URL del index.html publicado en GitHub Pages (debe coincidir con BASE del HTML)
var URL_CURSO = "https://zuicagerman-eng.github.io/Pagina-html-recapacitaciones-Holcim/index.html";

// ►► CORREO donde quieres recibir los reportes de problemas ◄◄
var CORREO_REPORTES = "zuica.german@gmail.com";

function doGet(e) {
  var html;
  try {
    html = UrlFetchApp.fetch(URL_CURSO, { muteHttpExceptions: true }).getContentText();
  } catch (err) {
    html = "<h2>No se pudo cargar el curso.</h2><p>" + err + "</p>";
  }
  return HtmlService.createHtmlOutput(html)
    .setTitle("HSE-001 · Reinducción H&S")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    // Permite que el portal lo embeba en un iframe:
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Recibe los reportes de problemas enviados desde el curso y los manda por
 * correo automáticamente. El curso hace POST a la URL /exec de este script
 * (variable REPORTE_URL en el index.html).
 */
function doPost(e) {
  try {
    var d = JSON.parse((e && e.postData && e.postData.contents) || "{}");
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

    // (Opcional) también guardar en una Google Sheet:
    // registrarEnHoja(d);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* (Opcional) Guardar cada reporte en una hoja de cálculo.
   1) Crea una Google Sheet, copia su ID de la URL y pégalo abajo.
   2) Descomenta la línea "registrarEnHoja(d);" en doPost.
function registrarEnHoja(d) {
  var ID_HOJA = "PEGA_AQUI_EL_ID_DE_TU_SHEET";
  var hoja = SpreadsheetApp.openById(ID_HOJA).getSheets()[0];
  hoja.appendRow([ new Date(), d.diapositiva, d.modulo, d.nombre, d.mensaje, d.url, d.navegador ]);
}
*/
