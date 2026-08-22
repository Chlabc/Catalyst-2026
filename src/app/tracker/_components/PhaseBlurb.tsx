"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CyclePrediction } from "../_types/tracker";
import { phaseDescriptions, phaseLabels } from "../_lib/cyclePredictions";

/** Inline phase education merged onto Today (replaces relying on tracker Learn tab). */
export function PhaseBlurb({
  prediction,
  forceOpen,
  onOpenChange,
}: {
  prediction: CyclePrediction;
  forceOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(Boolean(forceOpen));
  const phase = prediction.estimatedPhase;
  const label = phaseLabels[phase];

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  function setOpenBoth(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <section
      id="tracker-phase-blurb"
      className="mx-4 mt-3 rounded-2xl border border-[#E8DCE2] bg-white/80 p-4 shadow-sm sm:mx-0"
      data-testid="phase-blurb"
    >
      <button
        type="button"
        aria-expanded={open}
        data-testid="phase-blurb-toggle"
        onClick={() => setOpenBoth(!open)}
        className="flex w-full items-start justify-between gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E9547C]"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#A04464]">
            About this phase
          </p>
          <h2 className="mt-1 text-lg font-bold text-[#241B21]">{label}</h2>
          <p className="mt-1 text-xs text-[#6E6168]">
            Cycle day {prediction.currentCycleDay}
            {open ? "" : " · tap to read a short guide"}
          </p>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#E4D5DC] bg-white text-sm font-bold text-[#B83E68]">
          {open ? "–" : "?"}
        </span>
      </button>

      {open && (
        <div className="mt-3 border-t border-[#EFE5EA] pt-3">
          <p className="text-sm leading-relaxed text-[#655960]">
            {phaseDescriptions[phase]}
          </p>
          <Link
            href="/scenarios"
            className="mt-3 inline-flex text-sm font-bold text-[#C2426C] underline underline-offset-4"
          >
            Practise real moments on Menstrome Island →
          </Link>
        </div>
      )}
    </section>
  );
}
