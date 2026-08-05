// ── Entry point ──────────────────────────────────────────────
// Five pages share this bundle. Each renderer no-ops when its
// mount point is absent, so the page itself decides what it shows.

import { state, loadSaved } from './state.js';
import { renderNav, renderPager } from './nav.js';
import { renderHexagon } from './hexagon.js';
import { renderRoleCards, renderSpecialist, renderCrossingGuide, renderFaq, renderAiLadder, renderIntro, renderAbout } from './sections.js';
import { bindEvents } from './events.js';

function init() {
  loadSaved(state);
  renderNav();
  renderPager();
  renderHexagon(state);
  renderRoleCards();
  renderSpecialist();
  renderCrossingGuide();
  renderAiLadder();
  renderFaq();
  renderIntro();
  renderAbout();
  bindEvents(state);
}

init();
