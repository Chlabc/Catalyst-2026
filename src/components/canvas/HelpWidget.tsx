"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/icons";

const FAQS = [
  {
    q: "Is my data private?",
    a: "Yes — everything is stored only on this device. No account, no upload.",
  },
  {
    q: "How do I move these widgets?",
    a: "Drag the ⠿⠿⠿ handle at the top of any widget. Optional widgets can be hidden and brought back; the flower and Menstrome Island stay put.",
  },
  {
    q: "What if something feels really wrong?",
    a: "Talk to a trusted adult, a school nurse, or a doctor. Kids Helpline (Australia): 1800 55 1800.",
  },
];

export function HelpWidget() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="rounded-b-2xl border-2 border-t-0 border-accent/30 bg-accent-soft p-5">
      <p className="text-base font-semibold text-foreground">Quick help</p>
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
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              {isOpen && <p className="pb-2 text-sm text-text-muted">{faq.a}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
