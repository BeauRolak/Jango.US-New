export interface GameInfo {
  id: string;
  name: string;
  emoji: string;
  mode: string;
  art: string;
  playable: boolean;
  path: string;
  category: "Sports" | "Board" | "Arcade" | "Casual";
}

export const GAMES: GameInfo[] = [
  { id: "minigolf", name: "Mini Golf", emoji: "⛳", mode: "1v1", category: "Sports", playable: true, path: "/games/minigolf", art: "linear-gradient(135deg,#0e7a4b,#1bbf73)" },
  { id: "connect4", name: "Connect Four", emoji: "🔴", mode: "1v1", category: "Board", playable: true, path: "/games/connect4", art: "linear-gradient(135deg,#15295e,#3f6fd0)" },
  { id: "8ball", name: "8-Ball Pool", emoji: "🎱", mode: "1v1", category: "Sports", playable: false, path: "/games", art: "linear-gradient(135deg,#123a6b,#2f6fd0)" },
  { id: "airhockey", name: "Air Hockey", emoji: "🏒", mode: "1v1", category: "Arcade", playable: false, path: "/games", art: "linear-gradient(135deg,#5a1a6b,#a23fd0)" },
  { id: "chess", name: "Chess", emoji: "♟️", mode: "1v1", category: "Board", playable: false, path: "/games", art: "linear-gradient(135deg,#2a2a3a,#555571)" },
  { id: "rps", name: "Rock Paper Scissors", emoji: "✊", mode: "1v1", category: "Casual", playable: false, path: "/games", art: "linear-gradient(135deg,#6b5a1a,#d0b03f)" },
  { id: "dotsboxes", name: "Dots & Boxes", emoji: "◻️", mode: "1v1", category: "Board", playable: false, path: "/games", art: "linear-gradient(135deg,#1a5a6b,#3fb0d0)" },
  { id: "bowling", name: "Bowling", emoji: "🎳", mode: "1v1", category: "Sports", playable: false, path: "/games", art: "linear-gradient(135deg,#1a3a6b,#3f6fd0)" },
  { id: "cupking", name: "Cup King", emoji: "🎯", mode: "Solo", category: "Arcade", playable: false, path: "/games", art: "linear-gradient(135deg,#6b3a1a,#d07f3f)" },
  { id: "stacktower", name: "Stack Tower", emoji: "🧱", mode: "Solo", category: "Arcade", playable: false, path: "/games", art: "linear-gradient(135deg,#1a6b4b,#3fd0a0)" },
  { id: "blockblast", name: "Block Blast", emoji: "💥", mode: "Solo", category: "Arcade", playable: false, path: "/games", art: "linear-gradient(135deg,#6b1a4b,#d03fa0)" },
  { id: "tron", name: "Tron", emoji: "🏍️", mode: "1v1", category: "Arcade", playable: false, path: "/games", art: "linear-gradient(135deg,#0a4a6b,#1bbfd0)" },
  { id: "basketball", name: "Basketball", emoji: "🏀", mode: "1v1", category: "Sports", playable: false, path: "/games", art: "linear-gradient(135deg,#6b3a0a,#d07f1b)" },
  { id: "football", name: "Football", emoji: "🏈", mode: "1v1", category: "Sports", playable: false, path: "/games", art: "linear-gradient(135deg,#3a6b1a,#7fd03f)" },
  { id: "racing", name: "Racing", emoji: "🏎️", mode: "1v1", category: "Sports", playable: false, path: "/games", art: "linear-gradient(135deg,#6b1a1a,#d03f3f)" },
];
