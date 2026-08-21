import { Container } from "@/components/ui/Container";
import { Greeting } from "@/components/Greeting";
import { WidgetCanvas } from "@/components/canvas/WidgetCanvas";

export default function Home() {
  return (
    <>
      <Container>
        <div className="py-10">
          <Greeting />
          <p className="mt-4 max-w-md text-lg leading-relaxed text-text-muted">
            A calm corner for understanding your body, one small check-in at
            a time.
          </p>
        </div>
      </Container>

      <div className="px-4 pb-16 sm:px-8">
        <p className="mb-3 text-xs text-text-muted">
          Drag any widget by its ⠿⠿⠿ handle to rearrange. The flower and
          Menstrome Island stay put — everything else you can hide and bring
          back.
        </p>
        <WidgetCanvas />
      </div>
    </>
  );
}
