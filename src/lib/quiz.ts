export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

// Base these on real myths from your team's interview/questionnaire data
// where you have it — replace the placeholders below with the actual
// ones your research surfaced. Add more by extending this array.
export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "Can you swim while on your period?",
    options: ["Yes, totally fine", "No, never"],
    correctIndex: 0,
    explanation:
      "Yes — using a tampon, cup, or disc, swimming is completely fine. Pads aren't ideal for swimming since they absorb water.",
  },
  {
    id: "q2",
    question: "Is it normal for periods to be irregular in the first year or two?",
    options: ["Yes, very common", "No, something's wrong"],
    correctIndex: 0,
    explanation:
      "Very common — it can take a couple of years for cycles to settle into a regular rhythm. Irregularity early on isn't usually a cause for concern.",
  },
  {
    id: "q3",
    question: "Do you lose a dangerous amount of blood during a period?",
    options: ["Yes, it's a lot", "No, it's usually just a few tablespoons"],
    correctIndex: 1,
    explanation:
      "It looks like more than it is — average blood loss over an entire period is only about 2-3 tablespoons.",
  },
  {
    id: "q4",
    question: "Can you exercise or play sports on your period?",
    options: ["Yes, it's fine and can even help with cramps", "No, you should rest completely"],
    correctIndex: 0,
    explanation:
      "Light to moderate exercise is not just fine but can actually ease cramps for a lot of people.",
  },
];
