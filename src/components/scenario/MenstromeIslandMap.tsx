"use client";

import Image from "next/image";
import type { ComingSoonZone, ScenarioLevel } from "@/lib/scenarios";

/** Cropped c8 island (empty water trimmed). Unique filename to bust image cache. */
export const ISLAND_MAP_SRC = "/menstrome/c8-island-tight.png";

export function MenstromeIslandMap({
  levels,
  comingSoon = [],
  completed,
  activeId,
  onSelect,
}: {
  levels: ScenarioLevel[];
  comingSoon?: ComingSoonZone[];
  completed: Set<string>;
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl border-2 border-secondary/25 bg-[#7ec8e8] shadow-sm"
      data-testid="menstrome-island-map"
    >
      <Image
        src={ISLAND_MAP_SRC}
        alt="Menstrome Island. Tap a numbered town to visit."
        width={1640}
        height={1332}
        className="h-auto w-full select-none"
        priority
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />

      {levels.map((level) => {
        const isDone = completed.has(level.id);
        const isActive = activeId === level.id;
        return (
          <button
            key={level.id}
            type="button"
            data-hotspot={level.id}
            aria-label={`Visit ${level.map.label}: ${level.title}${isDone ? ", completed" : ""}`}
            aria-pressed={isActive}
            onClick={() => onSelect(level.id)}
            className={`group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#7ec8e8] ${
              isActive ? "scale-105" : "hover:scale-105"
            } transition-transform`}
            style={{
              left: `${level.map.xPercent}%`,
              top: `${level.map.yPercent}%`,
            }}
          >
            {/* Large tap target over the biome */}
            <span
              className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/0 group-hover:bg-white/20 sm:h-20 sm:w-20"
              aria-hidden
            />
            <span
              className={`relative grid h-12 w-12 place-items-center rounded-full border-[3px] text-base font-bold shadow-lg transition ${
                isDone
                  ? "border-white bg-secondary text-white"
                  : "border-white bg-primary text-white group-hover:bg-primary-dark"
              }`}
            >
              {isDone ? "✓" : level.visitOrder}
            </span>
            {(level.visitOrder === 1 || level.finale) && (
              <span className="relative rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-primary shadow-md">
                {level.visitOrder === 1 ? "Start here" : "Finish here"}
              </span>
            )}
          </button>
        );
      })}

      {comingSoon.map((zone) => (
        <div
          key={zone.id}
          data-hotspot-soon={zone.id}
          className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
          style={{ left: `${zone.xPercent}%`, top: `${zone.yPercent}%` }}
          title={`${zone.label} — coming soon`}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-dashed border-white/90 bg-black/30 text-sm text-white">
            ·
          </span>
          <span className="rounded-full bg-black/45 px-2.5 py-1 text-center text-[10px] font-semibold text-white">
            {zone.label}
            <span className="block text-[9px] font-normal opacity-90">soon</span>
          </span>
        </div>
      ))}
    </div>
  );
}
