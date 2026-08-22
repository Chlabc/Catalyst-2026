"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { MenstromeIslandMap } from "./MenstromeIslandMap";
import { BiomeRegionScene } from "./BiomeRegionScene";
import {
  COMPLETED_SCENARIOS_KEY,
  SEX_ED_DISCLAIMER,
  comingSoonZones,
  type IslandTown,
} from "@/lib/scenarios";

type ViewMode = "map" | "list";

export function LearnHub({ levels }: { levels: IslandTown[] }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("map");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COMPLETED_SCENARIOS_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setCompleted(new Set(JSON.parse(raw)));
    } catch {
      // Corrupt/missing storage — start fresh.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(
      COMPLETED_SCENARIOS_KEY,
      JSON.stringify([...completed]),
    );
  }, [completed, loaded]);

  const activeLevel = useMemo(
    () => levels.find((level) => level.id === activeId) ?? null,
    [levels, activeId],
  );

  function markComplete(id: string) {
    setCompleted((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }

  function enterRegion(id: string) {
    setActiveId(id);
  }

  function backToIsland() {
    setActiveId(null);
    setView("map");
  }

  if (!loaded) return null;

  if (activeLevel) {
    const already = completed.has(activeLevel.id);
    const islandComplete = already
      ? completed.size === levels.length
      : completed.size + 1 === levels.length;
    return (
      <BiomeRegionScene
        level={activeLevel}
        completed={already}
        islandComplete={islandComplete}
        onComplete={() => markComplete(activeLevel.id)}
        onBack={backToIsland}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <Image
            src="/menstrome/guide-character.png"
            alt=""
            width={72}
            height={88}
            className="h-16 w-auto drop-shadow-md sm:h-20"
          />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Explore Menstrome Island
            </p>
            <p className="mt-0.5 text-sm text-text-muted">
              Seven towns. Same path each time: a scenario, a few facts, one
              decision, a reward. Suggested order starts at Bloodbury and ends
              at Divursity.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {completed.size} of {levels.length} towns explored
            </p>
          </div>
        </div>
        <div
          className="flex rounded-full border border-border bg-white/70 p-1 text-xs font-semibold"
          role="group"
          aria-label="Learn view"
        >
          {(
            [
              { id: "map", label: "Island map" },
              { id: "list", label: "List view" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={view === option.id}
              onClick={() => setView(option.id)}
              className={`rounded-full px-3 py-1.5 transition-colors ${
                view === option.id
                  ? "bg-secondary text-white"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p
        className="rounded-2xl border border-white/70 bg-white/75 px-4 py-3 text-sm leading-relaxed text-foreground"
        data-testid="island-disclaimer"
      >
        {SEX_ED_DISCLAIMER} This island is a first, friendly look — not a
        replacement for class, a parent, or a clinician.
      </p>

      {completed.size === levels.length && (
        <div
          className="rounded-2xl border border-secondary/30 bg-secondary-soft px-4 py-3"
          data-testid="island-complete-banner"
        >
          <p className="text-sm font-semibold text-foreground">
            You finished Menstrome Island
          </p>
          <p className="mt-1 text-sm text-text-muted">
            You&apos;ve learned the basics. The Product Library has the full
            plain-language guide whenever you need it.
          </p>
        </div>
      )}

      {view === "map" ? (
        <MenstromeIslandMap
          levels={levels}
          comingSoon={comingSoonZones}
          completed={completed}
          activeId={null}
          onSelect={enterRegion}
        />
      ) : (
        <div
          className="flex flex-col gap-3"
          data-testid="menstrome-list-fallback"
        >
          {[...levels]
            .sort((a, b) => a.visitOrder - b.visitOrder)
            .map((level) => {
            const isDone = completed.has(level.id);
            return (
              <Card key={level.id} className="overflow-hidden p-0">
                <button
                  type="button"
                  onClick={() => enterRegion(level.id)}
                  className="flex w-full flex-col text-left sm:flex-row"
                >
                  <div className="relative h-28 w-full shrink-0 sm:h-auto sm:w-40">
                    <Image
                      src={level.regionArt}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-3 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                        {level.visitOrder}. {level.map.label}
                        {level.visitOrder === 1 ? " · start here" : ""}
                        {level.finale ? " · finish" : ""}
                        {isDone ? " · done" : ""}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-foreground">
                        {level.title}
                      </h3>
                      <p className="mt-1 text-sm text-text-muted">
                        {level.teaser}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-primary">
                        Visit town →
                      </p>
                    </div>
                    {isDone && (
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-sm font-bold text-white">
                        ✓
                      </span>
                    )}
                  </div>
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
