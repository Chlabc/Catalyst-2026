"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { TrackerSettings } from "../_types/tracker";

type TrackerDestination = "today" | "calendar" | "insights" | "learn";

const searchItems: {
  title: string;
  detail: string;
  keywords: string;
  icon: string;
  destination?: TrackerDestination;
  opensLog?: boolean;
}[] = [
  {
    title: "Log today",
    detail: "Flow, symptoms, mood, rest, and notes",
    keywords: "log symptoms cramps mood energy sleep discharge medication notes",
    icon: "+",
    opensLog: true,
  },
  {
    title: "Cycle calendar",
    detail: "Period days, predictions, and daily history",
    keywords: "calendar period prediction ovulation dates history",
    icon: "▦",
    destination: "calendar",
  },
  {
    title: "Personal insights",
    detail: "Patterns from your saved logs",
    keywords: "insights patterns trends mood symptoms sleep energy",
    icon: "⌁",
    destination: "insights",
  },
  {
    title: "Current phase guide",
    detail: "Supportive education for this cycle phase",
    keywords: "learn phase menstrual follicular ovulatory luteal education",
    icon: "◇",
    destination: "learn",
  },
];

export function SearchOverlay({
  onNavigate,
  onOpenLog,
  onClose,
}: {
  onNavigate: (destination: TrackerDestination) => void;
  onOpenLog: () => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return searchItems;

    return searchItems.filter((item) =>
      `${item.title} ${item.detail} ${item.keywords}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <DialogFrame title="Search tracker" onClose={onClose}>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#8C7883]">
          ⌕
        </span>
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search logs, calendar, insights..."
          className="h-12 w-full rounded-full border border-[#E5CFD9] bg-[#FFF8FB] pl-11 pr-4 text-sm text-[#241B21] outline-none transition placeholder:text-[#9C8E96] focus:border-[#EF6F9A] focus:ring-4 focus:ring-[#FCE0EB]"
        />
      </div>

      <div className="mt-4 grid gap-2">
        {results.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => {
              if (item.opensLog) onOpenLog();
              if (item.destination) onNavigate(item.destination);
              onClose();
            }}
            className="group grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-[8px] border border-[#EEE1E7] bg-white p-3 text-left transition hover:border-[#F3A4BE] hover:bg-[#FFF7FA] focus:outline-none focus:ring-2 focus:ring-[#EF6F9A]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#FCE6EE] text-lg font-bold text-[#C94570]">
              {item.icon}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-[#241B21]">
                {item.title}
              </span>
              <span className="mt-0.5 block truncate text-xs text-[#786C73]">
                {item.detail}
              </span>
            </span>
            <span className="text-xl text-[#B59BA7] transition group-hover:translate-x-0.5 group-hover:text-[#C94570]">
              ›
            </span>
          </button>
        ))}

        {results.length === 0 && (
          <div className="py-9 text-center">
            <p className="text-sm font-bold text-[#241B21]">No match found</p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-3 text-sm font-bold text-[#C94570] underline underline-offset-4"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </DialogFrame>
  );
}

export function ReminderOverlay({
  settings,
  onChange,
  onClose,
}: {
  settings: TrackerSettings;
  onChange: (settings: TrackerSettings) => void;
  onClose: () => void;
}) {
  return (
    <DialogFrame title="Check-in reminders" onClose={onClose}>
      <div className="grid gap-3">
        <ReminderToggle
          title="Daily check-in"
          detail="Show a gentle prompt when today has no log."
          enabled={settings.dailyLogReminder}
          onToggle={() =>
            onChange({
              ...settings,
              dailyLogReminder: !settings.dailyLogReminder,
            })
          }
        />
        <ReminderToggle
          title="Period preparation"
          detail="Surface a preparation note as the predicted period approaches."
          enabled={settings.periodPrepReminder}
          onToggle={() =>
            onChange({
              ...settings,
              periodPrepReminder: !settings.periodPrepReminder,
            })
          }
        />
      </div>
      <div className="mt-5 rounded-[8px] bg-[#F4F0F2] px-4 py-3 text-xs leading-5 text-[#6E6269]">
        Reminder preferences are saved with your private tracker data.
      </div>
      <button
        type="button"
        onClick={onClose}
        className="mt-5 h-11 w-full rounded-full bg-[#E9547C] text-sm font-bold text-white shadow-[0_8px_20px_rgba(233,84,124,0.22)] transition hover:bg-[#D94870] focus:outline-none focus:ring-2 focus:ring-[#E9547C] focus:ring-offset-2"
      >
        Done
      </button>
    </DialogFrame>
  );
}

function DialogFrame({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-[#241820]/35 p-3 backdrop-blur-sm sm:place-items-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="max-h-[88vh] w-full max-w-[430px] overflow-y-auto rounded-t-[20px] border border-[#E8D9E0] bg-white p-5 shadow-[0_24px_80px_rgba(35,20,29,0.25)] sm:rounded-[16px]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#241B21]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#DCCBD3] text-lg text-[#493B43] transition hover:bg-[#F7EFF3] focus:outline-none focus:ring-2 focus:ring-[#EF6F9A]"
            aria-label={`Close ${title}`}
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function ReminderToggle({
  title,
  detail,
  enabled,
  onToggle,
}: {
  title: string;
  detail: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-[8px] border border-[#EADDE3] bg-[#FFF9FB] p-4 text-left transition hover:border-[#F2A5BD] focus:outline-none focus:ring-2 focus:ring-[#EF6F9A]"
    >
      <span>
        <span className="block text-sm font-bold text-[#241B21]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#776A71]">
          {detail}
        </span>
      </span>
      <span
        className={`relative h-7 w-12 rounded-full transition ${
          enabled ? "bg-[#E9547C]" : "bg-[#D7CFD3]"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}
