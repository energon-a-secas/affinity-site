// ── Shared utilities ─────────────────────────────────────────
// Small, pure helper functions used across multiple modules.

/**
 * Element lookup by ID, cached only while the node is still in the
 * document. Modal bodies are replaced wholesale on re-render, so a
 * permanent cache hands back detached nodes that silently swallow
 * every later write.
 */
const _els = new Map();
export function $(id) {
  const hit = _els.get(id);
  if (hit && hit.isConnected) return hit;
  const el = document.getElementById(id);
  if (el) _els.set(id, el);
  else _els.delete(id);
  return el;
}

/** Escape HTML special characters. */
export function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Show a temporary toast notification. */
let _toastTimer = null;
export function showToast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  // Announced by screen readers. Without these the toast is
  // invisible to anyone not looking at that corner of the screen.
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.textContent = msg;
  el.classList.add('visible');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('visible'), 2000);
}

/** Simple debounce. */
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
