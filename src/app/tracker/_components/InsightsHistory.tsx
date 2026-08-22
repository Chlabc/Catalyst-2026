"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  CyclePrediction,
  DailyLog,
  Mood,
  Symptom,
  TrackerState,
} from "../_types/tracker";
import { phaseLabels } from "../_lib/cyclePredictions";
import { formatLongDate, formatShortDate } from "../_lib/dateUtils";

type InsightCategory = "cycle" | "symptoms" | "mood" | "rest";

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

export function InsightsHistory({
  trackerState,
  prediction,
  onOpenLog,
  onOpenCalendar,
}: {
  trackerState: TrackerState;
  prediction: CyclePrediction;
  onOpenLog: (date: string) => void;
  onOpenCalendar: () => void;
}) {
  const [openCategory, setOpenCategory] = useState<InsightCategory | null>(null);
  const logs = useMemo(
    () => Object.values(trackerState.logs).sort((a, b) => b.date.localeCompare(a.date)),
    [trackerState.logs],
  );
  const periodLogs = logs.filter((log) => log.periodFlow !== "none");
  const symptomEntries = logs.flatMap((log) => log.symptoms);
  const moodEntries = logs.flatMap((log) => log.moods);
  const topSymptom = mostCommon(symptomEntries);
  const topMood = mostCommon(moodEntries);
  const sleepLogs = logs.filter((log) => log.sleep);
  const phaseLabel = phaseLabels[prediction.estimatedPhase];

  useEffect(() => {
    if (!openCategory) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenCategory(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openCategory]);

  const cards: {
    key: InsightCategory;
    eyebrow: string;
    title: string;
    detail: string;
    icon: string;
    tone: string;
  }[] = [
    {
      key: "cycle",
      eyebrow: "Cycle rhythm",
      title: `${prediction.averageCycleLength} day average`,
      detail: `${periodLogs.length} period day${periodLogs.length === 1 ? "" : "s"} logged`,
      icon: "◔",
      tone: "bg-[#F5EAF9]",
    },
    {
      key: "symptoms",
      eyebrow: "Body patterns",
      title: topSymptom ? symptomLabels[topSymptom] : "No pattern yet",
      detail: `${symptomEntries.length} symptom entr${symptomEntries.length === 1 ? "y" : "ies"}`,
      icon: "✿",
      tone: "bg-[#FFF0F4]",
    },
    {
      key: "mood",
      eyebrow: "Mood",
      title: topMood ? moodLabels[topMood] : "No pattern yet",
      detail: `${moodEntries.length} mood${moodEntries.length === 1 ? "" : "s"} saved`,
      icon: "☺",
      tone: "bg-[#FFF4DF]",
    },
    {
      key: "rest",
      eyebrow: "Rest & energy",
      title: sleepLogs.length ? `${sleepLogs.length} sleep check-ins` : "No pattern yet",
      detail: `${logs.filter((log) => log.energy).length} energy check-ins`,
      icon: "☾",
      tone: "bg-[#E8F4EF]",
    },
  ];

  return (
    <section className="mx-auto min-h-[calc(100vh-72px)] w-full max-w-5xl px-4 pb-10 pt-3 sm:px-6">
      <div className="grid gap-5 border-b border-[#E5D9DF] pb-6 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase text-[#A04464]">Personal patterns</p>
          <h1 className="mt-1 text-3xl font-bold text-[#241B21]">Cycle insights</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#6E6168]">
            Your saved check-ins shape this view. Patterns become more useful over time.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCalendar}
          className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-[#DCCED5] bg-white px-5 text-sm font-bold text-[#493B42] transition hover:border-[#D47EA0] hover:bg-[#FFF7FA] focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
        >
          <span>▦</span>
          View calendar
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Current phase"
          value={phaseLabel}
          detail={`Cycle day ${prediction.currentCycleDay}`}
          accent="bg-[#8D62C3]"
        />
        <MetricCard
          label="Next period"
          value={formatShortDate(prediction.predictedNextPeriod)}
          detail={`${prediction.daysUntilNextPeriod} days away`}
          accent="bg-[#E9547C]"
        />
        <MetricCard
          label="Logged days"
          value={String(logs.length)}
          detail={logs.length ? "Private history" : "Ready when you are"}
          accent="bg-[#43A883]"
        />
      </div>

      <div className="mt-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-[#A04464]">Snapshots</p>
          <h2 className="mt-1 text-xl font-bold text-[#241B21]">What your logs show</h2>
        </div>
        <span className="text-xs font-semibold text-[#95878E]">{logs.length} total days</span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setOpenCategory(card.key)}
            className={`group min-h-40 rounded-[8px] border border-[#E7DCE1] p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#D88CAA] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#D47EA0] ${card.tone}`}
          >
            <span className="flex items-start justify-between gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/80 text-xl text-[#A44265] shadow-sm">
                {card.icon}
              </span>
              <span className="text-xl text-[#9B6A7E] transition group-hover:translate-x-0.5">›</span>
            </span>
            <span className="mt-5 block text-[10px] font-bold uppercase text-[#8A6474]">
              {card.eyebrow}
            </span>
            <span className="mt-1 block truncate text-base font-bold text-[#30242B]">
              {card.title}
            </span>
            <span className="mt-1 block truncate text-xs text-[#74666D]">{card.detail}</span>
          </button>
        ))}
      </div>

      <div className="mt-9">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-[#A04464]">History</p>
            <h2 className="mt-1 text-xl font-bold text-[#241B21]">Recent check-ins</h2>
          </div>
          {logs.length > 0 && (
            <button
              type="button"
              onClick={onOpenCalendar}
              className="text-xs font-bold text-[#B43E67] underline underline-offset-4"
            >
              See all dates
            </button>
          )}
        </div>

        {logs.length > 0 ? (
          <div className="mt-3 overflow-hidden rounded-[8px] border border-[#E6DADF] bg-white">
            {logs.slice(0, 7).map((log, index) => (
              <HistoryRow
                key={log.date}
                log={log}
                last={index === Math.min(logs.length, 7) - 1}
                onClick={() => onOpenLog(log.date)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-[8px] border border-dashed border-[#D9B6C4] bg-[#FFF8FB] px-5 py-9 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#F9E1EA] text-2xl text-[#BA446C]">
              +
            </span>
            <h3 className="mt-4 text-base font-bold text-[#33272E]">Your first check-in starts here</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#766970]">
              Log only what feels useful. Your tracker begins empty and stays yours.
            </p>
            <button
              type="button"
              onClick={() => onOpenLog(prediction.today)}
              className="mt-5 h-11 rounded-full bg-[#E9547C] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(233,84,124,0.22)] transition hover:bg-[#D94870] focus:outline-none focus:ring-2 focus:ring-[#E9547C] focus:ring-offset-2"
            >
              Log today
            </button>
          </div>
        )}
      </div>

      {openCategory && (
        <InsightDialog
          category={openCategory}
          logs={logs}
          prediction={prediction}
          topSymptom={topSymptom}
          topMood={topMood}
          onClose={() => setOpenCategory(null)}
        />
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[8px] border border-[#E6DADF] bg-white px-4 py-4 shadow-sm">
      <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <p className="text-[10px] font-bold uppercase text-[#978991]">{label}</p>
      <p className="mt-1 truncate text-xl font-bold text-[#2E2229]">{value}</p>
      <p className="mt-1 text-xs text-[#776A71]">{detail}</p>
    </div>
  );
}

function HistoryRow({
  log,
  last,
  onClick,
}: {
  log: DailyLog;
  last: boolean;
  onClick: () => void;
}) {
  const details = [
    log.periodFlow !== "none" ? `${log.periodFlow} flow` : null,
    log.symptoms.length ? `${log.symptoms.length} symptom${log.symptoms.length === 1 ? "" : "s"}` : null,
    log.moods.length ? `${log.moods.length} mood${log.moods.length === 1 ? "" : "s"}` : null,
    log.energy ? `${log.energy} energy` : null,
  ].filter(Boolean);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid w-full grid-cols-[42px_1fr_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-[#FFF5F8] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#D47EA0] ${
        last ? "" : "border-b border-[#EFE6EA]"
      }`}
    >
      <span
        className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${
          log.periodFlow !== "none"
            ? "bg-[#F36A84] text-white"
            : "bg-[#E9F4EF] text-[#34775F]"
        }`}
      >
        {new Date(`${log.date}T12:00:00`).getDate()}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#342830]">{formatLongDate(log.date)}</span>
        <span className="mt-0.5 block truncate text-xs capitalize text-[#786B72]">
          {details.length ? details.join(" • ") : "Note saved"}
        </span>
      </span>
      <span className="text-xl text-[#B19CA6]">›</span>
    </button>
  );
}

function InsightDialog({
  category,
  logs,
  prediction,
  topSymptom,
  topMood,
  onClose,
}: {
  category: InsightCategory;
  logs: DailyLog[];
  prediction: CyclePrediction;
  topSymptom?: Symptom;
  topMood?: Mood;
  onClose: () => void;
}) {
  const content = getDialogContent(category, logs, prediction, topSymptom, topMood);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-[#241820]/35 p-3 backdrop-blur-sm sm:place-items-center"
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[420px] rounded-t-[20px] border border-[#E4D6DD] bg-white p-5 shadow-[0_24px_80px_rgba(35,20,29,0.25)] sm:rounded-[16px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#A04464]">Your pattern</p>
            <h2 className="mt-1 text-2xl font-bold text-[#241B21]">{content.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#DCCED5] text-lg text-[#493B42] transition hover:bg-[#F8F0F4] focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
            aria-label="Close insight"
          >
            ×
          </button>
        </div>
        <p className="mt-5 text-sm leading-6 text-[#655960]">{content.body}</p>
        <div className="mt-6 grid grid-cols-3 gap-2">
          {content.stats.map((stat) => (
            <div key={stat.label} className="rounded-[8px] bg-[#F7F1F4] px-2 py-3 text-center">
              <p className="truncate text-lg font-bold text-[#3A2D34]">{stat.value}</p>
              <p className="mt-1 truncate text-[9px] font-bold uppercase text-[#908188]">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs leading-5 text-[#8A7B82]">
          These are personal log summaries, not diagnoses or medical predictions.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 h-11 w-full rounded-full bg-[#E9547C] text-sm font-bold text-white transition hover:bg-[#D94870] focus:outline-none focus:ring-2 focus:ring-[#E9547C] focus:ring-offset-2"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function getDialogContent(
  category: InsightCategory,
  logs: DailyLog[],
  prediction: CyclePrediction,
  topSymptom?: Symptom,
  topMood?: Mood,
) {
  const periodDays = logs.filter((log) => log.periodFlow !== "none").length;
  const symptomCount = logs.reduce((total, log) => total + log.symptoms.length, 0);
  const moodCount = logs.reduce((total, log) => total + log.moods.length, 0);
  const goodSleep = logs.filter((log) => log.sleep === "good").length;
  const highEnergy = logs.filter((log) => log.energy === "high").length;

  if (category === "cycle") {
    return {
      title: "Cycle rhythm",
      body: `Your current estimate uses a ${prediction.averageCycleLength}-day average and a ${prediction.averagePeriodLength}-day average period. More complete period logs can make future estimates more personal.`,
      stats: [
        { label: "Cycle", value: `${prediction.averageCycleLength}d` },
        { label: "Period", value: `${prediction.averagePeriodLength}d` },
        { label: "Logged", value: String(periodDays) },
      ],
    };
  }

  if (category === "symptoms") {
    return {
      title: "Body patterns",
      body: topSymptom
        ? `${symptomLabels[topSymptom]} is your most frequently saved symptom so far. Keep context in mind: frequency alone does not show cause or severity.`
        : "There are not enough symptom check-ins to surface a personal pattern yet.",
      stats: [
        { label: "Entries", value: String(symptomCount) },
        { label: "Days", value: String(logs.filter((log) => log.symptoms.length).length) },
        { label: "Top", value: topSymptom ? symptomLabels[topSymptom] : "—" },
      ],
    };
  }

  if (category === "mood") {
    return {
      title: "Mood patterns",
      body: topMood
        ? `${moodLabels[topMood]} is your most frequently selected mood. Multiple moods can be true on the same day, so this view keeps all of them.`
        : "There are not enough mood check-ins to surface a personal pattern yet.",
      stats: [
        { label: "Entries", value: String(moodCount) },
        { label: "Days", value: String(logs.filter((log) => log.moods.length).length) },
        { label: "Top", value: topMood ? moodLabels[topMood] : "—" },
      ],
    };
  }

  return {
    title: "Rest and energy",
    body: "Sleep and energy can vary for many reasons. Seeing them beside cycle timing can help you plan gentler or more active days around your own experience.",
    stats: [
      { label: "Sleep logs", value: String(logs.filter((log) => log.sleep).length) },
      { label: "Good sleep", value: String(goodSleep) },
      { label: "High energy", value: String(highEnergy) },
    ],
  };
}

function mostCommon<T extends string>(values: T[]): T | undefined {
  const counts = new Map<T, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}
