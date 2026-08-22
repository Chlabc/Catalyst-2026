import type { CSSProperties } from "react";
import styles from "./CyclePlant.module.css";

export type CyclePlantPhase = "menstrual" | "follicular" | "ovulation" | "luteal";

const PETALS = [
  { angle: -3, scaleX: 0.96, scaleY: 1.04, path: "M160 98 C143 82 143 43 160 25 C179 44 178 82 160 98Z" },
  { angle: 48, scaleX: 1.02, scaleY: 0.96, path: "M160 98 C141 83 145 45 162 27 C180 45 177 81 160 98Z" },
  { angle: 100, scaleX: 0.94, scaleY: 1.01, path: "M160 98 C144 80 142 46 158 24 C177 42 179 81 160 98Z" },
  { angle: 153, scaleX: 1.04, scaleY: 0.94, path: "M160 98 C140 84 144 47 161 26 C181 47 176 83 160 98Z" },
  { angle: 205, scaleX: 0.97, scaleY: 1.03, path: "M160 98 C143 80 146 41 161 25 C177 43 179 82 160 98Z" },
  { angle: 256, scaleX: 1.03, scaleY: 0.97, path: "M160 98 C141 81 142 46 159 27 C180 45 178 81 160 98Z" },
  { angle: 308, scaleX: 0.95, scaleY: 1.02, path: "M160 98 C145 82 142 44 160 23 C178 44 176 83 160 98Z" },
];

const FALLEN_PETALS = [
  { x: 93, y: 319, angle: -19, scale: 0.7 },
  { x: 190, y: 329, angle: 16, scale: 0.64 },
  { x: 123, y: 337, angle: 9, scale: 0.58 },
  { x: 213, y: 313, angle: -29, scale: 0.66 },
  { x: 151, y: 330, angle: 26, scale: 0.61 },
  { x: 76, y: 333, angle: -7, scale: 0.57 },
];

export function CyclePlant({
  phase,
  follicularProgress,
  visiblePetals,
  fallingPetal,
  fallenPetals,
}: {
  phase: CyclePlantPhase;
  follicularProgress: number;
  visiblePetals: number;
  fallingPetal: number | null;
  fallenPetals: number;
}) {
  const flowerOpen = phase !== "follicular";
  // Stem dash-offset is a follicular grow-in. An open bloom (period / ovulate /
  // luteal) must use a full stem — otherwise Day 1 looks like a floating head.
  const progress = flowerOpen
    ? 1
    : Math.max(0.16, Math.min(follicularProgress, 1));
  const petalCount = flowerOpen ? Math.max(0, Math.min(visiblePetals, 7)) : 0;
  const fallenCount = phase === "menstrual" ? Math.max(0, Math.min(fallenPetals, 7)) : 0;
  const luteal = phase === "luteal";
  const stemPath = luteal
    ? "M160 319 C149 277 166 239 157 199 C151 169 170 143 190 122"
    : "M160 319 C149 277 165 238 156 199 C149 166 166 136 160 104";
  const stemHighlightPath = luteal
    ? "M158 319 C153 273 168 226 161 185 C158 157 175 135 191 123"
    : "M158 319 C153 272 168 225 160 184 C156 153 168 126 162 106";

  return (
    <svg
      viewBox="0 0 320 360"
      role="img"
      aria-label={`${phase} cycle plant`}
      className={styles.plant}
    >
      <defs>
        <linearGradient id="cycle-stem" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4f9864" />
          <stop offset="0.55" stopColor="#70b56f" />
          <stop offset="1" stopColor="#3f8058" />
        </linearGradient>
        <linearGradient id="cycle-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9dcc78" />
          <stop offset="1" stopColor="#4f9463" />
        </linearGradient>
        <linearGradient id="cycle-petal" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#fffdf3" />
          <stop offset="0.62" stopColor="#fff8e9" />
          <stop offset="1" stopColor="#f7d9da" />
        </linearGradient>
        <radialGradient id="cycle-centre" cx="38%" cy="32%" r="70%">
          <stop offset="0" stopColor="#ffe58a" />
          <stop offset="0.55" stopColor="#f7bf43" />
          <stop offset="1" stopColor="#dd8f2f" />
        </radialGradient>
        <filter id="cycle-soft-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#765b49" floodOpacity="0.18" />
        </filter>
      </defs>

      <g data-part="ground">
        <ellipse cx="160" cy="328" rx="75" ry="14" fill="#d6aa78" opacity="0.2" />
        <path d="M77 326 C102 307 130 316 148 308 C174 296 203 308 241 327 C214 340 108 343 77 326Z" fill="#efd2a0" />
        <path d="M92 328 C118 319 139 325 160 318 C188 311 214 320 230 329 C195 334 126 337 92 328Z" fill="#f8e3bd" />
        <ellipse cx="118" cy="318" rx="17" ry="11" fill="#b98c78" transform="rotate(-12 118 318)" />
        <ellipse cx="203" cy="322" rx="15" ry="9" fill="#c79d83" transform="rotate(9 203 322)" />
        <ellipse cx="151" cy="325" rx="9" ry="6" fill="#a97f70" />
        <circle cx="180" cy="316" r="6" fill="#d7b294" />
      </g>

      {FALLEN_PETALS.slice(0, fallenCount).map((petal, index) => (
        <g
          key={`fallen-${index}`}
          data-part={`fallen-petal-${index + 1}`}
          className={styles.settledPetal}
          style={{ "--settle-delay": `${index * 90}ms` } as CSSProperties}
          transform={`translate(${petal.x} ${petal.y}) rotate(${petal.angle}) scale(${petal.scale})`}
        >
          <path d="M0 0 C8 -8 23 -6 30 2 C21 11 8 12 0 0Z" fill="url(#cycle-petal)" stroke="#eebdbd" strokeWidth="1.4" />
          <path d="M5 1 C12 -1 19 0 26 3" fill="none" stroke="#f4c9cc" strokeWidth="1.5" opacity="0.7" />
        </g>
      ))}

      <g className={`${styles.sway} ${luteal ? styles.lutealPosture : ""}`}>
        <path
          data-part="stem"
          d={stemPath}
          fill="none"
          stroke="url(#cycle-stem)"
          strokeWidth="10"
          strokeLinecap="round"
          pathLength="1"
          className={styles.stem}
          style={{ "--growth": progress } as CSSProperties}
        />
        <path
          d={stemHighlightPath}
          fill="none"
          stroke="#c9dc7d"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.7"
          pathLength="1"
          className={styles.stem}
          style={{ "--growth": progress } as CSSProperties}
        />

        <g data-part="leaves" className={styles.leaves}>
          <g className={styles.youngLeaf} style={{ "--leaf-visible": progress > 0.16 ? 1 : 0 } as CSSProperties}>
            <path d="M158 294 C145 282 132 284 126 292 C136 301 147 304 158 300Z" fill="url(#cycle-leaf)" />
            <path d="M154 298 C145 294 137 292 130 292" fill="none" stroke="#397b55" strokeWidth="1.5" strokeLinecap="round" opacity="0.58" />
          </g>
          <g className={styles.leaf} style={{ "--leaf-visible": progress > 0.28 ? 1 : 0 } as CSSProperties}>
            <path d="M157 263 C128 235 94 237 77 253 C100 273 128 283 157 272Z" fill="url(#cycle-leaf)" />
            <path d="M151 268 C127 257 106 252 84 253" fill="none" stroke="#397b55" strokeWidth="2" strokeLinecap="round" opacity="0.62" />
          </g>
          <g className={styles.leaf} style={{ "--leaf-visible": progress > 0.48 ? 1 : 0 } as CSSProperties}>
            <path d="M160 229 C182 202 216 194 237 211 C216 231 190 244 161 239Z" fill="url(#cycle-leaf)" />
            <path d="M166 233 C189 220 210 212 230 212" fill="none" stroke="#397b55" strokeWidth="2" strokeLinecap="round" opacity="0.62" />
          </g>
          <g className={styles.leaf} style={{ "--leaf-visible": progress > 0.64 ? 1 : 0 } as CSSProperties}>
            <path d="M158 181 C137 159 114 158 102 169 C117 188 136 196 158 191Z" fill="url(#cycle-leaf)" />
            <path d="M154 186 C137 176 122 171 108 170" fill="none" stroke="#397b55" strokeWidth="1.7" strokeLinecap="round" opacity="0.58" />
          </g>
        </g>

        {phase === "follicular" && (
          <g
            data-part="bud"
            className={styles.bud}
            style={{ "--bud-visible": progress > 0.7 ? 1 : 0 } as CSSProperties}
          >
            <path d="M151 109 C144 94 148 74 161 66 C174 77 176 95 166 109Z" fill="#fff5e4" stroke="#efb9b8" strokeWidth="2" />
            <path d="M151 107 C153 92 156 78 161 68 C162 85 164 98 166 108Z" fill="#f5c7ca" opacity="0.65" />
            <path d="M148 111 C154 116 166 116 171 108" fill="none" stroke="#43845b" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        <g
          className={`${styles.bloom} ${luteal ? styles.luteal : ""}`}
          filter="url(#cycle-soft-shadow)"
          aria-hidden={!flowerOpen}
        >
          {PETALS.map((petal, index) => {
            const visible = index < petalCount;
            const falling = phase === "menstrual" && fallingPetal === index;
            return (
              <g
                key={index}
                data-part={`petal-${index + 1}`}
                className={`${styles.petal} ${luteal ? styles.lutealPetal : ""} ${visible ? styles.petalVisible : styles.petalHidden} ${falling ? styles.petalFalling : ""}`}
                style={{
                  "--petal-angle": `${petal.angle}deg`,
                  "--petal-scale-x": petal.scaleX,
                  "--petal-scale-y": petal.scaleY,
                  "--petal-drift": `${index % 2 === 0 ? -18 - index * 2 : 14 + index * 2}px`,
                } as CSSProperties}
              >
                <path d={petal.path} fill="url(#cycle-petal)" stroke="#efb9b8" strokeWidth="2" />
                <path d="M160 94 C154 76 155 52 161 34 C164 56 166 76 160 94Z" fill="#f6c8cb" opacity="0.48" />
                <path d="M153 88 C151 69 153 49 160 30" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.62" />
              </g>
            );
          })}

          <g data-part="flower-centre" className={flowerOpen ? styles.centreVisible : styles.centreHidden}>
            <circle cx="160" cy="100" r="29" fill="url(#cycle-centre)" stroke="#da8d2b" strokeWidth="2" />
            {[
              [151, 91, 3.4], [163, 86, 3], [172, 96, 3.8], [148, 104, 3],
              [160, 102, 3.6], [170, 110, 2.8], [156, 116, 3.2],
            ].map(([cx, cy, radius], index) => (
              <circle key={index} cx={cx} cy={cy} r={radius} fill="#ffe27a" opacity="0.8" />
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
}
