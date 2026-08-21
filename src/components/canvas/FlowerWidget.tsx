"use client";

import { useEffect, useState } from "react";
import {
  readLogsFromStorage,
  computeCurrentStreak,
  toKey,
} from "@/lib/trackerStorage";

const LENGTH_KEY = "blossom_typical_period_length";
const DEFAULT_LENGTH = 7;

const PETAL_COLORS = ["var(--primary)", "var(--accent)", "var(--secondary)"];

function petalPoints(count: number, index: number, radius: number, center: number) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

export function FlowerWidget() {
  const [typicalLength, setTypicalLength] = useState(DEFAULT_LENGTH);
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeDays, setActiveDays] = useState(0); // how many days into the current period

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LENGTH_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setTypicalLength(Number(raw) || DEFAULT_LENGTH);
    } catch {
      // Corrupt/missing storage — just use the default.
    }

    const logs = readLogsFromStorage();
    const streak = computeCurrentStreak(logs);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // A period only counts as "active" if the most recent log is today
    // or yesterday - otherwise there's a gap, which is how the flower
    // knows the period ended and resets to full bloom, with no separate
    // "mark as ended" button needed.
    const isActive = Boolean(logs[toKey(today)] || logs[toKey(yesterday)]);
    setActiveDays(isActive && streak ? streak.length : 0);
    setLoaded(true);
  }, []);

  function saveLength(value: number) {
    const clamped = Math.max(1, Math.min(14, value));
    setTypicalLength(clamped);
    window.localStorage.setItem(LENGTH_KEY, String(clamped));
    setEditing(false);
  }

  if (!loaded) return null;

  // Petals still showing = typicalLength minus days already logged, but
  // never below 1 while a period is still active - that's the "last
  // petal holds on if your period runs long" behaviour.
  const petalsRemaining =
    activeDays === 0
      ? typicalLength
      : Math.max(typicalLength - activeDays, 1);

  const size = 220;
  const center = size / 2;
  const petalRadius = 46;
  const petalLength = 34;
  const petalWidth = 16;

  return (
    <div className="rounded-b-2xl border border-t-0 border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Your bloom</p>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={14}
              defaultValue={typicalLength}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveLength(Number((e.target as HTMLInputElement).value));
              }}
              onBlur={(e) => saveLength(Number(e.target.value))}
              autoFocus
              className="w-14 rounded-md border border-border bg-background px-2 py-0.5 text-xs text-foreground"
            />
            <span className="text-xs text-text-muted">days</span>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {typicalLength}-day cycle · edit
          </button>
        )}
      </div>

      <div className="mx-auto mt-2" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {Array.from({ length: typicalLength }, (_, i) => {
            const isPetal = i < petalsRemaining;
            const { x, y } = petalPoints(typicalLength, i, petalRadius, center);
            const angleDeg = (i / typicalLength) * 360;

            if (isPetal) {
              return (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx={petalWidth / 2}
                  ry={petalLength / 2}
                  fill={PETAL_COLORS[i % PETAL_COLORS.length]}
                  opacity={0.9}
                  transform={`rotate(${angleDeg} ${x} ${y})`}
                />
              );
            }

            // Dropped petal -> shown as a small resting seed instead.
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={4}
                fill="var(--text-muted)"
                opacity={0.35}
              />
            );
          })}
          <circle cx={center} cy={center} r={14} fill="var(--secondary)" />
        </svg>
      </div>

      <p className="text-center text-xs text-text-muted">
        {activeDays === 0
          ? "Ready — log a day in the tracker to start this cycle's count."
          : petalsRemaining === 1 && activeDays >= typicalLength
            ? "Running a little longer than usual — that's okay, this stays until your period ends."
            : `Day ${activeDays} — ${petalsRemaining} petal${petalsRemaining === 1 ? "" : "s"} left.`}
      </p>
    </div>
  );
}
