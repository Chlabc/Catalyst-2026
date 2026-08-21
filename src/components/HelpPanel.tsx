"use client";

import { useState } from "react";
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

export function HelpPanel() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-2xl border border-border bg-surface p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Quick help
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
                    className="flex w-full items-center justify-between py-2 text-left text-sm text-foreground"
                  >
                    <span>{faq.q}</span>
                    <ChevronIcon
                      className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="pb-2 text-xs text-text-muted">{faq.a}</p>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-2 text-[10px] italic text-text-muted">
            Pre-written answers, not a live chat.
          </p>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Help"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform hover:scale-105"
      >
        <HelpIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
