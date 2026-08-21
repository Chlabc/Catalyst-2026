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
