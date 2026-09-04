/**
 * Proyecto Apps Script "Reinducción HS Web".
 *
 * El curso NO vive aquí: se reparte desde GitHub Pages. Este proyecto es un
 * solo archivo (este) y hace tres cosas, todas por doPost:
 *
 *   1. Recibe los reportes del botón ⚠️ y te los manda por correo.
 *   2. Guarda cada intento del examen en la hoja de cálculo.
 *   3. Archiva en Drive el PDF del certificado de quien aprueba, y deja su
 *      enlace en la columna "Vinculo" de esa hoja.
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

   Si prefieres usar una hoja que ya tengas, pega abajo su ID o directamente la
   URL completa que copiaste del navegador, y el script escribirá en esa.
   ═══════════════════════════════════════════════════════════════════════════ */
var ID_HOJA = "";   // opcional: déjalo vacío para que el script la cree solo

/* ═══════════════════════════════════════════════════════════════════════════
   CARPETA DE CERTIFICADOS EN DRIVE

   Cuando alguien aprueba, el curso manda tambien el PDF del certificado y el
   script lo guarda en esta carpeta. El enlace al archivo queda en la columna
   "Vinculo" de la hoja de resultados.

   No hay que crear la carpeta a mano: se crea sola la primera vez, en "Mi
   unidad" de la cuenta que despliega el script.

   CERTIFICADOS_PUBLICOS controla quien puede abrir el enlace:
     false (recomendado) → solo quien tenga acceso a la carpeta, es decir tu y
            con quien la compartas. El certificado lleva nombre y cedula, que
            son datos personales: no conviene dejarlos abiertos a cualquiera.
     true  → cualquiera con el enlace puede verlo, sin iniciar sesion.
   ═══════════════════════════════════════════════════════════════════════════ */
/* Pega aqui TU carpeta. Sirve igual el identificador suelto o la URL completa
   copiada de la barra del navegador; el script se queda con lo que necesita.
   Dejalo vacio solo si quieres que el script cree una carpeta el solo. */
var ID_CARPETA_CERTIFICADOS = "";
var NOMBRE_CARPETA_CERTIFICADOS = "HSE-001 · Certificados";
var CERTIFICADOS_PUBLICOS = false;

var NOMBRE_HOJA     = "HSE-001 · Resultados examen";
var PESTANA_RESUMEN = "Resultados";
/* El detalle pregunta por pregunta ya NO va en la hoja: va en el PDF del
   certificado, a partir de la hoja 2. Este nombre queda solo para la funcion
   borrarPestanaRespuestas(), que limpia la pestana vieja si aun existe. */
var PESTANA_DETALLE = "Respuestas";

/* Columnas de la pestaña de resumen, en este orden.
   Las cuatro últimas son de diagnóstico: sirven para revisar un intento raro
   (cuántas acertó, cuánto tardó, con qué navegador). Si no las quieres, bórralas
   de esta lista y de la hoja; el script no se rompe.

   IMPORTANTE: si la hoja YA existe, el script NO le cambia el orden ni le borra
   nada. Solo agrega al final las columnas de esta lista que aún no tenga, y
   escribe cada dato buscando su columna por el nombre del encabezado. Así puedes
   reordenar las columnas en la hoja a tu gusto sin descuadrar nada. */
var COLUMNAS_RESUMEN = [
  'Fecha', 'Tipo_Usuario', 'ID_Identificacion', 'Nombre_Completo', 'Empresa',
  'Capacitacion', 'Puntaje', 'Resultado', 'Vinculo',
  'Aciertos', 'Total', 'Duración (s)', 'Navegador'
];

/** Devuelve la hoja de cálculo, creándola la primera vez si hace falta. */
function obtenerHoja_() {
  var props = PropertiesService.getScriptProperties();
  var id = soloId_(ID_HOJA) || props.getProperty('ID_HOJA');
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
  r.appendRow(COLUMNAS_RESUMEN);
  r.setFrozenRows(1);

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
 * Acepta tanto el identificador suelto como la URL completa pegada del
 * navegador, que es lo que uno tiene a mano. Devuelve solo el identificador.
 *   https://drive.google.com/drive/folders/1AbC...  → 1AbC...
 *   https://docs.google.com/spreadsheets/d/1AbC.../edit → 1AbC...
 */
function soloId_(txt) {
  txt = String(txt || '').trim();
  if (!txt) return '';
  var m = txt.match(/\/folders\/([-\w]{20,})/) || txt.match(/\/d\/([-\w]{20,})/) ||
          txt.match(/[?&]id=([-\w]{20,})/);
  return m ? m[1] : txt;
}

/** Devuelve la carpeta de certificados, creándola la primera vez si hace falta. */
function carpetaCertificados_() {
  var props = PropertiesService.getScriptProperties();
  var id = soloId_(ID_CARPETA_CERTIFICADOS) || props.getProperty('ID_CARPETA');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* si ya no existe, se recrea */ }
  }
  // por si ya existe una con ese nombre (por ejemplo, de un despliegue anterior)
  var iguales = DriveApp.getFoldersByName(NOMBRE_CARPETA_CERTIFICADOS);
  var carpeta = iguales.hasNext() ? iguales.next()
                                  : DriveApp.createFolder(NOMBRE_CARPETA_CERTIFICADOS);
  props.setProperty('ID_CARPETA', carpeta.getId());
  return carpeta;
}

/**
 * Guarda el PDF que mandó el curso y devuelve su enlace.
 * Nunca lanza error: si algo falla se devuelve cadena vacía, porque perder el
 * certificado no puede impedir que quede registrado el resultado del examen.
 */
function guardarCertificado_(d) {
  if (!d || !d.certificado) {
    console.warn('El curso no mandó certificado en este intento.');
    return '';
  }
  try {
    console.log('Certificado recibido: ' + Math.round(d.certificado.length * 3 / 4 / 1024) + ' KB');
    var bytes = Utilities.base64Decode(d.certificado);
    var nombre = (d.nombre || 'Sin nombre') + ' - ' + (d.cedula || 's-c') + ' - ' +
                 Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HHmm') + '.pdf';
    var blob = Utilities.newBlob(bytes, 'application/pdf', nombre);
    var archivo = carpetaCertificados_().createFile(blob);
    if (CERTIFICADOS_PUBLICOS) {
      try {
        archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) { /* la organización puede tener prohibido compartir hacia fuera */ }
    }
    console.log('Certificado guardado: ' + archivo.getUrl());
    return archivo.getUrl();
  } catch (e) {
    /* Queda en el registro de Ejecuciones, que es donde se puede mirar despues.
       Se devuelve vacio a proposito: perder el PDF no puede impedir que quede
       registrado el resultado del examen. */
    console.error('No se pudo guardar el certificado: ' + e.message);
    return '';
  }
}

/** Ejecútala UNA VEZ desde el editor para ver la URL de la carpeta. */
function verCarpetaDeCertificados() {
  var url = carpetaCertificados_().getUrl();
  Logger.log('Carpeta de certificados: ' + url);
  return url;
}

/**
 * Escribe una fila buscando cada dato por el NOMBRE de su columna, no por su
 * posición. Si a la hoja le faltan columnas de la lista, se agregan al final.
 * Las columnas que la hoja tenga y no estén en "valores" quedan vacías.
 */
function escribirPorEncabezado_(hoja, columnas, valores) {
  var ancho = Math.max(1, hoja.getLastColumn());
  var encabezados = hoja.getRange(1, 1, 1, ancho).getValues()[0].map(String);

  columnas.forEach(function (c) {
    if (encabezados.indexOf(c) < 0) {
      encabezados.push(c);
      hoja.getRange(1, encabezados.length).setValue(c);
    }
  });

  var fila = encabezados.map(function (c) {
    var v = valores[c];
    return (v === undefined || v === null) ? '' : v;
  });
  hoja.appendRow(fila);
  return hoja.getLastRow();
}

/** Convierte en hipervínculo la celda de una columna, buscándola por su nombre. */
function enlazar_(hoja, fila, columna, url) {
  try {
    var encabezados = hoja.getRange(1, 1, 1, hoja.getLastColumn()).getValues()[0].map(String);
    var col = encabezados.indexOf(columna) + 1;
    if (!col) return;
    var texto = SpreadsheetApp.newRichTextValue().setText(url).setLinkUrl(url).build();
    hoja.getRange(fila, col).setRichTextValue(texto);
  } catch (e) { /* si no se puede, la celda queda con la URL en texto plano */ }
}

/**
 * Ejecútala UNA VEZ desde el editor si quieres borrar la pestaña "Respuestas"
 * que usaban las versiones anteriores. Ese detalle ahora va en el PDF del
 * certificado, a partir de la hoja 2. Borra datos: solo córrela si ya no los
 * necesitas.
 */
function borrarPestanaRespuestas() {
  var ss = obtenerHoja_();
  var h = ss.getSheetByName(PESTANA_DETALLE);
  if (!h) { Logger.log('No hay ninguna pestaña "' + PESTANA_DETALLE + '".'); return; }
  ss.deleteSheet(h);
  Logger.log('Pestaña "' + PESTANA_DETALLE + '" borrada.');
}

/**
 * Llamado desde el curso al calificar el examen. Escribe UNA fila por intento.
 *
 * El detalle pregunta por pregunta no se guarda aquí: va dentro del PDF del
 * certificado, a partir de la hoja 2.
 *
 * La cédula se guarda con un apóstrofo delante para que la hoja no le quite
 * los ceros de la izquierda.
 */
function guardarExamen(d) {
  d = d || {};
  var ss = obtenerHoja_();
  var fecha = d.fecha || new Date().toLocaleString();

  // primero se archiva el PDF: su enlace es uno de los datos de la fila
  var enlaceCert = guardarCertificado_(d);

  /* Un dato por cada nombre de columna posible. Se incluyen también los nombres
     viejos ("Nombre", "Cédula", "Porcentaje", "Aprobado") para que una hoja que
     ya venías usando se siga llenando igual que siempre. */
  var valores = {
    'Fecha': fecha,
    'Tipo_Usuario': d.tipoUsuario || '',
    'ID_Identificacion': "'" + (d.cedula || ''),
    'Nombre_Completo': d.nombre || '',
    'Empresa': d.empresa || '',
    'Capacitacion': d.capacitacion || '',
    'Puntaje': d.puntaje || (d.porcentaje + '%'),
    'Resultado': d.resultado || '',
    'Vinculo': enlaceCert || d.vinculo || '',
    'Aciertos': d.aciertos,
    'Total': d.total,
    'Duración (s)': d.segundos,
    'Navegador': d.navegador || ''
  };
  var hoja = pestana_(ss, PESTANA_RESUMEN, COLUMNAS_RESUMEN);
  var fila = escribirPorEncabezado_(hoja, COLUMNAS_RESUMEN, valores);

  /* El enlace del certificado se deja como hipervinculo de verdad: el texto de
     la celda sigue siendo la direccion, pero es clicable. */
  if (enlaceCert) enlazar_(hoja, fila, 'Vinculo', enlaceCert);

  return { ok: true, certificado: enlaceCert ? 'guardado' : (d.certificado ? 'falló' : 'no llegó') };
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

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DIAGNÓSTICO · ejecútala desde el editor cuando algo no llegue a la hoja
 *
 * Responde las tres preguntas que suelen ser el problema:
 *   1. ¿A qué hoja y a qué carpeta está apuntando este código?
 *   2. ¿Qué columnas tiene hoy la hoja?
 *   3. ¿En qué URL /exec está publicado ESTE código?
 *
 * La tercera es la importante: esa URL tiene que ser EXACTAMENTE la misma que
 * está en la variable REPORTE_URL del index.html. Si no coinciden, el curso le
 * está hablando a una implementación vieja y por eso no ves los cambios.
 * ═══════════════════════════════════════════════════════════════════════════
 */
function diagnostico() {
  var lineas = [];
  try {
    var ss = obtenerHoja_();
    lineas.push('Hoja de resultados: ' + ss.getUrl());
    var h = ss.getSheetByName(PESTANA_RESUMEN);
    if (h) {
      var enc = h.getRange(1, 1, 1, Math.max(1, h.getLastColumn())).getValues()[0];
      lineas.push('Columnas hoy (' + enc.length + '): ' + enc.join(' | '));
      lineas.push('¿Existe la columna "Vinculo"? ' +
                  (enc.map(String).indexOf('Vinculo') >= 0 ? 'sí' : 'NO'));
    } else {
      lineas.push('OJO: no existe la pestaña "' + PESTANA_RESUMEN + '".');
    }
  } catch (e) { lineas.push('ERROR con la hoja: ' + e.message); }

  try {
    lineas.push('Carpeta de certificados: ' + carpetaCertificados_().getUrl());
  } catch (e) { lineas.push('ERROR con la carpeta: ' + e.message); }

  try {
    var url = ScriptApp.getService().getUrl();
    lineas.push('URL /exec de ESTA implementación: ' + (url || '(sin publicar)'));
    lineas.push('→ Debe ser idéntica a REPORTE_URL en el index.html de GitHub.');
  } catch (e) { lineas.push('ERROR con la URL: ' + e.message); }

  var txt = lineas.join('\n');
  Logger.log(txt);
  return txt;
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
