// ── Post visual generator ────────────────────────────────────
// Emits the four diagrams for the Affinity post as standalone SVG.
// Run: node post/build-visuals.mjs

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
mkdirSync(OUT, { recursive: true });

const BG = '#040714';
const INK = '#f9f9f9';
const DIM = '#cacaca';
const MUTE = 'rgba(255,255,255,.5)';
const LINE = 'rgba(255,255,255,.16)';
const FONT = "'Avenir Next','Helvetica Neue',Helvetica,Arial,sans-serif";
const KANJI = "'Hiragino Sans','Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif";

// The model is owned by the site. Importing it here keeps the post
// diagrams from drifting away from what the page actually renders.
import { TYPES as SITE_TYPES, efficiency, coldLevel, withAI } from '../js/data.js';

/** Full role strings are too long for a diagram label. */
const SHORT_ROLE = {
  enhancement: 'Backend / Core',
  transmutation: 'Data / ML',
  conjuration: 'Frontend / Product',
  specialization: 'Specialist',
  manipulation: 'Management / PM',
  emission: 'Infra / SRE / Platform',
};

const TYPES = SITE_TYPES.map((t) => ({
  id: t.id,
  kanji: t.kanji,
  nen: t.nen,
  role: SHORT_ROLE[t.id] ?? t.short,
  short: t.short,
  color: t.accent,
}));

const IDX = Object.fromEntries(TYPES.map((t, i) => [t.id, i]));

/** Vertex i of a hexagon with a point at the top. */
function vertex(i, r, cx, cy) {
  const a = (-90 + 60 * i) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Text anchor + offset direction for each corner's label block. */
const ANCHOR = [
  { anchor: 'middle', dx: 0,   dy: -74 },
  { anchor: 'start',  dx: 58,  dy: -12 },
  { anchor: 'start',  dx: 58,  dy: 4 },
  { anchor: 'middle', dx: 0,   dy: 78 },
  { anchor: 'end',    dx: -58, dy: 4 },
  { anchor: 'end',    dx: -58, dy: -12 },
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function frame(w, h, body, { grain = true, bg = true } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="${FONT}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="#1a1040" stop-opacity=".85"/>
      <stop offset="55%" stop-color="#0a0a24" stop-opacity=".45"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="softer" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="20"/>
    </filter>
  </defs>
  ${bg ? `<rect width="${w}" height="${h}" fill="${BG}"/>` : ''}
  ${bg && grain ? `<rect width="${w}" height="${h}" fill="url(#glow)"/>` : ''}
  ${body}
</svg>`;
}

function heading(x, y, eyebrow, title, sub) {
  return `
  <text x="${x}" y="${y}" fill="#B015B0" font-size="20" font-weight="700" letter-spacing="3.4">${esc(eyebrow.toUpperCase())}</text>
  <text x="${x}" y="${y + 48}" fill="${INK}" font-size="42" font-weight="700" letter-spacing="-.4">${esc(title)}</text>
  ${sub ? `<text x="${x}" y="${y + 84}" fill="${MUTE}" font-size="21">${esc(sub)}</text>` : ''}`;
}

function footnote(x, y, text) {
  return `<text x="${x}" y="${y}" fill="rgba(255,255,255,.34)" font-size="17">${esc(text)}</text>`;
}

/**
 * Node disc with kanji, plus name/role label placed outside the ring.
 * When `pct` is given the disc grows and stacks the number under the
 * kanji, so the label never collides with the efficiency polygon.
 */
function node(t, i, p, { pct = null, dimmed = false, showLabel = true, pad = 0 } = {}) {
  const a = ANCHOR[i];
  const scored = pct !== null;
  const radius = scored ? 52 : 40;
  const op = dimmed ? 0.42 : 1;
  // `pad` pushes side labels further out. The default sits ~5px from
  // the disc's glow, which the glow then bleeds over.
  const lx = p.x + a.dx + (scored ? Math.sign(a.dx) * 14 : 0) + Math.sign(a.dx) * pad;
  const ly = p.y + a.dy + (a.dy < 0 ? -14 : a.dy > 0 ? 14 : 0);
  return `
  <g opacity="${op}">
    <circle cx="${p.x}" cy="${p.y}" r="${radius + 13}" fill="${t.color}" opacity=".16" filter="url(#soft)"/>
    <circle cx="${p.x}" cy="${p.y}" r="${radius}" fill="${BG}" stroke="${t.color}" stroke-width="2.5"/>
    ${scored
      ? `<text x="${p.x}" y="${p.y - 4}" text-anchor="middle" font-family="${KANJI}" font-size="38" fill="${t.color}">${t.kanji}</text>
    <text x="${p.x}" y="${p.y + 30}" text-anchor="middle" fill="${t.color}" font-size="26" font-weight="700">${pct}%</text>`
      : `<text x="${p.x}" y="${p.y + radius * 0.34}" text-anchor="middle" font-family="${KANJI}" font-size="${radius * 1.05}" fill="${t.color}">${t.kanji}</text>`}
    ${showLabel ? `
    <text x="${lx}" y="${ly}" text-anchor="${a.anchor}" fill="${INK}" font-size="25" font-weight="700">${esc(t.nen)}</text>
    <text x="${lx}" y="${ly + 27}" text-anchor="${a.anchor}" fill="${DIM}" font-size="21">${esc(t.role)}</text>` : ''}
  </g>`;
}

// ── 1. The affinity hexagon ──────────────────────────────────

/**
 * The six-corner chart.
 *
 * `bare` drops the page background, heading and footnote, leaving just
 * the chart on transparency for compositing into another image. The
 * node discs stay filled, or the spokes would run straight through
 * them once a new background shows.
 */
function hexagonMap({ bare = false } = {}) {
  // The bare canvas is cropped close to the artwork, so it drops into
  // another image without a slab of empty space around it.
  const W = bare ? 1240 : 1600;
  const H = bare ? 920 : 1180;
  const cx = W / 2, cy = bare ? 460 : 640, r = 300;
  const pad = bare ? 26 : 0;
  const pts = TYPES.map((_, i) => vertex(i, r, cx, cy));
  const ring = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const body = `
  ${bare ? '' : heading(96, 108, 'The six types', 'Every engineering job is one of six corners.', 'Hunter x Hunter’s Nen chart, relabelled for tech work.')}
  <polygon points="${ring}" fill="none" stroke="${LINE}" stroke-width="2"/>
  ${pts.map((p) => `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${LINE}" stroke-width="1.2" stroke-dasharray="5 8"/>`).join('')}
  <circle cx="${cx}" cy="${cy}" r="94" fill="${BG}" opacity="${bare ? '.75' : '.9'}"/>
  <text x="${cx}" y="${cy + 34}" text-anchor="middle" font-family="${KANJI}" font-size="96" fill="rgba(255,255,255,.13)">発</text>
  ${TYPES.map((t, i) => node(t, i, pts[i], { pad })).join('')}
  ${bare ? '' : footnote(96, H - 52, 'Opposite corners are the hardest crossings: Backend ↔ Specialist · Data ↔ Management · Frontend ↔ Infra')}`;

  return frame(W, H, body, { bg: !bare });
}

// ── 2. Efficiency falloff from one corner ────────────────────

function falloff(bornId = 'emission') {
  const W = 1600, H = 1180;
  const cx = W / 2, cy = 650, r = 300;
  const born = TYPES[IDX[bornId]];
  const pts = TYPES.map((_, i) => vertex(i, r, cx, cy));
  const effs = TYPES.map((t) => efficiency(bornId, t.id));

  // The efficiency shape: each vertex pulled in toward the centre by its own score.
  const shape = TYPES.map((t, i) => {
    const p = vertex(i, r * (effs[i] / 100), cx, cy);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(' ');

  const guides = [0.25, 0.5, 0.75, 1].map((k) => {
    const g = TYPES.map((_, i) => {
      const p = vertex(i, r * k, cx, cy);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(' ');
    return `<polygon points="${g}" fill="none" stroke="rgba(255,255,255,.09)" stroke-width="1"/>`;
  }).join('');

  const body = `
  ${heading(96, 108, 'Efficiency falloff', 'A born ' + born.nen + ' pointed at everyone else’s work.', 'You keep 100% at home and shed about 20% for every step around the ring.')}
  ${guides}
  ${TYPES.map((_, i) => {
    const p = pts[i];
    return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${LINE}" stroke-width="1.2" stroke-dasharray="5 8"/>`;
  }).join('')}
  <polygon points="${shape}" fill="${born.color}" fill-opacity=".17" stroke="${born.color}" stroke-width="3" stroke-linejoin="round"/>
  ${TYPES.map((t, i) => node(t, i, pts[i], { pct: effs[i], dimmed: effs[i] === 0 })).join('')}
  ${(() => {
    const cj = TYPES[IDX.conjuration];
    const p = pts[IDX.conjuration];
    return `
  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="72" fill="none" stroke="${cj.color}" stroke-width="2" stroke-dasharray="6 8" opacity=".7"/>
  <text x="${(p.x + 92).toFixed(1)}" y="${(p.y + 96).toFixed(1)}" fill="${cj.color}" font-size="22" font-weight="700">“Hey, can you do the website?”</text>
  <text x="${(p.x + 92).toFixed(1)}" y="${(p.y + 126).toFixed(1)}" fill="${MUTE}" font-size="20">The opposite corner. This is the 40%.</text>`;
  })()}
  ${footnote(96, H - 82, `Born ${born.nen} (${born.role}) — the shape is what carries over.`)}
  ${footnote(96, H - 50, 'Specialization is locked at 0 for everyone who is not one. You do not step around the ring into it.')}`;

  return frame(W, H, body);
}

// ── 3. What AI actually amplifies ────────────────────────────

function aiLaw() {
  const W = 1600, H = 1044;
  const barX = 560, barW = 780, barH = 46;

  /**
   * One bar: where you stand cold, what AI adds on top, and the wall
   * it stops at. Numbers come from the site's own model so the diagram
   * cannot drift from what the calculator draws.
   */
  function bar(y, label, ceiling, axis, color, note) {
    const cold = coldLevel(ceiling);
    const total = withAI(ceiling, 100, axis);
    const cw = (cold / 100) * barW;
    const aw = ((total - cold) / 100) * barW;
    const capX = barX + (ceiling / 100) * barW;
    return `
    <text x="${barX - 32}" y="${y + 30}" text-anchor="end" fill="${INK}" font-size="23" font-weight="600">${esc(label)}</text>
    <rect x="${barX}" y="${y}" width="${barW}" height="${barH}" rx="8" fill="rgba(255,255,255,.05)"/>
    <rect x="${barX}" y="${y}" width="${cw.toFixed(1)}" height="${barH}" rx="8" fill="${color}" fill-opacity=".95"/>
    <rect x="${(barX + cw).toFixed(1)}" y="${y}" width="${aw.toFixed(1)}" height="${barH}" rx="8" fill="${color}" fill-opacity=".34"/>
    ${aw > 4 ? `<rect x="${(barX + cw).toFixed(1)}" y="${y}" width="2" height="${barH}" fill="${BG}" opacity=".9"/>` : ''}
    <rect x="${(capX - 2).toFixed(1)}" y="${y - 10}" width="4" height="${barH + 20}" rx="2" fill="${INK}"/>
    <text x="${barX + barW + 26}" y="${y + 32}" fill="${color}" font-size="26" font-weight="700">${total}%</text>
    ${note ? `<text x="${barX}" y="${y + barH + 38}" fill="${MUTE}" font-size="19">${esc(note)}</text>` : ''}`;
  }

  const G = '#4ade80', O = '#fb923c';
  const home = efficiency('conjuration', 'conjuration');
  const away = efficiency('emission', 'conjuration');

  const body = `
  ${heading(96, 108, 'The AI law', 'AI is aura. It is not a type change.', 'Two engineers, the same frontend task, all the AI they want.')}

  <text x="96" y="272" fill="${G}" font-size="26" font-weight="700">Born Conjurer, frontend is home</text>
  <text x="${barX + (home / 100) * barW}" y="288" text-anchor="end" fill="${MUTE}" font-size="18" font-weight="700">CEILING ${home}%</text>
  ${bar(316, 'Output shipped', home, 'output', G, '')}
  ${bar(430, 'Judgment to grade it', home, 'judgment', G, 'Already at the ceiling. What AI buys here is speed, which this chart cannot draw.')}

  <line x1="96" y1="566" x2="${W - 96}" y2="566" stroke="rgba(255,255,255,.1)" stroke-width="1"/>

  <text x="96" y="642" fill="${O}" font-size="26" font-weight="700">Born Emitter, infra, the opposite corner</text>
  <text x="${barX + (away / 100) * barW}" y="658" text-anchor="end" fill="${MUTE}" font-size="18" font-weight="700">CEILING ${away}%</text>
  ${bar(686, 'Output shipped', away, 'output', O, '')}
  ${bar(800, 'Judgment to grade it', away, 'judgment', O, 'Ships it, cannot tell that it is subtly wrong. This is where the 40% actually bites.')}

  <rect x="${barX}" y="${H - 96}" width="18" height="18" rx="4" fill="rgba(255,255,255,.55)"/>
  <text x="${barX + 28}" y="${H - 81}" fill="${MUTE}" font-size="18">Where you stand cold</text>
  <rect x="${barX + 246}" y="${H - 96}" width="18" height="18" rx="4" fill="rgba(255,255,255,.22)"/>
  <text x="${barX + 274}" y="${H - 81}" fill="${MUTE}" font-size="18">Added by AI</text>
  <rect x="${barX + 452}" y="${H - 99}" width="4" height="24" rx="2" fill="${INK}"/>
  <text x="${barX + 470}" y="${H - 81}" fill="${MUTE}" font-size="18">Ceiling, which never moves</text>
  ${footnote(96, H - 44, 'AI carries you up to the ceiling your affinity already set. It does not raise the ceiling.')}`;

  return frame(W, H, body);
}

// ── 4. One person's trajectory ───────────────────────────────

function trajectory() {
  const W = 1800, H = 880;
  const r = 132;
  const cys = 470;
  const panels = [
    {
      cx: 340,
      title: 'Early',
      caption: 'Read as infra by the dev side\nand as dev by the infra side.',
      lit: ['emission', 'enhancement'],
      strong: null,
    },
    {
      cx: 900,
      title: 'Recent years',
      caption: 'Finally positioned in the corner\nthe work was always shaped like.',
      lit: ['specialization'],
      strong: 'specialization',
    },
    {
      cx: 1460,
      title: 'Now',
      caption: 'Two steps out, deliberately.\nA 60% corner, worked at honestly.',
      lit: ['specialization'],
      strong: 'specialization',
      arrowTo: 'transmutation',
    },
  ];

  const body = `
  ${heading(96, 108, 'Reading your own chart', 'What this looks like over one career.', 'The corner does not move much. Where you point it does.')}
  ${panels.map((pn) => {
    const pts = TYPES.map((_, i) => vertex(i, r, pn.cx, cys));
    const ring = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const arrowIdx = pn.arrowTo ? IDX[pn.arrowTo] : -1;
    const strongIdx = pn.strong ? IDX[pn.strong] : -1;
    return `
    <text x="${pn.cx}" y="${cys - r - 96}" text-anchor="middle" fill="${INK}" font-size="27" font-weight="700">${esc(pn.title)}</text>
    <polygon points="${ring}" fill="none" stroke="${LINE}" stroke-width="1.6"/>
    ${arrowIdx >= 0 ? `<line x1="${pts[strongIdx].x.toFixed(1)}" y1="${pts[strongIdx].y.toFixed(1)}" x2="${pts[arrowIdx].x.toFixed(1)}" y2="${pts[arrowIdx].y.toFixed(1)}" stroke="${TYPES[arrowIdx].color}" stroke-width="3" stroke-dasharray="8 7" opacity=".85"/>
    <circle cx="${pts[arrowIdx].x.toFixed(1)}" cy="${pts[arrowIdx].y.toFixed(1)}" r="15" fill="${TYPES[arrowIdx].color}" opacity=".9"/>` : ''}
    ${TYPES.map((t, i) => {
      const on = pn.lit.includes(t.id);
      const target = i === arrowIdx;
      const p = pts[i];
      const a = ANCHOR[i];
      const rad = on || target ? 25 : 16;
      const stroke = on ? t.color : target ? t.color : 'rgba(255,255,255,.18)';
      const kanjiFill = on ? t.color : target ? t.color : 'rgba(255,255,255,.30)';
      const showRole = on || target;
      const lx = p.x + Math.sign(a.dx) * 40;
      const ly = p.y + (a.dy < 0 ? -40 : a.dy > 0 ? 50 : 5);
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rad}" fill="${BG}" stroke="${stroke}" stroke-width="${on || target ? 3 : 1.5}" ${target && !on ? 'stroke-dasharray="5 4"' : ''}/>
      <text x="${p.x.toFixed(1)}" y="${(p.y + (on || target ? 9 : 6)).toFixed(1)}" text-anchor="middle" font-family="${KANJI}" font-size="${on || target ? 26 : 17}" fill="${kanjiFill}">${t.kanji}</text>
      ${showRole ? `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${a.anchor}" fill="${t.color}" font-size="18" font-weight="600">${esc(t.short)}</text>` : ''}`;
    }).join('')}
    ${pn.caption.split('\n').map((ln, k) => `<text x="${pn.cx}" y="${cys + r + 92 + k * 30}" text-anchor="middle" fill="${MUTE}" font-size="20">${esc(ln)}</text>`).join('')}`;
  }).join('')}
  ${footnote(96, H - 40, 'Specialization → Transmutation is two steps. The model says 60% and that is roughly what it feels like.')}`;

  return frame(W, H, body);
}

// ── Emit ─────────────────────────────────────────────────────

const files = {
  '01-affinity-hexagon.svg': hexagonMap(),
  '01b-affinity-hexagon-bare.svg': hexagonMap({ bare: true }),
  '02-efficiency-falloff.svg': falloff('emission'),
  '03-ai-law.svg': aiLaw(),
  '04-trajectory.svg': trajectory(),
};

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(OUT, name), svg);
  console.log('wrote', name, `${(svg.length / 1024).toFixed(1)}kb`);
}
