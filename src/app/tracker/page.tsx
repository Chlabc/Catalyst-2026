import { Container } from "@/components/ui/Container";
import { Tracker } from "@/components/tracker/Tracker";

export default function TrackerPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-foreground">Tracker</h1>
        <p className="mt-2 text-text-muted">
          Private, local-only calendar. No account needed.
        </p>
        <div className="mt-6">
          <Tracker />
        </div>
      </div>
    </Container>
  );
}
