// ── Expectation engine ───────────────────────────────────────
// The point of knowing an affinity is knowing what to expect.
// Given the corner someone's judgment came from and the corner the
// work sits in, produce a plain-language forecast: what lands, what
// gets missed, what AI does and does not change.

import { TYPE_BY_ID, efficiency, withAI, coldLevel, band } from './data.js';

/**
 * What each corner asks of whoever works in it, and how you can
 * tell when someone is producing output without the judgment.
 */
export const CRAFT = {
  enhancement: {
    brings: 'depth on one hard problem and a bias toward correctness',
    demands: 'holding a system in your head and knowing which abstraction survives two years of change',
    judgment: 'where the concurrency bug is hiding, and which shortcut becomes next year\'s rewrite',
    tell: 'it works, passes tests, then buckles at ten times the load or calcifies into something nobody can change',
    review: 'a backend engineer reading it for failure modes rather than for correctness',
  },
  transmutation: {
    brings: 'comfort with uncertainty and a habit of checking whether a number means anything',
    demands: 'knowing when a result is real: sample size, leakage, what the baseline actually was',
    judgment: 'whether the metric moved because of you or because of the season',
    tell: 'a number that went up, and nobody in the room can say whether the move was real',
    review: 'someone who will ask what the control group was and not accept a shrug',
  },
  conjuration: {
    brings: 'taste, and a low tolerance for the last ten percent being wrong',
    demands: 'knowing what confuses a stranger, and what breaks for someone not using a mouse',
    judgment: 'which of three reasonable layouts loses people, and what happens in the empty and error states',
    tell: 'it looks right in the happy path and comes apart on a real device with real data',
    review: 'a frontend or design pass over states rather than over screens',
  },
  specialization: {
    brings: 'synthesis across disciplines and a nose for the problem underneath the stated one',
    demands: 'judgment nobody delegated to you, on decisions that are expensive to reverse',
    judgment: 'which call cannot be walked back, and which question is the actual question',
    tell: 'a confident plan that answers what was asked instead of what was meant',
    review: 'nothing. This corner has no direct route in, so it is grown rather than assigned',
  },
  manipulation: {
    brings: 'a read on sequencing, dependencies, and what unblocks whom',
    demands: 'knowing what people will actually do, as opposed to what they agreed to in the meeting',
    judgment: 'which commitment is real, and which quiet objection will surface in six weeks',
    tell: 'a plan everyone signed off on and nobody is executing',
    review: 'someone who has already run this organisation\'s politics once',
  },
  emission: {
    brings: 'a reflex for what happens at scale, at distance, and at three in the morning',
    demands: 'reasoning about failure in systems you cannot watch and cannot fully control',
    judgment: 'what pages someone at 3am, and which failure takes the whole fleet with it',
    tell: 'it works in staging and costs an afternoon of outage to learn why production is different',
    review: 'whoever carries the pager, before it ships rather than after',
  },
};

/** Headline forecast per affinity band. */
const FORECAST = {
  100: {
    verdict: 'Expect the whole job.',
    detail: 'This is their corner. Effort converts at full rate and the judgment is already there. AI shows up as speed rather than as a higher ceiling.',
    budget: 'No special review. Give them the ambiguous version of the problem.',
  },
  80: {
    verdict: 'Expect strong work with one specific blind spot.',
    detail: 'One step around the ring. Close enough that most of the craft transfers, far enough that the corner-specific judgment is thinner than it looks.',
    budget: 'A light review from a native, aimed at the blind spot rather than at the whole thing.',
  },
  60: {
    verdict: 'Expect competent output that genuinely needs review.',
    detail: 'Two steps out. They will produce something reasonable and will not be able to tell you where it is weak, because that read takes years in the corner.',
    budget: 'Real review time from a native, scheduled rather than hoped for.',
  },
  40: {
    verdict: 'Expect something that ships and looks approximately right.',
    detail: 'The opposite corner. They can produce, especially now, and they cannot grade what they produced. This is the gap that matters.',
    budget: 'Substantial review, and honesty that the review is the expensive part. Do not budget zero.',
  },
  0: {
    verdict: 'Do not expect this on request.',
    detail: 'There is no direct route into this corner. It shows up on top of a mastered corner plus something nobody trained, which means it cannot be assigned as a task.',
    budget: 'Nothing to budget. This one gets grown, or it does not happen.',
  },
};

/**
 * Full expectation for one person doing one kind of work.
 *
 * @param {string} affinityId  the corner their judgment came from
 * @param {string} workId      the corner the work sits in
 * @param {number} aiPct       0..100 AI assistance applied
 */
export function expectation(affinityId, workId, aiPct = 70) {
  const base = efficiency(affinityId, workId);
  const work = TYPE_BY_ID[workId];
  const self = TYPE_BY_ID[affinityId];
  const craft = CRAFT[workId];
  const f = FORECAST[base] ?? FORECAST[40];

  const out = withAI(base, aiPct, 'output');
  const judge = withAI(base, aiPct, 'judgment');
  const cold = Math.round(coldLevel(base));

  return {
    base,
    band: band(base),
    cold,
    output: out,
    judgment: judge,
    spread: out - judge,
    native: base === 100,
    locked: base === 0,
    verdict: f.verdict,
    detail: f.detail,
    budget: f.budget,
    self,
    work,
    brings: CRAFT[affinityId].brings,
    demands: craft.demands,
    misses: craft.judgment,
    tell: craft.tell,
    review: craft.review,
    aiLine: base === 100
      ? 'AI makes them faster here rather than better. They are already at their ceiling, and the ceiling is the whole job.'
      : base === 0
        ? 'AI has nothing to amplify. There is no starting affinity for it to scale.'
        : `AI carries their output from ${cold}% to ${out}% against a ceiling of ${base}%, and their judgment only to ${judge}%. More of it buys a faster climb to the same ceiling, never a higher one.`,
  };
}

// ── Crossings: affinity in one corner, working in another ────
// Named archetypes for the transitions people actually make. The
// rest fall back to a composed description.

const CROSSINGS = {
  'enhancement>manipulation': {
    name: 'The technical manager',
    reads: 'Strong on feasibility, estimates and unblocking. Trusted by engineers because you can still read the diff. The expensive half is the political one: reading a room, and noticing the objection nobody said out loud.',
  },
  'conjuration>manipulation': {
    name: 'The product-minded PM',
    reads: 'You argue from the user rather than the roadmap, and your specs are legible because you have had to build from bad ones. The expensive half is organisational: sequencing, and holding a commitment across three teams.',
  },
  'transmutation>manipulation': {
    name: 'The metrics-driven PM',
    reads: 'You will not accept a claim without a number behind it, which is rarer than it should be. The expensive half is that people are not a dataset, and the thing you most need to know is usually unmeasured.',
  },
  'emission>enhancement': {
    name: 'The platform-minded engineer',
    reads: 'You design for the failure before the feature, and your services are operable by default. The expensive half is product nuance: the correct system is not automatically the right one to build.',
  },
  'enhancement>emission': {
    name: 'The engineer who owns their deploys',
    reads: 'You understand the thing you are running because you wrote it, which shortens every incident. The expensive half is the blast radius of shared systems, where the failure is never confined to your service.',
  },
  'enhancement>conjuration': {
    name: 'The backend engineer on the frontend',
    reads: 'Your data flow is clean and your state management is sane. The expensive half is everything a user actually feels: hierarchy, empty states, and the difference between working and usable.',
  },
  'conjuration>enhancement': {
    name: 'The frontend engineer moving down the stack',
    reads: 'You keep the interface contract honest and your APIs are shaped for the people consuming them. The expensive half is what happens under concurrency and load, which the browser mostly hid from you.',
  },
  'manipulation>enhancement': {
    name: 'The manager going back to IC',
    reads: 'You scope well, you communicate, and you know which work matters. The expensive half is that depth atrophied while you were away, and the tooling moved without you.',
  },
  'transmutation>conjuration': {
    name: 'The data person building the dashboard',
    reads: 'The numbers on screen are correct and defensible, which is not the norm. The expensive half is that a correct chart nobody can read is still a failed chart.',
  },
  'emission>conjuration': {
    name: 'The infra engineer asked to do the website',
    reads: 'It will deploy cleanly, the build will be fast, and the thing will be up. The expensive half is the entire surface: this is the opposite corner, and the gap between shipped and good is where it shows.',
  },
};

/**
 * How an affinity reads when applied inside another corner.
 * Returns null when the two match, because that is not a crossing.
 */
export function crossing(affinityId, workId) {
  if (affinityId === workId) return null;
  const self = TYPE_BY_ID[affinityId];
  const work = TYPE_BY_ID[workId];
  const named = CROSSINGS[`${affinityId}>${workId}`];
  return {
    name: named?.name ?? `${self.short} judgment, ${work.short} work`,
    reads: named?.reads
      ?? `You bring ${CRAFT[affinityId].brings}. This corner mostly asks for ${CRAFT[workId].demands}. Expect the overlap to feel easy and the rest to cost more time than anyone budgeted.`,
    steps: (100 - efficiency(affinityId, workId)) / 20,
  };
}

// ── Getting more out of the assistant ────────────────────────
// The meter models ordinary use. Using AI well is a skill of its
// own, and it pays out in a specific order. Worth saying, because
// most people attempt these three steps backwards.

export const AI_LADDER = {
  lead: 'The calculator assumes ordinary use: an assistant open, prompting as you go. Getting more out of it than that is a skill in its own right, and it pays back in an order most people run backwards.',
  steps: [
    {
      n: 'First',
      h: 'Reinforce the corner you are already in',
      body: 'The largest return by a wide margin, and the step people skip because it feels less interesting than the others. Here you have the judgment to catch a bad suggestion, so speed compounds instead of quietly accumulating mistakes.',
    },
    {
      n: 'Then',
      h: 'Extend into what you could become',
      body: 'The corners either side of yours, where most of the craft already transfers. This is where an assistant genuinely substitutes for a chunk of training time, because you can still tell roughly when the output is wrong.',
    },
    {
      n: 'Last',
      h: 'Reach across the chart',
      body: 'Two steps out and beyond. It works, and it is the case this whole site is about: you reach your ceiling there quickly, and the ceiling does not move. Do it knowingly, with a native reviewing, rather than instead of hiring one.',
    },
  ],
  close: 'Skill with the tool changes how fast you climb. It does not change where the climb stops.',
};

/**
 * The test that separates "found my corner late" from "paying rent".
 * Deliberately about elapsed time rather than about talent.
 */
export const REVEAL_TEST = {
  question: 'You have been in the new corner two or three years. Is it still expensive?',
  cheap: {
    label: 'It got cheap',
    body: 'This corner was yours and the test just ran late. Nobody is born knowing their type; you find out by trying it. Most people who end up excellent managers did not start as managers, and that is not a contradiction. Re-read your chart with this corner at 100% and stop apologising for the years it took.',
  },
  costly: {
    label: 'It is still expensive',
    body: 'You are paying rent in someone else\'s corner, and it can absolutely still be worth it. What changes is planning: buy the judgment you lack by keeping a native close, and stop expecting the cost to disappear with one more year. It will not.',
  },
};
