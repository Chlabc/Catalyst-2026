/**
 * Assert every scenarioLevels id has a map anchor, and the island asset exists.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const mapPath = join(root, "public/menstrome/c8-island-tight.png");
assert.equal(existsSync(mapPath), true, "public/menstrome/c8-island-tight.png missing");
assert.equal(
  existsSync(join(root, "public/menstrome/island-legend.png")),
  true,
  "public/menstrome/island-legend.png missing",
);

const scenariosSrc = readFileSync(join(root, "src/lib/scenarios.ts"), "utf8");
const levelsStart = scenariosSrc.indexOf("export const scenarioLevels");
assert.ok(levelsStart >= 0, "scenarioLevels export missing");
const levelsEnd = scenariosSrc.indexOf("export const comingSoonZones", levelsStart);
assert.ok(levelsEnd > levelsStart, "comingSoonZones export missing after scenarioLevels");
const levelsSrc = scenariosSrc.slice(levelsStart, levelsEnd);

const levelBlocks = [
  ...levelsSrc.matchAll(
    /id:\s*"([^"]+)"[\s\S]*?map:\s*\{\s*xPercent:\s*([\d.]+),\s*yPercent:\s*([\d.]+),\s*label:\s*"([^"]+)"\s*\}/g,
  ),
];

assert.ok(
  levelBlocks.length >= 7,
  `expected >= 7 hotspot towns, got ${levelBlocks.length}`,
);

const ids = levelBlocks.map((m) => m[1]);
assert.equal(new Set(ids).size, ids.length, "duplicate scenario ids in map anchors");

for (const match of levelBlocks) {
  const [, id, x, y, label] = match;
  const xNum = Number(x);
  const yNum = Number(y);
  assert.ok(xNum >= 0 && xNum <= 100, `${id} xPercent out of range`);
  assert.ok(yNum >= 0 && yNum <= 100, `${id} yPercent out of range`);
  assert.ok(label.length > 0, `${id} missing map label`);
}

for (const id of [
  "bloodbury",
  "cylendra",
  "cramper",
  "stainvale",
  "flowstate",
  "normain",
  "divursity",
]) {
  assert.ok(ids.includes(id), `playable town ${id} missing map anchor`);
}

const regionArts = [
  ...levelsSrc.matchAll(/regionArt:\s*"([^"]+)"/g),
].map((m) => m[1]);
assert.equal(regionArts.length, ids.length, "each level needs regionArt");
for (const art of regionArts) {
  const diskPath = join(root, "public", art.replace(/^\//, ""));
  assert.equal(existsSync(diskPath), true, `missing region art: ${art}`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      mapPath: "public/menstrome/c8-island-tight.png",
      hotspots: levelBlocks.map(([, id, x, y, label]) => ({
        id,
        xPercent: Number(x),
        yPercent: Number(y),
        label,
      })),
      regionArts,
    },
    null,
    2,
  ),
);
