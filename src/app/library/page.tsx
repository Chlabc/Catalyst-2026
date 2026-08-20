import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

// Owner: Person A (paired with scenarios)
// Product library: pads/cups/tampons/discs, pros/cons, filterable by
// comfort/activity level. Data-driven — good candidate for a simple
// array of objects rendered as cards.

export default function LibraryPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-foreground">
          Product Library
        </h1>
        <p className="mt-2 text-text-muted">
          Plain-language guide to period products.
        </p>
        <Card className="mt-6">
          <p className="text-sm text-text-muted">Product entries go here.</p>
        </Card>
      </div>
    </Container>
  );
}
