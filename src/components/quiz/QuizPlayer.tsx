"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { GrowthBadge } from "@/components/GrowthBadge";
import { quizQuestions } from "@/lib/quiz";

export function QuizPlayer() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = quizQuestions[index];

  function selectAnswer(optionIndex: number) {
    if (selected !== null) return; // already answered this question
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  }

  function next() {
    if (index + 1 < quizQuestions.length) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <Card>
        <h3 className="font-semibold text-foreground">
          {correctCount} / {quizQuestions.length} correct
        </h3>
        <div className="mt-4">
          <GrowthBadge count={correctCount} />
        </div>
        <Button variant="secondary" className="mt-4" onClick={restart}>
          Try again
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-xs text-text-muted">
        Question {index + 1} of {quizQuestions.length}
      </p>
      <h3 className="mt-1 font-semibold text-foreground">
        {question.question}
      </h3>

      <div className="mt-4 flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selected;
          const showResult = selected !== null;

          return (
            <button
              key={option}
              onClick={() => selectAnswer(i)}
              disabled={showResult}
              className={`rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                showResult && isCorrect
                  ? "border-secondary bg-secondary/10 text-foreground"
                  : showResult && isSelected
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border text-foreground hover:bg-background"
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="mt-4 flex flex-col gap-3">
          <p className="text-sm text-text-muted">{question.explanation}</p>
          <Button className="self-start" onClick={next}>
            {index + 1 < quizQuestions.length ? "Next" : "See results"}
          </Button>
        </div>
      )}
    </Card>
  );
}
