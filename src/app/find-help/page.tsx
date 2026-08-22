import { HelpFlow } from "@/components/help/HelpFlow";
import { Container } from "@/components/ui/Container";
import { SceneBackdropFrame } from "@/components/theme/SceneBackdropFrame";
import { PAGE_BODY_CLASS, PAGE_SECTION_CLASS } from "@/components/ui/PageHeader";
import { HomeBackButton } from "@/components/ui/HomeBackButton";
import {
  isHelpServiceType,
  type HelpServiceType,
} from "@/lib/helpResources";

type FindHelpPageProps = {
  searchParams: Promise<{
    view?: string | string[];
    service?: string | string[];
  }>;
};

export default async function FindHelpPage({ searchParams }: FindHelpPageProps) {
  const query = await searchParams;
  const view = Array.isArray(query.view) ? query.view[0] : query.view;
  const serviceParam = Array.isArray(query.service)
    ? query.service[0]
    : query.service;
  const initialService: HelpServiceType | undefined = isHelpServiceType(
    serviceParam,
  )
    ? serviceParam
    : undefined;

  return (
    <SceneBackdropFrame testId="find-help-scene-backdrop">
      <Container className={PAGE_SECTION_CLASS}>
        <HomeBackButton />
        <div className={PAGE_BODY_CLASS}>
          <HelpFlow
            initialStep={view === "nearby" ? "nearby" : "landing"}
            initialService={initialService}
          />
        </div>
      </Container>
    </SceneBackdropFrame>
  );
}
