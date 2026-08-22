"use client";

import { useState } from "react";
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
  onSelectMonth,
  onGoToToday,
  onClose,
  onOpenLog,
  onOpenLearn,
}: {
  monthDate: Date;
  selectedDate: string;
  prediction: CyclePrediction;
  logs: Record<string, DailyLog>;
  trackerState: TrackerState;
  onSelectDate: (date: string) => void;
  onNavigateMonth: (amount: number) => void;
  onSelectMonth: (date: Date) => void;
  onGoToToday: () => void;
  onClose: () => void;
  onOpenLog: () => void;
  onOpenLearn: () => void;
}) {
  const [mode, setMode] = useState<"month" | "year">("month");
  const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  const selectedPrediction = getCyclePrediction(
    trackerState.cycles,
    trackerState.settings,
    fromIsoDate(selectedDate),
  );
  const selectedLog = logs[selectedDate];
  const navigationAmount = mode === "month" ? 1 : 12;

  return (
    <section className="min-h-[calc(100vh-72px)] px-4 pb-8 pt-1 sm:px-0">
      <div className="flex items-center justify-between gap-3 border-b border-[#E9DDE3] pb-4">
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-3xl font-light leading-none text-[#342831] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
          aria-label="Close calendar"
        >
          ×
        </button>
        <div className="grid grid-cols-2 rounded-full bg-[#E8E3E6] p-1 text-xs font-bold text-[#4B4147]">
          {(["month", "year"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-6 py-2 capitalize transition focus:outline-none focus:ring-2 focus:ring-[#D47EA0] ${
                mode === item ? "bg-white text-[#241B21] shadow-sm" : "text-[#766B71]"
              }`}
              aria-pressed={mode === item}
            >
              {item}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onGoToToday}
          className="h-9 shrink-0 rounded-full px-2 text-[10px] font-bold text-[#A04464] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
        >
          Today
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigateMonth(-navigationAmount)}
          className="grid h-9 w-9 place-items-center rounded-full border border-[#E4D8DE] bg-white text-xl text-[#5B4E55] transition hover:border-[#D47EA0] focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
          aria-label={mode === "month" ? "Previous month" : "Previous year"}
        >
          ‹
        </button>
        <h1 className="text-lg font-bold text-[#241B21]">
          {mode === "month"
            ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(monthDate)
            : monthDate.getFullYear()}
        </h1>
        <button
          type="button"
          onClick={() => onNavigateMonth(navigationAmount)}
          className="grid h-9 w-9 place-items-center rounded-full border border-[#E4D8DE] bg-white text-xl text-[#5B4E55] transition hover:border-[#D47EA0] focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
          aria-label={mode === "month" ? "Next month" : "Next year"}
        >
          ›
        </button>
      </div>

      {mode === "month" ? (
        <>
          <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-6">
            <MonthDots
              monthDate={monthDate}
              selectedDate={selectedDate}
              prediction={prediction}
              logs={logs}
              onSelectDate={onSelectDate}
            />
            <MonthDots
              monthDate={nextMonth}
              selectedDate={selectedDate}
              prediction={prediction}
              logs={logs}
              onSelectDate={onSelectDate}
            />
          </div>
          <CalendarLegend />
          <SelectedDayPanel
            selectedDate={selectedDate}
            selectedPrediction={selectedPrediction}
            selectedLog={selectedLog}
            onOpenLog={onOpenLog}
            onOpenLearn={onOpenLearn}
          />
        </>
      ) : (
        <YearOverview
          year={monthDate.getFullYear()}
          logs={logs}
          prediction={prediction}
          onSelectMonth={(month) => {
            onSelectMonth(new Date(monthDate.getFullYear(), month, 1));
            setMode("month");
          }}
        />
      )}
    </section>
  );
}

function MonthDots({
  monthDate,
  selectedDate,
  prediction,
  logs,
  onSelectDate,
}: {
  monthDate: Date;
  selectedDate: string;
  prediction: CyclePrediction;
  logs: Record<string, DailyLog>;
  onSelectDate: (date: string) => void;
}) {
  const today = toIsoDate(new Date());
  const days = buildMonthDays(monthDate, today).filter((day) => day.isCurrentMonth);
  const leadingOffset = fromIsoDate(days[0].date).getDay();

  return (
    <div className="min-w-0">
      <h2 className="mb-5 text-center text-base font-bold text-[#33272E]">
        {new Intl.DateTimeFormat("en", { month: "long" }).format(monthDate)}
      </h2>
      <div className="mb-3 grid grid-cols-7 text-center text-[10px] font-bold text-[#B1A3AA]">
        {weekdays.map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="grid min-h-[226px] grid-cols-7 content-start gap-y-4 text-center">
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
}: {
  date: string;
  day: number;
  selected: boolean;
  today: boolean;
  log?: DailyLog;
  predictedPeriod: boolean;
  estimatedOvulation: boolean;
  onClick: () => void;
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
      className={`relative mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-semibold transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D47EA0] focus:ring-offset-2 ${stateClass}`}
    >
      {today && (
        <span className="absolute -top-3 text-[7px] font-bold uppercase text-[#392E35]">
          Today
        </span>
      )}
      {day}
      {predictedPeriod && !hasPeriod && (
        <span className="absolute -bottom-1 h-1.5 w-1.5 rounded-full bg-[#D95C87]" />
      )}
    </button>
  );
}

function CalendarLegend() {
  const items = [
    { label: "Period log", className: "bg-[#F26682]" },
    { label: "Daily log", className: "bg-[#DDF2E7]" },
    { label: "Predicted", className: "border border-dashed border-[#DF88A7] bg-[#FFF5F8]" },
    { label: "Ovulation estimate", className: "border border-dashed border-[#55BFA0] bg-[#F1FAF7]" },
  ];

  return (
    <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2 border-y border-[#EDE2E7] py-3">
      {items.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#756970]">
          <span className={`h-2.5 w-2.5 rounded-full ${item.className}`} />
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
}: {
  selectedDate: string;
  selectedPrediction: CyclePrediction;
  selectedLog?: DailyLog;
  onOpenLog: () => void;
  onOpenLearn: () => void;
}) {
  const summaries = [
    { icon: "●", label: selectedLog?.periodFlow ?? "No flow" },
    { icon: "✿", label: selectedLog?.symptoms[0] ?? "No symptoms" },
    { icon: "☺", label: selectedLog?.moods[0] ?? "No mood" },
    { icon: "☾", label: selectedLog?.sleep ?? "No sleep" },
  ];

  return (
    <div className="mt-5 border-t border-[#E3D8DF] bg-white/70 py-5 md:px-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-[#A04464]">{formatLongDate(selectedDate)}</p>
          <h2 className="mt-1 text-xl font-bold text-[#241B21]">
            Cycle day {selectedPrediction.currentCycleDay}
          </h2>
          <p className="mt-1 text-sm font-medium text-[#74676E]">
            {phaseLabels[selectedPrediction.estimatedPhase]} phase
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenLog}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#E9547C] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(233,84,124,0.22)] transition hover:bg-[#D94870] focus:outline-none focus:ring-2 focus:ring-[#E9547C] focus:ring-offset-2"
        >
          <span className="text-lg">+</span>
          {selectedLog ? "Edit" : "Log"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {summaries.map((summary, index) => (
          <button
            key={`${summary.label}-${index}`}
            type="button"
            onClick={onOpenLog}
            className="min-w-0 rounded-[8px] border border-[#ECE1E6] bg-[#FBF7F9] px-1.5 py-3 text-center transition hover:border-[#E89BB5] hover:bg-[#FFF1F6] focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
          >
            <span className="block text-lg text-[#A74265]">{summary.icon}</span>
            <span className="mt-1 block truncate text-[9px] font-semibold capitalize text-[#62565D]">
              {summary.label}
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenLearn}
        className="mt-4 flex w-full items-center justify-between rounded-[8px] border border-[#E5D9EA] bg-[#F2ECF8] px-4 py-3 text-left transition hover:border-[#B999D5] hover:bg-[#EEE4F7] focus:outline-none focus:ring-2 focus:ring-[#9D73C8]"
      >
        <span>
          <span className="block text-sm font-bold text-[#392947]">
            {phaseLabels[selectedPrediction.estimatedPhase]} phase guide
          </span>
          <span className="mt-0.5 block text-xs text-[#776881]">
            Care, comfort, and body awareness
          </span>
        </span>
        <span className="text-xl text-[#78559B]">›</span>
      </button>
    </div>
  );
}

function YearOverview({
  year,
  logs,
  prediction,
  onSelectMonth,
}: {
  year: number;
  logs: Record<string, DailyLog>;
  prediction: CyclePrediction;
  onSelectMonth: (month: number) => void;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 12 }, (_, month) => {
        const monthDate = new Date(year, month, 1);
        const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
        const monthLogs = Object.values(logs).filter((log) => log.date.startsWith(monthPrefix));
        const periodDays = monthLogs.filter((log) => log.periodFlow !== "none").length;
        const predictedInMonth = prediction.predictedNextPeriod.startsWith(monthPrefix);

        return (
          <button
            key={month}
            type="button"
            onClick={() => onSelectMonth(month)}
            className="min-h-28 rounded-[8px] border border-[#E8DCE2] bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#E292AE] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-[#33272E]">
                {new Intl.DateTimeFormat("en", { month: "short" }).format(monthDate)}
              </span>
              <span className="text-lg text-[#B24C70]">›</span>
            </span>
            <span className="mt-5 flex h-7 items-end gap-1">
              {Array.from({ length: 8 }, (_, index) => (
                <span
                  key={index}
                  className={`flex-1 rounded-full ${
                    index % 3 === 0 ? "h-7" : index % 2 === 0 ? "h-4" : "h-2"
                  } ${
                    index < periodDays
                      ? "bg-[#EF6683]"
                      : predictedInMonth && index < prediction.averagePeriodLength
                        ? "bg-[#F7C4D4]"
                        : "bg-[#EEE7EA]"
                  }`}
                />
              ))}
            </span>
            <span className="mt-3 block text-[10px] font-semibold text-[#786B72]">
              {periodDays > 0
                ? `${periodDays} period day${periodDays === 1 ? "" : "s"}`
                : predictedInMonth
                  ? "Prediction available"
                  : `${monthLogs.length} logged day${monthLogs.length === 1 ? "" : "s"}`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
