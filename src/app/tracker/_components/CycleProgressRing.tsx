import type { CyclePhase } from "../_types/tracker";
import { phaseLabels, phasePalette } from "../_lib/cyclePredictions";

const phases: CyclePhase[] = ["menstrual", "follicular", "ovulatory", "luteal"];

export function CycleProgressRing({
  currentCycleDay,
  cycleLength,
  phase,
}: {
  currentCycleDay: number;
  cycleLength: number;
  phase: CyclePhase;
}) {
  const progress = Math.min(100, Math.max(0, (currentCycleDay / cycleLength) * 100));
  const circumference = 2 * Math.PI * 86;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="relative mx-auto flex aspect-square w-[min(78vw,340px)] items-center justify-center"
      role="img"
      aria-label={`${phaseLabels[phase]} phase, cycle day ${currentCycleDay} of ${cycleLength}`}
    >
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox="0 0 220 220"
        aria-hidden="true"
      >
        <circle
          cx="110"
          cy="110"
          r="86"
          fill="none"
          stroke="#F3E7ED"
          strokeWidth="15"
        />
        <circle
          cx="110"
          cy="110"
          r="86"
          fill="none"
          stroke="url(#phaseGradient)"
          strokeLinecap="round"
          strokeWidth="15"
          opacity="0.42"
        />
        <circle
          cx="110"
          cy="110"
          r="86"
          fill="none"
          stroke={phasePalette[phase].ring}
          strokeLinecap="round"
          strokeWidth="15"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="phaseGradient" x1="25%" y1="15%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#FF6B9D" />
            <stop offset="38%" stopColor="#FFB64D" />
            <stop offset="68%" stopColor="#7FD7C7" />
            <stop offset="100%" stopColor="#9F8BFF" />
          </linearGradient>
        </defs>
      </svg>

      {phases.map((cyclePhase, index) => {
        const angle = index * 90 - 90;
        const radius = 46;
        const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
        const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
        const isActive = cyclePhase === phase;

        return (
          <div
            key={cyclePhase}
            className={`absolute h-4 w-4 rounded-full border-2 transition-all duration-300 ${
              isActive
                ? "scale-125 border-white shadow-[0_6px_18px_rgba(210,71,113,0.32)]"
                : "border-white opacity-70"
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              backgroundColor: phasePalette[cyclePhase].ring,
              transform: "translate(-50%, -50%)",
            }}
            title={phaseLabels[cyclePhase]}
          />
        );
      })}

      <div className="relative z-10 flex h-[61%] w-[61%] flex-col items-center justify-center rounded-full bg-white text-center shadow-[0_18px_45px_rgba(112,63,86,0.14)] ring-1 ring-[#ECDDE4]">
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${phasePalette[phase].bg} ${phasePalette[phase].text}`}>
          {phaseLabels[phase]}
        </span>
        <strong className="mt-3 text-6xl font-bold leading-none text-[#241B21] sm:text-7xl">
          {currentCycleDay}
        </strong>
        <span className="mt-2 text-xs font-semibold text-[#756A70]">
          cycle day of {cycleLength}
        </span>
      </div>
    </div>
  );
}
