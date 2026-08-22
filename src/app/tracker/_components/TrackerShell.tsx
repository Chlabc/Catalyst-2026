"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useBlossomTheme } from "@/components/theme/BlossomThemeProvider";
import {
  sceneBackdropClassName,
  selectSceneBackdrop,
} from "@/components/theme/selectSceneBackdrop";
import sceneStyles from "@/components/theme/SceneBackdrop.module.css";
import { HomeBackButton } from "@/components/ui/HomeBackButton";
import type { DailyLog, TrackerState } from "../_types/tracker";
import {
  getCyclePrediction,
  getEffectiveCycles,
} from "../_lib/cyclePredictions";
import { addDays, formatShortDate, fromIsoDate, toIsoDate } from "../_lib/dateUtils";
import {
  emptyTrackerState,
  readTrackerStateFromBackend,
  writeTrackerStateToBackend,
} from "../_lib/storage";
import { presentationTrackerState } from "../_lib/sampleData";
import { CycleDashboard, DailyCareSection } from "./CycleDashboard";
import { CycleCalendar } from "./CycleCalendar";
import { LogTodayPanel } from "./LogTodayPanel";
import { PhaseBlurb } from "./PhaseBlurb";

type SaveStatus = "loading" | "saved" | "saving" | "offline" | "demo";

/**
 * Tracker keeps the glance + phase guide up top.
 * Compact one-month calendar + day log sit in the bottom-right.
 * Insights / patterns live on Health report (/report).
 */
export function TrackerShell() {
  const router = useRouter();
  const { theme } = useBlossomTheme();
  const backdrop = selectSceneBackdrop(theme, "backdrop");
  const today = useMemo(() => toIsoDate(new Date()), []);
  const [trackerState, setTrackerState] =
    useState<TrackerState>(emptyTrackerState);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
  const [phaseGuideOpen, setPhaseGuideOpen] = useState(false);
  const displayTrackerState = isPresentationMode
    ? presentationTrackerState
    : trackerState;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      readTrackerStateFromBackend().then((state) => {
        setTrackerState(state);
        setSaveStatus("saved");
        setHydrated(true);
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated || isPresentationMode) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSaveStatus("saving");
      writeTrackerStateToBackend(trackerState)
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("offline"));
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [hydrated, isPresentationMode, trackerState]);

  useEffect(() => {
    if (!isLogOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLogOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLogOpen]);

  const effectiveTrackerState = useMemo(
    () => ({
      ...displayTrackerState,
      cycles: getEffectiveCycles(
        displayTrackerState.cycles,
        displayTrackerState.logs,
      ),
    }),
    [displayTrackerState],
  );
  const prediction = useMemo(
    () =>
      getCyclePrediction(
        effectiveTrackerState.cycles,
        effectiveTrackerState.settings,
      ),
    [effectiveTrackerState],
  );
  const selectedPrediction = useMemo(
    () =>
      getCyclePrediction(
        effectiveTrackerState.cycles,
        effectiveTrackerState.settings,
        fromIsoDate(selectedDate),
      ),
    [effectiveTrackerState, selectedDate],
  );

  function handleLogChange(log: DailyLog) {
    setTrackerState((current) => ({
      ...current,
      logs: {
        ...current.logs,
        [log.date]: log,
      },
    }));
    setIsPresentationMode(false);
  }

  function openLogFor(date: string) {
    setSelectedDate(date);
    setIsLogOpen(true);
  }

  async function saveCurrentLog() {
    setSaveStatus("saving");

    try {
      await writeTrackerStateToBackend(trackerState);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("offline");
    }

    setIsLogOpen(false);
  }

  async function deleteSelectedLog() {
    if (isPresentationMode) {
      setIsPresentationMode(false);
      setIsLogOpen(false);
      return;
    }

    const nextLogs = { ...trackerState.logs };
    delete nextLogs[selectedDate];
    const nextState = { ...trackerState, logs: nextLogs };

    setTrackerState(nextState);
    setIsPresentationMode(false);
    setSaveStatus("saving");

    try {
      await writeTrackerStateToBackend(nextState);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("offline");
    }

    setIsLogOpen(false);
  }

  function loadPresentationData() {
    setIsPresentationMode(true);
    setSelectedDate(today);
    setVisibleMonth(new Date());
    setSaveStatus("demo");
  }

  function moveMonth(amount: number) {
    setVisibleMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + amount);
      return next;
    });
  }

  function focusCalendarMonth() {
    window.requestAnimationFrame(() => {
      document
        .getElementById("tracker-month-corner")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  return (
    <div
      className={`${sceneBackdropClassName(sceneStyles, backdrop)} w-full overflow-x-hidden text-foreground`}
      data-testid="tracker-scene-backdrop"
      data-blossom-scene={backdrop.themeKey}
    >
      <div className="relative z-10 mx-auto min-h-screen w-full max-w-4xl px-4 pb-12 pt-6 sm:px-6 md:pb-16 md:pt-10">
        <HomeBackButton />

        <header className="mt-4 pb-2" data-testid="tracker-page-header">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-dark">
            Tracker
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Your cycle
              </h1>
              <p className="mt-1 text-sm text-text-muted">
                Private check-ins on this device — patterns &amp; PDF live under{" "}
                <Link
                  href="/report"
                  className="font-semibold text-primary hover:underline"
                >
                  Health report
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-semibold text-text-muted"
                title={saveStatusLabel(saveStatus)}
              >
                <span
                  className={`h-2 w-2 rounded-full ${saveStatusDot(saveStatus)}`}
                />
                {saveStatusLabel(saveStatus)}
              </span>
              <button
                type="button"
                onClick={loadPresentationData}
                className="text-[11px] font-medium text-text-muted/80 underline-offset-2 hover:text-foreground hover:underline"
                aria-label="Load sample presentation data"
                title="Fills the tracker with sample cycle logs for demos — not saved as your real data until you edit"
              >
                {isPresentationMode ? "Sample data on" : "Load sample data"}
              </button>
            </div>
          </div>
        </header>

        <main className="mt-4">
          {/* Left: glance only. Right: month + log, daily care, phase guide. */}
          <div className="md:grid md:grid-cols-[minmax(360px,430px)_minmax(300px,1fr)] md:items-start md:gap-8">
            <div>
              <DateStrip
                today={today}
                selectedDate={selectedDate}
                logs={displayTrackerState.logs}
                onSelectDate={setSelectedDate}
              />
              <CycleDashboard
                prediction={selectedPrediction}
                selectedDate={selectedDate}
                selectedLog={displayTrackerState.logs[selectedDate]}
                isToday={selectedDate === today}
                settings={displayTrackerState.settings}
                showDailyCare={false}
                onOpenLog={() => openLogFor(selectedDate)}
                onOpenCalendar={focusCalendarMonth}
                onTogglePhaseGuide={() => {
                  setPhaseGuideOpen(true);
                  window.requestAnimationFrame(() => {
                    document
                      .getElementById("tracker-phase-blurb")
                      ?.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                      });
                  });
                }}
              />
              <div className="mt-3">
                <PhaseBlurb
                  prediction={selectedPrediction}
                  forceOpen={phaseGuideOpen}
                  onOpenChange={setPhaseGuideOpen}
                />
              </div>
            </div>

            <div
              id="tracker-month-corner"
              className="flex flex-col gap-3 pt-4 md:pt-0"
              data-testid="tracker-month-corner"
            >
              <CycleCalendar
                compact
                monthDate={visibleMonth}
                selectedDate={selectedDate}
                prediction={prediction}
                logs={displayTrackerState.logs}
                trackerState={effectiveTrackerState}
                onSelectDate={setSelectedDate}
                onNavigateMonth={moveMonth}
                onGoToToday={() => {
                  setSelectedDate(today);
                  setVisibleMonth(new Date());
                }}
                onOpenLog={() => openLogFor(selectedDate)}
                onOpenLearn={() => router.push("/scenarios")}
              />
              <DailyCareSection
                stacked
                prediction={selectedPrediction}
                selectedLog={displayTrackerState.logs[selectedDate]}
                onOpenLog={() => openLogFor(selectedDate)}
                onOpenCalendar={focusCalendarMonth}
                onTogglePhaseGuide={() => setPhaseGuideOpen(true)}
              />
              <p className="text-xs text-text-muted">
                Patterns &amp; PDF export:{" "}
                <Link
                  href="/report"
                  className="font-semibold text-primary hover:underline"
                >
                  Health report
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>

      {isLogOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/25 px-3 py-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Log ${formatShortDate(selectedDate)}`}
          data-testid="log-sheet"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLogOpen(false);
          }}
        >
          <div className="mx-auto flex h-full max-w-[430px] items-end md:max-w-xl md:items-center">
            <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[24px] border border-border bg-surface shadow-[0_18px_50px_rgba(22,18,25,0.22)] md:rounded-[24px]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/96 px-4 py-3 backdrop-blur">
                <h2 className="text-lg font-bold text-foreground">
                  Log {formatShortDate(selectedDate)}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsLogOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-border text-lg leading-none"
                  aria-label="Close log panel"
                >
                  ×
                </button>
              </div>
              <LogTodayPanel
                selectedDate={selectedDate}
                log={
                  isPresentationMode
                    ? undefined
                    : trackerState.logs[selectedDate]
                }
                onChange={handleLogChange}
              />
              <div className="sticky bottom-0 bg-surface/96 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  {!isPresentationMode && trackerState.logs[selectedDate] && (
                    <button
                      type="button"
                      onClick={deleteSelectedLog}
                      className="h-12 rounded-full border border-primary/30 px-4 text-sm font-bold text-primary-dark transition hover:bg-primary-soft focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveCurrentLog}
                    className="h-12 flex-1 rounded-full bg-primary px-4 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    {saveStatus === "saving" ? "Saving..." : "Save Log"}
                  </button>
                </div>
                <p className="mt-2 text-center text-[11px] font-semibold text-text-muted">
                  {saveStatusLabel(saveStatus)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function saveStatusLabel(status: SaveStatus): string {
  if (status === "loading") return "Loading…";
  if (status === "saving") return "Saving…";
  if (status === "offline") return "Saved on this device only";
  if (status === "demo") return "Demo data — edit to keep your own";
  return "Saved";
}

function saveStatusDot(status: SaveStatus): string {
  if (status === "saving" || status === "loading") return "bg-warning";
  if (status === "offline") return "bg-primary";
  if (status === "demo") return "bg-accent";
  return "bg-secondary";
}

function DateStrip({
  today,
  selectedDate,
  logs,
  onSelectDate,
}: {
  today: string;
  selectedDate: string;
  logs: Record<string, DailyLog>;
  onSelectDate: (date: string) => void;
}) {
  const dates = Array.from({ length: 7 }, (_, index) =>
    addDays(today, index - 3),
  );

  return (
    <div className="px-2 sm:px-0">
      <div className="grid grid-cols-7 items-start text-center">
        {dates.map((date) => {
          const current = date === today;
          const selected = date === selectedDate;
          const day = fromIsoDate(date);
          const weekday = current
            ? "Today"
            : new Intl.DateTimeFormat("en", { weekday: "short" })
                .format(day)
                .slice(0, 1);

          return (
            <button
              key={date}
              type="button"
              onClick={() => onSelectDate(date)}
              className="grid justify-items-center gap-2 text-xs font-medium text-text-muted focus:outline-none"
              aria-pressed={selected}
            >
              <span className="text-[10px] uppercase">{weekday}</span>
              <span
                className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                  selected
                    ? "bg-accent text-white"
                    : current
                      ? "bg-surface text-accent ring-1 ring-accent"
                      : "text-foreground/70"
                }`}
              >
                {day.getDate()}
              </span>
              {logs[date] && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
