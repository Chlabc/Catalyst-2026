"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { readTrackerState } from "@/app/tracker/_lib/storage";
import {
  REPORT_RANGE_PRESETS,
  earliestLogDate,
  filterLogsInRange,
  resolveReportRange,
  type ReportRangePreset,
} from "@/lib/report/cycleReportData";

export function ReportWidget() {
  const [preset, setPreset] = useState<ReportRangePreset>("90d");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preview = useMemo(() => {
    const state = readTrackerState();
    const range = resolveReportRange(
      preset,
      new Date(),
      earliestLogDate(state.logs),
    );
    const logs = filterLogsInRange(state, range.fromIso, range.toIso);
    return { range, logCount: logs.length };
  }, [preset]);

  const empty = preview.logCount === 0;

  async function download() {
    setBusy(true);
    setError(null);
    try {
      const [{ buildCycleReportPdf }, { readTrackerState: readState }] =
        await Promise.all([
          import("@/lib/report/buildCycleReportPdf"),
          import("@/app/tracker/_lib/storage"),
        ]);
      const state = readState();
      const range = resolveReportRange(
        preset,
        new Date(),
        earliestLogDate(state.logs),
      );
      const report = buildCycleReportPdf({
        state,
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
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not build PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-b-2xl border-2 border-t-0 border-primary/25 bg-primary-soft p-5"
      data-testid="report-widget"
    >
      <p className="text-base font-semibold text-foreground">Health report</p>
      <p className="mt-1 text-sm text-text-muted">
        Download a summary to show a GP or pharmacist. Built on this device
        only.
      </p>

      <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-text-muted">
        Range
        <select
          data-testid="report-range"
          value={preset}
          onChange={(event) =>
            setPreset(event.target.value as ReportRangePreset)
          }
          className="mt-1 w-full rounded-xl border border-primary/20 bg-white/80 px-3 py-2 text-sm font-medium text-foreground"
        >
          {REPORT_RANGE_PRESETS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <p className="mt-2 text-xs text-text-muted">
        {preview.range.fromIso} → {preview.range.toIso} · {preview.logCount}{" "}
        check-ins
      </p>

      {empty && (
        <p className="mt-3 text-sm text-text-muted" data-testid="report-empty">
          No check-ins in this period.{" "}
          <Link href="/tracker" className="font-semibold text-primary hover:underline">
            Open Tracker
          </Link>{" "}
          to log, then come back.
        </p>
      )}

      <button
        type="button"
        data-testid="report-download"
        disabled={busy || empty}
        onClick={() => void download()}
        className="mt-4 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Building PDF…" : "Download PDF"}
      </button>

      {error && (
        <p className="mt-2 text-xs text-accent" role="alert">
          {error}
        </p>
      )}

      <p className="mt-3 text-[11px] leading-snug text-text-muted">
        Not a diagnosis. Take it with a trusted adult to a GP or pharmacist.
      </p>
    </div>
  );
}
