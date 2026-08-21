"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { GrowthBadge } from "@/components/GrowthBadge";

const STORAGE_KEY = "menstramission_tracker_logs";

function toKey(date: Date) {
  // Build the key from local date parts, not toISOString() — that
  // converts to UTC first, which silently shifts the date by one for
  // any timezone ahead of UTC (e.g. Melbourne).
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function Tracker() {
  const [loggedDays, setLoggedDays] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount only (no account, all data stays on
  // this device — an intentional divergence for a young/sensitive-topic
  // audience, see DIVERGENCE.md).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // localStorage only exists client-side, so this has to run in an
      // effect; the resulting extra render is intentional and harmless.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLoggedDays(new Set(JSON.parse(raw)));
    } catch {
      // Corrupt/missing storage — just start fresh.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...loggedDays]));
  }, [loggedDays, loaded]);

  function toggleDay(key: string) {
    setLoggedDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

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

  if (!loaded) return null;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{monthLabel}</h3>
        <GrowthBadge count={loggedDays.size} />
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-text-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const key = toKey(date);
          const isLogged = loggedDays.has(key);
          const isToday = key === toKey(today);
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
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-text-muted">
        Tap a day to log it. Nothing leaves your device — no account, no
        upload.
      </p>
    </Card>
  );
}
