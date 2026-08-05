// ── The affinity hexagon ─────────────────────────────────────
// Two selectable layers on one chart: the corner your judgment came
// from (affinity) and the corner the work sits in (workingIn).
// Labels swap between tech roles and Nen names.

import { TYPES, TYPE_BY_ID, efficiency } from './data.js';
import { expectation, crossing } from './expect.js';
import { escHtml, $ } from './utils.js';

const SIZE = 100;
const CX = SIZE / 2, CY = SIZE / 2, R = 33;
const RINGS = [0.25, 0.5, 0.75, 1];

/** Point on a circle for corner `i` of `n`, radius `r`, centered at (cx,cy). */
function corner(i, n, r, cx, cy) {
  const a = (-90 + (360 / n) * i) * (Math.PI / 180);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** What a node is called, depending on the label toggle. */
export function labelFor(t, mode) {
  return mode === 'nen' ? t.nen : t.short;
}

/** Vertices of the efficiency shape: each corner pulled in by its score. */
function shapePoints(affinityId) {
  return TYPES.map((t, i) => {
    const p = corner(i, TYPES.length, R * (efficiency(affinityId, t.id) / 100), CX, CY);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(' ');
}

function nodeMarkup(t, i, p, s) {
  const eff = efficiency(s.affinity, t.id);
  const isAffinity = t.id === s.affinity;
  const isWork = t.id === s.workingIn;
  const name = labelFor(t, s.labelMode);
  const classes = ['hex-node'];
  if (isAffinity) classes.push('is-affinity');
  if (isWork) classes.push('is-work');
  return `
    <button class="${classes.join(' ')}" data-type="${t.id}" data-corner="${i}"
      style="left:${(p.x / SIZE) * 100}%;top:${(p.y / SIZE) * 100}%;--node-accent:${t.accent};--eff:${eff}"
      aria-pressed="${isAffinity}"
      aria-label="${escHtml(t.short)}, ${escHtml(t.nen)}, ${eff} percent${isAffinity ? ', your affinity' : ''}${isWork ? ', the work you are doing' : ''}">
      ${isWork && !isAffinity ? '<span class="hex-node__flag" aria-hidden="true">work</span>' : ''}
      ${isAffinity ? '<span class="hex-node__flag hex-node__flag--you" aria-hidden="true">you</span>' : ''}
      <span class="hex-node__kanji" aria-hidden="true">${t.kanji}</span>
      <span class="hex-node__pct" aria-hidden="true">${eff}<small>%</small></span>
      <span class="hex-node__name" aria-hidden="true">${escHtml(name)}</span>
    </button>`;
}

/** Build the SVG web plus one positioned node button per type. */
export function renderHexagon(s) {
  const stage = $('hexStage');
  if (!stage) return;
  const n = TYPES.length;
  const pts = TYPES.map((_, i) => corner(i, n, R, CX, CY));
  const aff = TYPE_BY_ID[s.affinity] || TYPES[0];

  const rings = RINGS.map((k) => {
    const g = TYPES.map((_, i) => {
      const p = corner(i, n, R * k, CX, CY);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    }).join(' ');
    return `<polygon class="hex-ring" points="${g}" />`;
  }).join('');
  const spokes = pts.map((p) => `<line x1="${CX}" y1="${CY}" x2="${p.x.toFixed(2)}" y2="${p.y.toFixed(2)}" />`).join('');

  stage.innerHTML = `
    <svg class="hex-web" viewBox="0 0 ${SIZE} ${SIZE}" aria-hidden="true">
      <g class="hex-rings">${rings}</g>
      <g class="hex-spokes">${spokes}</g>
      <polygon class="hex-shape" id="hexShape" points="${shapePoints(s.affinity)}"
        style="--shape-accent:${aff.accent}" />
    </svg>
    ${TYPES.map((t, i) => nodeMarkup(t, i, pts[i], s)).join('')}`;

  renderPickers(s);
  renderReadout(s);
}

/** Update nodes and shape in place, so focus survives a click. */
export function updateHexagon(s) {
  const stage = $('hexStage');
  if (!stage) return;
  const aff = TYPE_BY_ID[s.affinity] || TYPES[0];

  stage.querySelectorAll('.hex-node').forEach((btn) => {
    const t = TYPE_BY_ID[btn.dataset.type];
    if (!t) return;
    const eff = efficiency(s.affinity, t.id);
    const isAffinity = t.id === s.affinity;
    const isWork = t.id === s.workingIn;
    btn.classList.toggle('is-affinity', isAffinity);
    btn.classList.toggle('is-work', isWork);
    btn.setAttribute('aria-pressed', String(isAffinity));
    btn.style.setProperty('--eff', String(eff));
    btn.setAttribute('aria-label',
      `${t.short}, ${t.nen}, ${eff} percent${isAffinity ? ', your affinity' : ''}${isWork ? ', the work you are doing' : ''}`);
    btn.querySelector('.hex-node__pct').innerHTML = `${eff}<small>%</small>`;
    btn.querySelector('.hex-node__name').textContent = labelFor(t, s.labelMode);
    const flag = btn.querySelector('.hex-node__flag');
    if (flag) flag.remove();
    if (isAffinity) btn.insertAdjacentHTML('afterbegin', '<span class="hex-node__flag hex-node__flag--you" aria-hidden="true">you</span>');
    else if (isWork) btn.insertAdjacentHTML('afterbegin', '<span class="hex-node__flag" aria-hidden="true">work</span>');
  });

  const shape = stage.querySelector('#hexShape');
  if (shape) {
    shape.setAttribute('points', shapePoints(s.affinity));
    shape.style.setProperty('--shape-accent', aff.accent);
  }

  renderPickers(s);
  renderReadout(s);
}

/** The two layer selectors plus the tech/Nen label toggle. */
function renderPickers(s) {
  const el = $('hexPickers');
  if (!el) return;
  const opts = (sel) => TYPES.map((t) =>
    `<option value="${t.id}"${t.id === sel ? ' selected' : ''}>${escHtml(t.short)} — ${escHtml(t.nen)}</option>`).join('');

  el.innerHTML = `
    <label class="layer-field layer-field--you">
      <span class="layer-field__name">My affinity</span>
      <select id="affinitySelect">${opts(s.affinity)}</select>
    </label>
    <label class="layer-field layer-field--work">
      <span class="layer-field__name">Work I'm doing</span>
      <select id="workSelect">${opts(s.workingIn)}</select>
    </label>
    <div class="label-toggle" role="group" aria-label="Node labels">
      <span class="label-toggle__caption">Labels</span>
      <button class="label-toggle__btn${s.labelMode === 'tech' ? ' is-on' : ''}" data-label-mode="tech"
        aria-pressed="${s.labelMode === 'tech'}">Tech</button>
      <button class="label-toggle__btn${s.labelMode === 'nen' ? ' is-on' : ''}" data-label-mode="nen"
        aria-pressed="${s.labelMode === 'nen'}">Nen</button>
    </div>`;
}

/** The expectation panel: what this pairing actually predicts. */
function renderReadout(s) {
  const el = $('hexReadout');
  if (!el) return;
  const e = expectation(s.affinity, s.workingIn, s.aiPct);
  const x = crossing(s.affinity, s.workingIn);
  const nameOf = (t) => labelFor(t, s.labelMode);

  el.innerHTML = `
    <div class="readout__head" style="--a:${e.self.accent};--w:${e.work.accent}">
      <p class="readout__eyebrow">Expect</p>
      <p class="readout__pair">
        <strong class="readout__a">${escHtml(nameOf(e.self))}</strong>
        <span class="readout__arrow" aria-hidden="true">→</span>
        <strong class="readout__w">${escHtml(nameOf(e.work))}</strong>
      </p>
      <p class="readout__score"><span class="readout__num">${e.base}<small>%</small></span>
        <span class="readout__band">${escHtml(e.band.label)}</span></p>
    </div>

    <p class="readout__verdict">${escHtml(e.verdict)}</p>
    <p class="readout__detail">${escHtml(e.detail)}</p>

    ${x ? `
    <div class="readout__crossing">
      <p class="chip">${escHtml(x.name)}</p>
      <p>${escHtml(x.reads)}</p>
    </div>` : `
    <div class="readout__crossing readout__crossing--home">
      <p class="chip">Home corner</p>
      <p>No crossing to pay for. This is the version of you that other people should be reviewed by.</p>
    </div>`}

    ${e.locked ? '' : `
    <dl class="readout__facts">
      <div><dt>Will miss</dt><dd>${escHtml(e.misses)}</dd></div>
      <div><dt>Looks like</dt><dd>${escHtml(e.tell)}</dd></div>
      <div><dt>Budget</dt><dd>${escHtml(e.budget)}</dd></div>
    </dl>`}

    <p class="readout__ai"><span class="readout__ai-tag">With AI</span> ${escHtml(e.aiLine)}</p>`;
}
