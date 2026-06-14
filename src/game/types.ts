// Shared match-flow types for all Jango.US games.
// Flow: MATCH_START -> ROUND_START -> PLAYER_TURN -> ACTION_RESOLVED -> SCORE_LOCKED -> NEXT_TURN/NEXT_ROUND -> MATCH_END

export type MatchPhase =
  | "MATCH_START"
  | "ROUND_START"
  | "PLAYER_TURN"
  | "ACTION_RESOLVED"
  | "SCORE_LOCKED"
  | "MATCH_END";

export type Difficulty = "easy" | "medium" | "hard";

export interface PlayerState {
  id: string;
  name: string;
  isBot: boolean;
  difficulty?: Difficulty;
  score: number;       // running total (lower is better for golf)
  roundScores: number[];
}

export interface MatchState {
  phase: MatchPhase;
  round: number;         // 0-indexed current round/hole
  totalRounds: number;
  activePlayer: 0 | 1;
  players: [PlayerState, PlayerState];
  winner: 0 | 1 | null;  // index of winner once MATCH_END
}

export function createMatch(p0: PlayerState, p1: PlayerState, totalRounds: number): MatchState {
  return {
    phase: "MATCH_START",
    round: 0,
    totalRounds,
    activePlayer: 0,
    players: [p0, p1],
    winner: null,
  };
}

// Lock a round score for a player. Score is computed by the GAME engine only,
// never by the UI. This just records it and advances turn/round.
export function lockScore(m: MatchState, player: 0 | 1, roundScore: number): MatchState {
  const players = m.players.map((p, i) =>
    i === player
      ? { ...p, score: p.score + roundScore, roundScores: [...p.roundScores, roundScore] }
      : p
  ) as [PlayerState, PlayerState];
  return { ...m, players, phase: "SCORE_LOCKED" };
}

// Advance to next turn, or next round, or end the match.
export function advance(m: MatchState): MatchState {
  const bothPlayed = m.players[0].roundScores.length > m.round && m.players[1].roundScores.length > m.round;
  if (!bothPlayed) {
    return { ...m, activePlayer: (m.activePlayer === 0 ? 1 : 0), phase: "PLAYER_TURN" };
  }
  const nextRound = m.round + 1;
  if (nextRound >= m.totalRounds) {
    const a = m.players[0].score;
    const b = m.players[1].score;
    const winner: 0 | 1 = a <= b ? 0 : 1; // lower strokes wins
    return { ...m, phase: "MATCH_END", winner };
  }
  return { ...m, round: nextRound, activePlayer: 0, phase: "ROUND_START" };
}
