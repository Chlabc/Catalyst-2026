"use client";

import { useEffect, useState } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { FlowerWidget } from "./FlowerWidget";
import { LearningWidget } from "./LearningWidget";
import { TrackingWidget } from "./TrackingWidget";
import { HelpWidget } from "./HelpWidget";
import { FaqWidget } from "./FaqWidget";
import styles from "./WidgetCanvas.module.css";

const HIDDEN_KEY = "blossom_hidden_widgets";

// The flower is the permanent centrepiece. The surrounding tool widgets
// can be hidden and restored without affecting their saved positions.
const REMOVABLE = [
  { id: "learning", label: "Learning" },
  { id: "tracking", label: "Tracking" },
  { id: "help", label: "Find Help" },
  { id: "faq", label: "FAQ" },
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
    <div className="relative">
      <div className="relative z-20 flex justify-end">
        <button
          type="button"
          onClick={() => setEditing((current) => !current)}
          aria-expanded={editing}
          data-testid="edit-widgets"
          className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-md transition-colors ${editing ? "border-primary bg-primary text-white" : "border-white/60 bg-white/55 text-foreground hover:border-primary hover:bg-white/80"}`}
        >
          {editing ? "Done editing" : "Edit widgets"}
        </button>
      </div>
      {editing && (
        <div className="relative z-20 ml-auto mt-3 max-w-md rounded-2xl border border-white/60 bg-white/70 p-4 text-sm text-text-muted shadow-sm backdrop-blur-md">
          <p className="font-semibold text-foreground">Arrange your view</p>
          <p className="mt-1">
            Drag the dotted handle to move Learning, Tracking, Find Help, or FAQ.
            Use Hide to remove a tool and add it back below whenever you need it.
          </p>
        </div>
      )}
      <div className={styles.canvas}>
        <div className={styles.centerpiece}>
          <FlowerWidget />
        </div>

        {!hidden.has("learning") && (
          <DraggableWidget
            id="learning"
            label="Learning module"
            defaultX={8}
            defaultY={122}
            onRemove={() => hide("learning")}
            handleClassName="border-secondary/30 bg-secondary-soft"
            className={styles.widget}
          >
            <LearningWidget />
          </DraggableWidget>
        )}

        {!hidden.has("tracking") && (
          <DraggableWidget
            id="tracking"
            label="Tracking"
            defaultX={896}
            defaultY={292}
            onRemove={() => hide("tracking")}
            handleClassName="border-primary/30 bg-primary-soft"
            className={`${styles.widget} ${styles.trackingWidget}`}
          >
            <TrackingWidget />
          </DraggableWidget>
        )}

        {!hidden.has("help") && (
          <DraggableWidget
            id="help"
            label="Quick help"
            defaultX={76}
            defaultY={594}
            onRemove={() => hide("help")}
            handleClassName="border-accent/30 bg-accent-soft"
            className={styles.widget}
          >
            <HelpWidget />
          </DraggableWidget>
        )}

        {!hidden.has("faq") && (
          <DraggableWidget
            id="faq"
            label="FAQ"
            defaultX={720}
            defaultY={120}
            onRemove={() => hide("faq")}
            handleClassName="border-border bg-surface"
            className={styles.widget}
          >
            <FaqWidget />
          </DraggableWidget>
        )}
      </div>

      {hiddenList.length > 0 && (
        <div
          className="relative z-20 mt-4 flex flex-wrap items-center justify-end gap-2"
          data-testid="hidden-widgets"
        >
          <span className="text-xs font-medium text-foreground/65">Hidden:</span>
          {hiddenList.map((w) => (
            <button
              type="button"
              key={w.id}
              data-testid={`restore-widget-${w.id}`}
              onClick={() => show(w.id)}
              className="rounded-full border border-white/60 bg-white/55 px-3 py-1 text-xs text-foreground/70 shadow-sm backdrop-blur-md transition-colors hover:border-primary hover:bg-white/80 hover:text-foreground"
            >
              + {w.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
