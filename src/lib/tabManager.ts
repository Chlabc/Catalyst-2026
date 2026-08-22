/** One tab per homepage widget. Library is not in this manager yet. */
export type WidgetTab = {
  id: "learning" | "tracking" | "help" | "faq" | "report";
  href: string;
  label: string;
};

export const WIDGET_TABS: WidgetTab[] = [
  { id: "learning", href: "/scenarios", label: "Learn" },
  { id: "tracking", href: "/tracker", label: "Tracker" },
  { id: "help", href: "/find-help", label: "Find Help" },
  { id: "faq", href: "/faq", label: "FAQ" },
  { id: "report", href: "/report", label: "Health report" },
];

export function isWidgetTabActive(pathname: string, tab: WidgetTab): boolean {
  return pathname === tab.href || pathname.startsWith(`${tab.href}/`);
}
