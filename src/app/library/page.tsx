import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProductLibrary } from "@/components/library/ProductLibrary";

// Add more products in src/lib/products.ts — this page and the
// ProductLibrary component don't need to change.

export default function LibraryPage() {
  return (
    <Container>
      <div className="py-12">
        <p className="text-xs font-medium text-secondary">
          <Link href="/scenarios" className="hover:underline">
            ← Menstrome Island
          </Link>
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          Product Library
        </h1>
        <p className="mt-2 text-base text-text-muted">
          Plain-language guide to period products — filter by what you need.
        </p>
        <div className="mt-6">
          <ProductLibrary />
        </div>
      </div>
    </Container>
  );
}
