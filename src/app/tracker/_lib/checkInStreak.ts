import type { DailyLog } from "../_types/tracker";
import { addDays } from "./dateUtils";

export type WeekCheckIn = {
  date: string;
  weekday: string;
  logged: boolean;
  isToday: boolean;
};

export type CheckInStreak = {
  /** Consecutive days ending today, or yesterday if today is still open. */
  current: number;
  longest: number;
  /** One blossom per unique day with a log — lifetime, not a visit counter. */
  blossoms: number;
  loggedToday: boolean;
  /** Streak is live but today is not saved yet. */
  atRisk: boolean;
  week: WeekCheckIn[];
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"] as const;

function hasLog(logs: Record<string, DailyLog>, date: string): boolean {
  return Boolean(logs[date]);
}

function consecutiveEndingOn(
  logs: Record<string, DailyLog>,
  endDate: string,
): number {
  if (!hasLog(logs, endDate)) return 0;

  let length = 0;
  let cursor = endDate;
  while (hasLog(logs, cursor)) {
    length += 1;
    cursor = addDays(cursor, -1);
  }
  return length;
}

function longestRun(logs: Record<string, DailyLog>): number {
  const keys = Object.keys(logs).sort();
  if (keys.length === 0) return 0;

  let best = 1;
  let run = 1;
  for (let i = 1; i < keys.length; i += 1) {
    if (keys[i] === addDays(keys[i - 1], 1)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 1;
    }
  }
  return best;
}

function weekEndingToday(logs: Record<string, DailyLog>, today: string): WeekCheckIn[] {
  const start = addDays(today, -6);
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const weekdayIndex = new Date(
      Number(date.slice(0, 4)),
      Number(date.slice(5, 7)) - 1,
      Number(date.slice(8, 10)),
    ).getDay();
    return {
      date,
      weekday: WEEKDAYS[weekdayIndex],
      logged: hasLog(logs, date),
      isToday: date === today,
    };
  });
}

/**
 * Duolingo-style check-in streak from daily logs.
 * Any saved log counts (including "no period") so the streak never asks
 * someone to invent bleeding. Back-filling a gap in the past does not
 * revive a broken current streak unless the days reach today/yesterday.
 */
export function getCheckInStreak(
  logs: Record<string, DailyLog>,
  today: string,
): CheckInStreak {
  const loggedToday = hasLog(logs, today);
  const yesterday = addDays(today, -1);
  const current = loggedToday
    ? consecutiveEndingOn(logs, today)
    : consecutiveEndingOn(logs, yesterday);
  const longest = Math.max(longestRun(logs), current);

  return {
    current,
    longest,
    blossoms: Object.keys(logs).length,
    loggedToday,
    atRisk: current > 0 && !loggedToday,
    week: weekEndingToday(logs, today),
  };
}
