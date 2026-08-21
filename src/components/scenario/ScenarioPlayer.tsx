"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MessageGenerator } from "@/components/MessageGenerator";
import type { ScenarioStep } from "@/lib/scenarios";

export function ScenarioPlayer({
  title,
  steps,
}: {
  title: string;
  steps: ScenarioStep[];
}) {
  const [stepId, setStepId] = useState(steps[0].id);
  const step = steps.find((s) => s.id === stepId) ?? steps[0];
  const isEnd = step.choices.length === 0;

  return (
    <Card>
      <h3 className="font-semibold text-foreground">{title}</h3>

      {!isEnd && <p className="mt-3 text-text-muted">{step.prompt}</p>}

      {isEnd ? (
        <div className="mt-2 flex flex-col gap-4">
          <p className="text-secondary">{step.closing}</p>
          {step.showMessageGenerator && <MessageGenerator />}
          <Button
            variant="secondary"
            className="self-start"
            onClick={() => setStepId(steps[0].id)}
          >
            Try another path
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {step.choices.map((choice) => (
            <Button
              key={choice.label}
              variant="secondary"
              className="justify-start text-left"
              onClick={() => setStepId(choice.next)}
            >
              {choice.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}
