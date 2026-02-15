import type { GameState, SmallBoard, Player } from './gameLogic';
import { getLegalMoves, applyMove, getCurrentPlayer, checkSmallBoardWin, isSmallBoardFull } from './gameLogic';

/* ── Constants ─────────────────────────────────────────── */

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const CPU: Player = 'O';
const HUMAN: Player = 'X';

/** Position weights: center > corners > edges */
const POS_W = [3, 2, 3, 2, 4, 2, 3, 2, 3];

type Move = { bigRow: number; bigCol: number; smallRow: number; smallCol: number };

/* ── Helpers ───────────────────────────────────────────── */

function lineStats(cells: (Player | null)[], line: number[], player: Player) {
  let own = 0, opp = 0, empty = 0;
  const opponent = player === CPU ? HUMAN : CPU;
  for (const i of line) {
    if (cells[i] === player) own++;
    else if (cells[i] === opponent) opp++;
    else empty++;
  }
  return { own, opp, empty };
}

/* ── Evaluation ────────────────────────────────────────── */

/** Evaluate a single small board from CPU's perspective */
function evalSmallBoard(board: SmallBoard): number {
  let score = 0;
  for (const line of LINES) {
    const cpu = lineStats(board, line, CPU);
    const hum = lineStats(board, line, HUMAN);

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
    if (board[i] === CPU) score += POS_W[i];
    else if (board[i] === HUMAN) score -= POS_W[i];
  }

  return score;
}

/** Evaluate the meta / global board from CPU's perspective */
function evalGlobal(globalWins: (Player | null)[]): number {
  let score = 0;
  for (const line of LINES) {
    const cpu = lineStats(globalWins, line, CPU);
    const hum = lineStats(globalWins, line, HUMAN);

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
    if (globalWins[i] === CPU) score += POS_W[i] * 50;
    else if (globalWins[i] === HUMAN) score -= POS_W[i] * 40;
  }

  return score;
}

/** Full state evaluation: positive = good for CPU */
function evaluate(state: GameState): number {
  if (state.gameOver === CPU) return 200000;
  if (state.gameOver === HUMAN) return -200000;
  if (state.gameOver === 'draw') return 0;

  let score = evalGlobal(state.globalWins);

  // Evaluate each undecided small board, weighted by meta-position
  for (let bi = 0; bi < 9; bi++) {
    if (state.globalWins[bi] !== null) continue;
    score += evalSmallBoard(state.boards[bi]) * (POS_W[bi] / 3);
  }

  // Strategic: evaluate the nextBoard situation
  if (state.nextBoard !== null) {
    const nb = state.nextBoard;
    const isDead = state.globalWins[nb] !== null || isSmallBoardFull(state.boards[nb]);
    const current = getCurrentPlayer(state);
    if (isDead) {
      // Free choice for whoever must move
      score += current === CPU ? 30 : -30;
    } else {
      // Forced into a specific board – good if the board favors you
      const boardVal = evalSmallBoard(state.boards[nb]);
      if (current === CPU) score += boardVal > 0 ? 20 : -20;
      else score += boardVal < 0 ? -20 : 20;
    }
  }

  return score;
}

/* ── Move ordering ─────────────────────────────────────── */

/** Quick heuristic for move ordering (cheap, no applyMove call) */
function quickScore(state: GameState, move: Move): number {
  const player = getCurrentPlayer(state);
  const opp = player === CPU ? HUMAN : CPU;
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

  // Where does this send the opponent?
  const sentTo = ci;
  if (state.globalWins[sentTo] !== null || isSmallBoardFull(state.boards[sentTo])) {
    score -= 40; // Sending to dead board → opponent gets free choice
  } else {
    // Is the destination board favorable for us?
    const sentVal = evalSmallBoard(state.boards[sentTo]);
    // If sending the opponent to a board bad for them, that's good
    if (player === CPU && sentVal > 20) score += 25;
    else if (player === HUMAN && sentVal < -20) score += 25;
  }

  return score;
}

/** Sort moves for better alpha-beta pruning (best first for current player) */
function orderMoves(state: GameState, moves: Move[]): Move[] {
  return moves
    .map(m => ({ m, s: quickScore(state, m) }))
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
): { score: number; move: Move | null } {
  const moves = getLegalMoves(state);

  if (state.gameOver !== null || moves.length === 0 || depth >= maxDepth) {
    let score = evaluate(state);
    // Prefer faster wins / slower losses
    if (state.gameOver === CPU) score += (maxDepth - depth) * 500;
    else if (state.gameOver === HUMAN) score -= (maxDepth - depth) * 500;
    return { score, move: moves[0] ?? null };
  }

  // Order moves at shallow depths for much better pruning
  const ordered = depth <= 1 ? orderMoves(state, moves) : moves;

  if (isMax) {
    let best = -Infinity;
    let bestMove: Move | null = null;
    for (const move of ordered) {
      const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
      const nextMax = getCurrentPlayer(next) === CPU;
      const { score } = minimax(next, depth + 1, maxDepth, nextMax, alpha, beta);
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
      const nextMax = getCurrentPlayer(next) === CPU;
      const { score } = minimax(next, depth + 1, maxDepth, nextMax, alpha, beta);
      if (score < best) { best = score; bestMove = move; }
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return { score: best, move: bestMove };
  }
}

/* ── Heuristic move (1-step lookahead) ─────────────────── */

function heuristicMove(state: GameState): Move {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return { bigRow: 0, bigCol: 0, smallRow: 0, smallCol: 0 };

  let best = -Infinity;
  let bestMoves: Move[] = [];

  for (const move of moves) {
    const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
    const score = next.gameOver === CPU ? 100000 : next.gameOver === HUMAN ? -100000 : evaluate(next);
    if (score > best) { best = score; bestMoves = [move]; }
    else if (score === best) bestMoves.push(move);
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

/* ── Public API ────────────────────────────────────────── */

/**
 * Get CPU move. Difficulty 1 = random, 10 = deep minimax.
 *
 * Level  1    : pure random
 * Level  2–3  : random / heuristic mix
 * Level  4    : heuristic only
 * Level  5    : heuristic + occasional depth-1 minimax
 * Level  6–10 : minimax depth 2–6 (with adaptive depth for open boards)
 */
export function getCPUMove(state: GameState, difficulty: number): Move {
  const moves = getLegalMoves(state);
  if (moves.length === 0) return { bigRow: 0, bigCol: 0, smallRow: 0, smallCol: 0 };
  if (moves.length === 1) return moves[0];

  const d = Math.max(1, Math.min(10, difficulty));

  // Level 1: pure random
  if (d === 1) return moves[Math.floor(Math.random() * moves.length)];

  // Level 2–3: random with increasing heuristic chance
  if (d <= 3) {
    return Math.random() < (d - 1) / 3
      ? heuristicMove(state)
      : moves[Math.floor(Math.random() * moves.length)];
  }

  // Level 4: always heuristic
  if (d === 4) return heuristicMove(state);

  // Level 5: heuristic with occasional depth-1 minimax
  if (d === 5) {
    if (Math.random() < 0.5) {
      const isMax = getCurrentPlayer(state) === CPU;
      const { move } = minimax(state, 0, 1, isMax, -Infinity, Infinity);
      if (move) return move;
    }
    return heuristicMove(state);
  }

  // Level 6–10: minimax with depth 2–6
  let depth = d - 4; // 2, 3, 4, 5, 6

  // Adaptive: reduce depth when branching is very high (open board)
  if (moves.length > 20) depth = Math.max(2, depth - 2);
  else if (moves.length > 12) depth = Math.max(3, depth - 1);

  const isMax = getCurrentPlayer(state) === CPU;
  const { move } = minimax(state, 0, depth, isMax, -Infinity, Infinity);
  return move ?? heuristicMove(state);
}
