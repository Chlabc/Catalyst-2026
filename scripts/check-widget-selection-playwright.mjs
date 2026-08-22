/**
 * Browser: Edit panel toggles optional widgets live; Learning locked;
 * persistence + sanitize of hidden "learning"; drag still works.
 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const scratch = process.env.SCRATCH || "/tmp/grok-widget-selection";
const BASE = process.env.BASE_URL || "http://localhost:3000";
mkdirSync(scratch, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));

try {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.setItem(
      "blossom_hidden_widgets",
      JSON.stringify(["learning", "tracking"]),
    );
  });
  await page.reload({ waitUntil: "networkidle" });

  // Learning always visible even if storage hid it
  await page.locator('[data-widget-id="learning"]').waitFor();
  assert.equal(await page.locator('[data-widget-id="tracking"]').count(), 0);
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("blossom_hidden_widgets") || "[]"),
  );
  assert.ok(!stored.includes("learning"), `learning still hidden: ${stored}`);

  await page.getByTestId("edit-widgets").click();
  await page.getByTestId("widget-select-panel").waitFor();

  const learningBox = page.getByTestId("widget-select-learning");
  assert.equal(await learningBox.isChecked(), true);
  assert.equal(await learningBox.isDisabled(), true);

  await page.getByTestId("widget-select-faq").uncheck();
  await page.waitForTimeout(150);
  assert.equal(await page.getByTestId("faq-widget").count(), 0);

  await page.getByTestId("widget-select-faq").check();
  await page.getByTestId("faq-widget").waitFor();

  await page.getByTestId("widget-select-help").uncheck();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('[data-widget-id="help"]').count(), 0);

  await page.getByTestId("widget-select-tracking").check();
  await page.locator('[data-widget-id="tracking"]').waitFor();

  await page.screenshot({ path: `${scratch}/widget-selection-desktop.png`, fullPage: true });

  // Persistence
  await page.reload({ waitUntil: "networkidle" });
  await page.locator('[data-widget-id="learning"]').waitFor();
  await page.locator('[data-widget-id="tracking"]').waitFor();
  assert.equal(await page.locator('[data-widget-id="help"]').count(), 0);
  await page.getByTestId("faq-widget").waitFor();

  // Drag Learning still works
  await page.getByTestId("edit-widgets").click();
  const learning = page.locator('[data-widget-id="learning"]');
  const handle = learning.locator(".cursor-grab").first();
  const box = await handle.boundingBox();
  assert.ok(box);
  const before = await learning.evaluate((el) => el.style.transform);
  await handle.dragTo(handle, {
    sourcePosition: { x: 20, y: 10 },
    targetPosition: { x: 80, y: 50 },
    force: true,
  });
  const after = await learning.evaluate((el) => el.style.transform);
  assert.notEqual(before, after, "Learning should still drag");

  // Mobile
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByTestId("edit-widgets").click();
  await page.getByTestId("widget-select-panel").waitFor();
  assert.equal(await page.getByTestId("widget-select-learning").isDisabled(), true);
  await page.screenshot({ path: `${scratch}/widget-selection-mobile.png`, fullPage: true });

  assert.equal(errors.length, 0, errors.join("; "));
  writeFileSync(
    `${scratch}/widget-selection-playwright.log`,
    "PASS widget selection panel\n",
  );
  console.log("PASS widget selection playwright");
} finally {
  await browser.close();
}
