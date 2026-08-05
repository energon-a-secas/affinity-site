// ── Questions worth answering ────────────────────────────────
// Every answer is split in two: what the objection gets right, and
// what survives it. Rendering those as separate blocks keeps the
// section from turning into six screens of undifferentiated prose,
// and it forces each answer to concede something real first.

export const USE_GUIDE = {
  do: [
    ['Read it about yourself', 'Privately, and stop there.'],
    ['Name a cost you already felt', 'If a stretch assignment was three times harder than it looked, this is trying to explain that.'],
    ['Argue for depth', 'When someone is pushing you sideways for market reasons rather than for the work.'],
    ['Price a move in years', 'Then make it anyway if you want the work. A price is information, not a veto.'],
    ['Keep the question, drop the number', 'Where does your effort currently convert best?'],
  ],
  dont: [
    ['Do not type another person', 'Not your reports, not your candidates, not your co-founder.'],
    ['Keep it out of process', 'No interviews, scorecards, calibrations, or performance reviews.'],
    ['Do not block a move with it', 'Not a transfer, not a role change, not a promotion.'],
    ['Do not talk yourself out of something', 'Expensive is not the same as impossible.'],
    ['Do not quote the percentages as findings', 'Nothing here measured anything.'],
  ],
};

export const FAQ = [
  {
    group: 'Is this real',
    items: [
      {
        q: 'This is a horoscope for engineers.',
        concede: 'Structurally, yes. Six flattering categories, self-selected membership, and descriptions general enough that you will recognise yourself in three of them.',
        hold: 'What survives is the claim underneath: skill transfer between kinds of engineering work is uneven, and more expensive than the people recommending a switch admit. Test that against your own last three years and ignore the part that reads like a personality profile.',
      },
      {
        q: 'What would prove this wrong?',
        concede: 'Nothing has been tested, so the honest status is unfalsified because untested, which is much weaker than a diagram makes it look.',
        hold: 'Three things would do it. Cross-corner switchers reaching senior output as fast as adjacent ones. AI closing the judgment gap rather than the output gap. And people retaking the quiz in six months at chance rates.',
      },
      {
        q: 'Where do 100, 80, 60 and 40 come from?',
        concede: 'A manga. Togashi picked round numbers so a fight scene would have stakes, and nobody has measured a frontend engineer working in a backend codebase against a control group.',
        hold: 'Read them as an ordering rather than a measurement. 80 means next easiest, 40 means hardest of the five. If you need a real number for a real decision, get it from your own team.',
      },
      {
        q: 'Why take career advice from a shonen manga?',
        concede: 'You should not. Prediction is not on offer here.',
        hold: 'What the hexagon gives you is shared vocabulary for a conversation most teams have badly: why the same person is excellent at one kind of work and mediocre at another, without either fact being about effort.',
      },
    ],
  },
  {
    group: 'Does it trap you',
    items: [
      {
        q: 'I did not start as a manager and I am a good one now. Where does that fit?',
        concede: 'The old version of this model had no answer, and implied you were secretly always a manager, which is unfalsifiable and slightly insulting.',
        hold: 'Affinity and role are separate layers now. Nobody is born knowing their corner; you find it by trying things, and the test can run twenty years late. If management got cheap after two or three years, it was your corner and you found it late. If it is still expensive, you are paying rent, which can still be the right trade.',
      },
      {
        q: 'So a developer cannot easily become a PM?',
        concede: 'Nothing here says that, and if the chart reads that way the chart is at fault. Developer to PM is one of the most common moves in the industry and it works.',
        hold: 'The model predicts what kind of PM you will be rather than whether you can be one. A backend engineer turned PM is strong on feasibility, estimates, and unblocking, and finds the political half expensive. That is a useful forecast. It is not a gate.',
      },
      {
        q: 'Nen type is fixed at birth. Careers are not.',
        concede: 'Still the biggest crack, and the two-layer split narrows it rather than closing it. The analogy leaks here and it is worth saying so.',
        hold: 'The defensible version: at any moment there is a corner where your effort converts cheaply and one where it converts expensively. That gradient is real, it is measurable in your own calendar, and it moves. Re-check every couple of years rather than treating one reading as permanent.',
      },
      {
        q: 'So you are telling me not to switch?',
        concede: 'If any part of this reads as permission to quit something you want, that is the model failing rather than the model working.',
        hold: 'Today\'s percentage is a ceiling. The price of raising it is years, and years are available to you. Switching is slower and stalls more often than the advice around you admits, which is a reason to budget for it rather than a reason to stop. The warning is aimed at people fleeing toward a hiring market they do not want to work in.',
      },
      {
        q: 'Is "find your corner" just permission to stop learning?',
        concede: 'Some people will use it that way, and that risk is bigger than the one this site warns about.',
        hold: 'Adjacent corners are the highest-return thing you can learn, which is exactly why they sit at 80 and not at 40. If the model ever feels like cover for skipping the thing you avoid, you are using it wrong.',
      },
    ],
  },
  {
    group: 'What AI actually does',
    items: [
      {
        q: 'I am a backend dev and I shipped a real UI with AI. Your 40% is wrong.',
        concede: 'You probably did ship it and it probably works. Pretending otherwise is how this model would lose the argument.',
        hold: 'What changed is how fast you arrived, not how high. You reached the ceiling this pairing allows in a week rather than in three years, and that is the genuinely new part. You can produce a component now. You still cannot reliably tell which of three layouts confuses people, or catch the accessibility failure, because that read comes from having been wrong in the domain many times.',
      },
      {
        q: 'AI gives me judgment too. It flags the accessibility issue.',
        concede: 'Sometimes it does, and any honest version of this has to admit that.',
        hold: 'What it cannot do is tell you reliably when it is wrong, which is the exact function the domain experience was buying. In your own corner you catch the bad suggestion. In someone else\'s you ship it.',
      },
      {
        q: 'What is the precise version of the AI claim?',
        concede: 'Smaller than "AI cannot help you", which is false and lazy.',
        hold: 'AI compresses the time from intent to artifact almost everywhere, and the time from artifact to correct judgment almost nowhere. Cross-corner work got much cheaper to attempt and roughly as expensive to get right.',
      },
      {
        q: 'Will AI make a weak performer into a strong one?',
        concede: 'It will make their output look considerably better, and that is genuinely new. Volume, polish, and speed all move.',
        hold: 'At best it enhances the corner they already have and makes the next corner over reachable. It does not manufacture the judgment that separates shipping something from shipping something good, so expect a more polished version of the same blind spot rather than a different person.',
      },
    ],
  },
  {
    group: 'The six corners',
    items: [
      {
        q: 'Where do I sit if I am a security engineer?',
        concede: 'One title spans three corners here, which tells you the model sorts activities rather than job titles.',
        hold: 'Exploit development and red team work is Transmutation: an exploit gives an input a property it was never meant to have. AppSec review and hardening is Enhancement. GRC and compliance is Manipulation, because you write the conditions everyone else operates under.',
      },
      {
        q: 'What about QA, mobile, DevRel, designers and technical writers?',
        concede: 'Most land on edges between two corners, and six corners cannot hold thirty job families.',
        hold: 'The bigger gap is that every corner here points inward at a product or a team. Nothing points outward at a customer, a market, or a community, so sales engineering, developer relations and founding have nowhere to sit at all.',
      },
      {
        q: 'Calling management "Manipulation" is a shot at managers.',
        concede: 'The word does real damage in English and there is no getting around it. That is why the chart shows tech roles by default and keeps the Nen names one click away.',
        hold: 'In the manga it means directing something under set conditions. That mechanic, setting conditions and accepting binding limits in exchange for reach, is a flattering and accurate description of good management.',
      },
      {
        q: 'My corner changed when I joined a smaller company.',
        concede: 'A genuine hole. Six distinct corners only exist at a company big enough to have six distinct teams.',
        hold: 'At a six-person startup you are all of them at once, and the useful question becomes which corner you reach for first when everything is on fire. Company stage probably explains more of your week than temperament does.',
      },
    ],
  },
  {
    group: 'The Specialist corner',
    items: [
      {
        q: 'You are telling people they can never be an architect.',
        concede: 'If that is how it reads, the copy has failed, because it is both false and cruel.',
        hold: 'The 0% is canon and it describes the absence of a direct path, not a limit on a person. You cannot aim at this corner, which is what people do for the title. It shows up on top of a corner you already mastered.',
      },
      {
        q: 'Is this not just a subject matter expert?',
        concede: 'They overlap enough that the distinction sounds like special pleading, and plenty of people this chart would call Specialist are simply experienced.',
        hold: 'An SME is made by years on one subject, and that route is open to anyone willing to spend them. This corner is the one with no such route, which is the only reason it sits at 0% rather than at 40%. If you can name the training that produces it, it belongs in one of the other five.',
      },
      {
        q: 'Is Specialist just a fancy word for senior?',
        concede: 'Often, yes, and this model does not separate the two. Much of what looks like innate systems judgment is pattern recognition bought by being wrong in public for a decade.',
        hold: 'Seniority belongs on its own axis, and the model is missing it. A principal engineer and a new grad both read as 100% in their corner, which tells you what the chart cannot see.',
      },
      {
        q: 'The author gave himself the highest-status box.',
        concede: 'He did, and you should discount the argument accordingly. Self-assigned Specialist is the same move as everyone who takes a personality test and lands on the rare type.',
        hold: 'The only version of that claim worth anything is the one other people make about you, from work they saw, without this framework in front of them.',
      },
    ],
  },
  {
    group: 'Could this do harm',
    items: [
      {
        q: 'My manager is going to read this and start typing the team.',
        concede: 'That is the most likely real harm from publishing it, and a footer line is not a defence.',
        hold: 'One rule covers it: this is a first-person instrument. If somebody else assigned you a corner, they misused it. Anything self-reported and unvalidated becomes a weapon once someone with power over your compensation applies it to you.',
      },
      {
        q: 'How is this different from MBTI?',
        concede: 'Not different in kind, and MBTI\'s failure mode is exactly the one to expect: built for self-understanding, then leaked into hiring where its reliability could not carry the weight.',
        hold: 'Which is the argument for keeping it out of process entirely. Screening candidates or setting ratings with an unvalidated personality-style instrument is a bad idea well before you reach the legal problems.',
      },
      {
        q: 'Can you turn a copyrighted power system into career advice?',
        concede: 'Fair to ask. Hunter x Hunter and Nen are the work of Yoshihiro Togashi, published by Shueisha, and this site is unaffiliated.',
        hold: 'Commentary using a published work\'s concepts and character names, while reproducing no art or text, is the ordinary shape of criticism and fan writing. Nothing from the series is reproduced here.',
      },
    ],
  },
];
