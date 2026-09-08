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

   ⚠️ PENDIENTE — LEER ANTES DE DEJAR ESTO QUIETO
   Las direcciones de abajo (la hoja, las 15 carpetas de centro y la de otros)
   estan escritas aqui de forma TEMPORAL, para que copiar este archivo al editor
   no borre la configuracion: eso ya paso una vez y los examenes acabaron en una
   hoja que el script se creo solo.
   El repositorio es PUBLICO. Un enlace no da acceso por si solo —eso lo deciden
   los permisos de Drive— pero apunta a datos personales, asi que cuando el curso
   deje de cambiar hay que vaciarlas de aqui y dejarlas solo en Apps Script, o
   pasarlas a Propiedades del script. Ver el aviso de LEEME.md.
   ═══════════════════════════════════════════════════════════════════════════ */

// 1) Correo donde llegan los reportes, la encuesta y la copia del certificado
var CORREO_REPORTES = "german.zuica@holcim.com";

// 2) Hoja de resultados (docs.google.com/spreadsheets/...)
var ID_HOJA = "https://docs.google.com/spreadsheets/d/1xD-o9cXWLWf78x-58dUhow2-zhZ9utVjrjh6cv3RPls/edit?gid=0#gid=0";

// 3) Carpeta de certificados (drive.google.com/drive/folders/...)
var ID_CARPETA_CERTIFICADOS = "https://drive.google.com/drive/folders/1LExNIvC0PP0CSRVn79bg1m4yPfdvXJ4l";

/* 4) OPCIONAL — Carpeta FINAL, normalmente la de la unidad compartida de Holcim.
      Si la pones, cada certificado se guarda primero en la carpeta de arriba y
      enseguida se traslada aquí. Sirve para que los datos personales acaben en
      Holcim aunque el script tenga que seguir viviendo en una cuenta personal
      (que es la única que puede recibir del curso sin iniciar sesión).

      Si el traslado falla —permisos, red, lo que sea— el certificado NO se
      pierde: se queda en la carpeta de arriba y lo recoge moverPendientes()
      la próxima vez. Déjala vacía para no trasladar nada. */
var ID_CARPETA_FINAL = "";

/* 5) CADA CENTRO DE TRABAJO A SU CARPETA
      Pega al lado de cada centro la URL de SU carpeta, tal cual la copias de
      la barra del navegador. Los nombres de la izquierda son los mismos del
      desplegable del curso: no los cambies, son los que llegan del examen.

      El que dejes vacío no se rompe: su certificado va a ID_CARPETA_FINAL y
      queda anotado en el registro. Puedes ir llenándolos poco a poco.

      Cuando termines, ejecuta verCarpetasDeCentros() para ver los quince de
      una vez antes de confiar en el reparto. */
var CARPETAS_POR_CENTRO = {
  'BARRANCA GEO'        : "https://drive.google.com/drive/u/0/folders/1l-Z_FIYFWGGUDWkxwIjsvwzBgKShU3-r",
  'BELLO RMX'           : "https://drive.google.com/drive/u/0/folders/16NoHm433BSUJxUGyV1Gf-7jEyN5mxFGO",
  'CHIA RMX'            : "https://drive.google.com/drive/u/0/folders/1KUAEz4hVryZUpyhD5CvfGZHbUDpNtDzX",
  'FUNDACION'           : "https://drive.google.com/drive/u/0/folders/15JmD_wRyfYkcKEhyoPqKNiRaU5irz6A0",
  'GEOCYCLE - AF NOBSA' : "https://drive.google.com/drive/u/0/folders/1OOo6woFAin4LFgq_DCUfjfp2rgffxRoH",
  'MEDELLIN'            : "",   // sin carpeta propia: va a CARPETA_OTROS
  'MONDOÑEDO AGG'       : "https://drive.google.com/drive/u/0/folders/1PHWHu6-H7q6ufIXN5IEB_lu90i0ITmM8",
  'NOBSA - TUNJA RMX'   : "https://drive.google.com/drive/u/0/folders/1NmVthMiObcRU3B4egnQ5H1jsIPYQlrFI",
  'NOBSA CEM'           : "https://drive.google.com/drive/u/0/folders/1XVxdrRywd8IDVnEbLyT7TK9lXxWEejN2",
  'PUENTE ARANDA RMX'   : "https://drive.google.com/drive/u/0/folders/1EO5EjpaKX3pzosKTyr7C8_APgmQJacuR",
  'SIBATE RMX'          : "https://drive.google.com/drive/u/0/folders/1_Z9-GSENZyoHd4Jvs3xQ7YD1nUHzYsSY",
  'TELEPORT CORP'       : "https://drive.google.com/drive/u/0/folders/1sHm47PoqY5OqdolLj8Dj0tfZXACEpe6F",
  'TOCANCIPA TQC'       : "https://drive.google.com/drive/u/0/folders/1jJfv_s0nWXRGUCBuG-MnGiZiHYutb-db",
  'TRANSCEM'            : "https://drive.google.com/drive/u/0/folders/1C_4kIHfPhFQK7qWM_jTGA6iYchvc7OlB",
  'VALLE'               : "https://drive.google.com/drive/u/0/folders/1zMKQRGU3DoHxPYo4O-7Mqmd7eF1j_tXh"
};

/* 6) LOS QUE NO SON DE PLANTA
      Contratistas, visitantes y quien elija "Otra" como centro de trabajo no
      van a la carpeta de una planta: van todos aquí.

      Se decide ANTES que la carpeta del centro. Es decir, un contratista de
      NOBSA CEM acaba aquí, no en NOBSA CEM. */
var CARPETA_OTROS = "https://drive.google.com/drive/u/0/folders/1aC6LgMbE9yR9vObLAgcgufgtp8lqpNuX";

/* Tipos de usuario que van a CARPETA_OTROS, sean del centro que sean. Tiene
   que coincidir con los tipos del desplegable del curso. */
var TIPOS_A_OTROS = ['Contratista', 'Visitante'];

/* 6b) OPCIONAL — Alternativa a la tabla del punto 5: la carpeta que CONTIENE
       las de los centros, para que el script busque la que se llame igual que
       el centro. Solo se usa para los centros que dejaste vacíos arriba. Sirve
       si algún día todas cuelgan del mismo sitio. */
var CARPETA_RAIZ_CENTROS = "";

/* 6) OPCIONAL — Ruta DENTRO de la carpeta de cada centro, si los certificados
      no van en la raíz sino más adentro. Se escribe con barras, tal como se
      lee en Drive, y tiene que ser la misma en todos los centros. Ejemplo:

      var SUBRUTA_CENTRO = "3. Procesos de Operación y Apoyo/3.1 Capacitaciones/1. Capacitaciones H&S/3. SOPORTES CAPACITACION DEL PERSONAL";

      Déjala vacía si el certificado va directo en la carpeta del centro.
      El script NO crea carpetas: si algún tramo no existe, avisa y usa la
      carpeta del centro que sí encontró. */
var SUBRUTA_CENTRO = "";

/* 7) LA URL PUBLICADA (la que está en REPORTE_URL del index.html).
      Solo sirve para comprobarPublicacion(), que pregunta a la implementación
      qué versión del código está atendiendo de verdad. */
var URL_EXEC_PUBLICADA = "https://script.google.com/macros/s/AKfycbzkHY0ugVub450O7yNT08YagD1YMgSsdFGRIKUz9fnuxvABvzHQaFysxpmVCT15HqDs/exec";

/* 8) SOLO PARA TRAER FILAS DE OTRA HOJA — se deja vacía el resto del tiempo.
      Pega aquí la hoja de la que quieras traer las filas, ejecuta mudarLaHoja()
      UNA VEZ y vuelve a vaciarla. Copia a la hoja del punto 2, sin borrar nada
      de la de origen. */
var HOJA_ANTERIOR = "";

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

/* SELLO DE VERSION DE ESTE ARCHIVO
   El curso no habla con el codigo del editor, sino con el de la implementacion
   PUBLICADA. Pegar el archivo y no publicar version nueva deja las dos cosas
   distintas sin que nada avise: probarTodo pasa —usa el editor— y los examenes
   siguen atendidos por el codigo viejo. Este sello es lo que permite verlo:
   comprobarPublicacion() se lo pregunta a la implementacion y compara.
   Subelo cada vez que cambie algo de fondo. */
var VERSION_GS = "2026-09-08-c";

function doGet(e) {
  /* ?ping=1 devuelve la version que esta atendiendo. No toca nada: es la unica
     forma de saber, desde fuera, si lo publicado es lo que hay en el editor.
     Una implementacion vieja no conoce el parametro y contesta con la pagina de
     siempre, que ya es la respuesta: esta desactualizada. */
  if (e && e.parameter && e.parameter.ping) {
    return ContentService.createTextOutput(JSON.stringify({ ok: true, version: VERSION_GS }))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
  'Fecha', 'Tipo_Usuario', 'ID_Identificacion', 'Nombre_Completo', 'Centro_Trabajo', 'Empresa',
  'Capacitacion', 'Puntaje', 'Resultado', 'Vinculo',
  'Aciertos', 'Total', 'Duración (s)', 'Navegador'
];

/** Devuelve la hoja de cálculo, creándola la primera vez si hace falta. */
function obtenerHoja_() {
  var props = PropertiesService.getScriptProperties();
  var puesta = soloId_(ID_HOJA);
  var id = puesta || props.getProperty('ID_HOJA');
  if (id) {
    try {
      var abierta = SpreadsheetApp.openById(id);
      /* Que ID_HOJA este vacia no es un detalle: significa que se esta
         escribiendo en la hoja que el script recordo, que puede ser una que
         creo el solo hace semanas. Pegar este archivo encima borra ID_HOJA, y
         entonces los examenes se van a esa hoja fantasma sin que nada avise. */
      if (!puesta) {
        console.warn('ID_HOJA esta VACIA. Se escribe en la hoja recordada: "' +
                     abierta.getName() + '"  ' + abierta.getUrl() +
                     '\nSi no es la que quieres, rellena ID_HOJA. Ejecuta verDondeEscribe().');
      }
      return abierta;
    } catch (e) {
      /* Si el identificador viene de ID_HOJA (puesto a mano) y no abre, NO se
         crea una hoja nueva: lo mas probable es que se haya pegado el enlace
         equivocado —por ejemplo el de la carpeta de Drive en vez del de la
         hoja— y crear otra en silencio dejaria los resultados repartidos entre
         dos sitios sin que nadie se entere. Con el identificador recordado por
         el propio script si se sigue de largo: ahi si significa que la hoja se
         borro. */
      if (soloId_(ID_HOJA)) {
        /* Dos causas muy distintas dan aqui, y el mensaje de Google no las
           separa: el enlace equivocado, o una hoja de otra cuenta que no esta
           compartida con esta. Decir siempre "el enlace esta mal" manda a
           revisar lo que ya estaba bien. */
        if (esFaltaDePermiso_(e)) {
          throw new Error(
            'La hoja de ID_HOJA existe, pero ' + cuentaDelScript_() + ' no tiene ' +
            'permiso para abrirla. Abrela en Drive, pulsa Compartir y da acceso de ' +
            'EDITOR a esa cuenta. Detalle: ' + e.message);
        }
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
  console.warn('SE ACABA DE CREAR UNA HOJA NUEVA porque ID_HOJA estaba vacia:\n  ' +
               ss.getUrl() + '\nLos resultados van a caer AHI, no en la hoja de Holcim. ' +
               'Rellena ID_HOJA y ejecuta verDondeEscribe() para comprobarlo.');

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

/* Para comparar nombres de carpeta con lo que eligió la persona sin que un
   acento, un espacio de más o unas mayúsculas lo estropeen. */
function pad_(t, n) {
  t = String(t);
  while (t.length < n) t += ' ';
  return t;
}

function normaliza_(t) {
  return String(t || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quita acentos
    .toUpperCase().replace(/\s+/g, ' ').trim();
}

/**
 * Decide en qué carpeta acaba un certificado, y por qué.
 *
 * El orden importa: primero se mira si la persona NO es de planta —contratista,
 * visitante, o centro "Otra"— porque en ese caso el centro que haya elegido no
 * decide nada. Solo si es de planta se busca la carpeta de su centro.
 *
 * Devuelve { carpeta, motivo }. La carpeta puede ser null: entonces manda la
 * cascada de trasladar_ y acaba en ID_CARPETA_FINAL.
 */
function destinoDelCertificado_(d) {
  d = d || {};
  var tipo = String(d.tipoUsuario || '').trim();
  var centro = String(d.empresa || '').trim();

  var esDeOtros = normaliza_(centro) === 'OTRA';
  for (var i = 0; i < TIPOS_A_OTROS.length; i++) {
    if (normaliza_(TIPOS_A_OTROS[i]) === normaliza_(tipo)) { esDeOtros = true; break; }
  }

  if (esDeOtros) {
    var id = soloId_(CARPETA_OTROS);
    if (!id) return { carpeta: null, motivo: 'no es de planta y CARPETA_OTROS esta vacia' };
    try { return { carpeta: DriveApp.getFolderById(id), motivo: 'no es de planta (' + (tipo || centro) + ')' }; }
    catch (e) {
      console.error('CARPETA_OTROS no se pudo abrir: ' + e.message);
      return { carpeta: null, motivo: 'CARPETA_OTROS no se pudo abrir' };
    }
  }

  var f = carpetaDelCentro_(centro);
  if (f) return { carpeta: f, motivo: 'centro ' + centro };

  /* Un centro sin carpeta propia —hoy MEDELLIN, mañana una planta nueva— se
     trata como los que no son de planta: a CARPETA_OTROS. Es preferible a la
     carpeta general de repuesto, que es para fallos, no para casos previstos. */
  var idOtros = soloId_(CARPETA_OTROS);
  if (idOtros) {
    try {
      return { carpeta: DriveApp.getFolderById(idOtros),
               motivo: 'el centro "' + centro + '" no tiene carpeta propia' };
    } catch (e) { console.error('CARPETA_OTROS no se pudo abrir: ' + e.message); }
  }
  return { carpeta: null, motivo: 'el centro "' + centro + '" no tiene carpeta y CARPETA_OTROS esta vacia' };
}

/**
 * Devuelve la carpeta que le toca a un centro de trabajo, o null.
 *
 * Busca dentro de CARPETA_RAIZ_CENTROS la subcarpeta que se llame igual que el
 * centro, y luego baja por SUBRUTA_CENTRO si se configuró.
 *
 * El resultado se recuerda: buscar por nombre en Drive cuesta, y estos nombres
 * no cambian. Así solo se busca la primera vez de cada centro. Si algún día se
 * mueven las carpetas, ejecuta olvidarLoRecordado().
 */
function carpetaDelCentro_(centro) {
  var clave = normaliza_(centro);
  if (!clave) return null;

  /* Primero la tabla, que es lo explicito: si alguien la lleno, manda ella.
     Se busca comparando normalizado para que un acento o un espacio de mas en
     la tabla no deje a un centro sin carpeta. */
  var enTabla = '';
  for (var k in CARPETAS_POR_CENTRO) {
    if (CARPETAS_POR_CENTRO.hasOwnProperty(k) && normaliza_(k) === clave) {
      enTabla = soloId_(CARPETAS_POR_CENTRO[k]);
      break;
    }
  }
  if (enTabla) {
    try { return DriveApp.getFolderById(enTabla); }
    catch (e) {
      console.error('La carpeta puesta para "' + centro + '" no se pudo abrir: ' + e.message +
                    ' — revisa esa URL en CARPETAS_POR_CENTRO.');
      return null;
    }
  }

  // sin entrada en la tabla: se intenta buscarla por nombre, si hay carpeta raiz
  if (!soloId_(CARPETA_RAIZ_CENTROS)) return null;

  var props = PropertiesService.getScriptProperties();
  var guardada = props.getProperty('CENTRO_' + clave);
  if (guardada) {
    try { return DriveApp.getFolderById(guardada); }
    catch (e) { props.deleteProperty('CENTRO_' + clave); }   // ya no existe: se vuelve a buscar
  }

  var raiz;
  try { raiz = DriveApp.getFolderById(soloId_(CARPETA_RAIZ_CENTROS)); }
  catch (e) { console.error('No se pudo abrir CARPETA_RAIZ_CENTROS: ' + e.message); return null; }

  /* Se recorren las subcarpetas y se compara ya normalizado, porque
     getFoldersByName exige el nombre exacto y aquí un acento no puede decidir
     dónde acaba un certificado. */
  var destino = null;
  var it = raiz.getFolders();
  while (it.hasNext()) {
    var f = it.next();
    if (normaliza_(f.getName()) === clave) { destino = f; break; }
  }
  if (!destino) {
    console.warn('No hay carpeta para el centro "' + centro + '" dentro de la carpeta raiz.');
    return null;
  }

  // y ahora hacia dentro, si se configuró una subruta
  if (SUBRUTA_CENTRO) {
    var tramos = String(SUBRUTA_CENTRO).split('/');
    for (var i = 0; i < tramos.length; i++) {
      var nombre = normaliza_(tramos[i]);
      if (!nombre) continue;
      var hijo = null, sub = destino.getFolders();
      while (sub.hasNext()) {
        var c = sub.next();
        if (normaliza_(c.getName()) === nombre) { hijo = c; break; }
      }
      if (!hijo) {
        console.warn('En "' + centro + '" no existe el tramo "' + tramos[i] +
                     '" de SUBRUTA_CENTRO. Se usa la carpeta del centro.');
        break;
      }
      destino = hijo;
    }
  }

  props.setProperty('CENTRO_' + clave, destino.getId());
  return destino;
}

/**
 * COMPRUEBA LOS 15 DE UNA VEZ
 *
 * Dice, para cada centro que le pases, a qué carpeta iría a parar su
 * certificado. Ejecútala antes de confiar en el reparto: es mucho más rápido
 * que descubrir dentro de un mes que tres centros llevaban meses cayendo en la
 * carpeta de repuesto.
 *
 * Pega entre los corchetes los mismos nombres del desplegable del curso.
 */
function verCarpetasDeCentros() {
  var CENTROS = [
    'BARRANCA GEO', 'BELLO RMX', 'CHIA RMX', 'FUNDACION', 'GEOCYCLE - AF NOBSA',
    'MEDELLIN', 'MONDOÑEDO AGG', 'NOBSA - TUNJA RMX', 'NOBSA CEM',
    'PUENTE ARANDA RMX', 'SIBATE RMX', 'TELEPORT CORP', 'TOCANCIPA TQC',
    'TRANSCEM', 'VALLE'
  ];
  var lineas = [], bien = 0;
  CENTROS.forEach(function (c) {
    var f = null;
    try { f = carpetaDelCentro_(c); } catch (e) {}
    if (f) {
      bien++;
      /* De donde salio: de la tabla o de la busqueda por nombre. Importa,
         porque un centro que cae por la busqueda depende de que nadie renombre
         la carpeta. */
      var deTabla = false;
      for (var k in CARPETAS_POR_CENTRO) {
        if (CARPETAS_POR_CENTRO.hasOwnProperty(k) && normaliza_(k) === normaliza_(c) &&
            soloId_(CARPETAS_POR_CENTRO[k])) { deTabla = true; break; }
      }
      lineas.push('OK  ' + pad_(c, 22) + ' → ' + f.getName() + (deTabla ? '' : '   (por nombre)'));
    } else {
      lineas.push('FALTA  ' + pad_(c, 20) + ' → iria a la carpeta general');
    }
  });
  /* Y los casos que NO son de planta, que son justo los que mas se olvidan al
     revisar: un contratista, un visitante y alguien con centro "Otra". */
  lineas.push('');
  lineas.push('--- los que no son de planta ---');
  [{ tipoUsuario: 'Contratista', empresa: 'NOBSA CEM' },
   { tipoUsuario: 'Visitante',   empresa: 'TELEPORT CORP' },
   { tipoUsuario: 'Propio',      empresa: 'Otra' }].forEach(function (caso) {
    var r = { carpeta: null, motivo: '' };
    try { r = destinoDelCertificado_(caso); } catch (e) { r.motivo = e.message; }
    var quien = caso.tipoUsuario + ' / ' + caso.empresa;
    lineas.push((r.carpeta ? 'OK  ' : 'FALTA  ') + pad_(quien, 26) + ' → ' +
                (r.carpeta ? r.carpeta.getName() : 'carpeta general (' + r.motivo + ')'));
  });

  var txt = 'Centros con carpeta propia: ' + bien + ' de ' + CENTROS.length +
            (bien < CENTROS.length ? '\n(los que faltan van a ID_CARPETA_FINAL, no se pierden)' : '') +
            '\n\n' + lineas.join('\n');
  Logger.log(txt);
  return txt;
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
function trasladar_(archivo, d) {
  var destino = null, motivo = '';
  /* Contratistas, visitantes y "Otra" van a la carpeta de otros; el resto, a la
     de su centro. Si no sale ninguna, la general: que falle el reparto no puede
     costar el certificado. */
  try {
    var r = destinoDelCertificado_(d);
    destino = r.carpeta; motivo = r.motivo;
  } catch (e) {
    console.error('No se pudo decidir la carpeta: ' + e.message);
  }
  var porCentro = !!destino;
  if (!destino) {
    try {
      destino = carpetaFinal_();
    } catch (e) {
      console.error('No se pudo abrir la carpeta final: ' + e.message);
      return 'carpeta final inaccesible';
    }
  }
  if (!destino) return 'sin carpeta final';
  try {
    archivo.moveTo(destino);
    console.log('Certificado trasladado a ' + destino.getName() +
                (porCentro ? ' — ' + motivo : ' (carpeta general: ' + motivo + ')'));
    return porCentro ? 'trasladado' : 'trasladado a la general';
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
    trasladar_(archivo, d);
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
      (d.razonSocial ? ('• Empresa: ' + d.razonSocial + '\n') : '') +
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
  var fecha = d.fecha || new Date().toLocaleString();

  /* El PDF primero, y la hoja despues, dentro del try. Al reves, una hoja mal
     configurada cortaba antes de llegar al certificado y se perdian las dos
     cosas; asi, lo unico irrepetible —el PDF que la persona acaba de sacar— ya
     esta a salvo pase lo que pase con la hoja. */
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
    'Empresa': d.razonSocial || '',   // razon social: solo contratistas y visitantes
    'Capacitacion': d.capacitacion || '',
    'Puntaje': d.puntaje || (d.porcentaje + '%'),
    'Resultado': d.resultado || '',
    'Vinculo': enlaceCert || d.vinculo || '',
    'Aciertos': d.aciertos,
    'Total': d.total,
    'Duración (s)': d.segundos,
    'Navegador': d.navegador || ''
  };
  /* Se deja escrito DONDE se guardo, no solo que se guardo. Cuando una fila no
     aparece, la duda siempre es la misma —¿en que hoja y en que pestaña acabo?—
     y sin esto hay que deducirlo. Ademas, si la escritura falla, el certificado
     ya esta guardado: el fallo tiene que verse, no perderse. */
  var ss, hoja, fila = 0, dondeEscribio = '';
  try {
    ss = obtenerHoja_();
    var pestanasAntes = ss.getSheets().map(function (h) { return h.getName(); });
    hoja = pestana_(ss, PESTANA_RESUMEN, COLUMNAS_RESUMEN);
    if (pestanasAntes.indexOf(PESTANA_RESUMEN) < 0) {
      console.warn('No existia la pestaña "' + PESTANA_RESUMEN + '" en esa hoja, ' +
                   'asi que se acaba de crear. Las que ya habia: ' + pestanasAntes.join(', ') +
                   '. Si esperabas ver la fila en otra pestaña, ese es el motivo.');
    }
    fila = escribirPorEncabezado_(hoja, COLUMNAS_RESUMEN, valores);
    dondeEscribio = ss.getUrl() + '  ·  pestaña "' + hoja.getName() + '"  ·  fila ' + fila;
    console.log('Fila escrita en: ' + dondeEscribio);

    /* El enlace del certificado se deja como hipervinculo de verdad: el texto de
       la celda sigue siendo la direccion, pero es clicable. */
    if (enlaceCert) enlazar_(hoja, fila, 'Vinculo', enlaceCert);
  } catch (e) {
    console.error('NO SE PUDO ESCRIBIR LA FILA: ' + e.message +
                  '\nHoja: ' + (function () { try { return ss.getUrl(); } catch (x) { return '(no se pudo leer)'; } })() +
                  '\nEl certificado SI se guardo: ' + (enlaceCert || '(tampoco)'));
    var copiaF = enviarCopiaCertificado_(d, enlaceCert);
    return { ok: false, error: 'no se pudo escribir la fila: ' + e.message,
             certificado: enlaceCert ? 'guardado' : 'falló', copiaCorreo: copiaF };
  }

  /* Segunda ruta: la copia por correo va DESPUÉS de escribir la fila, para que
     un fallo del correo no impida que el resultado quede registrado. */
  var copia = enviarCopiaCertificado_(d, enlaceCert);

  return {
    ok: true,
    certificado: enlaceCert ? 'guardado' : (d.certificado ? 'falló' : 'no llegó'),
    copiaCorreo: copia,
    fila: dondeEscribio
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
 * ¿QUÉ CASILLAS QUEDARON VACÍAS?
 *
 * Pegar este archivo encima BORRA lo que estuviera escrito arriba. Las carpetas
 * de los centros vienen puestas en el repositorio, así que sobreviven al pegado
 * y dan la impresión de que todo sigue configurado; ID_HOJA y CARPETA_OTROS no,
 * y esas se pierden en silencio. Entonces los resultados se van a una hoja que
 * el script se crea solo, y no hay ningún error: simplemente no aparecen.
 *
 * Ejecútala después de cada pegado. probarTodo ya la llama sola.
 */
function revisarConfiguracion() {
  var faltan = [], avisos = [];

  if (!soloId_(ID_HOJA)) {
    faltan.push('ID_HOJA — sin ella los resultados van a una hoja que el script se crea solo.');
  }
  if (!soloId_(ID_CARPETA_CERTIFICADOS)) {
    avisos.push('ID_CARPETA_CERTIFICADOS vacia: los certificados NACEN en la carpeta ' +
                'que el script recuerde. Ejecuta verLoRecordado() para ver cual es.');
  }
  if (!soloId_(CARPETA_OTROS)) {
    faltan.push('CARPETA_OTROS — contratistas, visitantes y "Otra" se quedarian sin carpeta propia.');
  }
  if (!CORREO_REPORTES) faltan.push('CORREO_REPORTES — no llegarian ni reportes ni copias.');

  var conCarpeta = 0, sinCarpeta = [];
  for (var k in CARPETAS_POR_CENTRO) {
    if (!CARPETAS_POR_CENTRO.hasOwnProperty(k)) continue;
    if (soloId_(CARPETAS_POR_CENTRO[k])) conCarpeta++; else sinCarpeta.push(k);
  }
  if (sinCarpeta.length) {
    avisos.push('Centros sin carpeta propia (van a CARPETA_OTROS): ' + sinCarpeta.join(', '));
  }
  if (soloId_(HOJA_ANTERIOR)) {
    avisos.push('HOJA_ANTERIOR sigue rellena. Si la mudanza ya se hizo, dejala vacia.');
  }

  var lineas = [];
  lineas.push(faltan.length ? 'FALTA POR RELLENAR:' : 'Todo lo imprescindible esta puesto.');
  faltan.forEach(function (f) { lineas.push('  ✗ ' + f); });
  if (avisos.length) {
    lineas.push('');
    lineas.push('Para tener en cuenta:');
    avisos.forEach(function (a) { lineas.push('  · ' + a); });
  }
  lineas.push('');
  lineas.push('Carpetas de centro puestas: ' + conCarpeta + ' de ' +
              Object.keys(CARPETAS_POR_CENTRO).length);

  var txt = lineas.join('\n');
  Logger.log(txt);
  return txt;
}

/**
 * ¿LO PUBLICADO ES LO QUE HAY EN EL EDITOR?
 *
 * Es la pregunta que probarTodo NO responde. probarTodo ejecuta el codigo del
 * editor; el curso habla con la implementacion PUBLICADA. Si se pega el archivo
 * y no se publica version nueva, probarTodo pasa entero y los examenes los
 * sigue atendiendo el codigo viejo: los certificados salen con el nombre de
 * antes, van a la carpeta de antes y las filas caen en la hoja de antes.
 *
 * Esta funcion le pregunta a la implementacion publicada que version esta
 * atendiendo y la compara con la de este archivo.
 */
function comprobarPublicacion(otraUrl) {
  /* Se admite una URL suelta para poder comprobar OTRA implementacion sin tocar
     la configuracion. Hace falta justo cuando alguien, en vez de publicar una
     version nueva de la de siempre, crea una implementacion nueva: esa nace con
     OTRA URL, la de siempre se queda intacta con el codigo viejo, y el curso
     —que apunta a la de siempre— no cambia en nada. */
  var url = String(otraUrl || URL_EXEC_PUBLICADA || '').trim();
  var esLaDelCurso = !otraUrl || soloId_(url) === soloId_(URL_EXEC_PUBLICADA);
  if (!url) { Logger.log('Pega en URL_EXEC_PUBLICADA la direccion /exec, la misma que hay en REPORTE_URL del index.html.'); return 'falta la url'; }
  if (/\/dev$/.test(url)) { Logger.log('Esa es la direccion de PRUEBAS (/dev). Hace falta la publicada, que termina en /exec.'); return 'es la de pruebas'; }

  var sep = url.indexOf('?') >= 0 ? '&' : '?';
  var resp;
  try {
    resp = UrlFetchApp.fetch(url + sep + 'ping=1', { muteHttpExceptions: true, followRedirects: true });
  } catch (e) {
    Logger.log('No se pudo consultar la implementacion: ' + e.message);
    return 'no se pudo consultar';
  }

  var cuerpo = String(resp.getContentText() || '');
  var publicada = '';
  try { publicada = (JSON.parse(cuerpo) || {}).version || ''; } catch (e) { /* no contesto JSON */ }

  if (!publicada) {
    var txt = 'ESTA URL SIRVE CODIGO VIEJO.\n  ' + url + '\n' +
      (esLaDelCurso ? '  (es la que usa el curso: REPORTE_URL)\n' : '  (no es la del curso)\n') +
      '\nNo reconoce la pregunta, asi que es anterior al codigo de este archivo.\n' +
      'Mientras siga asi, el curso guarda con las reglas viejas: el nombre del\n' +
      'PDF, la carpeta y la hoja son las de antes, aunque aqui pongan otra cosa.\n' +
      '\nCUIDADO CON EL ARREGLO: crear una implementacion NUEVA no sirve, porque\n' +
      'nace con otra URL y esta se queda igual. Hay que publicar una version\n' +
      'nueva DE ESTA:\n' +
      '  Implementar → Administrar implementaciones → busca la que termina en\n' +
      '  ...' + url.slice(-12) + ' → el lapiz ✏️ → Version: "Nueva version" → Implementar\n' +
      '\nSi ya creaste otra y prefieres quedarte con ella, comprueba su URL con\n' +
      '  comprobarPublicacion("https://script.google.com/macros/s/.../exec")\n' +
      'y, si esa si esta al dia, hay que cambiar REPORTE_URL en el index.html.\n' +
      '\nVersion de este archivo: ' + VERSION_GS;
    Logger.log(txt);
    return txt;
  }

  var igual = publicada === VERSION_GS;
  var txt2 = (igual ? 'AL DIA.' : 'NO COINCIDEN.') +
    '\n  url:       ' + url +
    '\n  publicada: ' + publicada +
    '\n  editor:    ' + VERSION_GS +
    (igual
      ? (esLaDelCurso
          ? '\n\nLo que atiende al curso es este mismo codigo.'
          : '\n\nEsta URL esta al dia, pero NO es la que usa el curso.\n' +
            'O publicas version nueva en la del curso, o cambias REPORTE_URL\n' +
            'en el index.html por esta.')
      : '\n\nPublica una version NUEVA de ESTA implementacion: Implementar →\n' +
        'Administrar implementaciones → el lapiz ✏️ → Version: "Nueva version".\n' +
        'Crear otra implementacion no sirve: naceria con otra URL.');
  Logger.log(txt2);
  return txt2;
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
  /* Lo primero, porque es lo que mas confunde: esto prueba el codigo DEL
     EDITOR. Que pase entero no dice nada sobre lo que atiende al curso. */
  lineas.push('OJO: esto prueba el codigo del EDITOR, no el publicado.');
  lineas.push('     Para saber si lo publicado esta al dia: comprobarPublicacion()');
  lineas.push('');
  /* Lo segundo: si al pegar el archivo se borro alguna casilla, todo lo demas
     "funciona" pero apuntando a otro sitio. Mejor verlo aqui que dentro de una
     semana con los datos repartidos entre dos hojas. */
  lineas.push(revisarConfiguracion());
  lineas.push('');
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
    lineas.push('2. Carpeta de Drive ........ OK  "' + carpeta.getName() + '"  ' + carpeta.getUrl());
    lineas.push('   (aqui NACE el certificado; luego se traslada a la de su centro)');
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
      if (soloId_(ID_CARPETA_FINAL) || soloId_(CARPETA_RAIZ_CENTROS) || soloId_(CARPETA_OTROS)) {
        try {
          var padres = archivo.getParents();
          var donde = padres.hasNext() ? padres.next() : null;
          var esperada = (destinoDelCertificado_(d).carpeta) || carpetaFinal_();
          var ok = donde && esperada && donde.getId() === esperada.getId();
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

  /* Se enseña el NOMBRE, no solo el identificador. Un identificador no dice
     nada al leerlo, y aqui es justo donde aparece la sorpresa: la carpeta
     recordada puede ser la de un centro concreto, de una prueba de hace
     semanas, y entonces TODOS los certificados nacen ahi. */
  function comoSeLlama(id, tipo) {
    if (!id) return '(ninguna)';
    try {
      var x = (tipo === 'hoja') ? SpreadsheetApp.openById(id) : DriveApp.getFolderById(id);
      return '"' + x.getName() + '"   ' + x.getUrl();
    } catch (e) { return id + '   (no se pudo abrir: ' + e.message + ')'; }
  }

  var idHoja = props.getProperty('ID_HOJA'), idCarp = props.getProperty('ID_CARPETA');
  var lineas = [
    'Hoja recordada:    ' + comoSeLlama(idHoja, 'hoja'),
    'Carpeta recordada: ' + comoSeLlama(idCarp, 'carpeta'),
    '',
    'Lo que manda es lo que esté escrito en ID_HOJA e ID_CARPETA_CERTIFICADOS;',
    'esto de arriba solo se usa cuando esas dos variables están vacías.'
  ];
  if (!soloId_(ID_CARPETA_CERTIFICADOS) && idCarp) {
    lineas.push('');
    lineas.push('ID_CARPETA_CERTIFICADOS está vacía, así que la carpeta de arriba es');
    lineas.push('donde NACE cada certificado antes de trasladarse a la de su centro.');
    lineas.push('Si ahí sale la carpeta de un centro concreto, eso es lo que hay que');
    lineas.push('cambiar: pon una carpeta propia en ID_CARPETA_CERTIFICADOS.');
  }
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
  props.deleteProperty('MUDANZA_HECHA');   // el seguro contra repetir mudarLaHoja
  /* Y las carpetas de cada centro, que tambien se recuerdan para no buscarlas
     en Drive cada vez. */
  var todas = props.getProperties();
  Object.keys(todas).forEach(function (k) {
    if (k.indexOf('CENTRO_') === 0) props.deleteProperty(k);
  });
  Logger.log('Listo: el script ya no recuerda ninguna hoja ni carpeta.\n' +
             'Escribe las tuyas en ID_HOJA e ID_CARPETA_CERTIFICADOS antes de ' +
             'volver a ejecutar, o creará unas nuevas.');
  return 'olvidado';
}

/** ¿El error es "no tienes permiso" y no "no existe"? */
function esFaltaDePermiso_(e) {
  var m = String((e && e.message) || e).toLowerCase();
  return m.indexOf('permission') >= 0 || m.indexOf('permiso') >= 0 ||
         m.indexOf('access') >= 0 || m.indexOf('acceso') >= 0;
}

/** La cuenta con la que corre el script, para poder nombrarla en los avisos. */
function cuentaDelScript_() {
  try { return Session.getEffectiveUser().getEmail() || 'la cuenta del script'; }
  catch (e) { return 'la cuenta del script'; }
}

/**
 * Abre una hoja diciendo QUÉ pasa si no puede, en vez de soltar el mensaje
 * de Google, que para el mismo texto tiene dos causas muy distintas.
 * Devuelve la hoja, o null tras dejar el aviso en el registro.
 */
function abrirHoja_(url, comoSeLlama) {
  var id = soloId_(url);
  if (!id) { Logger.log('Falta la URL de ' + comoSeLlama + '.'); return null; }
  try { return SpreadsheetApp.openById(id); }
  catch (e) {
    if (esFaltaDePermiso_(e)) {
      Logger.log('NO SE PUDO ABRIR ' + comoSeLlama + '.\n\n' +
                 'La hoja existe, pero este script corre con ' + cuentaDelScript_() +
                 ' y esa cuenta no tiene acceso.\n\n' +
                 'Abre la hoja en Drive → Compartir → añade ' + cuentaDelScript_() +
                 ' como EDITOR, y vuelve a ejecutar.\n\n' +
                 'Detalle de Google: ' + e.message);
    } else {
      Logger.log('NO SE PUDO ABRIR ' + comoSeLlama + '.\n' +
                 'Comprueba que sea el enlace de la HOJA ' +
                 '(docs.google.com/spreadsheets/...) y no el de una carpeta.\n' +
                 'Detalle de Google: ' + e.message);
    }
    return null;
  }
}

/**
 * MUDAR LA HOJA DE RESULTADOS — LA ÚNICA QUE HAY QUE EJECUTAR
 *
 * Deja la hoja de ID_HOJA lista y le trae las filas de HOJA_ANTERIOR. Se hace
 * en un solo paso a propósito: los dos trozos por separado son fáciles de
 * hacer en el orden equivocado.
 *
 * Antes de ejecutarla, arriba:
 *   ID_HOJA        = la hoja de Holcim, la nueva
 *   HOJA_ANTERIOR  = la hoja personal, la de siempre
 *
 * Se ejecuta UNA VEZ. Si se intenta repetir, se planta: duplicaría las filas.
 */
function mudarLaHoja() {
  var props = PropertiesService.getScriptProperties();
  if (!soloId_(ID_HOJA))       { Logger.log('Falta ID_HOJA: pega arriba la URL de la hoja de Holcim.'); return 'falta ID_HOJA'; }
  if (!soloId_(HOJA_ANTERIOR)) { Logger.log('Falta HOJA_ANTERIOR: pega arriba la URL de la hoja personal.'); return 'falta HOJA_ANTERIOR'; }
  if (soloId_(ID_HOJA) === soloId_(HOJA_ANTERIOR)) { Logger.log('Las dos URL son la misma hoja. Revísalas.'); return 'son la misma'; }

  var yaHecha = props.getProperty('MUDANZA_HECHA');
  if (yaHecha === soloId_(HOJA_ANTERIOR)) {
    Logger.log('Esta mudanza YA se hizo. No se repite porque duplicaría las filas.\n' +
               'Si de verdad hace falta rehacerla, ejecuta olvidarLoRecordado() primero.');
    return 'ya estaba hecha';
  }

  /* Se comprueba el acceso a las DOS antes de tocar nada. Si la segunda no
     abriera a mitad de camino, la primera se quedaria ya modificada. */
  Logger.log('--- 0) comprobando que se pueden abrir las dos hojas ---');
  var destino = abrirHoja_(ID_HOJA, 'la hoja de HOLCIM (ID_HOJA)');
  if (!destino) return 'no se pudo abrir la hoja de Holcim';
  var origen = abrirHoja_(HOJA_ANTERIOR, 'la hoja ANTERIOR (HOJA_ANTERIOR)');
  if (!origen) return 'no se pudo abrir la hoja anterior';
  Logger.log('Las dos abren bien.\n  Holcim:   ' + destino.getName() +
             '\n  Anterior: ' + origen.getName());

  Logger.log('--- 1) preparando la hoja de Holcim ---');
  var r1 = prepararHojaExistente(ID_HOJA);
  /* Cualquier tropiezo del paso 1 corta aqui: seguir al paso 2 con la hoja
     de destino a medias es lo que convierte un aviso claro en un error feo. */
  if (String(r1).indexOf('YA TIENE FILAS') >= 0) return r1;
  if (r1 === 'inaccesible' || r1 === 'falta la hoja') return r1;

  Logger.log('--- 2) trayendo las filas de la hoja anterior ---');
  var r2 = copiarFilasDeHojaVieja(HOJA_ANTERIOR);

  props.setProperty('MUDANZA_HECHA', soloId_(HOJA_ANTERIOR));
  Logger.log('--- listo ---\nAhora vuelve a dejar HOJA_ANTERIOR = "" y ejecuta probarTodo.');
  return r2;
}

/**
 * PREPARA UNA HOJA QUE YA EXISTE
 *
 * Para cuando la hoja de Holcim ya está creada a mano. Le pasas su URL y deja
 * la pestaña "Resultados" con los encabezados exactos.
 *
 * Existe porque el script escribe buscando cada dato por el NOMBRE de su
 * columna: si el encabezado dice "Centro de trabajo" en vez de
 * "Centro_Trabajo", no falla —agrega una columna nueva al final y la de la
 * hoja se queda vacía para siempre—. Comprobarlo a ojo es justo lo que no
 * funciona, porque los nombres se parecen.
 *
 * Si la hoja ya tiene filas escritas NO toca nada: te dice qué encabezados no
 * cuadran y lo decides tú, porque reescribirlos ahí movería los datos de sitio.
 *
 * Uso, desde el editor:
 *   prepararHojaExistente("https://docs.google.com/spreadsheets/d/1AbC.../edit")
 */
function prepararHojaExistente(urlHoja) {
  var ss = abrirHoja_(urlHoja, 'esa hoja');
  if (!ss) return 'inaccesible';

  var hoja = ss.getSheetByName(PESTANA_RESUMEN);
  var creada = false;
  if (!hoja) {
    /* Si la hoja esta recien hecha y solo tiene la pestaña por defecto vacia,
       se reaprovecha en vez de dejar una "Hoja 1" suelta al lado. */
    var todas = ss.getSheets();
    if (todas.length === 1 && todas[0].getLastRow() === 0) { hoja = todas[0]; hoja.setName(PESTANA_RESUMEN); }
    else { hoja = ss.insertSheet(PESTANA_RESUMEN); }
    creada = true;
  }

  var conDatos = hoja.getLastRow() > 1;
  var ancho = Math.max(1, hoja.getLastColumn());
  var actuales = hoja.getLastRow() === 0 ? [] : hoja.getRange(1, 1, 1, ancho).getValues()[0].map(String);

  var iguales = actuales.length === COLUMNAS_RESUMEN.length &&
                COLUMNAS_RESUMEN.every(function (c, i) { return actuales[i] === c; });

  if (iguales) {
    Logger.log('Los encabezados ya son los correctos. No hay nada que cambiar.\n' + ss.getUrl());
    return 'ya estaba bien';
  }

  if (conDatos) {
    var aviso = 'ESA HOJA YA TIENE FILAS ESCRITAS, así que no se toca.\n\n' +
                'Tiene:  ' + actuales.join(' | ') + '\n' +
                'Debería: ' + COLUMNAS_RESUMEN.join(' | ') + '\n\n' +
                'Corrige los encabezados a mano hasta que coincidan letra por letra, o\n' +
                'usa una hoja vacía con crearHojaEnHolcim y trae las filas con\n' +
                'copiarFilasDeHojaVieja.';
    Logger.log(aviso);
    return aviso;
  }

  hoja.getRange(1, 1, 1, Math.max(ancho, COLUMNAS_RESUMEN.length)).clearContent();
  hoja.getRange(1, 1, 1, COLUMNAS_RESUMEN.length).setValues([COLUMNAS_RESUMEN]).setFontWeight('bold');
  hoja.setFrozenRows(1);

  var txt = (creada ? 'Pestaña "' + PESTANA_RESUMEN + '" creada.' : 'Encabezados corregidos.') +
            '\nAntes:  ' + (actuales.join(' | ') || '(vacío)') +
            '\nAhora:  ' + COLUMNAS_RESUMEN.join(' | ') +
            '\n\nPega esto en ID_HOJA y ejecuta olvidarLoRecordado():\n  ' + ss.getUrl();
  Logger.log(txt);
  return txt;
}

/**
 * CREA LA HOJA EN HOLCIM, CON LOS ENCABEZADOS EXACTOS
 *
 * Le pasas la URL de la carpeta de Drive donde quieres que viva y la crea allí
 * con las columnas correctas, en el orden correcto. Te devuelve su URL para
 * pegarla en ID_HOJA.
 *
 * Se hace así y no a mano porque los encabezados tienen que coincidir letra por
 * letra: si dice "Centro de trabajo" en vez de "Centro_Trabajo", el script
 * añadirá una columna nueva y esa quedará vacía para siempre.
 *
 * Uso, desde el editor:
 *   crearHojaEnHolcim("https://drive.google.com/drive/folders/1AbC...")
 */
function crearHojaEnHolcim(urlCarpeta) {
  var id = soloId_(urlCarpeta);
  if (!id) { Logger.log('Pásame la URL de la carpeta de Drive donde debe quedar la hoja.'); return 'falta la carpeta'; }

  var carpeta;
  try { carpeta = DriveApp.getFolderById(id); }
  catch (e) { Logger.log('No se pudo abrir esa carpeta: ' + e.message); return 'carpeta inaccesible'; }

  var ss = SpreadsheetApp.create(NOMBRE_HOJA);
  var hoja = ss.getActiveSheet();
  hoja.setName(PESTANA_RESUMEN);
  hoja.appendRow(COLUMNAS_RESUMEN);
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, COLUMNAS_RESUMEN.length).setFontWeight('bold');

  /* Se crea en "Mi unidad" y de ahi se mueve: no hay forma de crearla
     directamente dentro de una carpeta. */
  try { DriveApp.getFileById(ss.getId()).moveTo(carpeta); }
  catch (e) {
    Logger.log('La hoja se creó pero NO se pudo mover a esa carpeta: ' + e.message +
               '\nEstá en "Mi unidad" con el nombre "' + NOMBRE_HOJA + '"; muévela a mano.');
  }

  var txt = 'Hoja creada:\n  ' + ss.getUrl() +
            '\n\nPégala en ID_HOJA y ejecuta probarTodo.' +
            '\n\nColumnas: ' + COLUMNAS_RESUMEN.join(' | ');
  Logger.log(txt);
  return txt;
}

/**
 * TRAE LAS FILAS DE LA HOJA ANTERIOR
 *
 * Copia a la hoja de ahora (la de ID_HOJA) las filas de la hoja vieja cuya URL
 * le pases, emparejando por el NOMBRE de cada columna. Así no importa que
 * estuvieran en otro orden.
 *
 * Traduce los nombres que cambiaron: la columna "Empresa" de la hoja vieja era
 * el centro de trabajo, y ahora esa se llama "Centro_Trabajo" —"Empresa" pasó a
 * ser la razón social del contratista—. Copiarlas a mano es justo donde ese
 * cambio se cuela sin que nadie lo note.
 *
 * No borra nada de la hoja vieja. Si la ejecutas dos veces, duplicas filas.
 */
function copiarFilasDeHojaVieja(urlHojaVieja) {
  var vieja = abrirHoja_(urlHojaVieja, 'la hoja vieja');
  if (!vieja) return 'inaccesible';
  if (vieja.getId() === obtenerHoja_().getId()) { Logger.log('Esa es la hoja de ahora, no la vieja.'); return 'es la misma'; }

  var hv = vieja.getSheetByName(PESTANA_RESUMEN) || vieja.getSheets()[0];
  var datos = hv.getDataRange().getValues();
  if (datos.length < 2) { Logger.log('La hoja vieja no tiene filas que copiar.'); return 'vacia'; }

  var encViejos = datos[0].map(String);
  /* Nombre de antes → nombre de ahora. Lo demas se empareja tal cual. */
  var EQUIVALENCIAS = { 'Empresa': 'Centro_Trabajo', 'Nombre': 'Nombre_Completo', 'Cédula': 'ID_Identificacion' };

  var hoja = pestana_(obtenerHoja_(), PESTANA_RESUMEN, COLUMNAS_RESUMEN);
  var copiadas = 0;
  for (var f = 1; f < datos.length; f++) {
    var fila = datos[f];
    if (fila.join('').trim() === '') continue;   // filas en blanco
    var valores = {};
    for (var c = 0; c < encViejos.length; c++) {
      var nombre = EQUIVALENCIAS[encViejos[c]] || encViejos[c];
      if (fila[c] !== '' && fila[c] !== null && fila[c] !== undefined) valores[nombre] = fila[c];
    }
    var filaNueva = escribirPorEncabezado_(hoja, COLUMNAS_RESUMEN, valores);
    /* El vinculo se vuelve a marcar como enlace: al leer la hoja vieja solo
       llega el texto, y sin esto quedaria como URL suelta sin clic. */
    var v = String(valores['Vinculo'] || '');
    if (v.indexOf('http') === 0) enlazar_(hoja, filaNueva, 'Vinculo', v);
    copiadas++;
  }

  var txt = 'Filas copiadas: ' + copiadas +
            '\nDe: ' + vieja.getName() +
            '\nA:  ' + obtenerHoja_().getUrl() +
            '\n\nLa hoja vieja no se toco. Revisala y bórrala tú cuando estés conforme.' +
            '\nOJO: si ejecutas esto dos veces, duplicas las filas.';
  Logger.log(txt);
  return txt;
}

/**
 * ¿EN QUÉ HOJA Y EN QUÉ PESTAÑA ESCRIBE?
 *
 * Cuando una fila "no aparece", casi siempre está escrita — en otro sitio. Las
 * dos formas de que pase son mirar la hoja equivocada, o mirar la pestaña
 * equivocada dentro de la buena: el script escribe en "Resultados", y si esa
 * pestaña no existía la crea, quedando al lado de la que se está mirando.
 *
 * Esta función dice exactamente dónde va a caer la próxima fila.
 */
function verDondeEscribe() {
  var lineas = [];
  var ss;
  try { ss = obtenerHoja_(); }
  catch (e) { Logger.log('No se pudo abrir la hoja: ' + e.message); return 'sin hoja'; }

  lineas.push('Hoja: "' + ss.getName() + '"');
  lineas.push('  ' + ss.getUrl());
  lineas.push('  de donde sale: ' + (soloId_(ID_HOJA) ? 'ID_HOJA' : 'lo que el script recuerda'));
  lineas.push('');
  lineas.push('Pestaña donde escribe: "' + PESTANA_RESUMEN + '"');

  var hoja = ss.getSheetByName(PESTANA_RESUMEN);
  if (!hoja) {
    lineas.push('  NO EXISTE todavia: se creara sola en el proximo examen.');
    lineas.push('  Las que hay ahora: ' + ss.getSheets().map(function (h) { return '"' + h.getName() + '"'; }).join(', '));
    lineas.push('  Si tus datos estan en una de esas, renombrala a "' + PESTANA_RESUMEN + '".');
  } else {
    var ancho = Math.max(1, hoja.getLastColumn());
    var enc = hoja.getRange(1, 1, 1, ancho).getValues()[0].map(String);
    lineas.push('  filas escritas: ' + Math.max(0, hoja.getLastRow() - 1));
    lineas.push('  encabezados:    ' + enc.join(' | '));
    var faltan = COLUMNAS_RESUMEN.filter(function (c) { return enc.indexOf(c) < 0; });
    lineas.push(faltan.length
      ? '  OJO: le faltan estas, se agregaran al final: ' + faltan.join(', ')
      : '  Todas las columnas que hacen falta estan.');
  }

  lineas.push('');
  lineas.push('Todas las pestañas: ' + ss.getSheets().map(function (h) {
    return '"' + h.getName() + '" (' + Math.max(0, h.getLastRow() - 1) + ' filas)';
  }).join(', '));

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
    r = r || { ok: true };
    r.version = VERSION_GS;   // para saber que codigo atendio, si algo no cuadra
    return ContentService.createTextOutput(JSON.stringify(r))
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
