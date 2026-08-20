import { Container } from "@/components/ui/Container";
import { ScenarioPlayer } from "@/components/scenario/ScenarioPlayer";
import { firstPeriodScenario } from "@/lib/scenarios";

// Owner: Person A
// One scenario is built as a working example below. To add more: copy a
// new array into src/lib/scenarios.ts (same shape as firstPeriodScenario)
// and render another <ScenarioPlayer /> here. The component itself
// doesn't need to change — just the content.

export default function ScenariosPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-foreground">Learn</h1>
        <p className="mt-2 text-text-muted">
          Interactive scenarios — click through and see where it leads.
        </p>
        <div className="mt-6">
          <ScenarioPlayer
            title="Your first period at school"
            steps={firstPeriodScenario}
          />
        </div>
      </div>
    </Container>
  );
}
