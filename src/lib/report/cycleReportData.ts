import type { DailyLog, TrackerState } from "@/app/tracker/_types/tracker";
import { addDays, toIsoDate } from "@/app/tracker/_lib/dateUtils";

export type ReportRangePreset = "30d" | "90d" | "all";

export const REPORT_RANGE_PRESETS: {
  id: ReportRangePreset;
  label: string;
}[] = [
  { id: "90d", label: "Last 3 months" },
  { id: "30d", label: "Last 1 month" },
  { id: "all", label: "All logs" },
];

function maxIso(a: string, b: string): string {
  return a >= b ? a : b;
}

function minIso(a: string, b: string): string {
  return a <= b ? a : b;
}

export function resolveReportRange(
  preset: ReportRangePreset,
  today: Date = new Date(),
  logDates: { earliest?: string; latest?: string } = {},
): { fromIso: string; toIso: string } {
  const todayIso = toIsoDate(today);
  const toIso = logDates.latest ? maxIso(todayIso, logDates.latest) : todayIso;
  if (preset === "30d") {
    return { fromIso: addDays(toIso, -29), toIso };
  }
  if (preset === "90d") {
    return { fromIso: addDays(toIso, -89), toIso };
  }
  const fromIso = logDates.earliest
    ? minIso(logDates.earliest, toIso)
    : toIso;
  return { fromIso, toIso };
}

export function logDateBounds(
  logs: Record<string, { date: string }>,
): { earliest?: string; latest?: string } {
  const dates = Object.keys(logs).sort();
  if (dates.length === 0) return {};
  return { earliest: dates[0], latest: dates[dates.length - 1] };
}

export function filterLogsInRange(
  state: TrackerState,
  fromIso: string,
  toIso: string,
): DailyLog[] {
  return Object.values(state.logs)
    .filter((log) => log.date >= fromIso && log.date <= toIso)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function countMap(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

export function summarizeLogs(logs: DailyLog[]) {
  const periodDays = logs.filter((log) => log.periodFlow !== "none").length;
  const symptoms = countMap(logs.flatMap((log) => log.symptoms));
  const moods = countMap(logs.flatMap((log) => log.moods));
  const pain = countMap(
    logs.flatMap((log) =>
      Object.entries(log.painSeverity ?? {})
        .filter(([, level]) => level && level !== "none")
        .map(([symptom, level]) => `${symptom}:${level}`),
    ),
  );
  const flow = countMap(logs.map((log) => log.periodFlow));
  return { periodDays, symptoms, moods, pain, flow, logCount: logs.length };
}

export function formatPain(log: DailyLog): string {
  const entries = Object.entries(log.painSeverity ?? {}).filter(
    ([, level]) => level && level !== "none",
  );
  if (entries.length === 0) return "—";
  return entries.map(([symptom, level]) => `${symptom} ${level}`).join(", ");
}

