// ── Affinity data model ──────────────────────────────────────
// The six Nen types laid out on a hexagon, mapped to tech roles.
// The order of TYPES defines adjacency: efficiency drops ~20% per
// step around the ring. Specialization is special-cased (see
// efficiency() below) — you can't grind your way into it.

/**
 * Clockwise hexagon order. Opposites (3 steps apart) are the
 * genuinely hardest career crossings:
 *   Enhancement ↔ Specialization   (build ↔ judgment)
 *   Transmutation ↔ Manipulation   (data ↔ people)
 *   Conjuration ↔ Emission         (frontend ↔ infra)  ← the 40% example
 */
export const TYPES = [
  {
    id: 'enhancement',
    nen: 'Enhancement',
    kanji: '強',
    role: 'Backend / Core Engineering',
    accent: '#f43f5e',
    tagline: 'Reinforce what exists. Effort turns straight into output.',
    nenDesc: 'Reinforces the natural abilities of the user or an object. The most straightforward type: pour aura in, get raw power out.',
    roleDesc: 'You make the thing work, then make it fast and correct. Services, jobs, data models, the load-bearing logic behind a product. Progress is legible: profile it, fix it, ship it.',
    strengths: ['Deep focus on a single hard problem', 'Reliability and correctness under load', 'Turning vague requirements into working systems'],
    watch: 'Enhancers undervalue presentation and politics. The work is real but invisible until it breaks.',
    withAI: 'AI is a force multiplier here and it shows immediately: boilerplate, test scaffolds, refactors. Your affinity is high, so the amplification lands.',
    personality: 'Simple, determined, straight-ahead (Gon-type).',
    signals: ['You reach for the debugger before the design doc', 'You measure your day in problems closed, not meetings survived', 'A green test suite genuinely makes you happy'],
  },
  {
    id: 'transmutation',
    nen: 'Transmutation',
    kanji: '変',
    role: 'Data / ML Engineering',
    accent: '#a78bfa',
    tagline: 'Give raw material a property it did not have before.',
    nenDesc: 'Aura takes on the properties of something else, electricity, gum, whatever the user imagines. Playful, unpredictable, hard for outsiders to read.',
    roleDesc: 'You turn raw data into behavior: pipelines, features, models, the statistics behind a recommendation. The output looks like magic to everyone else because the transformation is not visible.',
    strengths: ['Comfort with ambiguity and probability', 'Seeing structure in messy data', 'Iterating on things that only work "mostly"'],
    watch: 'Transmuters chase the interesting transformation over the shippable one. Not every problem needs a model.',
    withAI: 'Strong affinity. AI is itself a transmutation tool, so the crossover feels native. You extend your reach without leaving your type.',
    personality: 'Whimsical, moody, hard to predict (Killua / Hisoka-type).',
    signals: ['You trust a distribution over an anecdote', 'You are happy when the metric moves, even if nobody sees why', 'You have opinions about eval sets'],
  },
  {
    id: 'conjuration',
    nen: 'Conjuration',
    kanji: '具',
    role: 'Frontend / Product Engineering',
    accent: '#4ade80',
    tagline: 'Manifest a tangible object that non-experts can actually see.',
    nenDesc: 'Creates a real, material object out of aura, visible and usable even by people with no Nen. The clearest, most concrete output of any type.',
    roleDesc: 'You build the surface people actually touch: interfaces, interactions, the product as the user experiences it. Your work is the only work most people ever see, which is both the power and the pressure.',
    strengths: ['Translating intent into something usable', 'Taste, detail, and the last 10%', 'Empathy for the person on the other side of the screen'],
    watch: 'Conjurers get judged on polish they did not scope. Visible work invites everyone to have an opinion.',
    withAI: 'High affinity for scaffolding and iteration. AI drafts the component; your taste decides what ships. The judgment stays yours.',
    personality: 'High-strung, precise, principled (Kurapika-type).',
    signals: ['You notice a 2px misalignment from across the room', 'You think in user flows, not endpoints', 'A confusing error message physically bothers you'],
  },
  {
    id: 'specialization',
    nen: 'Specialization',
    kanji: '特',
    role: 'Architect / Staff+ / Strategist',
    accent: '#facc15',
    tagline: 'Anything that fits no other category. You do not train into it.',
    nenDesc: 'Abilities that conform to none of the other five types. Defaults to 0% for everyone else, because it cannot be reached by stepping around the ring. It emerges.',
    roleDesc: 'Systems judgment, cross-discipline synthesis, the call nobody else is positioned to make. Not a promotion you earn by doing more of your current job, an emergent capability built on top of a mastered type plus something innate.',
    strengths: ['Seeing the whole board, not one square', 'Borrowing from every discipline and combining it', 'Being trusted with the ambiguous, high-stakes call'],
    watch: 'This is the corner everyone tries to chase directly for the title and the pay, and it is exactly the trap. See below.',
    withAI: 'AI amplifies a specialist enormously because their bottleneck is synthesis, not typing. But AI cannot manufacture the judgment, it can only serve someone who already has it.',
    personality: 'Individualist, charismatic, plays by their own rules (Chrollo-type).',
    signals: ['People bring you problems that have no clear owner', 'You are valued for what you decline as much as what you build', 'Your best work is invisible: the disaster that never happened'],
    isSpecialist: true,
  },
  {
    id: 'manipulation',
    nen: 'Manipulation',
    kanji: '操',
    role: 'Engineering Management / PM / TPM',
    accent: '#38bdf8',
    tagline: 'Direct living and non-living things toward an outcome.',
    nenDesc: 'Controls living or non-living targets under set conditions. Powerful and far-reaching, but built on rules, trust, and setup rather than raw force.',
    roleDesc: 'You move people, process, priorities, and dependencies toward a goal. Your output is other people\'s output, multiplied or wasted depending on how well you set the conditions.',
    strengths: ['Aligning people who report to no one you control', 'Sequencing work so the right things happen in order', 'Absorbing chaos so the team does not have to'],
    watch: 'Manipulators can drift from the craft until they can no longer evaluate it. Range without depth becomes hand-waving.',
    withAI: 'Moderate direct affinity, high indirect leverage. AI drafts your docs and plans, but the core skill, reading and moving people, is stubbornly human.',
    personality: 'Logical, argumentative, systems-minded (Shalnark-type).',
    signals: ['You think in dependencies and unblocking', 'A quiet, shipping team is your favorite artifact', 'You would rather fix the process than the bug'],
  },
  {
    id: 'emission',
    nen: 'Emission',
    kanji: '放',
    role: 'DevOps / SRE / Platform / Infra',
    accent: '#fb923c',
    tagline: 'Separate your aura from your body and project it at a distance.',
    nenDesc: 'Detaches aura from the user and keeps it stable far away. Power that acts where you are not, at scale, across distance, which is exactly the trick and the difficulty.',
    roleDesc: 'You run the systems everything else stands on: CI/CD, clusters, observability, the platform. Your aura is projected across every service at once, and when it holds, nobody notices.',
    strengths: ['Reasoning about distributed, failure-prone systems', 'Automating yourself out of repetitive work', 'Staying calm while everything is on fire'],
    watch: 'Emitters are invisible when it works and blamed when it breaks. Leverage is huge but recognition lags.',
    withAI: 'Strong affinity for scripting and config. But note: an Emitter handed AI to do frontend work (the opposite corner) is still capped near 40%, no matter how much AI they pump in.',
    personality: 'Impatient, quick-tempered, gets it done (Leorio-type).',
    signals: ['You have opinions about YAML you did not want to have', 'You measure success in nines of uptime', 'You automate anything you have done twice'],
  },
];

/** Fast id → type lookup. */
export const TYPE_BY_ID = Object.fromEntries(TYPES.map((t) => [t.id, t]));

/**
 * Steps around the hexagon between two type indices (0..3).
 * Opposite corners are 3 steps apart.
 */
export function ringSteps(i, j) {
  const d = Math.abs(i - j);
  return Math.min(d, TYPES.length - d);
}

/**
 * Base affinity efficiency of a `source` type operating in a
 * `target` type's work, before any AI amplification.
 *   own type      → 100
 *   1 step away   → 80
 *   2 steps away  → 60
 *   opposite      → 40
 * Specialization is 0 for anyone not born to it — it cannot be
 * reached by stepping around the ring.
 */
export function efficiency(sourceId, targetId) {
  if (sourceId === targetId) return 100;
  if (targetId === 'specialization') return 0; // the Specialization exception
  const i = TYPES.findIndex((t) => t.id === sourceId);
  const j = TYPES.findIndex((t) => t.id === targetId);
  return 100 - 20 * ringSteps(i, j);
}

/**
 * Effective performance once AI is applied. AI does not move you
 * to another type — it scales the affinity you already have.
 * A high-affinity user gets most of the boost; a low-affinity
 * user pours aura into a leaky bucket.
 *
 * @param {number} base   0..100 affinity efficiency
 * @param {number} aiPct  0..100 how much AI assistance is applied
 * @returns {number} 0..100 effective performance
 */
export function withAI(base, aiPct) {
  // AI lifts you toward a ceiling, but how much of the assist
  // actually converts scales with affinity — and steeply. A native
  // user turns AI into near-full output; an opposite-corner user
  // pours aura into a leaky bucket. Squaring affinity makes the cap
  // bite: 80% base → strong lift, 40% base → barely moves.
  const affinity = base / 100;
  const maxLift = 100 - base;                 // headroom to a theoretical 100
  const conversion = 0.15 + 0.85 * affinity * affinity;
  const lift = maxLift * (aiPct / 100) * conversion;
  return Math.round(Math.min(100, base + lift));
}

/** Human label for an efficiency band. */
export function band(pct) {
  if (pct >= 100) return { label: 'Native', note: 'Your born type. Full ceiling.' };
  if (pct >= 80) return { label: 'Strong', note: 'Adjacent. Reachable with focused training.' };
  if (pct >= 60) return { label: 'Workable', note: 'Two steps out. Competent, never native.' };
  if (pct >= 40) return { label: 'Capped', note: 'Opposite corner. Effort hits a low ceiling fast.' };
  if (pct > 0) return { label: 'Marginal', note: 'Far from type. Diminishing returns.' };
  return { label: 'Locked', note: 'Cannot be trained into. It emerges or it does not.' };
}

// ── The Specialist problem ───────────────────────────────────
// The role you cannot chase directly. Three canon references make
// it concrete for a tech audience.

export const SPECIALIST = {
  intro: 'Specialization sits at 0% for everyone else on purpose. You do not step around the ring into it. It emerges on top of a mastered type plus something you did not train for. That is why chasing it directly, for the title or the pay, is the classic mistake.',
  references: [
    {
      name: 'Chrollo — Skill Hunter',
      nen: 'Copies and refines other people\'s abilities.',
      tech: 'The Architect who borrows expertise from every discipline and synthesizes it into judgment — but only after paying, in years, for each thing they copied. The synthesis is the skill; the copying has brutal conditions.',
    },
    {
      name: 'Kurapika — Emperor Time',
      nen: '100% in all six types at once, at extreme personal cost.',
      tech: 'The Staff engineer who can go deep anywhere inside their domain of obsession — and pays for it in burnout and tunnel vision. Total range is real, and it is not free.',
    },
    {
      name: 'Neon / Pakunoda — innate powers',
      nen: 'Prediction and memory-reading. Never trained, just born.',
      tech: 'Taste. Systems intuition. The call you cannot explain. Some of the specialist edge is simply innate and no amount of study manufactures it.',
    },
  ],
  lesson: 'You do not study to become a Specialist. You master your own corner, and range comes second, if it comes at all. Trying to target the opposite corner because it is what gets hired is exactly how you cap at 40% and burn out. Lean into your affinity.',
};

// ── Find-your-type quiz ──────────────────────────────────────
// Each option scores one or more types. Highest total wins;
// ties surface a dual-affinity result.

export const QUIZ = [
  {
    q: 'A project kicks off. What pulls you first?',
    options: [
      { text: 'The core logic — what actually has to work', scores: { enhancement: 2 } },
      { text: 'The data — what we can learn or predict from it', scores: { transmutation: 2 } },
      { text: 'The interface — what people will see and touch', scores: { conjuration: 2 } },
      { text: 'The shape — how the whole thing fits together', scores: { specialization: 2 } },
      { text: 'The people — who does what, in what order', scores: { manipulation: 2 } },
      { text: 'The plumbing — how it runs, deploys, and scales', scores: { emission: 2 } },
    ],
  },
  {
    q: 'Your work is going well when…',
    options: [
      { text: 'A hard problem is finally solved and correct', scores: { enhancement: 2 } },
      { text: 'A metric moves in the right direction', scores: { transmutation: 2 } },
      { text: 'Someone uses the thing without asking how', scores: { conjuration: 2 } },
      { text: 'A decision nobody else could make gets made', scores: { specialization: 2 } },
      { text: 'The team ships without me in the room', scores: { manipulation: 2 } },
      { text: 'Nobody noticed, because nothing broke', scores: { emission: 2 } },
    ],
  },
  {
    q: 'What most reliably drains you?',
    options: [
      { text: 'Endless meetings with no code at the end', scores: { enhancement: 1, transmutation: 1 } },
      { text: 'Pixel-level polish and design nitpicks', scores: { emission: 1, enhancement: 1 } },
      { text: 'Ambiguity with no clear owner or spec', scores: { conjuration: 1, enhancement: 1 } },
      { text: 'Being far from the actual craft', scores: { specialization: 1, transmutation: 1 } },
      { text: 'Firefighting the same outage twice', scores: { emission: 2 } },
      { text: 'Working alone with no one to align', scores: { manipulation: 2 } },
    ],
  },
  {
    q: 'A teammate is stuck. You instinctively…',
    options: [
      { text: 'Pair on the actual code with them', scores: { enhancement: 2 } },
      { text: 'Look at the numbers to see what is really happening', scores: { transmutation: 2 } },
      { text: 'Sketch the flow so we can see it', scores: { conjuration: 2 } },
      { text: 'Reframe the whole problem', scores: { specialization: 2 } },
      { text: 'Clear the blocker or find who can', scores: { manipulation: 2 } },
      { text: 'Check whether the environment is the problem', scores: { emission: 2 } },
    ],
  },
  {
    q: 'Which compliment lands hardest?',
    options: [
      { text: '"It just works, and it is fast."', scores: { enhancement: 2 } },
      { text: '"How did you get it to do that?"', scores: { transmutation: 2 } },
      { text: '"This is a joy to use."', scores: { conjuration: 2 } },
      { text: '"I would not have seen that."', scores: { specialization: 2 } },
      { text: '"The team runs better with you here."', scores: { manipulation: 2 } },
      { text: '"I never have to think about the platform."', scores: { emission: 2 } },
    ],
  },
];

/**
 * Score a set of quiz answers into a ranked type result.
 * @param {number[]} answers  one option index per question (or -1 if skipped)
 * @returns {{ranked: Array<{id:string, score:number}>, top: object, dual: object|null}}
 */
export function scoreQuiz(answers) {
  const totals = Object.fromEntries(TYPES.map((t) => [t.id, 0]));
  answers.forEach((optIdx, qIdx) => {
    const opt = QUIZ[qIdx]?.options[optIdx];
    if (!opt) return;
    for (const [id, pts] of Object.entries(opt.scores)) totals[id] += pts;
  });
  const ranked = Object.entries(totals)
    .map(([id, score]) => ({ id, score }))
    .sort((a, b) => b.score - a.score);
  const top = TYPE_BY_ID[ranked[0].id];
  // A near-tie (within 1 point) surfaces a dual affinity.
  const dual = ranked[1] && ranked[0].score - ranked[1].score <= 1 && ranked[1].score > 0
    ? TYPE_BY_ID[ranked[1].id]
    : null;
  return { ranked, top, dual };
}
