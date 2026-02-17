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
  /** Current position in the sequential board progression (0-8) */
  sequencePosition: number;
  /** If true, current player has wildcard choice (any incomplete board) */
  hasWildcard: boolean;
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

/** Sequential board order: 0->1->2->3->4->5->6->7->8 (looping) */
const BOARD_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/** Get the next board index in the sequence */
export function getNextSequencePosition(currentPos: number): number {
  return (currentPos + 1) % 9;
}

/** Get the board index at a given sequence position */
export function getBoardAtSequence(position: number): number {
  return BOARD_SEQUENCE[position];
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
  const { boards, globalWins, sequencePosition, hasWildcard } = state;

  let boardIndices: number[];
  
  if (hasWildcard) {
    // Player has wildcard: can play in any incomplete board
    boardIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => isBoardPlayable(globalWins, i) && !isSmallBoardFull(boards[i]));
  } else {
    // Must follow sequence: play in the board at current sequence position
    const targetBoard = getBoardAtSequence(sequencePosition);
    if (isBoardPlayable(globalWins, targetBoard) && !isSmallBoardFull(boards[targetBoard])) {
      boardIndices = [targetBoard];
    } else {
      // If sequence board is not playable, skip to next in sequence
      // This handles edge cases but shouldn't happen often
      boardIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => isBoardPlayable(globalWins, i) && !isSmallBoardFull(boards[i]));
    }
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
  
  return {
    boards: Array(9)
      .fill(null)
      .map(() => [...emptyBoard] as SmallBoard),
    globalWins: Array(9).fill(null),
    nextBoard: 0, // Start at board 0 in the sequence
    numPlayers,
    currentPlayerIndex: startingPlayerIndex,
    gameOver: null,
    sequencePosition: 0, // Start at position 0 in sequence
    hasWildcard: false, // No wildcard at start
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

  // Enforce sequential rule: must play in correct board unless has wildcard
  if (!state.hasWildcard) {
    const expectedBoard = getBoardAtSequence(state.sequencePosition);
    if (boardIndex !== expectedBoard) {
      // Check if expected board is still playable
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

  // Determine next sequence position and wildcard status
  let nextSequencePosition: number;
  let nextHasWildcard: boolean;
  let nextBoardIndex: number | null;

  if (boardCompleted) {
    // Board was completed: next player gets wildcard
    nextHasWildcard = true;
    nextSequencePosition = state.sequencePosition; // Keep position, will update after wildcard is used
    nextBoardIndex = null; // Will be determined by wildcard choice
  } else if (state.hasWildcard) {
    // Wildcard was used: resume sequence from chosen board
    nextHasWildcard = false;
    // Find the position of the chosen board in the sequence
    nextSequencePosition = BOARD_SEQUENCE.indexOf(boardIndex);
    // Advance to next in sequence
    nextSequencePosition = getNextSequencePosition(nextSequencePosition);
    nextBoardIndex = getBoardAtSequence(nextSequencePosition);
  } else {
    // Normal sequence progression
    nextHasWildcard = false;
    nextSequencePosition = getNextSequencePosition(state.sequencePosition);
    nextBoardIndex = getBoardAtSequence(nextSequencePosition);
  }

  // If next board is not playable, keep advancing sequence until we find one
  while (nextBoardIndex !== null && !nextHasWildcard) {
    if (nextGlobalWins[nextBoardIndex] === null && !isSmallBoardFull(nextBoards[nextBoardIndex])) {
      break; // Found playable board
    }
    nextSequencePosition = getNextSequencePosition(nextSequencePosition);
    nextBoardIndex = getBoardAtSequence(nextSequencePosition);
    
    // Safety check: if we've looped through all boards, give wildcard
    const allComplete = nextGlobalWins.every((w, i) => w !== null || isSmallBoardFull(nextBoards[i]));
    if (allComplete) {
      nextHasWildcard = true;
      nextBoardIndex = null;
      break;
    }
  }

  const newState: GameState = {
    boards: nextBoards,
    globalWins: nextGlobalWins,
    nextBoard: nextBoardIndex,
    numPlayers: state.numPlayers,
    currentPlayerIndex: nextPlayerIndex,
    gameOver: null,
    sequencePosition: nextSequencePosition,
    hasWildcard: nextHasWildcard,
  };

  // Check for draw
  const legalMoves = getLegalMoves(newState);
  const isDraw = globalWinner === null && legalMoves.length === 0;

  newState.gameOver = globalWinner ?? (isDraw ? 'draw' : null);

  return newState;
}
