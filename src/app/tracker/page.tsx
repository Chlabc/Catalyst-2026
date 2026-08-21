import { Container } from "@/components/ui/Container";
import { Tracker } from "@/components/tracker/Tracker";

export default function TrackerPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Tracker</h1>
        <p className="mt-2 text-base text-text-muted">
          Private, local-only calendar. No account needed.
        </p>
        <div className="mt-6">
          <Tracker />
        </div>
      </div>
    </Container>
  );
}
