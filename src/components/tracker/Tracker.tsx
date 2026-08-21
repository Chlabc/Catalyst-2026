"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { GrowthBadge } from "@/components/GrowthBadge";
import { SupportCard } from "@/components/SupportCard";
import { SYMPTOM_TAGS, wellnessTips, type SymptomTag } from "@/lib/symptoms";
import { cyclePhases } from "@/lib/cyclePhases";

const LOGS_KEY = "menstramission_tracker_logs";
const RATINGS_KEY = "menstramission_cycle_ratings";

type DayLog = { symptoms: SymptomTag[] };
type Logs = Record<string, DayLog>;
type Rating = "smooth" | "mild" | "difficult";

function toKey(date: Date) {
  // Local date parts, not toISOString() — that converts to UTC first,
  // which silently shifts the date for any timezone ahead of UTC.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function computeCurrentStreak(logs: Logs): { startKey: string; length: number } | null {
  const keys = Object.keys(logs).sort();
  if (keys.length === 0) return null;

  const mostRecent = keys[keys.length - 1];
  let length = 1;
  let cursor = fromKey(mostRecent);

  for (;;) {
    const prevDay = new Date(cursor);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevKey = toKey(prevDay);
    if (logs[prevKey]) {
      length += 1;
      cursor = prevDay;
    } else {
      break;
    }
  }

  return { startKey: toKey(cursor), length };
}

function normalizeLoadedLogs(raw: unknown): Logs {
  // Older builds stored a plain array of date strings — migrate that
  // shape into the new per-day object format instead of losing it.
  if (Array.isArray(raw)) {
    const migrated: Logs = {};
    for (const key of raw) {
      if (typeof key === "string") migrated[key] = { symptoms: [] };
    }
    return migrated;
  }
  if (raw && typeof raw === "object") return raw as Logs;
  return {};
}

export function Tracker() {
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
      return { ...prev, [selectedDate]: { symptoms } };
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

  const selectedSymptoms = selectedDate ? logs[selectedDate]?.symptoms ?? [] : [];
  const currentRating = streak ? ratings[streak.startKey] : undefined;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">{monthLabel}</h3>
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
                className={`aspect-square rounded-full text-sm transition-colors ${
                  isLogged
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

        <p className="mt-4 text-xs text-text-muted">
          Tap a day to log it and add symptoms. Nothing leaves your device —
          no account, no upload.
        </p>
      </Card>

      {selectedDate && (
        <Card>
          <p className="text-sm font-medium text-foreground">
            Symptoms on {fromKey(selectedDate).toLocaleDateString()}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SYMPTOM_TAGS.map((tag) => {
              const active = selectedSymptoms.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleSymptom(tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    active
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
            <div className="mt-4 flex flex-col gap-2 text-sm text-text-muted">
              {selectedSymptoms.map((tag) => (
                <p key={tag}>
                  <span className="font-medium text-secondary">{tag}:</span>{" "}
                  {wellnessTips[tag]}
                </p>
              ))}
              <p className="text-xs italic">
                General comfort tips, not medical advice — see a doctor if
                symptoms feel severe.
              </p>
            </div>
          )}
        </Card>
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
                className={`rounded-full border px-3 py-1.5 text-sm capitalize transition-colors ${
                  currentRating === rating
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

      <Card>
        <p className="text-sm font-medium text-foreground">
          Understanding your cycle
        </p>
        <p className="mt-1 text-xs text-text-muted">
          General education — everyone&apos;s cycle length varies, so treat
          this as a rough guide, not a personal prediction.
        </p>
        <div className="mt-3 flex flex-col gap-3">
          {cyclePhases.map((phase) => {
            const isCurrent = phase.name === "Menstrual phase" && inMenstrualPhase;
            return (
              <div
                key={phase.name}
                className={`rounded-lg p-3 ${isCurrent ? "bg-secondary/10" : ""}`}
              >
                <p className="text-sm font-medium text-foreground">
                  {phase.name}
                  {isCurrent && (
                    <span className="ml-2 text-xs font-normal text-secondary">
                      you&apos;re likely here
                    </span>
                  )}
                  <span className="ml-2 text-xs font-normal text-text-muted">
                    {phase.days}
                  </span>
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {phase.description}
                </p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
