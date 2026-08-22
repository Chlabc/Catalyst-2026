/**
 * Check-in streak math (Duolingo-style, derived from daily logs).
 * Run: node --experimental-strip-types scripts/check-checkin-streak.ts
 */
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { getCheckInStreak } = await import(
  pathToFileURL(join(root, "src/app/tracker/_lib/checkInStreak.ts")).href
);

function log(date: string) {
  return {
    date,
    periodFlow: "none",
    symptoms: [],
    moods: [],
  };
}

const empty = getCheckInStreak({}, "2026-08-23");
assert.equal(empty.current, 0);
assert.equal(empty.blossoms, 0);
assert.equal(empty.loggedToday, false);
assert.equal(empty.atRisk, false);
assert.equal(empty.week.length, 7);
assert.equal(empty.week[6].date, "2026-08-23");
assert.equal(empty.week[6].isToday, true);

const todayOnly = getCheckInStreak(
  { "2026-08-23": log("2026-08-23") },
  "2026-08-23",
);
assert.equal(todayOnly.current, 1);
assert.equal(todayOnly.loggedToday, true);
assert.equal(todayOnly.atRisk, false);
assert.equal(todayOnly.blossoms, 1);

const twoDays = getCheckInStreak(
  {
    "2026-08-22": log("2026-08-22"),
    "2026-08-23": log("2026-08-23"),
  },
  "2026-08-23",
);
assert.equal(twoDays.current, 2);
assert.equal(twoDays.longest, 2);

const atRisk = getCheckInStreak(
  { "2026-08-22": log("2026-08-22") },
  "2026-08-23",
);
assert.equal(atRisk.current, 1);
assert.equal(atRisk.loggedToday, false);
assert.equal(atRisk.atRisk, true);

const broken = getCheckInStreak(
  { "2026-08-21": log("2026-08-21") },
  "2026-08-23",
);
assert.equal(broken.current, 0);
assert.equal(broken.atRisk, false);
assert.equal(broken.blossoms, 1);
assert.equal(broken.longest, 1);

const withGap = getCheckInStreak(
  {
    "2026-08-18": log("2026-08-18"),
    "2026-08-19": log("2026-08-19"),
    "2026-08-20": log("2026-08-20"),
    "2026-08-23": log("2026-08-23"),
  },
  "2026-08-23",
);
assert.equal(withGap.current, 1);
assert.equal(withGap.longest, 3);
assert.equal(withGap.blossoms, 4);

console.log("check-checkin-streak: ok");
