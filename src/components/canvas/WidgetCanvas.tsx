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
  const [editing, setEditing] = useState(false);

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
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Your island desk</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Make this space yours</h2>
        </div>
        <button
          onClick={() => setEditing((current) => !current)}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${editing ? "border-primary bg-primary text-white" : "border-border bg-surface text-foreground hover:border-primary"}`}
        >
          {editing ? "Done editing" : "Edit widgets"}
        </button>
      </div>
      {editing && (
        <div className="mb-4 rounded-2xl border border-primary/30 bg-primary-soft p-4 text-sm text-text-muted">
          <p className="font-semibold text-foreground">Arrange your view</p>
          <p className="mt-1">Drag the dotted handle to move a widget. Use Hide to remove Tracking or Quick help; add them back below whenever you need them.</p>
        </div>
      )}
      <div
        className="relative w-full overflow-auto rounded-3xl border border-border"
        style={{
          minHeight: 760,
          backgroundColor: "var(--background)",
          backgroundImage:
            "radial-gradient(color-mix(in srgb, var(--secondary) 28%, transparent) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
      >
        <DraggableWidget
          id="learning"
          label="Learning module"
          defaultX={24}
          defaultY={24}
          handleClassName="border-secondary/30 bg-secondary-soft"
        >
          <LearningWidget />
        </DraggableWidget>

        <DraggableWidget id="flower" label="Bloom" defaultX={376} defaultY={24}>
          <FlowerWidget />
        </DraggableWidget>

        {!hidden.has("tracking") && (
          <DraggableWidget
            id="tracking"
            label="Tracking"
            defaultX={24}
            defaultY={480}
            onRemove={() => hide("tracking")}
            handleClassName="border-primary/30 bg-primary-soft"
          >
            <TrackingWidget />
          </DraggableWidget>
        )}

        {!hidden.has("help") && (
          <DraggableWidget
            id="help"
            label="Quick help"
            defaultX={376}
            defaultY={480}
            onRemove={() => hide("help")}
            handleClassName="border-accent/30 bg-accent-soft"
          >
            <HelpWidget />
          </DraggableWidget>
        )}
      </div>

      {hiddenList.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-text-muted">Widgets you hid:</span>
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
