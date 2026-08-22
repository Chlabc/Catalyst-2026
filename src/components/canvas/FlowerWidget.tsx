"use client";

import { useEffect, useState } from "react";
import {
  readLogsFromStorage,
  computeCurrentStreak,
  toKey,
} from "@/lib/trackerStorage";

const LENGTH_KEY = "blossom_typical_period_length";
const LAST_SEEN_KEY = "blossom_flower_last_seen_remaining";
const WAS_BLEEDING_KEY = "blossom_flower_was_bleeding";
const WATER_KEY = "blossom_water_drops";
const DEFAULT_LENGTH = 7;
const FALL_DURATION_MS = 1200;

const PETAL_COLORS = ["var(--primary)", "var(--accent)", "var(--secondary)"];

type PlantPhase = "menstrual" | "follicular" | "ovulation" | "luteal";

function dateDistance(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

// How many petals are still attached for a given day count into the
// period: one drops per day of bleeding, but the last one clings
// (doesn't drop to 0) until the period is explicitly over - so a
// longer-than-usual period doesn't leave the plant bare.
function petalsStillAttached(typicalLength: number, daysBleeding: number) {
  if (daysBleeding === 0) return typicalLength;
  return Math.max(typicalLength - Math.min(daysBleeding, typicalLength - 1), 1);
}

function petalPoints(count: number, index: number, radius: number, center: number) {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
    angleDeg: (index / count) * 360,
  };
}

export function FlowerWidget({ theme = "beach" }: { theme?: "beach" | "desert" }) {
  const [typicalLength, setTypicalLength] = useState(DEFAULT_LENGTH);
  const [editing, setEditing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeDays, setActiveDays] = useState(0);
  // Which petal indices are mid-fall right now, if any - rendered with
  // the fall animation even though they're already excluded from the
  // "still blooming" count. Holds one index for an ordinary day-to-day
  // drop, or several at once when a period ends early and the
  // remaining petals shed together.
  const [fallingIndices, setFallingIndices] = useState<Set<number>>(new Set());
  // While true, keep rendering the menstrual bloom (with the shed
  // animation playing) even though the period has already ended and
  // the real phase has moved on - otherwise the remaining petals would
  // just vanish the instant the phase flips to follicular.
  const [shedding, setShedding] = useState(false);
  const [sheddingCount, setSheddingCount] = useState(0);
  const [previewPhase, setPreviewPhase] = useState<PlantPhase | null>(null);
  const [waterDrops, setWaterDrops] = useState(0);
  const [justWatered, setJustWatered] = useState(false);

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
    setWaterDrops(Number(window.localStorage.getItem(WATER_KEY) ?? "0") || 0);

    const remaining = petalsStillAttached(storedLength, days);

    // Compare against what we last showed, so a petal that dropped (or
    // a period that ended) while the user was elsewhere still gets its
    // animation the next time they land on this page.
    let remainingAtLastVisit = remaining;
    let wasBleeding = isActive;
    try {
      const rawRemaining = window.localStorage.getItem(LAST_SEEN_KEY);
      if (rawRemaining !== null) remainingAtLastVisit = Number(rawRemaining);
      const rawWasBleeding = window.localStorage.getItem(WAS_BLEEDING_KEY);
      if (rawWasBleeding !== null) wasBleeding = rawWasBleeding === "true";
    } catch {
      // Ignore, treat as no prior visit.
    }

    if (isActive && remaining < remainingAtLastVisit) {
      // Ordinary day-to-day drop, still bleeding.
      const droppedIndex = remainingAtLastVisit - 1;
      setFallingIndices(new Set([droppedIndex]));
      window.setTimeout(() => setFallingIndices(new Set()), FALL_DURATION_MS);
    } else if (!isActive && wasBleeding && remainingAtLastVisit > 0) {
      // Period just ended - whatever was left sheds together instead of
      // the whole flower silently swapping to a sprout mid-render.
      setSheddingCount(remainingAtLastVisit);
      setFallingIndices(
        new Set(Array.from({ length: remainingAtLastVisit }, (_, i) => i)),
      );
      setShedding(true);
      window.setTimeout(() => {
        setShedding(false);
        setFallingIndices(new Set());
      }, FALL_DURATION_MS);
    }

    window.localStorage.setItem(WAS_BLEEDING_KEY, String(isActive));
    window.localStorage.setItem(LAST_SEEN_KEY, String(remaining));
    setLoaded(true);
  }, []);

  useEffect(() => {
    function syncWaterDrops() {
      setWaterDrops(Number(window.localStorage.getItem(WATER_KEY) ?? "0") || 0);
    }
    window.addEventListener("blossom:water-changed", syncWaterDrops);
    return () => window.removeEventListener("blossom:water-changed", syncWaterDrops);
  }, []);

  function saveLength(value: number) {
    const clamped = Math.max(1, Math.min(14, value));
    setTypicalLength(clamped);
    window.localStorage.setItem(LENGTH_KEY, String(clamped));
    setEditing(false);
  }

  function waterPlant() {
    if (waterDrops < 1) return;
    const next = waterDrops - 1;
    setWaterDrops(next);
    window.localStorage.setItem(WATER_KEY, String(next));
    window.dispatchEvent(new Event("blossom:water-changed"));
    setJustWatered(true);
    window.setTimeout(() => setJustWatered(false), 900);
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
  const realPhase: PlantPhase = shedding || isBleeding
    ? "menstrual"
    : cycleDay >= 15
      ? "luteal"
      : cycleDay === 14
        ? "ovulation"
        : cycleDay > 0
          ? "follicular"
          : "follicular";
  const phase = previewPhase ?? realPhase;
  const petalsRemaining = shedding
    ? sheddingCount
    : isBleeding
      ? petalsStillAttached(typicalLength, activeDays)
      : 0;
  // The single petal that's overstaying rather than dropping - only
  // while the period is still ongoing, not during the end-of-period
  // shed (that one's on its way out, not clinging).
  const isClinging =
    !shedding && isBleeding && petalsRemaining === 1 && activeDays >= typicalLength;

  const size = 260;
  const center = size / 2;
  const petalRadius = 54;
  const petalLength = 40;
  const petalWidth = 19;

  return (
    <div className="rounded-b-2xl border-2 border-t-0 border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-foreground">
          {theme === "beach" ? "Your coconut bloom" : "Your desert bloom"}
        </p>
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              {typicalLength}-day cycle · edit
            </button>
            <button
              onClick={() => setPreviewPhase(previewPhase ? null : "follicular")}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-text-muted hover:border-primary hover:text-primary"
            >
              {previewPhase ? "Exit preview" : "Preview stages"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary-soft px-3 py-2">
        <p className="text-xs font-semibold text-foreground">💧 {waterDrops} water drop{waterDrops === 1 ? "" : "s"}</p>
        <button onClick={waterPlant} disabled={waterDrops < 1} className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-45">
          {justWatered ? "Growing!" : "Water plant"}
        </button>
      </div>

      {previewPhase && (
        <div className="mt-3 flex flex-wrap gap-1.5 rounded-xl bg-background p-2">
          {([
            ["menstrual", "Bloom"],
            ["follicular", "Sprout"],
            ["ovulation", "Bud"],
            ["luteal", "Mature bud"],
          ] as [PlantPhase, string][]).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setPreviewPhase(value)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${previewPhase === value ? "bg-primary text-white" : "text-text-muted hover:bg-surface hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
          <p className="basis-full px-1 pt-1 text-[10px] text-text-muted">
            Preview only — your tracker data is unchanged.
          </p>
        </div>
      )}

      <div className={`mx-auto mt-2 ${justWatered ? "animate-plant-watered" : ""}`} style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ overflow: "visible" }}>
          <defs>
            <radialGradient id="petalShine" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="white" stopOpacity="0.55" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {phase === "menstrual" && Array.from({ length: typicalLength }, (_, i) => {
            const isPetal = i < petalsRemaining;
            const isFalling = fallingIndices.has(i);
            const glow = isClinging && i === 0;
            const { x, y, angleDeg } = petalPoints(typicalLength, i, petalRadius, center);
            const petalClass = isFalling
              ? "animate-petal-fall"
              : glow
                ? "animate-petal-glow"
                : "";

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
                    className={petalClass}
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
                    className={petalClass}
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
        {previewPhase && <span className="mr-1 text-primary">Preview:</span>}
        {phase === "menstrual" && (shedding ? "Petals returning to the soil…" : `Menstrual phase · Day ${activeDays}`)}
        {phase === "follicular" && "Follicular phase · new growth"}
        {phase === "ovulation" && "Ovulation · flower bud"}
        {phase === "luteal" && "Luteal phase · bud preparing"}
      </p>
      <p className="mt-1 text-center text-xs leading-relaxed text-text-muted">
        {phase === "menstrual"
          ? shedding
            ? "Your period ended — the last petals are letting go together."
            : isClinging
              ? "Your last petal is glowing and holding on until bleeding is marked as finished."
              : `${petalsRemaining} petal${petalsRemaining === 1 ? "" : "s"} remaining from your ${typicalLength}-day estimate.`
          : cycleDay > 0
            ? "A gentle guide based on your last logged period, not a prediction."
            : "Log the days you are bleeding to help your plant follow your cycle."}
      </p>
    </div>
  );
}
