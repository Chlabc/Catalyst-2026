import Link from "next/link";
import { Container } from "./Container";

const links = [
  { href: "/scenarios", label: "Learn" },
  { href: "/library", label: "Library" },
  { href: "/tracker", label: "Tracker" },
];

export function NavBar() {
  return (
    <header className="border-b border-border bg-surface">
      <Container>
        <nav className="flex items-center justify-between gap-3 py-4">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold text-foreground"
          >
            Blossom
          </Link>
          <ul className="flex gap-3 overflow-x-auto text-xs text-text-muted sm:gap-6 sm:text-sm">
            {links.map((link) => (
              <li key={link.href} className="shrink-0">
                <Link href={link.href} className="hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
