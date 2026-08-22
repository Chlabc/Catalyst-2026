import type { CalendarDay } from "../_types/tracker";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function fromIsoDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function addDays(value: string, amount: number): string {
  const date = fromIsoDate(value);
  date.setDate(date.getDate() + amount);

  return toIsoDate(date);
}

export function daysBetween(start: string, end: string): number {
  const startDate = fromIsoDate(start);
  const endDate = fromIsoDate(end);

  return Math.round((endDate.getTime() - startDate.getTime()) / DAY_IN_MS);
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(fromIsoDate(value));
}

export function formatLongDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(fromIsoDate(value));
}

export function buildMonthDays(monthDate: Date, todayIso: string): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const iso = toIsoDate(date);

    return {
      date: iso,
      dayOfMonth: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
      isToday: iso === todayIso,
    };
  });
}
