import {
  type Board,
  type Cell,
  createBoard,
  cloneBoard,
  drop,
  isLegal,
  legalMoves,
  checkWinner,
  isFull,
} from "./engine";
import { type Difficulty, chooseMove } from "./bot";

// Deterministic tick budget (frames @ ~60fps). Keeping timing here (not in rAF)
// lets the whole match loop run headlessly in tests.
export const DROP_TICKS = 18; // ~300ms disc-drop animation
export const BOT_THINK_TICKS = 33; // ~550ms "thinking" beat before the bot drops
export const RESULT_TICKS = 48; // ~800ms beat on game over before rematch is offered
export const MAX_MATCH_TICKS = 6000; // hard safety cap (~100s) — must never be hit

// turn 1 = human (red), turn 2 = bot (yellow)
export type Player = 1 | 2;
export type Phase =
  | "humanTurn" // waiting for the human to pick a column
  | "botThink" // bot is "thinking" (timed beat) before it drops
  | "dropping" // a disc is falling — physics/anim beat, no input
  | "gameOver"; // someone won or the board filled

export interface MatchState {
  difficulty: Difficulty;
  board: Board;
  turn: Player;
  phase: Phase;
  timer: number; // ticks remaining in the current timed phase
  totalTicks: number; // safety counter for the whole match
  pendingCol: number; // column a disc is dropping into (-1 when none)
  pendingRow: number; // row the dropping disc will land in (-1 when none)
  winner: Cell; // 0 = none/draw-in-progress, 1 = human, 2 = bot
  draw: boolean;
  banner: string;
  scores: [number, number]; // [human wins, bot wins] across rematches
}

export function createMatch(difficulty: Difficulty): MatchState {
  return {
    difficulty,
    board: createBoard(),
    turn: 1,
    phase: "humanTurn",
    timer: 0,
    totalTicks: 0,
    pendingCol: -1,
    pendingRow: -1,
    winner: 0,
    draw: false,
    banner: "Your move — drop a disc",
    scores: [0, 0],
  };
}

export function canHumanMove(s: MatchState): boolean {
  return s.phase === "humanTurn" && s.turn === 1 && !s.winner && !s.draw;
}

export function isBotTurn(s: MatchState): boolean {
  return s.turn === 2 && (s.phase === "botThink" || s.phase === "humanTurn");
}

// Begin dropping a disc into `col` for the current player. Returns a new state.
// Invalid columns are ignored (returns the same state) so the UI can never soft-lock.
export function play(s: MatchState, col: number): MatchState {
  if (s.phase !== "humanTurn" && s.phase !== "botThink") return s;
  if (s.winner || s.draw) return s;
  if (!isLegal(s.board, col)) return s;
  const board = cloneBoard(s.board);
  const row = drop(board, col, s.turn as Cell);
  return {
    ...s,
    board,
    phase: "dropping",
    pendingCol: col,
    pendingRow: row,
    timer: DROP_TICKS,
    banner: s.turn === 1 ? "Dropping…" : "Bot drops…",
  };
}

// Pick the bot's column deterministically from the engine/bot helper.
export function botChoose(s: MatchState): number {
  const moves = legalMoves(s.board);
  if (moves.length === 0) return -1;
  const col = chooseMove(s.board, 2, s.difficulty);
  // Defensive: never return an illegal column (prevents a stuck bot turn).
  return isLegal(s.board, col) ? col : moves[0];
}

function resolveLanded(s: MatchState): MatchState {
  // A disc just finished dropping. Resolve win/draw or hand off the turn.
  const w = checkWinner(s.board);
  if (w !== 0) {
    const scores: [number, number] =
      w === 1 ? [s.scores[0] + 1, s.scores[1]] : [s.scores[0], s.scores[1] + 1];
    return {
      ...s,
      phase: "gameOver",
      timer: RESULT_TICKS,
      winner: w,
      pendingCol: -1,
      pendingRow: -1,
      banner: w === 1 ? "You win! 4 in a row" : "Bot wins this round",
      scores,
    };
  }
  if (isFull(s.board)) {
    return {
      ...s,
      phase: "gameOver",
      timer: RESULT_TICKS,
      draw: true,
      pendingCol: -1,
      pendingRow: -1,
      banner: "Board full — it's a draw",
    };
  }
  // Hand off to the other player.
  const next: Player = s.turn === 1 ? 2 : 1;
  if (next === 2) {
    return {
      ...s,
      turn: 2,
      phase: "botThink",
      timer: BOT_THINK_TICKS,
      pendingCol: -1,
      pendingRow: -1,
      banner: "Bot is thinking…",
    };
  }
  return {
    ...s,
    turn: 1,
    phase: "humanTurn",
    timer: 0,
    pendingCol: -1,
    pendingRow: -1,
    banner: "Your move — drop a disc",
  };
}

// Advance the match by exactly one tick. Pure: returns a new state.
// Drives the bot, drop animations, and the game-over beat without any timers.
export function tick(s: MatchState): MatchState {
  if (s.totalTicks >= MAX_MATCH_TICKS) return s;
  let st: MatchState = { ...s, totalTicks: s.totalTicks + 1 };

  switch (st.phase) {
    case "humanTurn":
      // Nothing happens automatically on the human's turn; input drives it.
      return st;

    case "botThink":
      if (st.timer > 0) {
        st = { ...st, timer: st.timer - 1 };
        if (st.timer > 0) return st;
      }
      // Time to drop: choose and play the bot's column.
      {
        const col = botChoose(st);
        if (col < 0) {
          // No legal moves left → board is full → draw.
          return {
            ...st,
            phase: "gameOver",
            timer: RESULT_TICKS,
            draw: true,
            banner: "Board full — it's a draw",
          };
        }
        return play(st, col);
      }

    case "dropping":
      if (st.timer > 0) {
        st = { ...st, timer: st.timer - 1 };
        if (st.timer > 0) return st;
      }
      return resolveLanded(st);

    case "gameOver":
      if (st.timer > 0) st = { ...st, timer: st.timer - 1 };
      return st;

    default:
      return st;
  }
}

export function isMatchOver(s: MatchState): boolean {
  return s.phase === "gameOver";
}

// Reset for another round, keeping the running scoreboard. Loser/alternation:
// the player who did NOT start last time starts (here we keep human-first for clarity,
// but flip if you want alternation — kept human-first to match the lobby UX).
export function rematch(s: MatchState, difficulty?: Difficulty): MatchState {
  const fresh = createMatch(difficulty ?? s.difficulty);
  return { ...fresh, scores: s.scores };
}
