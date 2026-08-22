export type ScenarioChoice = {
  label: string;
  next: string;
};

export type ScenarioStep = {
  id: string;
  prompt: string;
  choices: ScenarioChoice[];
  // Only set on end steps (steps with no choices).
  closing?: string;
  // Show the trusted-adult message generator below the closing line.
  showMessageGenerator?: boolean;
};

// Add new scenarios by copying this shape into a new exported array.
// Each step is one screen; choices point at the `id` of the next step.
// A step with an empty choices array is an ending — give it a `closing`
// line instead.
export const firstPeriodScenario: ScenarioStep[] = [
  {
    id: "start",
    prompt:
      "You're at school and notice something in your underwear. What do you do?",
    choices: [
      { label: "Check what's going on", next: "check" },
      { label: "Ignore it and hope it goes away", next: "ignore" },
    ],
  },
  {
    id: "ignore",
    prompt: "It's still there, and now you're worried. What next?",
    choices: [{ label: "Okay, let's actually check", next: "check" }],
  },
  {
    id: "check",
    prompt: "You check — it looks like your first period. What now?",
    choices: [
      { label: "Tell a teacher or trusted adult", next: "tell" },
      { label: "Sort yourself out in the bathroom first", next: "bathroom" },
    ],
  },
  {
    id: "tell",
    prompt: "",
    choices: [],
    closing:
      "Good instinct — most schools have a nurse or a staff member with supplies on hand. Reaching out is exactly the right move.",
    showMessageGenerator: true,
  },
  {
    id: "bathroom",
    prompt: "In the bathroom, you realise you don't have any supplies. What now?",
    choices: [
      { label: "Ask a friend", next: "friend" },
      { label: "Text a trusted adult for help", next: "message" },
    ],
  },
  {
    id: "friend",
    prompt: "",
    choices: [],
    closing:
      "Asking a friend is completely normal — periods aren't something to be embarrassed about.",
  },
  {
    id: "message",
    prompt: "",
    choices: [],
    closing:
      "A quick message can save you from having to explain everything out loud. That's what it's there for.",
    showMessageGenerator: true,
  },
];

export const sleepoverScenario: ScenarioStep[] = [
  {
    id: "start",
    prompt:
      "You're at a sleepover and your period starts unexpectedly. What do you do?",
    choices: [
      { label: "Quietly ask the host's parent for a pad", next: "ask_parent" },
      { label: "Text your own parent to bring supplies", next: "message" },
    ],
  },
  {
    id: "ask_parent",
    prompt: "",
    choices: [],
    closing:
      "Most adults keep spares on hand or can grab some quickly — asking is completely normal, and probably not the first time they've been asked.",
  },
  {
    id: "message",
    prompt: "",
    choices: [],
    closing:
      "Sending a message means you don't have to explain the whole situation out loud in front of everyone.",
    showMessageGenerator: true,
  },
];

export const crampsScenario: ScenarioStep[] = [
  {
    id: "start",
    prompt: "You're at sports practice and cramps hit hard. What do you do?",
    choices: [
      { label: "Tell your coach you need a break", next: "tell_coach" },
      { label: "Push through quietly", next: "push_through" },
    ],
  },
  {
    id: "push_through",
    prompt: "It's getting worse. What now?",
    choices: [{ label: "Okay, let's tell the coach", next: "tell_coach" }],
  },
  {
    id: "tell_coach",
    prompt: "",
    choices: [],
    closing:
      "Coaches deal with this more than you'd think. A short break, some stretching, or a warm drink can genuinely help.",
  },
];

export const bloodburyScenario: ScenarioStep[] = [
  {
    id: "start",
    prompt: "You wake up with a heavier flow than usual. What do you do?",
    choices: [
      { label: "Switch to a higher-absorbency product", next: "switch" },
      { label: "Layer a pad with period underwear for extra backup", next: "layer" },
    ],
  },
  {
    id: "switch",
    prompt: "",
    choices: [],
    closing:
      "Good call — sizing up is exactly what higher-absorbency products are for, and it's completely normal for flow to vary.",
  },
  {
    id: "layer",
    prompt: "",
    choices: [],
    closing:
      "Layering for extra security is a solid approach, especially overnight — worth knowing for your heavier days.",
  },
];

export type MapAnchor = {
  /** Percent from the left edge of the island map image (0–100). */
  xPercent: number;
  /** Percent from the top edge of the island map image (0–100). */
  yPercent: number;
  /** Short zone label shown on the map pin. */
  label: string;
};

export type ScenarioLevel = {
  id: string;
  title: string;
  teaser: string;
  steps: ScenarioStep[];
  map: MapAnchor;
  /** Illustrated region backdrop from PADthai assets under /public/menstrome. */
  regionArt: string;
  /** Shown when you first enter the region, before the branching story. */
  arriveBlurb: string;
};

export type ComingSoonZone = {
  id: string;
  label: string;
  xPercent: number;
  yPercent: number;
};

// Level ids "cramper" and "bloodbury" match the island names from
// PADthai's own Menstrome Island biome map — see DIVERGENCE.md.
// Map anchors are percent positions on public/menstrome/island-playable.png
// (illustrated island from PADthai Track2.pdf / Figma).
export const scenarioLevels: ScenarioLevel[] = [
  {
    id: "first-period",
    title: "Your first period at school",
    teaser: "It happens somewhere you didn't expect. What now?",
    steps: firstPeriodScenario,
    map: { xPercent: 74, yPercent: 76, label: "School" },
    regionArt: "/menstrome/regions/school-zoom.png",
    arriveBlurb:
      "You arrive at the school side of the island. Something in your underwear doesn't feel right — this is where the mission begins.",
  },
  {
    id: "sleepover",
    title: "Your period at a sleepover",
    teaser: "Away from home, with no supplies on hand.",
    steps: sleepoverScenario,
    map: { xPercent: 50, yPercent: 80, label: "Village" },
    regionArt: "/menstrome/regions/village-zoom.png",
    arriveBlurb:
      "You reach the village by the docks. Away from your usual supplies, a familiar cramp of worry starts.",
  },
  {
    id: "cramper",
    title: "Cramper",
    teaser: "Pain hits mid-session at practice. Push through or speak up?",
    steps: crampsScenario,
    map: { xPercent: 32, yPercent: 52, label: "Cramper" },
    regionArt: "/menstrome/regions/cramper-zoom.png",
    arriveBlurb:
      "Practice is in full swing on the green hills of Cramper. Then the cramps arrive — hard.",
  },
  {
    id: "bloodbury",
    title: "Bloodbury",
    teaser: "A heavier flow morning. What's your move?",
    steps: bloodburyScenario,
    map: { xPercent: 62, yPercent: 36, label: "Bloodbury" },
    regionArt: "/menstrome/regions/bloodbury-biome.png",
    arriveBlurb:
      "You enter Bloodbury — the castle over the lava fields. Today's flow is heavier than usual.",
  },
];

/** Labeled Figma zones without a playable scenario yet — non-interactive pins. */
export const comingSoonZones: ComingSoonZone[] = [
  { id: "moodswing", label: "Moodswing", xPercent: 30, yPercent: 24 },
];
