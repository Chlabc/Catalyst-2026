import { Card } from "@/components/ui/Card";

const tones = {
  default: "",
  accent: "border-accent/30 bg-accent-soft",
  warning: "border-warning/50 bg-warning/10",
};

export function SupportResourceCard({ title, children, actions, tone = "default" }: {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <Card className={tones[tone]}>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-text-muted">{children}</div>
      {actions && <div className="mt-4">{actions}</div>}
    </Card>
  );
}
