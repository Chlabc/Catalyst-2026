/**
 * Drive the real PDF builder + range filter with a fixture TrackerState.
 */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scratch = process.env.SCRATCH || "/tmp/grok-cycle-report";
mkdirSync(scratch, { recursive: true });

const runner = join(scratch, "run-cycle-report.mts");
writeFileSync(
  runner,
  `
import { buildCycleReportPdf } from ${JSON.stringify(pathToFileURL(join(root, "src/lib/report/buildCycleReportPdf.ts")).href)};
import { filterLogsInRange, resolveReportRange } from ${JSON.stringify(pathToFileURL(join(root, "src/lib/report/cycleReportData.ts")).href)};
const emptyTrackerState = {
  cycles: [],
  logs: {},
  settings: {
    defaultCycleLength: 28,
    defaultPeriodLength: 5,
    dailyLogReminder: false,
    periodPrepReminder: false,
  },
};

const generatedAt = new Date("2026-08-23T12:00:00");
const state = {
  ...emptyTrackerState,
  logs: {
    "2026-08-01": {
      date: "2026-08-01",
      periodFlow: "medium",
      symptoms: ["cramps"],
      moods: ["sad"],
      painSeverity: { cramps: "strong" },
      notes: "heavy morning",
    },
    "2026-08-20": {
      date: "2026-08-20",
      periodFlow: "none",
      symptoms: ["fatigue"],
      moods: ["calm"],
      sleep: "okay",
      energy: "low",
    },
    "2025-01-01": {
      date: "2025-01-01",
      periodFlow: "light",
      symptoms: [],
      moods: [],
    },
  },
};

const range = resolveReportRange("90d", generatedAt);
const filtered = filterLogsInRange(state, range.fromIso, range.toIso);
if (filtered.length !== 2) {
  throw new Error("expected 2 logs in 90d, got " + filtered.length);
}

const report = buildCycleReportPdf({
  state,
  fromIso: range.fromIso,
  toIso: range.toIso,
  generatedAt,
});
if (report.empty) throw new Error("report should not be empty");
if (report.logCount !== 2) throw new Error("logCount " + report.logCount);
if (report.bytes.length < 800) throw new Error("pdf too small " + report.bytes.length);
const text = Buffer.from(report.bytes).toString("latin1");
if (!text.includes("%PDF")) throw new Error("missing PDF header");

const emptyReport = buildCycleReportPdf({
  state: emptyTrackerState,
  fromIso: "2026-08-01",
  toIso: "2026-08-23",
  generatedAt,
});
if (!emptyReport.empty) throw new Error("empty fixture should be empty");
if (emptyReport.logCount !== 0) throw new Error("empty logCount");

console.log(JSON.stringify({
  ok: true,
  logCount: report.logCount,
  bytes: report.bytes.length,
  filename: report.filename,
  emptyBytes: emptyReport.bytes.length,
  fromIso: range.fromIso,
  toIso: range.toIso,
}));
`,
);

const result = spawnSync(
  process.execPath,
  [
    "--experimental-strip-types",
    "--no-warnings",
    "--import",
    pathToFileURL(join(root, "scripts/register-ts.mjs")).href,
    runner,
  ],
  { cwd: root, encoding: "utf8" },
);
assert.equal(result.status, 0, result.stderr || result.stdout);
const summary = JSON.parse(result.stdout.trim().split("\n").pop());
assert.equal(summary.logCount, 2);
assert.ok(summary.bytes > 800);

const canvas = readFileSync(
  join(root, "src/components/canvas/WidgetCanvas.tsx"),
  "utf8",
);
assert.match(canvas, /id="report"/);
assert.match(canvas, /ReportWidget/);
const vis = readFileSync(join(root, "src/lib/widgetVisibility.ts"), "utf8");
assert.match(vis, /id: "report"/);

writeFileSync(join(scratch, "cycle-report-unit.log"), result.stdout);
console.log("OK cycle report builder", summary);
