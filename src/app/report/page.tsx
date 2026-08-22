import { Container } from "@/components/ui/Container";
import { SceneBackdropFrame } from "@/components/theme/SceneBackdropFrame";
import { PageHeader, PAGE_BODY_CLASS, PAGE_SECTION_CLASS } from "@/components/ui/PageHeader";
import { HomeBackButton } from "@/components/ui/HomeBackButton";
import { ReportDashboard } from "@/components/report/ReportDashboard";

export default function ReportPage() {
  return (
    <SceneBackdropFrame testId="report-scene-backdrop">
      <Container className={PAGE_SECTION_CLASS}>
        <HomeBackButton />
        <div className={PAGE_BODY_CLASS}>
          <PageHeader
            title="Health report"
            subtitle="A closer look at your check-ins for a GP or pharmacist. Built on this device only."
          />
          <div className={PAGE_BODY_CLASS}>
            <ReportDashboard />
          </div>
        </div>
      </Container>
    </SceneBackdropFrame>
  );
}
