import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import type { TrackerState } from "../_types/tracker";
import { emptyTrackerState, normalizeTrackerState } from "./storage";

/**
 * Dev-only optional cache. Gitignored. Writable in `next dev`, not on Vercel.
 * Client code must treat localStorage as the real store — never let this file
 * overwrite a visitor's logs.
 */
const STORE_PATH = path.join(
  process.cwd(),
  "src",
  "app",
  "tracker",
  "_data",
  "tracker-state.json",
);

let writeQueue = Promise.resolve();

export async function readServerTrackerState(): Promise<TrackerState> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");

    return normalizeTrackerState(JSON.parse(raw));
  } catch {
    return emptyTrackerState;
  }
}

export async function writeServerTrackerState(
  state: TrackerState,
): Promise<TrackerState> {
  const normalized = normalizeTrackerState(state);
  const write = writeQueue.then(async () => {
    const directory = path.dirname(STORE_PATH);
    const temporaryPath = path.join(
      directory,
      `.tracker-state-${process.pid}-${Date.now()}.tmp`,
    );

    await mkdir(directory, { recursive: true });
    await writeFile(
      temporaryPath,
      `${JSON.stringify(normalized, null, 2)}\n`,
      "utf8",
    );
    await rename(temporaryPath, STORE_PATH);

    return normalized;
  });

  writeQueue = write.then(
    () => undefined,
    () => undefined,
  );

  return write;
}
