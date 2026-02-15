/** Player symbols in turn order. Indices 0..numPlayers-1 are used. */
export const PLAYER_SYMBOLS = ['X', 'O', '△', '□'] as const;
export type Player = (typeof PLAYER_SYMBOLS)[number];
export type CellValue = Player | null;

/** One small 3x3 board: row-major, 9 cells */
export type SmallBoard = [CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue, CellValue];

/** Global wins: index 0..8 = small board index (row * 3 + col). null = not won, else won by that player */
export type GlobalWins = (Player | null)[];

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

function getEmptyCellsInBoard(board: SmallBoard): number[] {
  const out: number[] = [];
  for (let i = 0; i < 9; i++) if (board[i] === null) out.push(i);
  return out;
}

/** Returns list of legal moves: each is { bigRow, bigCol, smallRow, smallCol } (0..2 each). */
export function getLegalMoves(state: GameState): { bigRow: number; bigCol: number; smallRow: number; smallCol: number }[] {
  if (state.gameOver !== null) return [];

  const moves: { bigRow: number; bigCol: number; smallRow: number; smallCol: number }[] = [];
  const { nextBoard, boards, globalWins } = state;
  const currentPlayer = getCurrentPlayer(state);

  const boardIndices: number[] =
    nextBoard !== null && isBoardPlayable(globalWins, nextBoard)
      ? [nextBoard]
      : [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => isBoardPlayable(globalWins, i));

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

export function createInitialState(numPlayers: 2 | 3 | 4 = 2): GameState {
  const emptyBoard: SmallBoard = [null, null, null, null, null, null, null, null, null];
  return {
    boards: Array(9)
      .fill(null)
      .map(() => [...emptyBoard] as SmallBoard),
    globalWins: Array(9).fill(null),
    nextBoard: null,
    numPlayers,
    currentPlayerIndex: 0,
    gameOver: null,
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
  if (board[cellIndex] !== null) return state;
  if (state.globalWins[boardIndex] !== null) return state;
  if (state.gameOver !== null) return state;

  // Enforce nextBoard constraint: must play in the designated board if it's still playable
  if (state.nextBoard !== null && state.nextBoard !== boardIndex) {
    const nb = state.nextBoard;
    if (state.globalWins[nb] === null && !isSmallBoardFull(state.boards[nb])) {
      return state;
    }
  }

  const currentPlayer = getCurrentPlayer(state);
  const nextBoard = [...state.boards] as SmallBoard[];
  const newSmall = [...board] as SmallBoard;
  newSmall[cellIndex] = currentPlayer;
  nextBoard[boardIndex] = newSmall;

  const nextGlobalWins = [...state.globalWins];
  const smallWinner = checkSmallBoardWin(newSmall);
  if (smallWinner) nextGlobalWins[boardIndex] = smallWinner;

  const globalWinner = checkGlobalWin(nextGlobalWins);
  const nextBoardConstraint = smallWinner !== null || isSmallBoardFull(newSmall) ? null : cellIndex;
  const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.numPlayers;

  const legalMoves = getLegalMoves({
    ...state,
    boards: nextBoard,
    globalWins: nextGlobalWins,
    nextBoard: nextBoardConstraint,
    currentPlayerIndex: nextPlayerIndex,
    gameOver: null,
  });
  const isDraw = globalWinner === null && legalMoves.length === 0;

  return {
    boards: nextBoard,
    globalWins: nextGlobalWins,
    nextBoard: nextBoardConstraint,
    numPlayers: state.numPlayers,
    currentPlayerIndex: nextPlayerIndex,
    gameOver: globalWinner ?? (isDraw ? 'draw' : null),
  };
}
