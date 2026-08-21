import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Greeting } from "@/components/Greeting";
import { TrackerSummaryCard } from "@/components/TrackerSummaryCard";
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
      <section className="grid grid-cols-1 gap-6 py-12 lg:grid-cols-[3fr_2fr] lg:items-center">
        <div>
          <Greeting />
          <p className="mt-4 max-w-md text-text-muted">
            Blossom is a straightforward, judgment-free guide to
            menstruation — built for curious pre-teens, and anyone else who
            wants clear answers.
          </p>
          <div className="mt-6">
            <Link
              href="/scenarios"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Start here
            </Link>
          </div>
        </div>

        <TrackerSummaryCard />
      </section>

      <section className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2">
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
