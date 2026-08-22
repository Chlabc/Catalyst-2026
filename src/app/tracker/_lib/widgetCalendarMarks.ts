import type { DailyLog, TrackerState } from "../_types/tracker";

export type WidgetCalendarMarks = {
  periodKeys: Set<string>;
  logKeys: Set<string>;
};

function isPeriodDay(log: DailyLog): boolean {
  return log.periodFlow !== "none";
}

/** Consecutive-day helper input: only days with period flow. */
export function periodDaysAsLogs(
  state: TrackerState,
): Record<string, { symptoms: [] }> {
  const logs: Record<string, { symptoms: [] }> = {};

  for (const [key, log] of Object.entries(state.logs)) {
    if (isPeriodDay(log)) {
      logs[key] = { symptoms: [] };
    }
  }

  return logs;
}

/** Derive compact homepage-widget marks from Aira tracker state. */
export function getWidgetCalendarMarks(
  state: TrackerState,
): WidgetCalendarMarks {
  const periodKeys = new Set<string>();
  const logKeys = new Set<string>();

  for (const [key, log] of Object.entries(state.logs)) {
    logKeys.add(key);
    if (isPeriodDay(log)) {
      periodKeys.add(key);
    }
  }

  return { periodKeys, logKeys };
}
