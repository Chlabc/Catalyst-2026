import { Container } from "@/components/ui/Container";
import { ScenarioPath } from "@/components/scenario/ScenarioPath";
import { scenarioLevels } from "@/lib/scenarios";

// Add more levels by extending scenarioLevels in src/lib/scenarios.ts —
// this page and ScenarioPath don't need to change.

export default function ScenariosPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-foreground">Learn</h1>
        <p className="mt-2 text-text-muted">
          Interactive scenarios — click through and see where it leads.
        </p>
        <div className="mt-6">
          <ScenarioPath levels={scenarioLevels} />
        </div>
      </div>
    </Container>
  );
}
