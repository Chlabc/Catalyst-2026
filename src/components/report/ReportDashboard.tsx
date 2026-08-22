"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  emptyTrackerState,
  readTrackerState,
  readTrackerStateFromBackend,
} from "@/app/tracker/_lib/storage";
import type { TrackerState } from "@/app/tracker/_types/tracker";
import {
  getCyclePrediction,
  phaseLabels,
} from "@/app/tracker/_lib/cyclePredictions";
import {
  REPORT_RANGE_PRESETS,
  filterLogsInRange,
  formatPain,
  logDateBounds,
  resolveReportRange,
  summarizeLogs,
  type ReportRangePreset,
} from "@/lib/report/cycleReportData";

function topEntries(counts: Record<string, number>, limit = 6) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-white/75 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  );
}

function CountList({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: [string, number][];
  empty: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white/70 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">{empty}</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {rows.map(([name, count]) => (
            <li key={name} className="flex items-center justify-between gap-3 text-sm">
              <span className="capitalize text-foreground">{name.replace(":", " · ")}</span>
              <span className="font-semibold text-primary">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function ReportDashboard() {
  const [preset, setPreset] = useState<ReportRangePreset>("90d");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackerState, setTrackerState] =
    useState<TrackerState>(emptyTrackerState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readTrackerStateFromBackend()
      .then((state) => {
        if (!cancelled) setTrackerState(state);
      })
      .catch(() => {
        if (!cancelled) setTrackerState(readTrackerState());
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const range = useMemo(
    () => resolveReportRange(preset, new Date(), logDateBounds(trackerState.logs)),
    [preset, trackerState],
  );
  const logs = useMemo(
    () => filterLogsInRange(trackerState, range.fromIso, range.toIso),
    [trackerState, range],
  );
  const stats = useMemo(() => summarizeLogs(logs), [logs]);
  const prediction = useMemo(
    () =>
      getCyclePrediction(trackerState.cycles, trackerState.settings, new Date()),
    [trackerState],
  );
  const empty = hydrated && stats.logCount === 0;
  const recentLogs = [...logs].slice(-8).reverse();

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const { buildCycleReportPdf } = await import(
        "@/lib/report/buildCycleReportPdf"
      );
      const report = buildCycleReportPdf({
        state: trackerState,
        fromIso: range.fromIso,
        toIso: range.toIso,
      });
      if (report.empty) {
        setError("No check-ins in this period. Log in Tracker first.");
        return;
      }
      const url = URL.createObjectURL(report.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = report.filename;
      document.body.appendChild(link);
      link.click();
      window.setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 2000);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not build PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-testid="report-dashboard">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-text-muted">
          Range
          <select
            data-testid="report-range"
            value={preset}
            onChange={(event) =>
              setPreset(event.target.value as ReportRangePreset)
            }
            className="mt-1 block rounded-xl border border-primary/20 bg-white/80 px-3 py-2 text-sm font-medium text-foreground"
          >
            {REPORT_RANGE_PRESETS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-sm text-text-muted">
          {hydrated
            ? `${range.fromIso} → ${range.toIso}`
            : "Loading check-ins…"}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Check-ins"
          value={hydrated ? String(stats.logCount) : "—"}
          hint="Days you logged in this range"
        />
        <StatCard
          label="Period-flow days"
          value={hydrated ? String(stats.periodDays) : "—"}
          hint="Days with spotting or heavier flow"
        />
        <StatCard
          label="Avg cycle"
          value={`${prediction.averageCycleLength} days`}
        />
        <StatCard
          label="Avg period"
          value={`${prediction.averagePeriodLength} days`}
        />
        <StatCard
          label="Estimated phase"
          value={phaseLabels[prediction.estimatedPhase]}
          hint={`Cycle day ${prediction.currentCycleDay}`}
        />
        <StatCard
          label="Next period"
          value={prediction.predictedNextPeriod}
          hint={`${prediction.daysUntilNextPeriod} days`}
        />
      </div>

      {empty && (
        <p className="mt-6 text-sm text-text-muted" data-testid="report-empty">
          No check-ins in this period.{" "}
          <Link href="/tracker" className="font-semibold text-primary hover:underline">
            Open Tracker
          </Link>{" "}
          to log, then come back for a fuller picture.
        </p>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <CountList
          title="Symptoms"
          rows={topEntries(stats.symptoms)}
          empty="No symptoms tagged in this range."
        />
        <CountList
          title="Moods"
          rows={topEntries(stats.moods)}
          empty="No moods tagged in this range."
        />
        <CountList
          title="Pain"
          rows={topEntries(stats.pain)}
          empty="No pain levels tagged in this range."
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-2xl border border-border bg-white/70 shadow-sm">
        <h2 className="border-b border-border px-4 py-3 text-sm font-semibold text-foreground">
          Recent check-ins
        </h2>
        {recentLogs.length === 0 ? (
          <p className="px-4 py-6 text-sm text-text-muted">Nothing logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-primary-soft/50 text-xs uppercase tracking-wide text-text-muted">
                <tr>
                  <th className="px-4 py-2 font-semibold">Date</th>
                  <th className="px-4 py-2 font-semibold">Flow</th>
                  <th className="px-4 py-2 font-semibold">Symptoms</th>
                  <th className="px-4 py-2 font-semibold">Moods</th>
                  <th className="px-4 py-2 font-semibold">Pain</th>
                  <th className="px-4 py-2 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.date} className="border-t border-border/70">
                    <td className="px-4 py-2 whitespace-nowrap">{log.date}</td>
                    <td className="px-4 py-2 capitalize">{log.periodFlow}</td>
                    <td className="px-4 py-2">{log.symptoms.join(", ") || "—"}</td>
                    <td className="px-4 py-2">{log.moods.join(", ") || "—"}</td>
                    <td className="px-4 py-2">{formatPain(log)}</td>
                    <td className="px-4 py-2 max-w-[14rem] truncate">
                      {log.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <button
        type="button"
        data-testid="report-download"
        disabled={busy || !hydrated || empty}
        onClick={() => void download()}
        className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Building PDF…" : "Download PDF"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-accent" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
