// ── Quiz + calculator views ──────────────────────────────────
// Render the interior of the two modals. Kept out of render.js so
// each file stays small and single-purpose.

import { QUIZ, TYPES, TYPE_BY_ID, efficiency, withAI, coldLevel, band, scoreQuiz } from './data.js';
import { escHtml, $ } from './utils.js';

// ── Quiz ─────────────────────────────────────────────────────

/** Render the current quiz question (or the result screen). */
export function renderQuiz(s) {
  const body = $('quizBody');
  const footer = $('quizFooter');
  if (!body || !footer) return;

  const done = s.quizAnswers.filter((a) => a != null).length === QUIZ.length;
  if (done && s.quizStep >= QUIZ.length) {
    renderQuizResult(s, body, footer);
    return;
  }

  const step = Math.min(s.quizStep, QUIZ.length - 1);
  const item = QUIZ[step];
  const chosen = s.quizAnswers[step];

  body.innerHTML = `
    <div class="quiz-progress" aria-hidden="true">
      ${QUIZ.map((_, i) => `<span class="quiz-dot${i === step ? ' is-current' : ''}${s.quizAnswers[i] != null ? ' is-done' : ''}"></span>`).join('')}
    </div>
    <p class="quiz-count">Question ${step + 1} of ${QUIZ.length}</p>
    <h3 class="quiz-q">${escHtml(item.q)}</h3>
    <div class="quiz-options" role="group" aria-label="${escHtml(item.q)}">
      ${item.options.map((o, i) => `
        <button class="quiz-option${chosen === i ? ' is-chosen' : ''}" data-opt="${i}" aria-pressed="${chosen === i}">
          ${escHtml(o.text)}
        </button>`).join('')}
    </div>`;

  footer.innerHTML = `
    <button class="btn btn--ghost" data-quiz-back ${step === 0 ? 'disabled' : ''}>Back</button>
    <button class="btn btn--primary" data-quiz-next ${chosen == null ? 'disabled' : ''}>
      ${step === QUIZ.length - 1 ? 'See result' : 'Next'}
    </button>`;
}

function renderQuizResult(s, body, footer) {
  const { ranked, top, dual } = scoreQuiz(s.quizAnswers);
  const maxScore = ranked[0].score || 1;

  body.innerHTML = `
    <div class="quiz-result">
      <p class="quiz-result__eyebrow">Your closest affinity</p>
      <div class="quiz-result__head" style="--card-accent:${top.accent}">
        <span class="quiz-result__kanji">${top.kanji}</span>
        <div>
          <h3 class="quiz-result__nen">${escHtml(top.nen)}</h3>
          <p class="quiz-result__role">${escHtml(top.role)}</p>
        </div>
      </div>
      <p class="quiz-result__tagline">${escHtml(top.tagline)}</p>
      ${dual ? `<p class="quiz-result__dual">You also lean strongly toward
        <strong style="color:${dual.accent}">${escHtml(dual.nen)}</strong>
        (${escHtml(dual.short)}). Dual affinities are common, and a real edge when the two corners are adjacent.</p>` : ''}
      <div class="quiz-result__bars">
        ${ranked.map(({ id, score }) => {
          const t = TYPE_BY_ID[id];
          const w = Math.round((score / maxScore) * 100);
          return `<div class="qr-bar">
            <span class="qr-bar__name">${escHtml(t.nen)}</span>
            <span class="qr-bar__track"><span class="qr-bar__fill" style="width:${w}%;background:${t.accent}"></span></span>
          </div>`;
        }).join('')}
      </div>
      <p class="quiz-result__note">This is a mirror, not a verdict. Use it to notice where your energy
      already goes, then train that corner to 100% instead of chasing one that fights you.</p>
    </div>`;

  footer.innerHTML = `
    <button class="btn btn--ghost" data-quiz-restart>Retake</button>
    <button class="btn btn--primary" data-quiz-apply data-type="${top.id}">Set as my affinity</button>`;
}

// ── Calculator ───────────────────────────────────────────────

/** The two axes the calculator draws, and what each one means. */
const AXES = [
  { key: 'output', label: 'Output shipped', hint: 'What you can put in a pull request.' },
  { key: 'judgment', label: 'Judgment to grade it', hint: 'Whether you can tell that it is any good.' },
];

/** Render the AI amplification calculator. */
export function renderCalc(s) {
  const body = $('calcBody');
  if (!body) return;

  const you = resolveYou(s);
  const task = resolveTask(s);
  const aiPct = clampAi(s.aiPct);
  const base = efficiency(you, task);
  const youT = TYPE_BY_ID[you];
  const taskT = TYPE_BY_ID[task];

  body.innerHTML = `
    <p class="calc-lead">Pick who you are and what you are being asked to do. The slider pours AI in.
    Two things to watch: neither bar passes the marked ceiling, and the lower bar barely leaves the
    floor. AI carries you up to the level your affinity already allowed. It does not raise it.</p>

    <div class="calc-selects">
      <label class="calc-field">
        <span>You are a born…</span>
        <select id="calcYou">${optionList(you, TYPES)}</select>
      </label>
      <label class="calc-field">
        <span>You are asked to do…</span>
        <select id="calcTask">${optionList(task, TASK_TYPES)}</select>
      </label>
    </div>

    <div class="calc-slider">
      <label for="calcAi">AI assistance <strong id="calcAiVal">${aiPct}%</strong></label>
      <input type="range" id="calcAi" min="0" max="100" step="5" value="${aiPct}"
        aria-describedby="calcVerdict">
    </div>

    <div class="calc-meter" style="--task:${taskT.accent}">
      <p class="calc-meter__caption">Measured against a trained ${escHtml(taskT.nen)}, who reads 100%.
        Your ceiling in this corner is <strong>${base}%</strong>, marked on both tracks.</p>
      ${AXES.map((ax) => meterRow(ax, base, aiPct)).join('')}
    </div>

    <div class="calc-verdict" id="calcVerdict" aria-live="polite">${verdictHtml(you, task, base, aiPct)}</div>`;
}

/**
 * One labelled bar. The solid segment is where you stand cold, the
 * lighter segment is what AI adds, and the tick is your ceiling.
 * Nothing is ever drawn past the tick, which is the whole point.
 */
function meterRow(ax, base, aiPct) {
  const cold = coldLevel(base);
  const total = withAI(base, aiPct, ax.key);
  return `
    <div class="calc-meter__row" data-axis="${ax.key}">
      <span class="calc-meter__label">${escHtml(ax.label)}<small>${escHtml(ax.hint)}</small></span>
      <span class="calc-meter__track">
        <span class="calc-meter__fills">
          <span class="calc-meter__fill calc-meter__fill--base" style="width:${cold}%"></span>
          <span class="calc-meter__fill calc-meter__fill--ai" style="left:${cold}%;width:${Math.max(0, total - cold)}%"></span>
        </span>
        <span class="calc-meter__cap" style="left:${base}%"><span class="calc-meter__cap-label">ceiling ${base}%</span></span>
      </span>
      <span class="calc-meter__num">${total}%</span>
    </div>`;
}

/**
 * Surgical update for the slider drag: refresh the AI readout, both
 * bars, and the verdict without rebuilding the range input, which
 * would kill the in-progress drag.
 */
export function updateCalcMeter(s) {
  const body = $('calcBody');
  if (!body) return;
  const you = resolveYou(s);
  const task = resolveTask(s);
  const aiPct = clampAi(s.aiPct);
  const base = efficiency(you, task);

  const val = body.querySelector('#calcAiVal');
  if (val) val.textContent = `${aiPct}%`;

  const cold = coldLevel(base);
  AXES.forEach((ax) => {
    const row = body.querySelector(`.calc-meter__row[data-axis="${ax.key}"]`);
    if (!row) return;
    const total = withAI(base, aiPct, ax.key);
    const aiFill = row.querySelector('.calc-meter__fill--ai');
    if (aiFill) {
      aiFill.style.left = `${cold}%`;
      aiFill.style.width = `${Math.max(0, total - cold)}%`;
    }
    const num = row.querySelector('.calc-meter__num');
    if (num) num.textContent = `${total}%`;
  });

  const verdict = body.querySelector('#calcVerdict');
  if (verdict) verdict.innerHTML = verdictHtml(you, task, base, aiPct);
}

function verdictHtml(you, task, base, aiPct) {
  const b = band(base);
  return `<strong class="calc-verdict__band" data-band="${slug(b.label)}">${escHtml(b.label)}.</strong>
    ${escHtml(b.note)} ${calcSentence(you, task, base, aiPct)}`;
}

function calcSentence(you, task, base, aiPct) {
  const taskT = TYPE_BY_ID[task];
  if (you === task) {
    return `You are home, and your ceiling is the whole job. What AI adds here is speed, which is the one thing this meter cannot draw.`;
  }
  const cold = Math.round(coldLevel(base));
  const out = withAI(base, aiPct, 'output');
  const judge = withAI(base, aiPct, 'judgment');
  const spread = out - judge;
  if (base <= 40) {
    return `At ${aiPct}% AI you produce at ${out}% and grade at ${judge}%, up from ${cold}% cold. The climb is real and it stops at ${base}%. The ${spread}-point gap between producing and grading is where the weak version ships and nobody in the room catches it.`;
  }
  if (base <= 60) {
    return `AI moves your output from ${cold}% to ${out}%, most of the way to the ${base}% this pairing allows. The ${spread}-point gap to your judgment is why a real ${escHtml(taskT.nen)} should still read the work before it lands.`;
  }
  return `The bars stay close and the ceiling is high, which is why crossing to a neighbour pays off and crossing the chart does not.`;
}

/** Specialization is not a task anyone is assigned, so it is not offered. */
const TASK_TYPES = TYPES.filter((t) => !t.isSpecialist);

function resolveYou(s) {
  return TYPE_BY_ID[s.affinity] ? s.affinity : TYPES[0].id;
}

function resolveTask(s) {
  if (TYPE_BY_ID[s.workingIn] && s.workingIn !== 'specialization') return s.workingIn;
  const you = resolveYou(s);
  return (TASK_TYPES.find((t) => t.id !== you) || TASK_TYPES[0]).id;
}

function clampAi(v) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 70;
}

function slug(label) {
  return label.toLowerCase().replace(/\s+/g, '-');
}

/** Roles are truncated to their first segment so the option fits a half-width select. */
function optionList(selected, list) {
  return list.map((t) => {
    const label = `${t.nen} — ${t.short}`;
    return `<option value="${t.id}"${t.id === selected ? ' selected' : ''}>${escHtml(label)}</option>`;
  }).join('');
}
