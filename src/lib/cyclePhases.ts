// General education only — everyone's cycle length varies, so these are
// framed as "roughly," not a personalized prediction. We only assert
// "you're likely in your menstrual phase" when there's an actual logged
// day to back it up (see Tracker.tsx).
export const cyclePhases = [
  {
    name: "Menstrual phase",
    days: "Roughly days 1-5",
    description:
      "Your period — the uterine lining sheds. Cramps and fatigue are common here.",
  },
  {
    name: "Follicular phase",
    days: "Roughly days 1-13",
    description:
      "Overlaps with your period. Your body starts preparing an egg, and energy often starts rising.",
  },
  {
    name: "Ovulation",
    days: "Around day 14",
    description:
      "An egg is released. Some people notice a small lift in energy or mood.",
  },
  {
    name: "Luteal phase",
    days: "Roughly days 15-28",
    description:
      "The lead-up to your next period — mood swings and cramps are most common here.",
  },
];
