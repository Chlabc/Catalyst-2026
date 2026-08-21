"use client";

import { useEffect, useState } from "react";
import { HelpIcon, ChevronIcon, CloseIcon } from "@/components/icons";

// Deliberately NOT an AI chatbot — a real one needs a backend, an API
// key, and a safety review before it should give health-adjacent
// answers to a young audience. This gives the same "tap for a quick
// answer" feel with pre-written, safe content instead.
const FAQS = [
  {
    q: "Is my data private?",
    a: "Yes — everything in the tracker is stored only on this device (localStorage). No account, no upload, nothing sent anywhere.",
  },
  {
    q: "How do I log my period?",
    a: "Go to Tracker, tap a day on the calendar to log it, then tag any symptoms or your mood for that day.",
  },
  {
    q: "What's Menstrome Island?",
    a: "It's the Learn section — short interactive scenarios you click through, based on real situations.",
  },
  {
    q: "What if something feels really wrong?",
    a: "Talk to a trusted adult, a school nurse, or a doctor. Kids Helpline (Australia): 1800 55 1800, free and 24/7.",
  },
];

// Docked as a tab on the screen edge rather than a floating corner
// button, so it can never end up hidden behind a dragged canvas widget
// and never reads as "vanished" - it's always the same strip in the
// same place, open or closed.
export function HelpPanel() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener("blossom:open-help", handleOpen);
    return () => window.removeEventListener("blossom:open-help", handleOpen);
  }, []);

  return (
    <div className="fixed right-0 top-1/2 z-50 -translate-y-1/2">
      {open && (
        <div className="absolute right-full top-1/2 mr-3 w-80 -translate-y-1/2 rounded-2xl border-2 border-border bg-surface p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-foreground">
              Help &amp; FAQ
            </p>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close help"
              className="text-text-muted hover:text-foreground"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-2 flex flex-col divide-y divide-border">
            {FAQS.map((faq) => {
              const isOpen = expanded === faq.q;
              return (
                <div key={faq.q}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : faq.q)}
                    className="flex w-full items-center justify-between py-2.5 text-left text-sm font-medium text-foreground"
                  >
                    <span>{faq.q}</span>
                    <ChevronIcon
                      className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="pb-2.5 text-sm text-text-muted">{faq.a}</p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-2 text-xs italic text-text-muted">
            Pre-written answers, not a live chat.
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close help" : "Open help"}
        className={`flex flex-col items-center gap-1.5 rounded-l-2xl border-2 border-r-0 border-border bg-primary px-2.5 py-4 text-white shadow-lg transition-colors hover:bg-primary/90 ${open ? "border-transparent" : ""
          }`}
      >
        <HelpIcon className="h-5 w-5" />
        <span className="text-xs font-semibold tracking-wide [writing-mode:vertical-rl]">
          Help
        </span>
      </button>
    </div>
  );
}
