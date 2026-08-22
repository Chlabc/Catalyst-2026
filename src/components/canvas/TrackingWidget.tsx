"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CalendarIcon } from "@/components/icons";
import { toIsoDate } from "@/app/tracker/_lib/dateUtils";
import {
  readTrackerState,
  TRACKER_STORAGE_KEY,
} from "@/app/tracker/_lib/storage";
import {
  getWidgetCalendarMarks,
  type WidgetCalendarMarks,
} from "@/app/tracker/_lib/widgetCalendarMarks";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function emptyMarks(): WidgetCalendarMarks {
  return { periodKeys: new Set(), logKeys: new Set() };
}

function readMarks(): WidgetCalendarMarks {
  return getWidgetCalendarMarks(readTrackerState());
}

export function TrackingWidget() {
  const [marks, setMarks] = useState<WidgetCalendarMarks>(emptyMarks);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(() => {
    setMarks(readMarks());
  }, []);

  useEffect(() => {
    refresh();
    setLoaded(true);

    function onStorage(event: StorageEvent) {
      if (event.key === TRACKER_STORAGE_KEY || event.key === null) {
        refresh();
      }
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  if (!loaded) return null;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const total = daysInMonth(year, month);
  const firstWeekday = new Date(year, month, 1).getDay();
  const todayKey = toIsoDate(today);
  const monthLabel = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(today);

  const cells: (Date | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <div className="rounded-b-2xl border-2 border-t-0 border-primary/30 bg-primary-soft p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <CalendarIcon className="h-6 w-6 text-primary" />
          <p className="mt-2 text-base font-semibold text-foreground">Tracking</p>
          <p className="mt-0.5 text-xs text-text-muted">{monthLabel}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-text-muted">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}-${i}`}>{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const key = toIsoDate(date);
          const isPeriod = marks.periodKeys.has(key);
          const isLogged = marks.logKeys.has(key);
          const isToday = key === todayKey;

          let cellClass = "text-foreground";
          if (isLogged && !isPeriod) {
            cellClass = "bg-secondary/25 text-foreground";
          }
          if (isPeriod) {
            cellClass = "bg-primary text-white";
          }
          if (isToday && !isPeriod && !isLogged) {
            cellClass = "border border-primary text-foreground";
          } else if (isToday) {
            cellClass = `${cellClass} ring-2 ring-primary/40 ring-offset-1 ring-offset-primary-soft`;
          }

          return (
            <div
              key={key}
              title={
                isPeriod
                  ? "Period log"
                  : isLogged
                    ? "Daily log"
                    : isToday
                      ? "Today"
                      : undefined
              }
              className={`flex aspect-square items-center justify-center rounded-full text-xs ${cellClass}`}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-text-muted">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-primary" /> Period
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-secondary/40" /> Logged
        </span>
      </div>

      <Link
        href="/tracker"
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Open tracker
      </Link>
    </div>
  );
}
