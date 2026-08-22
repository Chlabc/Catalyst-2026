import Link from "next/link";

export function HomeBackButton() {
  return (
    <Link
      href="/"
      data-testid="home-back"
      className="inline-flex rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:bg-white"
    >
      ← Home
    </Link>
  );
}
