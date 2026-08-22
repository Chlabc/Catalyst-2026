"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ChevronIcon } from "@/components/icons";
import { products } from "@/lib/products";

export const LIBRARY_FILTERS = [
  "All",
  "First period",
  "Sports",
  "Overnight",
  "Light days",
] as const;
export type LibraryFilter = (typeof LIBRARY_FILTERS)[number];

const FILTERS = LIBRARY_FILTERS;
type Filter = LibraryFilter;

export function isLibraryFilter(value: string | undefined): value is Filter {
  return Boolean(value && (FILTERS as readonly string[]).includes(value));
}

const SITUATIONS: { label: string; filter: Filter; blurb: string }[] = [
  {
    label: "Swimming tomorrow?",
    filter: "Sports",
    blurb: "These options move with you and work in water.",
  },
  {
    label: "Heavy flow overnight?",
    filter: "Overnight",
    blurb: "These give extra coverage while you sleep.",
  },
  {
    label: "Not sure where to start?",
    filter: "First period",
    blurb: "These are usually the easiest first choice.",
  },
];

export function ProductLibrary({
  initialFilter = "All",
}: {
  initialFilter?: string;
}) {
  const [filter, setFilter] = useState<Filter>(
    isLibraryFilter(initialFilter) ? initialFilter : "All",
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const activeSituation = SITUATIONS.find((s) => s.filter === filter);

  const visible =
    filter === "All"
      ? products
      : products.filter((p) => p.goodFor.includes(filter));

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div>
      {isLibraryFilter(initialFilter) && initialFilter !== "All" && (
        <p className="mb-4 text-sm text-text-muted" data-testid="library-from-island">
          Showing {initialFilter} options — same categories as the island
          mini-game.
        </p>
      )}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {SITUATIONS.map((s) => (
          <button
            key={s.label}
            onClick={() => setFilter(s.filter)}
            className={`rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
              filter === s.filter
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-background"
            }`}
          >
            <span className="font-medium text-foreground">{s.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              filter === f
                ? "border-primary bg-primary text-white"
                : "border-border text-text-muted hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {activeSituation && (
        <p className="mt-3 text-sm text-text-muted">{activeSituation.blurb}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((product) => {
          const isOpen = expanded.has(product.id);
          return (
            <Card key={product.id} className="cursor-pointer">
              <button
                onClick={() => toggleExpanded(product.id)}
                className="flex w-full items-start justify-between text-left"
              >
                <div>
                  <h3 className="font-semibold text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">
                    {product.description}
                  </p>
                </div>
                <ChevronIcon
                  className={`mt-1 h-4 w-4 shrink-0 text-text-muted transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div className="mt-3 flex flex-wrap gap-1">
                {product.goodFor.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-background px-2 py-0.5 text-xs text-text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {isOpen && (
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium text-secondary">Pros</p>
                    <ul className="mt-1 list-disc pl-4 text-text-muted">
                      {product.pros.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-accent">Cons</p>
                    <ul className="mt-1 list-disc pl-4 text-text-muted">
                      {product.cons.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
