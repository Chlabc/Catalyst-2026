import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { ScenarioPath } from "@/components/scenario/ScenarioPath";
import { DropletIcon } from "@/components/icons";
import { scenarioLevels } from "@/lib/scenarios";

// Add more levels by extending scenarioLevels in src/lib/scenarios.ts —
// this page and ScenarioPath don't need to change.

export default function ScenariosPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-foreground">
          Menstrome Island
        </h1>
        <p className="mt-2 text-text-muted">
          Interactive scenarios — click through and see where it leads. Not a
          replacement for sex ed, just somewhere to start.
        </p>
        <div className="mt-6">
          <ScenarioPath levels={scenarioLevels} />
        </div>

        <Link href="/library" className="mt-6 block">
          <Card className="flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <DropletIcon className="h-8 w-8 shrink-0 text-secondary" />
            <div>
              <p className="font-semibold text-foreground">
                Once you know the situation, know your options
              </p>
              <p className="mt-1 text-sm text-text-muted">
                The Product Library is part of Menstrome Island too — pads,
                cups, tampons, discs, explained plainly and filterable by
                what you actually need.
              </p>
            </div>
          </Card>
        </Link>
      </div>
    </Container>
  );
}
