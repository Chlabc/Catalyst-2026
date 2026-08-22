"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader, PAGE_BODY_CLASS } from "@/components/ui/PageHeader";
import type { HelpServiceType } from "@/lib/helpResources";

export type HeavyBleedingChoice =
  | "heavier-than-expected"
  | "changing-often"
  | "clots"
  | "dizzy"
  | "not-sure";

export type RecentPeriodsAnswer = "yes" | "no" | "not-sure";

const heavyBleedingOptions: { id: HeavyBleedingChoice; label: string }[] = [
  { id: "heavier-than-expected", label: "My period is heavier than I expected" },
  { id: "changing-often", label: "I'm needing to change my period product very often" },
  { id: "clots", label: "I'm passing clots and I'm worried" },
  { id: "dizzy", label: "I feel dizzy, weak or faint" },
  { id: "not-sure", label: "I'm not sure — it just seems like a lot" },
];

export function HeavyBleedingQuestion({ onSelect }: { onSelect: (choice: HeavyBleedingChoice) => void }) {
  return (
    <Question title="Let's work out what you're noticing" description="What are you noticing? Choose the answer that feels closest.">
      <OptionGrid>
        {heavyBleedingOptions.map((option) => (
          <OptionButton key={option.id} onClick={() => onSelect(option.id)}>{option.label}</OptionButton>
        ))}
      </OptionGrid>
    </Question>
  );
}

export function HeavyBleedingResult({
  choice,
  onNearby,
}: {
  choice: HeavyBleedingChoice;
  onNearby: (service: HelpServiceType) => void;
}) {
  const needsPromptHelp = choice === "dizzy";

  return (
    <ResultIntro title="What you can do next" description="This guide cannot tell why you are bleeding. These simple steps can help you decide what to do next.">
      {needsPromptHelp && (
        <Card className="border-warning/60 bg-warning/10 sm:col-span-2">
          <h2 className="text-xl font-semibold text-foreground">Please tell an adult now</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Feeling dizzy, weak, faint, or very unwell with bleeding is a reason to seek medical advice promptly. If you feel you may faint or need immediate help, get urgent help. In an emergency in Australia, call 000.
          </p>
        </Card>
      )}
      <Card>
        <h2 className="text-xl font-semibold text-foreground">Keep track of what you notice</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Note when the bleeding started, how often you change period products, anything else you notice, and how you feel. You do not need to decide whether it is medically “heavy”.
        </p>
        <TrackerLink />
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-foreground">Tell someone you trust</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Consider telling a parent, guardian, or another trusted adult. A healthcare professional can give advice if the bleeding worries you or affects your day.
        </p>
        <div className="mt-4"><Button type="button" variant="secondary" onClick={() => onNearby("gp")}>Find a GP near me</Button></div>
      </Card>
      {!needsPromptHelp && (
        <Card className="border-warning/50 bg-warning/10 sm:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">Get extra help if you feel unwell</h2>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Tell a trusted adult and seek medical advice if you feel dizzy, weak, faint, very unwell, or are worried about the bleeding.
          </p>
        </Card>
      )}
    </ResultIntro>
  );
}

export function LatePeriodQuestion({ onSelect }: { onSelect: (answer: RecentPeriodsAnswer) => void }) {
  return (
    <Question
      title="Periods can take time to find a pattern"
      description="When periods first begin, they may not arrive on a predictable schedule. Have your periods only started recently?"
    >
      <OptionGrid columns="three">
        <OptionButton onClick={() => onSelect("yes")}>Yes</OptionButton>
        <OptionButton onClick={() => onSelect("no")}>No</OptionButton>
        <OptionButton onClick={() => onSelect("not-sure")}>I&apos;m not sure</OptionButton>
      </OptionGrid>
    </Question>
  );
}

export function LatePeriodResult({ answer, onNearby }: { answer: RecentPeriodsAnswer; onNearby: (service: HelpServiceType) => void }) {
  const copy = answer === "yes"
    ? "It can take time for a pattern to develop when periods are new. Tracking can help you learn what your own cycle looks like over time."
    : answer === "no"
      ? "Period timing can change for different reasons, and this guide cannot tell you why. Keeping a record can help, and you can talk to a trusted adult or healthcare professional if you are worried."
      : "That's okay — you do not need to know. You can start a simple record now and ask a trusted adult or healthcare professional if the timing worries you.";

  return (
    <ResultIntro title="What you can do next" description={copy}>
      <Card>
        <h2 className="text-xl font-semibold text-foreground">Learn your pattern</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">Record when each period starts and anything else you notice. Your own pattern matters more than guessing an exact schedule.</p>
        <TrackerLink />
      </Card>
      <Card>
        <h2 className="text-xl font-semibold text-foreground">Ask if you are worried</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">A parent, guardian, trusted adult, school nurse, or doctor can help you talk through your questions.</p>
        <div className="mt-4"><Button type="button" variant="secondary" onClick={() => onNearby("gp")}>Find a GP near me</Button></div>
      </Card>
    </ResultIntro>
  );
}

export function UnusualQuestion({
  onBleeding,
  onTiming,
  onPain,
  onDischarge,
  onSomethingElse,
}: {
  onBleeding: () => void;
  onTiming: () => void;
  onPain: () => void;
  onDischarge: () => void;
  onSomethingElse: () => void;
}) {
  return (
    <Question title="What feels different?" description="Choose the closest option. You do not need to know the medical words.">
      <OptionGrid>
        <OptionButton onClick={onBleeding}>The amount of bleeding</OptionButton>
        <OptionButton onClick={onTiming}>When my period arrived</OptionButton>
        <OptionButton onClick={onPain}>Pain or discomfort</OptionButton>
        <OptionButton onClick={onDischarge}>Discharge or smell</OptionButton>
        <OptionButton onClick={onSomethingElse}>Something else</OptionButton>
      </OptionGrid>
    </Question>
  );
}

export function DischargeInfo({ onNearby }: { onNearby: (service: HelpServiceType) => void }) {
  return (
    <ResultIntro title="Bodies can change during puberty" description="Changes can be hard to describe, and this guide cannot diagnose what is happening.">
      <Card className="sm:col-span-2">
        <h2 className="text-xl font-semibold text-foreground">It is okay to ask</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          If discharge seems very different, feels uncomfortable, has a strong or unusual smell, or simply worries you, consider talking to a parent, guardian, trusted adult, school nurse, or healthcare professional.
        </p>
        <div className="mt-4"><Button type="button" variant="secondary" onClick={() => onNearby("gp")}>Find a GP near me</Button></div>
      </Card>
    </ResultIntro>
  );
}

export function UnsureQuestion({ onBleeding, onPain, onLate, onTalk }: { onBleeding: () => void; onPain: () => void; onLate: () => void; onTalk: () => void }) {
  return (
    <Question title="Not sure where to start?" description="You do not need to know the right words. Pick what sounds closest, or choose to talk to someone.">
      <OptionGrid>
        <OptionButton onClick={onBleeding}>Something about the bleeding worries me</OptionButton>
        <OptionButton onClick={onPain}>Something hurts</OptionButton>
        <OptionButton onClick={onLate}>My period didn&apos;t come when I expected</OptionButton>
        <Link className={optionClassName} href="/scenarios">I want to understand periods better →</Link>
        <OptionButton onClick={onTalk}>I want to talk to someone</OptionButton>
      </OptionGrid>
    </Question>
  );
}

export function TrustedAdultSupport({ onNearby }: { onNearby: (service: HelpServiceType) => void }) {
  return (
    <ResultIntro title="You don't have to work it out alone" description="It is okay to ask for help even when you cannot explain exactly what feels wrong.">
      <Card className="sm:col-span-2">
        <h2 className="text-xl font-semibold text-foreground">Choose someone you feel safe with</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          You could talk to a parent or guardian, another trusted adult, a school nurse, or a doctor. Try starting with: “Something about my period is worrying me and I want some help.”
        </p>
        <div className="mt-4"><Button type="button" variant="secondary" onClick={() => onNearby("gp")}>Find a GP near me</Button></div>
      </Card>
    </ResultIntro>
  );
}

function Question({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Find Help" title={title} subtitle={description} />
      <div className={PAGE_BODY_CLASS}>{children}</div>
    </>
  );
}

function ResultIntro({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <>
      <PageHeader eyebrow="Find Help" title={title} subtitle={description} />
      <div className={`${PAGE_BODY_CLASS} grid gap-4 sm:grid-cols-2`}>{children}</div>
    </>
  );
}

function OptionGrid({ children, columns = "two" }: { children: React.ReactNode; columns?: "two" | "three" }) {
  return <div className={`grid gap-3 ${columns === "three" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>{children}</div>;
}

const optionClassName = "rounded-2xl border-2 border-border bg-surface px-5 py-5 text-left text-base font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25";

function OptionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={optionClassName}>{children}</button>;
}

function TrackerLink() {
  return <Link href="/tracker" className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25">Start tracking</Link>;
}
