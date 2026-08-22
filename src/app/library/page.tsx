import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ProductLibrary } from "@/components/library/ProductLibrary";
import { SceneBackdropFrame } from "@/components/theme/SceneBackdropFrame";
import { PageHeader, PAGE_BODY_CLASS, PAGE_SECTION_CLASS } from "@/components/ui/PageHeader";
import { HomeBackButton } from "@/components/ui/HomeBackButton";

export default function LibraryPage() {
  return (
    <SceneBackdropFrame testId="library-scene-backdrop">
      <Container className={PAGE_SECTION_CLASS}>
        <HomeBackButton />
        <div className={PAGE_BODY_CLASS}>
        <PageHeader
          eyebrow={
            <Link href="/scenarios" className="hover:underline">
              ← Menstrome Island
            </Link>
          }
          title="Product Library"
          subtitle="Plain-language guide to period products — filter by what you need."
        />
        <div className={PAGE_BODY_CLASS}>
          <ProductLibrary />
        </div>
        </div>
      </Container>
    </SceneBackdropFrame>
  );
}
