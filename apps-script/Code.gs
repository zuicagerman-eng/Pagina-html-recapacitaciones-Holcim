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
