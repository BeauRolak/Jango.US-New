// Bowling lane themes. The renderer is data-driven off these objects so new
// lanes can be added by appending one entry — no rendering changes required.
// Neon Night is the default Jango lane.

export interface LaneTheme {
  id: string;
  name: string;
  tag: string;        // short setup-card descriptor
  accent: string;     // drives GameShell setup/result theming
  bg: [string, string, string];     // backdrop gradient near->far
  lane: [string, string, string];   // lane surface gradient near->far
  gutter: [string, string];         // gutter trough gradient near->far
  railL: string;      // left neon rail / glow
  railR: string;      // right neon rail / glow
  arrow: string;      // lane arrow color
  boards: string;     // board-line color
  grain: string;      // wood-grain streak color
  aimLine: string;    // aim preview color
  ball: [string, string];   // ball highlight -> core
  pin: string;        // pin body tint
  band: string;       // pin neck band
  bokeh: string;      // ambient particle color
  wallGlow: string;   // back-wall scoreboard glow
}

export const LANE_THEMES: Record<string, LaneTheme> = {
  neon: {
    id: 'neon', name: 'Neon Night', tag: 'Default',
    accent: '#5b8cff',
    bg: ['#160a2e', '#0a0a1e', '#06060f'],
    lane: ['#3a2c5e', '#2c2350', '#161433'],
    gutter: ['#0a0a18', '#05050c'],
    railL: '#21e6ff', railR: '#ff3df0',
    arrow: 'rgba(255,200,120,0.9)', boards: 'rgba(120,140,255,0.14)', grain: 'rgba(150,170,255,0.20)',
    aimLine: 'rgba(120,220,255,0.85)',
    ball: ['#9fd0ff', '#1f5fd0'], pin: '#f4f8ff', band: '#ff4d5e',
    bokeh: 'rgba(120,160,255,0.10)', wallGlow: 'rgba(80,180,255,0.14)',
  },
  wood: {
    id: 'wood', name: 'Classic Wood', tag: 'Realistic',
    accent: '#e0a14a',
    bg: ['#1c130a', '#120c06', '#080503'],
    lane: ['#9a6a30', '#7a5226', '#3a2814'],
    gutter: ['#1a120a', '#0c0805'],
    railL: '#ffcf8a', railR: '#ffae5c',
    arrow: 'rgba(60,40,20,0.8)', boards: 'rgba(0,0,0,0.22)', grain: 'rgba(255,220,170,0.18)',
    aimLine: 'rgba(255,210,150,0.85)',
    ball: ['#ffd9a0', '#b8531c'], pin: '#fff8ee', band: '#d8392f',
    bokeh: 'rgba(255,210,150,0.08)', wallGlow: 'rgba(255,190,120,0.12)',
  },
  cosmic: {
    id: 'cosmic', name: 'Cosmic Bowl', tag: 'Galaxy',
    accent: '#a77bff',
    bg: ['#1a0b3a', '#0b0626', '#040210'],
    lane: ['#2a1a55', '#1d1247', '#0d0826'],
    gutter: ['#0a0620', '#040210'],
    railL: '#7b5bff', railR: '#22e3c0',
    arrow: 'rgba(190,160,255,0.9)', boards: 'rgba(160,120,255,0.16)', grain: 'rgba(190,160,255,0.22)',
    aimLine: 'rgba(180,150,255,0.9)',
    ball: ['#d9c3ff', '#5b2fd0'], pin: '#f3ecff', band: '#22e3c0',
    bokeh: 'rgba(190,160,255,0.14)', wallGlow: 'rgba(140,100,255,0.16)',
  },
};
