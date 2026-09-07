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

/* ═══════════════════════════════════════════════════════════════════════════
   ►►►  LO ÚNICO QUE HAY QUE RELLENAR  ◄◄◄

   Pega las URL completas, tal cual las copias de la barra del navegador. El
   script se queda con lo que necesita, así que no hay que recortar nada.

   Cuál va en cuál, que es donde es fácil equivocarse:
     ID_HOJA                 → docs.google.com/spreadsheets/...
     ID_CARPETA_CERTIFICADOS → drive.google.com/drive/folders/...

   Si te equivocas, el script te lo dice y se detiene, en vez de crear una
   hoja o una carpeta nueva por su cuenta.

   Después de rellenarlas: ejecuta probarTodo y mira el registro.
   ═══════════════════════════════════════════════════════════════════════════ */

// 1) Correo donde llegan los reportes, la encuesta y la copia del certificado
var CORREO_REPORTES = "german.zuica@holcim.com";

// 2) Hoja de resultados (docs.google.com/spreadsheets/...)
var ID_HOJA = "";

// 3) Carpeta de certificados (drive.google.com/drive/folders/...)
var ID_CARPETA_CERTIFICADOS = "";

/* 4) OPCIONAL — Carpeta FINAL, normalmente la de la unidad compartida de Holcim.
      Si la pones, cada certificado se guarda primero en la carpeta de arriba y
      enseguida se traslada aquí. Sirve para que los datos personales acaben en
      Holcim aunque el script tenga que seguir viviendo en una cuenta personal
      (que es la única que puede recibir del curso sin iniciar sesión).

      Si el traslado falla —permisos, red, lo que sea— el certificado NO se
      pierde: se queda en la carpeta de arriba y lo recoge moverPendientes()
      la próxima vez. Déjala vacía para no trasladar nada. */
var ID_CARPETA_FINAL = "";

/* ─── de aquí para abajo no hace falta tocar nada ─── */

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

   La hoja se indica arriba, en ID_HOJA. Si se deja vacia, el script crea una
   en el Drive de la cuenta que publico la implementacion y recuerda cual es;
   sirve para empezar, pero para los datos de verdad conviene indicar la hoja
   de Holcim.

   ¿Dónde queda? En "Mi unidad" de la cuenta con la que despliegas el script.
   Para ver el enlace directo, ejecuta una vez la función verHojaDeResultados().

   Si prefieres usar una hoja que ya tengas, pega abajo su ID o directamente la
   URL completa que copiaste del navegador, y el script escribirá en esa.
   ═══════════════════════════════════════════════════════════════════════════ */
/* OJO: aqui va el enlace de la HOJA DE CALCULO
   (https://docs.google.com/spreadsheets/d/...), NO el de la carpeta de Drive.
   El de la carpeta va mas abajo, en ID_CARPETA_CERTIFICADOS. Confundirlos es
   el error mas facil de cometer y deja los resultados en una hoja distinta. */

/* ═══════════════════════════════════════════════════════════════════════════
   CARPETA DE CERTIFICADOS EN DRIVE

   Cuando alguien aprueba, el curso manda tambien el PDF del certificado y el
   script lo guarda en esta carpeta. El enlace al archivo queda en la columna
   "Vinculo" de la hoja de resultados.

   La carpeta se indica arriba, en ID_CARPETA_CERTIFICADOS. Si se deja vacia,
   el script crea una en "Mi unidad" de la cuenta que publico la implementacion,
   que es lo que NO conviene: los certificados llevan datos personales y deben
   quedar en la unidad compartida de Holcim.

   CERTIFICADOS_PUBLICOS controla quien puede abrir el enlace:
     false (recomendado) → solo quien tenga acceso a la carpeta, es decir tu y
            con quien la compartas. El certificado lleva nombre y cedula, que
            son datos personales: no conviene dejarlos abiertos a cualquiera.
     true  → cualquiera con el enlace puede verlo, sin iniciar sesion.
   ═══════════════════════════════════════════════════════════════════════════ */
/* Solo se usa si ID_CARPETA_CERTIFICADOS quedo vacio: es el nombre con el que
   el script crearia una carpeta el solo. */
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
  'Fecha', 'Tipo_Usuario', 'ID_Identificacion', 'Nombre_Completo', 'Centro_Trabajo',
  'Capacitacion', 'Puntaje', 'Resultado', 'Vinculo',
  'Aciertos', 'Total', 'Duración (s)', 'Navegador'
];

/** Devuelve la hoja de cálculo, creándola la primera vez si hace falta. */
function obtenerHoja_() {
  var props = PropertiesService.getScriptProperties();
  var id = soloId_(ID_HOJA) || props.getProperty('ID_HOJA');
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (e) {
      /* Si el identificador viene de ID_HOJA (puesto a mano) y no abre, NO se
         crea una hoja nueva: lo mas probable es que se haya pegado el enlace
         equivocado —por ejemplo el de la carpeta de Drive en vez del de la
         hoja— y crear otra en silencio dejaria los resultados repartidos entre
         dos sitios sin que nadie se entere. Con el identificador recordado por
         el propio script si se sigue de largo: ahi si significa que la hoja se
         borro. */
      if (soloId_(ID_HOJA)) {
        throw new Error(
          'ID_HOJA no corresponde a una hoja de calculo. Comprueba que sea el ' +
          'enlace de la HOJA (docs.google.com/spreadsheets/...) y no el de la ' +
          'carpeta de Drive (drive.google.com/drive/folders/...), que va en ' +
          'ID_CARPETA_CERTIFICADOS. Detalle: ' + e.message);
      }
    }
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
    try {
      return DriveApp.getFolderById(id);
    } catch (e) {
      /* Antes este catch se tragaba CUALQUIER fallo y seguia de largo a buscar
         por nombre, asi que un problema de permisos aparecia despues y parecia
         otra cosa; y con un identificador mal copiado el script creaba una
         carpeta nueva en silencio. Ahora solo se sigue de largo si la carpeta
         de verdad no esta; lo demas se cuenta tal cual. */
      var msg = String(e && e.message || e);
      if (/permission|permis|autoriza|scope|access/i.test(msg)) {
        throw new Error('Falta autorizar el acceso a Drive. Abre el editor, ejecuta ' +
          'probarTodo y acepta los permisos que pida Google. Detalle: ' + msg);
      }
      throw new Error('No se pudo abrir la carpeta con ese identificador. Revisa ' +
        'ID_CARPETA_CERTIFICADOS: pega la URL completa de la carpeta, tal cual la ' +
        'copias de la barra del navegador. Detalle: ' + msg);
    }
  }
  // sin identificador configurado: se busca por nombre y, si no esta, se crea
  var iguales = DriveApp.getFoldersByName(NOMBRE_CARPETA_CERTIFICADOS);
  var carpeta = iguales.hasNext() ? iguales.next()
                                  : DriveApp.createFolder(NOMBRE_CARPETA_CERTIFICADOS);
  props.setProperty('ID_CARPETA', carpeta.getId());
  return carpeta;
}

/** Devuelve la carpeta final, o null si no se configuró ninguna. */
function carpetaFinal_() {
  var id = soloId_(ID_CARPETA_FINAL);
  if (!id) return null;
  return DriveApp.getFolderById(id);   // si falla, que se vea el motivo
}

/**
 * Traslada un archivo a la carpeta final. Devuelve un texto con lo que pasó.
 *
 * Nunca lanza error hacia fuera: el certificado ya está guardado y con enlace
 * válido, así que un fallo aquí no puede tumbar el registro del examen. El
 * archivo se queda donde está y moverPendientes() lo recoge después.
 */
function trasladar_(archivo) {
  var destino;
  try {
    destino = carpetaFinal_();
  } catch (e) {
    console.error('No se pudo abrir la carpeta final: ' + e.message);
    return 'carpeta final inaccesible';
  }
  if (!destino) return 'sin carpeta final';
  try {
    archivo.moveTo(destino);
    console.log('Certificado trasladado a ' + destino.getName());
    return 'trasladado';
  } catch (e) {
    /* Lo mas comun: la cuenta que ejecuta no tiene permiso de escritura en esa
       carpeta, o la unidad compartida no admite mover archivos desde fuera. */
    console.error('No se pudo trasladar el certificado: ' + e.message +
                  ' — se queda en la carpeta de origen y lo recogera moverPendientes().');
    return 'pendiente';
  }
}

/**
 * RECOGE LOS QUE SE QUEDARON ATRÁS
 *
 * Recorre la carpeta de origen y traslada a la carpeta final todo lo que
 * encuentre. Sirve para dos cosas: recuperar los que fallaron en su momento, y
 * llevarse de una vez los que ya estaban guardados antes de configurar esto.
 *
 * Se puede dejar programada: en el editor, ⏰ Activadores → Añadir activador →
 * moverPendientes → Según tiempo → Cada hora. Así no hay que acordarse.
 */
function moverPendientes() {
  var destino = carpetaFinal_();
  if (!destino) { Logger.log('No hay carpeta final configurada (ID_CARPETA_FINAL).'); return 'sin carpeta final'; }
  var origen = carpetaCertificados_();
  if (origen.getId() === destino.getId()) { Logger.log('Origen y destino son la misma carpeta.'); return 'misma carpeta'; }

  var archivos = origen.getFiles();
  var movidos = 0, fallidos = 0, primerFallo = '';
  while (archivos.hasNext()) {
    var a = archivos.next();
    try { a.moveTo(destino); movidos++; }
    catch (e) { fallidos++; if (!primerFallo) primerFallo = e.message; }
  }
  var txt = 'Trasladados: ' + movidos + ' · No se pudo con: ' + fallidos +
            (primerFallo ? ('\nPrimer fallo: ' + primerFallo) : '');
  Logger.log(txt);
  return txt;
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
    /* AAAA.MM.DD APELLIDO1 APELLIDO2 NOMBRES — asi ordena solo por fecha en
       Drive, y el nombre viene ya en mayusculas desde el formulario del curso. */
    var nombre = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy.MM.dd') +
                 ' ' + (d.nombre || 'SIN NOMBRE') + '.pdf';
    var blob = Utilities.newBlob(bytes, 'application/pdf', nombre);
    var archivo = carpetaCertificados_().createFile(blob);
    if (CERTIFICADOS_PUBLICOS) {
      try {
        archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) { /* la organización puede tener prohibido compartir hacia fuera */ }
    }
    /* Se traslada a la carpeta de Holcim si esta configurada. El enlace se lee
       DESPUES del traslado: el identificador no cambia al mover, pero asi se
       devuelve lo que de verdad quedo. */
    trasladar_(archivo);
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

/**
 * SEGUNDA RUTA DE SEGURIDAD
 *
 * Manda una copia del certificado al mismo correo donde llegan los reportes de
 * problemas y la encuesta de satisfacción (CORREO_REPORTES). Así, si un día
 * Drive falla, se llena la cuota o alguien borra la carpeta por error, el PDF
 * sigue existiendo en el buzón.
 *
 * Nunca interrumpe nada: si el correo falla, el resultado del examen ya quedó
 * guardado en la hoja y el certificado ya se descargó en el equipo de la
 * persona. El fallo queda anotado en el registro de Ejecuciones.
 *
 * OJO CON LA CUOTA: una cuenta gratuita permite 100 destinatarios al día, y
 * ahora cada examen aprobado gasta uno (más otro si la persona responde la
 * encuesta). Con el ritmo previsto —unas 100 personas al mes— sobra de largo.
 * Si algún día se cita a mucha gente el mismo día, pon COPIA_CERTIFICADO_CORREO
 * en false y quedará solo la copia de Drive.
 */
var COPIA_CERTIFICADO_CORREO = true;

function enviarCopiaCertificado_(d, enlaceDrive) {
  if (!COPIA_CERTIFICADO_CORREO) return 'apagada';
  if (!d || !d.certificado) return 'sin PDF';
  if (!CORREO_REPORTES) return 'sin correo configurado';
  try {
    var bytes  = Utilities.base64Decode(d.certificado);
    var nombre = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy.MM.dd') +
                 ' ' + (d.nombre || 'SIN NOMBRE') + '.pdf';
    var blob   = Utilities.newBlob(bytes, 'application/pdf', nombre);

    var cuerpo =
      'Copia de respaldo del certificado de la reinducción HSE-001.\n\n' +
      '• Nombre: '    + (d.nombre || '-') + '\n' +
      '• Documento: ' + (d.cedula || '-') + '\n' +
      '• Tipo: '      + (d.tipoUsuario || '-') + '\n' +
      '• Centro de trabajo: ' + (d.empresa || '-') + '\n' +
      '• Puntaje: '   + (d.puntaje || '-') + '\n' +
      '• Resultado: ' + (d.resultado || '-') + '\n' +
      '• Fecha: '     + (d.fecha || new Date().toLocaleString()) + '\n\n' +
      (enlaceDrive
        ? 'También quedó guardado en Drive:\n' + enlaceDrive + '\n'
        : 'AVISO: este certificado NO se pudo guardar en Drive. Esta copia por ' +
          'correo es la única que queda; revisa el registro de Ejecuciones del ' +
          'script para ver por qué falló.\n') +
      '\n— Enviado automáticamente por el curso HSE-001.';

    MailApp.sendEmail({
      to: CORREO_REPORTES,
      subject: 'Certificado HSE-001 · ' + (d.nombre || 'Sin nombre') +
               ' · ' + (d.resultado || ''),
      body: cuerpo,
      attachments: [blob]
    });
    console.log('Copia del certificado enviada a ' + CORREO_REPORTES);
    return 'enviada';
  } catch (e) {
    console.error('No se pudo enviar la copia del certificado: ' + e.message);
    return 'falló';
  }
}

/**
 * RENOMBRA LOS CERTIFICADOS VIEJOS
 *
 * Los que se guardaron antes conservan el formato anterior:
 *   NOMBRE - 1020827914 - 2026-09-07 1500.pdf
 * y esta función los deja con el nuevo:
 *   2026.09.07 NOMBRE.pdf
 *
 * Toma la fecha del propio nombre del archivo, no la de hoy, para no falsear
 * cuándo se emitió cada certificado. Si no consigue leerla, usa la fecha de
 * creación del archivo en Drive.
 *
 * Solo toca los que empiezan por letra —los ya renombrados empiezan por el
 * año— así que se puede ejecutar dos veces sin estropear nada.
 */
function renombrarCertificados() {
  var carpetas = [];
  try { carpetas.push(carpetaCertificados_()); } catch (e) {}
  try { var f = carpetaFinal_(); if (f) carpetas.push(f); } catch (e) {}
  if (!carpetas.length) { Logger.log('No se pudo abrir ninguna carpeta.'); return 'sin carpetas'; }

  var hechos = 0, saltados = 0, fallos = 0, ejemplos = [];
  carpetas.forEach(function (carpeta) {
    var it = carpeta.getFiles();
    while (it.hasNext()) {
      var a = it.next();
      var viejo = a.getName();
      if (!/\.pdf$/i.test(viejo)) { saltados++; continue; }
      if (/^\d{4}\.\d{2}\.\d{2} /.test(viejo)) { saltados++; continue; }   // ya renombrado

      /* Formato anterior: "NOMBRE - CEDULA - yyyy-MM-dd HHmm.pdf". Se parte por
         " - " y se toma la primera parte como nombre y la fecha de la ultima. */
      var cuerpo = viejo.replace(/\.pdf$/i, '');
      var trozos = cuerpo.split(' - ');
      var nombre = trozos[0].trim();
      var fecha = '';
      var m = cuerpo.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (m) fecha = m[1] + '.' + m[2] + '.' + m[3];
      else fecha = Utilities.formatDate(a.getDateCreated(), Session.getScriptTimeZone(), 'yyyy.MM.dd');

      if (!nombre) { saltados++; continue; }
      try {
        a.setName(fecha + ' ' + nombre.toUpperCase() + '.pdf');
        hechos++;
        if (ejemplos.length < 3) ejemplos.push(viejo + '  →  ' + a.getName());
      } catch (e) { fallos++; }
    }
  });

  var txt = 'Renombrados: ' + hechos + ' · Ya estaban bien o no aplican: ' + saltados +
            ' · No se pudo con: ' + fallos +
            (ejemplos.length ? ('\n\nEjemplos:\n  ' + ejemplos.join('\n  ')) : '');
  Logger.log(txt);
  return txt;
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
    'Centro_Trabajo': d.empresa || '',
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

  /* Segunda ruta: la copia por correo va DESPUÉS de escribir la fila, para que
     un fallo del correo no impida que el resultado quede registrado. */
  var copia = enviarCopiaCertificado_(d, enlaceCert);

  return {
    ok: true,
    certificado: enlaceCert ? 'guardado' : (d.certificado ? 'falló' : 'no llegó'),
    copiaCorreo: copia
  };
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
/**
 * De quién es un archivo o una carpeta. Al mudar los datos al dominio Holcim
 * esto es lo que hay que mirar: si el dueño sigue siendo la cuenta personal,
 * los datos NO se movieron, solo se cambió el enlace.
 */
function duenio_(archivoOCarpeta) {
  try {
    var d = archivoOCarpeta.getOwner();
    return d ? d.getEmail() : '(sin dueño visible: unidad compartida)';
  } catch (e) {
    return '(no se pudo leer: ' + e.message + ')';
  }
}

/**
 * PRUEBA COMPLETA — ejecútala UNA VEZ desde el editor antes de soltar el curso.
 *
 * Hace de verdad todo el recorrido con una persona inventada: escribe una fila
 * en la hoja, guarda un PDF en la carpeta de Drive y te manda la copia por
 * correo. Luego borra la fila y el PDF de prueba, así que no ensucia nada.
 *
 * Si algo falla, el mensaje dice exactamente qué paso fue.
 */
function probarTodo() {
  var lineas = [];
  var pdfPrueba = Utilities.base64Encode(Utilities.newBlob(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n' +
    'trailer<</Root 1 0 R>>', 'application/pdf').getBytes());

  var d = {
    nombre: 'PRUEBA - borrar', cedula: '000000000', tipoUsuario: 'Propio',
    empresa: 'PRUEBA', capacitacion: 'HSE-001 · Reinducción H&S',
    puntaje: '100%', resultado: 'APROBADO', aciertos: 20, total: 20,
    segundos: 1, navegador: 'prueba', fecha: new Date().toLocaleString(),
    certificado: pdfPrueba
  };

  var archivo = null, hoja = null, fila = 0;

  /* Con que cuenta esta corriendo el script. Si el navegador tiene varias
     cuentas de Google abiertas, la pantalla de permisos puede salir con otra,
     y esa no ve la carpeta de Drive: es la causa mas facil de confundir con un
     identificador mal puesto. */
  try {
    var quien = Session.getEffectiveUser().getEmail();
    lineas.push('0. Cuenta que ejecuta ...... ' + (quien || '(no se pudo leer)'));
    lineas.push('   Tiene que ser la DUEÑA de la carpeta de Drive.');
  } catch (e) {
    /* Leer el correo pide un permiso mas que no vale la pena aniadir solo para
       esto. Si no se puede, la comprobacion util sigue siendo la del paso 2:
       si la carpeta abre, la cuenta es la correcta. */
    lineas.push('0. Cuenta que ejecuta ...... (Google no lo dice sin un permiso extra;');
    lineas.push('   no hace falta: si el paso 2 abre TU carpeta, la cuenta es la buena)');
  }

  try {
    var ss = obtenerHoja_();
    hoja = pestana_(ss, PESTANA_RESUMEN, COLUMNAS_RESUMEN);
    lineas.push('1. Hoja de resultados ...... OK  ' + ss.getUrl());
    lineas.push('   dueño: ' + duenio_(DriveApp.getFileById(ss.getId())));
  } catch (e) { lineas.push('1. Hoja de resultados ...... FALLÓ: ' + e.message); }

  var enlace = '';
  try {
    var carpeta = carpetaCertificados_();
    lineas.push('2. Carpeta de Drive ........ OK  ' + carpeta.getUrl());
    lineas.push('   dueño: ' + duenio_(carpeta));
    enlace = guardarCertificado_(d);
    if (enlace) {
      lineas.push('3. Guardar el PDF .......... OK  ' + enlace);
      /* Se busca el archivo aparte: si el identificador no se pudiera sacar de
         la URL, el paso 3 ya salió bien y no debe marcarse como fallo; solo se
         queda el PDF de prueba sin borrar. */
      try {
        var id = (enlace.match(/[-\w]{25,}/) || [])[0];
        if (id) archivo = DriveApp.getFileById(id);
      } catch (e2) { lineas.push('   (el PDF de prueba habrá que borrarlo a mano)'); }

      /* Donde acabo de verdad el PDF: es lo que dice si el traslado a la
         carpeta de Holcim funciono o si se quedo en la de origen. */
      if (soloId_(ID_CARPETA_FINAL)) {
        try {
          var padres = archivo.getParents();
          var donde = padres.hasNext() ? padres.next() : null;
          var fin = carpetaFinal_();
          var ok = donde && fin && donde.getId() === fin.getId();
          lineas.push('3b. Traslado a Holcim ...... ' + (ok ? 'OK' : 'NO se traslado'));
          lineas.push('    quedo en: ' + (donde ? donde.getName() : '(no se pudo leer)'));
          if (!ok) lineas.push('    revisa que la cuenta tenga permiso de ESCRITURA en esa carpeta');
        } catch (e3) { lineas.push('3b. Traslado a Holcim ...... no se pudo comprobar: ' + e3.message); }
      }
    } else {
      lineas.push('3. Guardar el PDF .......... FALLÓ (mira el registro de Ejecuciones)');
    }
  } catch (e) { lineas.push('2-3. Drive ................. FALLÓ: ' + e.message); }

  try {
    var r = enviarCopiaCertificado_(d, enlace);
    lineas.push('4. Copia por correo ........ ' + (r === 'enviada' ? 'OK  → ' + CORREO_REPORTES : r));
  } catch (e) { lineas.push('4. Copia por correo ........ FALLÓ: ' + e.message); }

  try {
    if (hoja) {
      fila = escribirPorEncabezado_(hoja, COLUMNAS_RESUMEN, {
        'Fecha': d.fecha, 'Nombre_Completo': d.nombre, 'Resultado': d.resultado,
        'Vinculo': enlace || ''
      });
      lineas.push('5. Escribir la fila ........ OK  (fila ' + fila + ')');
      lineas.push('   enlace que quedo en Vinculo: ' + (enlace || '(VACIO — el PDF no se guardo)'));
    }
  } catch (e) { lineas.push('5. Escribir la fila ........ FALLÓ: ' + e.message); }

  // limpieza: la prueba no debe dejar rastro
  try { if (fila > 1) hoja.deleteRow(fila); } catch (e) {}
  try { if (archivo) archivo.setTrashed(true); } catch (e) {}
  lineas.push('6. Limpieza ................ hecha (fila y PDF de prueba borrados)');

  try {
    var url = ScriptApp.getService().getUrl() || '';
    lineas.push('');
    if (/\/dev$/.test(url)) {
      /* Ejecutando desde el editor, Google devuelve la direccion de PRUEBAS
         (termina en /dev), que lleva otro codigo distinto al de la publicada.
         Compararla con REPORTE_URL no sirve de nada y solo confunde. */
      lineas.push('Direccion de PRUEBAS (la del editor, termina en /dev):');
      lineas.push('  ' + url);
      lineas.push('No la compares con REPORTE_URL: la publicada es otra y termina');
      lineas.push('en /exec. La ves en Implementar → Administrar implementaciones.');
    } else if (url) {
      lineas.push('URL publicada de esta implementación:');
      lineas.push('  ' + url);
      lineas.push('Tiene que ser IDÉNTICA a REPORTE_URL en el index.html.');
    } else {
      lineas.push('Todavía no hay ninguna implementación publicada.');
    }
  } catch (e) {}

  var txt = lineas.join('\n');
  Logger.log(txt);
  return txt;
}

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

/**
 * QUÉ TIENE RECORDADO EL SCRIPT
 *
 * Cuando ID_HOJA e ID_CARPETA_CERTIFICADOS están vacíos, el script usa lo que
 * recordó la primera vez. Eso es cómodo, pero cuesta de ver: si alguna vez creó
 * una hoja o una carpeta por error, se queda apuntando ahí y no hay forma de
 * saberlo mirando el código.
 *
 * Ejecuta esta función para ver a dónde está apuntando de verdad.
 */
function verLoRecordado() {
  var props = PropertiesService.getScriptProperties();
  var lineas = [
    'Hoja recordada:    ' + (props.getProperty('ID_HOJA') || '(ninguna)'),
    'Carpeta recordada: ' + (props.getProperty('ID_CARPETA') || '(ninguna)'),
    '',
    'Lo que manda es lo que esté escrito en ID_HOJA e ID_CARPETA_CERTIFICADOS;',
    'esto de arriba solo se usa cuando esas dos variables están vacías.'
  ];
  var txt = lineas.join('\n');
  Logger.log(txt);
  return txt;
}

/**
 * BORRA lo recordado, para que el script vuelva a empezar de cero.
 *
 * Úsala si alguna vez se quedó apuntando a una hoja o una carpeta equivocadas.
 * No borra ningún archivo: solo olvida las direcciones. En la siguiente
 * ejecución, si ID_HOJA e ID_CARPETA_CERTIFICADOS siguen vacías, creará una
 * hoja y una carpeta NUEVAS. Por eso lo recomendable es escribir en esas dos
 * variables las tuyas de verdad, y así no depender de lo recordado.
 */
function olvidarLoRecordado() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('ID_HOJA');
  props.deleteProperty('ID_CARPETA');
  Logger.log('Listo: el script ya no recuerda ninguna hoja ni carpeta.\n' +
             'Escribe las tuyas en ID_HOJA e ID_CARPETA_CERTIFICADOS antes de ' +
             'volver a ejecutar, o creará unas nuevas.');
  return 'olvidado';
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
