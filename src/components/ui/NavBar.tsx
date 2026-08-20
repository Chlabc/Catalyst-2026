import Link from "next/link";
import { Container } from "./Container";

const links = [
  { href: "/scenarios", label: "Learn" },
  { href: "/library", label: "Product Library" },
  { href: "/tracker", label: "Tracker" },
  { href: "/quiz", label: "Quiz" },
];

export function NavBar() {
  return (
    <header className="border-b border-border bg-surface">
      <Container>
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="text-lg font-semibold text-foreground">
            MenstraMission
          </Link>
          <ul className="flex gap-6 text-sm text-text-muted">
            {links.map((link) => (
              <li key={link.href}>
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
