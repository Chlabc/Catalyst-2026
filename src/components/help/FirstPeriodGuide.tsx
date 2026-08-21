"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { HelpServiceType } from "@/lib/helpResources";

export function FirstPeriodGuide({
  onCramps,
  onNearby,
}: {
  onCramps: () => void;
  onNearby: (service: HelpServiceType) => void;
}) {
  const [feelingOkay, setFeelingOkay] = useState(false);

  return (
    <>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
        My period started — what do I do now?
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-relaxed text-text-muted">
        It can feel a little confusing the first time. Here are a few simple
        things you can do.
      </p>

      <div className="mt-8 grid gap-5">
        <GuideCard number="1" title="Manage the bleeding">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-primary-soft p-4">
              <h3 className="font-semibold text-foreground">Pad</h3>
              <p className="mt-1 text-sm text-text-muted">
                Easy to use and a good place to start.
              </p>
            </div>
            <div className="rounded-xl bg-secondary-soft p-4">
              <h3 className="font-semibold text-foreground">Period underwear</h3>
              <p className="mt-1 text-sm text-text-muted">
                Worn like normal underwear and designed to absorb period blood.
              </p>
            </div>
          </div>
          <p className="mt-3 rounded-xl border border-border bg-background p-3 text-xs leading-relaxed text-text-muted">
            If you do not have a period product right away, clean folded toilet
            paper can work temporarily until you can get one.
          </p>
          <div className="mt-4">
            <Button type="button" onClick={() => onNearby("pharmacy")}>
              Find period products near me
            </Button>
          </div>
        </GuideCard>

        <GuideCard number="2" title="How are you feeling?">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              aria-pressed={feelingOkay}
              onClick={() => setFeelingOkay(true)}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
                feelingOkay
                  ? "border-secondary bg-secondary-soft text-foreground"
                  : "border-border bg-background text-foreground hover:border-secondary"
              }`}
            >
              I feel okay
            </button>
            <button
              type="button"
              onClick={onCramps}
              className="rounded-xl border-2 border-border bg-background px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
            >
              I have cramps or pain →
            </button>
          </div>
          {feelingOkay && (
            <p role="status" className="mt-3 text-sm text-text-muted">
              That is okay. You can keep going with your day and check in with
              how you feel later.
            </p>
          )}
        </GuideCard>

        <GuideCard number="3" title="Start tracking">
          <p className="text-sm leading-relaxed text-text-muted">
            This is Day 1 of your period. Keeping track can help you learn what
            your own cycle is like over time.
          </p>
          <ul className="mt-3 grid gap-1 text-sm text-foreground sm:grid-cols-2">
            <li>• when bleeding starts</li>
            <li>• flow</li>
            <li>• pain</li>
            <li>• how you feel</li>
          </ul>
          <Link
            href="/tracker"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
          >
            Start tracking
          </Link>
        </GuideCard>

        <GuideCard number="4" title="Talk to someone">
          <p className="text-sm leading-relaxed text-text-muted">
            If you are unsure, you can ask a parent or guardian, another trusted
            adult, a school nurse, or a doctor for help.
          </p>
          <div className="mt-4">
            <Button type="button" variant="secondary" onClick={() => onNearby("gp")}>
              Find a GP near me
            </Button>
          </div>
        </GuideCard>

        <Card className="border-warning/50 bg-warning/10">
          <h2 className="text-lg font-semibold text-foreground">
            When should I get extra help?
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Tell a trusted adult or seek medical advice if pain feels very
            difficult to manage, bleeding seems unusually heavy, you feel faint
            or very unwell, or something is worrying you. This guide cannot
            diagnose what is happening.
          </p>
        </Card>
      </div>
    </>
  );
}

function GuideCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
          {number}
        </span>
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </Card>
  );
}
