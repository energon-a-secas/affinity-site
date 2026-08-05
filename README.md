<div align="center">

# Affinity

Know what to expect from an engineer working outside their corner, and what AI does and does not change

[![Live][badge-site]][url-site]
[![HTML5][badge-html]][url-html]
[![CSS3][badge-css]][url-css]
[![JavaScript][badge-js]][url-js]
[![Claude Code][badge-claude]][url-claude]
[![License][badge-license]](LICENSE)

[badge-site]:    https://img.shields.io/badge/live_site-0063e5?style=for-the-badge&logo=googlechrome&logoColor=white
[badge-html]:    https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[badge-css]:     https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[badge-js]:      https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[badge-claude]:  https://img.shields.io/badge/Claude_Code-CC785C?style=for-the-badge&logo=anthropic&logoColor=white
[badge-license]: https://img.shields.io/badge/license-MIT-404040?style=for-the-badge

[url-site]:   https://affinity.neorgon.com/
[url-html]:   #
[url-css]:    #
[url-js]:     #
[url-claude]: https://claude.ai/code

</div>

---

## Overview

Affinity borrows the Nen efficiency chart from Hunter x Hunter and applies it to tech careers. Each of the six Nen categories maps to a kind of engineering work, and the same rule holds: you run at 100% in your own corner and lose about 20% for every step away from it. It exists to explain, without judgment, why crossing between kinds of engineering work costs more than the people recommending it admit, why AI carries you up to the ceiling your affinity already set rather than raising it, and why the Specialist corner has no direct route into it.

Published but unlisted: reachable by link, `noindex`, and absent from the Neorgon hub.

The objections this model earns are catalogued in [docs/model-review.md](docs/model-review.md) and answered on the page itself.

**Live:** affinity.neorgon.com

---

## The model

- **Enhancement** -- Backend / Core Engineering (reinforce what exists)
- **Transmutation** -- Data / ML Engineering (give raw material new properties)
- **Conjuration** -- Frontend / Product Engineering (manifest what users see)
- **Specialization** -- Specialist, the role there is no title for (fits no other category)
- **Manipulation** -- Engineering Management / PM / TPM (direct people and process)
- **Emission** -- DevOps / SRE / Platform / Infra (project power at a distance)

Opposites (three steps apart on the hexagon) are the hardest crossings: Emission ↔ Conjuration (infra ↔ frontend) sits at 40%, the exact example this tool is built to explain.

---

## Features

- **Interactive affinity hexagon** -- two selectable layers (the corner your judgment came from, the corner your job is in), tech role labels by default with Nen names one click away, and an expectation panel that reads the gap
- **AI amplification calculator** -- choose who you are and what you are asked to do, then pour AI in with a slider; both bars climb toward a marked ceiling and neither passes it
- **Six corner cards** -- each kind of work, its Nen category, what the corner asks for, and what AI does for it
- **Find-your-type quiz** -- five questions that surface your closest affinity (and any strong dual)
- **The Specialist explainer** -- why this corner has no direct route in, why it keeps the manga's word rather than a job title, and how it differs from a subject matter expert

---

## Running locally

ES modules require an HTTP server (not `file://`):

```bash
make serve   # http://localhost:8855
```

---

## Architecture

![Architecture](docs/architecture.svg)

Five pages share one JS bundle. Every renderer no-ops when its mount point is absent, so a page
declares what it shows by which `id`s it contains.

```
affinity-site/
├── index.html           # The model: hexagon, layer pickers, expectation readout, intro popup
├── types.html           # The six corners + the Specialist explainer
├── crossing.html        # Mobility, what AI changes, where to point it first
├── faq.html             # Objections
├── about.html           # What this is, where the chart came from, how to read and use it
├── css/
│   └── style.css        # Design tokens + console layout, hexagon, cards, calculator
├── js/
│   ├── app.js           # Entry point (<30 lines)
│   ├── state.js         # Two layers, quiz answers, slider (localStorage, validated on load)
│   ├── data.js          # Six types, efficiency() / coldLevel() / withAI() / band(), quiz
│   ├── expect.js        # Forecast layer: what to expect, named crossings, the AI ladder
│   ├── about.js         # Intro copy, provenance, sources, the two readings
│   ├── faq.js           # Objections as concede/hold pairs
│   ├── nav.js           # Page set, header nav, prev/next pager
│   ├── hexagon.js       # SVG web + efficiency polygon, layer pickers, readout
│   ├── sections.js      # Corner cards, Specialist, crossings, ladder, FAQ, about, intro
│   ├── views.js         # Quiz and AI calculator modal interiors
│   ├── events.js        # Modal focus trap, hexagon / quiz / calculator wiring
│   └── utils.js         # escHtml, $ element cache
├── post/                # Medium write-up + generated diagrams
└── docs/
    ├── model-review.md  # What the reviews found, fixed, and left open
    └── architecture.mmd # Mermaid source for the diagram above
```

---

<div align="center">
<sub>Part of <a href="https://neorgon.com/">Neorgon</a></sub>
</div>
