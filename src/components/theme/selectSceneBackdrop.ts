import type { BlossomTheme } from "./BlossomThemeProvider";

/** Semantic class keys mapped onto SceneBackdrop.module.css by callers. */
export type SceneBackdropClassKey = "backdrop" | "scene" | "beach" | "macaron";

export type SceneBackdropSelection = {
  theme: BlossomTheme;
  /** Root layout key: scrollable page (`backdrop`) vs clipped homepage (`scene`). */
  layoutKey: "backdrop" | "scene";
  /** Theme wash key — always distinct for beach vs macaron. */
  themeKey: "beach" | "macaron";
  /**
   * Full-page opaque pink fill used by the pre-fix Aira TrackerShell.
   * Always null once the shared scene backdrop is applied.
   */
  opaquePageFill: null;
  classKeys: readonly [SceneBackdropClassKey, SceneBackdropClassKey];
};

/**
 * Pure theme → tracker/homepage backdrop selection.
 * Tracker uses `layout: "backdrop"` (allows scrolling); homepage uses `"scene"`.
 */
export function selectSceneBackdrop(
  theme: BlossomTheme,
  layout: "backdrop" | "scene" = "backdrop",
): SceneBackdropSelection {
  const themeKey = theme === "macaron" ? "macaron" : "beach";
  return {
    theme: themeKey,
    layoutKey: layout,
    themeKey,
    opaquePageFill: null,
    classKeys: [layout, themeKey],
  };
}

/** Join CSS-module class strings for a backdrop selection. */
export function sceneBackdropClassName(
  styles: Record<string, string>,
  selection: SceneBackdropSelection,
): string {
  return selection.classKeys.map((key) => styles[key]).filter(Boolean).join(" ");
}
