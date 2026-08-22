"use client";

import Link from "next/link";
import { HelpIcon } from "@/components/icons";

export function SOSWidget() {
    return (
        <div className="rounded-b-2xl border-2 border-t-0 border-primary/30 bg-primary-soft p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                            <HelpIcon className="h-4 w-4" />
                        </span>
                        <p className="text-base font-semibold text-foreground">SOS &amp; support</p>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted">
                        A teammate drop-in space for urgent support, nearby care, and the
                        tools that help you ask for what you need.
                    </p>
                </div>
                <span className="shrink-0 rounded-full bg-white/70 px-2.5 py-1 text-xs font-semibold text-primary-dark">
                    team slot
                </span>
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-primary/40 bg-white/50 p-4">
                <p className="text-sm font-semibold text-foreground">Care hub coming here</p>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                    This is where the SOS content can plug in: helplines, pharmacy and GP
                    links, gentle movement, and a printable period summary.
                </p>
            </div>
            <Link
                href="/sos"
                className="mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
                Open SOS space →
            </Link>
        </div>
    );
}
