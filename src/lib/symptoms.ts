export const SYMPTOM_TAGS = [
  "Cramps",
  "Mood swings",
  "Fatigue",
  "Headache",
  "Bloating",
] as const;

export type SymptomTag = (typeof SYMPTOM_TAGS)[number];

// General comfort tips, not medical advice — keep it that way. If
// symptoms feel severe, the app should point to a real person, not
// try to diagnose anything.
export const wellnessTips: Record<SymptomTag, string> = {
  Cramps:
    "A heat pack, gentle stretching, and staying hydrated can help ease cramps.",
  "Mood swings":
    "Totally normal — some rest, a comfort activity, or talking to someone can help.",
  Fatigue:
    "Extra rest and iron-rich foods (leafy greens, beans, lean meat) can help with energy.",
  Headache: "Staying hydrated and resting somewhere quiet and dim can help.",
  Bloating:
    "Light movement and cutting back on salty snacks for a day or two can sometimes ease it.",
};
