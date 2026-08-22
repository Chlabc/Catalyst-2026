/**
 * Browser checks: Home nav, Blossom wordmark, FAQ widget accordion/hide,
 * no floating FAQ panel on key routes. Desktop + mobile.
 */
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scratch =
  process.env.SCRATCH || "/tmp/grok-goal-dbc0f930e707/implementer";
const BASE = process.env.BASE_URL || "http://localhost:3000";
mkdirSync(scratch, { recursive: true });

const faqsSrc = readFileSync(join(root, "src/lib/faqs.ts"), "utf8");
const faqsMatch = faqsSrc.match(/export const FAQS[^=]*=\s*(\[[\s\S]*?\]);/);
assert.ok(faqsMatch);
const FAQS = new Function(`return (${faqsMatch[1]});`)();

const log = [];
function note(msg) {
  log.push(msg);
  console.log(msg);
}

async function assertNoFloatingFaq(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  const edge = page.locator('button[aria-label="Open FAQ"], button[aria-label="Close FAQ"]');
  assert.equal(await edge.count(), 0, `floating FAQ tab still on ${route}`);
  const fixedRight = page.locator(".fixed.right-0");
  // Allow unrelated fixed UI; specifically no vertical FAQ tab text
  const faqTabs = page.getByRole("button", { name: /^FAQ$/ });
  for (let i = 0; i < (await faqTabs.count()); i++) {
    const box = await faqTabs.nth(i).boundingBox();
    if (!box) continue;
    // Old panel was a thin strip glued to the right edge
    assert.ok(
      box.x + box.width < page.viewportSize().width - 8 || box.width > 80,
      `suspected edge FAQ tab on ${route}`,
    );
  }
}

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));

  // --- Home nav from subpage ---
  await page.goto(`${BASE}/tracker`, { waitUntil: "networkidle" });
  await page.getByTestId("nav-home").click();
  await page.waitForURL((url) => url.pathname === "/");
  assert.equal(new URL(page.url()).pathname, "/");
  assert.equal(await page.getByTestId("nav-home").getAttribute("aria-current"), "page");
  assert.notEqual(
    await page.getByTestId("nav-tracker").getAttribute("aria-current"),
    "page",
  );
  await page.screenshot({ path: join(scratch, "home-nav.png"), fullPage: true });
  writeFileSync(
    join(scratch, "home-nav.log"),
    `Home from /tracker → ${page.url()} aria-current=${await page.getByTestId("nav-home").getAttribute("aria-current")}\n`,
  );
  note("OK Home nav from /tracker");

  // Blossom wordmark from subpage
  await page.goto(`${BASE}/library`, { waitUntil: "networkidle" });
  await page.getByTestId("blossom-wordmark").click();
  await page.waitForURL((url) => url.pathname === "/");
  assert.equal(new URL(page.url()).pathname, "/");
  note("OK Blossom wordmark → /");

  // --- FAQ widget ---
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  // Clear prior hidden state so FAQ is visible
  await page.evaluate(() => {
    localStorage.removeItem("blossom_hidden_widgets");
  });
  await page.reload({ waitUntil: "networkidle" });

  const faq = page.getByTestId("faq-widget");
  await faq.waitFor({ timeout: 15000 });
  assert.equal(await faq.count(), 1);

  const q0 = FAQS[0];
  const q1 = FAQS[1];
  await page.locator(`[data-faq-q="${q0.q}"]`).click();
  const a0 = page.locator(`[data-faq-a="${q0.q}"]`);
  await a0.waitFor();
  assert.equal((await a0.innerText()).trim(), q0.a);

  await page.locator(`[data-faq-q="${q1.q}"]`).click();
  const a1 = page.locator(`[data-faq-a="${q1.q}"]`);
  await a1.waitFor();
  assert.equal((await a1.innerText()).trim(), q1.a);
  // First may collapse or stay — either ok; assert second answer matches shared data
  note("OK FAQ accordion answers match shared FAQS");

  await page.getByTestId("edit-widgets").click();
  await page.getByTestId("hide-widget-faq").click();
  await page.waitForTimeout(200);
  assert.equal(await page.getByTestId("faq-widget").count(), 0);
  await page.getByTestId("restore-widget-faq").click();
  await page.getByTestId("faq-widget").waitFor();
  await page.screenshot({ path: join(scratch, "faq-widget.png"), fullPage: true });
  writeFileSync(join(scratch, "faq-widget.log"), "FAQ hide/restore + accordion OK\n");
  note("OK FAQ hide + restore");

  for (const route of ["/", "/tracker", "/scenarios", "/library", "/find-help"]) {
    await assertNoFloatingFaq(page, route);
  }
  note("OK no floating FAQ on key routes");

  // --- Mobile ---
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/tracker`, { waitUntil: "networkidle" });
  await page.getByTestId("nav-home").click();
  await page.waitForURL((url) => url.pathname === "/");
  assert.equal(await page.getByTestId("nav-home").getAttribute("aria-current"), "page");
  await page.evaluate(() => localStorage.removeItem("blossom_hidden_widgets"));
  await page.reload({ waitUntil: "networkidle" });
  await page.getByTestId("faq-widget").waitFor();
  await page.locator(`[data-faq-q="${q0.q}"]`).click();
  assert.equal(
    (await page.locator(`[data-faq-a="${q0.q}"]`).innerText()).trim(),
    q0.a,
  );
  await page.screenshot({ path: join(scratch, "home-faq-mobile.png"), fullPage: true });
  writeFileSync(join(scratch, "home-faq-mobile.log"), "mobile Home + FAQ OK\n");
  note("OK mobile Home + FAQ");

  assert.equal(errors.length, 0, errors.join("; "));
  writeFileSync(join(scratch, "home-faq-playwright.log"), log.join("\n") + "\n");
  console.log("PASS home-faq playwright");
} finally {
  await browser.close();
}
