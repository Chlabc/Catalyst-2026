"use client";

import type { ReactNode } from "react";
import { useBlossomTheme } from "@/components/theme/BlossomThemeProvider";
import {
  sceneBackdropClassName,
  selectSceneBackdrop,
} from "@/components/theme/selectSceneBackdrop";
import sceneStyles from "@/components/theme/SceneBackdrop.module.css";

/**
 * Full-page Beach/Macaron scene wash shared across tracker, learn, library,
 * and find-help. Theme comes from the homepage picker (blossom_home_scene).
 */
export function SceneBackdropFrame({
  children,
  className = "",
  testId,
}: {
  children: ReactNode;
  className?: string;
  testId?: string;
}) {
  const { theme } = useBlossomTheme();
  const backdrop = selectSceneBackdrop(theme, "backdrop");

  return (
    <div
      className={`${sceneBackdropClassName(sceneStyles, backdrop)} w-full overflow-x-hidden ${className}`.trim()}
      data-testid={testId}
      data-blossom-scene={backdrop.themeKey}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
