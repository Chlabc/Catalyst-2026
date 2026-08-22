import Link from "next/link";

export function HomeBackButton({
  href = "/",
  label = "← Home",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      data-testid={href === "/" ? "home-back" : "island-back"}
      className="inline-flex rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:bg-white"
    >
      {label}
    </Link>
  );
}
