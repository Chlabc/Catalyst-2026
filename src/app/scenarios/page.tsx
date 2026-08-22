import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { LearnHub } from "@/components/scenario/LearnHub";
import { DropletIcon } from "@/components/icons";
import { SceneBackdropFrame } from "@/components/theme/SceneBackdropFrame";
import { scenarioLevels } from "@/lib/scenarios";
import { PageHeader, PAGE_BODY_CLASS, PAGE_SECTION_CLASS } from "@/components/ui/PageHeader";

export default function ScenariosPage() {
  return (
    <SceneBackdropFrame testId="scenarios-scene-backdrop">
      <Container className={PAGE_SECTION_CLASS}>
        <PageHeader
          title="Menstrome Island"
          subtitle="Seven towns, story-first. We are not trying to replace sex education."
        />
        <div className={PAGE_BODY_CLASS}>
          <LearnHub levels={scenarioLevels} />

          <Link href="/library" className="mt-6 block">
            <Card className="flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <DropletIcon className="h-8 w-8 shrink-0 text-secondary" />
              <div>
                <p className="font-semibold text-foreground">
                  Product Library
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  The full plain-language product guide — handy after
                  Divursity, or whenever you want to browse everything.
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </Container>
    </SceneBackdropFrame>
  );
}
