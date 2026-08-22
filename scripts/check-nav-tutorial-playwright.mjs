/**
 * Browser checks: WelcomeGate then Home coach-mark tour, Skip persist,
 * overlay click does not close, leave-/ persist, Replay tour.
 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";

const scratch = process.env.SCRATCH || "/tmp/grok-nav-tutorial";
const BASE = process.env.BASE_URL || "http://localhost:3000";
mkdirSync(scratch, { recursive: true });

const log = [];
function note(msg) {
  log.push(msg);
  console.log(msg);
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.removeItem("blossom_has_seen_welcome");
    localStorage.removeItem("blossom_has_seen_nav_tutorial");
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("welcome-gate").waitFor();
  assert.equal(await page.getByTestId("nav-tutorial").count(), 0);
  await page.screenshot({ path: `${scratch}/nav-tutorial-welcome-first.png` });
  await page.getByTestId("welcome-enter").click();
  await page.getByTestId("nav-tutorial").waitFor();
  assert.equal(await page.getByTestId("welcome-gate").count(), 0);
  assert.equal(await page.getByTestId("nav-tutorial-back").count(), 0);
  assert.match(await page.getByTestId("nav-tutorial").innerText(), /Bloom/);
  assert.doesNotMatch(await page.getByTestId("nav-tutorial").innerText(), /Blossom/);
  await page.screenshot({ path: `${scratch}/nav-tutorial-step-1.png` });
  note("OK tour after WelcomeGate; step 1 has no Back");

  await page.getByTestId("nav-tutorial-overlay").click({
    position: { x: 20, y: 200 },
    force: true,
  });
  assert.equal(await page.getByTestId("nav-tutorial").count(), 1);
  note("OK overlay click does not skip");

  await page.getByTestId("nav-tutorial-skip").click();
  await page.waitForTimeout(150);
  assert.equal(await page.getByTestId("nav-tutorial").count(), 0);
  assert.equal(
    await page.evaluate(() => localStorage.getItem("blossom_has_seen_nav_tutorial")),
    "true",
  );
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.getByTestId("welcome-gate").count(), 0);
  assert.equal(await page.getByTestId("nav-tutorial").count(), 0);
  note("OK Skip persist; reload does not auto-show tour");

  await page.evaluate(() => {
    localStorage.removeItem("blossom_has_seen_nav_tutorial");
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("nav-tutorial").waitFor();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(150);
  assert.equal(await page.getByTestId("nav-tutorial").count(), 0);
  assert.equal(
    await page.evaluate(() => localStorage.getItem("blossom_has_seen_nav_tutorial")),
    "true",
  );
  note("OK Esc persist");

  await page.evaluate(() => {
    localStorage.removeItem("blossom_has_seen_nav_tutorial");
  });
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("nav-tutorial").waitFor();
  await page.getByTestId("nav-learn").click();
  await page.waitForURL((url) => url.pathname === "/scenarios");
  assert.equal(
    await page.evaluate(() => localStorage.getItem("blossom_has_seen_nav_tutorial")),
    "true",
  );
  await page.getByTestId("nav-home").click();
  await page.waitForURL((url) => url.pathname === "/");
  await page.waitForTimeout(200);
  assert.equal(await page.getByTestId("nav-tutorial").count(), 0);
  note("OK leaving / persists skip");

  assert.equal(
    await page.evaluate(() => localStorage.getItem("blossom_has_seen_welcome")),
    "true",
  );
  await page.getByTestId("edit-widgets").click();
  await page.getByTestId("replay-tour").click();
  await page.getByTestId("nav-tutorial").waitFor();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("blossom_has_seen_welcome")),
    "true",
  );
  await page.getByTestId("nav-tutorial-next").click();
  await page.waitForTimeout(200);
  assert.match(await page.getByTestId("nav-tutorial").innerText(), /2 of 5/i);
  await page.getByTestId("nav-tutorial-got-it").count();
  for (let i = 0; i < 4; i += 1) {
    const gotIt = page.getByTestId("nav-tutorial-got-it");
    if ((await gotIt.count()) > 0) {
      await gotIt.click();
      break;
    }
    await page.getByTestId("nav-tutorial-next").click();
    await page.waitForTimeout(120);
  }
  await page.waitForTimeout(200);
  assert.equal(await page.getByTestId("nav-tutorial").count(), 0);
  if ((await page.getByTestId("replay-tour").count()) === 0) {
    await page.getByTestId("edit-widgets").click();
  }
  await page.getByTestId("replay-tour").waitFor();
  note("OK Replay tour keeps WelcomeGate seen; canvas still editable");

  writeFileSync(`${scratch}/nav-tutorial-playwright.log`, log.join("\n") + "\n");
} finally {
  await browser.close();
}

const mobileBrowser = await chromium.launch({ headless: true });
try {
  const mobile = await mobileBrowser.newPage({
    viewport: { width: 390, height: 844 },
  });
  await mobile.addInitScript(() => {
    localStorage.setItem("blossom_has_seen_welcome", "true");
    localStorage.removeItem("blossom_has_seen_nav_tutorial");
  });
  await mobile.goto(BASE, { waitUntil: "networkidle" });
  await mobile.getByTestId("nav-tutorial").waitFor();
  const tooltip = mobile.getByTestId("nav-tutorial-tooltip");
  const box = await tooltip.boundingBox();
  assert.ok(box, "tooltip missing on mobile");
  assert.ok(box.x >= -1, `tooltip off left ${box.x}`);
  assert.ok(box.y >= -1, `tooltip off top ${box.y}`);
  assert.ok(box.x + box.width <= 391, `tooltip off right ${box.x + box.width}`);
  assert.ok(box.y + box.height <= 845, `tooltip off bottom ${box.y + box.height}`);
  await mobile.screenshot({ path: `${scratch}/nav-tutorial-mobile.png` });
  note("OK mobile tooltip on-screen");
  writeFileSync(
    `${scratch}/nav-tutorial-playwright.log`,
    log.join("\n") + "\n",
    { flag: "a" },
  );
} finally {
  await mobileBrowser.close();
}

console.log("PASS nav tutorial playwright");
