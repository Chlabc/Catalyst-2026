"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookIcon } from "@/components/icons";
import { scenarioLevels } from "@/lib/scenarios";
import { COMPLETED_SCENARIOS_KEY } from "@/components/scenario/ScenarioPath";

const WATER_KEY = "blossom_water_drops";

const quickLesson = {
  eyebrow: "Tiny lesson · 1 minute",
  title: "What is a period, really?",
  body: "Your uterus builds a soft lining each month. A period is your body letting that lining go when it is not needed. It can look bright red, dark red, or brown - all can be normal.",
  question: "Which one is a normal period-blood colour?",
  answers: ["Only bright red", "Bright red, dark red, or brown", "Only brown"],
  correct: 1,
};

export function LearningWidget() {
  const [completedCount, setCompletedCount] = useState(0);
  const [waterDrops, setWaterDrops] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COMPLETED_SCENARIOS_KEY);
      const completed: string[] = raw ? JSON.parse(raw) : [];
      const water = Number(window.localStorage.getItem(WATER_KEY) ?? "0");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompletedCount(completed.length);
      setWaterDrops(Number.isFinite(water) ? water : 0);
    } catch {
      // Corrupt/missing storage — just show 0.
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const isCorrect = answer === quickLesson.correct;

  function chooseAnswer(index: number) {
    if (answer !== null) return;
    setAnswer(index);
    if (index === quickLesson.correct) {
      setWaterDrops((current) => {
        const next = current + 1;
        window.localStorage.setItem(WATER_KEY, String(next));
        window.dispatchEvent(new Event("blossom:water-changed"));
        return next;
      });
    }
  }

  return (
    <div className="rounded-b-2xl border-2 border-t-0 border-secondary/30 bg-secondary-soft p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <BookIcon className="h-6 w-6 text-secondary" />
          <p className="mt-3 text-base font-semibold text-foreground">Learn & grow</p>
        </div>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold text-secondary">
          💧 {waterDrops}
        </span>
      </div>
      <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-secondary">{quickLesson.eyebrow}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{quickLesson.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-text-muted">{quickLesson.body}</p>
      <p className="mt-3 text-sm font-semibold text-foreground">{quickLesson.question}</p>
      <div className="mt-2 grid gap-1.5">
        {quickLesson.answers.map((option, index) => {
          const chosen = answer === index;
          const stateClass = answer === null
            ? "border-white/70 bg-white/65 hover:border-secondary hover:bg-white"
            : chosen && isCorrect
              ? "border-secondary bg-secondary text-white"
              : chosen
                ? "border-primary bg-primary-soft text-foreground"
                : "border-white/60 bg-white/40 text-text-muted";
          return (
            <button key={option} onClick={() => chooseAnswer(index)} className={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${stateClass}`}>
              {option}
            </button>
          );
        })}
      </div>
      {answer !== null && (
        <p className={`mt-2 text-xs font-semibold ${isCorrect ? "text-secondary" : "text-primary-dark"}`}>
          {isCorrect ? "Nice work - you earned a water drop for your plant!" : "Almost. Period blood can be bright red, dark red, or brown."}
        </p>
      )}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
        <div
          className="h-full rounded-full bg-secondary"
          style={{
            width: `${(completedCount / scenarioLevels.length) * 100}%`,
          }}
        />
      </div>
      <Link href="/scenarios" className="mt-3 inline-flex text-sm font-bold text-secondary hover:text-foreground hover:underline">
        Explore Menstrome Island →
      </Link>
      <p className="mt-1 text-xs text-text-muted">Journeys complete: {completedCount} of {scenarioLevels.length}</p>
    </div>
  );
}
