import { HelpFlow } from "@/components/help/HelpFlow";
import { Container } from "@/components/ui/Container";
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
    <Container>
      <HelpFlow
        initialStep={view === "nearby" ? "nearby" : "landing"}
        initialService={initialService}
      />
    </Container>
  );
}
