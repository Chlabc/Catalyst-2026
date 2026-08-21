export type CyclePhase = "Menstrual" | "Follicular" | "Ovulation" | "Luteal";
export type DateRange = { start: string; end: string };
export type CyclePrediction = {
  averageCycleLength: number;
  historyPeriodStarts: string[];
  lastPeriodStart: string | null;
  predictedStart: string | null;
  predictedPeriod: DateRange | null;
  ovulationDate: string | null;
  ovulationWindow: DateRange | null;
  phases: Record<CyclePhase, DateRange> | null;
  getPhaseForDate: (date: string | Date) => CyclePhase | null;
};

const DAY_MS = 86_400_000;
function parseDate(value: string | Date) {
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}
function toDateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}
function addDays(date: Date, days: number) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }
function isWithin(date: Date, range: DateRange) { const start = parseDate(range.start), end = parseDate(range.end); return Boolean(start && end && date >= start && date <= end); }

/** Calculates a forecast from period starts. Uses a five-day menstrual window. */
export function predictCycle(historyPeriodStarts: string[], averageCycleLength = 28): CyclePrediction {
  const fallbackLength = Number.isFinite(averageCycleLength) && averageCycleLength > 0 ? Math.round(averageCycleLength) : 28;
  const starts = [...new Set(historyPeriodStarts)].map(parseDate).filter((date): date is Date => date !== null).sort((a, b) => a.getTime() - b.getTime());
  const intervals = starts.slice(1).map((date, index) => Math.round((date.getTime() - starts[index].getTime()) / DAY_MS)).filter((days) => days > 0);
  const dynamicAverage = intervals.length ? Math.round(intervals.reduce((sum, days) => sum + days, 0) / intervals.length) : fallbackLength;
  const lastStart = starts.at(-1);
  if (!lastStart) return { averageCycleLength: dynamicAverage, historyPeriodStarts: [], lastPeriodStart: null, predictedStart: null, predictedPeriod: null, ovulationDate: null, ovulationWindow: null, phases: null, getPhaseForDate: () => null };

  const predictedStart = addDays(lastStart, dynamicAverage), ovulationDate = addDays(predictedStart, -14), ovulationStart = addDays(ovulationDate, -2), ovulationEnd = addDays(ovulationDate, 2);
  const phases: Record<CyclePhase, DateRange> = {
    Menstrual: { start: toDateKey(lastStart), end: toDateKey(addDays(lastStart, 4)) },
    Follicular: { start: toDateKey(addDays(lastStart, 5)), end: toDateKey(addDays(ovulationStart, -1)) },
    Ovulation: { start: toDateKey(ovulationStart), end: toDateKey(ovulationEnd) },
    Luteal: { start: toDateKey(addDays(ovulationEnd, 1)), end: toDateKey(addDays(predictedStart, -1)) },
  };
  const predictedPeriod = { start: toDateKey(predictedStart), end: toDateKey(addDays(predictedStart, 4)) };
  return {
    averageCycleLength: dynamicAverage, historyPeriodStarts: starts.map(toDateKey), lastPeriodStart: toDateKey(lastStart), predictedStart: toDateKey(predictedStart), predictedPeriod,
    ovulationDate: toDateKey(ovulationDate), ovulationWindow: phases.Ovulation, phases,
    getPhaseForDate: (value) => { const date = parseDate(value); if (!date) return null; if (isWithin(date, predictedPeriod) || isWithin(date, phases.Menstrual)) return "Menstrual"; if (isWithin(date, phases.Follicular)) return "Follicular"; if (isWithin(date, phases.Ovulation)) return "Ovulation"; if (isWithin(date, phases.Luteal)) return "Luteal"; return null; },
  };
}
