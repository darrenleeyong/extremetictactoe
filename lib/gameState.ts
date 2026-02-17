import type { GameState, SmallBoard, Player } from '@/lib/gameLogic';
import { PLAYER_SYMBOLS } from '@/lib/gameLogic';

const VALID_PLAYERS: readonly Player[] = PLAYER_SYMBOLS;

export type SerializedState = {
  boards: (Player | null)[][];
  globalWins: (Player | null)[];
  nextBoard: number | null;
  numPlayers: 2 | 3 | 4;
  currentPlayerIndex: number;
  gameOver: Player | 'draw' | null;
  queuePosition: number;
  hasWildcard: boolean;
  masterQueue: number[];
};

function isPlayer(x: unknown): x is Player {
  return typeof x === 'string' && (VALID_PLAYERS as readonly string[]).includes(x);
}

function isCellValue(x: unknown): x is Player | null {
  return x === null || isPlayer(x);
}

function isSmallBoard(raw: unknown): raw is SmallBoard {
  if (!Array.isArray(raw) || raw.length !== 9) return false;
  return raw.every((c) => isCellValue(c));
}

function isGlobalWins(raw: unknown): raw is (Player | null)[] {
  if (!Array.isArray(raw) || raw.length !== 9) return false;
  return raw.every((c) => isCellValue(c));
}

/** Serialize GameState to a plain object for JSONB storage. */
export function serializeState(state: GameState): SerializedState {
  return {
    boards: state.boards.map((b) => [...b]),
    globalWins: [...state.globalWins],
    nextBoard: state.nextBoard,
    numPlayers: state.numPlayers,
    currentPlayerIndex: state.currentPlayerIndex,
    gameOver: state.gameOver,
    queuePosition: state.queuePosition,
    hasWildcard: state.hasWildcard,
    masterQueue: [...state.masterQueue],
  };
}

/** Deserialize from DB JSON (object or string) to GameState. Throws if invalid. */
export function deserializeState(json: unknown): GameState {
  const raw = typeof json === 'string' ? (JSON.parse(json) as unknown) : json;
  if (!raw || typeof raw !== 'object') throw new Error('Invalid game state: not an object');

  const obj = raw as Record<string, unknown>;

  const boardsRaw = obj.boards;
  if (!Array.isArray(boardsRaw) || boardsRaw.length !== 9) throw new Error('Invalid game state: boards');
  const boards = boardsRaw.map((b) => {
    if (!isSmallBoard(b)) throw new Error('Invalid game state: invalid small board');
    return b;
  });

  const globalWins = obj.globalWins;
  if (!isGlobalWins(globalWins)) throw new Error('Invalid game state: globalWins');

  const nextBoard = obj.nextBoard;
  if (nextBoard !== null && (typeof nextBoard !== 'number' || nextBoard < 0 || nextBoard > 8)) {
    throw new Error('Invalid game state: nextBoard');
  }

  const numPlayers = obj.numPlayers;
  if (numPlayers !== 2 && numPlayers !== 3 && numPlayers !== 4) {
    throw new Error('Invalid game state: numPlayers');
  }

  const currentPlayerIndex = obj.currentPlayerIndex;
  if (typeof currentPlayerIndex !== 'number' || currentPlayerIndex < 0 || currentPlayerIndex >= numPlayers) {
    throw new Error('Invalid game state: currentPlayerIndex');
  }

  const gameOver = obj.gameOver;
  if (gameOver !== null && gameOver !== 'draw' && !isPlayer(gameOver)) {
    throw new Error('Invalid game state: gameOver');
  }

  // Handle new fields with backward compatibility
  const queuePosition = typeof obj.queuePosition === 'number'
    ? obj.queuePosition
    : typeof obj.sequencePosition === 'number'
      ? obj.sequencePosition
      : 0;
  const hasWildcard = typeof obj.hasWildcard === 'boolean' ? obj.hasWildcard : false;
  
  // Backward compat: accept masterQueue (81 items) or old masterSequence (9 items, expand to 81)
  let masterQueue: number[];
  if (Array.isArray(obj.masterQueue) && obj.masterQueue.length === 81) {
    masterQueue = obj.masterQueue as number[];
  } else if (Array.isArray(obj.masterSequence) && obj.masterSequence.length === 9) {
    // Repeat the old 9-item sequence 9 times to form 81
    const seq = obj.masterSequence as number[];
    masterQueue = [];
    for (let i = 0; i < 9; i++) masterQueue.push(...seq);
  } else {
    // Absolute fallback: 9 copies of [0..8]
    masterQueue = [];
    for (let i = 0; i < 9; i++) masterQueue.push(0, 1, 2, 3, 4, 5, 6, 7, 8);
  }

  return {
    boards,
    globalWins,
    nextBoard: nextBoard as number | null,
    numPlayers: numPlayers as 2 | 3 | 4,
    currentPlayerIndex,
    gameOver: gameOver as GameState['gameOver'],
    queuePosition,
    hasWildcard,
    masterQueue,
  };
}
