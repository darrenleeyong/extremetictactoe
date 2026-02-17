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
  sequencePosition: number;
  hasWildcard: boolean;
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
    sequencePosition: state.sequencePosition,
    hasWildcard: state.hasWildcard,
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
  const sequencePosition = typeof obj.sequencePosition === 'number' ? obj.sequencePosition : 0;
  const hasWildcard = typeof obj.hasWildcard === 'boolean' ? obj.hasWildcard : false;

  return {
    boards,
    globalWins,
    nextBoard: nextBoard as number | null,
    numPlayers: numPlayers as 2 | 3 | 4,
    currentPlayerIndex,
    gameOver: gameOver as GameState['gameOver'],
    sequencePosition,
    hasWildcard,
  };
}
