/**
 * Local-first tracker merge + flower period-day mapping.
 * Run: node --experimental-strip-types scripts/check-tracker-local-first.ts
 */
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const storageUrl = pathToFileURL(join(root, "src/app/tracker/_lib/storage.ts")).href;
const marksUrl = pathToFileURL(
  join(root, "src/app/tracker/_lib/widgetCalendarMarks.ts"),
).href;

const { emptyTrackerState, hasTrackerData, preferLocalTrackerState } =
  await import(storageUrl);
const { periodDaysAsLogs } = await import(marksUrl);

const empty = emptyTrackerState;
const localWithLog = {
  ...empty,
  logs: {
    "2026-08-23": {
      date: "2026-08-23",
      periodFlow: "medium",
      symptoms: [],
      moods: [],
    },
  },
};
const remoteEmpty = empty;
const remoteWithOtherLog = {
  ...empty,
  logs: {
    "2026-08-01": {
      date: "2026-08-01",
      periodFlow: "light",
      symptoms: [],
      moods: [],
    },
  },
};

assert.equal(hasTrackerData(empty), false);
assert.equal(hasTrackerData(localWithLog), true);
assert.equal(preferLocalTrackerState(localWithLog, remoteEmpty), localWithLog);
assert.equal(preferLocalTrackerState(empty, remoteWithOtherLog), remoteWithOtherLog);
assert.equal(preferLocalTrackerState(localWithLog, remoteWithOtherLog), localWithLog);

const mixed = {
  ...empty,
  logs: {
    "2026-08-23": {
      date: "2026-08-23",
      periodFlow: "medium",
      symptoms: ["cramps"],
      moods: ["calm"],
    },
    "2026-08-22": {
      date: "2026-08-22",
      periodFlow: "none",
      symptoms: [],
      moods: ["happy"],
    },
  },
};
const periodOnly = periodDaysAsLogs(mixed);
assert.ok(periodOnly["2026-08-23"]);
assert.equal(periodOnly["2026-08-22"], undefined);

console.log("check-tracker-local-first: ok");
