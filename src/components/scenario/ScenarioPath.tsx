"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { ChevronIcon } from "@/components/icons";
import { ScenarioPlayer } from "./ScenarioPlayer";
import type { ScenarioLevel } from "@/lib/scenarios";

export const COMPLETED_SCENARIOS_KEY = "blossom_completed_scenarios";
const STORAGE_KEY = COMPLETED_SCENARIOS_KEY;

export function ScenarioPath({ levels }: { levels: ScenarioLevel[] }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(levels[0]?.id ?? null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setCompleted(new Set(JSON.parse(raw)));
    } catch {
      // Corrupt/missing storage — just start fresh.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
  }, [completed, loaded]);

  function markComplete(id: string) {
    setCompleted((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  if (!loaded) return null;

  return (
    <div>
      <p className="text-sm text-text-muted">
        {completed.size} of {levels.length} completed
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {levels.map((level, i) => {
          const isOpen = openId === level.id;
          const isDone = completed.has(level.id);
          return (
            <div key={level.id} className="relative flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-base font-semibold ${
                    isDone
                      ? "border-secondary bg-secondary text-white"
                      : isOpen
                        ? "border-primary bg-primary-soft text-primary-dark"
                        : "border-border text-text-muted"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                {i < levels.length - 1 && (
                  <div className="mt-1 h-full w-0.5 flex-1 rounded-full bg-border" />
                )}
              </div>

              <Card
                className={`mb-3 flex-1 ${isOpen ? "border-primary/40 bg-primary-soft" : ""}`}
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : level.id)}
                  className="flex w-full items-start justify-between text-left"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {level.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {level.teaser}
                    </p>
                  </div>
                  <ChevronIcon
                    className={`mt-1 h-4 w-4 shrink-0 text-text-muted transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-4">
                    <ScenarioPlayer
                      title=""
                      steps={level.steps}
                      onComplete={() => markComplete(level.id)}
                    />
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
