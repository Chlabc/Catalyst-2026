"use client";

import { useEffect, useRef, useState } from "react";

export const WELCOME_KEY = "blossom_has_seen_welcome";

export function WelcomeGate() {
  const [isOpen, setIsOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      setIsOpen(window.localStorage.getItem(WELCOME_KEY) !== "true");
    } catch {
      // If storage is unavailable, a welcoming first view is still safe.
      setIsOpen(true);
    }
    setLoaded(true);
  }, []);

  function enterIsland() {
    try {
      window.localStorage.setItem(WELCOME_KEY, "true");
    } catch {
      // The page remains usable even when the preference cannot be saved.
    }
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ctaRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        enterIsland();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  if (!loaded || !isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      data-testid="welcome-gate"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/25 p-4 backdrop-blur-sm"
    >
      <section className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border-2 border-primary/25 bg-primary-soft p-7 shadow-2xl sm:p-9">
        <div aria-hidden className="absolute -right-8 -top-9 text-8xl opacity-80">
          🌼
        </div>
        <div
          aria-hidden
          className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-secondary/25"
        />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-dark">
            Welcome to Bloom
          </p>
          <h1
            id="welcome-title"
            className="mt-3 max-w-sm text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
          >
            Your period questions deserve kind answers.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/75 sm:text-lg">
            Learn useful things in little bites, practise real-life moments, and
            build an island that feels like yours.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {[
              ["1", "Learn", "Small, practical lessons"],
              ["2", "Grow", "Care for your plant"],
              ["3", "Get support", "Find your next step"],
            ].map(([number, title, description]) => (
              <div key={number} className="rounded-2xl bg-white/70 p-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-white">
                  {number}
                </span>
                <p className="mt-2 text-sm font-bold text-foreground">{title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <button
            ref={ctaRef}
            type="button"
            data-testid="welcome-enter"
            onClick={enterIsland}
            className="mt-7 w-full rounded-full bg-primary px-5 py-3 text-base font-bold text-white shadow-[0_5px_0_var(--primary-dark)] transition-transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
          >
            Enter my island →
          </button>
          <p className="mt-4 text-center text-xs text-text-muted">
            No account needed. Your tracker stays on this device.
          </p>
        </div>
      </section>
    </div>
  );
}
