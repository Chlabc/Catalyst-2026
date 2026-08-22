"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { DropletIcon } from "@/components/icons";
import { isNavLinkActive, NAV_LINKS } from "@/lib/navLinks";

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-surface/80 shadow-[0_5px_20px_-18px_rgba(61,46,58,0.5)] backdrop-blur-md">
      <Container>
        <nav className="flex items-center justify-between gap-3 py-4" data-testid="top-nav">
          <Link
            href="/"
            data-testid="blossom-wordmark"
            className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-foreground"
          >
            <DropletIcon className="h-5 w-5 text-primary" />
            Blossom
          </Link>
          <ul className="flex gap-4 overflow-x-auto text-sm sm:gap-8">
            {NAV_LINKS.map((link) => {
              const active = isNavLinkActive(pathname, link);
              return (
                <li key={link.href} className="shrink-0">
                  <Link
                    href={link.href}
                    data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                    aria-current={active ? "page" : undefined}
                    className={`block border-b-2 py-1 font-medium transition-colors ${
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-text-muted hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
