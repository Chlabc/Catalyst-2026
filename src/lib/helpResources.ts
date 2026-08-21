export const HELP_CATEGORIES = [
  { id: "period-started", title: "My period started", description: "Simple first steps for bleeding, products, tracking, and getting support." },
  { id: "cramps-pain", title: "I have cramps or pain", description: "Work out what may help and when to ask someone for support." },
  { id: "heavy-bleeding", title: "I'm bleeding a lot", description: "Help understanding flow that feels heavier than expected." },
  { id: "late-irregular", title: "My period is late or irregular", description: "Support when periods do not arrive when you expect." },
  { id: "unusual", title: "Something feels unusual", description: "A place to start when something feels different or hard to explain." },
  { id: "worried-unsure", title: "I'm worried or not sure", description: "Reassurance when you are unsure what question to ask." },
] as const;

export const PAIN_LEVELS = [
  {
    id: "a-little",
    label: "A little uncomfortable",
    description: "I can still do the things I normally do.",
  },
  {
    id: "affecting-my-day",
    label: "It's affecting what I normally do",
    description: "It is making school, sleep, or everyday activities harder.",
  },
  {
    id: "difficult-to-manage",
    label: "Very difficult to manage",
    description: "The pain feels overwhelming or very hard to cope with.",
  },
] as const;
export type PainLevel = (typeof PAIN_LEVELS)[number]["label"];

export const HELP_SERVICES = [
  { id: "pharmacy", label: "Pharmacy" },
  { id: "gp", label: "GP / doctor" },
  { id: "sexual-health-clinic", label: "Sexual health clinic" },
  { id: "other-health-service", label: "Other health service" },
] as const;

export const DIRECT_HELP_SERVICES = HELP_SERVICES.filter(
  (service) => service.id === "pharmacy" || service.id === "gp",
);

export type HelpServiceType = (typeof HELP_SERVICES)[number]["id"];

export function isHelpServiceType(value: string | undefined): value is HelpServiceType {
  return HELP_SERVICES.some((service) => service.id === value);
}
