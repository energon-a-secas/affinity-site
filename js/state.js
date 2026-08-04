// ── State management ─────────────────────────────────────────
// Shared mutable state. The hexagon's selected "born type", the
// quiz answers, and the calculator slider are what we persist.

const STORAGE_KEY = 'affinity-state';

export const state = {
  bornType: 'enhancement', // currently selected type on the hexagon
  quizAnswers: [],         // one option index per quiz question
  quizStep: 0,             // current quiz question index
  aiPct: 70,               // AI calculator slider default
};

/** Load saved state from localStorage. */
export function loadSaved(s) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) Object.assign(s, JSON.parse(raw));
  } catch { /* ignore corrupted data */ }
}

/** Persist current state to localStorage. */
export function save(s) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      bornType: s.bornType,
      quizAnswers: s.quizAnswers,
      aiPct: s.aiPct,
    }));
  } catch { /* quota exceeded or private browsing */ }
}
