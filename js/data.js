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
    short: 'Backend',
    accent: '#f43f5e',
    tagline: 'Reinforce what exists. Effort turns straight into output.',
    nenDesc: 'Reinforces the natural abilities of the user or an object. The most straightforward type: pour aura in, get raw power out.',
    roleDesc: 'You make the thing work, then make it fast and correct. Services, jobs, data models, the load-bearing logic behind a product. Progress is legible: profile it, fix it, ship it.',
    strengths: ['Deep focus on a single hard problem', 'Reliability and correctness under load', 'Turning vague requirements into working systems'],
    watch: 'Enhancers undervalue presentation and politics. The work is real but invisible until it breaks.',
    withAI: 'You are already at your ceiling here, so AI arrives as speed rather than as quality: boilerplate, test scaffolds, refactors, all of it faster. More work fits in a week. The work itself is as good as you were.',
    personality: 'Simple, determined, straight-ahead (Gon-type).',
    signals: ['You reach for the debugger before the design doc', 'You measure your day in problems closed, not meetings survived', 'A green test suite genuinely makes you happy'],
  },
  {
    id: 'transmutation',
    nen: 'Transmutation',
    kanji: '変',
    role: 'Data / ML Engineering',
    short: 'Data / ML',
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
    short: 'Frontend',
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
    role: 'The role there is no title for',
    short: 'Specialist',
    accent: '#facc15',
    tagline: 'Anything that fits no other category. You do not train into it.',
    nenDesc: 'Abilities that conform to none of the other five types. Defaults to 0% for everyone else, because it cannot be reached by stepping around the ring. It emerges.',
    roleDesc: 'Architect, staff engineer, principal, founder: each of those is a title the industry invented to pay for this, and none of them is the thing itself. What the corner holds is systems judgment, synthesis across disciplines, and the call nobody else is positioned to make. Hard to define and hard to hire for, and yet anyone who has worked alongside one can name them without hesitating.',
    strengths: ['Seeing the whole board, not one square', 'Borrowing from every discipline and combining it', 'Being trusted with the ambiguous, high-stakes call'],
    watch: 'This is the corner everyone tries to chase directly for the title and the pay, and it is exactly the trap. See below.',
    withAI: 'A specialist gains more than most, because their bottleneck was always synthesis rather than typing. What AI cannot do is manufacture the judgment being synthesised. It serves someone who already has it.',
    personality: 'Individualist, charismatic, plays by their own rules (Chrollo-type).',
    signals: ['People bring you problems that have no clear owner', 'You are valued for what you decline as much as what you build', 'Your best work is invisible: the disaster that never happened'],
    isSpecialist: true,
  },
  {
    id: 'manipulation',
    nen: 'Manipulation',
    kanji: '操',
    role: 'Engineering Management / PM / TPM',
    short: 'Management',
    accent: '#38bdf8',
    tagline: 'Direct living and non-living things toward an outcome.',
    nenDesc: 'Controls living or non-living targets under set conditions. Powerful and far-reaching, but built on rules, trust, and setup rather than raw force.',
    roleDesc: 'You move people, process, priorities, and dependencies toward a goal. Your output is other people\'s output, multiplied or wasted depending on how well you set the conditions.',
    strengths: ['Aligning people who report to no one you control', 'Sequencing work so the right things happen in order', 'Absorbing chaos so the team does not have to'],
    watch: 'Manipulators can drift from the craft until they can no longer evaluate it. Range without depth becomes hand-waving.',
    withAI: 'Moderate direct affinity, and a lot of indirect reach. AI drafts your docs and plans, but the core skill, reading and moving people, is stubbornly human.',
    personality: 'Logical, argumentative, systems-minded (Shalnark-type).',
    signals: ['You think in dependencies and unblocking', 'A quiet, shipping team is your favorite artifact', 'You would rather fix the process than the bug'],
  },
  {
    id: 'emission',
    nen: 'Emission',
    kanji: '放',
    role: 'DevOps / SRE / Platform / Infra',
    short: 'Infra',
    accent: '#fb923c',
    tagline: 'Separate your aura from your body and project it at a distance.',
    nenDesc: 'Detaches aura from the user and keeps it stable far away. Power that acts where you are not, at scale, across distance, which is exactly the trick and the difficulty.',
    roleDesc: 'You run the systems everything else stands on: CI/CD, clusters, observability, the platform. Your aura is projected across every service at once, and when it holds, nobody notices.',
    strengths: ['Reasoning about distributed, failure-prone systems', 'Automating yourself out of repetitive work', 'Staying calm while everything is on fire'],
    watch: 'Emitters are invisible when it works and blamed when it breaks. The reach is enormous and the recognition always lags it.',
    withAI: 'Strong affinity for scripting and config, so the climb here is short. Pointed at frontend work, the corner directly opposite, the same engineer with the same assistant caps at 40%, and pouring in more of it does not move the cap.',
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
  const i = TYPES.findIndex((t) => t.id === sourceId);
  const j = TYPES.findIndex((t) => t.id === targetId);
  if (i === -1 || j === -1) return 0;
  if (i === j) return 100; // must precede the exception, or a Specialist reads 0 at home
  if (targetId === 'specialization') return 0; // the Specialization exception
  return 100 - 20 * ringSteps(i, j);
}

/**
 * Where you start in a corner with no AI and no training in it,
 * as a percentage of a trained native.
 *
 * Your affinity doubles as the fraction of its own ceiling you reach
 * cold, which keeps the curve continuous at both ends: a native
 * starts at 100 because their own corner is the one they trained,
 * and a locked corner starts at 0.
 */
export function coldLevel(base) {
  return (base * base) / 100;
}

/**
 * How much of the remaining climb to your ceiling an AI assist
 * covers, per axis. Output covers all of it. Judgment barely moves,
 * because judgment is bought by having been wrong in a domain many
 * times, which is the one thing an assistant cannot hand you.
 */
const AI_CONVERSION = { output: 1, judgment: 0.25 };

/**
 * Effective level on one axis once AI is applied, as a percentage of
 * a trained native in the target corner.
 *
 * AI does not raise the ceiling. It carries you up to the ceiling
 * your affinity already set, without the years of training that were
 * previously the only route there. A backend engineer doing frontend
 * work with AI ships something real, and usually something good
 * enough. It is still not what a native produces, and pouring in
 * more AI never closes that last stretch.
 *
 * @param {number} base   0..100 affinity efficiency, which is the ceiling
 * @param {number} aiPct  0..100 how much AI assistance is applied
 * @param {'output'|'judgment'} axis  which capability is being measured
 * @returns {number} 0..base
 */
export function withAI(base, aiPct, axis = 'output') {
  if (base === 0) return 0; // Specialization is not a task you take on
  const cold = coldLevel(base);
  const lift = (base - cold) * (aiPct / 100) * AI_CONVERSION[axis];
  return Math.round(Math.min(base, cold + lift));
}

/**
 * Human label for an affinity band.
 *
 * The number reads two ways and both hold. Today it is a ceiling:
 * the best you can currently do in that corner, and no tool raises
 * it. Over years it is a price: training moves your affinity, and
 * the number moves with it. Keeping both in view is what stops the
 * chart being either fatalistic or useless.
 */
export function band(pct) {
  if (pct >= 100) return { label: 'Native', note: 'Your own corner. Effort converts at full rate.' };
  if (pct >= 80) return { label: 'Cheap', note: 'One step out. Today it stops here, and it is the cheapest corner to make your own.' };
  if (pct >= 60) return { label: 'Expensive', note: 'Two steps out. Competent output arrives; competent judgment costs real years.' };
  if (pct >= 40) return { label: 'Very expensive', note: 'The far corner. Today this is the wall. Getting past it takes years, not tools.' };
  return { label: 'No direct route', note: 'It emerges on top of a mastered corner. You cannot aim at it.' };
}

// ── The Specialist problem ───────────────────────────────────
// The role you cannot chase directly. Three canon references make
// it concrete for a tech audience.

export const SPECIALIST = {
  intro: 'Specialization sits at 0% for everyone else on purpose. You do not step around the ring into it. It emerges on top of a mastered type plus something you did not train for. That is why chasing it directly, for the title or the pay, is the classic mistake.',
  naming: 'The chart keeps the manga\'s word for this corner because the industry has not produced a better one. "Architect" is a title with a job description attached, and the description is always narrower than the work. "Subject matter expert" is closer and still wrong: an SME is made by spending years on one subject, and that route is open to anyone willing to spend them. This corner is the one with no such route. What is left is a word for something people recognise on sight and cannot specify in a job posting.',
  references: [
    {
      name: 'Chrollo — Skill Hunter',
      nen: 'Copies and refines other people\'s abilities.',
      tech: 'The engineer who borrows from every discipline and synthesises the borrowings into judgment, having paid in years for each thing they copied. The synthesis is the skill. The copying comes with brutal conditions.',
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
