"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WELCOME_KEY } from "@/components/WelcomeGate";
import {
  NAV_TUTORIAL_STEPS,
  REPLAY_NAV_TUTORIAL_EVENT,
  WELCOME_CHANGED_EVENT,
  hasSeenNavTutorial,
  persistNavTutorialSeen,
} from "@/lib/navTutorial";

type Rect = { top: number; left: number; width: number; height: number };

function readWelcomeDone() {
  try {
    return window.localStorage.getItem(WELCOME_KEY) === "true";
  } catch {
    return false;
  }
}

function measureSelector(selector: string): Rect | null {
  const node = document.querySelector(selector);
  if (!(node instanceof HTMLElement)) return null;
  const box = node.getBoundingClientRect();
  if (box.width < 2 && box.height < 2) return null;
  return {
    top: box.top,
    left: box.left,
    width: box.width,
    height: box.height,
  };
}

export function NavTutorial({
  editing,
  onSetEditing,
}: {
  editing: boolean;
  onSetEditing: (next: boolean) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [welcomeDone, setWelcomeDone] = useState(false);
  const [seen, setSeen] = useState(true);
  const [forced, setForced] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const openRef = useRef(false);
  const editingBeforeRef = useRef(false);

  const open = loaded && (forced || (welcomeDone && !seen));
  openRef.current = open;

  useEffect(() => {
    setWelcomeDone(readWelcomeDone());
    setSeen(hasSeenNavTutorial());
    setLoaded(true);
  }, []);

  useEffect(() => {
    function onWelcomeChanged() {
      setWelcomeDone(readWelcomeDone());
    }
    function onReplay() {
      editingBeforeRef.current = editing;
      setStepIndex(0);
      setForced(true);
    }
    window.addEventListener(WELCOME_CHANGED_EVENT, onWelcomeChanged);
    window.addEventListener(REPLAY_NAV_TUTORIAL_EVENT, onReplay);
    return () => {
      window.removeEventListener(WELCOME_CHANGED_EVENT, onWelcomeChanged);
      window.removeEventListener(REPLAY_NAV_TUTORIAL_EVENT, onReplay);
    };
  }, [editing]);

  const finish = useCallback(() => {
    persistNavTutorialSeen();
    setSeen(true);
    setForced(false);
    onSetEditing(editingBeforeRef.current);
  }, [onSetEditing]);

  useEffect(() => {
    if (!open) return;
    editingBeforeRef.current = editing;
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps -- capture editing only when the tour opens

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      finish();
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, finish]);

  useEffect(() => {
    return () => {
      if (!openRef.current) return;
      if (window.location.pathname !== "/") persistNavTutorialSeen();
    };
  }, []);

  const step = NAV_TUTORIAL_STEPS[stepIndex] ?? NAV_TUTORIAL_STEPS[0];

  useEffect(() => {
    if (!open) {
      setRect(null);
      return;
    }

    let cancelled = false;

    function update() {
      const node = document.querySelector(step.selector);
      if (node instanceof HTMLElement) {
        node.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
      }
      setRect(measureSelector(step.selector));
      window.setTimeout(() => {
        if (cancelled) return;
        setRect(measureSelector(step.selector));
      }, 180);
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, step.selector, stepIndex]);

  function toggleTour() {
    if (open) {
      finish();
      return;
    }
    editingBeforeRef.current = editing;
    setStepIndex(0);
    setForced(true);
  }

  if (!loaded) return null;

  return (
    <>
      <button
        type="button"
        data-testid="toggle-tour"
        aria-pressed={open}
        onClick={toggleTour}
        className={`pointer-events-auto relative rounded-full border px-4 py-2 text-sm font-semibold shadow-sm backdrop-blur-md transition-colors ${
          open
            ? "z-[90] border-primary bg-primary text-white"
            : "border-white/60 bg-white/90 text-foreground hover:border-primary hover:bg-white"
        }`}
      >
        {open ? "Hide tour" : "Show tour"}
      </button>
      {open && (
        <TourLayer
          stepIndex={stepIndex}
          rect={rect}
          title={step.title}
          body={step.body}
          onSkip={finish}
          onBack={() => setStepIndex((index) => Math.max(0, index - 1))}
          onNext={() => {
            if (stepIndex >= NAV_TUTORIAL_STEPS.length - 1) {
              finish();
              return;
            }
            setStepIndex((index) => index + 1);
          }}
        />
      )}
    </>
  );
}

function TourLayer({
  stepIndex,
  rect,
  title,
  body,
  onSkip,
  onBack,
  onNext,
}: {
  stepIndex: number;
  rect: Rect | null;
  title: string;
  body: string;
  onSkip: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const last = stepIndex >= NAV_TUTORIAL_STEPS.length - 1;
  const pad = 8;
  const tipWidth = Math.min(320, typeof window !== "undefined" ? window.innerWidth - 16 : 320);
  const tipLeft = rect
    ? Math.max(
        8,
        Math.min(
          rect.left + rect.width / 2 - tipWidth / 2,
          (typeof window !== "undefined" ? window.innerWidth : 400) - tipWidth - 8,
        ),
      )
    : 8;
  let tipTop = rect ? rect.top + rect.height + pad + 10 : 80;
  if (typeof window !== "undefined" && tipTop + 200 > window.innerHeight) {
    tipTop = Math.max(8, (rect?.top ?? 200) - 190);
  }

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: 80 }}
      data-testid="nav-tutorial"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nav-tutorial-title"
    >
      <div
        data-testid="nav-tutorial-overlay"
        className="absolute inset-0 cursor-default"
        onClick={(event) => event.stopPropagation()}
        aria-hidden
      />
      {rect && (
        <div
          data-testid="nav-tutorial-spotlight"
          className="pointer-events-none absolute rounded-2xl ring-4 ring-primary"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: "0 0 0 9999px rgb(61 46 58 / 48%)",
          }}
        />
      )}
      <div
        data-testid="nav-tutorial-tooltip"
        className="absolute z-[61] rounded-2xl border-2 border-primary/25 bg-white p-4 shadow-xl"
        style={{ top: tipTop, left: tipLeft, width: tipWidth }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
          Bloom tour · {stepIndex + 1} of {NAV_TUTORIAL_STEPS.length}
        </p>
        <h2 id="nav-tutorial-title" className="mt-1 text-base font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{body}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            data-testid="nav-tutorial-skip"
            onClick={onSkip}
            className="text-sm font-semibold text-text-muted underline decoration-transparent hover:decoration-current"
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                data-testid="nav-tutorial-back"
                onClick={onBack}
                className="rounded-full border-2 border-border bg-surface px-3 py-1.5 text-sm font-semibold text-foreground"
              >
                Back
              </button>
            )}
            <button
              type="button"
              data-testid={last ? "nav-tutorial-got-it" : "nav-tutorial-next"}
              onClick={onNext}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white"
            >
              {last ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
