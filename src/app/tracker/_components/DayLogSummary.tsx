import type { DailyLog } from "../_types/tracker";

const symptomLabels: Record<string, string> = {
  cramps: "Cramps",
  headache: "Headache",
  bloating: "Bloating",
  acne: "Acne",
  breastTenderness: "Breast tenderness",
  backPain: "Back pain",
  fatigue: "Fatigue",
  nausea: "Nausea",
};

const moodLabels: Record<string, string> = {
  happy: "Happy",
  calm: "Calm",
  sensitive: "Sensitive",
  anxious: "Anxious",
  irritated: "Irritated",
  sad: "Sad",
  stressed: "Stressed",
};

export function DayLogSummary({ log }: { log?: DailyLog }) {
  if (!log) {
    return (
      <div className="rounded-[1.75rem] border border-white bg-white/70 p-4 shadow-[0_12px_32px_rgba(255,107,157,0.09)] backdrop-blur">
        <p className="text-sm font-bold text-[#2B2B34]">Today summary</p>
        <p className="mt-1 text-sm leading-6 text-[#6B6B78]">
          Use the quick panel to capture flow, symptoms, mood, and notes when it
          feels useful.
        </p>
      </div>
    );
  }

  const summaryItems = [
    log.periodFlow !== "none" ? `${log.periodFlow} flow` : "No period logged",
    ...log.symptoms.slice(0, 3).map((symptom) => symptomLabels[symptom]),
    ...log.moods.slice(0, 2).map((mood) => moodLabels[mood]),
  ].filter(Boolean);

  return (
    <div className="rounded-[1.75rem] border border-white bg-white/74 p-4 shadow-[0_12px_32px_rgba(255,107,157,0.09)] backdrop-blur">
      <p className="text-sm font-bold text-[#2B2B34]">Today summary</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {summaryItems.map((item) => (
          <span
            key={item}
            className="rounded-2xl bg-[#FFF0F6] px-3 py-2 text-center text-xs font-bold text-[#7A1241] ring-1 ring-[#FFD7EA]"
          >
            {item}
          </span>
        ))}
      </div>
      {log.notes && <p className="mt-3 text-sm text-[#6B6B78]">{log.notes}</p>}
    </div>
  );
}
