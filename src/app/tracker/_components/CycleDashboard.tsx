import type {
  CyclePhase,
  CyclePrediction,
  DailyLog,
  TrackerSettings,
} from "../_types/tracker";
import { phaseLabels } from "../_lib/cyclePredictions";
import { formatLongDate, formatShortDate } from "../_lib/dateUtils";
import { CycleProgressRing } from "./CycleProgressRing";

const phases: { phase: CyclePhase; shortLabel: string; color: string }[] = [
  { phase: "menstrual", shortLabel: "Menstrual", color: "bg-[#E45B72]" },
  { phase: "follicular", shortLabel: "Follicular", color: "bg-[#E8A73D]" },
  { phase: "ovulatory", shortLabel: "Ovulatory", color: "bg-[#39A878]" },
  { phase: "luteal", shortLabel: "Luteal", color: "bg-[#6D73D9]" },
];

export function CycleDashboard({
  prediction,
  selectedDate,
  selectedLog,
  isToday,
  settings,
  onOpenLog,
  onOpenCalendar,
  onTogglePhaseGuide,
  showDailyCare = true,
}: {
  prediction: CyclePrediction;
  selectedDate: string;
  selectedLog?: DailyLog;
  isToday: boolean;
  settings: TrackerSettings;
  onOpenLog: () => void;
  onOpenCalendar: () => void;
  /** Opens the inline phase blurb (merged; not a separate Learn tab). */
  onTogglePhaseGuide: () => void;
  /** When false, Daily care is rendered elsewhere (e.g. right column). */
  showDailyCare?: boolean;
}) {
  const phaseLabel = phaseLabels[prediction.estimatedPhase];
  const hasDailyReminder =
    settings.dailyLogReminder &&
    isToday &&
    !selectedLog;
  const hasPrepReminder =
    settings.periodPrepReminder && prediction.daysUntilNextPeriod <= 5;

  return (
    <section className="px-4 pb-4 pt-2 sm:px-0">
      <div className="text-center">
        <p className="min-h-5 text-xs font-bold uppercase leading-5 text-[#A04464]">
          {formatLongDate(selectedDate)}
        </p>
        <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-[#241B21]">
          Your cycle, at a glance
        </h1>
      </div>

      <div className="relative mt-2">
        <CycleProgressRing
          currentCycleDay={prediction.currentCycleDay}
          cycleLength={prediction.averageCycleLength}
          phase={prediction.estimatedPhase}
        />
        <button
          type="button"
          onClick={onTogglePhaseGuide}
          className="absolute bottom-5 right-1 grid h-11 w-11 place-items-center rounded-full border border-[#E4D5DC] bg-white text-xl text-[#B83E68] shadow-[0_8px_24px_rgba(85,45,64,0.15)] transition hover:-translate-y-0.5 hover:bg-[#FFF4F8] focus:outline-none focus:ring-2 focus:ring-[#E9547C]"
          aria-label={`About the ${phaseLabel.toLowerCase()} phase`}
          title="About this phase"
          data-testid="open-phase-guide"
        >
          ?
        </button>
      </div>

      <div className="mx-auto mt-1 grid max-w-[380px] grid-cols-4 gap-1.5">
        {phases.map((item) => {
          const active = item.phase === prediction.estimatedPhase;

          return (
            <div key={item.phase} className="min-w-0 text-center">
              <span
                className={`mx-auto block h-1.5 w-full rounded-full ${item.color} ${
                  active ? "opacity-100" : "opacity-24"
                }`}
              />
              <span
                className={`mt-1 block truncate text-[9px] font-bold ${
                  active ? "text-[#241B21]" : "text-[#A99CA3]"
                }`}
              >
                {item.shortLabel}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4 rounded-[8px] border border-[#ECDDE4] bg-white p-4 shadow-[0_10px_30px_rgba(83,46,64,0.08)]">
        <div>
          <p className="text-xs font-semibold text-[#766970]">Next period</p>
          <p className="mt-1 text-lg font-bold text-[#241B21]">
            {formatShortDate(prediction.predictedNextPeriod)}
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#9A526C]">
            {prediction.daysUntilNextPeriod === 0
              ? "Estimated today"
              : `${prediction.daysUntilNextPeriod} days away`}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenLog}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-[#E9547C] px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(233,84,124,0.24)] transition hover:-translate-y-0.5 hover:bg-[#D94870] focus:outline-none focus:ring-2 focus:ring-[#E9547C] focus:ring-offset-2"
        >
          <span className="text-lg leading-none">+</span>
          {selectedLog ? "Edit log" : "Log day"}
        </button>
      </div>

      {(hasDailyReminder || hasPrepReminder) && (
        <button
          type="button"
          onClick={hasDailyReminder ? onOpenLog : onOpenCalendar}
          className="mt-3 flex w-full items-center gap-3 rounded-[8px] border border-[#F4C6D4] bg-[#FFF0F5] p-3 text-left transition hover:bg-[#FFE8F0] focus:outline-none focus:ring-2 focus:ring-[#E9547C]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#D24570]">
            {hasDailyReminder ? "+" : "!"}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#522737]">
              {hasDailyReminder ? "A little check-in?" : "Period prep reminder"}
            </span>
            <span className="block truncate text-xs text-[#82596A]">
              {hasDailyReminder
                ? "Today is ready for a quick log."
                : "Your predicted period is getting close."}
            </span>
          </span>
          <span className="ml-auto text-lg text-[#B83E68]">›</span>
        </button>
      )}

      {showDailyCare && (
        <DailyCareSection
          prediction={prediction}
          selectedLog={selectedLog}
          onOpenLog={onOpenLog}
          onOpenCalendar={onOpenCalendar}
          onTogglePhaseGuide={onTogglePhaseGuide}
        />
      )}
    </section>
  );
}

/** Daily care cards — can sit in the right column under the month calendar. */
export function DailyCareSection({
  prediction,
  selectedLog,
  onOpenLog,
  onOpenCalendar,
  onTogglePhaseGuide,
  stacked = false,
}: {
  prediction: CyclePrediction;
  selectedLog?: DailyLog;
  onOpenLog: () => void;
  onOpenCalendar: () => void;
  onTogglePhaseGuide: () => void;
  /** 2×2 grid for a side column instead of a horizontal scroller. */
  stacked?: boolean;
}) {
  const phaseLabel = phaseLabels[prediction.estimatedPhase];
  const logCount =
    (selectedLog?.symptoms.length ?? 0) +
    (selectedLog?.moods.length ?? 0) +
    (selectedLog?.energy ? 1 : 0) +
    (selectedLog?.sleep ? 1 : 0) +
    (selectedLog && selectedLog.periodFlow !== "none" ? 1 : 0);

  return (
    <div className="mt-4" data-testid="daily-care-section">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase text-[#A04464]">Daily care</p>
          <h2 className="mt-1 text-xl font-bold text-[#241B21]">
            {selectedLog ? `${logCount} details saved` : "How are you feeling?"}
          </h2>
        </div>
        {selectedLog && (
          <button
            type="button"
            onClick={onOpenLog}
            className="text-xs font-bold text-[#C2426C] underline underline-offset-4"
          >
            Review log
          </button>
        )}
      </div>
      <div
        className={
          stacked
            ? "mt-3 grid grid-cols-2 gap-2.5"
            : "mt-3 flex gap-2.5 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        }
      >
        <InsightCard
          tone="bg-[#FFF0F5]"
          label="Check in"
          title={selectedLog ? "Update this day's log" : "Log symptoms and mood"}
          detail={
            selectedLog && selectedLog.periodFlow !== "none"
              ? `${selectedLog.periodFlow} flow`
              : "Takes a moment"
          }
          action="+"
          onClick={onOpenLog}
          stacked={stacked}
        />
        <InsightCard
          tone="bg-[#F1E9F7]"
          label="Phase care"
          title={`About your ${phaseLabel.toLowerCase()} phase`}
          detail="Short guide"
          onClick={onTogglePhaseGuide}
          stacked={stacked}
        />
        <InsightCard
          tone="bg-[#E8F4EF]"
          label="Calendar"
          title="Jump to month"
          detail="Predictions & history"
          onClick={onOpenCalendar}
          stacked={stacked}
        />
        <InsightCard
          tone="bg-[#FFF4DE]"
          label="Body notes"
          title={
            selectedLog?.symptoms.length
              ? selectedLog.symptoms.join(", ")
              : "Notice what feels different"
          }
          detail={
            selectedLog
              ? `${selectedLog.moods.length} moods saved`
              : "Nothing logged"
          }
          onClick={onOpenLog}
          stacked={stacked}
        />
      </div>
    </div>
  );
}

function InsightCard({
  label,
  title,
  detail,
  tone,
  action,
  onClick,
  stacked = false,
}: {
  label: string;
  title: string;
  detail?: string;
  tone: string;
  action?: string;
  onClick: () => void;
  stacked?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col justify-between rounded-[8px] border border-[#E8DCE2] p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#D38AE6] ${tone} ${
        stacked
          ? "min-h-[120px] w-full"
          : "h-[136px] min-w-[142px] max-w-[158px]"
      }`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide opacity-75">
        {label}
      </span>
      <span className="line-clamp-3 text-sm font-bold leading-snug text-[#33272E]">{title}</span>
      <span className="flex items-end justify-between gap-2 text-[10px] font-semibold opacity-80">
        {detail}
        {action && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#4BA8A9] text-xl font-bold text-white">
            {action}
          </span>
        )}
      </span>
    </button>
  );
}
