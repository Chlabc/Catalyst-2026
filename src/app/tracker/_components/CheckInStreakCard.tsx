"use client";

import type { DailyLog } from "../_types/tracker";
import { getCheckInStreak } from "../_lib/checkInStreak";

export function CheckInStreakCard({
  logs,
  today,
  onLogToday,
}: {
  logs: Record<string, DailyLog>;
  today: string;
  onLogToday: () => void;
}) {
  const streak = getCheckInStreak(logs, today);
  const headline =
    streak.current === 0
      ? "Start a check-in streak"
      : streak.current === 1
        ? "1-day streak"
        : `${streak.current}-day streak`;
  const detail = streak.loggedToday
    ? "You're checked in for today. Come back tomorrow."
    : streak.atRisk
      ? "Log today to keep it going — even “no period” counts."
      : "Log anything today to plant day 1. Private on this device.";

  return (
    <section
      className="rounded-2xl border-2 border-border bg-surface/85 p-4 shadow-sm sm:p-5"
      data-testid="check-in-streak"
      data-logged-today={streak.loggedToday ? "true" : "false"}
      data-streak={streak.current}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <StreakMark active={streak.current > 0} atRisk={streak.atRisk} />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-dark">
              Daily check-in
            </p>
            <h2 className="mt-0.5 text-xl font-semibold text-foreground">
              {headline}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-text-muted">
              {detail}
            </p>
          </div>
        </div>
        <p
          className="shrink-0 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-bold text-primary-dark"
          data-testid="blossom-points"
        >
          {streak.blossoms} bloom{streak.blossoms === 1 ? "" : "s"}
        </p>
      </div>

      <ol className="mt-4 flex justify-between gap-1">
        {streak.week.map((day) => (
          <li key={day.date} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-bold uppercase text-text-muted">
              {day.weekday}
            </span>
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold ${
                day.logged
                  ? "bg-primary text-white"
                  : day.isToday
                    ? "border-2 border-primary bg-primary-soft text-primary-dark"
                    : "border border-border bg-white/70 text-text-muted"
              }`}
              aria-label={`${day.date}${day.logged ? ", checked in" : ""}${day.isToday ? ", today" : ""}`}
              data-week-day={day.date}
              data-week-logged={day.logged ? "true" : "false"}
            >
              {day.logged ? "✓" : day.isToday ? "·" : ""}
            </span>
          </li>
        ))}
      </ol>

      {!streak.loggedToday && (
        <button
          type="button"
          onClick={onLogToday}
          className="mt-4 h-11 w-full rounded-full bg-primary text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          data-testid="streak-log-today"
        >
          {streak.atRisk ? "Log today to keep your streak" : "Log today"}
        </button>
      )}

      {streak.longest > streak.current && streak.current > 0 && (
        <p className="mt-3 text-center text-[11px] font-semibold text-text-muted">
          Best streak: {streak.longest} days
        </p>
      )}
    </section>
  );
}

function StreakMark({ active, atRisk }: { active: boolean; atRisk: boolean }) {
  return (
    <span
      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
        atRisk
          ? "bg-accent-soft text-accent"
          : active
            ? "bg-primary-soft text-primary"
            : "bg-secondary-soft text-secondary"
      }`}
      aria-hidden
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {active && !atRisk ? (
          <>
            <path
              d="M14 4c2.2 4 5.5 6.2 5.5 10.2A5.5 5.5 0 0 1 14 19.7a5.5 5.5 0 0 1-5.5-5.5C8.5 10.2 11.8 8 14 4Z"
              fill="currentColor"
            />
            <path
              d="M14 12.5c.8 1.4 2 2.2 2 3.6A2 2 0 0 1 14 18a2 2 0 0 1-2-1.9c0-1.4 1.2-2.2 2-3.6Z"
              fill="white"
              opacity="0.7"
            />
          </>
        ) : atRisk ? (
          <>
            <circle cx="14" cy="14" r="8" stroke="currentColor" strokeWidth="2" />
            <path
              d="M14 9v5.5l3 1.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        ) : (
          <>
            <circle cx="14" cy="20" r="3.5" fill="currentColor" opacity="0.45" />
            <rect x="12.5" y="10" width="3" height="10" rx="1.5" fill="currentColor" />
            <circle cx="14" cy="9" r="3" fill="currentColor" />
          </>
        )}
      </svg>
    </span>
  );
}
