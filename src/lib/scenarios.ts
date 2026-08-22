export const COMPLETED_SCENARIOS_KEY = "blossom_completed_scenarios";
export const SEX_ED_DISCLAIMER = "We are not trying to replace sex education.";

/** Kept for leftover dialogue/player files; new towns use IslandTown. */
export type ScenarioChoice = {
  label: string;
  next: string;
};

export type ScenarioStep = {
  id: string;
  prompt: string;
  choices: ScenarioChoice[];
  closing?: string;
  showMessageGenerator?: boolean;
};

export type LibrarySituationFilter = "Sports" | "Overnight" | "First period";

export type MapAnchor = {
  /** Percent from the left edge of the island map image (0–100). */
  xPercent: number;
  /** Percent from the top edge of the island map image (0–100). */
  yPercent: number;
  /** Town name shown on the map pin. */
  label: string;
};

export type TownChoice = {
  label: string;
  correct: boolean;
  feedback: string;
};

export type MatchRound = {
  situation: string;
  options: string[];
  correct: string[];
  libraryFilter: LibrarySituationFilter;
  correctFeedback: string;
  incorrectFeedback: string;
};

export type TownDecision =
  | {
      kind: "choice";
      prompt: string;
      choices: TownChoice[];
    }
  | {
      kind: "log-day-one";
      prompt: string;
      buttonLabel: string;
      feedback: string;
      alreadyLoggedFeedback: string;
    }
  | {
      kind: "reflect";
      prompt: string;
      options: { label: string; feedback: string }[];
    }
  | {
      kind: "match-products";
      prompt: string;
      rounds: MatchRound[];
    };

export type TownReward = {
  badge: string;
  body: string;
  checklist?: { title: string; items: string[] };
};

export type IslandTown = {
  id: string;
  title: string;
  teaser: string;
  theme: string;
  visitOrder: number;
  map: MapAnchor;
  /** Swap this path when new town art lands. */
  regionArt: string;
  scenario: string;
  facts: string[];
  decision: TownDecision;
  reward: TownReward;
  /** Optional Product Library handoff after the reward. */
  libraryLink?: { filter: LibrarySituationFilter; label: string };
  /** Divursity closing moment for the whole island. */
  finale?: boolean;
};

/** @deprecated Use IslandTown — kept so older imports still type-check. */
export type ScenarioLevel = IslandTown;

export type ComingSoonZone = {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
};

export function libraryHref(filter?: LibrarySituationFilter | "All") {
  if (!filter || filter === "All") return "/library";
  return `/library?filter=${encodeURIComponent(filter)}`;
}

export const scenarioLevels: IslandTown[] = [
  {
    id: "bloodbury",
    title: "Bloodbury",
    theme: "What a period actually is",
    teaser: "You wake up and see blood. Before anything else — what IS this?",
    visitOrder: 1,
    map: { xPercent: 21, yPercent: 58, label: "Bloodbury" },
    regionArt: "/menstrome/regions/bloodbury-castle.png",
    scenario:
      "You wake up and see blood. Before anything else — what IS this, actually?",
    facts: [
      "The uterus lining builds up, then sheds if there is no pregnancy. That shedding is a period.",
      "Colour can be bright red through to brown because it mixes with tissue. That range is normal.",
      "Total blood volume is usually just a few tablespoons over several days — less than it looks.",
      "It is not an injury. It is a normal, healthy process.",
    ],
    decision: {
      kind: "choice",
      prompt:
        "Your friend says periods mean something's wrong with your body. Do you…",
      choices: [
        {
          label: "Agree — it does sound like something's wrong",
          correct: false,
          feedback:
            "Easy to think that, but a period is the body doing a planned job, not a sign you're broken.",
        },
        {
          label: "Explain what's actually happening",
          correct: true,
          feedback:
            "Yes. A period is the uterus lining shedding — a normal cycle, not an injury or a fault.",
        },
        {
          label: "Change the subject",
          correct: false,
          feedback:
            "You don't have to lecture anyone, but a short true answer can stop a myth spreading.",
        },
      ],
    },
    reward: {
      badge: "Biology Basics",
      body: "First petal unlocked. You know what a period is — that's the foundation for every other town.",
    },
  },
  {
    id: "cylendra",
    title: "Cylendra",
    theme: "The cycle and tracking",
    teaser: "Your period showed up and you have no idea when the next one is coming.",
    visitOrder: 2,
    map: { xPercent: 39, yPercent: 54, label: "Cylendra" },
    regionArt: "/menstrome/regions/moodswing-zoom.png",
    scenario:
      "Your period showed up and you have no idea when the next one is coming.",
    facts: [
      "A cycle runs from day 1 of one period to day 1 of the next. About 28 days is common — 21 to 35 is still normal, especially early on.",
      "Irregular cycles at first are common, not an automatic red flag.",
      "Tracking helps you guess the next one so it is less of a surprise.",
      "Symptoms often follow a pattern through the cycle. Logging makes that pattern easier to see.",
    ],
    decision: {
      kind: "log-day-one",
      prompt:
        "The tracker counts from day 1 — the first day of bleeding. Log today as day 1, live, so the tracker can start counting.",
      buttonLabel: "Log today as day 1",
      feedback:
        "Logged. Today is day 1 on your tracker. That's how it starts counting down to the next period.",
      alreadyLoggedFeedback:
        "You've already logged bleeding today — that already counts as day 1. That's the same move.",
    },
    reward: {
      badge: "Cycle Starter",
      body: "Your tracker is now watching this cycle. Open Tracker any day to keep the count going.",
    },
  },
  {
    id: "cramper",
    title: "Cramper",
    theme: "Pain and symptoms",
    teaser: "A dull ache — is it normal, or worth worrying about?",
    visitOrder: 3,
    map: { xPercent: 43, yPercent: 28, label: "Cramper" },
    regionArt: "/menstrome/regions/cramper-zoom.png",
    scenario:
      "You've got a dull ache and don't know if it's normal or worth worrying about.",
    facts: [
      "Cramps happen because the uterus contracts to help shed its lining. Mild to moderate pain is common.",
      "Heat, gentle movement, rest, and water can help.",
      "Other common symptoms: headaches, fatigue, mood changes, backache.",
      "Tell an adult if pain stops you doing normal things, or bleeding is unusually heavy.",
    ],
    decision: {
      kind: "choice",
      prompt: "Bad cramps in class — do you…",
      choices: [
        {
          label: "Push through silently",
          correct: false,
          feedback:
            "Pushing through can make the hour worse. Asking for a short rest is allowed.",
        },
        {
          label: "Tell a teacher or nurse and ask to rest or use heat",
          correct: true,
          feedback:
            "That's the move. A teacher or nurse can let you rest, use a heat pack, or step out. You don't have to prove you're in pain.",
        },
        {
          label: "Panic that something is seriously wrong",
          correct: false,
          feedback:
            "Cramps are usually the uterus doing its job. Panic isn't needed — but do tell an adult if it stops you functioning.",
        },
      ],
    },
    reward: {
      badge: "Comfort Kit",
      body: "You know when cramps are ordinary, and when to speak up.",
      checklist: {
        title: "Comfort kit",
        items: ["Heat pack", "Water bottle", "A snack", "A spare layer"],
      },
    },
  },
  {
    id: "stainvale",
    title: "Stainvale",
    theme: "Leaks and stains — zero shame",
    teaser: "You stand up and realise you've bled through your clothes.",
    visitOrder: 4,
    map: { xPercent: 64, yPercent: 58, label: "Stainvale" },
    regionArt: "/menstrome/regions/school-bathroom.png",
    scenario: "You stand up and realize you've bled through your clothes.",
    facts: [
      "This happens to almost everyone at some point. It feels bigger than it looks.",
      "Tie a jacket or hoodie around your waist, or ask for a spare layer. Schools often have options.",
      "Use cold water first on a stain — hot water can set it — then wash as usual.",
      "A tiny emergency kit (spare underwear, a product, wipes, a dark spare layer) removes most of the panic in advance.",
    ],
    decision: {
      kind: "choice",
      prompt: "You notice a leak in class — do you…",
      choices: [
        {
          label: "Freeze and hope no one notices",
          correct: false,
          feedback:
            "Freezing makes the next ten minutes harder. A quiet, practical move works better.",
        },
        {
          label: "Calmly tie something around your waist and ask to go to the bathroom",
          correct: true,
          feedback:
            'Yes. You can say: "I need to go to the bathroom — it\'s a period thing. Can I take my bag?" Most teachers have heard that before.',
        },
        {
          label: "Tell everyone loudly",
          correct: false,
          feedback:
            "You don't owe the whole room a speech. A quiet ask is enough.",
        },
      ],
    },
    reward: {
      badge: "Unshakeable",
      body: "This is the strongest badge on the island — leaks were the #1 fear in the original survey. You've got a plan.",
      checklist: {
        title: "Emergency kit",
        items: [
          "Spare underwear",
          "A period product",
          "Wipes or tissues",
          "A dark spare layer or hoodie",
        ],
      },
    },
    libraryLink: {
      filter: "Overnight",
      label: "See overnight product options",
    },
  },
  {
    id: "flowstate",
    title: "FlowState",
    theme: "Daily life, school, activity",
    teaser: "PE is today and your period just started. Do you skip it?",
    visitOrder: 5,
    map: { xPercent: 66, yPercent: 32, label: "FlowState" },
    regionArt: "/menstrome/regions/school-zoom.png",
    scenario:
      "You have PE today and your period just started. Do you skip it?",
    facts: [
      "You can do almost any normal activity, including sport. A period does not have to stop your day.",
      "Movement can help cramps rather than make them worse.",
      "Different products suit different activity levels — you get to choose.",
      "Mood and energy dips are common, and they are okay.",
    ],
    decision: {
      kind: "choice",
      prompt: "PE is today — do you…",
      choices: [
        {
          label: "Fake sick",
          correct: false,
          feedback:
            "You can sit out if you feel awful — but skipping automatically teaches your brain that periods cancel the day.",
        },
        {
          label: "Go, and adjust your product or plan beforehand",
          correct: true,
          feedback:
            "That's the confidence move. Check your product, maybe add a backup, then join in. You can still sit out a drill if pain hits.",
        },
        {
          label: "Go but stay anxious the whole time",
          correct: false,
          feedback:
            "Showing up helps — a quick product check first usually calms the anxious loop.",
        },
      ],
    },
    reward: {
      badge: "Confidence",
      body: "Your confidence meter fills a bit. Periods can share the day with sport, class, and plans.",
    },
    libraryLink: {
      filter: "Sports",
      label: "See sports product options",
    },
  },
  {
    id: "normain",
    title: "Normain",
    theme: "Normalising and talking about it",
    teaser: "You want to tell a parent or guardian — but how do you bring it up?",
    visitOrder: 6,
    map: { xPercent: 53, yPercent: 44, label: "Normain" },
    regionArt: "/menstrome/regions/sleepover-bedroom.png",
    scenario:
      "You want to tell your mum, dad, or guardian you got your period but don't know how to bring it up.",
    facts: [
      "Periods are common — roughly half the world's population has one at some point.",
      "It's okay to tell a parent, guardian, school nurse, or another trusted adult.",
      "Most worrying stories are myths: you can't wash a period away, and it isn't dirty.",
      "There is no one right way to tell someone. A text, or just asking for a product, both count.",
    ],
    decision: {
      kind: "reflect",
      prompt:
        "Who's someone you could tell, or ask for help? This isn't graded — pick whatever feels closest.",
      options: [
        {
          label: "A parent, guardian, or adult at home",
          feedback:
            "They can help with products, pain, and the practical stuff. A short text still counts as telling.",
        },
        {
          label: "A school nurse, teacher, or coach",
          feedback:
            "School adults deal with this more than it seems. You can keep it to one sentence.",
        },
        {
          label: "A trusted friend or older sibling",
          feedback:
            "A peer can sit with you while you figure out the next step. You can still loop in an adult after.",
        },
        {
          label: "I'm not sure yet — that's okay",
          feedback:
            "You don't have to pick someone today. Keep the script below for when you're ready.",
        },
      ],
    },
    reward: {
      badge: "Ask for Help",
      body: "You've got a script when you're ready. Use it, change it, or just ask for a product — all of those count.",
      checklist: {
        title: "How to ask for help",
        items: [
          "I got my period and I could use some help.",
          "Can we get pads or period underwear?",
          "I don't feel well — can I rest / go home / see the nurse?",
        ],
      },
    },
  },
  {
    id: "divursity",
    title: "Divursity",
    theme: "Products and different bodies",
    teaser: "Pads, tampons, cups, period underwear — what is any of this for?",
    visitOrder: 7,
    map: { xPercent: 84, yPercent: 40, label: "Divursity" },
    regionArt: "/menstrome/regions/village-zoom.png",
    scenario:
      "You're standing in a shop looking at pads, tampons, cups, and period underwear, and have no idea what any of them are for.",
    facts: [
      "Pad: sticks to underwear, nothing to insert, change every few hours. Tampon: worn inside, change every 4–8 hours, works for swimming. Cup: reusable silicone, can stay in longer, takes practice. Period underwear: looks like ordinary underwear with absorbent layers, wash and reuse.",
      "There is no single correct product. Flow, length, and comfort vary a lot person to person.",
      "Not everyone who menstruates identifies the same way, and not every family has a mum to ask — a dad, carer, or teacher can help too.",
      "If access is tight, ask a school nurse, a parent, or look up local free or low-cost period products.",
    ],
    decision: {
      kind: "match-products",
      prompt: "Match the product to the situation. More than one answer can be right.",
      rounds: [
        {
          situation: "Swimming today",
          options: ["Pad", "Tampon", "Cup", "Period underwear"],
          correct: ["Tampon", "Cup"],
          libraryFilter: "Sports",
          correctFeedback:
            "Tampons and cups stay put in water. Pads and period underwear usually don't.",
          incorrectFeedback:
            "For swimming, pick something worn inside — a tampon or a cup.",
        },
        {
          situation: "Heavy flow overnight",
          options: ["Pad", "Tampon", "Cup", "Period underwear"],
          correct: ["Pad", "Period underwear", "Cup"],
          libraryFilter: "Overnight",
          correctFeedback:
            "Overnight is about coverage and time. Pads, period underwear, and cups are the usual picks. Change tampons on time — don't sleep 12 hours on one.",
          incorrectFeedback:
            "Overnight needs longer coverage — a pad, period underwear, or a cup is the safer match.",
        },
      ],
    },
    reward: {
      badge: "Island Complete",
      body: "You finished Menstrome Island. You've got the basics — biology, tracking, pain, leaks, sport, talking, and products.",
    },
    finale: true,
  },
];

/** Alias for Learn copy that talks about towns. */
export const islandTowns = scenarioLevels;

/** Empty — every named town on the blueprint is playable. */
export const comingSoonZones: ComingSoonZone[] = [];
