import type { ReactNode } from "react";

/** Shared page title block so tab headings sit on the same rhythm. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="min-h-5 text-xs font-medium leading-5 text-secondary">
          {eyebrow ?? <span className="invisible" aria-hidden>·</span>}
        </div>
        <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-foreground">
          {title}
        </h1>
        <div className="mt-2 min-h-6 text-base leading-6 text-text-muted">
          {subtitle}
        </div>
      </div>
      {actions ? <div className="shrink-0 pt-6">{actions}</div> : null}
    </header>
  );
}

export const PAGE_SECTION_CLASS = "pt-10 pb-12 sm:pt-12";
export const PAGE_BODY_CLASS = "mt-6";
