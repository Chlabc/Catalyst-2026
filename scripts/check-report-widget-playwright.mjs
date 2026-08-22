import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const scratch = process.env.SCRATCH || "/tmp/grok-cycle-report";
const BASE = process.env.BASE_URL || "http://localhost:3000";
mkdirSync(scratch, { recursive: true });

const fixture = {
  cycles: [],
  logs: {
    "2026-08-20": {
      date: "2026-08-20",
      periodFlow: "medium",
      symptoms: ["cramps"],
      moods: ["sad"],
      painSeverity: { cramps: "mild" },
    },
  },
  settings: {
    defaultCycleLength: 28,
    defaultPeriodLength: 5,
    dailyLogReminder: false,
    periodPrepReminder: false,
  },
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const requests = [];
page.on("request", (req) => {
  if (req.url().includes("pdf") || req.method() !== "GET") {
    requests.push({ method: req.method(), url: req.url() });
  }
});

try {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate((state) => {
    localStorage.setItem("menstramission.tracker.v1", JSON.stringify(state));
    localStorage.removeItem("blossom_hidden_widgets");
  }, fixture);
  await page.reload({ waitUntil: "networkidle" });

  const widget = page.getByTestId("report-widget");
  await widget.waitFor();
  const downloadPromise = page.waitForEvent("download", { timeout: 15000 });
  await page.getByTestId("report-download").click();
  const download = await downloadPromise;
  const name = download.suggestedFilename();
  assert.match(name, /bloom-cycle-report-.*\.pdf/);
  const path = `${scratch}/${name}`;
  await download.saveAs(path);

  const uploaded = requests.filter(
    (item) =>
      item.method === "POST" ||
      item.method === "PUT" ||
      /upload|s3|googleapis/i.test(item.url),
  );
  assert.equal(uploaded.length, 0, JSON.stringify(uploaded));

  await page.evaluate(() => {
    localStorage.setItem(
      "menstramission.tracker.v1",
      JSON.stringify({
        cycles: [],
        logs: {},
        settings: {
          defaultCycleLength: 28,
          defaultPeriodLength: 5,
          dailyLogReminder: false,
          periodPrepReminder: false,
        },
      }),
    );
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("report-empty").waitFor();
  assert.equal(await page.getByTestId("report-download").isDisabled(), true);

  await page.getByTestId("edit-widgets").click();
  await page.getByTestId("widget-select-report").waitFor();
  assert.equal(await page.getByTestId("widget-select-report").isDisabled(), false);

  writeFileSync(
    `${scratch}/report-widget-playwright.log`,
    JSON.stringify({ ok: true, filename: name, path }, null, 2),
  );
  console.log("PASS report widget", name);
} finally {
  await browser.close();
}
