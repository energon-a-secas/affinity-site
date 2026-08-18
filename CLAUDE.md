# CLAUDE.md: affinity-site

Guidance for Claude Code when working in this project.

## What this is

A Hunter x Hunter Nen model applied to tech careers. Six job families sit on the canon hexagon; you
run at 100% in your own corner and shed ~20% per step around the ring; Specialization is 0% for
everyone who is not one. The argument the site exists to make: **AI amplifies the affinity you
already have rather than granting you a new one.**

**Published but unlisted.** Live at `affinity.neorgon.com`, `noindex, nofollow`, deliberately absent
from the neorgon hub (`neorgon-site/index.html`, `neorgon-site/js/search.js`) and from `PROJECTS.md`'s
domain map. Do not add a hub card.

## Run

```bash
make serve     # http://localhost:8855
```

Port 8855. Requires an HTTP server; ES modules do not load over `file://`.

## Pages

Five pages, one shared JS bundle. Every renderer no-ops when its mount point is absent, so a page
declares what it shows by which `id`s it contains. Nav and pager are injected from `js/nav.js`,
add a page there and both update.

| Page | Mounts | Shows |
|---|---|---|
| `index.html` | `hexStage` `hexPickers` `hexReadout` `introBody` | The model: hexagon, two layer pickers, expectation readout |
| `types.html` | `roleGrid` `specialistSection` | The six corners, Specialist explainer |
| `crossing.html` | `crossingGuide` `aiLadder` | Mobility, named crossings, the reveal test, the AI law, where to point AI first |
| `faq.html` | `faqSection` | Objections, nothing else |
| `about.html` | `aboutSection` `introBody` | What this is, provenance + sources, how to read a number, use/misuse guide |

`index.html` is a **one-screen console**, not a document: `.container--console` takes a fixed
`calc(100dvh: header)` so the chart and the readout are on screen together. That is a hard height on
purpose: a `min-height` lets the readout push the chart below the fold, which is the problem the
layout exists to solve. The pager sits outside the console so it never claims fold space.

The introduction is a **popup**, not a hero block: `js/about.js` `INTRO` → `renderIntro()` →
`#introModal`, dismissed by clicking anywhere that is not a control. Same copy lives permanently on
`about.html`. Two rules, both deliberate:

- **Do not put it back on the page.** It costs most of a screen before anyone reaches the chart.
- **Do not auto-show it.** It opens only from `[data-open-intro]`. The chart and its readout are
  both above the fold, so an unrequested modal covers the thing the reader came for.

Nothing on the site calls `scrollIntoView`. The console puts everything above the fold, so a
programmatic scroll can only move the page away from where the reader left it. `renderNav()` centres
the current tab by setting `scrollLeft` on the strip for the same reason, `scrollIntoView` walks up
the ancestors and scrolls the page.

## Architecture

Zero build. Static ES modules, no dependencies.

| File | Owns |
|---|---|
| `js/data.js` | `TYPES`, `efficiency()`, `coldLevel()`, `withAI()`, `band()`, `SPECIALIST`, `QUIZ`. **The model.** |
| `js/expect.js` | `CRAFT`, `expectation()`, `crossing()`, `REVEAL_TEST`, `AI_LADDER`. **The forecast layer.** |
| `js/about.js` | `INTRO`, `ORIGIN`, `SOURCES`, `TWO_READINGS`. Intro popup + provenance copy. |
| `js/faq.js` | `FAQ`, `USE_GUIDE`. Objections as concede/hold pairs. |
| `js/nav.js` | `PAGES`, header nav, prev/next pager |
| `js/hexagon.js` | SVG rings + efficiency polygon + node buttons, layer pickers, expectation readout |
| `js/sections.js` | Role cards, Specialist, crossing guide, FAQ |
| `js/views.js` | Quiz and calculator interiors, rendered into the two modals |
| `js/events.js` | Modal focus trap, hexagon selection, quiz and calculator wiring |
| `js/state.js` | Shared state, localStorage with load-time validation |
| `post/build-visuals.mjs` | Generates the four post SVGs. **Imports the model from `js/data.js`** |
| `post/rasterize.mjs` | SVG → 2x PNG via `sharp`, flattened onto the site background |

## The two layers

`state.affinity` is the corner your judgment came from and moves slowly. `state.workingIn` is the
corner the work sits in and moves freely. **Keeping them separate is what makes the model
defensible**: it is why "nobody starts as a manager" has an answer, and why the site can say a
developer becomes a PM with engineering judgment rather than saying they cannot become one.
Collapsing them back into a single `bornType` reintroduces the fatalism the whole rewrite removed.

`state.labelMode` swaps node labels between tech roles (default) and Nen names. Tech is the default
on purpose: "Manipulation" as a label for management is loaded in English and turns readers away
before they reach the argument.

## Invariants: do not break these

- **`efficiency()` checks identity before the Specialization exception.** Swap those two lines and a
  born Specialist reads 0% at their own job.
- **Specialization is 0% and that is canon**, not a bug. The manga's own efficiency panel shows
  `SPECIAL 0%`. Frame it as "no direct route", never as a claim about a real person's ceiling.
- **Specialization is excluded from the calculator's task dropdown and from the readout's "hardest
  crossing" ranking.** Its flat 0 would otherwise always win and hide the Emission ↔ Conjuration 40%
  case, which is the entire point of the site.
- **AI never exceeds `base`.** `withAI()` starts at `coldLevel(base)` = `base²/100` and climbs
  toward `base`, which is the ceiling. `output` covers the whole remaining climb, `judgment` covers
  0.25 of it. Do not restore a model that adds on top of `base` toward 100. That says an infra
  engineer with an assistant produces 88% of a native's frontend work, which is the claim the site
  exists to deny. The `base²/100` floor is what keeps the curve continuous: a native starts at their
  ceiling because their own corner is the one they trained.
- **The number reads two ways and the copy must hold both.** *Today* it is a ceiling: the best you
  can currently do there, and no tool raises it. *Over years* it is a price: training moves your
  affinity and the number moves with it. Dropping the first makes the calculator a lie; dropping the
  second makes the site fatalistic. Stated once on `about.html` via `TWO_READINGS`, keep it there.
- **Specialization's tech label is "Specialist", deliberately not a job title.** "Architect" is
  narrower than the work and "SME" is reachable with time, which is the one thing this corner is
  not. See `SPECIALIST.naming`.
- **`loadSaved()` must keep sanitising.** An unvalidated type id throws in the renderer, which
  aborts the first paint before `bindEvents()` runs and leaves every control dead across reloads.
- Never edit `css/neorgon-*.css` or `js/neorgon-*.js`. Those are vendored kit files; edit
  `packages/neorgon-ui/` and re-run the sync script.

## Post assets

`post/` holds the Medium write-up and its four diagrams.

```bash
node post/build-visuals.mjs   # regenerate the SVGs
open post/preview.html        # contact sheet (needs the dev server)
```

`build-visuals.mjs` imports `TYPES` and `efficiency` from `js/data.js` so the diagrams cannot drift
from the live model. It keeps a local `SHORT_ROLE` map only because full role strings are too long
for diagram labels.

## Known open concerns

Model gaps are catalogued in `docs/model-review.md` and answered on-page in `js/faq.js`. The main
ones: Nen type is fixed and careers are not; seniority is a missing axis; the quiz cannot measure
the Specialist corner yet offers it as a result; no corner points outward at a customer or market.
