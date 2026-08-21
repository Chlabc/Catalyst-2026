import { Container } from "@/components/ui/Container";
import { Greeting } from "@/components/Greeting";
import { WidgetCanvas } from "@/components/canvas/WidgetCanvas";

export default function Home() {
  return (
    <>
      <Container>
        <div className="py-8 sm:py-10">
          <div className="relative overflow-hidden rounded-[2rem] border-2 border-primary/20 bg-primary-soft px-6 py-8 sm:px-10 sm:py-10">
            <div className="relative z-10 max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-dark">
                Welcome to Menstrome Island
              </p>
              <div className="mt-3"><Greeting /></div>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-foreground/75 sm:text-xl">
                A friendly place to learn what&apos;s happening in your body,
                find your next step, and feel a little more ready.
              </p>
            </div>
            <div aria-hidden className="absolute -right-8 -top-12 h-48 w-48 rounded-full border-[24px] border-secondary/30" />
            <div aria-hidden className="absolute -bottom-20 right-28 h-36 w-36 rounded-full bg-accent/20" />
          </div>
        </div>
      </Container>

      <div className="px-4 pb-16 sm:px-8">
        <WidgetCanvas />
      </div>
    </>
  );
}
