/**
 * Drives the shipped selectSceneBackdrop helper used by TrackerShell / HomepageScene.
 * Run: node --experimental-strip-types --experimental-transform-types scripts/check-scene-backdrop.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const helperUrl = pathToFileURL(
  join(root, "src/components/theme/selectSceneBackdrop.ts"),
).href;

const { selectSceneBackdrop, sceneBackdropClassName } = await import(helperUrl);

const beach = selectSceneBackdrop("beach", "backdrop");
const macaron = selectSceneBackdrop("macaron", "backdrop");

assert.equal(beach.themeKey, "beach");
assert.equal(macaron.themeKey, "macaron");
assert.notEqual(beach.themeKey, macaron.themeKey);
assert.deepEqual(beach.classKeys, ["backdrop", "beach"]);
assert.deepEqual(macaron.classKeys, ["backdrop", "macaron"]);
assert.equal(beach.opaquePageFill, null);
assert.equal(macaron.opaquePageFill, null);

const styles = {
  backdrop: "SceneBackdrop_backdrop",
  beach: "SceneBackdrop_beach",
  macaron: "SceneBackdrop_macaron",
  scene: "SceneBackdrop_scene",
};

const beachClass = sceneBackdropClassName(styles, beach);
const macaronClass = sceneBackdropClassName(styles, macaron);

assert.match(beachClass, /SceneBackdrop_backdrop/);
assert.match(beachClass, /SceneBackdrop_beach/);
assert.doesNotMatch(beachClass, /FFF7FB|fff7fb/);
assert.match(macaronClass, /SceneBackdrop_macaron/);
assert.notEqual(beachClass, macaronClass);

const homeBeach = selectSceneBackdrop("beach", "scene");
assert.deepEqual(homeBeach.classKeys, ["scene", "beach"]);

// Structural: TrackerShell must not paint opaque full-page #FFF7FB wrappers.
const shellSource = readFileSync(
  join(root, "src/app/tracker/_components/TrackerShell.tsx"),
  "utf8",
);
assert.match(shellSource, /selectSceneBackdrop/);
assert.match(shellSource, /data-testid="tracker-scene-backdrop"/);
assert.match(shellSource, /data-blossom-scene=\{backdrop\.themeKey\}/);
assert.doesNotMatch(
  shellSource,
  /className="min-h-screen w-screen overflow-x-hidden bg-\[#FFF7FB\]/,
);
assert.doesNotMatch(
  shellSource,
  /min-h-screen w-screen max-w-full bg-\[#FFF7FB\]/,
);

console.log("OK selectSceneBackdrop beach/macaron distinct; TrackerShell uses shared scene backdrop (no opaque #FFF7FB page fill)");
