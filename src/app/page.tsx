import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Greeting } from "@/components/Greeting";
import { Tracker } from "@/components/tracker/Tracker";
import { BookIcon, DropletIcon, CalendarIcon, QuizIcon } from "@/components/icons";

const features = [
  {
    href: "/scenarios",
    title: "Menstrome Island",
    description:
      "Interactive scenarios that walk you through what to expect, at your own pace.",
    Icon: BookIcon,
  },
  {
    href: "/library",
    title: "Product Library",
    description: "Pads, cups, tampons, discs — explained plainly, no jargon.",
    Icon: DropletIcon,
  },
  {
    href: "/tracker",
    title: "Tracker",
    description: "A simple, private calendar. No account needed.",
    Icon: CalendarIcon,
  },
  {
    href: "/quiz",
    title: "Quiz",
    description: "Bust the myths you've probably already heard.",
    Icon: QuizIcon,
  },
];

export default function Home() {
  return (
    <Container>
      <section className="grid grid-cols-1 gap-8 py-10 lg:grid-cols-[0.9fr_1.3fr] lg:items-start lg:py-14">
        <div className="pt-3">
          <Greeting />
          <p className="mt-4 max-w-md text-lg leading-relaxed text-text-muted">
            A calm corner for understanding your body, one small check-in at a time.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/scenarios"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Explore Menstrome Island →
            </Link>
            <Link href="/library" className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground hover:border-primary">
              Browse the library
            </Link>
          </div>
          <div className="mt-10 border-l-2 border-secondary pl-4 text-sm leading-relaxed text-text-muted">
            Private by design. Blossom keeps your check-ins on your device and is a learning guide, not a replacement for sex education or medical care.
          </div>
        </div>

        <Tracker compact />
      </section>

      <section className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full transition-all hover:-translate-y-0.5 hover:shadow-md">
              <feature.Icon className="h-6 w-6 text-secondary" />
              <h2 className="mt-3 font-semibold text-foreground">
                {feature.title}
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                {feature.description}
              </p>
            </Card>
          </Link>
        ))}
      </section>
    </Container>
  );
}
