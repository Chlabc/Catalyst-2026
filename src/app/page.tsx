import { Container } from "@/components/ui/Container";
import { Greeting } from "@/components/Greeting";
import { DraggableWidget } from "@/components/canvas/DraggableWidget";
import { FlowerWidget } from "@/components/canvas/FlowerWidget";
import { LearningWidget } from "@/components/canvas/LearningWidget";
import { TrackingWidget } from "@/components/canvas/TrackingWidget";
import { HelpWidget } from "@/components/canvas/HelpWidget";

export default function Home() {
  return (
    <Container>
      <div className="py-10">
        <Greeting />
        <p className="mt-4 max-w-md text-lg leading-relaxed text-text-muted">
          A calm corner for understanding your body, one small check-in at a
          time.
        </p>
      </div>

      <p className="mb-3 text-xs text-text-muted">
        Drag any widget by its ⠿⠿⠿ handle to rearrange — they can&apos;t be
        removed, only moved.
      </p>

      <div
        className="relative mb-16 overflow-auto rounded-3xl border border-dashed border-border bg-background/40"
        style={{ minWidth: 680, minHeight: 840 }}
      >
        <DraggableWidget id="learning" defaultX={24} defaultY={24}>
          <LearningWidget />
        </DraggableWidget>

        <DraggableWidget id="flower" defaultX={344} defaultY={24}>
          <FlowerWidget />
        </DraggableWidget>

        <DraggableWidget id="tracking" defaultX={24} defaultY={420}>
          <TrackingWidget />
        </DraggableWidget>

        <DraggableWidget id="help" defaultX={344} defaultY={420}>
          <HelpWidget />
        </DraggableWidget>
      </div>
    </Container>
  );
}
