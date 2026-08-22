"use client";

import { Greeting } from "@/components/Greeting";
import {
  useBlossomTheme,
  type BlossomTheme,
} from "@/components/theme/BlossomThemeProvider";
import { WidgetCanvas } from "./WidgetCanvas";
import styles from "./WidgetCanvas.module.css";

export function HomepageScene() {
  const { theme: scene, setTheme } = useBlossomTheme();

  function chooseScene(nextScene: BlossomTheme) {
    setTheme(nextScene);
  }

  return (
    <section
      className={`${styles.scene} ${scene === "beach" ? styles.beach : styles.macaron}`}
      aria-label="Your cycle space"
    >
      <div className={styles.shell}>
        <div className={styles.sceneHeader}>
          <div className={styles.greeting}>
            <Greeting />
            <p className="mt-1 text-sm text-foreground/70 sm:text-base">
              Here&apos;s your cycle space today.
            </p>
          </div>

          <div className={styles.scenePicker} aria-label="Change scene">
            <span className="text-xs font-semibold text-foreground/65">Change scene</span>
            <div className="flex gap-1 rounded-full bg-white/50 p-1">
              {(["beach", "macaron"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={scene === option}
                  onClick={() => chooseScene(option)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${scene === option ? "bg-surface text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground"}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        <WidgetCanvas />
      </div>
    </section>
  );
}
