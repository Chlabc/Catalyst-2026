import type {
  ActivityLevel,
  CycleRecord,
  DailyLog,
  DischargeType,
  EnergyLevel,
  Mood,
  PainSeverity,
  PeriodFlow,
  SleepQuality,
  Symptom,
  TrackerState,
} from "../_types/tracker";

export const TRACKER_STORAGE_KEY = "menstramission.tracker.v1";
const STORAGE_KEY = TRACKER_STORAGE_KEY;
const API_URL = "/tracker/api/state";

export const emptyTrackerState: TrackerState = {
  cycles: [],
  logs: {},
  settings: {
    defaultCycleLength: 28,
    defaultPeriodLength: 5,
    dailyLogReminder: false,
    periodPrepReminder: false,
  },
};

const periodFlows = new Set<PeriodFlow>([
  "none",
  "spotting",
  "light",
  "medium",
  "heavy",
]);
const symptoms = new Set<Symptom>([
  "cramps",
  "headache",
  "bloating",
  "acne",
  "breastTenderness",
  "backPain",
  "fatigue",
  "nausea",
]);
const moods = new Set<Mood>([
  "happy",
  "calm",
  "sensitive",
  "anxious",
  "irritated",
  "sad",
  "stressed",
]);
const energyLevels = new Set<EnergyLevel>(["low", "medium", "high"]);
const sleepQualities = new Set<SleepQuality>(["poor", "okay", "good"]);
const dischargeTypes = new Set<DischargeType>([
  "none",
  "sticky",
  "creamy",
  "watery",
  "eggWhite",
]);
const activityLevels = new Set<ActivityLevel>([
  "none",
  "light",
  "moderate",
  "intense",
]);
const painSeverities = new Set<PainSeverity>([
  "none",
  "mild",
  "moderate",
  "strong",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function boundedNumber(
  value: unknown,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(maximum, Math.max(minimum, Math.round(value)))
    : fallback;
}

function optionalEnum<T extends string>(
  value: unknown,
  allowed: Set<T>,
): T | undefined {
  return typeof value === "string" && allowed.has(value as T)
    ? (value as T)
    : undefined;
}

function normalizeCycle(value: unknown, index: number): CycleRecord | null {
  if (!isRecord(value) || !isIsoDate(value.startDate)) {
    return null;
  }

  const cycle: CycleRecord = {
    id:
      typeof value.id === "string" && value.id.trim()
        ? value.id.slice(0, 120)
        : `cycle-${value.startDate}-${index}`,
    startDate: value.startDate,
  };

  if (isIsoDate(value.endDate)) {
    cycle.endDate = value.endDate;
  }

  if (typeof value.cycleLength === "number") {
    cycle.cycleLength = boundedNumber(value.cycleLength, 28, 15, 90);
  }

  if (typeof value.periodLength === "number") {
    cycle.periodLength = boundedNumber(value.periodLength, 5, 1, 20);
  }

  return cycle;
}

function normalizeLog(value: unknown, key: string): DailyLog | null {
  if (!isRecord(value)) {
    return null;
  }

  const date = isIsoDate(value.date) ? value.date : key;

  if (!isIsoDate(date)) {
    return null;
  }

  const periodFlow = optionalEnum(value.periodFlow, periodFlows) ?? "none";
  const normalizedSymptoms = Array.isArray(value.symptoms)
    ? [...new Set(value.symptoms.filter((item): item is Symptom =>
        typeof item === "string" && symptoms.has(item as Symptom),
      ))]
    : [];
  const normalizedMoods = Array.isArray(value.moods)
    ? [...new Set(value.moods.filter((item): item is Mood =>
        typeof item === "string" && moods.has(item as Mood),
      ))]
    : [];
  const log: DailyLog = {
    date,
    periodFlow,
    symptoms: normalizedSymptoms,
    moods: normalizedMoods,
  };
  const energy = optionalEnum(value.energy, energyLevels);
  const sleep = optionalEnum(value.sleep, sleepQualities);
  const discharge = optionalEnum(value.discharge, dischargeTypes);
  const activity = optionalEnum(value.activity, activityLevels);

  if (energy) log.energy = energy;
  if (sleep) log.sleep = sleep;
  if (discharge) log.discharge = discharge;
  if (activity) log.activity = activity;

  if (isRecord(value.painSeverity)) {
    const painSeverity: DailyLog["painSeverity"] = {};

    for (const symptom of normalizedSymptoms) {
      const severity = optionalEnum(value.painSeverity[symptom], painSeverities);
      if (severity) painSeverity[symptom] = severity;
    }

    if (Object.keys(painSeverity).length > 0) {
      log.painSeverity = painSeverity;
    }
  }

  if (typeof value.medication === "string" && value.medication.trim()) {
    log.medication = value.medication.trim().slice(0, 160);
  }

  if (typeof value.notes === "string" && value.notes.trim()) {
    log.notes = value.notes.trim().slice(0, 1200);
  }

  return log;
}

export function normalizeTrackerState(value: unknown): TrackerState {
  if (!isRecord(value)) {
    return emptyTrackerState;
  }

  const rawCycles = Array.isArray(value.cycles) ? value.cycles : [];
  const rawLogs = isRecord(value.logs) ? value.logs : {};
  const rawSettings = isRecord(value.settings) ? value.settings : {};
  const normalizedLogs: Record<string, DailyLog> = {};

  for (const [key, rawLog] of Object.entries(rawLogs).slice(0, 1500)) {
    const log = normalizeLog(rawLog, key);
    if (log) normalizedLogs[log.date] = log;
  }

  return {
    cycles: rawCycles
      .slice(0, 240)
      .map(normalizeCycle)
      .filter((cycle): cycle is CycleRecord => cycle !== null),
    logs: normalizedLogs,
    settings: {
      defaultCycleLength: boundedNumber(
        rawSettings.defaultCycleLength,
        emptyTrackerState.settings.defaultCycleLength,
        21,
        45,
      ),
      defaultPeriodLength: boundedNumber(
        rawSettings.defaultPeriodLength,
        emptyTrackerState.settings.defaultPeriodLength,
        2,
        10,
      ),
      dailyLogReminder:
        typeof rawSettings.dailyLogReminder === "boolean"
          ? rawSettings.dailyLogReminder
          : false,
      periodPrepReminder:
        typeof rawSettings.periodPrepReminder === "boolean"
          ? rawSettings.periodPrepReminder
          : false,
    },
  };
}

export function readTrackerState(): TrackerState {
  if (typeof window === "undefined") {
    return emptyTrackerState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return emptyTrackerState;
    }

    return normalizeTrackerState(JSON.parse(stored));
  } catch {
    return emptyTrackerState;
  }
}

export function writeTrackerState(state: TrackerState): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function readTrackerStateFromBackend(): Promise<TrackerState> {
  try {
    const response = await fetch(API_URL, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to load tracker state.");
    }

    const state = normalizeTrackerState(await response.json());
    writeTrackerState(state);

    return state;
  } catch {
    return readTrackerState();
  }
}

export async function writeTrackerStateToBackend(
  state: TrackerState,
): Promise<TrackerState> {
  writeTrackerState(state);

  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });

  if (!response.ok) {
    throw new Error("Unable to save tracker state.");
  }

  const savedState = normalizeTrackerState(await response.json());
  writeTrackerState(savedState);

  return savedState;
}
