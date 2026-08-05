// ── Page sections ────────────────────────────────────────────
// Renderers for everything that is not the hexagon: the six corner
// cards, the Specialist explainer, the crossing page, and the
// objections list.

import { TYPES, TYPE_BY_ID, SPECIALIST, band } from './data.js';
import { CRAFT, REVEAL_TEST, AI_LADDER, crossing } from './expect.js';
import { FAQ, USE_GUIDE } from './faq.js';
import { INTRO, ORIGIN, SOURCES, BAND_KEYS, TWO_READINGS } from './about.js';
import { escHtml, $ } from './utils.js';

/** The six corners, compact by default so they stay comparable. */
export function renderRoleCards() {
  const grid = $('roleGrid');
  if (!grid) return;
  grid.innerHTML = TYPES.map((t) => `
    <article class="role-card" style="--card-accent:${t.accent}">
      <header class="role-card__head">
        <span class="role-card__kanji" aria-hidden="true">${t.kanji}</span>
        <div class="role-card__titles">
          <h3 class="role-card__nen">${escHtml(t.short)}</h3>
          <p class="role-card__role">${escHtml(t.nen)} &middot; ${escHtml(t.role)}</p>
        </div>
      </header>
      <p class="role-card__tagline">${escHtml(t.tagline)}</p>
      <p class="role-card__body">${escHtml(t.roleDesc)}</p>
      <div class="role-card__craft">
        <span class="role-card__label">This corner asks for</span>
        <p>${escHtml(CRAFT[t.id].demands)}</p>
      </div>
      <details class="role-card__more">
        <summary>You might be one if&hellip;</summary>
        <ul class="role-card__signals">${t.signals.map((x) => `<li>${escHtml(x)}</li>`).join('')}</ul>
        <div class="role-card__block">
          <span class="role-card__label">In Nen</span>
          <p>${escHtml(t.nenDesc)}</p>
        </div>
        <div class="role-card__block">
          <span class="role-card__label">Signature strengths</span>
          <ul>${t.strengths.map((x) => `<li>${escHtml(x)}</li>`).join('')}</ul>
        </div>
        <div class="role-card__block role-card__watch">
          <span class="role-card__label">Watch out</span>
          <p>${escHtml(t.watch)}</p>
        </div>
        <p class="role-card__persona">${escHtml(t.personality)}</p>
      </details>
    </article>`).join('');
}

/** The Specialist deep-dive. */
export function renderSpecialist() {
  const el = $('specialistSection');
  if (!el) return;
  const spec = TYPE_BY_ID.specialization;
  el.innerHTML = `
    <div class="section__titles">
      <h2 class="section__title" id="spec-title">The Specialist problem</h2>
      <p class="section__lead">The one corner with no direct route in, and the most misread part of the model.</p>
    </div>
    <div class="card spec-card" style="--card-accent:${spec.accent}">
      <p class="lede">${escHtml(SPECIALIST.intro)}</p>
      <div class="spec-naming">
        <span class="role-card__label">Why it keeps the manga's word</span>
        <p>${escHtml(SPECIALIST.naming)}</p>
      </div>
      <div class="spec-refs">
        ${SPECIALIST.references.map((r) => `
          <div class="spec-ref">
            <h4>${escHtml(r.name)}</h4>
            <p class="spec-ref__nen"><span>Nen</span> ${escHtml(r.nen)}</p>
            <p class="spec-ref__tech"><span>Tech</span> ${escHtml(r.tech)}</p>
          </div>`).join('')}
      </div>
      <p class="callout callout--warn">${escHtml(SPECIALIST.lesson)}</p>
    </div>`;
}

/** The crossing page: what happens when affinity and role differ. */
export function renderCrossingGuide() {
  const el = $('crossingGuide');
  if (!el) return;

  const commons = [
    ['enhancement', 'manipulation'],
    ['conjuration', 'manipulation'],
    ['emission', 'enhancement'],
    ['enhancement', 'conjuration'],
    ['manipulation', 'enhancement'],
    ['emission', 'conjuration'],
  ].map(([a, w]) => ({ a: TYPE_BY_ID[a], w: TYPE_BY_ID[w], x: crossing(a, w) }));

  el.innerHTML = `
    <div class="section__titles">
      <h2 class="section__title" id="crossing-title">Crossings people actually make</h2>
      <p class="section__lead">The model predicts what kind of practitioner you become, not whether you are allowed to move.</p>
    </div>
    <div class="crossing-grid">
      ${commons.map((c) => `
        <article class="crossing-card" style="--from:${c.a.accent};--to:${c.w.accent}">
          <p class="crossing-card__path">
            <span class="crossing-card__from">${escHtml(c.a.short)}</span>
            <span aria-hidden="true">→</span>
            <span class="crossing-card__to">${escHtml(c.w.short)}</span>
            <span class="crossing-card__steps">${c.x.steps} step${c.x.steps === 1 ? '' : 's'}</span>
          </p>
          <h3 class="crossing-card__name">${escHtml(c.x.name)}</h3>
          <p class="crossing-card__reads">${escHtml(c.x.reads)}</p>
        </article>`).join('')}
    </div>

    <div class="reveal">
      <p class="reveal__eyebrow">The test that settles it</p>
      <h3 class="reveal__q">${escHtml(REVEAL_TEST.question)}</h3>
      <div class="reveal__cols">
        <div class="reveal__col reveal__col--cheap">
          <h4>${escHtml(REVEAL_TEST.cheap.label)}</h4>
          <p>${escHtml(REVEAL_TEST.cheap.body)}</p>
        </div>
        <div class="reveal__col reveal__col--costly">
          <h4>${escHtml(REVEAL_TEST.costly.label)}</h4>
          <p>${escHtml(REVEAL_TEST.costly.body)}</p>
        </div>
      </div>
    </div>`;
}

/** Objections, each conceding something before it defends anything. */
export function renderFaq() {
  const el = $('faqSection');
  if (!el) return;
  el.innerHTML = `
    <div class="faq">
      ${FAQ.map((g) => `
        <section class="faq-group">
          <h3 class="faq-group__name">${escHtml(g.group)}</h3>
          ${g.items.map((it) => `
            <details class="faq-item">
              <summary class="faq-item__q">${escHtml(it.q)}</summary>
              <div class="faq-item__a">
                <p class="faq-item__concede"><span class="faq-item__tag">Fair</span>${escHtml(it.concede)}</p>
                <p class="faq-item__hold"><span class="faq-item__tag faq-item__tag--hold">But</span>${escHtml(it.hold)}</p>
              </div>
            </details>`).join('')}
        </section>`).join('')}
    </div>`;
}

/** The order in which skill with an assistant actually pays back. */
export function renderAiLadder() {
  const el = $('aiLadder');
  if (!el) return;
  el.innerHTML = `
    <div class="section__titles">
      <h2 class="section__title" id="ladder-title">Where to point it first</h2>
      <p class="section__lead">Using an assistant well is its own skill, with its own order of operations.</p>
    </div>
    <p class="lede">${escHtml(AI_LADDER.lead)}</p>
    <ol class="ladder">
      ${AI_LADDER.steps.map((s) => `
        <li class="ladder__step">
          <span class="ladder__n">${escHtml(s.n)}</span>
          <h3 class="ladder__h">${escHtml(s.h)}</h3>
          <p class="ladder__body">${escHtml(s.body)}</p>
        </li>`).join('')}
    </ol>
    <p class="callout callout--key">${escHtml(AI_LADDER.close)}</p>`;
}

// ── About ────────────────────────────────────────────────────

/**
 * The popup that carries the introduction on a first visit. The
 * actions differ by page: on the model page it dismisses onto the
 * chart, everywhere else it offers the way there.
 */
export function renderIntro() {
  const el = $('introBody');
  if (!el) return;
  const onModelPage = !!document.getElementById('hexStage');
  const actions = onModelPage
    ? `<button type="button" class="btn btn--primary" data-modal-close>Open the chart</button>
       <button type="button" class="btn btn--secondary" data-open-quiz>Find my corner</button>`
    : `<a class="btn btn--primary" href="index.html">Open the chart</a>
       <button type="button" class="btn btn--secondary" data-modal-close>Close</button>`;

  el.innerHTML = `
    <p class="intro__eyebrow">${escHtml(INTRO.eyebrow)}</p>
    <h2 class="intro__title">${escHtml(INTRO.title)}</h2>
    <p class="intro__lead">${escHtml(INTRO.lead)}</p>
    <p class="intro__punch">${escHtml(INTRO.punch)}</p>
    <ol class="intro__how">${INTRO.how.map((s) => `<li>${escHtml(s)}</li>`).join('')}</ol>
    <div class="intro__actions">${actions}</div>
    <p class="intro__dismiss">Click anywhere to close.${onModelPage
      ? ' It is on the <a href="about.html">about page</a> if you want it again.'
      : ''}</p>`;
}

/** Where the hexagon came from, how to read it, and how not to use it. */
export function renderAbout() {
  const el = $('aboutSection');
  if (!el) return;
  el.innerHTML = `
    <section class="section" id="origin" aria-labelledby="origin-title">
      <div class="section__titles">
        <h2 class="section__title" id="origin-title">Where the chart came from</h2>
        <p class="section__lead">Borrowed wholesale, so it is worth saying exactly what was borrowed.</p>
      </div>
      <p class="lede">${escHtml(ORIGIN.lead)}</p>
      <ol class="origin-steps">
        ${ORIGIN.steps.map(([name, pct, note]) => `
          <li class="origin-step${pct === '0%' ? ' origin-step--zero' : ''}">
            <span class="origin-step__pct">${escHtml(pct)}</span>
            <span class="origin-step__name">${escHtml(name)}</span>
            <span class="origin-step__note">${escHtml(note)}</span>
          </li>`).join('')}
      </ol>
      <p class="callout">${escHtml(ORIGIN.canon)}</p>
      <p>${escHtml(ORIGIN.swap)}</p>
      <ul class="source-list">
        ${SOURCES.map((s) => `
          <li class="source">
            <a class="source__link" href="${s.url}" target="_blank" rel="noopener noreferrer">
              ${escHtml(s.name)}<span class="source__host">${escHtml(s.host)}</span></a>
            <p class="source__note">${escHtml(s.note)}</p>
          </li>`).join('')}
      </ul>
    </section>

    <section class="section" aria-labelledby="reading-title">
      <div class="section__titles">
        <h2 class="section__title" id="reading-title">How to read a number</h2>
        <p class="section__lead">Two readings, held at the same time.</p>
      </div>
      <p class="lede">${escHtml(TWO_READINGS.lead)}</p>
      <div class="split">
        <div class="split__col">
          <h3 class="split__h">${escHtml(TWO_READINGS.now.label)}</h3>
          <p>${escHtml(TWO_READINGS.now.body)}</p>
        </div>
        <div class="split__col">
          <h3 class="split__h">${escHtml(TWO_READINGS.later.label)}</h3>
          <p>${escHtml(TWO_READINGS.later.body)}</p>
        </div>
      </div>
      <p class="callout callout--key">${escHtml(TWO_READINGS.close)}</p>
      <dl class="band-key">
        ${BAND_KEYS.map((n) => {
          const b = band(n);
          return `<div class="band-key__row">
            <dt><span class="band-key__pct">${n}%</span><span class="band-key__label">${escHtml(b.label)}</span></dt>
            <dd>${escHtml(b.note)}</dd>
          </div>`;
        }).join('')}
      </dl>
    </section>

    <section class="section" aria-labelledby="use-title">
      <div class="section__titles">
        <h2 class="section__title" id="use-title">How to use it</h2>
        <p class="section__lead">The left column is what it was built for. The right column is what turns it into a weapon.</p>
      </div>
      <div class="use-guide">
        <div class="use-guide__col use-guide__col--do">
          <h3>Use it like this</h3>
          <dl>${USE_GUIDE.do.map(([t, d]) => `<div><dt>${escHtml(t)}</dt><dd>${escHtml(d)}</dd></div>`).join('')}</dl>
        </div>
        <div class="use-guide__col use-guide__col--dont">
          <h3>Never like this</h3>
          <dl>${USE_GUIDE.dont.map(([t, d]) => `<div><dt>${escHtml(t)}</dt><dd>${escHtml(d)}</dd></div>`).join('')}</dl>
        </div>
      </div>
    </section>`;
}
