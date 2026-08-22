"use client";

import { useState, type ReactNode } from "react";
import type {
  DailyLog,
  EnergyLevel,
  Mood,
  PeriodFlow,
  SleepQuality,
  Symptom,
} from "../_types/tracker";
import { formatLongDate } from "../_lib/dateUtils";

type CategoryKey =
  | "period"
  | "symptoms"
  | "mood"
  | "energy"
  | "sleep"
  | "medication"
  | "notes";

const PRIMARY_CATEGORY_KEYS: CategoryKey[] = ["period", "symptoms", "mood"];
const MORE_CATEGORY_KEYS: CategoryKey[] = [
  "energy",
  "sleep",
  "medication",
  "notes",
];

const flowOptions: { value: PeriodFlow; label: string; icon: string }[] = [
  { value: "none", label: "No period", icon: "○" },
  { value: "spotting", label: "Spotting", icon: "◒" },
  { value: "light", label: "Light", icon: "◐" },
  { value: "medium", label: "Medium", icon: "●" },
  { value: "heavy", label: "Heavy", icon: "⬤" },
];

const symptomOptions: { value: Symptom; label: string; icon: string }[] = [
  { value: "cramps", label: "Cramps", icon: "♨" },
  { value: "headache", label: "Headache", icon: "◌" },
  { value: "bloating", label: "Bloating", icon: "◎" },
  { value: "acne", label: "Acne", icon: "✧" },
  { value: "breastTenderness", label: "Breast", icon: "◇" },
  { value: "backPain", label: "Back pain", icon: "⌁" },
  { value: "fatigue", label: "Fatigue", icon: "☾" },
  { value: "nausea", label: "Nausea", icon: "◍" },
];

const moodOptions: { value: Mood; label: string; icon: string }[] = [
  { value: "happy", label: "Happy", icon: "☺" },
  { value: "calm", label: "Calm", icon: "☻" },
  { value: "sensitive", label: "Sensitive", icon: "♡" },
  { value: "anxious", label: "Anxious", icon: "◔" },
  { value: "irritated", label: "Irritated", icon: "!" },
  { value: "sad", label: "Sad", icon: "☹" },
  { value: "stressed", label: "Stressed", icon: "↯" },
];

const energyOptions: { value: EnergyLevel; label: string; icon: string }[] = [
  { value: "low", label: "Low", icon: "▂" },
  { value: "medium", label: "Medium", icon: "▅" },
  { value: "high", label: "High", icon: "⚡" },
];

const sleepOptions: { value: SleepQuality; label: string; icon: string }[] = [
  { value: "poor", label: "Poor", icon: "☹" },
  { value: "okay", label: "Okay", icon: "☾" },
  { value: "good", label: "Good", icon: "✦" },
];

export function LogTodayPanel({
  selectedDate,
  log,
  onChange,
}: {
  selectedDate: string;
  log?: DailyLog;
  onChange: (log: DailyLog) => void;
}) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("period");
  const [showMore, setShowMore] = useState(false);
  const currentLog: DailyLog =
    log ??
    {
      date: selectedDate,
      periodFlow: "none",
      symptoms: [],
      moods: [],
    };

  function update(next: Partial<DailyLog>) {
    onChange({
      ...currentLog,
      ...next,
      date: selectedDate,
    });
  }

  function toggleSymptom(symptom: Symptom) {
    const removing = currentLog.symptoms.includes(symptom);
    const symptoms = removing
      ? currentLog.symptoms.filter((item) => item !== symptom)
      : [...currentLog.symptoms, symptom];
    const painSeverity = { ...currentLog.painSeverity };

    if (removing) delete painSeverity[symptom];

    update({ symptoms, painSeverity });
  }

  function toggleMood(mood: Mood) {
    const moods = currentLog.moods.includes(mood)
      ? currentLog.moods.filter((item) => item !== mood)
      : [...currentLog.moods, mood];

    update({ moods });
  }

  const categoryMeta: Record<
    CategoryKey,
    { title: string; icon: string; summary: string }
  > = {
    period: {
      title: "Period",
      icon: "●",
      summary: currentLog.periodFlow,
    },
    symptoms: {
      title: "Symptoms",
      icon: "✿",
      summary: `${currentLog.symptoms.length} logged`,
    },
    mood: {
      title: "Mood",
      icon: "☺",
      summary: currentLog.moods.length
        ? `${currentLog.moods.length} selected`
        : "Not logged",
    },
    energy: {
      title: "Energy",
      icon: "⚡",
      summary: currentLog.energy ?? "Not logged",
    },
    sleep: {
      title: "Sleep",
      icon: "☾",
      summary: currentLog.sleep ?? "Not logged",
    },
    medication: {
      title: "Medication",
      icon: "▰",
      summary: currentLog.medication ? "Added" : "None",
    },
    notes: {
      title: "Notes",
      icon: "▧",
      summary: currentLog.notes ? "Added" : "Add note",
    },
  };

  const visibleKeys = showMore
    ? [...PRIMARY_CATEGORY_KEYS, ...MORE_CATEGORY_KEYS]
    : PRIMARY_CATEGORY_KEYS;

  function selectCategory(key: CategoryKey) {
    if (MORE_CATEGORY_KEYS.includes(key) && !showMore) {
      setShowMore(true);
    }
    setActiveCategory(key);
  }

  return (
    <section
      id="log-panel"
      className="bg-[#FFF9FB] p-4 sm:p-5"
      data-testid="log-today-panel"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-[#D61F69]">Daily check-in</p>
          <h2 className="mt-1 text-2xl font-bold text-[#2B2B34]">
            {formatLongDate(selectedDate)}
          </h2>
          <p className="mt-1 text-xs text-[#6B6B78]">
            Start with period, symptoms, and mood. Open More if you want extras.
          </p>
        </div>
        <span className="rounded-full bg-[#FFF0F6] px-3 py-1.5 text-xs font-bold text-[#7A1241] ring-1 ring-[#FFD7EA]">
          Private
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2.5">
        {visibleKeys.map((key) => {
          const category = categoryMeta[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => selectCategory(key)}
              data-testid={`log-category-${key}`}
              className={`min-h-24 rounded-[8px] border p-2.5 text-center transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF6B9D] ${
                activeCategory === key
                  ? "border-[#FF6B9D] bg-[#FFF0F6] shadow-[0_12px_32px_rgba(255,107,157,0.14)]"
                  : "border-[#FFE8F1] bg-[#FFFBFD]"
              }`}
            >
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-white text-xl text-[#D61F69] shadow-sm">
                {category.icon}
              </span>
              <span className="mt-2 block truncate text-xs font-bold text-[#2B2B34]">
                {category.title}
              </span>
              <span className="mt-1 block truncate text-xs font-medium capitalize text-[#6B6B78]">
                {category.summary}
              </span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        data-testid="log-more-toggle"
        aria-expanded={showMore}
        onClick={() => {
          setShowMore((current) => {
            const next = !current;
            if (!next && MORE_CATEGORY_KEYS.includes(activeCategory)) {
              setActiveCategory("period");
            }
            return next;
          });
        }}
        className="mt-3 w-full rounded-full border border-[#FFD7EA] bg-white px-4 py-2.5 text-sm font-bold text-[#D61F69] transition hover:bg-[#FFF0F6] focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]"
      >
        {showMore ? "Hide extra check-ins" : "More (sleep, energy, notes…)"}
      </button>

      <div className="mt-5 rounded-[8px] bg-[#FFF7FA] p-4 ring-1 ring-[#FFE0EC]">
        {activeCategory === "period" && (
          <OptionGrid>
            {flowOptions.map((option) => (
              <VisualOption
                key={option.value}
                selected={currentLog.periodFlow === option.value}
                icon={option.icon}
                label={option.label}
                onClick={() => update({ periodFlow: option.value })}
              />
            ))}
          </OptionGrid>
        )}

        {activeCategory === "symptoms" && (
          <div className="grid gap-4">
            <OptionGrid>
              {symptomOptions.map((option) => (
                <VisualOption
                  key={option.value}
                  selected={currentLog.symptoms.includes(option.value)}
                  icon={option.icon}
                  label={option.label}
                  onClick={() => toggleSymptom(option.value)}
                />
              ))}
            </OptionGrid>
            {currentLog.symptoms.includes("cramps") && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#D61F69]">
                  Cramp intensity
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["mild", "moderate", "strong"] as const).map((severity) => (
                    <button
                      key={severity}
                      type="button"
                      onClick={() =>
                        update({
                          painSeverity: {
                            ...currentLog.painSeverity,
                            cramps: severity,
                          },
                        })
                      }
                      className={`rounded-full px-3 py-2 text-xs font-bold capitalize transition focus:outline-none focus:ring-2 focus:ring-[#FF6B9D] ${
                        currentLog.painSeverity?.cramps === severity
                          ? "bg-[#FF6B9D] text-white"
                          : "bg-white text-[#6B6B78] ring-1 ring-[#FFD7EA]"
                      }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeCategory === "mood" && (
          <OptionGrid>
            {moodOptions.map((option) => (
              <VisualOption
                key={option.value}
                selected={currentLog.moods.includes(option.value)}
                icon={option.icon}
                label={option.label}
                onClick={() => toggleMood(option.value)}
              />
            ))}
          </OptionGrid>
        )}

        {activeCategory === "energy" && (
          <OptionGrid columns="grid-cols-3">
            {energyOptions.map((option) => (
              <VisualOption
                key={option.value}
                selected={currentLog.energy === option.value}
                icon={option.icon}
                label={option.label}
                onClick={() =>
                  update({
                    energy:
                      currentLog.energy === option.value ? undefined : option.value,
                  })
                }
              />
            ))}
          </OptionGrid>
        )}

        {activeCategory === "sleep" && (
          <OptionGrid columns="grid-cols-3">
            {sleepOptions.map((option) => (
              <VisualOption
                key={option.value}
                selected={currentLog.sleep === option.value}
                icon={option.icon}
                label={option.label}
                onClick={() =>
                  update({
                    sleep:
                      currentLog.sleep === option.value ? undefined : option.value,
                  })
                }
              />
            ))}
          </OptionGrid>
        )}

        {activeCategory === "medication" && (
          <label className="block">
            <span className="text-sm font-bold text-[#2B2B34]">
              Medication or relief
            </span>
            <input
              value={currentLog.medication ?? ""}
              onChange={(event) => update({ medication: event.target.value })}
              placeholder="Add what helped..."
              className="mt-2 h-12 w-full rounded-full border border-[#FFD7EA] bg-white px-4 text-sm text-[#2B2B34] outline-none transition placeholder:text-[#A7A6AE] focus:border-[#FF6B9D] focus:ring-4 focus:ring-[#FFD7EA]"
            />
          </label>
        )}

        {activeCategory === "notes" && (
          <label className="block">
            <span className="text-sm font-bold text-[#2B2B34]">Notes</span>
            <textarea
              value={currentLog.notes ?? ""}
              onChange={(event) => update({ notes: event.target.value })}
              placeholder="Add a note..."
              className="mt-2 min-h-24 w-full resize-none rounded-[8px] border border-[#FFD7EA] bg-white px-4 py-3 text-sm text-[#2B2B34] outline-none transition placeholder:text-[#A7A6AE] focus:border-[#FF6B9D] focus:ring-4 focus:ring-[#FFD7EA]"
            />
          </label>
        )}
      </div>
    </section>
  );
}

function OptionGrid({
  children,
  columns = "grid-cols-2 sm:grid-cols-3",
}: {
  children: ReactNode;
  columns?: string;
}) {
  return <div className={`grid gap-2 ${columns}`}>{children}</div>;
}

function VisualOption({
  selected,
  icon,
  label,
  onClick,
}: {
  selected: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-20 rounded-[8px] border p-3 text-center transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D] ${
        selected
          ? "border-[#FF6B9D] bg-white text-[#D61F69] shadow-[0_12px_28px_rgba(255,107,157,0.15)]"
          : "border-[#FFE8F1] bg-white/70 text-[#6B6B78]"
      }`}
    >
      <span className="block text-2xl">{icon}</span>
      <span className="mt-1 block text-xs font-bold">{label}</span>
    </button>
  );
}
