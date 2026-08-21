import type { SymptomTag } from "./symptoms";

export const LOGS_KEY = "menstramission_tracker_logs";
export const RATINGS_KEY = "menstramission_cycle_ratings";

export type Mood = "good" | "okay" | "low" | "irritable";
export type DayLog = { symptoms: SymptomTag[]; mood?: Mood };
export type Logs = Record<string, DayLog>;
export type Rating = "smooth" | "mild" | "difficult";

export function toKey(date: Date) {
  // Local date parts, not toISOString() — that converts to UTC first,
  // which silently shifts the date for any timezone ahead of UTC.
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function fromKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function normalizeLoadedLogs(raw: unknown): Logs {
  // Older builds stored a plain array of date strings — migrate that
  // shape into the new per-day object format instead of losing it.
  if (Array.isArray(raw)) {
    const migrated: Logs = {};
    for (const key of raw) {
      if (typeof key === "string") migrated[key] = { symptoms: [] };
    }
    return migrated;
  }
  if (raw && typeof raw === "object") return raw as Logs;
  return {};
}

export function computeCurrentStreak(
  logs: Logs,
): { startKey: string; length: number } | null {
  const keys = Object.keys(logs).sort();
  if (keys.length === 0) return null;

  const mostRecent = keys[keys.length - 1];
  let length = 1;
  let cursor = fromKey(mostRecent);

  for (;;) {
    const prevDay = new Date(cursor);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevKey = toKey(prevDay);
    if (logs[prevKey]) {
      length += 1;
      cursor = prevDay;
    } else {
      break;
    }
  }

  return { startKey: toKey(cursor), length };
}

// Safe to call from anywhere client-side (guards its own try/catch and
// SSR check) — used by both the tracker page and the homepage summary.
export function readLogsFromStorage(): Logs {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOGS_KEY);
    return raw ? normalizeLoadedLogs(JSON.parse(raw)) : {};
  } catch {
    return {};
  }
}
