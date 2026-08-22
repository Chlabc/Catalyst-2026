"use client";

import Link from "next/link";
import { FaqList } from "@/components/faq/FaqList";

export function FaqWidget({ showOpenLink = false }: { showOpenLink?: boolean }) {
  return (
    <div
      className="rounded-b-2xl border-2 border-t-0 border-border bg-white/90 p-5 backdrop-blur-sm"
      data-testid="faq-widget"
    >
      <p className="text-base font-semibold text-foreground">FAQ</p>
      <p className="mt-1 text-xs text-text-muted">
        Pre-written answers, not a live chat.
      </p>

      <FaqList />

      {showOpenLink && (
        <Link
          href="/faq"
          className="mt-4 block text-center text-sm font-semibold text-primary hover:underline"
        >
          Open FAQ tab →
        </Link>
      )}
    </div>
  );
}
