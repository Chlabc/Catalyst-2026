"use client";

import Link from "next/link";
import { useState } from "react";

const symptoms = ["Cramps", "Headache", "Low mood", "Fatigue", "Backache"];

export default function Home() {
  const [periodStart, setPeriodStart] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function toggleSymptom(symptom: string) {
    setSelectedSymptoms((current) =>
      current.includes(symptom)
        ? current.filter((item) => item !== symptom)
        : [...current, symptom],
    );
  }

  function handleSave() {
    const today = new Date();
    const todayKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    const existing = JSON.parse(
      localStorage.getItem("menstraRecords") ?? "{}",
    );

    localStorage.setItem(
      "menstraRecords",
      JSON.stringify({
        periodStart,
        periodEnd: existing.periodEnd ?? "",
        moods: existing.moods ?? {},
        symptoms: {
          ...(existing.symptoms ?? {}),
          [todayKey]: selectedSymptoms,
        },
      }),
    );

    setSaved(true);
  }


  return (
    <main className="app-shell">
      <nav className="navbar">
        <div className="brand">
          <span className="brand-mark">✿</span>
          <span>MenstraMission</span>
        </div>
        <span className="privacy-note">🔒 Private and secure</span>
      </nav>

      <section className="hero">
        <div>
          <p className="eyebrow">Take care of yourself today</p>
          <h1>
            Understand your body,
            <br />
            feel prepared every day.
          </h1>
          <p className="hero-text">
            Track your cycle and feelings to better understand your body.
          </p>
        </div>
        <div className="hero-flower">🌷</div>
      </section>

      <section className="dashboard-grid">
        <article className="card cycle-card">
          <div className="card-heading">
            <div>
              <p className="card-label">CYCLE STATUS</p>
              <h2>Next period in</h2>
            </div>
            <span className="icon-bubble">♡</span>
          </div>

          <div className="days-number">
            12 <small>days</small>
          </div>

          <div className="progress-track">
            <div className="progress-bar" />
          </div>

          <p className="muted">Estimated next period: Not recorded yet</p>
          <Link className="primary-button" href="/cycle">
            View full cycle
          </Link>
        </article>

        <article className="card">
          <div className="card-heading">
            <div>
              <p className="card-label">QUICK LOG</p>
              <h2>How are you feeling?</h2>
            </div>
            <span className="icon-bubble green">✓</span>
          </div>

          <label className="input-label" htmlFor="period-start">
            Last period start date
          </label>

          <input
            id="period-start"
            className="date-input"
            type="date"
            value={periodStart}
            onChange={(event) => setPeriodStart(event.target.value)}
          />

          <p className="input-label">What are you experiencing today?</p>

          <div className="symptoms">
            {symptoms.map((symptom) => (
              <button
                key={symptom}
                className={`symptom ${
                  selectedSymptoms.includes(symptom) ? "selected" : ""
                }`}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </button>
            ))}
          </div>

          <button className="secondary-button" onClick={handleSave}>
            {saved ? "Saved successfully ✓" : "Save today's log"}
          </button>
        </article>
      </section>

      <section className="section-heading">
        <div>
          <p className="eyebrow">YOUR HEALTH TOOLS</p>
          <h2>How can we help?</h2>
        </div>
        <a href="#calendar">View all →</a>
      </section>

      <section className="tools-grid">
        <Link className="tool-card pink" href="/calendar">
          <span className="tool-icon">🗓️</span>
          <h3>Cycle Calendar</h3>
          <p>View your period and health records at a glance</p>
        </Link>

        <Link className="tool-card green" href="/pharmacy">
          <span className="tool-icon">✚</span>
          <h3>Nearby Pharmacies</h3>
          <p>Find the nearest pharmacy to you</p>
        </Link>

        <Link className="tool-card orange" href="/medicine">
          <span className="tool-icon">💊</span>
          <h3>Medicine Guide</h3>
          <p>Learn about ways to relieve discomfort</p>
        </Link>
      </section>

      <section className="tip-card">
        <span>💡</span>
        <div>
          <h3>A little reminder</h3>
          <p>
            Everyone&apos;s cycle is different. Tracking is about understanding
            yourself, not being perfect.
          </p>
        </div>
      </section>
    </main>
  );
}