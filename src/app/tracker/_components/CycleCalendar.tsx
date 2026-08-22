"use client";

import type { CyclePrediction, DailyLog, TrackerState } from "../_types/tracker";
import {
  buildMonthDays,
  formatLongDate,
  fromIsoDate,
  toIsoDate,
} from "../_lib/dateUtils";
import {
  getCyclePrediction,
  isPredictedPeriodDate,
  phaseLabels,
} from "../_lib/cyclePredictions";

const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

export function CycleCalendar({
  monthDate,
  selectedDate,
  prediction,
  logs,
  trackerState,
  onSelectDate,
  onNavigateMonth,
  onGoToToday,
  onOpenLog,
  onOpenLearn,
  compact = false,
  fillHeight = false,
}: {
  monthDate: Date;
  selectedDate: string;
  prediction: CyclePrediction;
  logs: Record<string, DailyLog>;
  trackerState: TrackerState;
  onSelectDate: (date: string) => void;
  onNavigateMonth: (amount: number) => void;
  onGoToToday: () => void;
  onOpenLog: () => void;
  onOpenLearn: () => void;
  /** Smaller stacked month + log panel for Tracker side column. */
  compact?: boolean;
  /** Stretch card to match the other column’s height. */
  fillHeight?: boolean;
}) {
  const selectedPrediction = getCyclePrediction(
    trackerState.cycles,
    trackerState.settings,
    fromIsoDate(selectedDate),
  );
  const selectedLog = logs[selectedDate];

  return (
    <section
      className={`rounded-3xl border border-[#E9DDE3] bg-white/75 shadow-sm ${
        compact ? "p-3 sm:p-4" : "p-4 sm:p-5"
      } ${fillHeight ? "flex h-full min-h-0 flex-col" : ""}`}
      data-testid="cycle-month-calendar"
      data-compact={compact ? "true" : "false"}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onNavigateMonth(-1)}
          className={`grid place-items-center rounded-full border border-[#E4D8DE] bg-white text-[#5B4E55] transition hover:border-[#D47EA0] focus:outline-none focus:ring-2 focus:ring-[#D47EA0] ${
            compact ? "h-8 w-8 text-lg" : "h-9 w-9 text-xl"
          }`}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="min-w-0 text-center">
          <h2
            className={`font-bold text-[#241B21] ${
              compact ? "text-sm sm:text-base" : "text-lg"
            }`}
          >
            {new Intl.DateTimeFormat("en", {
              month: compact ? "short" : "long",
              year: "numeric",
            }).format(monthDate)}
          </h2>
          <button
            type="button"
            onClick={onGoToToday}
            className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-[#A04464] transition hover:underline focus:outline-none"
          >
            Today
          </button>
        </div>
        <button
          type="button"
          onClick={() => onNavigateMonth(1)}
          className={`grid place-items-center rounded-full border border-[#E4D8DE] bg-white text-[#5B4E55] transition hover:border-[#D47EA0] focus:outline-none focus:ring-2 focus:ring-[#D47EA0] ${
            compact ? "h-8 w-8 text-lg" : "h-9 w-9 text-xl"
          }`}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Compact: month above, log panel below. Full: month | log side by side. */}
      <div
        className={
          compact
            ? `mt-3 flex flex-col gap-3 ${fillHeight ? "min-h-0 flex-1" : ""}`
            : "mt-5 grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)] md:items-start md:gap-6"
        }
      >
        <div>
          <MonthDots
            monthDate={monthDate}
            selectedDate={selectedDate}
            prediction={prediction}
            logs={logs}
            onSelectDate={onSelectDate}
            compact={compact}
          />
          {!compact && <CalendarLegend />}
          {compact && <CalendarLegend compact />}
        </div>
        <SelectedDayPanel
          selectedDate={selectedDate}
          selectedPrediction={selectedPrediction}
          selectedLog={selectedLog}
          onOpenLog={onOpenLog}
          onOpenLearn={onOpenLearn}
          compact={compact}
          grow={fillHeight}
        />
      </div>
    </section>
  );
}

function MonthDots({
  monthDate,
  selectedDate,
  prediction,
  logs,
  onSelectDate,
  compact = false,
}: {
  monthDate: Date;
  selectedDate: string;
  prediction: CyclePrediction;
  logs: Record<string, DailyLog>;
  onSelectDate: (date: string) => void;
  compact?: boolean;
}) {
  const today = toIsoDate(new Date());
  const days = buildMonthDays(monthDate, today).filter((day) => day.isCurrentMonth);
  const leadingOffset = fromIsoDate(days[0].date).getDay();

  return (
    <div className="min-w-0">
      <div
        className={`mb-2 grid grid-cols-7 text-center font-bold text-[#B1A3AA] ${
          compact ? "text-[9px]" : "mb-3 text-[10px]"
        }`}
      >
        {weekdays.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div
        className={`grid grid-cols-7 content-start text-center ${
          compact ? "min-h-0 gap-y-1.5" : "min-h-[226px] gap-y-4"
        }`}
      >
        {Array.from({ length: leadingOffset }, (_, index) => (
          <span key={`blank-${index}`} />
        ))}
        {days.map((day) => (
          <CalendarDot
            key={day.date}
            date={day.date}
            day={day.dayOfMonth}
            selected={day.date === selectedDate}
            today={day.date === today}
            log={logs[day.date]}
            predictedPeriod={isPredictedPeriodDate(day.date, prediction)}
            estimatedOvulation={day.date === prediction.estimatedOvulation}
            onClick={() => onSelectDate(day.date)}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

function CalendarDot({
  date,
  day,
  selected,
  today,
  log,
  predictedPeriod,
  estimatedOvulation,
  onClick,
  compact = false,
}: {
  date: string;
  day: number;
  selected: boolean;
  today: boolean;
  log?: DailyLog;
  predictedPeriod: boolean;
  estimatedOvulation: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  const hasPeriod = Boolean(log && log.periodFlow !== "none");
  let stateClass = "text-[#3D3339] hover:bg-[#F6EBF0]";

  if (predictedPeriod) {
    stateClass = "border border-dashed border-[#DF88A7] bg-[#FFF5F8] text-[#C7537B]";
  }
  if (estimatedOvulation) {
    stateClass = "border border-dashed border-[#55BFA0] bg-[#F1FAF7] text-[#25886C]";
  }
  if (log) stateClass = "bg-[#DDF2E7] text-[#25624F]";
  if (hasPeriod) stateClass = "bg-[#F26682] text-white";
  if (today || selected) {
    stateClass = "bg-[#8D62C3] text-white shadow-[0_5px_14px_rgba(112,72,159,0.25)]";
  }

  const labelParts = [date];
  if (today) labelParts.push("today");
  if (hasPeriod) labelParts.push(`${log?.periodFlow} period flow`);
  else if (log) labelParts.push("logged day");
  if (predictedPeriod) labelParts.push("predicted period");
  if (estimatedOvulation) labelParts.push("estimated ovulation");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={labelParts.join(", ")}
      aria-pressed={selected}
      className={`relative mx-auto grid place-items-center rounded-full font-semibold transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D47EA0] focus:ring-offset-1 ${
        compact ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-sm"
      } ${stateClass}`}
    >
      {!compact && today && (
        <span className="absolute -top-3 text-[7px] font-bold uppercase text-[#392E35]">
          Today
        </span>
      )}
      {day}
      {predictedPeriod && !hasPeriod && (
        <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-[#D95C87]" />
      )}
    </button>
  );
}

function CalendarLegend({ compact = false }: { compact?: boolean }) {
  const items = [
    { label: "Period", className: "bg-[#F26682]" },
    { label: "Log", className: "bg-[#DDF2E7]" },
    { label: "Predicted", className: "border border-dashed border-[#DF88A7] bg-[#FFF5F8]" },
  ];

  return (
    <div
      className={`flex flex-wrap gap-x-3 gap-y-1 border-[#EDE2E7] ${
        compact
          ? "mt-2 justify-start border-t pt-2"
          : "mt-2 justify-center gap-x-4 gap-y-2 border-y py-3"
      }`}
    >
      {items.map((item) => (
        <span
          key={item.label}
          className={`inline-flex items-center gap-1.5 font-semibold text-[#756970] ${
            compact ? "text-[9px]" : "text-[10px]"
          }`}
        >
          <span className={`rounded-full ${compact ? "h-2 w-2" : "h-2.5 w-2.5"} ${item.className}`} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function SelectedDayPanel({
  selectedDate,
  selectedPrediction,
  selectedLog,
  onOpenLog,
  onOpenLearn,
  compact = false,
  grow = false,
}: {
  selectedDate: string;
  selectedPrediction: CyclePrediction;
  selectedLog?: DailyLog;
  onOpenLog: () => void;
  onOpenLearn: () => void;
  compact?: boolean;
  grow?: boolean;
}) {
  const summaries = [
    { icon: "●", label: selectedLog?.periodFlow ?? "No flow" },
    { icon: "✿", label: selectedLog?.symptoms[0] ?? "No symptoms" },
    { icon: "☺", label: selectedLog?.moods[0] ?? "No mood" },
    { icon: "☾", label: selectedLog?.sleep ?? "No sleep" },
  ];

  return (
    <div
      className={`rounded-2xl border border-[#E3D8DF] bg-[#FFF9FB] ${
        compact ? "p-3" : "p-4 sm:p-5"
      } ${grow ? "flex min-h-0 flex-1 flex-col" : ""}`}
      data-testid="selected-day-panel"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#A04464]">
            {formatLongDate(selectedDate)}
          </p>
          <h3
            className={`mt-1 font-bold text-[#241B21] ${
              compact ? "text-base" : "text-xl"
            }`}
          >
            Cycle day {selectedPrediction.currentCycleDay}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-[#74676E]">
            {phaseLabels[selectedPrediction.estimatedPhase]} phase
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenLog}
          data-testid="selected-day-log"
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#E9547C] text-sm font-bold text-white shadow-[0_8px_20px_rgba(233,84,124,0.22)] transition hover:bg-[#D94870] focus:outline-none focus:ring-2 focus:ring-[#E9547C] focus:ring-offset-2 ${
            compact ? "h-9 px-3" : "h-11 gap-2 px-4"
          }`}
        >
          <span className="text-lg leading-none">+</span>
          {selectedLog ? "Edit" : "Log"}
        </button>
      </div>

      {!compact && (
        <p className="mt-3 text-xs text-[#6E6168]">
          Tap a day on the calendar, then log flow, symptoms, or mood here.
        </p>
      )}

      <div
        className={`mt-3 grid gap-2 ${
          compact ? "grid-cols-4" : "grid-cols-2 sm:grid-cols-4 md:grid-cols-2"
        }`}
      >
        {summaries.map((summary, index) => (
          <button
            key={`${summary.label}-${index}`}
            type="button"
            onClick={onOpenLog}
            className={`min-w-0 rounded-[8px] border border-[#ECE1E6] bg-white text-center transition hover:border-[#E89BB5] hover:bg-[#FFF1F6] focus:outline-none focus:ring-2 focus:ring-[#D47EA0] ${
              compact ? "px-1 py-2" : "px-1.5 py-3"
            }`}
          >
            <span className={`block text-[#A74265] ${compact ? "text-base" : "text-lg"}`}>
              {summary.icon}
            </span>
            <span className="mt-1 block truncate text-[9px] font-semibold capitalize text-[#62565D]">
              {summary.label}
            </span>
          </button>
        ))}
      </div>

      {grow && (
        <p className="mt-auto pt-4 text-xs leading-relaxed text-[#6E6168]">
          Tip: tap any day on the calendar, then Log. Your patterns and printable
          GP summary are on Health report — this column is just for checking in.
        </p>
      )}

      {!compact && (
        <button
          type="button"
          onClick={onOpenLearn}
          className="mt-4 flex w-full items-center justify-between rounded-[8px] border border-[#E5D9EA] bg-[#F2ECF8] px-4 py-3 text-left transition hover:border-[#B999D5] hover:bg-[#EEE4F7] focus:outline-none focus:ring-2 focus:ring-[#9D73C8]"
        >
          <span>
            <span className="block text-sm font-bold text-[#392947]">
              Practise on Menstrome Island
            </span>
            <span className="mt-0.5 block text-xs text-[#776881]">
              Real-life scenarios for this phase
            </span>
          </span>
          <span className="text-xl text-[#78559B]">›</span>
        </button>
      )}
    </div>
  );
}
