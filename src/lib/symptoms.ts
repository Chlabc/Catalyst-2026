export const SYMPTOM_TAGS = [
  "Cramps",
  "Mood swings",
  "Fatigue",
  "Headache",
  "Bloating",
  "Heavy flow",
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
  "Heavy flow":
    "A higher-absorbency product, a spare change of clothes, and an extra layer overnight can help you feel more secure.",
};

// Short, factual "why is this happening" explanations — general body
// science, not personalized or diagnostic.
export const symptomWhy: Record<SymptomTag, string> = {
  Cramps:
    "Your uterus contracts to help shed its lining, which can press on nearby muscles — that's the cramping.",
  "Mood swings":
    "Hormone levels shift a lot across your cycle, which can affect mood — it's a real physical cause, not \"overreacting.\"",
  Fatigue:
    "Blood loss and hormone changes both take some energy — feeling more tired than usual is common.",
  Headache:
    "The same hormone shifts that affect mood can also trigger headaches for some people.",
  Bloating:
    "Hormone changes affect water retention, which is what causes that bloated feeling.",
  "Heavy flow":
    "Flow heaviness varies a lot person to person and cycle to cycle — it's usually normal, but worth mentioning to a doctor if it suddenly changes a lot.",
};

// Connects a logged symptom to the matching Menstrome Island mission
// (see src/lib/scenarios.ts) — ties the tracker back into the
// blueprint's own biome/scenario concept instead of leaving it isolated.
export const symptomToScenarioLevel: Partial<Record<SymptomTag, string>> = {
  Cramps: "cramper",
  "Heavy flow": "bloodbury",
};
