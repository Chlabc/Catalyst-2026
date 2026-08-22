import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { SceneBackdropFrame } from "@/components/theme/SceneBackdropFrame";
import {
  PageHeader,
  PAGE_BODY_CLASS,
  PAGE_SECTION_CLASS,
} from "@/components/ui/PageHeader";
import { HomeBackButton } from "@/components/ui/HomeBackButton";
import { FaqList } from "@/components/faq/FaqList";

export default function FaqPage() {
  return (
    <SceneBackdropFrame testId="faq-scene-backdrop">
      <Container className={PAGE_SECTION_CLASS}>
        <HomeBackButton />
        <div className={PAGE_BODY_CLASS}>
          <PageHeader
            title="FAQ"
            subtitle="Pre-written answers, not a live chat. Your tracker stays on this device."
          />
          <div className={PAGE_BODY_CLASS}>
            <FaqList variant="page" />

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/tracker" className="block">
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <p className="font-semibold text-foreground">Log in Tracker</p>
                  <p className="mt-1 text-sm text-text-muted">
                    Tap a day, then add flow, symptoms, or mood. Private on this
                    device.
                  </p>
                </Card>
              </Link>
              <Link href="/find-help" className="block">
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <p className="font-semibold text-foreground">Find Help</p>
                  <p className="mt-1 text-sm text-text-muted">
                    If something feels wrong, start here — or go straight to
                    nearby support.
                  </p>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </SceneBackdropFrame>
  );
}
