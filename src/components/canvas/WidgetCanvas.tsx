"use client";

import { useEffect, useState } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { FlowerWidget } from "./FlowerWidget";
import { LearningWidget } from "./LearningWidget";
import { TrackingWidget } from "./TrackingWidget";
import { HelpWidget } from "./HelpWidget";

const HIDDEN_KEY = "blossom_hidden_widgets";

// Flower and Learning are permanent (no entry here = no dismiss button).
// Tracking and Help can be removed and brought back later.
const REMOVABLE = [
  { id: "tracking", label: "Tracking" },
  { id: "help", label: "Help" },
];

export function WidgetCanvas() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HIDDEN_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setHidden(new Set(JSON.parse(raw)));
    } catch {
      // Corrupt/missing storage — just show everything.
    }
    setLoaded(true);
  }, []);

  function hide(id: string) {
    setHidden((prev) => {
      const next = new Set(prev).add(id);
      window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function show(id: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      next.delete(id);
      window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  if (!loaded) return null;

  const hiddenList = REMOVABLE.filter((w) => hidden.has(w.id));

  return (
    <div>
      <div
        className="relative w-full overflow-auto rounded-3xl border border-border"
        style={{
          minHeight: 840,
          backgroundColor: "var(--background)",
          backgroundImage:
            "radial-gradient(color-mix(in srgb, var(--border) 70%, transparent) 1.5px, transparent 1.5px)",
          backgroundSize: "22px 22px",
        }}
      >
        <DraggableWidget id="learning" defaultX={24} defaultY={24}>
          <LearningWidget />
        </DraggableWidget>

        <DraggableWidget id="flower" defaultX={344} defaultY={24}>
          <FlowerWidget />
        </DraggableWidget>

        {!hidden.has("tracking") && (
          <DraggableWidget
            id="tracking"
            defaultX={24}
            defaultY={420}
            onRemove={() => hide("tracking")}
          >
            <TrackingWidget />
          </DraggableWidget>
        )}

        {!hidden.has("help") && (
          <DraggableWidget
            id="help"
            defaultX={344}
            defaultY={420}
            onRemove={() => hide("help")}
          >
            <HelpWidget />
          </DraggableWidget>
        )}
      </div>

      {hiddenList.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted">Hidden — add back:</span>
          {hiddenList.map((w) => (
            <button
              key={w.id}
              onClick={() => show(w.id)}
              className="rounded-full border border-border px-3 py-1 text-xs text-text-muted transition-colors hover:border-primary hover:text-foreground"
            >
              + {w.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
