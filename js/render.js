// ── DOM rendering ────────────────────────────────────────────
// Builds the hexagon, the six role cards, and the Specialist
// section. Quiz and calculator views live in views.js.

import { TYPES, TYPE_BY_ID, efficiency, SPECIALIST } from './data.js';
import { escHtml, $ } from './utils.js';

/** Point on a circle for corner `i` of `n`, radius `r`, centered at (cx,cy). */
function corner(i, n, r, cx, cy) {
  // start at top (-90deg), go clockwise
  const a = (-90 + (360 / n) * i) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Build the SVG hexagon web + one positioned node button per type. */
export function renderHexagon(s) {
  const stage = $('hexStage');
  if (!stage) return;
  const n = TYPES.length;
  const size = 100; // viewBox units
  const cx = size / 2, cy = size / 2, r = 38;
  const pts = TYPES.map((_, i) => corner(i, n, r, cx, cy));

  // SVG: outer ring + spokes to center
  const ring = pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
  const spokes = pts.map((p) => `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}" />`).join('');
  const svg = `
    <svg class="hex-web" viewBox="0 0 ${size} ${size}" aria-hidden="true">
      <polygon points="${ring}" />
      <g class="hex-spokes">${spokes}</g>
    </svg>`;

  // Node buttons, absolutely positioned by percentage
  const nodes = TYPES.map((t, i) => {
    const p = pts[i];
    const eff = efficiency(s.bornType, t.id);
    const isBorn = t.id === s.bornType;
    const left = (p.x / size) * 100;
    const top = (p.y / size) * 100;
    return `
      <button class="hex-node${isBorn ? ' is-born' : ''}" data-type="${t.id}"
        style="left:${left}%;top:${top}%;--node-accent:${t.accent}"
        aria-pressed="${isBorn}"
        title="${escHtml(t.nen)} — ${escHtml(t.role)}">
        <span class="hex-node__kanji">${t.kanji}</span>
        <span class="hex-node__pct">${eff}<small>%</small></span>
        <span class="hex-node__name">${escHtml(t.nen)}</span>
      </button>`;
  }).join('');

  stage.innerHTML = svg + nodes;
  renderReadout(s);
}

/** The line of text under the hexagon explaining the current selection. */
function renderReadout(s) {
  const el = $('hexReadout');
  if (!el) return;
  const born = TYPE_BY_ID[s.bornType];
  // Rank the other types by how well the born type carries into them.
  const others = TYPES.filter((t) => t.id !== s.bornType)
    .map((t) => ({ t, eff: efficiency(s.bornType, t.id) }))
    .sort((a, b) => b.eff - a.eff);
  const best = others[0];
  const worst = others[others.length - 1];
  el.innerHTML = `
    <p class="hex-readout__lead">
      As a born <strong style="color:${born.accent}">${escHtml(born.nen)}</strong>
      (${escHtml(born.role)}) you work at <strong>100%</strong> in your own corner.
    </p>
    <ul class="hex-readout__list">
      <li>Closest reach: <strong>${escHtml(best.t.nen)}</strong>
        (${escHtml(best.t.role)}) at <strong>${best.eff}%</strong></li>
      <li>Hardest crossing: <strong>${escHtml(worst.t.nen)}</strong>
        (${escHtml(worst.t.role)}) at <strong>${worst.eff}%</strong>${worst.eff === 40 ? ' — the opposite corner' : ''}</li>
    </ul>`;
}

/** Update just the node percentages + readout after a selection change. */
export function updateHexagon(s) {
  const stage = $('hexStage');
  if (!stage) return;
  stage.querySelectorAll('.hex-node').forEach((btn) => {
    const id = btn.dataset.type;
    const eff = efficiency(s.bornType, id);
    const isBorn = id === s.bornType;
    btn.classList.toggle('is-born', isBorn);
    btn.setAttribute('aria-pressed', String(isBorn));
    const pct = btn.querySelector('.hex-node__pct');
    if (pct) pct.innerHTML = `${eff}<small>%</small>`;
  });
  renderReadout(s);
}

/** The six role cards. */
export function renderRoleCards() {
  const grid = $('roleGrid');
  if (!grid) return;
  grid.innerHTML = TYPES.map((t) => `
    <article class="role-card" style="--card-accent:${t.accent}">
      <header class="role-card__head">
        <span class="role-card__kanji" aria-hidden="true">${t.kanji}</span>
        <div class="role-card__titles">
          <h3 class="role-card__nen">${escHtml(t.nen)}</h3>
          <p class="role-card__role">${escHtml(t.role)}</p>
        </div>
      </header>
      <p class="role-card__tagline">${escHtml(t.tagline)}</p>
      <div class="role-card__block">
        <span class="role-card__label">In Nen</span>
        <p>${escHtml(t.nenDesc)}</p>
      </div>
      <div class="role-card__block">
        <span class="role-card__label">In tech</span>
        <p>${escHtml(t.roleDesc)}</p>
      </div>
      <div class="role-card__block">
        <span class="role-card__label">Signature strengths</span>
        <ul>${t.strengths.map((x) => `<li>${escHtml(x)}</li>`).join('')}</ul>
      </div>
      <div class="role-card__block">
        <span class="role-card__label">With AI</span>
        <p>${escHtml(t.withAI)}</p>
      </div>
      <div class="role-card__block role-card__watch">
        <span class="role-card__label">Watch out</span>
        <p>${escHtml(t.watch)}</p>
      </div>
      <p class="role-card__persona">${escHtml(t.personality)}</p>
    </article>`).join('');
}

/** The Specialist deep-dive section. */
export function renderSpecialist() {
  const el = $('specialistSection');
  if (!el) return;
  const spec = TYPE_BY_ID.specialization;
  el.innerHTML = `
    <div class="section__titles">
      <h2 class="section__title" id="spec-title" style="color:${spec.accent}">The Specialist problem</h2>
      <p class="section__lead">The one corner you cannot chase directly, and the most important lesson in the model.</p>
    </div>
    <div class="card spec-card" style="--card-accent:${spec.accent}">
      <p class="spec-card__intro">${escHtml(SPECIALIST.intro)}</p>
      <div class="spec-refs">
        ${SPECIALIST.references.map((r) => `
          <div class="spec-ref">
            <h4>${escHtml(r.name)}</h4>
            <p class="spec-ref__nen"><span>Nen</span> ${escHtml(r.nen)}</p>
            <p class="spec-ref__tech"><span>Tech</span> ${escHtml(r.tech)}</p>
          </div>`).join('')}
      </div>
      <p class="spec-card__lesson">${escHtml(SPECIALIST.lesson)}</p>
    </div>`;
}

/** Full first paint. */
export function render(s) {
  renderHexagon(s);
  renderRoleCards();
  renderSpecialist();
}
