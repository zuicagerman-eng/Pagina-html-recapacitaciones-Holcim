# -*- coding: utf-8 -*-
"""Genera examen.html a partir de index.html.

El examen sale del curso, no de una copia a mano: si manana cambia una
pregunta o el certificado, se vuelve a ejecutar esto y queda al dia. Copiarlo
y pegarlo habria creado dos verdades que se separan a la primera correccion.

    python3 hacer-examen.py
"""
import re, sys

ORIGEN, DESTINO = 'index.html', 'examen.html'
s = open(ORIGEN, encoding='utf-8').read()
antes = len(s)

def intacto(txt, paso):
    """Un .*? con re.S puede tragarse medio archivo si su cierre no aparece
    donde se espera: asi paso la primera vez, y se llevo el examen entero.
    Despues de cada corte se comprueba que el examen sigue ahi."""
    if txt.count('data-mod="EX"') != 1 or 'exCedula' not in txt or 'Comenzar examen' not in txt:
        sys.exit('ABORTADO en "%s": el corte se llevo parte del examen. '
                 'No se escribe nada.' % paso)


# ---- 1) Fuera las laminas del curso; se queda solo la del examen -----------
def secciones(txt):
    """Devuelve (inicio, fin) de cada <section class="slide ...">, contando el
    anidamiento: dentro de una lamina hay mas <section>."""
    fuera = []
    for m in re.finditer(r'<section class="slide\b', txt):
        i, prof = m.start(), 0
        for t in re.finditer(r'<section\b|</section>', txt[i:]):
            prof += 1 if t.group(0).startswith('<section') else -1
            if prof == 0:
                fuera.append((i, i + t.end())); break
    return fuera

todas = secciones(s)
examen = [(a, b) for a, b in todas if 'data-mod="EX"' in s[a:b]]
if len(examen) != 1:
    sys.exit('ABORTADO: se esperaba UNA lamina de examen y hay %d' % len(examen))
print('laminas en el curso: %d  ·  se conserva 1 (el examen)' % len(todas))

fuera = [r for r in todas if r not in examen]
for a, b in reversed(fuera):            # de atras hacia delante: no corre indices
    s = s[:a] + s[b:]

# La lamina del examen tiene que nacer visible: la 'active' iba en la portada.
s = s.replace('<section class="slide dark nogate encogesiempre" data-mod="EX">',
              '<section class="slide dark nogate encogesiempre active" data-mod="EX">', 1)

# ---- 2) Entrar derecho al examen, sin pedir ?ir=examen ---------------------
# El atajo ya existe y hace justo lo que hace falta: salta la guia, abre la
# puerta del video y va a la lamina. Aqui se da por puesto siempre.
v = "  var atajo = '';\n  try { atajo = new URLSearchParams(location.search).get('ir') || ''; } catch(e){}"
n = ("  /* En examen.html no hay curso que recorrer: el atajo va siempre puesto. */\n"
     "  var atajo = 'examen';")
if s.count(v) != 1: sys.exit('ABORTADO: no encuentro el atajo ?ir=examen')
s = s.replace(v, n, 1)

# El atajo NO marca vioPresentacion: en el curso eso es correcto, porque quien
# llega por QR viene de una jornada y no hay que preguntarle la modalidad. En
# examen.html no hay curso previo, asi que la pregunta Individual/Grupal si
# tiene que salir —el examen grupal con QR y papel sigue viviendo aqui—.
# Y una segunda pasada de chrome(): al cargar, la primera llega antes de que
# la pantalla de datos del examen este montada, y la pregunta de modalidad
# solo sale si esa pantalla esta a la vista. Sin esto no salia nunca.
v3 = "      goTo(iEx, 1);\n      chrome();"
n3 = ("      goTo(iEx, 1);\n      chrome();\n"
      "      setTimeout(chrome, 700);        // la pantalla de datos tarda en montarse")
if s.count(v3) != 1: sys.exit('ABORTADO: no encuentro el cierre del atajo')
s = s.replace(v3, n3, 1)

v2 = "      videoEnded = true;              // si no, la puerta del video corta el salto"
n2 = ("      videoEnded = true;              // si no, la puerta del video corta el salto\n"
      "      vioPresentacion = true;         // para que salga Individual / Grupal")
if s.count(v2) != 1: sys.exit('ABORTADO: no encuentro la puerta del video')
s = s.replace(v2, n2, 1)

# La guia de navegacion es del curso; aqui no pinta nada.
if s.count('<div id="welcome">') != 1: sys.exit('ABORTADO: no encuentro la guia')
s = s.replace('<div id="welcome">', '<div id="welcome" class="hide" hidden>', 1)

# ---- 3) Lo que en un examen no significa nada: se OCULTA, no se borra -----
# Borrarlo dejaria el codigo del curso apuntando al vacio —chrome() escribe en
# el contador de pasos en cada cambio— y el primer null corta el script entero.
# Ocultandolo, el resultado en pantalla es el mismo y nada revienta.
oculta = """<style>
  /* examen.html: el contador de pasos, el mapa de laminas, la barra de avance
     y la cuenta atras son del recorrido del curso. Aqui no hay recorrido. */
  .step, #pips, .hudbar, .hudtiempo, .brandbar { display: none !important; }
</style>
</head>"""
if s.count('</head>') != 1: sys.exit('ABORTADO: no encuentro </head>')
s = s.replace('</head>', oculta, 1)
intacto(s, 'ocultar la barra del curso')

# ---- 3b) Referencias a elementos de laminas que ya no estan ---------------
# El curso construye sus artefactos con codigo suelto: rellena huecos de
# iconos, arma la rueda, monta carruseles. Sin esas laminas, el elemento es
# null y el PRIMER fallo corta el script entero —y se lleva por delante el
# banco de preguntas—. Por eso el examen salia sin preguntas.
#
# Se sustituyen por __hueco(), que devuelve el elemento de verdad cuando
# existe. Solo se tocan los ids que el codigo NO comprueba: donde hay un
# "if(!x) return", null es la señal de "esta lamina no esta" y hay que
# dejarla pasar, o el codigo seguiria adelante sin su sitio.
existen = set(re.findall(r'\bid="([^"]+)"', s))
citados = {m.group(1) for m in re.finditer(r"getElementById\(\s*'([^']+)'\s*\)", s)}
huerfanos = sorted(i for i in citados if i not in existen)

def lo_comprueban(html, ident):
    """¿el codigo pregunta si ese elemento existe antes de usarlo?"""
    for m in re.finditer(r"(?:var|let|const)\s+(\w+)\s*=\s*document\.getElementById\(\s*'%s'\s*\)"
                         % re.escape(ident), html):
        cola = html[m.end():m.end()+200]
        if re.search(r'if\s*\(\s*!\s*%s\s*\)' % re.escape(m.group(1)), cola):
            return True
    return False

guardados = [i for i in huerfanos if lo_comprueban(s, i)]
sueltos   = [i for i in huerfanos if i not in guardados]
for i in sueltos:
    s = s.replace("document.getElementById('%s')" % i, "__hueco('%s')" % i)

ayuda = ("<script>\n"
  "/* Elementos de laminas que examen.html no lleva. Devuelven el de verdad si\n"
  "   existe; si no, uno inofensivo que se deja usar sin reventar. Asi una sola\n"
  "   referencia suelta no corta el script y se lleva el banco de preguntas. */\n"
  "function __huecoNada(){\n"
  "  return { innerHTML:'', textContent:'', value:'', hidden:true, children:[],\n"
  "    style:{ setProperty:function(){} },\n"
  "    classList:{ add:function(){}, remove:function(){}, toggle:function(){},\n"
  "                contains:function(){ return false; } },\n"
  "    appendChild:function(x){ return x; }, removeChild:function(x){ return x; },\n"
  "    insertBefore:function(x){ return x; }, setAttribute:function(){},\n"
  "    getAttribute:function(){ return null; }, addEventListener:function(){},\n"
  "    querySelector:function(){ return null; }, querySelectorAll:function(){ return []; },\n"
  "    getBoundingClientRect:function(){ return {top:0,left:0,width:0,height:0,bottom:0,right:0}; },\n"
  "    focus:function(){}, click:function(){}, scrollIntoView:function(){} };\n"
  "}\n"
  "function __hueco(id){ return document.getElementById(id) || __huecoNada(); }\n"
  "function __huecoSel(sel){ return document.querySelector(sel) || __huecoNada(); }\n"
  "</script>\n</head>")
# Lo mismo por querySelector: .wheel vivia en una lamina del curso.
import html as _h
for m in set(re.findall(r"document\.querySelector\('([.#][A-Za-z0-9_-]+)'\)", s)):
    marca = ('id="%s"' % m[1:]) if m[0] == '#' else ('class="%s' % m[1:])
    # se busca en el marcado, no en el codigo
    if marca not in s:
        s = s.replace("document.querySelector('%s')" % m, "__huecoSel('%s')" % m)
        sueltos.append(m)

s = s.replace('</head>', ayuda, 1)
intacto(s, 'referencias huerfanas')
print('ids de laminas ausentes: %d  ·  neutralizados: %d  ·  con comprobacion propia: %d'
      % (len(huerfanos), len(sueltos), len(guardados)))

# ---- 4) Señas propias ------------------------------------------------------
s = s.replace('<title>HSE-001 · (Re) Inducción H&S · Módulos 1 a 6</title>',
              '<title>HSE-001 · Evaluación · (Re) Inducción H&S</title>', 1)
s = re.sub(r'(var VERSION_CURSO = ")([^"]*)(")', r'\1\2-ex\3', s, count=1)

open(DESTINO, 'w', encoding='utf-8').write(s)
print('%s: %d KB  →  %s: %d KB' % (ORIGEN, antes/1024, DESTINO, len(s)/1024))
