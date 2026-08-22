"use client";

import { useEffect, useMemo, useState } from "react";
import { useBlossomTheme } from "@/components/theme/BlossomThemeProvider";
import {
  sceneBackdropClassName,
  selectSceneBackdrop,
} from "@/components/theme/selectSceneBackdrop";
import sceneStyles from "@/components/theme/SceneBackdrop.module.css";
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
import { CycleDashboard } from "./CycleDashboard";
import { CycleCalendar } from "./CycleCalendar";
import { LogTodayPanel } from "./LogTodayPanel";
import { PhaseCard } from "./PhaseCard";
import { InsightsHistory } from "./InsightsHistory";
import { ReminderOverlay, SearchOverlay } from "./TrackerOverlays";

type TrackerView = "today" | "calendar" | "insights" | "learn";
type SaveStatus = "loading" | "saved" | "saving" | "offline" | "demo";

export function TrackerShell() {
  const { theme } = useBlossomTheme();
  const backdrop = selectSceneBackdrop(theme, "backdrop");
  const today = useMemo(() => toIsoDate(new Date()), []);
  const [trackerState, setTrackerState] =
    useState<TrackerState>(emptyTrackerState);
  const [selectedDate, setSelectedDate] = useState(today);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const [activeView, setActiveView] = useState<TrackerView>("today");
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("loading");
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
  const reminderCount = [
    trackerState.settings.dailyLogReminder,
    trackerState.settings.periodPrepReminder,
  ].filter(Boolean).length;

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

  function handleSettingsChange(settings: TrackerState["settings"]) {
    setTrackerState((current) => ({
      ...current,
      settings,
    }));
    setIsPresentationMode(false);
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

  return (
    <div
      className={`${sceneBackdropClassName(sceneStyles, backdrop)} w-screen overflow-x-hidden text-[#161219]`}
      data-testid="tracker-scene-backdrop"
      data-blossom-scene={backdrop.themeKey}
    >
      <div className="relative z-10 mx-0 min-h-screen w-screen max-w-full bg-transparent pb-24 md:mx-auto md:max-w-5xl md:px-6 md:pb-10">
        <TrackerHeader
          activeView={activeView}
          date={today}
          presentationMode={isPresentationMode}
          reminderCount={reminderCount}
          saveStatus={saveStatus}
          onLoadDemo={loadPresentationData}
          onOpenCalendar={() => setActiveView("calendar")}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {activeView === "today" && (
          <main className="md:grid md:grid-cols-[minmax(360px,430px)_minmax(320px,1fr)] md:gap-8">
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
                onOpenLog={() => openLogFor(selectedDate)}
                onOpenCalendar={() => setActiveView("calendar")}
                onLearnMore={() => setActiveView("learn")}
              />
            </div>
            <div className="hidden pt-10 md:block">
              <PhaseCard
                prediction={selectedPrediction}
                compact
                onBack={() => setActiveView("today")}
                onSearch={() => setIsSearchOpen(true)}
                onNotifications={() => setIsNotificationsOpen(true)}
              />
            </div>
          </main>
        )}

        {activeView === "calendar" && (
          <CycleCalendar
            monthDate={visibleMonth}
            selectedDate={selectedDate}
            prediction={prediction}
            logs={displayTrackerState.logs}
            trackerState={effectiveTrackerState}
            onSelectDate={setSelectedDate}
            onNavigateMonth={moveMonth}
            onSelectMonth={setVisibleMonth}
            onGoToToday={() => {
              setSelectedDate(today);
              setVisibleMonth(new Date());
            }}
            onClose={() => setActiveView("today")}
            onOpenLog={() => openLogFor(selectedDate)}
            onOpenLearn={() => setActiveView("learn")}
          />
        )}

        {activeView === "learn" && (
          <PhaseCard
            prediction={prediction}
            onBack={() => setActiveView("today")}
            onSearch={() => setIsSearchOpen(true)}
            onNotifications={() => setIsNotificationsOpen(true)}
          />
        )}

        {activeView === "insights" && (
          <InsightsHistory
            trackerState={effectiveTrackerState}
            prediction={prediction}
            onOpenLog={openLogFor}
            onOpenCalendar={() => setActiveView("calendar")}
          />
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid h-[76px] max-w-[430px] grid-cols-4 border-t border-[#E9E2E8] bg-white/96 px-5 pb-2 pt-2 shadow-[0_-10px_30px_rgba(22,18,25,0.08)] backdrop-blur md:left-1/2 md:max-w-5xl md:-translate-x-1/2 md:px-32">
        <BottomNavItem
          icon="▣"
          label="Today"
          active={activeView === "today"}
          onClick={() => setActiveView("today")}
        />
        <BottomNavItem
          icon="▦"
          label="Calendar"
          active={activeView === "calendar"}
          onClick={() => setActiveView("calendar")}
        />
        <BottomNavItem
          icon="⌕"
          label="Insights"
          active={activeView === "insights"}
          onClick={() => setActiveView("insights")}
        />
        <BottomNavItem
          icon="▱"
          label="Learn"
          active={activeView === "learn"}
          onClick={() => setActiveView("learn")}
        />
      </nav>

      {isLogOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#161219]/22 px-3 py-5 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Log ${formatShortDate(selectedDate)}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLogOpen(false);
          }}
        >
          <div className="mx-auto flex h-full max-w-[430px] items-end md:max-w-xl md:items-center">
            <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[24px] border border-[#161219] bg-[#FFF7FB] shadow-[0_18px_50px_rgba(22,18,25,0.22)] md:rounded-[24px]">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E9E2E8] bg-[#FFF7FB]/96 px-4 py-3 backdrop-blur">
                <h2 className="text-lg font-bold text-[#161219]">
                  Log {formatShortDate(selectedDate)}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsLogOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-[#161219] text-lg leading-none"
                  aria-label="Close log panel"
                >
                  ×
                </button>
              </div>
              <LogTodayPanel
                selectedDate={selectedDate}
                log={isPresentationMode ? undefined : trackerState.logs[selectedDate]}
                onChange={handleLogChange}
              />
              <div className="sticky bottom-0 bg-[#FFF7FB]/96 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                  {!isPresentationMode && trackerState.logs[selectedDate] && (
                    <button
                      type="button"
                      onClick={deleteSelectedLog}
                      className="h-12 rounded-full border border-[#E2C4D0] px-4 text-sm font-bold text-[#A43C61] transition hover:bg-[#FFF0F5] focus:outline-none focus:ring-2 focus:ring-[#E9547C]"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={saveCurrentLog}
                    className="h-12 flex-1 rounded-full bg-[#FF5F86] text-sm font-bold text-white shadow-[0_8px_20px_rgba(255,95,134,0.24)] transition hover:bg-[#E94E75] focus:outline-none focus:ring-2 focus:ring-[#FF5F86] focus:ring-offset-2"
                  >
                    {saveStatus === "saving" ? "Saving..." : "Save Log"}
                  </button>
                </div>
                <p className="mt-2 text-center text-[11px] font-semibold text-[#77717A]">
                  {saveStatusLabel(saveStatus)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSearchOpen && (
        <SearchOverlay
          onNavigate={setActiveView}
          onOpenLog={() => openLogFor(today)}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {isNotificationsOpen && (
        <ReminderOverlay
          settings={trackerState.settings}
          onChange={handleSettingsChange}
          onClose={() => setIsNotificationsOpen(false)}
        />
      )}
    </div>
  );
}

function TrackerHeader({
  activeView,
  date,
  presentationMode,
  reminderCount,
  saveStatus,
  onLoadDemo,
  onOpenCalendar,
  onOpenSearch,
  onOpenNotifications,
}: {
  activeView: TrackerView;
  date: string;
  presentationMode: boolean;
  reminderCount: number;
  saveStatus: SaveStatus;
  onLoadDemo: () => void;
  onOpenCalendar: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
}) {
  const month = new Intl.DateTimeFormat("en", { month: "long" }).format(
    fromIsoDate(date),
  );

  if (activeView === "calendar") {
    return null;
  }

  return (
    <header className="flex h-[78px] items-center justify-between px-6 pt-3">
      <button
        type="button"
        onClick={onLoadDemo}
        className="relative grid h-9 w-9 place-items-center text-2xl"
        aria-label="Load presentation data"
        title={presentationMode ? "Presentation data loaded" : "Load demo view"}
      >
        🌷
        <span
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white ${saveStatusDot(saveStatus)}`}
        />
      </button>
      <div className="flex items-center gap-4">
        {activeView === "today" && (
          <span className="text-lg font-medium text-[#161219]">{month}</span>
        )}
        {activeView !== "today" && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="h-9 w-44 rounded-full bg-[#EFEDEF] px-5 text-left text-sm leading-9 text-[#77717A] transition hover:bg-[#E6E1E6] focus:outline-none focus:ring-2 focus:ring-[#D08AE7]"
          >
            Search
          </button>
        )}
        <button
          type="button"
          onClick={onOpenCalendar}
          className="grid h-8 w-8 place-items-center text-xl"
          aria-label="Open calendar"
        >
          ▣
        </button>
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative grid h-8 w-8 place-items-center text-xl"
          aria-label="Open reminders"
        >
          ♡
          {reminderCount > 0 && (
            <span className="absolute right-0 top-0 grid h-4 w-4 place-items-center rounded-full bg-[#F45B7B] text-[10px] font-bold text-white">
              {reminderCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

function saveStatusLabel(status: SaveStatus): string {
  if (status === "loading") {
    return "Loading saved tracker data...";
  }

  if (status === "saving") {
    return "Saving to tracker backend...";
  }

  if (status === "offline") {
    return "Backend unavailable. A local backup was kept.";
  }

  if (status === "demo") {
    return "Demo view is not saved until you edit a real log.";
  }

  return "Saved to tracker backend.";
}

function saveStatusDot(status: SaveStatus): string {
  if (status === "saving" || status === "loading") {
    return "bg-[#FFB64D]";
  }

  if (status === "offline") {
    return "bg-[#FF5F86]";
  }

  if (status === "demo") {
    return "bg-[#D08AE7]";
  }

  return "bg-[#43C27A]";
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
  const dates = Array.from({ length: 7 }, (_, index) => addDays(today, index - 3));

  return (
    <div className="px-6">
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
              className="grid justify-items-center gap-2 text-xs font-medium text-[#C5AFC8] focus:outline-none"
              aria-pressed={selected}
            >
              <span className="text-[10px] uppercase">
                {weekday}
              </span>
              <span
                className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ${
                  selected
                    ? "bg-[#D08AE7] text-white"
                    : current
                      ? "bg-white text-[#B45BC6] ring-1 ring-[#D08AE7]"
                    : "text-[#DA8BE5]"
                }`}
              >
                {day.getDate()}
              </span>
              {logs[date] && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF5F7D]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BottomNavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`grid place-items-center text-[11px] font-bold transition ${
        active ? "text-[#161219]" : "text-[#C9C7CC]"
      }`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className="mt-1">{label}</span>
    </button>
  );
}
