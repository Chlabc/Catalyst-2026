import { Container } from "@/components/ui/Container";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";

// Questions live in src/lib/quiz.ts — replace the placeholder myths there
// with real ones from your team's interview/questionnaire data.

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
        <div className="mt-6">
          <QuizPlayer />
        </div>
      </div>
    </Container>
  );
}
