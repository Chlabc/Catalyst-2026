import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

const features = [
  {
    href: "/scenarios",
    title: "Learn",
    description:
      "Interactive scenarios that walk you through what to expect, at your own pace.",
  },
  {
    href: "/library",
    title: "Product Library",
    description: "Pads, cups, tampons, discs — explained plainly, no jargon.",
  },
  {
    href: "/tracker",
    title: "Tracker",
    description: "A simple, private calendar. No account needed.",
  },
  {
    href: "/quiz",
    title: "Quiz",
    description: "Bust the myths you've probably already heard.",
  },
];

export default function Home() {
  return (
    <Container>
      <section className="py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          A safe first stop for questions about your body.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-text-muted">
          MenstraMission is a straightforward, judgment-free guide to
          menstruation — built for curious pre-teens, and anyone else who
          wants clear answers.
        </p>
        <div className="mt-8">
          <Link
            href="/scenarios"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90"
          >
            Start here
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <h2 className="font-semibold text-foreground">
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
