/**
 * Structural checks for Home nav + shared FAQ widget (notepad 008).
 * Drives the real shipped modules under src/lib/.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scratch =
  process.env.SCRATCH || "/tmp/grok-goal-dbc0f930e707/implementer";
mkdirSync(scratch, { recursive: true });

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const lines = [];
function log(msg) {
  lines.push(msg);
  console.log(msg);
}

// --- (a) Home nav link + exact active semantics ---
const navSrc = read("src/lib/navLinks.ts");
assert.match(navSrc, /href:\s*"\/"\s*,\s*label:\s*"Home"/);
assert.match(navSrc, /exact:\s*true/);
assert.match(navSrc, /function isNavLinkActive/);

// Execute the real active-state function by evaluating the exported logic
// from source (no reimplementation): extract and run via Function.
const activeFnMatch = navSrc.match(
  /export function isNavLinkActive\([\s\S]*?\n\}/,
);
assert.ok(activeFnMatch, "isNavLinkActive missing");
// Strip TS parameter/return types so we can execute the real function body.
const activeFnJs = activeFnMatch[0]
  .replace("export function", "function")
  .replace(/\(pathname:\s*string,\s*link:\s*NavLink\):\s*boolean/, "(pathname, link)");
const isNavLinkActive = new Function(
  `${activeFnJs}; return isNavLinkActive;`,
)();

assert.equal(isNavLinkActive("/", { href: "/", exact: true }), true);
assert.equal(isNavLinkActive("/tracker", { href: "/", exact: true }), false);
assert.equal(isNavLinkActive("/scenarios", { href: "/", exact: true }), false);
assert.equal(
  isNavLinkActive("/scenarios/extra", { href: "/scenarios" }),
  true,
);
log("OK nav Home exact-active semantics");

const navBar = read("src/components/ui/NavBar.tsx");
assert.match(navBar, /NAV_LINKS/);
assert.match(navBar, /blossom-wordmark/);
assert.doesNotMatch(navBar, /blossom:open-help/);
assert.doesNotMatch(navBar, /Open FAQ|openHelp/);
log("OK NavBar uses shared links; no FAQ floating opener");

// --- (b) Shared FAQ data consumed by widget ---
const faqsSrc = read("src/lib/faqs.ts");
assert.match(faqsSrc, /export const FAQS/);
const faqWidget = read("src/components/canvas/FaqWidget.tsx");
assert.match(faqWidget, /from "@\/lib\/faqs"/);
assert.match(faqWidget, /FAQS\.map/);
assert.match(faqWidget, /data-testid="faq-widget"/);

const faqsArrayMatch = faqsSrc.match(
  /export const FAQS[^=]*=\s*(\[[\s\S]*?\]);/,
);
assert.ok(faqsArrayMatch, "FAQS array missing");
const FAQS = new Function(`return (${faqsArrayMatch[1]});`)();
assert.ok(Array.isArray(FAQS) && FAQS.length >= 2);
assert.ok(FAQS.every((f) => typeof f.q === "string" && typeof f.a === "string"));
log(`OK shared FAQS (${FAQS.length} entries) consumed by FaqWidget`);

const canvas = read("src/components/canvas/WidgetCanvas.tsx");
assert.match(canvas, /id:\s*"faq"/);
assert.match(canvas, /FaqWidget/);
assert.match(canvas, /label:\s*"FAQ"/);
log("OK FAQ registered on WidgetCanvas");

// --- (c) HelpPanel / floating shell / blossom:open-help gone ---
assert.equal(
  existsSync(join(root, "src/components/HelpPanel.tsx")),
  false,
  "HelpPanel.tsx should be deleted",
);
const layout = read("src/app/layout.tsx");
assert.doesNotMatch(layout, /HelpPanel/);
assert.doesNotMatch(layout, /blossom:open-help/);

const srcTree = spawnSync("grep", ["-RIn", "HelpPanel\\|blossom:open-help", "src"], {
  cwd: root,
  encoding: "utf8",
});
assert.equal(srcTree.status, 1, `expected no matches, got:\n${srcTree.stdout}`);
log("OK HelpPanel and blossom:open-help absent from src");

const outPath = join(scratch, "home-faq-structural.log");
writeFileSync(outPath, lines.join("\n") + "\n");
log(`wrote ${outPath}`);
