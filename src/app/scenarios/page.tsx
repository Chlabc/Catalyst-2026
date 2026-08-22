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
          subtitle="A navigable biome from the PADthai blueprint. Travel into a region, look around, then choose what you'd do — not a quiz at the bottom of a list."
        />
        <div className={PAGE_BODY_CLASS}>
          <LearnHub levels={scenarioLevels} />

          <Link href="/library" className="mt-6 block">
            <Card className="flex items-center gap-4 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <DropletIcon className="h-8 w-8 shrink-0 text-secondary" />
              <div>
                <p className="font-semibold text-foreground">
                  Once you know the situation, know your options
                </p>
                <p className="mt-1 text-sm text-text-muted">
                  The Product Library is part of Menstrome Island too — pads,
                  cups, tampons, discs, explained plainly and filterable by
                  what you actually need.
                </p>
              </div>
            </Card>
          </Link>
        </div>
      </Container>
    </SceneBackdropFrame>
  );
}
