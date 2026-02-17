/** Player symbols in turn order. Indices 0..numPlayers-1 are used. */
export const PLAYER_SYMBOLS = ['X', 'O', '△', '□'] as const;
export type Player = (typeof PLAYER_SYMBOLS)[number];
export type CellValue = Player | null;

/** One small 3x3 board: row-major, 9 cells */
export type SmallBoard = [CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue];

/** Global wins: index 0..8 = small board index (row * 3 + col). null = not won, else won by that player */
export type GlobalWins = (Player | null)[];

/** Board position names for UI labels */
export const BOARD_NAMES = [
  'Top-Left', 'Top-Center', 'Top-Right',
  'Mid-Left', 'Center', 'Mid-Right',
  'Bot-Left', 'Bot-Center', 'Bot-Right',
] as const;

/** Cell position names within a small board (same 3x3 layout) */
export const CELL_NAMES = [
  'top-left', 'top-center', 'top-right',
  'mid-left', 'center', 'mid-right',
  'bottom-left', 'bottom-center', 'bottom-right',
] as const;

/** nextBoard: 0..8 = must play in that small board; null = play anywhere */
export interface GameState {
  /** 9 small boards, row-major (bigRow * 3 + bigCol) */
  boards: SmallBoard[];
  /** Who won each small board (or null) */
  globalWins: GlobalWins;
  /** Which small board the next player must play in (null = any) */
  nextBoard: number | null;
  /** Number of players (2, 3, or 4) */
  numPlayers: 2 | 3 | 4;
  /** Index of current player (0 to numPlayers-1). currentPlayer = PLAYER_SYMBOLS[currentPlayerIndex] */
  currentPlayerIndex: number;
  /** null = game ongoing, Player = winner, 'draw' = draw */
  gameOver: Player | 'draw' | null;
  /** Current index into the masterQueue (0-80). Pauses during wildcard turns. */
  queuePosition: number;
  /** If true, current player has wildcard choice (any incomplete board) */
  hasWildcard: boolean;
  /** 81-item queue: 9 concatenated shuffles of [0..8], one per game */
  masterQueue: number[];
}

/** Current player symbol for this state */
export function getCurrentPlayer(state: GameState): Player {
  return PLAYER_SYMBOLS[state.currentPlayerIndex];
}

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

export function checkSmallBoardWin(board: SmallBoard): Player | null {
  for (const [a, b, c] of LINES_3) {
    const va = board[a];
    if (va && va === board[b] && va === board[c]) return va;
  }
  return null;
}

export function isSmallBoardFull(board: SmallBoard): boolean {
  return board.every((c) => c !== null);
}

export function checkGlobalWin(globalWins: GlobalWins): Player | null {
  for (const [a, b, c] of LINES_3) {
    const va = globalWins[a];
    if (va && va === globalWins[b] && va === globalWins[c]) return va;
  }
  return null;
}

/** Whether small board at index is playable (not won and not full) */
export function isBoardPlayable(globalWins: GlobalWins, boardIndex: number): boolean {
  if (globalWins[boardIndex] !== null) return false;
  return true;
}

/** Fisher-Yates shuffle of [0..8] */
function shuffleNine(): number[] {
  const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Generate the 81-item master queue: 9 independent shuffles of [0..8] concatenated */
function generateMasterQueue(): number[] {
  const queue: number[] = [];
  for (let s = 0; s < 9; s++) {
    queue.push(...shuffleNine());
  }
  return queue;
}

function getEmptyCellsInBoard(board: SmallBoard): number[] {
  const out: number[] = [];
  for (let i = 0; i < 9; i++) if (board[i] === null) out.push(i);
  return out;
}

/** Returns list of legal moves: each is { bigRow, bigCol, smallRow, smallCol } (0..2 each). */
export function getLegalMoves(state: GameState): { bigRow: number; bigCol: number; smallRow: number; smallCol: number }[] {
  if (state.gameOver !== null) return [];

  const moves: { bigRow: number; bigCol: number; smallRow: number; smallCol: number }[] = [];
  const { boards, globalWins, queuePosition, hasWildcard, masterQueue } = state;

  let boardIndices: number[];
  
  if (hasWildcard) {
    // Wildcard: can play in any incomplete board
    boardIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => isBoardPlayable(globalWins, i) && !isSmallBoardFull(boards[i]));
  } else if (queuePosition < masterQueue.length) {
    // Must follow queue: play in the board at current queue position
    const targetBoard = masterQueue[queuePosition];
    if (isBoardPlayable(globalWins, targetBoard) && !isSmallBoardFull(boards[targetBoard])) {
      boardIndices = [targetBoard];
    } else {
      // Queue board is unplayable — fallback to any playable board
      boardIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => isBoardPlayable(globalWins, i) && !isSmallBoardFull(boards[i]));
    }
  } else {
    // Queue exhausted — free choice
    boardIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => isBoardPlayable(globalWins, i) && !isSmallBoardFull(boards[i]));
  }

  for (const bi of boardIndices) {
    const board = boards[bi];
    const empty = getEmptyCellsInBoard(board);
    const bigRow = Math.floor(bi / 3);
    const bigCol = bi % 3;
    for (const si of empty) {
      const smallRow = Math.floor(si / 3);
      const smallCol = si % 3;
      moves.push({ bigRow, bigCol, smallRow, smallCol });
    }
  }
  return moves;
}

export function createInitialState(numPlayers: 2 | 3 | 4 = 2, randomStart: boolean = false): GameState {
  const emptyBoard: SmallBoard = [null, null, null, null, null, null, null, null, null];
  
  // Randomize starting player if requested
  const startingPlayerIndex = randomStart ? Math.floor(Math.random() * numPlayers) : 0;
  
  // Generate the 81-item master queue for this game
  const masterQueue = generateMasterQueue();
  
  return {
    boards: Array(9)
      .fill(null)
      .map(() => [...emptyBoard] as SmallBoard),
    globalWins: Array(9).fill(null),
    nextBoard: masterQueue[0],
    numPlayers,
    currentPlayerIndex: startingPlayerIndex,
    gameOver: null,
    queuePosition: 0,
    hasWildcard: false,
    masterQueue,
  };
}

export function applyMove(
  state: GameState,
  bigRow: number,
  bigCol: number,
  smallRow: number,
  smallCol: number
): GameState {
  const boardIndex = bigRow * 3 + bigCol;
  const cellIndex = smallRow * 3 + smallCol;
  const board = state.boards[boardIndex];
  
  // Validation checks
  if (board[cellIndex] !== null) return state;
  if (state.globalWins[boardIndex] !== null) return state;
  if (state.gameOver !== null) return state;

  // Enforce queue rule: must play in correct board unless wildcard
  if (!state.hasWildcard && state.queuePosition < state.masterQueue.length) {
    const expectedBoard = state.masterQueue[state.queuePosition];
    if (boardIndex !== expectedBoard) {
      // Only reject if the expected board is still playable
      if (state.globalWins[expectedBoard] === null && !isSmallBoardFull(state.boards[expectedBoard])) {
        return state; // Invalid move
      }
    }
  }

  const currentPlayer = getCurrentPlayer(state);
  const nextBoards = [...state.boards] as SmallBoard[];
  const newSmall = [...board] as SmallBoard;
  newSmall[cellIndex] = currentPlayer;
  nextBoards[boardIndex] = newSmall;

  const nextGlobalWins = [...state.globalWins];
  const smallWinner = checkSmallBoardWin(newSmall);
  if (smallWinner) nextGlobalWins[boardIndex] = smallWinner;

  const boardCompleted = smallWinner !== null || isSmallBoardFull(newSmall);
  const globalWinner = checkGlobalWin(nextGlobalWins);
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.numPlayers;

  const queue = state.masterQueue;
  let nextQueuePos: number;
  let nextHasWildcard: boolean;
  let nextBoardIndex: number | null;

  if (state.hasWildcard) {
    // Wildcard move — queue was PAUSED, position does not advance
    nextQueuePos = state.queuePosition;
    if (boardCompleted) {
      // Chained wildcard: this wildcard also completed a board
      nextHasWildcard = true;
      nextBoardIndex = null;
    } else {
      // Wildcard done, resume queue from the paused position
      nextHasWildcard = false;
      nextBoardIndex = nextQueuePos < queue.length ? queue[nextQueuePos] : null;
    }
  } else {
    // Normal move — advance the queue pointer (this slot was consumed)
    nextQueuePos = state.queuePosition + 1;
    if (boardCompleted) {
      // Board completed: next player gets wildcard, queue pauses at new position
      nextHasWildcard = true;
      nextBoardIndex = null;
    } else {
      // Normal progression
      nextHasWildcard = false;
      nextBoardIndex = nextQueuePos < queue.length ? queue[nextQueuePos] : null;
    }
  }

  // If next board is unplayable, skip forward in queue until we find one
  while (nextBoardIndex !== null && !nextHasWildcard) {
    if (nextGlobalWins[nextBoardIndex] === null && !isSmallBoardFull(nextBoards[nextBoardIndex])) {
      break; // Found playable board
    }
    // Skip this unplayable slot
    nextQueuePos++;
    if (nextQueuePos >= queue.length) {
      // Queue exhausted — give wildcard
      nextHasWildcard = true;
      nextBoardIndex = null;
      break;
    }
    nextBoardIndex = queue[nextQueuePos];
  }

  // Safety: if queue exhausted and no wildcard yet, allow free choice
  if (!nextHasWildcard && nextBoardIndex === null) {
    const anyPlayable = nextGlobalWins.some((w, i) => w === null && !isSmallBoardFull(nextBoards[i]));
    if (anyPlayable) {
      nextHasWildcard = true;
    }
  }

  const newState: GameState = {
    boards: nextBoards,
    globalWins: nextGlobalWins,
    nextBoard: nextBoardIndex,
    numPlayers: state.numPlayers,
    currentPlayerIndex: nextPlayerIndex,
    gameOver: null,
    queuePosition: nextQueuePos,
    hasWildcard: nextHasWildcard,
    masterQueue: state.masterQueue,
  };

  // Check for draw
  const legalMoves = getLegalMoves(newState);
  const isDraw = globalWinner === null && legalMoves.length === 0;

  newState.gameOver = globalWinner ?? (isDraw ? 'draw' : null);

  return newState;
}
