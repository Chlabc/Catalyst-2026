import { pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export async function resolve(specifier, context, nextResolve) {
  let nextSpecifier = specifier;
  if (specifier.startsWith("@/")) {
    nextSpecifier = pathToFileURL(join(root, "src", specifier.slice(2))).href;
  }
  try {
    return await nextResolve(nextSpecifier, context);
  } catch (error) {
    if (typeof nextSpecifier === "string" && !nextSpecifier.endsWith(".ts")) {
      try {
        return await nextResolve(`${nextSpecifier}.ts`, context);
      } catch {
        throw error;
      }
    }
    throw error;
  }
}
