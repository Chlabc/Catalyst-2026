"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookIcon } from "@/components/icons";
import { scenarioLevels } from "@/lib/scenarios";
import { COMPLETED_SCENARIOS_KEY } from "@/components/scenario/ScenarioPath";

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
      className="block rounded-b-2xl border border-t-0 border-border bg-surface p-5 transition-colors hover:bg-background"
    >
      <BookIcon className="h-6 w-6 text-secondary" />
      <p className="mt-3 font-semibold text-foreground">Menstrome Island</p>
      <p className="mt-1 text-sm text-text-muted">
        {completedCount} of {scenarioLevels.length} missions complete
      </p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-secondary"
          style={{
            width: `${(completedCount / scenarioLevels.length) * 100}%`,
          }}
        />
      </div>
    </Link>
  );
}
