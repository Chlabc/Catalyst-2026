"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/icons";

// PLACEHOLDER: [teammate] is replacing this FAQ list with the real
// helpline module - a map of nearby support, yoga poses, helplines, and
// a printable report generated from tracker data. Keep the outer
// rounded-b-2xl wrapper so it still fits the canvas.
const FAQS = [
  {
    q: "Is my data private?",
    a: "Yes — everything is stored only on this device. No account, no upload.",
  },
  {
    q: "How do I move these widgets?",
    a: "Drag the ⠿⠿⠿ handle at the top of any widget. Tracking and Help can be hidden and brought back; the flower and Menstrome Island stay put.",
  },
  {
    q: "What if something feels really wrong?",
    a: "Talk to a trusted adult, a school nurse, or a doctor. Kids Helpline (Australia): 1800 55 1800.",
  },
];

export function HelpWidget() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-b-2xl border border-t-0 border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-foreground">Quick help</p>
        <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-medium text-accent">
          placeholder
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-text-muted">
        A calm place to find support. The full help centre will connect nearby
        pharmacies, helplines, gentle movement, and printable period notes.
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["Nearby support", "Yoga & comfort", "Period summary"].map((item) => (
          <span
            key={item}
            className="rounded-full bg-background px-2.5 py-1 text-[10px] font-medium text-text-muted"
          >
            {item}
          </span>
        ))}
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
              {isOpen && <p className="pb-2 text-xs text-text-muted">{faq.a}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
