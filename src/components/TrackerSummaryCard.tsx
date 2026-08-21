"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CalendarIcon } from "@/components/icons";
import { readLogsFromStorage, computeCurrentStreak } from "@/lib/trackerStorage";

export function TrackerSummaryCard() {
  const [loaded, setLoaded] = useState(false);
  const [streak, setStreak] = useState<{ startKey: string; length: number } | null>(
    null,
  );

  useEffect(() => {
    const logs = readLogsFromStorage();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStreak(computeCurrentStreak(logs));
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  return (
    <Link href="/tracker">
      <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
        <CalendarIcon className="h-8 w-8 shrink-0 text-primary" />
        <div>
          {streak ? (
            <>
              <p className="font-semibold text-foreground">
                Day {streak.length} of your cycle
              </p>
              <p className="text-sm text-text-muted">
                Tap to log today or check symptoms
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">
                No period logged yet
              </p>
              <p className="text-sm text-text-muted">
                Tap to start tracking — private, no account
              </p>
            </>
          )}
        </div>
      </Card>
    </Link>
  );
}
