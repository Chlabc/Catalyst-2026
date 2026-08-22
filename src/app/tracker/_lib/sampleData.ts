import type { TrackerState } from "../_types/tracker";
import { addDays, toIsoDate } from "./dateUtils";

const today = toIsoDate(new Date());

export const presentationTrackerState: TrackerState = {
  settings: {
    defaultCycleLength: 29,
    defaultPeriodLength: 5,
    dailyLogReminder: true,
    periodPrepReminder: true,
  },
  cycles: [
    {
      id: "demo-cycle-1",
      startDate: addDays(today, -57),
      endDate: addDays(today, -53),
      cycleLength: 29,
      periodLength: 5,
    },
    {
      id: "demo-cycle-2",
      startDate: addDays(today, -28),
      endDate: addDays(today, -24),
      cycleLength: 29,
      periodLength: 5,
    },
  ],
  logs: {
    [today]: {
      date: today,
      periodFlow: "none",
      symptoms: ["bloating", "fatigue"],
      moods: ["calm", "sensitive"],
      energy: "medium",
      sleep: "okay",
      discharge: "creamy",
      activity: "light",
      painSeverity: {
        cramps: "mild",
      },
      notes: "Gentle movement helped today.",
    },
    [addDays(today, -1)]: {
      date: addDays(today, -1),
      periodFlow: "none",
      symptoms: ["headache"],
      moods: ["stressed"],
      energy: "low",
      sleep: "poor",
      activity: "none",
    },
  },
};
