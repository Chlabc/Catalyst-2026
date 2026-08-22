import type { DailyLog } from "@/app/tracker/_types/tracker";
import { toIsoDate } from "@/app/tracker/_lib/dateUtils";
import { getEffectiveCycles } from "@/app/tracker/_lib/cyclePredictions";
import {
  readTrackerState,
  writeTrackerState,
  writeTrackerStateToBackend,
} from "@/app/tracker/_lib/storage";

/** Log today as cycle day 1 from the Cylendra lesson. */
export async function logIslandDayOne(): Promise<{
  alreadyLogged: boolean;
  date: string;
}> {
  const date = toIsoDate(new Date());
  const state = readTrackerState();
  const existing = state.logs[date];
  const alreadyLogged = Boolean(existing && existing.periodFlow !== "none");

  if (alreadyLogged) {
    return { alreadyLogged: true, date };
  }

  const log: DailyLog = {
    date,
    periodFlow: existing?.periodFlow === "none" || !existing ? "medium" : existing.periodFlow,
    symptoms: existing?.symptoms ?? [],
    moods: existing?.moods ?? [],
    energy: existing?.energy,
    sleep: existing?.sleep,
    discharge: existing?.discharge,
    activity: existing?.activity,
    painSeverity: existing?.painSeverity,
    medication: existing?.medication,
    notes: existing?.notes,
  };

  const logs = { ...state.logs, [date]: log };
  const next = {
    ...state,
    logs,
    cycles: getEffectiveCycles(state.cycles, logs),
  };

  try {
    await writeTrackerStateToBackend(next);
  } catch {
    writeTrackerState(next);
  }

  return { alreadyLogged: false, date };
}
