"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarIcon } from "@/components/icons";
import { readLogsFromStorage, toKey, type Logs } from "@/lib/trackerStorage";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function TrackingWidget() {
  const [logs, setLogs] = useState<Logs>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogs(readLogsFromStorage());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const total = daysInMonth(year, month);
  const firstWeekday = new Date(year, month, 1).getDay();
  const todayKey = toKey(today);

  const cells: (Date | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className="rounded-b-2xl border border-t-0 border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <CalendarIcon className="h-6 w-6 text-primary" />
          <p className="mt-2 font-semibold text-foreground">Tracking</p>
        </div>
        <Link
          href="/tracker"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open →
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-text-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const key = toKey(date);
          const isLogged = Boolean(logs[key]);
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`flex aspect-square items-center justify-center rounded-full text-[11px] ${
                isLogged
                  ? "bg-primary text-white"
                  : isToday
                    ? "border border-primary text-foreground"
                    : "text-foreground"
              }`}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
