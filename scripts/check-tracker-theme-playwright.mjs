/**
 * Loads /tracker with beach then macaron via blossom_home_scene and asserts
 * the tracker root backdrop differs and is not solid #FFF7FB.
 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRATCH =
  process.env.SCRATCH ||
  "/tmp/grok-goal-d79eb03b8255/implementer";
const BASE = process.env.BASE_URL || "http://localhost:3000";
const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");

async function captureTheme(page, theme) {
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  // Persist the same key the homepage writes; the root layout init script
  // applies it to documentElement.dataset.blossomTheme.
  await page.addInitScript((scene) => {
    localStorage.setItem("blossom_home_scene", scene);
  }, theme);

  await page.goto(`${BASE}/tracker`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-testid="tracker-scene-backdrop"]');

  const result = await page.evaluate(() => {
    const root = document.querySelector('[data-testid="tracker-scene-backdrop"]');
    if (!root) {
      return { missing: true };
    }
    const style = getComputedStyle(root);
    return {
      missing: false,
      sceneAttr: root.getAttribute("data-blossom-scene"),
      htmlTheme: document.documentElement.dataset.blossomTheme,
      backgroundImage: style.backgroundImage,
      backgroundColor: style.backgroundColor,
      className: root.className,
    };
  });

  const screenshotPath = join(SCRATCH, `tracker-theme-${theme}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  writeFileSync(
    join(SCRATCH, `tracker-theme-${theme}.json`),
    JSON.stringify({ theme, result, errors, screenshotPath }, null, 2),
  );

  return { theme, result, errors, screenshotPath };
}

const browser = await chromium.launch({ headless: true });
try {
  const beachPage = await browser.newPage();
  const beach = await captureTheme(beachPage, "beach");
  await beachPage.close();

  const macaronPage = await browser.newPage();
  const macaron = await captureTheme(macaronPage, "macaron");
  await macaronPage.close();

  assert.equal(beach.result.missing, false, "tracker backdrop root missing (beach)");
  assert.equal(macaron.result.missing, false, "tracker backdrop root missing (macaron)");
  assert.equal(beach.result.sceneAttr, "beach");
  assert.equal(macaron.result.sceneAttr, "macaron");
  assert.equal(beach.result.htmlTheme, "beach");
  assert.equal(macaron.result.htmlTheme, "macaron");
  assert.notEqual(
    beach.result.backgroundImage,
    macaron.result.backgroundImage,
    "beach and macaron backgrounds should differ",
  );
  assert.notEqual(
    beach.result.backgroundColor.toLowerCase(),
    "rgb(255, 247, 251)",
    "beach backdrop must not be opaque #FFF7FB",
  );
  assert.notEqual(
    macaron.result.backgroundColor.toLowerCase(),
    "rgb(255, 247, 251)",
    "macaron backdrop must not be opaque #FFF7FB",
  );
  assert.ok(
    beach.result.backgroundImage.includes("gradient"),
    "beach should use gradient backdrop",
  );
  assert.ok(
    macaron.result.backgroundImage.includes("gradient"),
    "macaron should use gradient backdrop",
  );
  assert.equal(beach.errors.length, 0, `beach page errors: ${beach.errors.join("; ")}`);
  assert.equal(macaron.errors.length, 0, `macaron page errors: ${macaron.errors.join("; ")}`);

  // Spot-check another route under themed body
  const other = await browser.newPage();
  await other.addInitScript(() => {
    localStorage.setItem("blossom_home_scene", "beach");
    document.documentElement.dataset.blossomTheme = "beach";
  });
  await other.goto(`${BASE}/library`, { waitUntil: "networkidle" });
  const libraryOk = await other.evaluate(() => document.body !== null);
  assert.equal(libraryOk, true);
  await other.screenshot({ path: join(SCRATCH, "library-theme-beach.png") });
  await other.close();

  const summary = {
    ok: true,
    beach: beach.result,
    macaron: macaron.result,
    screenshots: {
      beach: beach.screenshotPath,
      macaron: macaron.screenshotPath,
    },
  };
  writeFileSync(join(SCRATCH, "tracker-theme-playwright.json"), JSON.stringify(summary, null, 2));
  console.log("OK Playwright beach vs macaron /tracker backdrop differs; not #FFF7FB");
  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  writeFileSync(
    join(SCRATCH, "playwright-unavailable.log"),
    String(error && error.stack ? error.stack : error),
  );
  throw error;
} finally {
  await browser.close();
}
