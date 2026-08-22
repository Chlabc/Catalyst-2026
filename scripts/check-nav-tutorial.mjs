/**
 * Structural checks for the first-run Home nav tutorial.
 * Reads shipped source — does not re-implement the tour.
 */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scratch = process.env.SCRATCH || "/tmp/grok-nav-tutorial";
mkdirSync(scratch, { recursive: true });

const lines = [];
function log(msg) {
  lines.push(msg);
  console.log(msg);
}

const tutorial = readFileSync(join(root, "src/lib/navTutorial.ts"), "utf8");
assert.match(tutorial, /blossom_has_seen_nav_tutorial/);
assert.match(tutorial, /data-testid="top-nav"/);
assert.match(tutorial, /data-canvas-centerpiece/);
assert.match(tutorial, /data-widget-id="learning"/);
assert.match(tutorial, /widget-drag-handle-learning/);
assert.match(tutorial, /data-testid="edit-widgets"/);
assert.match(tutorial, /Bloom/);
assert.doesNotMatch(tutorial, /Blossom/);
log("OK navTutorial key, Bloom copy, five spotlight selectors");

const ui = readFileSync(join(root, "src/components/NavTutorial.tsx"), "utf8");
assert.match(ui, /Skip tour/);
assert.match(ui, /Got it/);
assert.match(ui, /Show tour/);
assert.match(ui, /Hide tour/);
assert.match(ui, /data-testid="toggle-tour"/);
assert.match(ui, /persistNavTutorialSeen/);
assert.match(ui, /WELCOME_KEY/);
log("OK NavTutorial Skip / Got it / toggle / WelcomeGate gating");

const canvas = readFileSync(join(root, "src/components/canvas/WidgetCanvas.tsx"), "utf8");
assert.match(canvas, /Replay tour/);
assert.match(canvas, /data-testid="replay-tour"/);
assert.match(canvas, /NavTutorial/);
log("OK Replay tour on Edit widgets panel");

const page = readFileSync(join(root, "src/app/page.tsx"), "utf8");
assert.match(page, /WelcomeGate/);
assert.match(page, /HomepageScene/);
log("OK WelcomeGate still mounted on Home");

const handle = readFileSync(join(root, "src/components/canvas/DraggableWidget.tsx"), "utf8");
assert.match(handle, /widget-drag-handle-\$\{id\}/);
log("OK learning drag handle test id");

const out = join(scratch, "nav-tutorial-structural.log");
writeFileSync(out, lines.join("\n") + "\n");
log(`wrote ${out}`);
