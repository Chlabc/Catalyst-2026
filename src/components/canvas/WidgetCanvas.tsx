"use client";

import { useEffect, useRef, useState } from "react";
import { DraggableWidget } from "./DraggableWidget";
import { FlowerWidget } from "./FlowerWidget";
import { LearningWidget } from "./LearningWidget";
import { TrackingWidget } from "./TrackingWidget";
import { HelpWidget } from "./HelpWidget";
import { FaqWidget } from "./FaqWidget";
import { ReportWidget } from "./ReportWidget";
import styles from "./WidgetCanvas.module.css";
import { NavTutorial } from "@/components/NavTutorial";
import {
  HIDDEN_WIDGETS_KEY,
  OPTIONAL_WIDGETS,
  REQUIRED_WIDGETS,
  isRequiredWidget,
  sanitizeHiddenWidgets,
} from "@/lib/widgetVisibility";

const BASE_WIDGET_Z = 10;

function persistHidden(ids: Set<string>) {
  const sanitized = sanitizeHiddenWidgets([...ids]);
  window.localStorage.setItem(HIDDEN_WIDGETS_KEY, JSON.stringify(sanitized));
  return new Set(sanitized);
}

function isInteractiveCanvasTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  // Keep the panel open while using widgets, the flower, or the edit chrome.
  return Boolean(
    target.closest("[data-testid='widget-select-panel']") ||
      target.closest("[data-testid='edit-widgets']") ||
      target.closest("[data-widget-id]") ||
      target.closest("[data-canvas-centerpiece]"),
  );
}

export function WidgetCanvas() {
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [zById, setZById] = useState<Record<string, number>>({});
  const zCounterRef = useRef(BASE_WIDGET_Z);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(HIDDEN_WIDGETS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const sanitized = sanitizeHiddenWidgets(parsed);
      if (JSON.stringify(parsed) !== JSON.stringify(sanitized)) {
        window.localStorage.setItem(HIDDEN_WIDGETS_KEY, JSON.stringify(sanitized));
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHidden(new Set(sanitized));
    } catch {
      // Corrupt/missing storage — show all optional widgets.
    }
    setLoaded(true);
  }, []);

  function bringToFront(id: string) {
    setZById((current) => {
      const top = Math.max(
        BASE_WIDGET_Z,
        ...Object.values(current),
        zCounterRef.current,
      );
      if (current[id] === top) return current;
      const nextZ = top + 1;
      zCounterRef.current = nextZ;
      return { ...current, [id]: nextZ };
    });
  }

  function widgetZ(id: string) {
    return zById[id] ?? BASE_WIDGET_Z;
  }

  // Dismiss the selection panel on empty-background clicks / Escape.
  // Clicks on widgets, the flower, or the panel itself keep it open.
  useEffect(() => {
    if (!editing) return;

    function onPointerDown(event: PointerEvent) {
      if (isInteractiveCanvasTarget(event.target)) return;
      setEditing(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setEditing(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [editing]);

  function hide(id: string) {
    if (isRequiredWidget(id)) return;
    setHidden((prev) => persistHidden(new Set(prev).add(id)));
  }

  function show(id: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return persistHidden(next);
    });
  }

  function toggleOptional(id: string, selected: boolean) {
    if (selected) show(id);
    else hide(id);
  }

  if (!loaded) return null;

  return (
    <div className="relative">
      {/* Button stays in flow (spacing like before). Panel overlays the canvas. */}
      <div className="pointer-events-none relative z-40 flex justify-end gap-2">
        <NavTutorial editing={editing} onSetEditing={setEditing} />
        <div className="relative">
          <button
            type="button"
            onClick={() => setEditing((current) => !current)}
            aria-expanded={editing}
            data-testid="edit-widgets"
            className={`pointer-events-auto rounded-full border px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-md transition-colors ${editing ? "border-primary bg-primary text-white" : "border-white/60 bg-white/55 text-foreground hover:border-primary hover:bg-white/80"}`}
          >
            {editing ? "Done editing" : "Edit widgets"}
          </button>
          {editing && (
            <div
              className="pointer-events-auto absolute right-0 top-full z-40 mt-3 w-[min(100vw-2rem,24rem)] rounded-2xl border border-white/70 bg-white/90 p-4 text-sm text-text-muted shadow-[0_16px_40px_-12px_rgba(40,24,36,0.35)] backdrop-blur-md"
              data-testid="widget-select-panel"
            >
            <p className="font-semibold text-foreground">Choose widgets</p>
            <p className="mt-1">
              Tick widgets to show them. Drag the dotted handles to move them.
              Learning stays on for this page. Click empty space to close.
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {REQUIRED_WIDGETS.map((widget) => (
                <li key={widget.id}>
                  <label className="flex items-center justify-between gap-3 rounded-xl border border-secondary/25 bg-secondary-soft/70 px-3 py-2 text-foreground">
                    <span className="font-medium">{widget.label}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-xs font-medium text-text-muted">Always on</span>
                      <input
                        type="checkbox"
                        checked
                        disabled
                        aria-disabled="true"
                        data-testid={`widget-select-${widget.id}`}
                        className="h-4 w-4 accent-secondary"
                      />
                    </span>
                  </label>
                </li>
              ))}
              {OPTIONAL_WIDGETS.map((widget) => {
                const selected = !hidden.has(widget.id);
                return (
                  <li key={widget.id}>
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/70 bg-white/70 px-3 py-2 text-foreground">
                      <span className="font-medium">{widget.label}</span>
                      <input
                        type="checkbox"
                        checked={selected}
                        data-testid={`widget-select-${widget.id}`}
                        onChange={(event) =>
                          toggleOptional(widget.id, event.target.checked)
                        }
                        className="h-4 w-4 accent-primary"
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
            </div>
          )}
        </div>
      </div>
      <div className={styles.canvas} data-widget-canvas>
        <div className={styles.centerpiece} data-canvas-centerpiece>
          <FlowerWidget />
        </div>

        <DraggableWidget
          id="learning"
          label="Learning module"
          defaultX={8}
          defaultY={122}
          zIndex={widgetZ("learning")}
          onActivate={() => bringToFront("learning")}
          handleClassName="border-secondary/30 bg-secondary-soft"
          className={styles.widget}
        >
          <LearningWidget />
        </DraggableWidget>

        {!hidden.has("tracking") && (
          <DraggableWidget
            id="tracking"
            label="Tracking"
            defaultX={896}
            defaultY={292}
            zIndex={widgetZ("tracking")}
            onActivate={() => bringToFront("tracking")}
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
            zIndex={widgetZ("help")}
            onActivate={() => bringToFront("help")}
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
            defaultX={980}
            defaultY={560}
            zIndex={widgetZ("faq")}
            onActivate={() => bringToFront("faq")}
            handleClassName="border-border bg-surface"
            className={styles.widget}
          >
            <FaqWidget showOpenLink />
          </DraggableWidget>
        )}

        {!hidden.has("report") && (
          <DraggableWidget
            id="report"
            label="Health report"
            defaultX={520}
            defaultY={560}
            zIndex={widgetZ("report")}
            onActivate={() => bringToFront("report")}
            handleClassName="border-warning/40 bg-warning-soft"
            className={styles.widget}
          >
            <ReportWidget showOpenLink />
          </DraggableWidget>
        )}
      </div>
    </div>
  );
}
