import type { GameState } from './gameLogic';
import { getLegalMoves, applyMove, getCurrentPlayer, PLAYER_SYMBOLS, type Player } from './gameLogic';

const LINES_3 = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const CPU_SYMBOL: Player = 'O';
const HUMAN_SYMBOL: Player = 'X';

/** Count how many cells in a line are owned by player (and how many empty). */
function lineScore(board: (Player | null)[], line: number[], player: Player): { player: number; empty: number } {
  let playerCount = 0;
  let empty = 0;
  for (const i of line) {
    if (board[i] === player) playerCount++;
    else if (board[i] === null) empty++;
  }
  return { player: playerCount, empty };
}

/** Heuristic score for a small board from CPU (O) perspective: positive = good for O */
function smallBoardScore(board: (Player | null)[], _globalWins: (Player | null)[]): number {
  let score = 0;
  for (const line of LINES_3) {
    const o = lineScore(board, line, CPU_SYMBOL);
    const x = lineScore(board, line, HUMAN_SYMBOL);
    if (o.player === 2 && o.empty === 1) score += 100;
    if (x.player === 2 && x.empty === 1) score -= 50;
    if (o.player === 1 && o.empty === 2) score += 5;
    if (x.player === 1 && x.empty === 2) score -= 3;
  }
  return score;
}

/** Score for global board: winning/blocking lines of small boards */
function globalScore(globalWins: (Player | null)[], boardIndex: number): number {
  let score = 0;
  for (const [a, b, c] of LINES_3) {
    if (a !== boardIndex && b !== boardIndex && c !== boardIndex) continue;
    const vals = [globalWins[a], globalWins[b], globalWins[c]];
    const oCount = vals.filter((v) => v === CPU_SYMBOL).length;
    const xCount = vals.filter((v) => v === HUMAN_SYMBOL).length;
    const empty = vals.filter((v) => v === null).length;
    if (oCount === 2 && empty === 1) score += 1000;
    if (xCount === 2 && empty === 1) score -= 500;
  }
  return score;
}

/** Heuristic evaluation for current state: positive = good for O (CPU) */
function evaluate(state: GameState): number {
  if (state.gameOver === CPU_SYMBOL) return 100_000;
  if (state.gameOver === HUMAN_SYMBOL) return -50_000;
  if (state.gameOver === 'draw') return 0;

  let score = 0;
  for (let bi = 0; bi < 9; bi++) {
    score += smallBoardScore(state.boards[bi], state.globalWins);
    score += globalScore(state.globalWins, bi);
  }
  return score;
}

/** Pick best move by heuristic (for CPU = O) */
function getHeuristicMove(state: GameState): { bigRow: number; bigCol: number; smallRow: number; smallCol: number } {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return { bigRow: 0, bigCol: 0, smallRow: 0, smallCol: 0 };

  let bestScore = -Infinity;
  let bestMoves: typeof moves = [];

  for (const move of moves) {
    const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
    let score = 0;
    if (next.gameOver === CPU_SYMBOL) score = 10000;
    else if (next.gameOver === HUMAN_SYMBOL) score = -5000;
    else {
      const boardIndex = move.bigRow * 3 + move.bigCol;
      score += smallBoardScore(next.boards[boardIndex], next.globalWins);
      score += globalScore(next.globalWins, boardIndex);
    }
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) bestMoves.push(move);
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

/** Minimax: CPU (O) maximizes, Human (X) minimizes. Returns score and best move. */
function minimax(
  state: GameState,
  depth: number,
  maxDepth: number,
  isMax: boolean,
  alpha: number,
  beta: number
): { score: number; move: { bigRow: number; bigCol: number; smallRow: number; smallCol: number } | null } {
  const moves = getLegalMoves(state);
  const currentPlayer = getCurrentPlayer(state);
  const terminal = state.gameOver !== null || moves.length === 0 || depth >= maxDepth;

  if (terminal || depth >= maxDepth) {
    const score = evaluate(state);
    return { score, move: moves[0] ?? null };
  }

  if (isMax) {
    let bestScore = -Infinity;
    let bestMove: typeof moves[0] | null = null;
    for (const move of moves) {
      const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
      const nextIsMax = getCurrentPlayer(next) === CPU_SYMBOL;
      const { score } = minimax(next, depth + 1, maxDepth, nextIsMax, alpha, beta);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }
    return { score: bestScore, move: bestMove };
  } else {
    let bestScore = Infinity;
    let bestMove: typeof moves[0] | null = null;
    for (const move of moves) {
      const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
      const nextIsMax = getCurrentPlayer(next) === CPU_SYMBOL;
      const { score } = minimax(next, depth + 1, maxDepth, nextIsMax, alpha, beta);
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }
    return { score: bestScore, move: bestMove };
  }
}

/** Get CPU move. Difficulty 1 = easiest (random), 10 = hardest (minimax depth 4). Single-player only: human X, CPU O. */
export function getCPUMove(
  state: GameState,
  difficulty: number
): { bigRow: number; bigCol: number; smallRow: number; smallCol: number } {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return { bigRow: 0, bigCol: 0, smallRow: 0, smallCol: 0 };

  const clamped = Math.max(1, Math.min(10, difficulty));

  // Level 1: pure random
  if (clamped === 1) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Level 2–4: random with increasing chance of heuristic
  if (clamped <= 4) {
    const useHeuristic = Math.random() < (clamped - 1) / 4;
    return useHeuristic ? getHeuristicMove(state) : moves[Math.floor(Math.random() * moves.length)];
  }

  // Level 5: always heuristic
  if (clamped === 5) {
    return getHeuristicMove(state);
  }

  // Level 6–7: heuristic with occasional depth-1 minimax
  if (clamped <= 7) {
    const useMinimax = Math.random() < (clamped - 5) / 2;
    if (useMinimax) {
      const currentPlayer = getCurrentPlayer(state);
      const isMax = currentPlayer === CPU_SYMBOL;
      const { move } = minimax(state, 0, 1, isMax, -Infinity, Infinity);
      if (move) return move;
    }
    return getHeuristicMove(state);
  }

  // Level 8–10: minimax with depth 2, 3, 4
  const depth = clamped - 6; // 2, 3, 4
  const currentPlayer = getCurrentPlayer(state);
  const isMax = currentPlayer === CPU_SYMBOL;
  const { move } = minimax(state, 0, depth, isMax, -Infinity, Infinity);
  return move ?? getHeuristicMove(state);
}
