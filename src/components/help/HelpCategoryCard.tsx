import { Card } from "@/components/ui/Card";

export function HelpCategoryCard({ title, description, onSelect }: {
  title: string;
  description?: string;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25">
      <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            {description && <p className="mt-2 text-sm leading-relaxed text-text-muted">{description}</p>}
          </div>
          <span aria-hidden className="shrink-0 text-lg text-primary">→</span>
        </div>
      </Card>
    </button>
  );
}
