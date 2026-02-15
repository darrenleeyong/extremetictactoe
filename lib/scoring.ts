/** Point-based scoring for single-player and hell mode games. */

export interface ScoreParams {
  playerMoves: number;
  totalSeconds: number;
  boardsWon: number;
  boardsLost: number;
  result: 'win' | 'loss' | 'draw' | null; // null = in progress
  difficulty: number;
  isHellMode: boolean;
}

/**
 * Calculate score based on performance metrics.
 *
 * Base: 10,000
 * - Deduct 150 per player move (efficiency)
 * - Deduct 30 per second elapsed (speed)
 * - +500 per small board won, -200 per small board lost
 * - +5000 for winning, +1000 for draw
 * - Difficulty multiplier: 0.5x (level 1) to 2.5x (level 10)
 * - Hell mode: 2x multiplier
 */
export function calculateScore(params: ScoreParams): number {
  const { playerMoves, totalSeconds, boardsWon, boardsLost, result, difficulty, isHellMode } = params;

  let score = 10000;

  // Efficiency: fewer moves = higher score
  score -= playerMoves * 150;

  // Speed: less time = higher score
  score -= Math.floor(totalSeconds) * 30;

  // Board control
  score += boardsWon * 500;
  score -= boardsLost * 200;

  // Result bonus
  if (result === 'win') score += 5000;
  else if (result === 'draw') score += 1000;

  // Difficulty multiplier (level 1 = 0.5x, level 10 = 2.5x)
  const diffMultiplier = 0.5 + (difficulty - 1) * (2.0 / 9);
  score = Math.round(score * diffMultiplier);

  // Hell mode bonus
  if (isHellMode) score = Math.round(score * 2);

  return Math.max(0, score);
}
