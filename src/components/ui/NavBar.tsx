"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { DropletIcon } from "@/components/icons";

const links = [
  { href: "/scenarios", label: "Learn" },
  { href: "/library", label: "Library" },
  { href: "/tracker", label: "Tracker" },
];

export function NavBar() {
  const pathname = usePathname();

  function openHelp() {
    window.dispatchEvent(new Event("blossom:open-help"));
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-sm">
      <Container>
        <nav className="flex items-center justify-between gap-3 py-4">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
          >
            <DropletIcon className="h-5 w-5 text-primary" />
            Blossom
          </Link>
          <ul className="flex gap-4 overflow-x-auto text-sm sm:gap-8">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href} className="shrink-0">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`block border-b-2 py-1 font-medium transition-colors ${active
                        ? "border-primary text-foreground"
                        : "border-transparent text-text-muted hover:text-foreground"
                      }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="shrink-0">
              <button
                onClick={openHelp}
                className="block border-b-2 border-transparent py-1 font-medium text-primary transition-colors hover:border-primary hover:text-primary-dark"
              >
                Help
              </button>
            </li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}
