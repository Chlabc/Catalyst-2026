import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const scratch = process.env.SCRATCH || "/tmp/grok-welcome-gate";
mkdirSync(scratch, { recursive: true });

const gate = readFileSync(join(root, "src/components/WelcomeGate.tsx"), "utf8");
assert.match(gate, /blossom_has_seen_welcome/);
assert.match(gate, /data-testid="welcome-gate"/);
assert.match(gate, /role="dialog"/);
assert.match(gate, /aria-modal="true"/);
assert.match(gate, /Enter my island/);
assert.match(gate, /Escape/);

const page = readFileSync(join(root, "src/app/page.tsx"), "utf8");
assert.match(page, /WelcomeGate/);
assert.match(page, /HomepageScene/);

const log = "OK WelcomeGate key + Home mount\n";
writeFileSync(join(scratch, "welcome-gate-structural.log"), log);
console.log(log.trim());
