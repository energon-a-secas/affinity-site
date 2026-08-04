// ── Event handlers ───────────────────────────────────────────
// Modal focus trap (from template) + hexagon, quiz, and calculator
// interactions. No inline onclick anywhere; everything is wired here.

import { save } from './state.js';
import { updateHexagon } from './render.js';
import { renderQuiz, renderCalc, updateCalcMeter } from './views.js';
import { QUIZ } from './data.js';

// ── Modal focus trap (template baseline) ─────────────────────

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
  _modalLastFocus = document.activeElement;
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

/** Bind all event listeners. Call once from app.js after render. */
export function bindEvents(state) {
  document.addEventListener('keydown', onDocumentKeydown);
  document.addEventListener('click', onModalClick);

  // Hexagon: select a born type.
  document.getElementById('hexStage')?.addEventListener('click', (e) => {
    const node = e.target.closest('.hex-node');
    if (!node) return;
    state.bornType = node.dataset.type;
    updateHexagon(state);
    save(state);
  });

  // Open quiz / calculator from header + hero.
  const openQuiz = () => { renderQuiz(state); openModal('quizModal'); };
  const openCalc = () => { renderCalc(state); openModal('calcModal'); };
  document.getElementById('quizBtn')?.addEventListener('click', openQuiz);
  document.getElementById('heroQuizBtn')?.addEventListener('click', openQuiz);
  document.getElementById('calcBtn')?.addEventListener('click', openCalc);
  document.getElementById('heroCalcBtn')?.addEventListener('click', openCalc);

  // Quiz interactions (delegated inside the modal).
  const quizModal = document.getElementById('quizModal');
  quizModal?.addEventListener('click', (e) => {
    const opt = e.target.closest('[data-opt]');
    if (opt) {
      state.quizAnswers[state.quizStep] = Number(opt.dataset.opt);
      renderQuiz(state);
      save(state);
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
      state.bornType = apply.dataset.type;
      updateHexagon(state);
      save(state);
      closeModal('quizModal');
      document.getElementById('hexStage')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Calculator interactions.
  const calcModal = document.getElementById('calcModal');
  calcModal?.addEventListener('input', (e) => {
    if (e.target.id === 'calcAi') {
      state.aiPct = Number(e.target.value);
      updateCalcMeter(state);
      save(state);
    }
  });
  calcModal?.addEventListener('change', (e) => {
    if (e.target.id === 'calcYou') { state.calcYou = e.target.value; renderCalc(state); save(state); }
    if (e.target.id === 'calcTask') { state.calcTask = e.target.value; renderCalc(state); save(state); }
  });
}
