// ── Event handlers ───────────────────────────────────────────
// Modal focus trap plus hexagon, quiz, and calculator wiring.
// No inline onclick anywhere; everything is bound here.

import { save } from './state.js';
import { updateHexagon } from './hexagon.js';
import { renderQuiz, renderCalc, updateCalcMeter } from './views.js';
import { QUIZ } from './data.js';

// ── Modal focus trap ─────────────────────────────────────────

function getFocusable(root) {
  const sel = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  return Array.from(root.querySelectorAll(sel)).filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false;
    return el.getClientRects().length > 0;
  });
}

let _modalLastFocus = null;

export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  // Opening one modal from inside another (quiz from the intro) hides
  // the first without claiming the focus slot, so closing the second
  // still returns focus to whatever the page had before either opened.
  const prev = getOpenModal();
  if (prev && prev.id !== id) prev.setAttribute('hidden', '');
  else _modalLastFocus = document.activeElement;
  modal.removeAttribute('hidden');
  document.body.classList.add('modal-open');
  const dialog = modal.querySelector('.modal__dialog');
  const list = dialog ? getFocusable(dialog) : [];
  const closeBtn = modal.querySelector('.modal__header [data-modal-close]');
  const toFocus = closeBtn && list.includes(closeBtn) ? closeBtn : list[0];
  if (toFocus) toFocus.focus();
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.setAttribute('hidden', '');
  if (!document.querySelector('.modal:not([hidden])')) document.body.classList.remove('modal-open');
  if (_modalLastFocus && typeof _modalLastFocus.focus === 'function') _modalLastFocus.focus();
  _modalLastFocus = null;
}

function getOpenModal() {
  return document.querySelector('.modal:not([hidden])');
}

function onDocumentKeydown(e) {
  const modal = getOpenModal();
  if (!modal || !modal.id) return;
  if (e.key === 'Escape') { e.preventDefault(); closeModal(modal.id); return; }
  if (e.key !== 'Tab') return;
  const dialog = modal.querySelector('.modal__dialog');
  const list = dialog ? getFocusable(dialog) : [];
  if (list.length === 0) return;
  const first = list[0], last = list[list.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function onModalClick(e) {
  const modal = e.target.closest('.modal');
  if (!modal || modal.hasAttribute('hidden')) return;
  if (e.target.closest('[data-modal-close]')) closeModal(modal.id);
}

// ── App interactions ─────────────────────────────────────────

/** Put focus back on the option just chosen, after a re-render. */
function restoreQuizFocus(index) {
  document.querySelector(`#quizBody [data-opt="${index}"]`)?.focus();
}

/**
 * Clicking a node sets your affinity. Shift-click (or clicking the
 * node that is already your affinity) sets the work layer instead,
 * so both layers are reachable without leaving the chart.
 */
function bindHexagon(state) {
  const stage = document.getElementById('hexStage');
  if (!stage) return;

  stage.addEventListener('click', (e) => {
    const node = e.target.closest('.hex-node');
    if (!node) return;
    const id = node.dataset.type;
    if (e.shiftKey || id === state.affinity) state.workingIn = id;
    else state.affinity = id;
    updateHexagon(state);
    save(state);
  });

  const pickers = document.getElementById('hexPickers');
  pickers?.addEventListener('change', (e) => {
    if (e.target.id === 'affinitySelect') state.affinity = e.target.value;
    else if (e.target.id === 'workSelect') state.workingIn = e.target.value;
    else return;
    updateHexagon(state);
    save(state);
  });

  pickers?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-label-mode]');
    if (!btn) return;
    state.labelMode = btn.dataset.labelMode;
    updateHexagon(state);
    save(state);
    document.querySelector(`[data-label-mode="${state.labelMode}"]`)?.focus();
  });
}

function bindQuiz(state) {
  const quizModal = document.getElementById('quizModal');
  if (!quizModal) return;
  quizModal.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-opt]');
    if (opt) {
      const picked = Number(opt.dataset.opt);
      state.quizAnswers[state.quizStep] = picked;
      renderQuiz(state);
      save(state);
      restoreQuizFocus(picked);
      return;
    }
    if (e.target.closest('[data-quiz-next]')) {
      state.quizStep = Math.min(state.quizStep + 1, QUIZ.length);
      renderQuiz(state);
      save(state);
      return;
    }
    if (e.target.closest('[data-quiz-back]')) {
      state.quizStep = Math.max(0, state.quizStep - 1);
      renderQuiz(state);
      return;
    }
    if (e.target.closest('[data-quiz-restart]')) {
      state.quizAnswers = [];
      state.quizStep = 0;
      renderQuiz(state);
      save(state);
      return;
    }
    const apply = e.target.closest('[data-quiz-apply]');
    if (apply) {
      state.affinity = apply.dataset.type;
      updateHexagon(state);
      save(state);
      closeModal('quizModal');
      // No scrollIntoView: the console puts the chart on screen already,
      // so scrolling only moves it away from where the reader left it.
    }
  });
}

function bindCalc(state) {
  const calcModal = document.getElementById('calcModal');
  if (!calcModal) return;
  calcModal.addEventListener('input', (e) => {
    if (e.target.id !== 'calcAi') return;
    state.aiPct = Number(e.target.value);
    updateCalcMeter(state);
    save(state);
  });
  calcModal.addEventListener('change', (e) => {
    if (e.target.id === 'calcYou') state.affinity = e.target.value;
    else if (e.target.id === 'calcTask') state.workingIn = e.target.value;
    else return;
    renderCalc(state);
    updateHexagon(state);
    save(state);
  });
}

// ── Intro popup ──────────────────────────────────────────────
// The introduction is a popup rather than a hero block, so the chart
// starts at the top of the screen. It is opened on request only, from
// the "What is this?" button or the about page. Nothing auto-shows:
// the chart and its readout are both above the fold, so an unrequested
// modal covers the thing the reader came for.

/** Click anywhere in the intro to dismiss it, except on its controls. */
function bindIntro() {
  const dialog = document.querySelector('#introModal .modal__dialog');
  if (!dialog) return;
  dialog.addEventListener('click', (e) => {
    if (e.target.closest('button, a, input, select, textarea, summary')) return;
    closeModal('introModal');
  });
}

/** Bind all listeners. Called once from app.js after first render. */
export function bindEvents(state) {
  document.addEventListener('keydown', onDocumentKeydown);
  document.addEventListener('click', onModalClick);

  bindHexagon(state);
  bindQuiz(state);
  bindCalc(state);
  bindIntro();

  const openQuiz = () => { renderQuiz(state); openModal('quizModal'); };
  const openCalc = () => { renderCalc(state); openModal('calcModal'); };
  const openIntro = () => openModal('introModal');
  document.querySelectorAll('[data-open-quiz]').forEach((b) => b.addEventListener('click', openQuiz));
  document.querySelectorAll('[data-open-calc]').forEach((b) => b.addEventListener('click', openCalc));
  document.querySelectorAll('[data-open-intro]').forEach((b) => b.addEventListener('click', openIntro));
}
