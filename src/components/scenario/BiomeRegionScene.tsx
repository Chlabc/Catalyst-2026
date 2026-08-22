"use client";

import Image from "next/image";
import { TownLesson } from "./TownLesson";
import type { IslandTown } from "@/lib/scenarios";

export function BiomeRegionScene({
  level,
  completed,
  islandComplete,
  onComplete,
  onBack,
}: {
  level: IslandTown;
  completed: boolean;
  islandComplete: boolean;
  onComplete: () => void;
  onBack: () => void;
}) {
  return (
    <section
      className="overflow-hidden rounded-3xl border-2 border-secondary/20 bg-white shadow-lg"
      data-testid="biome-region-scene"
      aria-label={`${level.map.label} town`}
    >
      <div className="relative flex min-h-[70vh] flex-col sm:min-h-[75vh]">
        <div className="relative min-h-[34vh] bg-white sm:min-h-[40vh]">
          <Image
            src={level.regionArt}
            alt=""
            fill
            priority
            className="object-contain object-center p-5 sm:p-8"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent via-white/70 to-white" />
        </div>

        <div className="relative z-10 -mt-10 flex flex-col gap-4 bg-gradient-to-b from-white via-white to-[#fff8ee] px-4 pb-5 pt-1 sm:px-5 sm:pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary hover:bg-primary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              ← Back to island
            </button>
            <div className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-muted">
              {level.visitOrder}. {level.map.label}
              {completed ? " · done ✓" : ""}
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              {level.theme}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground sm:text-3xl">
              {level.title}
            </h2>
          </div>

          <div className="max-w-xl">
            <TownLesson
              key={level.id}
              town={level}
              islandComplete={islandComplete}
              onComplete={onComplete}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
