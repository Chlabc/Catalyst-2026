"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { scenarioLevels } from "@/lib/scenarios";
import { COMPLETED_SCENARIOS_KEY } from "@/components/scenario/ScenarioPath";
import { ISLAND_MAP_SRC } from "@/components/scenario/MenstromeIslandMap";

export function LearningWidget() {
  const [completedCount, setCompletedCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COMPLETED_SCENARIOS_KEY);
      const completed: string[] = raw ? JSON.parse(raw) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompletedCount(completed.length);
    } catch {
      // Corrupt/missing storage — just show 0.
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <Link
      href="/scenarios"
      className="block overflow-hidden rounded-b-2xl border-2 border-t-0 border-secondary/30 bg-white/90 backdrop-blur-sm transition-colors hover:brightness-[0.98]"
    >
      <div className="relative h-36 w-full bg-[#7ec8e8]">
        <Image
          src={ISLAND_MAP_SRC}
          alt="Menstrome Island"
          fill
          className="object-contain object-center"
          sizes="320px"
        />
      </div>
      <div className="p-4">
        <p className="text-base font-semibold text-foreground">Menstrome Island</p>
        <p className="mt-1 text-sm text-text-muted">
          Travel the towns · {completedCount} of {scenarioLevels.length} explored
        </p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
          <div
            className="h-full rounded-full bg-secondary"
            style={{
              width: `${(completedCount / scenarioLevels.length) * 100}%`,
            }}
          />
        </div>
      </div>
    </Link>
  );
}
