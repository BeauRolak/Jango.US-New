import { Hole } from "./engine";

// Mini Golf V2 — 12 themed holes ("different worlds").
// Each has fixed tee/cup (no random reset), AABB rail/wall colliders, optional
// friction zones (ice slides, sand/water drags), plus visual theme metadata.
// All holes are tuned to stay sinkable by the look-ahead bot; the match machine
// also has a per-hole stroke-cap safeguard so nothing can stall.

export type HoleDifficulty = "Easy" | "Medium" | "Hard";
export type HoleTheme =
  | "classic" | "arcade" | "space" | "volcano" | "ice" | "jungle"
  | "casino" | "cyber" | "desert" | "sky" | "underwater" | "final";

export interface HoleDef extends Hole {
  id: number;
  name: string;
  theme: HoleTheme;
  difficulty: HoleDifficulty;
  accent: string; // neon rail/glow accent for this hole
}

export const HOLES: HoleDef[] = [
  {
    id: 1, name: "Classic Turf", theme: "classic", difficulty: "Easy", accent: "#39e06b",
    par: 2, tee: { x: 200, y: 500 }, cup: { x: 200, y: 90 },
    walls: [{ x: 170, y: 300, w: 60, h: 18 }],
  },
  {
    id: 2, name: "Neon Arcade", theme: "arcade", difficulty: "Medium", accent: "#c77dff",
    par: 3, tee: { x: 200, y: 505 }, cup: { x: 200, y: 84 },
    walls: [
      { x: 108, y: 360, w: 44, h: 44 },
      { x: 248, y: 300, w: 44, h: 44 },
      { x: 158, y: 200, w: 44, h: 44 },
    ],
  },
  {
    id: 3, name: "Outer Space", theme: "space", difficulty: "Medium", accent: "#7c9bff",
    par: 3, tee: { x: 200, y: 520 }, cup: { x: 200, y: 120 },
    walls: [
      { x: 118, y: 60, w: 18, h: 110 },
      { x: 264, y: 60, w: 18, h: 110 },
      { x: 118, y: 60, w: 164, h: 18 },
    ],
    zones: [{ x: 0, y: 190, w: 400, h: 370, friction: 0.993 }],
  },
  {
    id: 4, name: "Volcano Run", theme: "volcano", difficulty: "Hard", accent: "#ff5a2c",
    par: 4, tee: { x: 70, y: 505 }, cup: { x: 320, y: 110 },
    walls: [
      { x: 0, y: 372, w: 250, h: 18 },
      { x: 150, y: 244, w: 250, h: 18 },
      { x: 170, y: 130, w: 70, h: 22 },
    ],
    zones: [{ x: 250, y: 372, w: 150, h: 80, friction: 0.962 }],
  },
  {
    id: 5, name: "Glacier Slide", theme: "ice", difficulty: "Medium", accent: "#6fe0ff",
    par: 3, tee: { x: 200, y: 515 }, cup: { x: 200, y: 96 },
    walls: [
      { x: 86, y: 300, w: 64, h: 18 },
      { x: 250, y: 300, w: 64, h: 18 },
    ],
    zones: [{ x: 36, y: 120, w: 328, h: 360, friction: 0.994 }],
  },
  {
    id: 6, name: "Jungle Bridge", theme: "jungle", difficulty: "Medium", accent: "#4ade80",
    par: 3, tee: { x: 200, y: 515 }, cup: { x: 200, y: 90 },
    walls: [
      { x: 64, y: 250, w: 18, h: 180 },
      { x: 318, y: 250, w: 18, h: 180 },
    ],
    zones: [{ x: 120, y: 300, w: 160, h: 130, friction: 0.966 }],
  },
  {
    id: 7, name: "High Roller", theme: "casino", difficulty: "Medium", accent: "#ffce5c",
    par: 3, tee: { x: 200, y: 510 }, cup: { x: 200, y: 86 },
    walls: [{ x: 191, y: 196, w: 18, h: 234 }],
  },
  {
    id: 8, name: "Cyber Grid", theme: "cyber", difficulty: "Hard", accent: "#19e0ff",
    par: 4, tee: { x: 200, y: 510 }, cup: { x: 200, y: 80 },
    walls: [
      { x: 60, y: 330, w: 118, h: 18 },
      { x: 222, y: 330, w: 118, h: 18 },
      { x: 60, y: 190, w: 100, h: 18 },
      { x: 240, y: 190, w: 100, h: 18 },
    ],
  },
  {
    id: 9, name: "Desert Canyon", theme: "desert", difficulty: "Hard", accent: "#e6a23c",
    par: 4, tee: { x: 72, y: 510 }, cup: { x: 330, y: 120 },
    walls: [
      { x: 0, y: 380, w: 260, h: 18 },
      { x: 160, y: 256, w: 240, h: 18 },
      { x: 0, y: 144, w: 190, h: 18 },
    ],
    zones: [{ x: 200, y: 398, w: 200, h: 120, friction: 0.965 }],
  },
  {
    id: 10, name: "Sky Temple", theme: "sky", difficulty: "Hard", accent: "#8ec5ff",
    par: 3, tee: { x: 200, y: 520 }, cup: { x: 200, y: 122 },
    walls: [
      { x: 118, y: 70, w: 18, h: 120 },
      { x: 264, y: 70, w: 18, h: 120 },
      { x: 118, y: 70, w: 164, h: 18 },
      { x: 150, y: 330, w: 100, h: 18 },
    ],
  },
  {
    id: 11, name: "Coral Deep", theme: "underwater", difficulty: "Medium", accent: "#2dd4bf",
    par: 3, tee: { x: 200, y: 520 }, cup: { x: 200, y: 92 },
    walls: [
      { x: 116, y: 360, w: 44, h: 44 },
      { x: 244, y: 250, w: 44, h: 44 },
    ],
    zones: [{ x: 0, y: 110, w: 400, h: 450, friction: 0.966 }],
  },
  {
    id: 12, name: "Final Arena", theme: "final", difficulty: "Hard", accent: "#ff3d6e",
    par: 4, tee: { x: 200, y: 520 }, cup: { x: 200, y: 86 },
    walls: [
      { x: 0, y: 392, w: 262, h: 18 },
      { x: 150, y: 268, w: 250, h: 18 },
      { x: 168, y: 150, w: 64, h: 24 },
      { x: 70, y: 452, w: 44, h: 44 },
    ],
  },
];
