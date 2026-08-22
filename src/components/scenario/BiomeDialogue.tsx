"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MessageGenerator } from "@/components/MessageGenerator";
import type { ScenarioStep } from "@/lib/scenarios";

/** Branching story UI styled as an in-world dialogue panel over region art. */
export function BiomeDialogue({
  steps,
  onComplete,
}: {
  steps: ScenarioStep[];
  onComplete?: () => void;
}) {
  const [stepId, setStepId] = useState(steps[0].id);
  const step = steps.find((s) => s.id === stepId) ?? steps[0];
  const isEnd = step.choices.length === 0;

  useEffect(() => {
    if (isEnd) onComplete?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepId]);

  return (
    <div
      className="rounded-3xl border border-white/50 bg-white/90 p-4 shadow-[0_12px_40px_rgba(40,24,36,0.18)] backdrop-blur-md sm:p-5"
      data-testid="biome-dialogue"
    >
      {!isEnd && (
        <p className="text-base leading-relaxed text-foreground sm:text-lg">
          {step.prompt}
        </p>
      )}

      {isEnd ? (
        <div className="flex flex-col gap-4">
          <p className="text-base leading-relaxed text-secondary sm:text-lg">
            {step.closing}
          </p>
          {step.showMessageGenerator && <MessageGenerator />}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => setStepId(steps[0].id)}
            >
              Try another path
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {step.choices.map((choice) => (
            <button
              key={choice.label}
              type="button"
              onClick={() => setStepId(choice.next)}
              className="rounded-2xl border-2 border-secondary/25 bg-secondary-soft/80 px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:border-secondary hover:bg-secondary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              {choice.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
