"use client";

import { useState } from "react";
import {
  CyclePlant,
  type CyclePlantPhase,
} from "@/components/canvas/CyclePlant";
import styles from "./CyclePlantGallery.module.css";

type PreviewTheme = "neutral" | "beach" | "macaron";

type PlantPreview = {
  name: string;
  phase: CyclePlantPhase;
  follicularProgress: number;
  visiblePetals: number;
  fallingPetal: number | null;
  fallenPetals: number;
  detail: string;
};

const follicularPreviews: PlantPreview[] = [
  {
    name: "Early follicular",
    phase: "follicular",
    follicularProgress: 0.2,
    visiblePetals: 0,
    fallingPetal: null,
    fallenPetals: 0,
    detail: "Growth progress 20%",
  },
  {
    name: "Mid follicular",
    phase: "follicular",
    follicularProgress: 0.52,
    visiblePetals: 0,
    fallingPetal: null,
    fallenPetals: 0,
    detail: "Growth progress 52%",
  },
  {
    name: "Late follicular / bud",
    phase: "follicular",
    follicularProgress: 0.86,
    visiblePetals: 0,
    fallingPetal: null,
    fallenPetals: 0,
    detail: "Growth progress 86%",
  },
];

const maturePreviews: PlantPreview[] = [
  {
    name: "Ovulation / full bloom",
    phase: "ovulation",
    follicularProgress: 1,
    visiblePetals: 7,
    fallingPetal: null,
    fallenPetals: 0,
    detail: "7 visible petals",
  },
  {
    name: "Luteal",
    phase: "luteal",
    follicularProgress: 1,
    visiblePetals: 7,
    fallingPetal: null,
    fallenPetals: 0,
    detail: "7 visible petals · subtle tilt",
  },
];

const menstrualPreviews: PlantPreview[] = Array.from({ length: 7 }, (_, index) => {
  const day = index + 1;
  const visiblePetals = 8 - day;
  return {
    name: `Menstrual day ${day}`,
    phase: "menstrual",
    follicularProgress: 1,
    visiblePetals,
    fallingPetal: day === 1 ? null : visiblePetals,
    fallenPetals: day - 1,
    detail: `${visiblePetals} visible petal${visiblePetals === 1 ? "" : "s"}`,
  };
});

const previews = [...follicularPreviews, ...maturePreviews, ...menstrualPreviews];

export function CyclePlantGallery() {
  const [theme, setTheme] = useState<PreviewTheme>("neutral");

  return (
    <section className={`${styles.page} ${styles[theme]}`}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Development preview</p>
          <h1 className={styles.title}>Cycle Plant lifecycle</h1>
          <p className={styles.intro}>
            Fixed visual states only. This page does not read or write Tracker data or localStorage.
          </p>
        </div>

        <div className={styles.themePicker} aria-label="Preview background">
          <span>Background</span>
          <div className={styles.themeOptions}>
            {(["neutral", "beach", "macaron"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={theme === option}
                onClick={() => setTheme(option)}
              >
                {option[0].toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {previews.map((preview) => (
          <article key={preview.name} className={styles.preview}>
            <div className={styles.plantFrame}>
              <CyclePlant
                phase={preview.phase}
                follicularProgress={preview.follicularProgress}
                visiblePetals={preview.visiblePetals}
                fallingPetal={preview.fallingPetal}
                fallenPetals={preview.fallenPetals}
              />
            </div>
            <div className={styles.caption}>
              <h2>{preview.name}</h2>
              <p>{preview.detail}</p>
              <span>Phase: {preview.phase}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
