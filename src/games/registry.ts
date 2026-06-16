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
  { id: "minigolf", name: "Mini Golf", emoji: "\u26f3", mode: "1v1", category: "Sports", playable: true, path: "/games/minigolf", art: "linear-gradient(135deg,#0e7a4b,#1bbf73)" },
  { id: "connect4", name: "Connect Four", emoji: "\ud83d\udd34", mode: "1v1", category: "Board", playable: true, path: "/games/connect4", art: "linear-gradient(135deg,#15295e,#3f6fd0)" },
  { id: "8ball", name: "8-Ball Pool", emoji: "\ud83c\udfb1", mode: "1v1", category: "Sports", playable: true, path: "/games/eightball", art: "linear-gradient(135deg,#123a6b,#2f6fd0)" },
  { id: "airhockey", name: "Air Hockey", emoji: "\ud83c\udfd2", mode: "1v1", category: "Arcade", playable: true, path: "/games/airhockey", art: "linear-gradient(135deg,#5a1a6b,#a23fd0)" },
  { id: "chess", name: "Chess", emoji: "\u265f\ufe0f", mode: "1v1", category: "Board", playable: true, path: "/games/chess", art: "linear-gradient(135deg,#2a2a3a,#555571)" },
  { id: "rps", name: "Rock Paper Scissors", emoji: "\u270a", mode: "1v1", category: "Casual", playable: true, path: "/games/rps", art: "linear-gradient(135deg,#6b5a1a,#d0b03f)" },
  { id: "dotsboxes", name: "Dots & Boxes", emoji: "\u25fb\ufe0f", mode: "1v1", category: "Board", playable: true, path: "/games/dotsboxes", art: "linear-gradient(135deg,#1a5a6b,#3fb0d0)" },
  { id: "bowling", name: "Bowling", emoji: "\ud83c\udfb3", mode: "1v1", category: "Sports", playable: true, path: "/games/bowling", art: "linear-gradient(135deg,#1a3a6b,#3f6fd0)" },
  { id: "cupking", name: "Cup King", emoji: "\ud83c\udfaf", mode: "Solo", category: "Arcade", playable: false, path: "/games", art: "linear-gradient(135deg,#6b3a1a,#d07f3f)" },
  { id: "stacktower", name: "Stack Tower", emoji: "\ud83e\uddf1", mode: "Solo", category: "Arcade", playable: false, path: "/games", art: "linear-gradient(135deg,#1a6b4b,#3fd0a0)" },
  { id: "blockblast", name: "Block Blast", emoji: "\ud83d\udca5", mode: "Solo", category: "Arcade", playable: false, path: "/games", art: "linear-gradient(135deg,#6b1a4b,#d03fa0)" },
  { id: "tron", name: "Tron", emoji: "\ud83c\udfcd\ufe0f", mode: "1v1", category: "Arcade", playable: false, path: "/games", art: "linear-gradient(135deg,#0a4a6b,#1bbfd0)" },
  { id: "basketball", name: "Basketball", emoji: "\ud83c\udfc0", mode: "1v1", category: "Sports", playable: false, path: "/games", art: "linear-gradient(135deg,#6b3a0a,#d07f1b)" },
  { id: "football", name: "Football", emoji: "\ud83c\udfc8", mode: "1v1", category: "Sports", playable: false, path: "/games", art: "linear-gradient(135deg,#3a6b1a,#7fd03f)" },
  { id: "racing", name: "Racing", emoji: "\ud83c\udfce\ufe0f", mode: "1v1", category: "Sports", playable: false, path: "/games", art: "linear-gradient(135deg,#6b1a1a,#d03f3f)" },
];
