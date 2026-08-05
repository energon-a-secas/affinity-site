// ── Shared page navigation ───────────────────────────────────
// Five pages share one header. The nav is injected rather than
// duplicated so a page never drifts out of the set.

export const PAGES = [
  { href: 'index.html', label: 'The model', short: 'Model', match: ['', 'index.html'] },
  { href: 'types.html', label: 'Six corners', short: 'Corners', match: ['types.html'] },
  { href: 'crossing.html', label: 'Crossing', short: 'Crossing', match: ['crossing.html'] },
  { href: 'faq.html', label: 'Objections', short: 'Q&A', match: ['faq.html'] },
  { href: 'about.html', label: 'About', short: 'About', match: ['about.html'] },
];

function currentFile() {
  const last = location.pathname.split('/').pop();
  return last === undefined ? '' : last;
}

/** Build the header nav and mark the page you are on. */
export function renderNav() {
  const slot = document.getElementById('pageNav');
  if (!slot) return;
  const here = currentFile();
  slot.innerHTML = PAGES.map((p) => {
    const active = p.match.includes(here);
    return `<a class="page-nav__link${active ? ' is-current' : ''}" href="${p.href}"
      ${active ? 'aria-current="page"' : ''}><span class="page-nav__full">${p.label}</span><span
      class="page-nav__short" aria-hidden="true">${p.short}</span></a>`;
  }).join('');
  // Centre the current tab inside the scrolling strip by setting
  // scrollLeft directly. scrollIntoView would walk up the ancestors
  // and scroll the page itself, which on load reads as a jump.
  const cur = slot.querySelector('.is-current');
  if (cur) slot.scrollLeft = cur.offsetLeft - (slot.clientWidth - cur.offsetWidth) / 2;
}

/** Previous / next links at the foot of a page, so reading is linear. */
export function renderPager() {
  const slot = document.getElementById('pager');
  if (!slot) return;
  const here = currentFile();
  const i = PAGES.findIndex((p) => p.match.includes(here));
  if (i === -1) return;
  const prev = PAGES[i - 1];
  const next = PAGES[i + 1];
  slot.innerHTML = `
    ${prev ? `<a class="pager__link pager__link--prev" href="${prev.href}">
      <span class="pager__dir">Previous</span><span class="pager__label">${prev.label}</span></a>` : '<span></span>'}
    ${next ? `<a class="pager__link pager__link--next" href="${next.href}">
      <span class="pager__dir">Next</span><span class="pager__label">${next.label}</span></a>` : '<span></span>'}`;
}
