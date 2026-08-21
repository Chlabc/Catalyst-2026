"use client";

import { useState } from "react";

type Phase = { name: string; days: string; description: string };

// Compass position for each of the 4 phases around the ring, in cycle
// order starting at 12 o'clock.
const POSITIONS = [
  "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
  "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2",
];

const COLORS = [
  "var(--primary)",
  "var(--secondary)",
  "var(--accent)",
  "var(--text-muted)",
];

const SIZE = 200;
const LABEL_SPACE = 28;
const STROKE = 16;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CyclePhaseWheel({
  phases,
  activePhaseName,
  centerLabel = "Your cycle",
  centerCaption = "tap a phase",
}: {
  phases: Phase[];
  activePhaseName?: string;
  centerLabel?: string;
  centerCaption?: string;
}) {
  const [selected, setSelected] = useState(activePhaseName ?? phases[0].name);
  const selectedPhase = phases.find((p) => p.name === selected) ?? phases[0];
  const segmentLength = CIRCUMFERENCE / phases.length;

  return (
    <div>
      <div
        className="relative mx-auto"
        style={{ width: SIZE + LABEL_SPACE * 2, height: SIZE + LABEL_SPACE * 2 }}
      >
        <div
          className="absolute"
          style={{
            width: SIZE,
            height: SIZE,
            top: LABEL_SPACE,
            left: LABEL_SPACE,
          }}
        >
          <svg width={SIZE} height={SIZE} className="-rotate-90">
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="var(--border)"
              strokeWidth={STROKE}
            />
            {phases.map((phase, i) => {
              const isActive = phase.name === activePhaseName;
              return (
                <circle
                  key={phase.name}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={isActive ? STROKE + 4 : STROKE - 4}
                  strokeDasharray={`${segmentLength - 6} ${CIRCUMFERENCE - segmentLength + 6
                    }`}
                  strokeDashoffset={-i * segmentLength}
                  strokeLinecap="round"
                  opacity={isActive ? 1 : 0.55}
                />
              );
            })}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="max-w-20 text-xs font-semibold leading-tight text-foreground">
              {centerLabel}
            </span>
            <span className="mt-1 text-[10px] text-text-muted">{centerCaption}</span>
          </div>

          {phases.map((phase, i) => (
            <button
              key={phase.name}
              onClick={() => setSelected(phase.name)}
              className={`absolute flex h-14 w-14 items-center justify-center rounded-full border text-center text-[11px] font-medium leading-tight transition-colors ${POSITIONS[i]
                } ${selected === phase.name
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-text-muted hover:text-foreground"
                }`}
            >
              {phase.name.replace(" phase", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 rounded-lg bg-background p-4">
        <p className="text-sm font-medium text-foreground">
          {selectedPhase.name}
          {selectedPhase.name === activePhaseName && (
            <span className="ml-2 text-xs font-normal text-secondary">
              you&apos;re likely here
            </span>
          )}
          <span className="ml-2 text-xs font-normal text-text-muted">
            {selectedPhase.days}
          </span>
        </p>
        <p className="mt-1 text-sm text-text-muted">
          {selectedPhase.description}
        </p>
      </div>
    </div>
  );
}
