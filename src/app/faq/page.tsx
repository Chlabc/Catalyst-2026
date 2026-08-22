import { Container } from "@/components/ui/Container";
import { SceneBackdropFrame } from "@/components/theme/SceneBackdropFrame";
import { PageHeader, PAGE_BODY_CLASS, PAGE_SECTION_CLASS } from "@/components/ui/PageHeader";
import { FaqWidget } from "@/components/canvas/FaqWidget";

export default function FaqPage() {
  return (
    <SceneBackdropFrame testId="faq-scene-backdrop">
      <Container className={PAGE_SECTION_CLASS}>
          <PageHeader
            title="FAQ"
            subtitle="Pre-written answers, not a live chat. Your tracker stays on this device."
          />
          <div className={`${PAGE_BODY_CLASS} mx-auto max-w-lg`}>
            <div className="overflow-hidden rounded-2xl border-2 border-border bg-white/50">
              <div className="border-b-2 border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                FAQ
              </div>
              <FaqWidget />
            </div>
          </div>
      </Container>
    </SceneBackdropFrame>
  );
}
