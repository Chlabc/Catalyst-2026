"use client";

import Link from "next/link";
import type { CyclePrediction, Mood, Symptom, TrackerState } from "../_types/tracker";
import { phaseLabels } from "../_lib/cyclePredictions";
import { formatShortDate } from "../_lib/dateUtils";

const symptomLabels: Record<Symptom, string> = {
  cramps: "Cramps",
  headache: "Headache",
  bloating: "Bloating",
  acne: "Acne",
  breastTenderness: "Breast tenderness",
  backPain: "Back pain",
  fatigue: "Fatigue",
  nausea: "Nausea",
};

const moodLabels: Record<Mood, string> = {
  happy: "Happy",
  calm: "Calm",
  sensitive: "Sensitive",
  anxious: "Anxious",
  irritated: "Irritated",
  sad: "Sad",
  stressed: "Stressed",
};

function mostCommon<T extends string>(values: T[]): T | undefined {
  if (values.length === 0) return undefined;
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

/** Pattern snapshot — lives on Health report (not the Tracker tab). */
export function PatternsCard({
  trackerState,
  prediction,
}: {
  trackerState: TrackerState;
  prediction: CyclePrediction;
}) {
  const logs = Object.values(trackerState.logs);
  const periodDays = logs.filter((log) => log.periodFlow !== "none").length;
  const topSymptom = mostCommon(logs.flatMap((log) => log.symptoms));
  const topMood = mostCommon(logs.flatMap((log) => log.moods));
  const phaseLabel = phaseLabels[prediction.estimatedPhase];

  return (
    <section
      className="rounded-2xl border border-[#E8DCE2] bg-white/85 p-4 shadow-sm"
      data-testid="patterns-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#A04464]">
            Your patterns
          </p>
          <h2 className="mt-1 text-lg font-bold text-[#241B21]">
            Quick snapshot
          </h2>
        </div>
        <Link
          href="/tracker"
          className="rounded-full border border-[#E2C4D0] bg-[#FFF7FA] px-3 py-1.5 text-xs font-bold text-[#A43C61] transition hover:bg-[#FFF0F5]"
        >
          Open tracker
        </Link>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-[#F5EAF9] px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-[#6E6168]">Phase</dt>
          <dd className="mt-0.5 font-bold text-[#241B21]">{phaseLabel}</dd>
        </div>
        <div className="rounded-xl bg-[#FFF0F4] px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-[#6E6168]">Next period</dt>
          <dd className="mt-0.5 font-bold text-[#241B21]">
            {formatShortDate(prediction.predictedNextPeriod)}
          </dd>
        </div>
        <div className="rounded-xl bg-[#FFF4DF] px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-[#6E6168]">Top symptom</dt>
          <dd className="mt-0.5 font-bold text-[#241B21]">
            {topSymptom ? symptomLabels[topSymptom] : "Not enough yet"}
          </dd>
        </div>
        <div className="rounded-xl bg-[#E8F4EF] px-3 py-2">
          <dt className="text-[10px] font-bold uppercase text-[#6E6168]">Top mood</dt>
          <dd className="mt-0.5 font-bold text-[#241B21]">
            {topMood ? moodLabels[topMood] : "Not enough yet"}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-[#6E6168]">
        {periodDays} period day{periodDays === 1 ? "" : "s"} logged ·{" "}
        {logs.length} check-in{logs.length === 1 ? "" : "s"} total. Download a PDF
        below when you want a summary for a GP or pharmacist.
      </p>
    </section>
  );
}
