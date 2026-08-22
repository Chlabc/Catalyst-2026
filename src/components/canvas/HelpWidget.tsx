import Link from "next/link";
import { HelpIcon } from "@/components/icons";

export function HelpWidget() {
  return (
    <div className="rounded-b-2xl border-2 border-t-0 border-accent/30 bg-white/90 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpIcon className="h-6 w-6 text-accent" />
          <p className="text-base font-semibold text-foreground">Find help</p>
        </div>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">
        Start with what is happening, or go straight to nearby support.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Link
          href="/find-help"
          className="rounded-xl bg-accent px-4 py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          I have a health concern
        </Link>
        <Link
          href="/find-help?view=nearby"
          className="rounded-xl border-2 border-accent/30 bg-white/60 px-4 py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:border-accent hover:bg-white"
        >
          Find support near me
        </Link>
      </div>
    </div>
  );
}
