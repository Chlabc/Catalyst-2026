"use client";

import { useState } from "react";
import { ChevronIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { FAQS } from "@/lib/faqs";

export function FaqList({
  variant = "widget",
}: {
  variant?: "widget" | "page";
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (variant === "page") {
    return (
      <div className="flex flex-col gap-3" data-testid="faq-page-list">
        {FAQS.map((faq) => {
          const isOpen = expanded === faq.q;
          return (
            <Card key={faq.q}>
              <button
                type="button"
                data-testid="faq-question"
                data-faq-q={faq.q}
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : faq.q)}
                className="flex w-full items-start justify-between gap-4 text-left"
              >
                <span className="text-lg font-semibold text-foreground">
                  {faq.q}
                </span>
                <ChevronIcon
                  className={`mt-1 h-5 w-5 shrink-0 text-text-muted transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p
                  className="mt-3 text-base leading-relaxed text-text-muted"
                  data-testid="faq-answer"
                  data-faq-a={faq.q}
                >
                  {faq.a}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    );
  }

  return (
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
  );
}
