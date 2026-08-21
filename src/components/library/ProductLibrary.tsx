"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { products } from "@/lib/products";

const FILTERS = ["All", "First period", "Sports", "Overnight", "Light days"] as const;

export function ProductLibrary() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");

  const visible =
    filter === "All"
      ? products
      : products.filter((p) => p.goodFor.includes(filter));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visible.map((product) => (
          <Card key={product.id}>
            <h3 className="font-semibold text-foreground">{product.name}</h3>
            <p className="mt-1 text-sm text-text-muted">{product.description}</p>

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
          </Card>
        ))}
      </div>
    </div>
  );
}
