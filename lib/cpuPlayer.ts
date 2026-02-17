import type { GameState, SmallBoard, Player } from './gameLogic';
import { getLegalMoves, applyMove, getCurrentPlayer, checkSmallBoardWin, isSmallBoardFull } from './gameLogic';

/* ── Constants ─────────────────────────────────────────── */

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/** Position weights: center > corners > edges */
const POS_W = [3, 2, 3, 2, 4, 2, 3, 2, 3];

type Move = { bigRow: number; bigCol: number; smallRow: number; smallCol: number };

/* ── Helpers ───────────────────────────────────────────── */

function lineStats(cells: (Player | null)[], line: number[], player: Player, opponent: Player) {
  let own = 0, opp = 0, empty = 0;
  for (const i of line) {
    if (cells[i] === player) own++;
    else if (cells[i] === opponent) opp++;
    else empty++;
  }
  return { own, opp, empty };
}

/* ── Evaluation ────────────────────────────────────────── */

/** Evaluate a single small board from CPU's perspective */
function evalSmallBoard(board: SmallBoard, cpuPlayer: Player, humanPlayer: Player): number {
  let score = 0;
  for (const line of LINES) {
    const cpu = lineStats(board, line, cpuPlayer, humanPlayer);
    const hum = lineStats(board, line, humanPlayer, cpuPlayer);

    // CPU lines (not blocked by human)
    if (cpu.opp === 0) {
      if (cpu.own === 3) return 1000;
      if (cpu.own === 2 && cpu.empty === 1) score += 50;
      if (cpu.own === 1 && cpu.empty === 2) score += 8;
    }

    // Human lines (not blocked by CPU)
    if (hum.opp === 0) {
      if (hum.own === 3) return -1000;
      if (hum.own === 2 && hum.empty === 1) score -= 45;
      if (hum.own === 1 && hum.empty === 2) score -= 6;
    }
  }

  // Position bonuses within the small board
  for (let i = 0; i < 9; i++) {
    if (board[i] === cpuPlayer) score += POS_W[i];
    else if (board[i] === humanPlayer) score -= POS_W[i];
  }

  return score;
}

/** Evaluate the meta / global board from CPU's perspective */
function evalGlobal(globalWins: (Player | null)[], cpuPlayer: Player, humanPlayer: Player): number {
  let score = 0;
  for (const line of LINES) {
    const cpu = lineStats(globalWins, line, cpuPlayer, humanPlayer);
    const hum = lineStats(globalWins, line, humanPlayer, cpuPlayer);

    if (cpu.opp === 0) {
      if (cpu.own === 3) return 100000;
      if (cpu.own === 2 && cpu.empty === 1) score += 3000;
      if (cpu.own === 1 && cpu.empty === 2) score += 300;
    }

    if (hum.opp === 0) {
      if (hum.own === 3) return -100000;
      if (hum.own === 2 && hum.empty === 1) score -= 2500;
      if (hum.own === 1 && hum.empty === 2) score -= 250;
    }
  }

  // Board position value on the meta grid
  for (let i = 0; i < 9; i++) {
    if (globalWins[i] === cpuPlayer) score += POS_W[i] * 50;
    else if (globalWins[i] === humanPlayer) score -= POS_W[i] * 40;
  }

  return score;
}

/** Full state evaluation: positive = good for CPU */
function evaluate(state: GameState, cpuPlayer: Player, humanPlayer: Player): number {
  if (state.gameOver === cpuPlayer) return 200000;
  if (state.gameOver === humanPlayer) return -200000;
  if (state.gameOver === 'draw') return 0;

  let score = evalGlobal(state.globalWins, cpuPlayer, humanPlayer);

  // Evaluate each undecided small board, weighted by meta-position
  for (let bi = 0; bi < 9; bi++) {
    if (state.globalWins[bi] !== null) continue;
    score += evalSmallBoard(state.boards[bi], cpuPlayer, humanPlayer) * (POS_W[bi] / 3);
  }

  // Strategic: evaluate the nextBoard situation (now considering sequential rule)
  if (state.nextBoard !== null && !state.hasWildcard) {
    const nb = state.nextBoard;
    const isDead = state.globalWins[nb] !== null || isSmallBoardFull(state.boards[nb]);
    const current = getCurrentPlayer(state);
    if (isDead) {
      // Free choice for whoever must move
      score += current === cpuPlayer ? 30 : -30;
    } else {
      // Forced into a specific board by sequence – good if the board favors you
      const boardVal = evalSmallBoard(state.boards[nb], cpuPlayer, humanPlayer);
      if (current === cpuPlayer) score += boardVal > 0 ? 20 : -20;
      else score += boardVal < 0 ? -20 : 20;
    }
  }

  // Wildcard bonus: having free choice is valuable
  if (state.hasWildcard) {
    const current = getCurrentPlayer(state);
    score += current === cpuPlayer ? 40 : -40;
  }

  return score;
}

/* ── Move ordering ─────────────────────────────────────── */

/** Quick heuristic for move ordering (cheap, no applyMove call) */
function quickScore(state: GameState, move: Move, cpuPlayer: Player, humanPlayer: Player): number {
  const player = getCurrentPlayer(state);
  const opp = player === cpuPlayer ? humanPlayer : cpuPlayer;
  const bi = move.bigRow * 3 + move.bigCol;
  const ci = move.smallRow * 3 + move.smallCol;
  const board = state.boards[bi];

  let score = POS_W[ci] * 2 + POS_W[bi];

  // Does this move win the small board?
  const test = [...board] as SmallBoard;
  test[ci] = player;
  if (checkSmallBoardWin(test) === player) {
    score += 500;
    // Winning a board on a key meta-position
    score += POS_W[bi] * 30;
  }

  // Does this move block the opponent from winning the small board?
  const oppTest = [...board] as SmallBoard;
  oppTest[ci] = opp;
  if (checkSmallBoardWin(oppTest) === opp) score += 300;

  // Sequential rule: completing a board gives wildcard (very valuable)
  const boardWouldComplete = checkSmallBoardWin(test) !== null || (board.filter(c => c === null).length === 1);
  if (boardWouldComplete) score += 100;

  return score;
}

/** Sort moves for better alpha-beta pruning (best first for current player) */
function orderMoves(state: GameState, moves: Move[], cpuPlayer: Player, humanPlayer: Player): Move[] {
  return moves
    .map(m => ({ m, s: quickScore(state, m, cpuPlayer, humanPlayer) }))
    .sort((a, b) => b.s - a.s)
    .map(x => x.m);
}

/* ── Minimax ───────────────────────────────────────────── */

function minimax(
  state: GameState,
  depth: number,
  maxDepth: number,
  isMax: boolean,
  alpha: number,
  beta: number,
  cpuPlayer: Player,
  humanPlayer: Player,
): { score: number; move: Move | null } {
  const moves = getLegalMoves(state);

  if (state.gameOver !== null || moves.length === 0 || depth >= maxDepth) {
    let score = evaluate(state, cpuPlayer, humanPlayer);
    // Prefer faster wins / slower losses
    if (state.gameOver === cpuPlayer) score += (maxDepth - depth) * 500;
    else if (state.gameOver === humanPlayer) score -= (maxDepth - depth) * 500;
    return { score, move: moves[0] ?? null };
  }

  // Order moves at shallow depths for much better pruning
  const ordered = depth <= 1 ? orderMoves(state, moves, cpuPlayer, humanPlayer) : moves;

  if (isMax) {
    let best = -Infinity;
    let bestMove: Move | null = null;
    for (const move of ordered) {
      const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
      const nextMax = getCurrentPlayer(next) === cpuPlayer;
      const { score } = minimax(next, depth + 1, maxDepth, nextMax, alpha, beta, cpuPlayer, humanPlayer);
      if (score > best) { best = score; bestMove = move; }
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return { score: best, move: bestMove };
  } else {
    let best = Infinity;
    let bestMove: Move | null = null;
    for (const move of ordered) {
      const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
      const nextMax = getCurrentPlayer(next) === cpuPlayer;
      const { score } = minimax(next, depth + 1, maxDepth, nextMax, alpha, beta, cpuPlayer, humanPlayer);
      if (score < best) { best = score; bestMove = move; }
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return { score: best, move: bestMove };
  }
}

/* ── Heuristic move (1-step lookahead) ─────────────────── */

function heuristicMove(state: GameState, cpuPlayer: Player, humanPlayer: Player): Move {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return { bigRow: 0, bigCol: 0, smallRow: 0, smallCol: 0 };

  let best = -Infinity;
  let bestMoves: Move[] = [];

  for (const move of moves) {
    const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
    const score = next.gameOver === cpuPlayer ? 100000 : next.gameOver === humanPlayer ? -100000 : evaluate(next, cpuPlayer, humanPlayer);
    if (score > best) { best = score; bestMoves = [move]; }
    else if (score === best) bestMoves.push(move);
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

/* ── Public API ────────────────────────────────────────── */

/**
 * Get CPU move with scaled difficulty.
 *
 * Levels 1-3 (The Toddler):
 *   - Level 1: Random moves, but takes small-board win if available
 *   - Level 2-3: Random moves, but blocks opponent's small-board wins
 * 
 * Levels 4-6 (The Strategist):
 *   - Level 4: Minimax depth 2
 *   - Level 5: Minimax depth 3
 *   - Level 6: Minimax depth 4
 * 
 * Levels 7-10 (The Grandmaster):
 *   - Level 7: Alpha-Beta depth 5
 *   - Level 8: Alpha-Beta depth 6
 *   - Level 9: Alpha-Beta depth 7
 *   - Level 10: Alpha-Beta depth 8+ (optimized)
 */
export function getCPUMove(state: GameState, difficulty: number, cpuPlayer: Player, humanPlayer: Player): Move {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return { bigRow: 0, bigCol: 0, smallRow: 0, smallCol: 0 };
  if (moves.length === 1) return moves[0];

  const d = Math.max(1, Math.min(10, difficulty));

  // Level 1: Random, but take immediate small-board wins
  if (d === 1) {
    for (const move of moves) {
      const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
      const bi = move.bigRow * 3 + move.bigCol;
      if (state.globalWins[bi] === null && next.globalWins[bi] === cpuPlayer) {
        return move;
      }
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Level 2-3: Random, but block opponent's small-board wins
  if (d <= 3) {
    // First, take our own wins
    for (const move of moves) {
      const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
      const bi = move.bigRow * 3 + move.bigCol;
      if (state.globalWins[bi] === null && next.globalWins[bi] === cpuPlayer) {
        return move;
      }
    }
    
    // Then, block opponent's wins
    for (const move of moves) {
      const bi = move.bigRow * 3 + move.bigCol;
      const ci = move.smallRow * 3 + move.smallCol;
      const board = state.boards[bi];
      const test = [...board] as SmallBoard;
      test[ci] = humanPlayer;
      if (checkSmallBoardWin(test) === humanPlayer) {
        return move;
      }
    }
    
    // Otherwise random
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Levels 4-6: Minimax with increasing depth
  // Level 4: depth 2, Level 5: depth 3, Level 6: depth 4
  if (d <= 6) {
    const depth = d - 2; // Level 4 -> 2, Level 5 -> 3, Level 6 -> 4
    const isMax = getCurrentPlayer(state) === cpuPlayer;
    const { move } = minimax(state, 0, depth, isMax, -Infinity, Infinity, cpuPlayer, humanPlayer);
    return move ?? heuristicMove(state, cpuPlayer, humanPlayer);
  }

  // Levels 7-10: Alpha-Beta with deep search
  // Level 7: depth 5, Level 8: depth 6, Level 9: depth 7, Level 10: depth 8+
  let depth = d - 2; // Level 7 -> 5, Level 8 -> 6, Level 9 -> 7, Level 10 -> 8

  // Adaptive depth for level 10: reduce when branching is very high
  if (d === 10) {
    if (moves.length > 25) depth = 6;
    else if (moves.length > 18) depth = 7;
    else depth = 8;
  }

  const isMax = getCurrentPlayer(state) === cpuPlayer;
  const { move } = minimax(state, 0, depth, isMax, -Infinity, Infinity, cpuPlayer, humanPlayer);
  return move ?? heuristicMove(state, cpuPlayer, humanPlayer);
}
