// ── State management ─────────────────────────────────────────
// Two layers, deliberately separate. `affinity` is the corner your
// judgment came from and is sticky. `workingIn` is the corner your
// job currently sits in and moves freely. Conflating them is what
// made the old model read as a life sentence.

import { TYPE_BY_ID, QUIZ } from './data.js';

const STORAGE_KEY = 'affinity-state';

export const state = {
  affinity: 'emission',    // where your effort converts cheapest
  workingIn: 'emission',   // the corner the work sits in
  labelMode: 'tech',       // 'tech' | 'nen' — what the hexagon shows
  quizAnswers: [],
  quizStep: 0,
  aiPct: 70,
};

const isType = (id) => typeof id === 'string' && Object.hasOwn(TYPE_BY_ID, id);

/**
 * Coerce one parsed blob into safe state. An unknown type id would
 * otherwise reach the renderer and throw, which kills the whole
 * first paint and leaves every control dead on reload.
 */
function sanitize(raw) {
  const out = {};
  if (isType(raw.affinity)) out.affinity = raw.affinity;
  if (isType(raw.workingIn)) out.workingIn = raw.workingIn;
  if (raw.labelMode === 'tech' || raw.labelMode === 'nen') out.labelMode = raw.labelMode;

  const ai = Number(raw.aiPct);
  if (Number.isFinite(ai)) out.aiPct = Math.min(100, Math.max(0, Math.round(ai)));

  if (Array.isArray(raw.quizAnswers)) {
    out.quizAnswers = raw.quizAnswers.slice(0, QUIZ.length).map((v, i) => {
      const n = Number(v);
      const count = QUIZ[i]?.options.length ?? 0;
      return Number.isInteger(n) && n >= 0 && n < count ? n : null;
    });
  }

  const step = Number(raw.quizStep);
  if (Number.isInteger(step) && step >= 0 && step <= QUIZ.length) out.quizStep = step;

  return out;
}

/** Load saved state from localStorage, discarding anything invalid. */
export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') Object.assign(s, sanitize(parsed));
  } catch { /* corrupted or unavailable storage */ }
}

/** Persist current state to localStorage. */
export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      affinity: s.affinity,
      workingIn: s.workingIn,
      labelMode: s.labelMode,
      quizAnswers: s.quizAnswers,
      quizStep: s.quizStep,
      aiPct: s.aiPct,
    }));
  } catch { /* quota exceeded or private browsing */ }
}
