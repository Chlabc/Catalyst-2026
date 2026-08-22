export const HIDDEN_WIDGETS_KEY = "blossom_hidden_widgets";

export const REQUIRED_WIDGETS = [{ id: "learning", label: "Learning" }] as const;

export const OPTIONAL_WIDGETS = [
  { id: "tracking", label: "Tracking" },
  { id: "help", label: "Find Help" },
  { id: "faq", label: "FAQ" },
] as const;

const REQUIRED_IDS = new Set<string>(REQUIRED_WIDGETS.map((w) => w.id));
const OPTIONAL_IDS = new Set<string>(OPTIONAL_WIDGETS.map((w) => w.id));

/** Drop required ids (Learning) and unknown keys from persisted hidden list. */
export function sanitizeHiddenWidgets(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const unique = new Set<string>();
  for (const value of raw) {
    if (typeof value !== "string") continue;
    if (REQUIRED_IDS.has(value)) continue;
    if (!OPTIONAL_IDS.has(value)) continue;
    unique.add(value);
  }
  return [...unique];
}

export function isRequiredWidget(id: string): boolean {
  return REQUIRED_IDS.has(id);
}
