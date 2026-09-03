// ── Post visuals, edicion en español ─────────────────────────
// Version "debrief" de los diagramas: lienzo 16:9, sin titulares
// ni notas al pie, solo el hexagono y sus seis esquinas.
// Los rotulos van en español y el centro lleva una palabra legible
// en lugar del kanji 発 (Hatsu, la aplicacion personal del aura).
//
// Cada pieza se emite en dos temas, oscuro y claro. El claro no es
// el oscuro con otro fondo: los seis acentos de marca estan elegidos
// contra un fondo casi negro y sobre crema el amarillo y el verde
// dejan de leerse, asi que el tema claro trae su propia paleta.
//
// Ejecutar: node post/build-visuals.es.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// El modelo lo posee el sitio. Importarlo aqui es lo que impide que
// los diagramas se separen de lo que la pagina realmente dibuja.
import { TYPES as SITE_TYPES, efficiency } from '../js/data.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'es');
const PNG_DIR = join(OUT, 'png');
mkdirSync(PNG_DIR, { recursive: true });

const FONT = "'Avenir Next','Helvetica Neue',Helvetica,Arial,sans-serif";
const KANJI = "'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif";

// ── Temas ────────────────────────────────────────────────────

/**
 * Acentos para fondo claro. Son los mismos tonos del sitio bajados
 * a la banda 700, que es lo que hace falta para pasar de 4.5:1 sobre
 * crema. Los originales rondan la banda 400 y estan calculados para
 * brillar sobre casi negro: el amarillo #facc15 sobre #fbf9f1 da
 * menos de 1.5:1, o sea invisible.
 */
const LIGHT_ACCENT = {
  enhancement: '#be123c',
  transmutation: '#6d28d9',
  conjuration: '#166534',
  specialization: '#854d0e',
  manipulation: '#0369a1',
  emission: '#c2410c',
};

const DARK = {
  id: 'oscuro',
  light: false,
  bg: '#040714',
  disc: '#040714',
  ink: '#f9f9f9',
  dim: '#d8d8d8',
  line: 'rgba(255,255,255,.16)',
  guide: 'rgba(255,255,255,.11)',
  centre: 'rgba(255,255,255,.34)',
  halo: '.16',
  ring: '#ffffff',
  faded: '.42',
  shape: '.17',
};

const LIGHT = {
  id: 'claro',
  light: true,
  bg: '#fbf9f1',
  // Los discos van en blanco pleno y no en el color del fondo, porque
  // el fondo es un degradado y un relleno plano se notaria como un
  // parche en la parte alta del lienzo.
  disc: '#ffffff',
  ink: '#17161d',
  dim: '#57555f',
  line: 'rgba(23,22,29,.22)',
  guide: 'rgba(23,22,29,.13)',
  centre: 'rgba(23,22,29,.34)',
  halo: '.20',
  ring: '#17161d',
  faded: '.5',
  shape: '.14',
};

/** Tema activo. Lo fija el bucle de emision antes de construir cada pieza. */
let T = DARK;

/** Acento del tipo en el tema activo. */
const ac = (t) => (T.light ? t.colorLight : t.color);

/** Nombre Nen en español. */
const ES_NEN = {
  enhancement: 'Intensificación',
  transmutation: 'Transmutación',
  conjuration: 'Materialización',
  specialization: 'Especialización',
  manipulation: 'Manipulación',
  emission: 'Emisión',
};

/** Familia de puestos, recortada para caber como rotulo. */
const ES_ROLE = {
  enhancement: 'Backend / Core',
  transmutation: 'Datos / ML',
  conjuration: 'Frontend / Producto',
  specialization: 'Especialistas puros',
  manipulation: 'Management / PM',
  emission: 'Infraestructura / SRE / Plataforma',
};

const TYPES = SITE_TYPES.map((t) => ({
  id: t.id,
  kanji: t.kanji,
  nen: ES_NEN[t.id],
  role: ES_ROLE[t.id],
  color: t.accent,
  colorLight: LIGHT_ACCENT[t.id],
}));

const IDX = Object.fromEntries(TYPES.map((t, i) => [t.id, i]));

// ── Lienzo 16:9 ──────────────────────────────────────────────
const W = 1600, H = 900, CX = 800, CY = 470, R = 238;

/** Vertice i de un hexagono con punta arriba. */
function vertex(i, r, cx = CX, cy = CY) {
  const a = (-90 + 60 * i) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/**
 * Direccion del bloque de rotulo por esquina. Se calcula con el radio
 * del disco en vez de fijarlo, porque el disco crece cuando lleva
 * porcentaje.
 *
 * Arriba y abajo no son simetricos a proposito: el bloque son dos
 * lineas y siempre es la de familia de puestos la que queda debajo,
 * asi que en la esquina superior es la segunda linea la que se acerca
 * al disco y hace falta un desplazamiento mayor.
 */
function anchorFor(i, nodeR) {
  return [
    { anchor: 'middle', dx: 0,             dy: -(nodeR + 58) },
    { anchor: 'start',  dx: nodeR + 30,    dy: -10 },
    { anchor: 'start',  dx: nodeR + 30,    dy: 10 },
    { anchor: 'middle', dx: 0,             dy: nodeR + 54 },
    { anchor: 'end',    dx: -(nodeR + 30), dy: 10 },
    { anchor: 'end',    dx: -(nodeR + 30), dy: -10 },
  ][i];
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Fondo del lienzo. En oscuro es el resplandor radial violeta del
 * sitio; en claro es el degradado vertical del gris calido al crema,
 * porque un resplandor sobre crema solo ensucia.
 */
function backdrop(w, h) {
  return T.light
    ? `<rect width="${w}" height="${h}" fill="url(#wash)"/>`
    : `<rect width="${w}" height="${h}" fill="${T.bg}"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>`;
}

function frame(body, w = W, h = H, { bare = false } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="${FONT}">
  <defs>
    ${T.light
      ? `<linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f1efee"/>
      <stop offset="55%" stop-color="#fbf9f1"/>
      <stop offset="100%" stop-color="#fffdee"/>
    </linearGradient>`
      : `<radialGradient id="glow" cx="50%" cy="50%" r="62%">
      <stop offset="0%" stop-color="#1a1040" stop-opacity=".85"/>
      <stop offset="55%" stop-color="#0a0a24" stop-opacity=".45"/>
      <stop offset="100%" stop-color="${T.bg}" stop-opacity="0"/>
    </radialGradient>`}
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${T.bg}" stop-opacity=".97"/>
      <stop offset="58%" stop-color="${T.bg}" stop-opacity=".9"/>
      <stop offset="100%" stop-color="${T.bg}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
  </defs>
  ${bare ? '' : backdrop(w, h)}
  ${body}
</svg>`;
}

/**
 * Disco del nodo con su kanji, mas nombre y familia fuera del anillo.
 * Con `pct` el disco crece y apila el numero bajo el kanji, para que
 * el rotulo no choque con el poligono de eficiencia.
 */
function node(t, i, p, { pct = null, dimmed = false } = {}) {
  const scored = pct !== null;
  const rad = scored ? 50 : 44;
  const a = anchorFor(i, rad);
  const lx = p.x + a.dx;
  const ly = p.y + a.dy;
  const c = ac(t);
  return `
  <g opacity="${dimmed ? T.faded : 1}">
    <circle cx="${p.x}" cy="${p.y}" r="${rad + 13}" fill="${c}" opacity="${T.halo}" filter="url(#soft)"/>
    <circle cx="${p.x}" cy="${p.y}" r="${rad}" fill="${T.disc}" stroke="${c}" stroke-width="3.6"/>
    ${scored
      ? `<text x="${p.x}" y="${p.y - 4}" text-anchor="middle" font-family="${KANJI}" font-size="36" font-weight="600" fill="${c}">${t.kanji}</text>
    <text x="${p.x}" y="${p.y + 29}" text-anchor="middle" fill="${c}" font-size="25" font-weight="700">${pct}%</text>`
      : `<text x="${p.x}" y="${p.y + rad * 0.34}" text-anchor="middle" font-family="${KANJI}" font-size="${(rad * 1.05).toFixed(0)}" font-weight="600" fill="${c}">${t.kanji}</text>`}
    <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${a.anchor}" fill="${T.ink}" font-size="26" font-weight="700">${esc(t.nen)}</text>
    <text x="${lx.toFixed(1)}" y="${(ly + 28).toFixed(1)}" text-anchor="${a.anchor}" fill="${T.dim}" font-size="21" font-weight="600">${esc(t.role)}</text>
  </g>`;
}

/**
 * Palabra central, en el hueco donde el original pone 発.
 * El cuerpo se deriva del largo porque el disco es fijo: una palabra
 * de diez letras a 27px se sale por los lados.
 */
function centre(word) {
  const size = Math.min(27, Math.round(220 / word.length));
  return `
  <circle cx="${CX}" cy="${CY}" r="124" fill="url(#core)"/>
  <text x="${CX}" y="${CY + size * 0.35}" text-anchor="middle" fill="${T.centre}"
        font-size="${size}" font-weight="700" letter-spacing="${(size * 0.16).toFixed(1)}">${esc(word.toUpperCase())}</text>`;
}

// ── 1. El hexagono ───────────────────────────────────────────

function hexagono(word) {
  const pts = TYPES.map((_, i) => vertex(i, R));
  const ring = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return frame(`
  <polygon points="${ring}" fill="none" stroke="${T.line}" stroke-width="2.6"/>
  ${pts.map((p) => `<line x1="${CX}" y1="${CY}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${T.line}" stroke-width="1.7" stroke-dasharray="5 8"/>`).join('')}
  ${centre(word)}
  ${TYPES.map((t, i) => node(t, i, pts[i])).join('')}`);
}

// ── 2. Caida de eficiencia desde una esquina ─────────────────

function eficiencia(bornId) {
  const born = TYPES[IDX[bornId]];
  const pts = TYPES.map((_, i) => vertex(i, R));
  const effs = TYPES.map((t) => efficiency(bornId, t.id));

  const shape = TYPES.map((_, i) => {
    const p = vertex(i, R * (effs[i] / 100));
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');

  const guides = [0.25, 0.5, 0.75, 1].map((k) => {
    const g = TYPES.map((_, i) => {
      const p = vertex(i, R * k);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    return `<polygon points="${g}" fill="none" stroke="${T.guide}" stroke-width="1.4"/>`;
  }).join('');

  return frame(`
  ${guides}
  ${pts.map((p) => `<line x1="${CX}" y1="${CY}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${T.line}" stroke-width="1.7" stroke-dasharray="5 8"/>`).join('')}
  <polygon points="${shape}" fill="${ac(born)}" fill-opacity="${T.shape}" stroke="${ac(born)}" stroke-width="3.8" stroke-linejoin="round"/>
  ${TYPES.map((t, i) => node(t, i, pts[i], { pct: effs[i], dimmed: effs[i] === 0 })).join('')}`);
}

// ── 3. Banner de cabecera ────────────────────────────────────
// Version cartel, no diagrama: sin kanji, sin porcentajes y sin
// rotulos de esquina. Los discos quedan vacios y la palabra central
// es lo unico que se lee, porque encima de un post el titulo del
// articulo ya dice el resto.

/** Segmento a→b acortado por sus extremos, para no entrar en los discos. */
function segment(a, b, cutA, cutB, attrs) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  return `<line x1="${(a.x + ux * cutA).toFixed(1)}" y1="${(a.y + uy * cutA).toFixed(1)}" x2="${(b.x - ux * cutB).toFixed(1)}" y2="${(b.y - uy * cutB).toFixed(1)}" ${attrs}/>`;
}

/**
 * Anillo, radios y seis discos vacios, sin identidad de color.
 *
 * `bare` es para la version sin fondo. Ahi los discos no pueden ir
 * rellenos, porque el relleno es opaco y taparia lo que se ponga
 * detras; y como el relleno era justo lo que ocultaba la entrada de
 * los radios y del anillo en cada disco, esos trazos pasan a
 * dibujarse recortados en vez de como un poligono continuo.
 */
function ringOnly(cx, cy, r, nodeR, { stroke = 3.6, spoke = 1.7, bare = false } = {}) {
  const pts = TYPES.map((_, i) => vertex(i, r, cx, cy));
  const c = { x: cx, y: cy };
  const cut = nodeR + 2;
  const ringAttrs = `stroke="${T.line}" stroke-width="${(stroke * 0.72).toFixed(1)}"`;
  const spokeAttrs = `stroke="${T.line}" stroke-width="${spoke}" stroke-dasharray="5 8"`;

  const edges = bare
    ? pts.map((p, i) => segment(p, pts[(i + 1) % pts.length], cut, cut, ringAttrs)).join('')
    : `<polygon points="${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" fill="none" ${ringAttrs}/>`;

  const spokes = pts
    .map((p) => segment(c, p, 0, bare ? cut : 0, spokeAttrs))
    .join('');

  return `
  ${edges}
  ${spokes}
  ${pts.map((p) => `
  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${nodeR + 11}" fill="${T.ring}" opacity="${T.light ? '.10' : '.13'}" filter="url(#soft)"/>
  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${nodeR}" fill="${bare ? 'none' : T.disc}" stroke="${T.ring}" stroke-width="${stroke}"/>`).join('')}`;
}

/**
 * Palabra grande. A diferencia del centro del diagrama, aqui va a
 * tinta plena: es lo que tiene que llamar la atencion.
 */
function word(x, y, text, size, { anchor = 'middle' } = {}) {
  return `<text x="${x}" y="${(y + size * 0.35).toFixed(1)}" text-anchor="${anchor}" fill="${T.ink}"
        font-size="${size}" font-weight="700" letter-spacing="${(size * 0.16).toFixed(1)}">${esc(text.toUpperCase())}</text>`;
}

/**
 * Par de palabras separadas por un aspa, al modo del logotipo de
 * Hunter x Hunter.
 *
 * Se emiten tres textos con anclaje propio en vez de uno solo con
 * tspans, porque asi la posicion no depende de como el renderizador
 * acumule el letter-spacing entre tramos de distinto cuerpo.
 *
 * Dos ajustes medidos sobre el PNG, no calculados:
 * el rasterizador no cuenta el espaciado que cuelga detras de la
 * ultima letra, asi que el anclaje `end` ya deja el borde derecho en
 * su sitio y no hay que compensarlo; y el aspa se centra sobre el eje
 * matematico de la fuente, mas bajo que el centro de las mayusculas,
 * asi que lleva su propia linea base.
 */
function wordPair(cx, cy, text, size, { inner = size * 0.62, cross = true } = {}) {
  const ls = size * 0.16;
  const gap = inner;
  const y = (cy + size * 0.35).toFixed(1);
  const crossSize = size * 0.78;
  const crossY = (cy + crossSize * 0.30).toFixed(1);
  const t = esc(text.toUpperCase());
  const base = `fill="${T.ink}" font-weight="700"`;
  return `
  <text x="${(cx - gap).toFixed(1)}" y="${y}" text-anchor="end" ${base} font-size="${size}" letter-spacing="${ls.toFixed(1)}">${t}</text>
  ${cross ? `<text x="${cx}" y="${crossY}" text-anchor="middle" ${base} font-size="${crossSize.toFixed(1)}">×</text>` : ''}
  <text x="${(cx + gap).toFixed(1)}" y="${y}" text-anchor="start" ${base} font-size="${size}" letter-spacing="${ls.toFixed(1)}">${t}</text>`;
}

/**
 * Ancho del par por unidad de cuerpo. Sirve para despejar el cuerpo
 * que hace que el par ocupe el ancho disponible, en vez de fijarlo y
 * descubrir en el render que se sale.
 */
function pairUnitWidth(len) {
  return 2 * (len * 0.68 + (len - 1) * 0.16) + 2 * 0.62;
}

/** 2:1, la proporcion de la imagen destacada de Medium. */
const BW = 1200, BH = 600;

function bannerCentrado(text) {
  const cx = BW / 2, cy = BH / 2, r = 232;
  // El punto mas estrecho del interior es la altura media del
  // hexagono, donde el borde queda a r*cos(30). La palabra se
  // dimensiona contra ese ancho, no contra el lienzo.
  const inner = r * Math.cos(Math.PI / 6) * 2 - 42;
  const size = Math.min(66, Math.round(inner / (text.length * 0.84)));
  return frame(`
  ${ringOnly(cx, cy, r, 34, { stroke: 4 })}
  <circle cx="${cx}" cy="${cy}" r="210" fill="url(#core)"/>
  ${word(cx, cy, text, size)}`, BW, BH);
}

/** 4:1. El hexagono ya no cabe centrado, asi que va como marca al lado. */
const AW = 1200, AH = 300;

function bannerAncho(text) {
  const cx = 280, cy = AH / 2, r = 105;
  return frame(`
  ${ringOnly(cx, cy, r, 18, { stroke: 3.2, spoke: 1.4 })}
  <circle cx="${cx}" cy="${cy}" r="62" fill="url(#core)"/>
  ${word(460, cy, text, 100, { anchor: 'start' })}`, AW, AH);
}

/**
 * El par desborda el hexagono a proposito: a media altura el hexagono
 * no tiene ningun disco, solo sus dos lados verticales, asi que las
 * palabras lo atraviesan sin chocar con nada.
 */
function bannerPar(text, { bare = false } = {}) {
  const cx = BW / 2, cy = BH / 2, r = 232;
  const size = Math.min(84, Math.floor((BW - 200) / pairUnitWidth(text.length)));
  return frame(`
  ${ringOnly(cx, cy, r, 34, { stroke: 4, bare })}
  ${bare ? '' : `<circle cx="${cx}" cy="${cy}" r="210" fill="url(#core)"/>`}
  ${wordPair(cx, cy, text, size)}`, BW, BH, { bare });
}

/**
 * En 4:1 el hexagono no cabe lo bastante grande como para que las
 * palabras lo atraviesen sin pisar los discos laterales, asi que
 * ocupa el sitio del aspa y hace de nexo entre las dos palabras.
 */
function bannerParAncho(text, { bare = false } = {}) {
  const cx = AW / 2, cy = AH / 2, r = 108, nodeR = 16;
  // Media anchura ocupada por la marca, discos y halo incluidos.
  const mark = r * Math.cos(Math.PI / 6) + nodeR + 11;
  const inner = mark + 34;
  // Lo que queda para las dos palabras una vez descontada la marca.
  const size = Math.floor((AW - 140 - inner * 2) / (pairUnitWidth(text.length) - 1.24));
  return frame(`
  ${ringOnly(cx, cy, r, nodeR, { stroke: 3.2, spoke: 1.4, bare })}
  ${bare ? '' : `<circle cx="${cx}" cy="${cy}" r="100" fill="url(#core)"/>`}
  ${wordPair(cx, cy, text, size, { inner, cross: false })}`, AW, AH, { bare });
}

/** Solo el fondo, al tamaño de un banner, para componer aparte. */
function fondo(w, h) {
  return frame('', w, h);
}

// ── Emitir ───────────────────────────────────────────────────
// El tema oscuro conserva los nombres de siempre y el claro añade
// el sufijo, para no romper enlaces a lo ya publicado.

const PIECES = [
  ['hexagono-trabajo',            () => hexagono('Trabajo'),            W,  H],
  ['hexagono-tecnologia',         () => hexagono('Tecnología'),         W,  H],
  ['eficiencia-emision',          () => eficiencia('emission'),         W,  H],
  ['eficiencia-materializacion',  () => eficiencia('conjuration'),      W,  H],
  ['banner-trabajo',              () => bannerCentrado('Trabajo'),      BW, BH],
  ['banner-trabajo-ancho',        () => bannerAncho('Trabajo'),         AW, AH],
  ['banner-trabajo-x-trabajo',    () => bannerPar('Trabajo'),           BW, BH],
  ['banner-trabajo-x-trabajo-ancho', () => bannerParAncho('Trabajo'),   AW, AH],
  ['banner-trabajo-x-trabajo-sinfondo',       () => bannerPar('Trabajo', { bare: true }),      BW, BH, true],
  ['banner-trabajo-x-trabajo-ancho-sinfondo', () => bannerParAncho('Trabajo', { bare: true }), AW, AH, true],
  ['fondo',       () => fondo(BW, BH), BW, BH],
  ['fondo-ancho', () => fondo(AW, AH), AW, AH],
];

const files = {};
for (const theme of [DARK, LIGHT]) {
  T = theme;
  const tag = theme.light ? '-claro' : '';
  for (const [name, build, w, h, alpha = false] of PIECES) {
    files[`${name}${tag}.svg`] = { svg: build(), w, h, bg: theme.bg, alpha };
  }
}

for (const [name, f] of Object.entries(files)) {
  writeFileSync(join(OUT, name), f.svg);
}
console.log(`escritos ${Object.keys(files).length} SVG en post/es/`);

// ── PNG a 2x ─────────────────────────────────────────────────
// Medium y las plantillas de slides solo aceptan raster. sharp vive
// en el node_modules del monorepo, no en este repo, asi que se
// resuelve subiendo desde aqui en vez de con una ruta absoluta.

const require = createRequire(join(HERE, '../../../'));
const sharp = require('sharp');
const SCALE = 2;

for (const [name, f] of Object.entries(files)) {
  const target = join(PNG_DIR, name.replace(/\.svg$/, '.png'));
  let img = sharp(join(OUT, name), { density: 72 * SCALE })
    .resize(f.w * SCALE, f.h * SCALE, { fit: 'fill' });
  // Las piezas sueltas conservan el alfa; el resto se aplana sobre su
  // propio fondo para que ningun visor las componga sobre blanco.
  if (!f.alpha) img = img.flatten({ background: f.bg });
  await img.png({ compressionLevel: 9 }).toFile(target);
  console.log(`  → es/png/${name.replace(/\.svg$/, '.png')}  ${f.w * SCALE}×${f.h * SCALE}${f.alpha ? '  (alfa)' : ''}`);
}
