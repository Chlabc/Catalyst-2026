/**
 * Structural + unit checks for widget selection edit mode (notepad 010).
 * Imports the real sanitizeHiddenWidgets implementation.
 */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scratch = process.env.SCRATCH || "/tmp/grok-widget-selection";
mkdirSync(scratch, { recursive: true });

const visUrl = pathToFileURL(join(root, "src/lib/widgetVisibility.ts")).href;
const loaded = spawnSync(
  process.execPath,
  [
    "--experimental-strip-types",
    "--no-warnings",
    "-e",
    `import { sanitizeHiddenWidgets } from ${JSON.stringify(visUrl)};
     const cases = [
       [["tracking","learning","faq"], ["tracking","faq"]],
       [["learning"], []],
       ["nope", []],
       [["help","unknown"], ["help"]],
     ];
     for (const [input, expected] of cases) {
       const got = JSON.stringify(sanitizeHiddenWidgets(input));
       const want = JSON.stringify(expected);
       if (got !== want) {
         console.error("mismatch", input, got, want);
         process.exit(1);
       }
     }
     console.log("sanitize-ok");`,
  ],
  { encoding: "utf8" },
);
assert.equal(loaded.status, 0, loaded.stderr || loaded.stdout);
assert.match(loaded.stdout, /sanitize-ok/);

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const canvas = read("src/components/canvas/WidgetCanvas.tsx");
assert.match(canvas, /data-testid="widget-select-panel"/);
assert.match(canvas, /widget-select-\$\{widget\.id\}/);
assert.match(canvas, /Always on/);
assert.match(canvas, /REQUIRED_WIDGETS/);
assert.match(canvas, /OPTIONAL_WIDGETS/);
assert.match(canvas, /id="learning"/);
assert.doesNotMatch(canvas, /!hidden\.has\("learning"\)/);
assert.doesNotMatch(canvas, /onRemove=/);
assert.doesNotMatch(canvas, /hidden-widgets/);
assert.doesNotMatch(canvas, /hide\("learning"\)/);

const grepHide = spawnSync(
  "grep",
  ["-n", "onRemove", "src/components/canvas/WidgetCanvas.tsx"],
  { cwd: root, encoding: "utf8" },
);
assert.equal(grepHide.status, 1, grepHide.stdout);

const log = [
  "OK sanitize strips learning (real src/lib/widgetVisibility.ts)",
  "OK selection panel testids present",
  "OK no Hide/onRemove/restore chips on canvas",
].join("\n");
console.log(log);
writeFileSync(join(scratch, "widget-selection-structural.log"), log + "\n");
