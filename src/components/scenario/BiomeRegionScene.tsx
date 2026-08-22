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
      className="overflow-hidden rounded-3xl border-2 border-secondary/20 bg-[#1b1520] shadow-lg"
      data-testid="biome-region-scene"
      aria-label={`${level.map.label} town`}
    >
      <div className="relative flex min-h-[70vh] flex-col sm:min-h-[75vh]">
        <div className="relative min-h-[36vh] flex-1 bg-gradient-to-b from-[#7ec8e8] to-[#b8e0a8] sm:min-h-[42vh]">
          <Image
            src={level.regionArt}
            alt=""
            fill
            priority
            className="object-contain object-center p-2 sm:p-4"
            sizes="(max-width: 768px) 100vw, 960px"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#1b1520] to-transparent" />
        </div>

        <div className="relative z-10 -mt-6 flex flex-col gap-4 bg-gradient-to-t from-[#1b1520] via-[#1b1520] to-[#1b1520]/95 px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              ← Back to island
            </button>
            <div className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              {level.visitOrder}. {level.map.label}
              {completed ? " · done ✓" : ""}
            </div>
          </div>

          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/70">
              {level.theme}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">
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
