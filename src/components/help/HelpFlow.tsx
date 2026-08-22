"use client";

import { useState } from "react";
import {
  DischargeInfo,
  HeavyBleedingQuestion,
  HeavyBleedingResult,
  LatePeriodQuestion,
  LatePeriodResult,
  TrustedAdultSupport,
  UnsureQuestion,
  UnusualQuestion,
  type HeavyBleedingChoice,
  type RecentPeriodsAnswer,
} from "@/components/help/BeginnerHelpPathways";
import { FirstPeriodGuide } from "@/components/help/FirstPeriodGuide";
import { HelpCategoryCard } from "@/components/help/HelpCategoryCard";
import { NearbySupport } from "@/components/help/NearbySupport";
import { SupportResourceCard } from "@/components/help/SupportResourceCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader, PAGE_BODY_CLASS } from "@/components/ui/PageHeader";
import {
  HELP_CATEGORIES,
  DIRECT_HELP_SERVICES,
  PAIN_LEVELS,
  type HelpServiceType,
  type PainLevel,
} from "@/lib/helpResources";

type FlowStep =
  | "landing"
  | "categories"
  | "first-period-guide"
  | "pain-level"
  | "pain-result"
  | "heavy-question"
  | "heavy-result"
  | "late-question"
  | "late-result"
  | "unusual-question"
  | "discharge-info"
  | "unsure-question"
  | "trusted-adult"
  | "nearby";

export function HelpFlow({
  initialStep,
  initialService,
}: {
  initialStep: "landing" | "nearby";
  initialService?: HelpServiceType;
}) {
  const [step, setStep] = useState<FlowStep>(initialStep);
  const [, setHistory] = useState<FlowStep[]>([]);
  const [painLevel, setPainLevel] = useState<PainLevel | null>(null);
  const [heavyChoice, setHeavyChoice] = useState<HeavyBleedingChoice | null>(null);
  const [recentPeriodsAnswer, setRecentPeriodsAnswer] = useState<RecentPeriodsAnswer | null>(null);
  const [nearbyService, setNearbyService] = useState<HelpServiceType | undefined>(initialService);
  const [nearbyReturnStep, setNearbyReturnStep] = useState<FlowStep>("landing");

  function navigate(nextStep: FlowStep) {
    setHistory((current) => [...current, step]);
    setStep(nextStep);
  }

  function openNearby(service?: HelpServiceType, returnStep: FlowStep = "landing") {
    setNearbyService(service);
    setNearbyReturnStep(returnStep);
    setStep("nearby");
  }

  function openCramps() {
    setPainLevel(null);
    navigate("pain-level");
  }

  if (step === "nearby") {
    return <NearbySupport initialService={nearbyService} onBack={() => setStep(nearbyReturnStep)} />;
  }

  function goBack() {
    setHistory((current) => {
      const previous = current.at(-1) ?? "landing";
      setStep(previous);
      return current.slice(0, -1);
    });
  }

  return (
    <div className="pb-12 pt-6">
      {step === "landing" && (
        <Landing onConcern={() => navigate("categories")} onService={(service) => openNearby(service)} />
      )}

      {step === "categories" && (
        <ChoiceStep
          title="What's happening with your period?"
          description="Choose the option that sounds closest. It is okay if you are not sure yet."
          onBack={goBack}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {HELP_CATEGORIES.map((category) => (
              <HelpCategoryCard
                key={category.id}
                title={category.title}
                description={category.description}
                onSelect={() => {
                  if (category.id === "period-started") {
                    navigate("first-period-guide");
                  } else if (category.id === "cramps-pain") {
                    openCramps();
                  } else if (category.id === "heavy-bleeding") {
                    navigate("heavy-question");
                  } else if (category.id === "late-irregular") {
                    navigate("late-question");
                  } else if (category.id === "unusual") {
                    navigate("unusual-question");
                  } else if (category.id === "worried-unsure") {
                    navigate("unsure-question");
                  }
                }}
              />
            ))}
          </div>
        </ChoiceStep>
      )}

      {step === "first-period-guide" && (
        <FirstPeriodGuide
          onCramps={openCramps}
          onNearby={(service) => openNearby(service, "first-period-guide")}
        />
      )}

      {step === "pain-level" && (
        <ChoiceStep
          title="How is the pain affecting you right now?"
          description="Choose the answer that best matches how you feel. This does not diagnose the cause."
          onBack={goBack}
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {PAIN_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => {
                  setPainLevel(level.label);
                  navigate("pain-result");
                }}
                className="rounded-2xl border-2 border-border bg-surface px-5 py-6 text-left text-lg font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
              >
                <span>{level.label}</span>
                <span className="mt-2 block text-sm font-normal leading-relaxed text-text-muted">
                  {level.description}
                </span>
              </button>
            ))}
          </div>
        </ChoiceStep>
      )}

      {step === "pain-result" && painLevel && (
        <PainResults painLevel={painLevel} onNearby={(service) => openNearby(service, "pain-result")} />
      )}

      {step === "heavy-question" && (
        <HeavyBleedingQuestion onSelect={(choice) => { setHeavyChoice(choice); navigate("heavy-result"); }} />
      )}

      {step === "heavy-result" && heavyChoice && (
        <HeavyBleedingResult choice={heavyChoice} onNearby={(service) => openNearby(service, "heavy-result")} />
      )}

      {step === "late-question" && (
        <LatePeriodQuestion onSelect={(answer) => { setRecentPeriodsAnswer(answer); navigate("late-result"); }} />
      )}

      {step === "late-result" && recentPeriodsAnswer && (
        <LatePeriodResult answer={recentPeriodsAnswer} onNearby={(service) => openNearby(service, "late-result")} />
      )}

      {step === "unusual-question" && (
        <UnusualQuestion
          onBleeding={() => navigate("heavy-question")}
          onTiming={() => navigate("late-question")}
          onPain={openCramps}
          onDischarge={() => navigate("discharge-info")}
          onSomethingElse={() => navigate("trusted-adult")}
        />
      )}

      {step === "discharge-info" && (
        <DischargeInfo onNearby={(service) => openNearby(service, "discharge-info")} />
      )}

      {step === "unsure-question" && (
        <UnsureQuestion
          onBleeding={() => navigate("heavy-question")}
          onPain={openCramps}
          onLate={() => navigate("late-question")}
          onTalk={() => navigate("trusted-adult")}
        />
      )}

      {step === "trusted-adult" && (
        <TrustedAdultSupport onNearby={(service) => openNearby(service, "trusted-adult")} />
      )}
    </div>
  );
}

function Landing({
  onConcern,
  onService,
}: {
  onConcern: () => void;
  onService: (service: HelpServiceType) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Find Help"
        title="How can we help today?"
        subtitle="Start with what is happening with your period, or go straight to a pharmacy or doctor if you already know what you need."
      />

      <Card className={`${PAGE_BODY_CLASS} border-primary/30 bg-primary-soft sm:p-8`}>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-dark">A good place to start</p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">I need help with something</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-muted">
          Choose what sounds closest to find a simple next step. Blossom will
          not try to diagnose you.
        </p>
        <div className="mt-5">
          <Button type="button" onClick={onConcern}>Tell us what is happening →</Button>
        </div>
      </Card>

      <Card className="mt-5">
        <h2 className="text-xl font-semibold text-foreground">I know what I need</h2>
        <p className="mt-2 text-sm text-text-muted">Go straight to nearby-support options for a healthcare service.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {DIRECT_HELP_SERVICES.map((service) => (
            <button
              key={service.id}
              type="button"
              onClick={() => onService(service.id)}
              className="rounded-xl border-2 border-border bg-background px-4 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:border-secondary hover:bg-secondary-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/25"
            >
              {service.label} →
            </button>
          ))}
        </div>
      </Card>
    </>
  );
}

function ChoiceStep({ title, description, children, onBack }: {
  title: string;
  description: string;
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow={
          onBack ? (
            <button type="button" onClick={onBack} className="hover:underline">
              ← Back
            </button>
          ) : (
            "Find Help"
          )
        }
        title={title}
        subtitle={description}
      />
      <div className={PAGE_BODY_CLASS}>{children}</div>
    </>
  );
}

function PainResults({
  painLevel,
  onNearby,
}: {
  painLevel: PainLevel;
  onNearby: (service: HelpServiceType) => void;
}) {
  return (
    <>
      <PageHeader
        eyebrow="Find Help"
        title={
          <>
            Your next steps
            <span className="ml-3 align-middle rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary-dark">
              {painLevel}
            </span>
          </>
        }
        subtitle="These are general options, not a diagnosis. Choose the support that feels right for you, and seek medical advice if you are worried."
      />

      <div className={`${PAGE_BODY_CLASS} grid gap-4 sm:grid-cols-2`}>
        <SupportResourceCard title="What you can do now">
          <p>
            Consider resting, using a comfortably warm heat pack, gentle movement, or relaxation if those feel helpful. A pharmacist or doctor can advise you about suitable pain relief, especially before starting a new medicine.
          </p>
        </SupportResourceCard>

        <SupportResourceCard
          title="Find a pharmacy nearby"
          actions={<Button type="button" onClick={() => onNearby("pharmacy")}>Find a pharmacy</Button>}
        >
          <p>A pharmacist may be able to help with heat packs, period products, and general advice about appropriate over-the-counter support.</p>
        </SupportResourceCard>

        <SupportResourceCard
          title="Find a GP nearby"
          tone="accent"
          actions={<Button type="button" variant="secondary" onClick={() => onNearby("gp")}>Find a GP</Button>}
        >
          <p>Consider speaking with a GP if the pain is severe, keeps returning, is getting worse, or stops you from school, work, sleep, or normal activities.</p>
        </SupportResourceCard>

        <SupportResourceCard title="Get urgent help if…" tone="warning">
          <p>
            Seek urgent medical help if the pain is severe or worsening, or if you have very heavy bleeding with dizziness, weakness, fainting, or feel that you may pass out. In an emergency in Australia, call 000.
          </p>
        </SupportResourceCard>
      </div>
    </>
  );
}
