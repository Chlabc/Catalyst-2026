"use client";

import { useState } from "react";
import type { CyclePrediction } from "../_types/tracker";
import { phaseDescriptions, phaseLabels } from "../_lib/cyclePredictions";
import { formatShortDate } from "../_lib/dateUtils";

export function PhaseCard({
  prediction,
  compact = false,
  onBack,
  onSearch,
  onNotifications,
}: {
  prediction: CyclePrediction;
  compact?: boolean;
  onBack?: () => void;
  onSearch?: () => void;
  onNotifications?: () => void;
}) {
  const phaseLabel = phaseLabels[prediction.estimatedPhase];

  return (
    <section
      className={`mx-auto w-full ${
        compact ? "" : "min-h-[calc(100vh-72px)] max-w-2xl px-5 pb-10 pt-1"
      }`}
    >
      {!compact && (
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="grid h-9 w-9 place-items-center rounded-full border border-[#DED1D8] bg-white text-xl text-[#50434A] transition hover:border-[#D47EA0] focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
            aria-label="Back to today"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="h-10 flex-1 rounded-full bg-[#EEE9EC] px-5 text-left text-sm text-[#766B71] transition hover:bg-[#E7E0E4] focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
          >
            ⌕&nbsp;&nbsp;Search tracker
          </button>
          <button
            type="button"
            onClick={onNotifications}
            className="grid h-9 w-9 place-items-center rounded-full text-xl text-[#4B3C44] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#D47EA0]"
            aria-label="Open reminders"
          >
            ♡
          </button>
        </div>
      )}

      <div className={compact ? "px-1" : "pt-4"}>
        <p className="text-xs font-bold uppercase text-[#A04464]">Cycle guide</p>
        <h1 className={`mt-1 font-bold text-[#241B21] ${compact ? "text-2xl" : "text-3xl"}`}>
          {phaseLabel} phase
        </h1>
        <p className="mt-4 text-sm leading-6 text-[#655960]">
          {phaseDescriptions[prediction.estimatedPhase]}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#E8DCE2] py-4">
          <div>
            <p className="text-[10px] font-bold uppercase text-[#9A8C94]">Current timing</p>
            <p className="mt-1 text-sm font-bold text-[#342830]">
              Cycle day {prediction.currentCycleDay}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-[#9A8C94]">Next period</p>
            <p className="mt-1 text-sm font-bold text-[#342830]">
              {formatShortDate(prediction.predictedNextPeriod)}
            </p>
          </div>
        </div>
      </div>

      <div className={`grid gap-2.5 ${compact ? "mt-5" : "mt-7"}`}>
        <LearnCard
          title={`How can I support my ${phaseLabel.toLowerCase()} phase?`}
          body="Keep care flexible: hydration, regular meals, rest, and movement that feels comfortable. Your own logs are more useful than forcing a universal routine."
          defaultOpen
        />
        <LearnCard
          title="What changes might I notice?"
          body="Energy, sleep, mood, skin, discharge, and pain can shift through a cycle. Some people notice clear patterns and others notice very little."
        />
        <LearnCard
          title="How reliable is this phase estimate?"
          body="It is an estimate based on saved period dates and your average cycle length. Stress, illness, travel, medication, and normal variation can change timing."
        />
        {!compact && (
          <LearnCard
            title="When should I seek extra support?"
            body="Consider speaking with a qualified health professional about severe pain, very heavy bleeding, fainting, sudden changes, or anything that feels concerning to you."
          />
        )}
      </div>

      <p className="mt-5 text-xs leading-5 text-[#897C83]">
        Estimated ovulation: {formatShortDate(prediction.estimatedOvulation)}.
        This is cycle awareness, not contraception or medical advice.
      </p>
    </section>
  );
}

function LearnCard({
  title,
  body,
  defaultOpen = false,
}: {
  title: string;
  body: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#DED2D8] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="grid w-full grid-cols-[1fr_auto] items-center gap-4 px-4 py-3.5 text-left transition hover:bg-[#FFF6F9] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#D47EA0]"
        aria-expanded={open}
      >
        <span className="text-sm font-bold leading-5 text-[#33272E]">{title}</span>
        <span
          className={`grid h-7 w-7 place-items-center rounded-full bg-[#F3EAF0] text-lg text-[#A54165] transition ${
            open ? "rotate-90" : ""
          }`}
        >
          ›
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="border-t border-[#EFE5EA] bg-[#FFFAFC] px-4 py-3 text-xs leading-5 text-[#6D6067]">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}
