// ── About: what this is, and where the chart came from ───────
// The introduction used to be a hero block on the model page, which
// spent most of a screen before anyone reached the hexagon. It lives
// here instead, and shows once as a popup on a first visit.

export const INTRO = {
  eyebrow: 'Expectation setting',
  title: 'Know the affinity, know what to expect.',
  lead: 'Six kinds of engineering work sit on a hexagon. You run at full rate in your own corner and shed about 20% for every step away from it. The number is not a verdict on anyone. It is a forecast: what lands, what gets missed, and how much review to budget.',
  punch: 'AI does not turn someone who was not proficient into a machine. At best it sharpens the corner they already have, and puts the next corner over within reach.',
  how: [
    'Click a corner to set your affinity, the corner your judgment came from.',
    'Shift-click a second corner to set the work you are currently doing.',
    'The panel beside the chart reads the gap between them.',
  ],
};

// ── Provenance ───────────────────────────────────────────────
// The percentages are borrowed wholesale. Saying exactly what was
// borrowed, and from where, is cheaper than being caught pretending
// they were derived.

export const ORIGIN = {
  lead: 'Hunter x Hunter sorts aura into six categories and seats them on a hexagon. Your own category runs at 100%. Proficiency in every other one falls with distance around the ring, so the categories next to yours stay close and the one across from you is the furthest thing you can attempt.',
  steps: [
    ['Your own corner', '100%', 'Where the aura came from. Effort converts at full rate.'],
    ['One step around', '80%', 'The two neighbours, either side.'],
    ['Two steps around', '60%', 'Still on the chart, and noticeably harder.'],
    ['The opposite corner', '40%', 'Three steps, the far side of the hexagon.'],
    ['Specialization', '0%', 'The exception. There is no route in by stepping around the ring.'],
  ],
  canon: 'The manga states the exception rather than implying it. Its own efficiency chart puts a Conjurer at 100 for Conjuration, 80 and 60 either side, 40 at the opposite corner, and 0 for Specialization.',
  swap: 'That is the entire borrowed mechanic, and the arithmetic here is unchanged. The only thing this site swapped is the labels: six kinds of engineering work in place of six kinds of aura.',
};

export const SOURCES = [
  {
    name: 'Nen Type Compatibility Chart',
    host: 'hunterxnen.com',
    url: 'https://www.hunterxnen.com/nen/compare',
    note: 'Interactive. Pick a category and see it against the other five. It runs a 100 / 60 / 40 / 20 scale rather than the manga\'s, so take the ordering from it and the numbers from the panel above.',
  },
  {
    name: 'All the Nen types in Hunter x Hunter explained',
    host: 'wikiHow',
    url: 'https://www.wikihow.com/Nen-Types',
    note: 'A longer walk through the six categories, water divination, and what each one is understood to be good at.',
  },
];

/** Bands worth showing in the reading key, strongest first. */
export const BAND_KEYS = [100, 80, 60, 40, 0];

/**
 * The one reconciliation the model needs stated out loud, because
 * the two halves of the site look like they contradict each other:
 * the calculator draws a hard wall, and the objections page insists
 * the number is a price rather than a limit.
 */
export const TWO_READINGS = {
  lead: 'A percentage here reads two ways, and both are true at once. Most arguments about this chart are really arguments about which of the two someone had in mind.',
  now: {
    label: 'Today, it is a ceiling',
    body: 'It is the best you can currently do in that corner. No tool raises it. This is the reading the calculator draws, and it is why an assistant gets you to 40% quickly and leaves you there.',
  },
  later: {
    label: 'Over years, it is a price',
    body: 'Training moves your affinity, slowly, and the number moves with it. This is the reading the rest of the site uses, and it is why nothing here says you cannot become something.',
  },
  close: 'AI changes how fast you reach today\'s ceiling. It does nothing at all to the price of raising it.',
};
