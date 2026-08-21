"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Records = {
  periodStart: string;
  periodEnd: string;
  moods: Record<string, string>;
  symptoms: Record<string, string[]>;
};

function dateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function CalendarPage() {
  const today = new Date();
  const todayKey = dateKey(today);

  const [month, setMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [records, setRecords] = useState<Records>({
    periodStart: "",
    periodEnd: "",
    moods: {},
    symptoms: {},
  });

  useEffect(() => {
    const saved = localStorage.getItem("menstraRecords");

    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    return [
      ...Array.from({ length: firstDay.getDay() }, () => null),
      ...Array.from({ length: lastDay.getDate() }, (_, index) =>
        new Date(month.getFullYear(), month.getMonth(), index + 1),
      ),
    ];
  }, [month]);

  function isPeriodDay(key: string) {
    if (!records.periodStart) return false;

    if (!records.periodEnd) {
      return key === records.periodStart;
    }

    return key >= records.periodStart && key <= records.periodEnd;
  }

  function changeMonth(offset: number) {
    setMonth(
      new Date(month.getFullYear(), month.getMonth() + offset, 1),
    );
  }

  const selectedMood = records.moods[selectedDate];
  const selectedSymptoms = records.symptoms[selectedDate] ?? [];

  return (
    <main className="app-shell subpage">
      <Link className="back-link" href="/">
        ← Back to dashboard
      </Link>

      <p className="eyebrow">YOUR HEALTH CALENDAR</p>
      <h1>Cycle Calendar</h1>

      <section className="calendar-card">
        <div className="calendar-top">
          <button
            className="calendar-nav"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
          >
            ←
          </button>

          <h2>
            {month.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>

          <button
            className="calendar-nav"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
          >
            →
          </button>
        </div>

        <div className="calendar-weekdays">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <span className="calendar-day empty" key={`empty-${index}`} />
              );
            }

            const key = dateKey(date);
            const mood = records.moods[key];
            const symptoms = records.symptoms[key] ?? [];

            return (
              <button
                key={key}
                className={`calendar-day ${
                  key === todayKey ? "today" : ""
                } ${key === selectedDate ? "selected-day" : ""} ${
                  isPeriodDay(key) ? "period-day" : ""
                }`}
                onClick={() => setSelectedDate(key)}
              >
                <strong>{date.getDate()}</strong>

                {isPeriodDay(key) && <small>Period</small>}

                {mood && <small>♡ {mood}</small>}

                {symptoms.length > 0 && (
                  <small className="symptom-mark">●</small>
                )}
              </button>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span>🌸 Period</span>
          <span>🟢 Today</span>
          <span>♡ Mood</span>
          <span>● Symptoms</span>
        </div>
      </section>

      <section className="card selected-record">
        <p className="card-label">SELECTED DAY</p>
        <h2>{selectedDate}</h2>

        {isPeriodDay(selectedDate) && (
          <p className="record-item">🌸 Period day</p>
        )}

        {selectedMood && (
          <p className="record-item">♡ Mood: {selectedMood}</p>
        )}

        {selectedSymptoms.length > 0 && (
          <p className="record-item">
            ● Symptoms: {selectedSymptoms.join(", ")}
          </p>
        )}

        {!isPeriodDay(selectedDate) &&
          !selectedMood &&
          selectedSymptoms.length === 0 && (
            <p className="muted">No records for this day.</p>
          )}
      </section>
    </main>
  );
}