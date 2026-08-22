export type FaqEntry = {
  q: string;
  a: string;
};

// Deliberately NOT an AI chatbot — pre-written, safe answers only.
export const FAQS: FaqEntry[] = [
  {
    q: "Is my data private?",
    a: "Yes — everything in the tracker is stored only on this device (localStorage). No account, no upload, nothing sent anywhere.",
  },
  {
    q: "How do I log my period?",
    a: "Go to Tracker, tap a day on the calendar to log it, then tag any symptoms or your mood for that day.",
  },
  {
    q: "What's Menstrome Island?",
    a: "It's the Learn section — short interactive scenarios you click through, based on real situations.",
  },
  {
    q: "What if something feels really wrong?",
    a: "Talk to a trusted adult, a school nurse, or a doctor. Kids Helpline (Australia): 1800 55 1800, free and 24/7.",
  },
];
