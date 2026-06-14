import { Hole } from "./engine";

// Three fixed holes. Tee and cup positions are constant per hole (no random reset).
export const HOLES: Hole[] = [
  {
    par: 2,
    tee: { x: 200, y: 500 },
    cup: { x: 200, y: 70 },
    walls: [
      { x: 90, y: 250, w: 90, h: 18 },
      { x: 220, y: 250, w: 90, h: 18 },
    ],
  },
  {
    par: 3,
    tee: { x: 80, y: 500 },
    cup: { x: 320, y: 80 },
    walls: [
      { x: 0, y: 300, w: 250, h: 18 },
      { x: 180, y: 150, w: 220, h: 18 },
    ],
  },
  {
    par: 3,
    tee: { x: 200, y: 510 },
    cup: { x: 200, y: 70 },
    walls: [
      { x: 90, y: 380, w: 220, h: 18 },
      { x: 90, y: 200, w: 18, h: 120 },
      { x: 292, y: 200, w: 18, h: 120 },
    ],
  },
];
