"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { logIslandDayOne } from "@/lib/islandTracker";
import {
  libraryHref,
  type IslandTown,
  type LibrarySituationFilter,
  type MatchRound,
  type TownChoice,
} from "@/lib/scenarios";

const PHASES = ["scenario", "facts", "decision", "reward"] as const;
type Phase = (typeof PHASES)[number];

const PHASE_LABEL: Record<Phase, string> = {
  scenario: "Scenario",
  facts: "Key facts",
  decision: "Your move",
  reward: "Reward",
};

export function TownLesson({
  town,
  islandComplete,
  onComplete,
}: {
  town: IslandTown;
  islandComplete: boolean;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("scenario");
  const [choiceFeedback, setChoiceFeedback] = useState<string | null>(null);
  const [choiceCorrect, setChoiceCorrect] = useState(false);
  const [logState, setLogState] = useState<"idle" | "saving" | "done">("idle");
  const [logMessage, setLogMessage] = useState("");
  const [reflectFeedback, setReflectFeedback] = useState<string | null>(null);
  const [matchIndex, setMatchIndex] = useState(0);
  const [matchMessage, setMatchMessage] = useState<string | null>(null);
  const [matchOk, setMatchOk] = useState(false);
  const [lastMatchFilter, setLastMatchFilter] =
    useState<LibrarySituationFilter | null>(null);

  function go(next: Phase) {
    setPhase(next);
    if (next === "reward") onComplete();
  }

  function replay() {
    setPhase("scenario");
    setChoiceFeedback(null);
    setChoiceCorrect(false);
    setLogState("idle");
    setLogMessage("");
    setReflectFeedback(null);
    setMatchIndex(0);
    setMatchMessage(null);
    setMatchOk(false);
    setLastMatchFilter(null);
  }

  const phaseIndex = PHASES.indexOf(phase);

  return (
    <div
      className="rounded-3xl border border-white/50 bg-white/95 p-4 shadow-[0_12px_40px_rgba(40,24,36,0.18)] backdrop-blur-md sm:p-5"
      data-testid="town-lesson"
      data-town-id={town.id}
      data-phase={phase}
    >
      <ol className="mb-4 flex flex-wrap gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {PHASES.map((item, index) => (
          <li
            key={item}
            className={`rounded-full px-2.5 py-1 ${
              index === phaseIndex
                ? "bg-secondary text-white"
                : index < phaseIndex
                  ? "bg-secondary-soft text-secondary"
                  : "bg-background text-text-muted"
            }`}
          >
            {index + 1}. {PHASE_LABEL[item]}
          </li>
        ))}
      </ol>

      {phase === "scenario" && (
        <section data-testid="town-phase-scenario">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
            {town.theme}
          </p>
          <p className="mt-2 text-base leading-relaxed text-foreground sm:text-lg">
            {town.scenario}
          </p>
          <Button className="mt-4" onClick={() => go("facts")}>
            See the key facts
          </Button>
        </section>
      )}

      {phase === "facts" && (
        <section data-testid="town-phase-facts">
          <p className="text-sm font-semibold text-foreground">
            3–4 things worth knowing
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {town.facts.map((fact) => (
              <li
                key={fact}
                className="rounded-2xl border border-secondary/20 bg-secondary-soft/70 px-3.5 py-3 text-sm leading-relaxed text-foreground"
              >
                {fact}
              </li>
            ))}
          </ul>
          <Button className="mt-4" onClick={() => go("decision")}>
            Make a decision
          </Button>
        </section>
      )}

      {phase === "decision" && (
        <section data-testid="town-phase-decision">
          {town.decision.kind === "choice" && (
            <ChoiceDecision
              prompt={town.decision.prompt}
              choices={town.decision.choices}
              feedback={choiceFeedback}
              correct={choiceCorrect}
              onPick={(choice) => {
                setChoiceFeedback(choice.feedback);
                setChoiceCorrect(choice.correct);
              }}
              onContinue={() => go("reward")}
            />
          )}
          {town.decision.kind === "log-day-one" && (
            <LogDayOneDecision
              prompt={town.decision.prompt}
              buttonLabel={town.decision.buttonLabel}
              status={logState}
              message={logMessage}
              onLog={async () => {
                setLogState("saving");
                try {
                  const result = await logIslandDayOne();
                  const decision = town.decision;
                  setLogMessage(
                    decision.kind === "log-day-one"
                      ? result.alreadyLogged
                        ? decision.alreadyLoggedFeedback
                        : decision.feedback
                      : "",
                  );
                } catch {
                  setLogMessage(
                    "Saved on this device. Open Tracker to see day 1.",
                  );
                }
                setLogState("done");
              }}
              onContinue={() => go("reward")}
            />
          )}
          {town.decision.kind === "reflect" && (
            <ReflectDecision
              prompt={town.decision.prompt}
              options={town.decision.options}
              feedback={reflectFeedback}
              onPick={(feedback) => setReflectFeedback(feedback)}
              onContinue={() => go("reward")}
            />
          )}
          {town.decision.kind === "match-products" && (
            <MatchDecision
              prompt={town.decision.prompt}
              round={town.decision.rounds[matchIndex]}
              roundIndex={matchIndex}
              total={town.decision.rounds.length}
              message={matchMessage}
              ok={matchOk}
              onPick={(option, round) => {
                const hit = round.correct.includes(option);
                setMatchOk(hit);
                setMatchMessage(hit ? round.correctFeedback : round.incorrectFeedback);
                if (hit) setLastMatchFilter(round.libraryFilter);
              }}
              onNextRound={() => {
                setMatchIndex((index) => index + 1);
                setMatchMessage(null);
                setMatchOk(false);
              }}
              onContinue={() => go("reward")}
            />
          )}
        </section>
      )}

      {phase === "reward" && (
        <section data-testid="town-phase-reward" className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              Badge unlocked
            </p>
            <h3 className="mt-1 text-xl font-semibold text-foreground">
              {town.reward.badge}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground">
              {town.reward.body}
            </p>
          </div>

          {town.reward.checklist && (
            <div className="rounded-2xl border border-primary/25 bg-primary-soft/80 p-4">
              <p className="text-sm font-semibold text-foreground">
                {town.reward.checklist.title}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                {town.reward.checklist.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {town.decision.kind === "match-products" && lastMatchFilter && (
            <LibraryCta
              href={libraryHref(lastMatchFilter)}
              label={`Want the full breakdown? Open the Library — ${lastMatchFilter}`}
              testId="town-library-filter-link"
            />
          )}

          {town.libraryLink && (
            <LibraryCta
              href={libraryHref(town.libraryLink.filter)}
              label={town.libraryLink.label}
              testId="town-library-link"
            />
          )}

          {town.finale && islandComplete && (
            <div
              className="rounded-2xl border border-secondary/30 bg-secondary-soft p-4"
              data-testid="island-finale"
            >
              <p className="text-sm font-semibold text-foreground">
                You finished Menstrome Island
              </p>
              <p className="mt-1 text-sm leading-relaxed text-text-muted">
                You&apos;ve learned the basics. The Product Library has the
                full plain-language guide whenever you need it.
              </p>
              <LibraryCta
                href={libraryHref()}
                label="Browse the full Product Library"
                testId="town-library-capstone"
              />
            </div>
          )}

          <Button variant="secondary" onClick={replay}>
            Replay this town
          </Button>
        </section>
      )}
    </div>
  );
}

function LibraryCta({
  href,
  label,
  testId,
}: {
  href: string;
  label: string;
  testId: string;
}) {
  return (
    <Link
      href={href}
      data-testid={testId}
      className="inline-flex items-center rounded-full border-2 border-secondary/30 bg-secondary-soft px-4 py-2 text-sm font-semibold text-foreground transition hover:border-secondary"
    >
      {label} →
    </Link>
  );
}

function ChoiceDecision({
  prompt,
  choices,
  feedback,
  correct,
  onPick,
  onContinue,
}: {
  prompt: string;
  choices: TownChoice[];
  feedback: string | null;
  correct: boolean;
  onPick: (choice: TownChoice) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <p className="text-base leading-relaxed text-foreground sm:text-lg">{prompt}</p>
      <div className="mt-4 flex flex-col gap-2">
        {choices.map((choice) => (
          <button
            key={choice.label}
            type="button"
            data-testid="town-choice"
            data-correct={choice.correct ? "true" : "false"}
            onClick={() => onPick(choice)}
            className="rounded-2xl border-2 border-secondary/25 bg-secondary-soft/80 px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:border-secondary hover:bg-secondary-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            {choice.label}
          </button>
        ))}
      </div>
      {feedback && (
        <p
          role="status"
          className={`mt-4 rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
            correct
              ? "border border-secondary/30 bg-secondary-soft text-foreground"
              : "border border-warning/40 bg-warning/10 text-foreground"
          }`}
        >
          {feedback}
        </p>
      )}
      {correct && (
        <Button className="mt-4" onClick={onContinue}>
          Collect reward
        </Button>
      )}
    </div>
  );
}

function LogDayOneDecision({
  prompt,
  buttonLabel,
  status,
  message,
  onLog,
  onContinue,
}: {
  prompt: string;
  buttonLabel: string;
  status: "idle" | "saving" | "done";
  message: string;
  onLog: () => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <p className="text-base leading-relaxed text-foreground sm:text-lg">{prompt}</p>
      <div className="mt-4 rounded-2xl border border-primary/25 bg-primary-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Live tracker
        </p>
        <p className="mt-1 text-sm text-foreground">
          Today becomes day 1 of this cycle — same log the Tracker tab uses.
        </p>
        <Button
          className="mt-3"
          data-testid="town-log-day-one"
          disabled={status === "saving" || status === "done"}
          onClick={onLog}
        >
          {status === "saving" ? "Logging…" : buttonLabel}
        </Button>
      </div>
      {message && (
        <p role="status" className="mt-3 text-sm leading-relaxed text-foreground">
          {message}
        </p>
      )}
      {status === "done" && (
        <Button className="mt-4" onClick={onContinue}>
          Collect reward
        </Button>
      )}
    </div>
  );
}

function ReflectDecision({
  prompt,
  options,
  feedback,
  onPick,
  onContinue,
}: {
  prompt: string;
  options: { label: string; feedback: string }[];
  feedback: string | null;
  onPick: (feedback: string) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <p className="text-base leading-relaxed text-foreground sm:text-lg">{prompt}</p>
      <div className="mt-4 flex flex-col gap-2">
        {options.map((option) => (
          <button
            key={option.label}
            type="button"
            data-testid="town-reflect"
            onClick={() => onPick(option.feedback)}
            className="rounded-2xl border-2 border-secondary/25 bg-secondary-soft/80 px-4 py-3 text-left text-sm font-semibold text-foreground transition hover:border-secondary"
          >
            {option.label}
          </button>
        ))}
      </div>
      {feedback && (
        <>
          <p role="status" className="mt-4 text-sm leading-relaxed text-foreground">
            {feedback}
          </p>
          <Button className="mt-4" onClick={onContinue}>
            Collect reward
          </Button>
        </>
      )}
    </div>
  );
}

function MatchDecision({
  prompt,
  round,
  roundIndex,
  total,
  message,
  ok,
  onPick,
  onNextRound,
  onContinue,
}: {
  prompt: string;
  round: MatchRound;
  roundIndex: number;
  total: number;
  message: string | null;
  ok: boolean;
  onPick: (option: string, round: MatchRound) => void;
  onNextRound: () => void;
  onContinue: () => void;
}) {
  const lastRound = roundIndex >= total - 1;

  return (
    <div>
      <p className="text-base leading-relaxed text-foreground sm:text-lg">{prompt}</p>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-secondary">
        Round {roundIndex + 1} of {total}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{round.situation}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {round.options.map((option) => (
          <button
            key={option}
            type="button"
            data-testid="town-match-option"
            disabled={ok}
            onClick={() => onPick(option, round)}
            className="rounded-2xl border-2 border-secondary/25 bg-secondary-soft/80 px-3 py-3 text-sm font-semibold text-foreground transition hover:border-secondary disabled:opacity-70"
          >
            {option}
          </button>
        ))}
      </div>
      {message && (
        <p
          role="status"
          className={`mt-4 rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
            ok
              ? "border border-secondary/30 bg-secondary-soft"
              : "border border-warning/40 bg-warning/10"
          }`}
        >
          {message}
        </p>
      )}
      {ok && lastRound && (
        <Button className="mt-4" onClick={onContinue}>
          Collect reward
        </Button>
      )}
      {ok && !lastRound && (
        <Button className="mt-4" onClick={onNextRound}>
          Next situation
        </Button>
      )}
    </div>
  );
}
