import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const scratch = process.env.SCRATCH || "/tmp/grok-welcome-gate";
const BASE = process.env.BASE_URL || "http://localhost:3000";
mkdirSync(scratch, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

try {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("blossom_has_seen_welcome"));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("welcome-gate").waitFor();
  assert.equal(await page.locator('[data-testid="homepage-scene"], section[aria-label="Your cycle space"]').count() > 0, true);

  await page.getByTestId("welcome-enter").click();
  await page.waitForTimeout(200);
  assert.equal(await page.getByTestId("welcome-gate").count(), 0);
  const seen = await page.evaluate(() => localStorage.getItem("blossom_has_seen_welcome"));
  assert.equal(seen, "true");

  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.getByTestId("welcome-gate").count(), 0);
  await page.getByTestId("edit-widgets").waitFor();
  await page.getByLabel("Change scene").waitFor();

  await page.evaluate(() => localStorage.removeItem("blossom_has_seen_welcome"));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("welcome-gate").waitFor();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  assert.equal(await page.getByTestId("welcome-gate").count(), 0);
  assert.equal(
    await page.evaluate(() => localStorage.getItem("blossom_has_seen_welcome")),
    "true",
  );

  writeFileSync(`${scratch}/welcome-gate-playwright.log`, "PASS welcome gate\n");
  console.log("PASS welcome gate");
} finally {
  await browser.close();
}
