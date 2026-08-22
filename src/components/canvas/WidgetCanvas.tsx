"use client";

import { useEffect, useState } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { FlowerWidget } from "./FlowerWidget";
import { LearningWidget } from "./LearningWidget";
import { TrackingWidget } from "./TrackingWidget";
import { HelpWidget } from "./HelpWidget";
import { SOSWidget } from "./SOSWidget";
import { DecorationsWidget } from "./DecorationsWidget";

const HIDDEN_KEY = "blossom_hidden_widgets";
const THEME_KEY = "blossom_canvas_theme";
type CanvasTheme = "beach" | "desert";
type DecorationId = "flowers" | "leaves" | "sparkles";

// Flower and Learning are permanent (no entry here = no dismiss button).
// Tracking, Help, SOS, and Decorations can be removed and brought back later.
const REMOVABLE = [
  { id: "tracking", label: "Tracking" },
  { id: "help", label: "Help" },
  { id: "sos", label: "SOS" },
  { id: "decorations", label: "Decorations" },
];

export function WidgetCanvas() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [theme, setTheme] = useState<CanvasTheme>("beach");
  const [decorations, setDecorations] = useState<Set<DecorationId>>(new Set(["flowers"]));

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HIDDEN_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setHidden(new Set(JSON.parse(raw)));
      const savedTheme = window.localStorage.getItem(THEME_KEY);
      if (savedTheme === "beach" || savedTheme === "desert") setTheme(savedTheme);
      const savedDecorations = window.localStorage.getItem("blossom_canvas_decorations");
      if (savedDecorations) setDecorations(new Set(JSON.parse(savedDecorations) as DecorationId[]));
    } catch {
      // Corrupt/missing storage — just show everything.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    function syncDecorations(event: Event) {
      const detail = (event as CustomEvent<DecorationId[]>).detail;
      setDecorations(new Set(detail));
    }
    window.addEventListener("blossom:decorations-changed", syncDecorations);
    return () => window.removeEventListener("blossom:decorations-changed", syncDecorations);
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

  function chooseTheme(nextTheme: CanvasTheme) {
    setTheme(nextTheme);
    window.localStorage.setItem(THEME_KEY, nextTheme);
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
        <div className="flex items-center gap-2">
          <div className="hidden rounded-full border border-border bg-surface p-1 sm:flex">
            {(["beach", "desert"] as CanvasTheme[]).map((canvasTheme) => (
              <button key={canvasTheme} onClick={() => chooseTheme(canvasTheme)} className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize transition-colors ${theme === canvasTheme ? "bg-secondary text-white" : "text-text-muted hover:text-foreground"}`}>
                {canvasTheme === "beach" ? "🌊 Beach" : "🏜️ Desert"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setEditing((current) => !current)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${editing ? "border-primary bg-primary text-white" : "border-border bg-surface text-foreground hover:border-primary"}`}
          >
            {editing ? "Done" : "Arrange"}
          </button>
        </div>
      </div>
      {editing && (
        <div className="mb-4 rounded-2xl border border-primary/30 bg-primary-soft p-4 text-sm text-text-muted">
          <p className="font-semibold text-foreground">Arrange your view</p>
          <p className="mt-1">Drag the dotted handle to move a widget. Use Hide to remove optional widgets, then add them back below whenever you need them.</p>
        </div>
      )}
      <div
        className="relative w-full overflow-auto rounded-3xl border border-border"
        style={{
          minHeight: 760,
          minWidth: 1080,
          backgroundColor: theme === "beach" ? "#eaf8fb" : "#fff1d6",
          backgroundImage: theme === "beach"
            ? "radial-gradient(circle at 80% 12%, rgba(79,179,217,.26) 0 2px, transparent 2.5px), radial-gradient(circle at 16% 82%, rgba(166,136,209,.18) 0 1.5px, transparent 2px)"
            : "radial-gradient(circle at 85% 15%, rgba(240,185,77,.28) 0 2px, transparent 2.5px), radial-gradient(circle at 12% 76%, rgba(255,111,94,.16) 0 1.5px, transparent 2px)",
          backgroundSize: "30px 30px, 24px 24px",
        }}
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          {/* Scattered along the top, left and right margins rather than
              clustered in the middle - every widget starts at least 24px
              in from an edge, so these bands stay clear of the default
              layout instead of rendering invisibly underneath a card. */}
          {decorations.has("flowers") && (
            <>
              <span className="absolute left-[6%] top-1 text-lg opacity-60">✿</span>
              <span className="absolute left-[30%] top-1.5 text-xl opacity-55">❀</span>
              <span className="absolute left-[54%] top-1 text-lg opacity-60">✿</span>
              <span className="absolute left-[76%] top-1.5 text-xl opacity-50">❀</span>
            </>
          )}
          {decorations.has("leaves") && (
            <>
              <span className="absolute left-1 top-[12%] text-lg opacity-55">☘</span>
              <span className="absolute left-1.5 top-[38%] text-xl opacity-50">❧</span>
              <span className="absolute left-1 top-[64%] text-lg opacity-55">☘</span>
              <span className="absolute left-1.5 top-[88%] text-xl opacity-45">❧</span>
            </>
          )}
          {decorations.has("sparkles") && (
            <>
              <span className="absolute right-1 top-[10%] text-lg opacity-60">✧</span>
              <span className="absolute right-1.5 top-[35%] text-xl opacity-55">✦</span>
              <span className="absolute right-1 top-[62%] text-lg opacity-60">⋆</span>
              <span className="absolute right-1.5 top-[86%] text-xl opacity-50">✧</span>
            </>
          )}
          {theme === "beach" ? (
            <>
              <div className="absolute inset-x-0 bottom-0 h-28 bg-secondary/20" />
              <div className="absolute bottom-12 left-8 text-8xl opacity-80">🌴</div>
              <div className="absolute bottom-8 right-20 text-5xl opacity-60">🌊</div>
              <div className="absolute bottom-14 right-72 text-4xl opacity-50">🐚</div>
            </>
          ) : (
            <>
              <div className="absolute inset-x-0 bottom-0 h-28 bg-warning/20" />
              <div className="absolute bottom-10 left-10 text-7xl opacity-70">🌵</div>
              <div className="absolute bottom-10 right-20 text-6xl opacity-60">🐪</div>
              <div className="absolute bottom-12 right-72 text-4xl opacity-50">🏜️</div>
            </>
          )}
        </div>
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
          <FlowerWidget theme={theme} />
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

        {!hidden.has("sos") && (
          <DraggableWidget
            id="sos"
            label="SOS"
            defaultX={728}
            defaultY={24}
            onRemove={() => hide("sos")}
            handleClassName="border-primary/30 bg-primary-soft"
          >
            <SOSWidget />
          </DraggableWidget>
        )}

        {!hidden.has("decorations") && (
          <DraggableWidget
            id="decorations"
            label="Decorations"
            defaultX={728}
            defaultY={360}
            onRemove={() => hide("decorations")}
            handleClassName="border-secondary/30 bg-secondary-soft"
          >
            <DecorationsWidget />
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
