"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { GrowthBadge } from "@/components/GrowthBadge";
import { SupportCard } from "@/components/SupportCard";
import { CyclePhaseWheel } from "@/components/tracker/CyclePhaseWheel";
import {
  SYMPTOM_TAGS,
  wellnessTips,
  symptomWhy,
  symptomToScenarioLevel,
  type SymptomTag,
} from "@/lib/symptoms";
import { cyclePhases } from "@/lib/cyclePhases";
import { scenarioLevels } from "@/lib/scenarios";
import {
  LOGS_KEY,
  RATINGS_KEY,
  toKey,
  fromKey,
  normalizeLoadedLogs,
  computeCurrentStreak,
  type Logs,
  type Rating,
  type Mood,
} from "@/lib/trackerStorage";

const MOODS: { value: Mood; emoji: string; label: string }[] = [
  { value: "good", emoji: "🙂", label: "Good" },
  { value: "okay", emoji: "😐", label: "Okay" },
  { value: "low", emoji: "😔", label: "Low" },
  { value: "irritable", emoji: "😤", label: "Irritable" },
];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function Tracker({ compact = false }: { compact?: boolean }) {
  const [logs, setLogs] = useState<Logs>({});
  const [ratings, setRatings] = useState<Record<string, Rating>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawLogs = window.localStorage.getItem(LOGS_KEY);
      const rawRatings = window.localStorage.getItem(RATINGS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (rawLogs) setLogs(normalizeLoadedLogs(JSON.parse(rawLogs)));
      if (rawRatings) setRatings(JSON.parse(rawRatings));
    } catch {
      // Corrupt/missing storage — just start fresh.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }, [logs, loaded]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  }, [ratings, loaded]);

  function toggleDay(key: string) {
    setLogs((prev) => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
        if (selectedDate === key) setSelectedDate(null);
      } else {
        next[key] = { symptoms: [] };
        setSelectedDate(key);
      }
      return next;
    });
  }

  function toggleSymptom(tag: SymptomTag) {
    if (!selectedDate) return;
    setLogs((prev) => {
      const day = prev[selectedDate];
      if (!day) return prev;
      const has = day.symptoms.includes(tag);
      const symptoms = has
        ? day.symptoms.filter((s) => s !== tag)
        : [...day.symptoms, tag];
      return { ...prev, [selectedDate]: { ...day, symptoms } };
    });
  }

  function setMood(mood: Mood) {
    if (!selectedDate) return;
    setLogs((prev) => {
      const day = prev[selectedDate];
      if (!day) return prev;
      const nextMood = day.mood === mood ? undefined : mood;
      return { ...prev, [selectedDate]: { ...day, mood: nextMood } };
    });
  }

  if (!loaded) return null;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const total = daysInMonth(year, month);
  const firstWeekday = new Date(year, month, 1).getDay();

  const cells: (Date | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1)),
  ];

  const monthLabel = today.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const streak = computeCurrentStreak(logs);
  const todayKey = toKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const inMenstrualPhase = Boolean(logs[todayKey] || logs[toKey(yesterday)]);
  const activePhaseName = streak
    ? streak.length <= 5
      ? "Menstrual phase"
      : streak.length <= 13
        ? "Follicular phase"
        : streak.length === 14
          ? "Ovulation"
          : "Luteal phase"
    : undefined;

  const selectedSymptoms = selectedDate ? logs[selectedDate]?.symptoms ?? [] : [];
  const currentRating = streak ? ratings[streak.startKey] : undefined;

  return (
    <div className="flex flex-col gap-4">
      <Card className={compact ? "border-primary/30 bg-primary-soft" : ""}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-secondary">Your private rhythm</p>
            <h3 className="mt-1 font-semibold text-foreground">{monthLabel}</h3>
          </div>
          <GrowthBadge count={Object.keys(logs).length} />
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-text-muted">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={`${d}-${i}`}>{d}</div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            const key = toKey(date);
            const isLogged = Boolean(logs[key]);
            const isToday = key === todayKey;
            const isSelected = key === selectedDate;
            return (
              <button
                key={key}
                onClick={() => toggleDay(key)}
                className={`aspect-square rounded-full text-sm transition-colors ${isLogged
                    ? "bg-primary text-white"
                    : isToday
                      ? "border border-primary text-foreground"
                      : "text-foreground hover:bg-background"
                  } ${isSelected ? "ring-2 ring-offset-1 ring-secondary" : ""}`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-relaxed text-text-muted">
          Tap today to check in. Your notes stay on this device — no account, no upload.
        </p>
      </Card>

      {selectedDate && (
        <Card>
          <p className="text-sm font-medium text-foreground">
            {fromKey(selectedDate).toLocaleDateString()}
          </p>

          <p className="mt-3 text-xs font-medium text-text-muted">
            How are you feeling today?
          </p>
          <div className="mt-2 flex gap-2">
            {MOODS.map((m) => {
              const active = logs[selectedDate]?.mood === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  title={m.label}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-lg transition-colors ${active
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-background"
                    }`}
                >
                  {m.emoji}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs font-medium text-text-muted">
            Any symptoms?
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SYMPTOM_TAGS.map((tag) => {
              const active = selectedSymptoms.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleSymptom(tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${active
                      ? "border-primary bg-primary text-white"
                      : "border-border text-text-muted hover:text-foreground"
                    }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {selectedSymptoms.length > 0 && (
            <div className="mt-4 flex flex-col gap-4 text-sm text-text-muted">
              {selectedSymptoms.map((tag) => {
                const missionId = symptomToScenarioLevel[tag];
                const mission = scenarioLevels.find((l) => l.id === missionId);
                return (
                  <div key={tag}>
                    <p className="font-medium text-secondary">{tag}</p>
                    <p className="mt-1">
                      <span className="font-medium text-foreground">
                        Why:
                      </span>{" "}
                      {symptomWhy[tag]}
                    </p>
                    <p className="mt-1">{wellnessTips[tag]}</p>
                    {mission && (
                      <Link
                        href="/scenarios"
                        className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                      >
                        Related: play the &ldquo;{mission.title}&rdquo;
                        mission on Menstrome Island →
                      </Link>
                    )}
                  </div>
                );
              })}
              <p className="text-xs italic">
                General comfort tips, not medical advice — see a doctor if
                symptoms feel severe.
              </p>
            </div>
          )}
        </Card>
      )}

      {compact && !selectedDate && (
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <Card className="bg-secondary-soft">
            <p className="text-sm font-semibold text-foreground">
              {streak ? `You're on day ${streak.length} of this cycle` : "Ready when you are"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">
              {streak
                ? "Log how you feel today and build a picture that is yours."
                : "Start by tapping a day in the calendar to make this space personal."}
            </p>
          </Card>
          <Link href="/tracker" className="text-sm font-semibold text-primary hover:underline">
            Open tracker →
          </Link>
        </div>
      )}

      {streak && (
        <Card>
          <p className="text-sm font-medium text-foreground">
            Day {streak.length} of this cycle
          </p>
          <p className="mt-1 text-sm text-text-muted">How&apos;s it going?</p>
          <div className="mt-3 flex gap-2">
            {(["smooth", "mild", "difficult"] as Rating[]).map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  setRatings((prev) => ({ ...prev, [streak.startKey]: rating }))
                }
                className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${currentRating === rating
                    ? "border-primary bg-primary text-white"
                    : "border-border text-text-muted hover:text-foreground"
                  }`}
              >
                {rating}
              </button>
            ))}
          </div>

          {currentRating === "difficult" && (
            <div className="mt-4">
              <SupportCard />
            </div>
          )}
        </Card>
      )}

      {!compact && <Card>
        <p className="text-sm font-medium text-foreground">What to pack</p>
        <p className="mt-1 text-xs text-text-muted">
          A simple starter checklist — keep what works for you.
        </p>
        <ul className="mt-3 list-disc pl-4 text-sm text-text-muted">
          <li>Your preferred product (see the Product Library if unsure)</li>
          <li>A spare change of underwear</li>
          <li>Wipes or tissues</li>
          <li>
            Pain relief, if you use it and a trusted adult&apos;s said
            it&apos;s okay
          </li>
        </ul>
      </Card>}

      <Card>
        <p className="text-sm font-medium text-foreground">
          Understanding your cycle
        </p>
        <p className="mt-1 text-xs text-text-muted">
          General education — everyone&apos;s cycle length varies, so treat
          this as a rough guide, not a personal prediction. Tap a phase to
          read about it.
        </p>
        <CyclePhaseWheel
          phases={cyclePhases}
          activePhaseName={activePhaseName ?? (inMenstrualPhase ? "Menstrual phase" : undefined)}
          centerLabel={streak ? `Day ${streak.length}` : "Your cycle"}
          centerCaption={streak ? "of this cycle" : "tap a phase"}
        />
      </Card>
    </div>
  );
}
