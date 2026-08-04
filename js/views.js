// ── Quiz + calculator views ──────────────────────────────────
// Render the interior of the two modals. Kept out of render.js so
// each file stays small and single-purpose.

import { QUIZ, TYPES, TYPE_BY_ID, efficiency, withAI, band, scoreQuiz } from './data.js';
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
    <div class="quiz-options" role="radiogroup" aria-label="${escHtml(item.q)}">
      ${item.options.map((o, i) => `
        <button class="quiz-option${chosen === i ? ' is-chosen' : ''}" data-opt="${i}" role="radio" aria-checked="${chosen === i}">
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
        (${escHtml(dual.role)}). Dual affinities are common, and a real edge when the two corners are adjacent.</p>` : ''}
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
    <button class="btn btn--primary" data-quiz-apply data-type="${top.id}">Show on hexagon</button>`;
}

// ── Calculator ───────────────────────────────────────────────

/** Render the AI amplification calculator. */
export function renderCalc(s) {
  const body = $('calcBody');
  if (!body) return;

  // Persisted selections, with safe fallbacks.
  const you = s.calcYou || s.bornType;
  const task = s.calcTask || firstOther(you);
  const aiPct = s.aiPct ?? 70;

  const base = efficiency(you, task);
  const boosted = withAI(base, aiPct);
  const b = band(base);
  const youT = TYPE_BY_ID[you];
  const taskT = TYPE_BY_ID[task];

  body.innerHTML = `
    <p class="calc-lead">Pick who you are and what you are being asked to do. The bar shows your base
    affinity; the slider pours AI into it. Watch how far it can, and cannot, carry you.</p>

    <div class="calc-selects">
      <label class="calc-field">
        <span>You are a born…</span>
        <select id="calcYou">${optionList(you)}</select>
      </label>
      <label class="calc-field">
        <span>You are asked to do…</span>
        <select id="calcTask">${optionList(task)}</select>
      </label>
    </div>

    <div class="calc-slider">
      <label for="calcAi">AI assistance <strong id="calcAiVal">${aiPct}%</strong></label>
      <input type="range" id="calcAi" min="0" max="100" step="5" value="${aiPct}">
    </div>

    <div class="calc-meter" style="--you:${youT.accent};--task:${taskT.accent}">
      <div class="calc-meter__row">
        <span class="calc-meter__label">Base affinity</span>
        <span class="calc-meter__track"><span class="calc-meter__fill calc-meter__fill--base" style="width:${base}%"></span></span>
        <span class="calc-meter__num">${base}%</span>
      </div>
      <div class="calc-meter__row">
        <span class="calc-meter__label">With AI</span>
        <span class="calc-meter__track">
          <span class="calc-meter__fill calc-meter__fill--base" style="width:${base}%"></span>
          <span class="calc-meter__fill calc-meter__fill--ai" style="left:${base}%;width:${Math.max(0, boosted - base)}%"></span>
        </span>
        <span class="calc-meter__num">${boosted}%</span>
      </div>
    </div>

    <div class="calc-verdict calc-verdict--${b.label.toLowerCase()}">
      <strong>${b.label}.</strong> ${escHtml(b.note)}
      ${calcSentence(you, task, base, boosted, aiPct)}
    </div>`;
}

/**
 * Surgical update for the slider drag: refresh only the AI value,
 * the "with AI" meter fill, and the verdict, without rebuilding the
 * range input (which would kill the in-progress drag).
 */
export function updateCalcMeter(s) {
  const you = s.calcYou || s.bornType;
  const task = s.calcTask || firstOther(you);
  const aiPct = s.aiPct ?? 70;
  const base = efficiency(you, task);
  const boosted = withAI(base, aiPct);
  const b = band(base);

  const val = $('calcAiVal');
  if (val) val.textContent = `${aiPct}%`;

  const aiFill = document.querySelector('.calc-meter__fill--ai');
  if (aiFill) {
    aiFill.style.left = `${base}%`;
    aiFill.style.width = `${Math.max(0, boosted - base)}%`;
  }
  const nums = document.querySelectorAll('.calc-meter__num');
  if (nums[1]) nums[1].textContent = `${boosted}%`;

  const verdict = document.querySelector('.calc-verdict');
  if (verdict) {
    verdict.className = `calc-verdict calc-verdict--${b.label.toLowerCase()}`;
    verdict.innerHTML = `<strong>${b.label}.</strong> ${escHtml(b.note)}${calcSentence(you, task, base, boosted, aiPct)}`;
  }
}

function calcSentence(you, task, base, boosted, aiPct) {
  const youT = TYPE_BY_ID[you];
  const taskT = TYPE_BY_ID[task];
  if (you === task) {
    return ` A born ${escHtml(youT.nen)} doing ${escHtml(taskT.role)} work is home. AI here is pure upside.`;
  }
  if (task === 'specialization') {
    return ` Specialization cannot be reached by stepping around the ring, so base affinity is 0 and AI has almost nothing to amplify. It emerges from mastery plus something innate, it is not a task you take on.`;
  }
  const gained = boosted - base;
  if (base <= 40) {
    return ` This is close to an opposite-corner crossing. Even at ${aiPct}% AI you gain only ${gained} points, the affinity ceiling holds. This is the trap: pouring more AI in does not buy the affinity you were not built for.`;
  }
  if (base <= 60) {
    return ` Two steps out. Workable with effort, and AI helps, but you will never be native here. Lean on a real ${escHtml(taskT.nen)} for the last stretch.`;
  }
  return ` Adjacent to your type. With focused training and AI you can get genuinely close to native. This is where crossing over actually pays off.`;
}

function firstOther(id) {
  return (TYPES.find((t) => t.id !== id && t.id !== 'specialization') || TYPES[0]).id;
}

function optionList(selected) {
  return TYPES.map((t) => `<option value="${t.id}"${t.id === selected ? ' selected' : ''}>${escHtml(t.nen)} — ${escHtml(t.role)}</option>`).join('');
}
