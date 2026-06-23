import { Hole } from "./engine";

// Mini Golf V2 — 12-hole library.
// Each hole has fixed tee/cup (no random reset) plus metadata for the UI.
// Layouts use axis-aligned rail/wall colliders inside the 400x560 field.
// All holes are designed to be reachable by the look-ahead bot; the match
// machine also has a per-hole stroke-cap safeguard so nothing can ever stall.

export type HoleDifficulty = "Easy" | "Medium" | "Hard";

export interface HoleDef extends Hole {
  id: number;
  name: string;
  difficulty: HoleDifficulty;
  accent: string; // neon rail/glow accent for this hole
}

export const HOLES: HoleDef[] = [
  {
    id: 1,
    name: "Straight Starter",
    difficulty: "Easy",
    accent: "#39e06b",
    par: 2,
    tee: { x: 200, y: 500 },
    cup: { x: 200, y: 80 },
    walls: [],
  },
  {
    id: 2,
    name: "Bank Shot Bend",
    difficulty: "Medium",
    accent: "#33b5ff",
    par: 3,
    tee: { x: 80, y: 500 },
    cup: { x: 320, y: 80 },
    walls: [
      { x: 0, y: 300, w: 250, h: 18 },
      { x: 180, y: 150, w: 220, h: 18 },
    ],
  },
  {
    id: 3,
    name: "Narrow Bridge",
    difficulty: "Medium",
    accent: "#9b7bff",
    par: 3,
    tee: { x: 200, y: 510 },
    cup: { x: 200, y: 80 },
    walls: [
      { x: 64, y: 250, w: 18, h: 170 },
      { x: 318, y: 250, w: 18, h: 170 },
    ],
  },
  {
    id: 4,
    name: "Bumper Garden",
    difficulty: "Medium",
    accent: "#ff8a2b",
    par: 3,
    tee: { x: 200, y: 505 },
    cup: { x: 200, y: 80 },
    walls: [
      { x: 110, y: 360, w: 44, h: 44 },
      { x: 246, y: 300, w: 44, h: 44 },
      { x: 158, y: 200, w: 44, h: 44 },
    ],
  },
  {
    id: 5,
    name: "Split Path",
    difficulty: "Medium",
    accent: "#33e0c0",
    par: 3,
    tee: { x: 200, y: 510 },
    cup: { x: 200, y: 80 },
    walls: [{ x: 191, y: 200, w: 18, h: 230 }],
  },
  {
    id: 6,
    name: "Slope Drop",
    difficulty: "Medium",
    accent: "#ffce5c",
    par: 3,
    tee: { x: 90, y: 500 },
    cup: { x: 310, y: 110 },
    walls: [
      { x: 0, y: 360, w: 230, h: 18 },
      { x: 170, y: 230, w: 230, h: 18 },
    ],
  },
  {
    id: 7,
    name: "The Gate",
    difficulty: "Hard",
    accent: "#ff4d5e",
    par: 4,
    tee: { x: 200, y: 510 },
    cup: { x: 200, y: 80 },
    walls: [
      { x: 60, y: 330, w: 118, h: 18 },
      { x: 222, y: 330, w: 118, h: 18 },
      { x: 60, y: 190, w: 100, h: 18 },
      { x: 240, y: 190, w: 100, h: 18 },
    ],
  },
  {
    id: 8,
    name: "Spiral Curve",
    difficulty: "Hard",
    accent: "#19e0ff",
    par: 4,
    tee: { x: 200, y: 515 },
    cup: { x: 110, y: 130 },
    walls: [
      { x: 0, y: 380, w: 270, h: 18 },
      { x: 150, y: 250, w: 250, h: 18 },
    ],
  },
  {
    id: 9,
    name: "Island Hole",
    difficulty: "Hard",
    accent: "#34d399",
    par: 3,
    tee: { x: 200, y: 520 },
    cup: { x: 200, y: 130 },
    walls: [
      { x: 118, y: 70, w: 18, h: 120 },
      { x: 264, y: 70, w: 18, h: 120 },
      { x: 118, y: 70, w: 164, h: 18 },
    ],
  },
  {
    id: 10,
    name: "Rotator",
    difficulty: "Hard",
    accent: "#a855f7",
    par: 4,
    tee: { x: 200, y: 510 },
    cup: { x: 200, y: 90 },
    walls: [
      { x: 50, y: 330, w: 160, h: 18 },
      { x: 250, y: 230, w: 150, h: 18 },
      { x: 60, y: 160, w: 150, h: 18 },
    ],
  },
  {
    id: 11,
    name: "Multi-Bank Challenge",
    difficulty: "Hard",
    accent: "#38e1ff",
    par: 4,
    tee: { x: 72, y: 510 },
    cup: { x: 330, y: 120 },
    walls: [
      { x: 0, y: 380, w: 260, h: 18 },
      { x: 160, y: 260, w: 240, h: 18 },
      { x: 0, y: 150, w: 190, h: 18 },
    ],
  },
  {
    id: 12,
    name: "Final Arena",
    difficulty: "Hard",
    accent: "#ff5aa8",
    par: 3,
    tee: { x: 200, y: 520 },
    cup: { x: 200, y: 90 },
    walls: [
      { x: 90, y: 360, w: 52, h: 52 },
      { x: 258, y: 360, w: 52, h: 52 },
      { x: 174, y: 220, w: 52, h: 52 },
    ],
  },
];
