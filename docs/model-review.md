# Affinity: model review and open concerns

Four independent reviews of the model, the copy, the code, and the visual design.
This file records what they found, what was fixed, and what is deliberately left open.

Reviewed 2026-08-04 against commit `ab0d07e`.

---

## Fixed

### The calculator disproved the site's own thesis

All three content reviewers found this independently, and it was the most serious problem here.

The old `withAI()` used a headroom model, `lift = (100 - base) · g(base)`. Because the term is zero
when `base` is 100, a native working in their own corner gained **exactly nothing** from AI, while a
60% engineer gained the most points of anyone. The page said "AI is a force multiplier here and it
shows immediately" directly above a meter that drew a flat line.

Measured output of the old formula at 100% AI:

| base | 0 | 40 | 60 | 80 | 100 |
|---|---|---|---|---|---|
| result | 15 | 57 | 78 | 94 | 100 |
| gain | +15 | +17 | **+18** | +14 | **+0** |

The copy claimed the opposite ordering. A "Locked" 0% corner also reached 15%, contradicting its own
band label.

**Fix:** the axis was split in two. `withAI(base, aiPct, axis)` now runs `output` at 0.8 conversion
and `judgment` at 0.12, and returns 0 for a locked corner. Emission → Conjuration at 100% AI now
reads output 88%, judgment 47%, a 41-point spread. That is both the honest claim and a stronger one:
AI really does let you ship in the opposite corner, and it does not let you tell whether what you
shipped is any good.

### The flagship 40% example could never appear

`renderReadout()` ranked all five other corners and named the lowest as "hardest crossing". Because
Specialization is a flat 0 for every non-Specialist, it always won, so the Emission ↔ Conjuration
40% crossing that the hero, the AI-law card, and the README all advertise was **never once shown**.
Specialization is now ranked separately with its own line.

### Stale localStorage bricked the page permanently

`loadSaved()` did `Object.assign(s, JSON.parse(raw))` with no validation. Any unknown `bornType`
(a future type rename would do it) made `renderReadout` throw, which aborted `render()` before
`bindEvents()` ran. Every button on the page went dead, and the bad value persisted across reloads,
so the only recovery was DevTools. State is now sanitised on load and `efficiency()` returns 0 for
unknown ids.

### Other fixes

| Issue | Fix |
|---|---|
| Calculator modal overflowed its dialog by 191px (a long `<option>` forced the `1fr` track wide) | `repeat(2, minmax(0, 1fr))`, and options truncate the role to its first segment |
| Hexagon never dimmed, despite the copy promising it did | `--eff` custom property drives opacity; the five tiers now measure 1.0 / .89 / .78 / .66 / .44 |
| The web was outer ring + spokes only, carrying no information | Concentric guide rings plus a filled efficiency polygon, ported from the post generator |
| Node names broke outside their circles ("TRANSMUTATION" was 87px inside an 80px disc) | Names moved outside the disc, positioned per corner |
| Keyboard focus was ejected from the quiz modal on every answer | `restoreQuizFocus()` after re-render |
| `role="radiogroup"` / `role="radio"` with no arrow-key handling | Dropped to plain buttons with `aria-pressed`, matching the hexagon |
| `$()` cached detached nodes, silently freezing the AI percentage label | Cache is invalidated via `isConnected` |
| `signals` (18 strings) and `isSpecialist` were defined but never rendered | `signals` now drives the "You might be one if…" disclosure on each card |
| Role cards were 836–900px each, so six-way comparison was impossible | Compact by default, rest behind a per-card disclosure |
| `robots.txt` blocked every bot, so a shared link could not unfurl a preview card | Unfurl bots allowed, search and AI crawlers still disallowed |
| Footer used `content` mode with a bare text child, squeezing copy into a 35% column | `minimal` |
| Dead `Marginal` band, dead `--you` var, unreachable verdict classes | Removed |
| `TYPES` / `efficiency()` duplicated between `js/data.js` and `post/build-visuals.mjs` | The generator imports from `js/data.js` |

### Framing: ceiling → price

The reviewers converged on this being the single most damaging thing about the copy, and the
sentence a hostile reader would screenshot. "Affinity sets the ceiling" is a claim about limits,
which is close to unevidenced, while successful retraining is observable everywhere. "Affinity sets
the price" is a claim about the rate at which effort converts, which is defensible and is what the
model actually shows. The `band()` labels changed with it: Native / Cheap / Expensive / Very
expensive / No direct route.

---

## Deliberately not changed

### Specialization stays at 0%

One reviewer argued the 0 is not canon and should follow the normal distance rule. It checked
against the source material and the reviewer is wrong: the manga's own efficiency panel shows
`SPECIAL 0%` for a Conjurer, and the fan efficiency chart states the exception explicitly. The 0
stays. What did change is the framing, from "Locked. Cannot be trained into" to "No direct route",
and the FAQ now says plainly that this describes the absence of a direct path rather than a claim
about any real person's capacity.

### The hexagon seating stays as it is

A scored comparison of every possible ring ordering put the current seating at 13 out of a
theoretical maximum of 14, and reaching 14 required swapping Specialization and Manipulation, which
is semantically absurd. The weak adjacencies (Data ↔ Frontend, Frontend ↔ Architect) are unavoidable
because the real career graph is hub-and-spoke with Backend at the centre, and a hexagon gives every
node degree 2. That is a limit of the borrowed fiction rather than a fixable bug.

---

## Resolved after the first review: career mobility

The reviewers' biggest open concern was that Nen type is fixed at birth and careers are not. The
sharpest form of it came from the author: *nobody starts as a manager, so how does someone who ends
up at 100% there fit?* And its consequence: *does this say a developer cannot become a PM?*

The old model had no answer because it conflated two different things into one `bornType`.

**The fix is a second layer.** `affinity` is the corner your judgment came from and moves slowly.
`workingIn` is the corner the work sits in and moves freely. They are now separately selectable,
and the gap between them is what the site forecasts.

This changes what the model claims:

| Before | After |
|---|---|
| "You are an Enhancer" | "You are an Enhancer currently doing Manipulation work" |
| Implies you cannot become a PM | Predicts what kind of PM you will be |
| One tap changed your innate type, refuting the premise | One tap changes your role, which is what roles do |

It is also canon-faithful rather than a fudge. Water divination *reveals* a type you already had;
it does not assign one. Hunters who learn Nen at thirty find out at thirty. So the model gets a
diagnostic it did not have before, in `REVEAL_TEST`: after two or three years in the new corner, is
it still expensive? If it got cheap, that corner was yours and the test ran late. If it is still
expensive, you are paying rent, which can still be the right trade.

The "Manipulation = management" friction was addressed at the same time, and mostly by the label
toggle. The hexagon now shows **tech roles by default** with Nen names one click away, so the
loaded English word only appears when someone asks for it.

---

## Second pass: the ceiling correction

The author read the calculator and rejected it: *"the nen doesn't add you an extra on top of the
maximum, it allows you to improve your existent natural affinity… but the ceiling makes the max
efficiency out of the job that you can make. So as a BE you may do FE, and your results would be
fine, but not as fine and refined as a FE natural."*

They were right, and the fix is also more canon-faithful. In the manga the percentage **is** the
conversion rate. Pouring in more aura at 40% efficiency buys more output at 40% efficiency; it never
makes you a 90% Emitter. The first fix (0.8 / 0.12 conversion toward 100) still let a 40% pairing
read 88% output at full AI, which is the exact claim the site exists to deny.

**The model now caps at the affinity number.**

```
cold(base)  = base² / 100          // where you stand untrained, with no AI
withAI      = cold + (base - cold) × (ai/100) × conv     conv = { output: 1, judgment: 0.25 }
```

| base | cold | output @100% AI | judgment @100% AI |
|---|---|---|---|
| 100 | 100 | 100 | 100 |
| 80 | 64 | 80 | 68 |
| 60 | 36 | 60 | 42 |
| 40 | 16 | 40 | 22 |
| 0 | 0 | 0 | 0 |

The `base²/100` floor is doing real work: it makes the curve continuous at both ends without a
special case. A native starts at 100 because their own corner is the one they trained, and a locked
corner starts at 0. The meter draws the ceiling as a tick that neither bar crosses, which is most of
the argument in one glyph.

### The claim conflict this exposed

The site had been saying "the percentage is a price, not a ceiling". The framing the first review
recommended: directly alongside a calculator that now draws a hard wall. Both are true of different
timescales, and saying so is stronger than either alone:

- **Today it is a ceiling.** The best you can currently do in that corner. No tool raises it.
- **Over years it is a price.** Training moves your affinity, and the number moves with it.

AI changes how fast you reach today's ceiling and does nothing to the price of raising it. This is
now stated once, on the about page, as `TWO_READINGS`.

### Also settled in this pass

| Concern | Resolution |
|---|---|
| "Architect" was too narrow for Specialization, and SME is wrong because time and effort *can* buy it | The tech label is now **Specialist**, deliberately not a job title, because no job title fits. `SPECIALIST.naming` says why, and a new FAQ item handles the SME distinction |
| Skilled AI use is a real variable the meter ignored | Not another slider. `AI_LADDER` on the crossing page states the order it pays back in: reinforce your own corner, then the adjacent ones, then across the chart. Skill changes how fast you climb, never where the climb stops |
| Modal dialogs were surfaced with `--surface-1`, i.e. 3% white over a blurred backdrop, and were hard to read | Opaque `--surface-panel`, with the reason recorded as a gotcha next to the rule |
| The model page forced a scroll between the chart and the panel that reads it | `index.html` is a fixed-height console; the readout scrolls inside itself |
| The introduction spent most of a screen before anyone reached the chart | Moved into a popup shown once per browser, permanently available on the about page |

## Open concerns

These are real and are answered in the on-page FAQ rather than solved.

1. **The analogy still leaks on mobility.** The two-layer split narrows the gap between a fixed
   birth trait and a moving career; it does not close it. What is defensible is the gradient at a
   point in time, not its permanence.

2. **Seniority is a separate axis that the model has no slot for.** A new grad and a principal
   engineer both read as 100% in their corner. Experience predicts output better than affinity does,
   and much of what the Specialist corner describes is just a decade of being wrong in public.

3. **The quiz cannot measure the Specialist corner, and makes it the easiest result to reach.** Five
   forced-choice questions with a legible mapping, where the Specialist option is the most
   flattering answer in nearly every set. The FAQ says this out loud. The honest options are to drop
   the verdict framing or drop Specialization as an outcome; neither is done yet.

4. **Every corner points inward at a product or a team.** Nothing points outward at a customer, a
   market, or a community, so sales engineering, developer relations, and founding have nowhere to
   sit. Not fixable without a seventh corner the fiction does not have.

5. **Most real roles land on edges, not corners.** Security alone spans three. The model sorts
   activities rather than job titles, and the copy should keep saying so.

6. **"Manipulation" is uncharitable to managers in English.** Partly defused by reading the corner
   as conditions and vows, but the word still lands badly and the canon exemplar is a member of a
   murder cult.

7. **Self-assigned Specialist.** The author claims the highest-status corner. The FAQ concedes the
   point and says the only version of that claim worth anything comes from other people.

---

## Deployment note

The site is published but unlisted at `affinity.neorgon.com`: reachable by link, `noindex`, no hub
card, absent from `PROJECTS.md`'s domain map and from `neorgon-site`. As of the review, GitHub Pages
had **not** issued a TLS certificate for the custom domain, so `https://` failed validation while
every metadata URL points at `https://`. Repo was one day old at the time and provisioning can lag,
so re-check before sharing the link publicly:

```bash
curl -sI https://affinity.neorgon.com/ | head -1
```
