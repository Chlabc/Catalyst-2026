import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

// Owner: Person A
// Build the interactive scenario modules here (the inherited blueprint's
// core concept). Each scenario is a short, practical situation with a
// walkthrough — pull content from the Product-thon team's research.

export default function ScenariosPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-foreground">Learn</h1>
        <p className="mt-2 text-text-muted">
          Interactive scenarios — coming from the inherited blueprint.
        </p>
        <Card className="mt-6">
          <p className="text-sm text-text-muted">Scenario modules go here.</p>
        </Card>
      </div>
    </Container>
  );
}
