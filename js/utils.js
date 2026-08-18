// Generic helpers come from the DOM Kit (js/neorgon-dom.js, vendored from
// packages/neorgon-ui/dom/). They are re-exported so every existing
// `import { escHtml } from './utils.js'` keeps working.
//
// Do not edit js/neorgon-dom.js. Edit the canonical source and run
// packages/neorgon-ui/sync-dom.sh.
import { escHtml, debounce, showToast as kitToast } from './neorgon-dom.js';
export { escHtml, debounce };

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


/** Show a temporary toast notification. */
/** This site's own toast contract, rendered by the kit. */
export function showToast(msg) {
  return kitToast(msg, { id: 'app-toast', className: 'toast',
    visibleClass: 'visible', duration: 2000 });
}


