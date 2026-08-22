"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/icons";
import { FAQS } from "@/lib/faqs";

export function FaqWidget() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div
      className="rounded-b-2xl border-2 border-t-0 border-border bg-surface/90 p-5"
      data-testid="faq-widget"
    >
      <p className="text-base font-semibold text-foreground">FAQ</p>
      <p className="mt-1 text-xs text-text-muted">
        Pre-written answers, not a live chat.
      </p>

      <div className="mt-3 flex flex-col divide-y divide-border">
        {FAQS.map((faq) => {
          const isOpen = expanded === faq.q;
          return (
            <div key={faq.q}>
              <button
                type="button"
                data-testid="faq-question"
                data-faq-q={faq.q}
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : faq.q)}
                className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-sm font-medium text-foreground"
              >
                <span>{faq.q}</span>
                <ChevronIcon
                  className={`h-4 w-4 shrink-0 text-text-muted transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p
                  className="pb-2.5 text-sm text-text-muted"
                  data-testid="faq-answer"
                  data-faq-a={faq.q}
                >
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
