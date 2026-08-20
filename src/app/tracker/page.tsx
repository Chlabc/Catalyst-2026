"use client";

import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

// Owner: Person B
// Period tracker/calendar. Store entries in localStorage — no account,
// no backend, which is itself a divergence log entry (privacy-first,
// low-friction for a young audience). Pair with a biome-growth streak
// visual if time allows.

export default function TrackerPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-foreground">Tracker</h1>
        <p className="mt-2 text-text-muted">
          Private, local-only calendar. No account needed.
        </p>
        <Card className="mt-6">
          <p className="text-sm text-text-muted">Calendar UI goes here.</p>
        </Card>
      </div>
    </Container>
  );
}
