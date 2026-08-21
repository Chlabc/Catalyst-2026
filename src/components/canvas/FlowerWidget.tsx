"use client";

import { useEffect, useState } from "react";
import {
  readLogsFromStorage,
  computeCurrentStreak,
  toKey,
} from "@/lib/trackerStorage";

const LENGTH_KEY = "blossom_typical_period_length";
const LAST_SEEN_KEY = "blossom_flower_last_seen_remaining";
const DEFAULT_LENGTH = 7;
const FALL_DURATION_MS = 1200;

const PETAL_COLORS = ["var(--primary)", "var(--accent)", "var(--secondary)"];

type PlantPhase = "menstrual" | "follicular" | "ovulation" | "luteal";

function dateDistance(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function petalPoints(count: number, index: number, radius: number, center: number) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
    angleDeg: (index / count) * 360,
  };
}

export function FlowerWidget() {
  const [typicalLength, setTypicalLength] = useState(DEFAULT_LENGTH);
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeDays, setActiveDays] = useState(0);
  // Which petal index is mid-fall right now, if any - rendered with the
  // fall animation even though it's already excluded from the "still
  // blooming" count.
  const [fallingIndex, setFallingIndex] = useState<number | null>(null);

  useEffect(() => {
    let storedLength = DEFAULT_LENGTH;
    try {
      const raw = window.localStorage.getItem(LENGTH_KEY);
      if (raw) storedLength = Number(raw) || DEFAULT_LENGTH;
    } catch {
      // Corrupt/missing storage — just use the default.
    }
    // localStorage only exists client-side, so this has to run in an
    // effect; the resulting extra render is intentional and harmless.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTypicalLength(storedLength);

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
    const days = isActive && streak ? streak.length : 0;
    setActiveDays(days);

    const remaining = days === 0 ? storedLength : Math.max(storedLength - days, 1);

    // Compare against what we last showed, so a petal that dropped while
    // the user was elsewhere (e.g. logging a day on /tracker) still gets
    // its fall animation the next time they land on this page.
    let lastSeen = remaining;
    try {
      const raw = window.localStorage.getItem(LAST_SEEN_KEY);
      if (raw !== null) lastSeen = Number(raw);
    } catch {
      // Ignore, treat as no prior visit.
    }

    if (remaining < lastSeen) {
      const droppedIndex = lastSeen - 1;
      setFallingIndex(droppedIndex);
      window.setTimeout(() => setFallingIndex(null), FALL_DURATION_MS);
    }

    window.localStorage.setItem(LAST_SEEN_KEY, String(remaining));
    setLoaded(true);
  }, []);

  function saveLength(value: number) {
    const clamped = Math.max(1, Math.min(14, value));
    setTypicalLength(clamped);
    window.localStorage.setItem(LENGTH_KEY, String(clamped));
    setEditing(false);
  }

  if (!loaded) return null;

  const today = new Date();
  const recentLogs = readLogsFromStorage();
  const recentStreak = computeCurrentStreak(recentLogs);
  const mostRecentLog = recentStreak ? new Date(recentStreak.startKey) : null;
  const cycleDay = mostRecentLog
    ? Math.max(1, dateDistance(mostRecentLog, today) + 1)
    : 0;
  const isBleeding = activeDays > 0;
  const phase: PlantPhase = isBleeding
    ? "menstrual"
    : cycleDay >= 15
      ? "luteal"
      : cycleDay === 14
        ? "ovulation"
        : cycleDay > 0
          ? "follicular"
          : "follicular";
  const petalsRemaining = isBleeding
    ? Math.max(typicalLength - Math.min(activeDays, typicalLength - 1), 1)
    : 0;

  const size = 260;
  const center = size / 2;
  const petalRadius = 54;
  const petalLength = 40;
  const petalWidth = 19;

  return (
    <div className="rounded-b-2xl border-2 border-t-0 border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-foreground">Your bloom</p>
        {editing ? (
          <div className="flex items-center gap-1.5">
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
              className="w-14 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground"
            />
            <span className="text-sm text-text-muted">days</span>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {typicalLength}-day cycle · edit
          </button>
        )}
      </div>

      <div className="mx-auto mt-2" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="petalShine" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="white" stopOpacity="0.55" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {phase === "menstrual" && Array.from({ length: typicalLength }, (_, i) => {
            const isPetal = i < petalsRemaining;
            const isFalling = i === fallingIndex;
            const { x, y, angleDeg } = petalPoints(typicalLength, i, petalRadius, center);

            if (isPetal || isFalling) {
              return (
                <g key={i}>
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={petalWidth / 2}
                    ry={petalLength / 2}
                    fill={PETAL_COLORS[i % PETAL_COLORS.length]}
                    opacity={0.92}
                    transform={`rotate(${angleDeg} ${x} ${y})`}
                    className={isFalling ? "animate-petal-fall" : ""}
                    style={
                      isFalling
                        ? { transformBox: "fill-box", transformOrigin: "center" }
                        : undefined
                    }
                  />
                  <ellipse
                    cx={x}
                    cy={y}
                    rx={petalWidth / 2}
                    ry={petalLength / 2}
                    fill="url(#petalShine)"
                    transform={`rotate(${angleDeg} ${x} ${y})`}
                    className={isFalling ? "animate-petal-fall" : ""}
                    style={
                      isFalling
                        ? { transformBox: "fill-box", transformOrigin: "center" }
                        : undefined
                    }
                  />
                </g>
              );
            }

            // Settled: shown as a small resting seed instead.
            return (
              <circle key={i} cx={x} cy={y} r={4.5} fill="var(--text-muted)" opacity={0.35} />
            );
          })}
          {phase === "follicular" && (
            <g className="plant-sprout">
              <path d={`M ${center} ${center + 48} Q ${center - 4} ${center + 18} ${center} ${center - 4}`} fill="none" stroke="var(--secondary)" strokeWidth="7" strokeLinecap="round" />
              <path d={`M ${center - 2} ${center + 25} Q ${center - 42} ${center + 5} ${center - 50} ${center + 22} Q ${center - 20} ${center + 28} ${center - 2} ${center + 25}`} fill="var(--secondary)" />
              <path d={`M ${center + 2} ${center + 12} Q ${center + 40} ${center - 12} ${center + 48} ${center + 4} Q ${center + 24} ${center + 20} ${center + 2} ${center + 12}`} fill="var(--secondary)" />
            </g>
          )}
          {phase === "ovulation" && (
            <g className="plant-grow">
              <path d={`M ${center} ${center + 72} Q ${center - 8} ${center + 18} ${center} ${center - 38}`} fill="none" stroke="var(--secondary)" strokeWidth="8" strokeLinecap="round" />
              <path d={`M ${center - 3} ${center + 22} Q ${center - 48} ${center - 8} ${center - 58} ${center + 12} Q ${center - 30} ${center + 28} ${center - 3} ${center + 22}`} fill="var(--secondary)" />
              <ellipse cx={center} cy={center - 52} rx="25" ry="34" fill="var(--primary)" />
              <ellipse cx={center} cy={center - 56} rx="15" ry="25" fill="var(--accent)" opacity="0.7" />
            </g>
          )}
          {phase === "luteal" && (
            <g className="plant-grow">
              <path d={`M ${center} ${center + 72} Q ${center - 8} ${center + 14} ${center} ${center - 38}`} fill="none" stroke="var(--secondary)" strokeWidth="8" strokeLinecap="round" />
              <path d={`M ${center - 2} ${center + 24} Q ${center - 48} ${center - 10} ${center - 58} ${center + 10} Q ${center - 30} ${center + 30} ${center - 2} ${center + 24}`} fill="var(--secondary)" />
              <path d={`M ${center + 2} ${center + 10} Q ${center + 48} ${center - 22} ${center + 58} ${center - 2} Q ${center + 30} ${center + 22} ${center + 2} ${center + 10}`} fill="var(--secondary)" />
              <ellipse cx={center} cy={center - 58} rx="34" ry="42" fill="var(--primary)" />
              <ellipse cx={center - 9} cy={center - 66} rx="20" ry="32" fill="var(--accent)" opacity="0.75" />
            </g>
          )}
        </svg>
      </div>

      <p className="text-center text-sm font-semibold text-foreground">
        {phase === "menstrual" && `Menstrual phase · Day ${activeDays}`}
        {phase === "follicular" && "Follicular phase · new growth"}
        {phase === "ovulation" && "Ovulation · flower bud"}
        {phase === "luteal" && "Luteal phase · bud preparing"}
      </p>
      <p className="mt-1 text-center text-xs leading-relaxed text-text-muted">
        {phase === "menstrual"
          ? petalsRemaining === 1 && activeDays >= typicalLength
            ? "Your last petal is holding on until bleeding is marked as finished."
            : `${petalsRemaining} petal${petalsRemaining === 1 ? "" : "s"} remaining from your ${typicalLength}-day estimate.`
          : cycleDay > 0
            ? "A gentle guide based on your last logged period, not a prediction."
            : "Log the days you are bleeding to help your plant follow your cycle."}
      </p>
    </div>
  );
}
