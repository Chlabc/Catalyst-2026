"use client";

import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

// Owner: Person C
// Myth-busting quiz — base questions on real myths surfaced in the
// Product-thon team's interview/questionnaire data, not invented trivia.

export default function QuizPage() {
  return (
    <Container>
      <div className="py-12">
        <h1 className="text-2xl font-semibold text-foreground">
          Myth-Buster Quiz
        </h1>
        <p className="mt-2 text-text-muted">
          Test what you know — and unlearn a few myths.
        </p>
        <Card className="mt-6">
          <p className="text-sm text-text-muted">Quiz questions go here.</p>
        </Card>
      </div>
    </Container>
  );
}
