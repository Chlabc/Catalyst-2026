import { Container } from "@/components/ui/Container";
import { ProductLibrary } from "@/components/library/ProductLibrary";
import { SceneBackdropFrame } from "@/components/theme/SceneBackdropFrame";
import { PageHeader, PAGE_BODY_CLASS, PAGE_SECTION_CLASS } from "@/components/ui/PageHeader";
import { HomeBackButton } from "@/components/ui/HomeBackButton";

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const query = await searchParams;
  return (
    <SceneBackdropFrame testId="library-scene-backdrop">
      <Container className={PAGE_SECTION_CLASS}>
        <HomeBackButton href="/scenarios" label="← Menstrome Island" />
        <div className={PAGE_BODY_CLASS}>
        <PageHeader
          title="Product Library"
          subtitle="Plain-language guide to period products — filter by what you need."
        />
        <div className={PAGE_BODY_CLASS}>
          <ProductLibrary initialFilter={query.filter} />
        </div>
        </div>
      </Container>
    </SceneBackdropFrame>
  );
}
