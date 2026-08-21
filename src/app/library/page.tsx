import { Container } from "@/components/ui/Container";
import { ProductLibrary } from "@/components/library/ProductLibrary";

// Add more products in src/lib/products.ts — this page and the
// ProductLibrary component don't need to change.

export default function LibraryPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-foreground">
          Product Library
        </h1>
        <p className="mt-2 text-text-muted">
          Plain-language guide to period products — filter by what you need.
        </p>
        <div className="mt-6">
          <ProductLibrary />
        </div>
      </div>
    </Container>
  );
}
