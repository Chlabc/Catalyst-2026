// Reusable "biome" progress visual — reuses the inherited blueprint's
// biome metaphor instead of inventing new visual language. Pass a count
// (quiz answers correct, tracker entries logged, etc.) and it renders a
// small growth stage. No images/assets — pure inline SVG so it stays
// theme-consistent and lightweight.

const STAGES = [
  { min: 0, label: "Seed" },
  { min: 3, label: "Sprout" },
  { min: 7, label: "Bloom" },
  { min: 12, label: "Thriving" },
] as const;

function stageFor(count: number) {
  return [...STAGES].reverse().find((s) => count >= s.min) ?? STAGES[0];
}

export function GrowthBadge({ count }: { count: number }) {
  const stage = stageFor(count);
  const height = Math.min(8 + count * 2, 32);

  return (
    <div className="flex items-center gap-3">
      <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="34" r="4" fill="var(--accent)" opacity="0.4" />
        <rect
          x="18"
          y={34 - height}
          width="4"
          height={height}
          rx="2"
          fill="var(--secondary)"
        />
        {count >= 3 && (
          <circle cx="20" cy={34 - height} r="6" fill="var(--secondary)" />
        )}
      </svg>
      <div>
        <p className="text-sm font-medium text-foreground">{stage.label}</p>
        <p className="text-xs text-text-muted">{count} logged</p>
      </div>
    </div>
  );
}
