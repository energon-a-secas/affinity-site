// ── Entry point ──────────────────────────────────────────────
// Wire modules together. Keep this file under 50 lines.

import { state, loadSaved } from './state.js';
import { render } from './render.js';
import { bindEvents } from './events.js';

function init() {
  loadSaved(state);
  render(state);
  bindEvents(state);
}

init();
