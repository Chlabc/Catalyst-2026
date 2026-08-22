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

export function resolveReportRange(
  preset: ReportRangePreset,
  today: Date = new Date(),
  earliestLog?: string,
): { fromIso: string; toIso: string } {
  const toIso = toIsoDate(today);
  if (preset === "30d") {
    return { fromIso: addDays(toIso, -29), toIso };
  }
  if (preset === "90d") {
    return { fromIso: addDays(toIso, -89), toIso };
  }
  return { fromIso: earliestLog ?? toIso, toIso };
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
  return { periodDays, symptoms, moods, pain, logCount: logs.length };
}

export function formatPain(log: DailyLog): string {
  const entries = Object.entries(log.painSeverity ?? {}).filter(
    ([, level]) => level && level !== "none",
  );
  if (entries.length === 0) return "—";
  return entries.map(([symptom, level]) => `${symptom} ${level}`).join(", ");
}

export function earliestLogDate(
  logs: Record<string, { date: string }>,
): string | undefined {
  return Object.keys(logs).sort()[0];
}
