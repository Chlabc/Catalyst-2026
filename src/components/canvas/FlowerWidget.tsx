"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CyclePlant, type CyclePlantPhase } from "./CyclePlant";
import styles from "./FlowerWidget.module.css";
import { computeCurrentStreak, toKey, type Logs } from "@/lib/trackerStorage";
import {
  TRACKER_STORAGE_KEY,
  TRACKER_STATE_EVENT,
  readTrackerState,
} from "@/app/tracker/_lib/storage";
import { periodDaysAsLogs } from "@/app/tracker/_lib/widgetCalendarMarks";

const LAST_SEEN_KEY = "blossom_flower_last_seen_remaining";
const PETAL_COUNT = 7;
const FALL_DURATION_MS = 1200;

function dateDistance(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function readPeriodLogs(): Logs {
  return periodDaysAsLogs(readTrackerState());
}

export function FlowerWidget() {
  const [loaded, setLoaded] = useState(false);
  const [periodLogs, setPeriodLogs] = useState<Logs>({});
  const [activeDays, setActiveDays] = useState(0);
  // Which petal index is mid-fall right now, if any - rendered with the
  // fall animation even though it's already excluded from the "still
  // blooming" count.
  const [fallingIndex, setFallingIndex] = useState<number | null>(null);

  const applyLogs = useCallback((logs: Logs, animateDrop: boolean) => {
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
    setPeriodLogs(logs);
    setActiveDays(days);

    const remaining = days === 0
      ? PETAL_COUNT
      : Math.max(PETAL_COUNT - Math.min(Math.max(days - 1, 0), PETAL_COUNT - 1), 1);

    // Compare against what we last showed, so a petal that dropped while
    // the user was elsewhere (e.g. logging a day on /tracker) still gets
    // its fall animation the next time they land on this page.
    let lastSeen = remaining;
    try {
      const raw = window.localStorage.getItem(LAST_SEEN_KEY);
      if (raw !== null) lastSeen = Math.min(Number(raw), 7);
    } catch {
      // Ignore, treat as no prior visit.
    }

    if (animateDrop && remaining < lastSeen) {
      const droppedIndex = Math.max(0, Math.min(lastSeen - 1, 6));
      setFallingIndex(droppedIndex);
      window.setTimeout(() => setFallingIndex(null), FALL_DURATION_MS);
    }

    window.localStorage.setItem(LAST_SEEN_KEY, String(remaining));
  }, []);

  useEffect(() => {
    applyLogs(readPeriodLogs(), true);
    setLoaded(true);

    function refresh() {
      applyLogs(readPeriodLogs(), true);
    }

    function onStorage(event: StorageEvent) {
      if (event.key === TRACKER_STORAGE_KEY || event.key === null) {
        refresh();
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener(TRACKER_STATE_EVENT, refresh);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(TRACKER_STATE_EVENT, refresh);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [applyLogs]);

  if (!loaded) return null;

  const today = new Date();
  const recentStreak = computeCurrentStreak(periodLogs);
  const mostRecentLog = recentStreak ? new Date(recentStreak.startKey) : null;
  const cycleDay = mostRecentLog
    ? Math.max(1, dateDistance(mostRecentLog, today) + 1)
    : 0;
  const isBleeding = activeDays > 0;
  const phase: CyclePlantPhase = isBleeding
    ? "menstrual"
    : cycleDay >= 15
      ? "luteal"
      : cycleDay === 14
        ? "ovulation"
        : cycleDay > 0
          ? "follicular"
          : "follicular";
  const petalsRemaining = isBleeding
    ? Math.max(PETAL_COUNT - Math.min(Math.max(activeDays - 1, 0), PETAL_COUNT - 1), 1)
    : PETAL_COUNT;
  const follicularProgress =
    phase === "follicular"
      ? cycleDay > 0
        ? Math.min(cycleDay / 13, 1)
        : 0.2
      : 1;
  const phaseName = phase === "menstrual"
    ? "Menstrual phase"
    : phase === "follicular"
      ? "Follicular phase"
      : phase === "ovulation"
        ? "Ovulation"
        : "Luteal phase";
  const description = phase === "menstrual"
    ? petalsRemaining === 1 && activeDays >= PETAL_COUNT
      ? "Your last petal is holding on until bleeding is marked as finished."
      : `${petalsRemaining} petal${petalsRemaining === 1 ? "" : "s"} still blooming today.`
    : phase === "follicular"
      ? "New growth is beginning."
      : phase === "ovulation"
        ? "Your bloom is open and thriving."
        : "Your bloom is relaxing after its peak.";
  const earlySprout = phase === "follicular" && follicularProgress <= 0.35;

  return (
    <div className={`${styles.hero} ${earlySprout ? styles.earlyHero : ""}`}>
      <div className={styles.heading}>
        <p className="text-sm font-semibold text-foreground/70">
          Your bloom{cycleDay > 0 && ` · Day ${cycleDay}`}
        </p>
      </div>

      <div className={`${styles.plantViewport} ${earlySprout ? styles.earlySprout : ""}`}>
        <div className={styles.plantInner}>
          <CyclePlant
            phase={phase}
            follicularProgress={follicularProgress}
            visiblePetals={petalsRemaining}
            fallingPetal={fallingIndex}
            fallenPetals={isBleeding ? PETAL_COUNT - petalsRemaining : 0}
          />
        </div>
      </div>

      <p className="text-center text-base font-semibold text-foreground">
        {phaseName}
      </p>
      <p className="mx-auto mt-1 max-w-xs text-center text-xs leading-relaxed text-foreground/65">
        {description}
      </p>

      <Link
        href="/tracker"
        className="mt-3 inline-block text-xs font-medium text-primary-dark underline decoration-primary/30 underline-offset-2 hover:text-primary"
      >
        Update in Tracker →
      </Link>
    </div>
  );
}
