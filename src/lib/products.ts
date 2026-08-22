export type Product = {
  id: string;
  name: string;
  type: "Pad" | "Tampon" | "Cup" | "Disc" | "Period Underwear";
  description: string;
  pros: string[];
  cons: string[];
  goodFor: string[]; // e.g. "First period", "Sports", "Overnight"
};

// Add more by extending this array — ProductLibrary renders whatever's
// here, no component changes needed.
export const products: Product[] = [
  {
    id: "pad",
    name: "Pad",
    type: "Pad",
    description: "Sticks to your underwear. No insertion — usually the easiest starting point.",
    pros: ["Easy to use", "Nothing to insert", "Easy to check if it needs changing"],
    cons: ["Can feel bulky", "Not ideal for swimming"],
    goodFor: ["First period", "Overnight", "Light days"],
  },
  {
    id: "tampon",
    name: "Tampon",
    type: "Tampon",
    description: "Worn inside, with a string for removal. More discreet under fitted clothing.",
    pros: ["Discreet", "Works for swimming", "Good for sports"],
    cons: ["Needs practice to insert comfortably", "Must be changed every 4-8 hours"],
    goodFor: ["Sports", "Swimming"],
  },
  {
    id: "cup",
    name: "Menstrual Cup",
    type: "Cup",
    description: "A reusable silicone cup worn inside. Rinse and reuse.",
    pros: ["Reusable — cheaper over time", "Can be worn up to 12 hours", "Less waste"],
    cons: ["Learning curve to insert/remove", "Needs cleaning between cycles"],
    goodFor: ["Overnight", "Sports", "Longer wear"],
  },
  {
    id: "disc",
    name: "Menstrual Disc",
    type: "Disc",
    description: "Sits at the base of the cervix rather than in the canal. Some people find it more comfortable during exercise.",
    pros: ["Can be worn during any activity", "Some brands are disposable, some reusable"],
    cons: ["Trickier removal for beginners", "Less widely available"],
    goodFor: ["Sports", "Overnight"],
  },
  {
    id: "underwear",
    name: "Period Underwear",
    type: "Period Underwear",
    description: "Regular-feeling underwear with built-in absorbent layers.",
    pros: ["Comfortable, no insertion", "Reusable", "Good as backup with another product"],
    cons: ["Needs handwashing/laundering care", "Higher upfront cost"],
    goodFor: ["First period", "Overnight", "Light days", "Backup"],
  },
];
