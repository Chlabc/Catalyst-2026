import type {
  CyclePhase,
  CyclePrediction,
  CycleRecord,
  DailyLog,
  TrackerSettings,
} from "../_types/tracker";
import { addDays, daysBetween, toIsoDate } from "./dateUtils";

export const phaseLabels: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulatory: "Ovulatory",
  luteal: "Luteal",
};

export const phaseDescriptions: Record<CyclePhase, string> = {
  menstrual:
    "Bleeding is commonly happening now. Rest, hydration, and preparation can help this phase feel more manageable.",
  follicular:
    "Energy may begin to lift as the body moves toward ovulation. This can be a good time to notice changing patterns.",
  ovulatory:
    "Ovulation is estimated around this point for many cycles, but timing varies from person to person and cycle to cycle.",
  luteal:
    "The body is commonly preparing for the next period. Mood, energy, skin, sleep, or cramps may shift for some people.",
};

export const phasePalette: Record<
  CyclePhase,
  { bg: string; text: string; ring: string }
> = {
  menstrual: {
    bg: "bg-rose-100",
    text: "text-rose-700",
    ring: "#e45b72",
  },
  follicular: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    ring: "#e8a73d",
  },
  ovulatory: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    ring: "#39a878",
  },
  luteal: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    ring: "#6d73d9",
  },
};

export function getAverageCycleLength(
  cycles: CycleRecord[],
  settings: TrackerSettings,
): number {
  const lengths = cycles
    .map((cycle) => cycle.cycleLength)
    .filter((length): length is number => Boolean(length));

  if (lengths.length === 0) {
    return settings.defaultCycleLength;
  }

  return Math.round(
    lengths.reduce((total, length) => total + length, 0) / lengths.length,
  );
}

export function getAveragePeriodLength(
  cycles: CycleRecord[],
  settings: TrackerSettings,
): number {
  const lengths = cycles
    .map((cycle) => cycle.periodLength)
    .filter((length): length is number => Boolean(length));

  if (lengths.length === 0) {
    return settings.defaultPeriodLength;
  }

  return Math.round(
    lengths.reduce((total, length) => total + length, 0) / lengths.length,
  );
}

export function estimatePhase(
  currentCycleDay: number,
  periodLength: number,
  cycleLength: number,
): CyclePhase {
  const ovulationDay = Math.max(11, cycleLength - 14);

  if (currentCycleDay <= periodLength) {
    return "menstrual";
  }

  if (currentCycleDay >= ovulationDay - 1 && currentCycleDay <= ovulationDay + 1) {
    return "ovulatory";
  }

  if (currentCycleDay < ovulationDay) {
    return "follicular";
  }

  return "luteal";
}

export function getCyclePrediction(
  cycles: CycleRecord[],
  settings: TrackerSettings,
  today: Date = new Date(),
): CyclePrediction {
  const todayIso = toIsoDate(today);
  const cycleLength = getAverageCycleLength(cycles, settings);
  const periodLength = getAveragePeriodLength(cycles, settings);
  const latestCycle = [...cycles]
    .filter((cycle) => cycle.startDate <= todayIso)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .at(-1);
  const currentCycleStart =
    latestCycle?.startDate ?? addDays(todayIso, -(Math.floor(cycleLength / 2) - 1));
  const elapsedDays = Math.max(0, daysBetween(currentCycleStart, todayIso));
  const currentCycleDay = (elapsedDays % cycleLength) + 1;
  const cycleOffset = Math.floor(elapsedDays / cycleLength);
  const predictedNextPeriod = addDays(
    currentCycleStart,
    (cycleOffset + 1) * cycleLength,
  );
  const estimatedOvulation = addDays(predictedNextPeriod, -14);

  return {
    today: todayIso,
    currentCycleDay,
    estimatedPhase: estimatePhase(currentCycleDay, periodLength, cycleLength),
    predictedNextPeriod,
    daysUntilNextPeriod: Math.max(0, daysBetween(todayIso, predictedNextPeriod)),
    averageCycleLength: cycleLength,
    averagePeriodLength: periodLength,
    estimatedOvulation,
  };
}

export function buildCyclesFromLogs(logs: Record<string, DailyLog>): CycleRecord[] {
  const periodDates = Object.values(logs)
    .filter((log) => log.periodFlow !== "none")
    .map((log) => log.date)
    .sort();

  if (periodDates.length === 0) {
    return [];
  }

  const ranges: { startDate: string; endDate: string }[] = [];
  let currentStart = periodDates[0];
  let previousDate = periodDates[0];

  for (const date of periodDates.slice(1)) {
    if (daysBetween(previousDate, date) > 1) {
      ranges.push({ startDate: currentStart, endDate: previousDate });
      currentStart = date;
    }

    previousDate = date;
  }

  ranges.push({ startDate: currentStart, endDate: previousDate });

  return ranges.map((range, index) => {
    const nextRange = ranges[index + 1];
    const periodLength = daysBetween(range.startDate, range.endDate) + 1;

    return {
      id: `log-cycle-${range.startDate}`,
      startDate: range.startDate,
      endDate: range.endDate,
      periodLength,
      cycleLength: nextRange
        ? daysBetween(range.startDate, nextRange.startDate)
        : undefined,
    };
  });
}

export function getEffectiveCycles(
  savedCycles: CycleRecord[],
  logs: Record<string, DailyLog>,
): CycleRecord[] {
  const loggedCycles = buildCyclesFromLogs(logs);
  const byStartDate = new Map<string, CycleRecord>();

  for (const cycle of savedCycles) {
    byStartDate.set(cycle.startDate, cycle);
  }

  for (const cycle of loggedCycles) {
    byStartDate.set(cycle.startDate, {
      ...byStartDate.get(cycle.startDate),
      ...cycle,
    });
  }

  return [...byStartDate.values()].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );
}

export function isPredictedPeriodDate(
  date: string,
  prediction: CyclePrediction,
): boolean {
  const daysFromStart = daysBetween(prediction.predictedNextPeriod, date);

  return daysFromStart >= 0 && daysFromStart < prediction.averagePeriodLength;
}
