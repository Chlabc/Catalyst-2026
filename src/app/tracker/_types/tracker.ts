export type CyclePhase = "menstrual" | "follicular" | "ovulatory" | "luteal";

export type PeriodFlow = "none" | "spotting" | "light" | "medium" | "heavy";

export type Symptom =
  | "cramps"
  | "headache"
  | "bloating"
  | "acne"
  | "breastTenderness"
  | "backPain"
  | "fatigue"
  | "nausea";

export type Mood =
  | "happy"
  | "calm"
  | "sensitive"
  | "anxious"
  | "irritated"
  | "sad"
  | "stressed";

export type EnergyLevel = "low" | "medium" | "high";
export type SleepQuality = "poor" | "okay" | "good";
export type PainSeverity = "none" | "mild" | "moderate" | "strong";

export type DischargeType =
  | "none"
  | "sticky"
  | "creamy"
  | "watery"
  | "eggWhite";

export type ActivityLevel = "none" | "light" | "moderate" | "intense";

export type DailyLog = {
  date: string;
  periodFlow: PeriodFlow;
  symptoms: Symptom[];
  moods: Mood[];
  energy?: EnergyLevel;
  sleep?: SleepQuality;
  discharge?: DischargeType;
  activity?: ActivityLevel;
  painSeverity?: Partial<Record<Symptom, PainSeverity>>;
  medication?: string;
  notes?: string;
};

export type CycleRecord = {
  id: string;
  startDate: string;
  endDate?: string;
  cycleLength?: number;
  periodLength?: number;
};

export type CyclePrediction = {
  today: string;
  currentCycleDay: number;
  estimatedPhase: CyclePhase;
  predictedNextPeriod: string;
  daysUntilNextPeriod: number;
  averageCycleLength: number;
  averagePeriodLength: number;
  estimatedOvulation: string;
};

export type TrackerSettings = {
  defaultCycleLength: number;
  defaultPeriodLength: number;
  dailyLogReminder: boolean;
  periodPrepReminder: boolean;
};

export type TrackerState = {
  cycles: CycleRecord[];
  logs: Record<string, DailyLog>;
  settings: TrackerSettings;
};

export type CalendarDay = {
  date: string;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};
