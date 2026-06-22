// Game Visual Identity map for Jango.US — dynamic art direction per game.
// Each game owns colors, gradient, motif, motion, tagline used by the dynamic art system.

export type GameMotif =
  | 'turf' | 'grid' | 'felt' | 'rink' | 'board' | 'versus' | 'dots'
  | 'lane' | 'court' | 'field' | 'tower' | 'blocks' | 'cyber' | 'cups' | 'speed';

export interface GameArt {
  id: string;
  name: string;
  icon: string;
  /** Optional real poster art asset (e.g. /game-posters/pool.webp). When set, it layers over the cinematic SVG fallback. */
  poster?: string;
  artDirection?: string;
  category: string;
  tagline: string;
  sub: string;
  primary: string;
  secondary: string;
  accent: string;
  motif: GameMotif;
  motion: string;
  entry: number;
  difficulty: string;
  gradient: string;
  glow: string;
}

export const GAME_ART: Record<string, GameArt> = {
  'minigolf': {
    artDirection: "Neon night mini golf course, low-angle perspective, glowing course rails, premium turf grain texture, ball motion trail curving toward a lit cup in the foreground, obstacle silhouettes mid-ground, purple-blue arcade lighting with soft haze and cinematic depth-of-field.",
    id: 'minigolf',
    name: "Mini Golf",
    icon: 'Target',
    category: 'Sports',
    tagline: "Precision pays.",
    sub: "Read the green, sink the cup.",
    primary: '#39e06b',
    secondary: '#0a3a1f',
    accent: '#aef7b0',
    motif: 'turf',
    motion: 'roll',
    entry: 5,
    difficulty: 'Easy',
    gradient: "radial-gradient(120% 120% at 18% 12%, #39e06b22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #aef7b01f 0%, transparent 52%), linear-gradient(135deg, #0a3a1f 0%, #05060c 100%)",
    glow: "0 0 0 1px #39e06b38, 0 18px 60px -18px #39e06b66",
  },
  'connect4': {
    artDirection: "Backlit Connect Four grid standing in a dark arcade, glossy discs dropping with motion blur, glowing rim light through the empty holes, reflective floor, teal-and-amber neon, dramatic side spotlight and atmospheric depth.",
    id: 'connect4',
    name: "Connect Four",
    icon: 'Dice',
    category: 'Board',
    tagline: "Stack the win.",
    sub: "Four in a row, every angle.",
    primary: '#ffcb2e',
    secondary: '#1a2a6e',
    accent: '#ff5470',
    motif: 'grid',
    motion: 'drop',
    entry: 5,
    difficulty: 'Easy',
    gradient: "radial-gradient(120% 120% at 18% 12%, #ffcb2e22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #ff54701f 0%, transparent 52%), linear-gradient(135deg, #1a2a6e 0%, #05060c 100%)",
    glow: "0 0 0 1px #ffcb2e38, 0 18px 60px -18px #ffcb2e66",
  },
  '8ball': {
    artDirection: "Luxury pool table under a dramatic overhead lamp, rich green felt texture, polished rails, balls with realistic specular highlights and soft contact shadows, cue stick angled into frame, dark smoky billiard-hall background with bokeh.",
    id: '8ball',
    name: "8-Ball Pool",
    icon: 'Trophy',
    category: 'Sports',
    tagline: "Line up the shot.",
    sub: "Cue control, clean break.",
    primary: '#19a974',
    secondary: '#06120c',
    accent: '#f5d76e',
    motif: 'felt',
    motion: 'cue',
    entry: 10,
    difficulty: 'Medium',
    gradient: "radial-gradient(120% 120% at 18% 12%, #19a97422 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #f5d76e1f 0%, transparent 52%), linear-gradient(135deg, #06120c 0%, #05060c 100%)",
    glow: "0 0 0 1px #19a97438, 0 18px 60px -18px #19a97466",
  },
  'airhockey': {
    artDirection: "Arcade air hockey table in steep perspective, glowing blue and red rail edges, puck with a streaking motion trail, paddle shadows on a reflective playfield, neon goal slots, dark arena with light reflections.",
    id: 'airhockey',
    name: "Air Hockey",
    icon: 'Bolt',
    category: 'Arcade',
    tagline: "Own the table.",
    sub: "Fast hands, faster puck.",
    primary: '#33b5ff',
    secondary: '#0a1b3a',
    accent: '#ff4d5e',
    motif: 'rink',
    motion: 'puck',
    entry: 5,
    difficulty: 'Medium',
    gradient: "radial-gradient(120% 120% at 18% 12%, #33b5ff22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #ff4d5e1f 0%, transparent 52%), linear-gradient(135deg, #0a1b3a 0%, #05060c 100%)",
    glow: "0 0 0 1px #33b5ff38, 0 18px 60px -18px #33b5ff66",
  },
  'chess': {
    artDirection: "Dark luxury chess arena, sculpted 3D king and queen catching rim light, board receding in perspective, glowing legal-move squares, single dramatic spotlight, blue-purple edge lighting, deep cinematic shadows.",
    id: 'chess',
    name: "Chess",
    icon: 'Crown',
    category: 'Board',
    tagline: "Outthink the arena.",
    sub: "Every move is a wager.",
    primary: '#9b7bff',
    secondary: '#0d0a1f',
    accent: '#7fd8ff',
    motif: 'board',
    motion: 'spotlight',
    entry: 15,
    difficulty: 'Advanced',
    gradient: "radial-gradient(120% 120% at 18% 12%, #9b7bff22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #7fd8ff1f 0%, transparent 52%), linear-gradient(135deg, #0d0a1f 0%, #05060c 100%)",
    glow: "0 0 0 1px #9b7bff38, 0 18px 60px -18px #9b7bff66",
  },
  'rps': {
    artDirection: "Dramatic rock-paper-scissors face-off, two stylized hands lit from opposing colored sources (cyan vs magenta), clash energy sparks at center, dark stage with volumetric haze and rim light.",
    id: 'rps',
    name: "Rock Paper Scissors",
    icon: 'Swords',
    category: 'Casual',
    tagline: "Read the duel.",
    sub: "Mind games, instant reveal.",
    primary: '#ff8a2b',
    secondary: '#2a0a1f',
    accent: '#ffe23d',
    motif: 'versus',
    motion: 'clash',
    entry: 3,
    difficulty: 'Easy',
    gradient: "radial-gradient(120% 120% at 18% 12%, #ff8a2b22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #ffe23d1f 0%, transparent 52%), linear-gradient(135deg, #2a0a1f 0%, #05060c 100%)",
    glow: "0 0 0 1px #ff8a2b38, 0 18px 60px -18px #ff8a2b66",
  },
  'dotsboxes': {
    artDirection: "Glowing dots-and-boxes lattice floating in dark space, neon connecting lines igniting as they complete, claimed boxes filling with soft gradient glow, subtle grid reflection, electric blue and gold palette, depth fog.",
    id: 'dotsboxes',
    name: "Dots & Boxes",
    icon: 'List',
    category: 'Board',
    tagline: "Claim the grid.",
    sub: "Draw lines, capture squares.",
    primary: '#33e0e0',
    secondary: '#0a1830',
    accent: '#9b7bff',
    motif: 'dots',
    motion: 'draw',
    entry: 5,
    difficulty: 'Medium',
    gradient: "radial-gradient(120% 120% at 18% 12%, #33e0e022 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #9b7bff1f 0%, transparent 52%), linear-gradient(135deg, #0a1830 0%, #05060c 100%)",
    glow: "0 0 0 1px #33e0e038, 0 18px 60px -18px #33e0e066",
  },
  'bowling': {
    artDirection: "Neon bowling lane in deep perspective, polished reflective wood, glowing gutter rails, pins lit at the vanishing point, ball with motion trail and spin, arcade blacklight atmosphere and lane shine.",
    id: 'bowling',
    name: "Bowling",
    icon: 'Target',
    category: 'Sports',
    tagline: "Strike it clean.",
    sub: "Roll heavy, pins fall.",
    primary: '#ff4d5e',
    secondary: '#1a0a0a',
    accent: '#f5d76e',
    motif: 'lane',
    motion: 'roll',
    entry: 5,
    difficulty: 'Easy',
    gradient: "radial-gradient(120% 120% at 18% 12%, #ff4d5e22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #f5d76e1f 0%, transparent 52%), linear-gradient(135deg, #1a0a0a 0%, #05060c 100%)",
    glow: "0 0 0 1px #ff4d5e38, 0 18px 60px -18px #ff4d5e66",
  },
  'basketball': {
    artDirection: "Arena basketball court from a low dramatic angle, stadium lights flaring, hoop and net in foreground, ball arcing with a motion streak, glowing court lines, crowd-dark background with light bloom and energy.",
    id: 'basketball',
    name: "Basketball",
    icon: 'Target',
    category: 'Sports',
    tagline: "Nothing but net.",
    sub: "Arc it, drain it, repeat.",
    primary: '#ff8a2b',
    secondary: '#0a1430',
    accent: '#ffffff',
    motif: 'court',
    motion: 'arc',
    entry: 5,
    difficulty: 'Medium',
    gradient: "radial-gradient(120% 120% at 18% 12%, #ff8a2b22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #ffffff1f 0%, transparent 52%), linear-gradient(135deg, #0a1430 0%, #05060c 100%)",
    glow: "0 0 0 1px #ff8a2b38, 0 18px 60px -18px #ff8a2b66",
  },
  'football': {
    artDirection: "Stadium football field in perspective under floodlights, glowing yard lines, turf texture, ball in motion with speed streaks, foreground player silhouette, night-game atmosphere with lens flare and haze.",
    id: 'football',
    name: "Football",
    icon: 'Target',
    category: 'Sports',
    tagline: "Move the chains.",
    sub: "Field vision wins.",
    primary: '#39e06b',
    secondary: '#08130a',
    accent: '#f5d76e',
    motif: 'field',
    motion: 'sweep',
    entry: 5,
    difficulty: 'Medium',
    gradient: "radial-gradient(120% 120% at 18% 12%, #39e06b22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #f5d76e1f 0%, transparent 52%), linear-gradient(135deg, #08130a 0%, #05060c 100%)",
    glow: "0 0 0 1px #39e06b38, 0 18px 60px -18px #39e06b66",
  },
  'stacktower': {
    artDirection: "Towering stack of glowing blocks rising into darkness, each layer rim-lit in shifting neon hues, slight perspective lean, falling sliver of a mis-stacked block, reflective base and atmospheric depth.",
    id: 'stacktower',
    name: "Stack Tower",
    icon: 'Building',
    category: 'Arcade',
    tagline: "Build it higher.",
    sub: "Time the drop, hold the line.",
    primary: '#33e0c0',
    secondary: '#0a1f1a',
    accent: '#9b7bff',
    motif: 'tower',
    motion: 'stack',
    entry: 3,
    difficulty: 'Easy',
    gradient: "radial-gradient(120% 120% at 18% 12%, #33e0c022 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #9b7bff1f 0%, transparent 52%), linear-gradient(135deg, #0a1f1a 0%, #05060c 100%)",
    glow: "0 0 0 1px #33e0c038, 0 18px 60px -18px #33e0c066",
  },
  'blockblast': {
    artDirection: "Explosive neon block-puzzle grid, blocks shattering into glowing shards with motion blur, vivid multi-color cells, dark backdrop with bloom, satisfying burst energy and depth.",
    id: 'blockblast',
    name: "Block Blast",
    icon: 'Gem',
    category: 'Arcade',
    tagline: "Clear the board.",
    sub: "Fit, flash, combo.",
    primary: '#33b5ff',
    secondary: '#0a1430',
    accent: '#ff5aa8',
    motif: 'blocks',
    motion: 'clear',
    entry: 3,
    difficulty: 'Easy',
    gradient: "radial-gradient(120% 120% at 18% 12%, #33b5ff22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #ff5aa81f 0%, transparent 52%), linear-gradient(135deg, #0a1430 0%, #05060c 100%)",
    glow: "0 0 0 1px #33b5ff38, 0 18px 60px -18px #33b5ff66",
  },
  'tron': {
    artDirection: "Cyber grid arena with deep one-point perspective, light-cycle trails carving glowing walls, blue-purple motion blur, reflective floor grid receding to a bright horizon, futuristic competition atmosphere.",
    id: 'tron',
    name: "Tron",
    icon: 'Bolt',
    category: 'Arcade',
    tagline: "Cut them off.",
    sub: "Leave a wall of light.",
    primary: '#19e0ff',
    secondary: '#050a14',
    accent: '#9b5aff',
    motif: 'cyber',
    motion: 'trail',
    entry: 5,
    difficulty: 'Advanced',
    gradient: "radial-gradient(120% 120% at 18% 12%, #19e0ff22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #9b5aff1f 0%, transparent 52%), linear-gradient(135deg, #050a14 0%, #05060c 100%)",
    glow: "0 0 0 1px #19e0ff38, 0 18px 60px -18px #19e0ff66",
  },
  'cupking': {
    artDirection: "Tournament beer-pong / cup-king table under arcade lights, triangular cup formation with rim glow, ball arcing with trail, reflective tabletop, dark party-arena ambience and depth-of-field.",
    id: 'cupking',
    name: "Cup King",
    icon: 'Crown',
    category: 'Arcade',
    tagline: "Stack to the throne.",
    sub: "Speed and steady hands.",
    primary: '#f5d76e',
    secondary: '#1a0f2a',
    accent: '#33e0e0',
    motif: 'cups',
    motion: 'stack',
    entry: 3,
    difficulty: 'Easy',
    gradient: "radial-gradient(120% 120% at 18% 12%, #f5d76e22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #33e0e01f 0%, transparent 52%), linear-gradient(135deg, #1a0f2a 0%, #05060c 100%)",
    glow: "0 0 0 1px #f5d76e38, 0 18px 60px -18px #f5d76e66",
  },
  'racing': {
    artDirection: "High-speed neon race track from a chase-cam angle, car silhouette with intense motion streaks, glowing track edges and apex lights, tunnel of light bloom, dark stadium with speed haze.",
    id: 'racing',
    name: "Racing",
    icon: 'Bolt',
    category: 'Sports',
    tagline: "Hold the line.",
    sub: "Brake late, win early.",
    primary: '#ff4d5e',
    secondary: '#0a0f1a',
    accent: '#19e0ff',
    motif: 'speed',
    motion: 'blur',
    entry: 5,
    difficulty: 'Advanced',
    gradient: "radial-gradient(120% 120% at 18% 12%, #ff4d5e22 0%, transparent 55%), radial-gradient(120% 120% at 85% 88%, #19e0ff1f 0%, transparent 52%), linear-gradient(135deg, #0a0f1a 0%, #05060c 100%)",
    glow: "0 0 0 1px #ff4d5e38, 0 18px 60px -18px #ff4d5e66",
  },
};

export const GAME_ART_ORDER: string[] = [
  'minigolf', 'connect4', '8ball', 'airhockey', 'chess', 'rps', 'dotsboxes', 'bowling', 'basketball', 'football', 'stacktower', 'blockblast', 'tron', 'cupking', 'racing'
];

export const FEATURED_ROTATION: string[] = [
  'minigolf', 'airhockey', '8ball', 'chess', 'tron', 'basketball',
];

export function getGameArt(id: string): GameArt {
  return GAME_ART[id] || GAME_ART['minigolf'];
}


/* ============================================================
   Poster art pipeline (ready for real assets)
   ------------------------------------------------------------
   Drop premium poster art into: public/game-posters/<file>.webp
   Then map an id below to enable it. The <img> layers over the
   cinematic SVG scene (which stays as the loading + fallback art).
   Recommended export: 1600x960 (5:3), <250kb webp, dark/neon look.
   ============================================================ */
export const POSTER_BASE = "/game-posters";

/** Map game id -> poster filename (without extension). Add entries as art lands. */
export const POSTER_FILES: Record<string, string> = {
  // minigolf: "mini-golf.webp",
  // connect4: "connect-four.webp",
  // 8ball: "eight-ball.webp",
  // airhockey: "air-hockey.webp",
  // chess: "chess.webp",
  // rps: "rps.webp",
  // dotsboxes: "dots-boxes.webp",
  // bowling: "bowling.webp",
  // basketball: "basketball.webp",
  // football: "football.webp",
  // stacktower: "stack-tower.webp",
  // blockblast: "block-blast.webp",
  // tron: "tron.webp",
  // cupking: "cup-king.webp",
  // racing: "racing.webp",
};

/** Resolve a poster URL for a game id, or undefined if no real asset yet. */
export function getPosterUrl(id: string): string | undefined {
  const f = POSTER_FILES[id];
  return f ? `${POSTER_BASE}/${f}.webp` : undefined;
}
