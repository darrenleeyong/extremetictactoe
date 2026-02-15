'use client';

import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameBoard from '@/components/GameBoard';
import GameOverDialog from '@/components/GameOverDialog';
import GameMenu from '@/components/GameMenu';
import {
  createInitialState,
  applyMove,
  getLegalMoves,
  isSmallBoardFull,
  getCurrentPlayer,
  PLAYER_SYMBOLS,
  type GameState,
  type Player,
} from '@/lib/gameLogic';
import { getCPUMove } from '@/lib/cpuPlayer';
import { calculateScore } from '@/lib/scoring';

const CPU_DELAY_MS = 400;
const HELL_TURN_SECONDS = 5;

type GameMode = 'single' | 'two' | 'three' | 'four' | 'hell';

function parseModeAndPlayers(searchParams: ReturnType<typeof useSearchParams>): {
  mode: 'single' | 'multi';
  numPlayers: 2 | 3 | 4;
  difficulty: number;
  gameMode: GameMode;
  isHellMode: boolean;
} {
  const modeParam = searchParams.get('mode');
  const difficulty = Math.max(1, Math.min(10, Number(searchParams.get('difficulty')) || 5));

  if (modeParam === 'hell') {
    return { mode: 'single', numPlayers: 2, difficulty: 10, gameMode: 'hell', isHellMode: true };
  }
  if (modeParam === 'single') {
    return { mode: 'single', numPlayers: 2, difficulty, gameMode: 'single', isHellMode: false };
  }
  if (modeParam === 'three') return { mode: 'multi', numPlayers: 3, difficulty: 5, gameMode: 'three', isHellMode: false };
  if (modeParam === 'four') return { mode: 'multi', numPlayers: 4, difficulty: 5, gameMode: 'four', isHellMode: false };
  return { mode: 'multi', numPlayers: 2, difficulty: 5, gameMode: 'two', isHellMode: false };
}

function GamePageContent() {
  const searchParams = useSearchParams();
  const { mode, numPlayers, difficulty, gameMode, isHellMode } = parseModeAndPlayers(searchParams);

  const [state, setState] = useState<GameState>(() => createInitialState(numPlayers));
  const [cpuThinking, setCpuThinking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scoring / tracking state
  const [playerMoves, setPlayerMoves] = useState(0);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Hell mode timer
  const [timeLeft, setTimeLeft] = useState(HELL_TURN_SECONDS);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Track elapsed time (updates every second for live score display)
  useEffect(() => {
    if (mode !== 'single') return;
    if (state.gameOver !== null) return;
    const interval = setInterval(() => {
      setElapsed((Date.now() - startTime) / 1000);
    }, 1000);
    return () => clearInterval(interval);
  }, [mode, startTime, state.gameOver]);

  // Set final elapsed on game over
  useEffect(() => {
    if (state.gameOver !== null && mode === 'single') {
      setElapsed((Date.now() - startTime) / 1000);
    }
  }, [state.gameOver, mode, startTime]);

  const score = useMemo(() => {
    const counts: Record<Player, number> = { X: 0, O: 0, '△': 0, '□': 0 };
    let tied = 0;
    const symbols = PLAYER_SYMBOLS.slice(0, numPlayers);
    for (let i = 0; i < 9; i++) {
      const w = state.globalWins[i];
      if (w !== null && symbols.includes(w)) counts[w]++;
      else if (isSmallBoardFull(state.boards[i])) tied++;
    }
    return { counts, tied, symbols };
  }, [state.globalWins, state.boards, numPlayers]);

  // Calculate live points (single player only)
  const livePoints = useMemo(() => {
    if (mode !== 'single') return null;
    return calculateScore({
      playerMoves,
      totalSeconds: elapsed,
      boardsWon: score.counts['X'],
      boardsLost: score.counts['O'],
      result: state.gameOver === 'X' ? 'win' : state.gameOver === 'O' ? 'loss' : state.gameOver === 'draw' ? 'draw' : null,
      difficulty,
      isHellMode,
    });
  }, [mode, playerMoves, elapsed, score.counts, state.gameOver, difficulty, isHellMode]);

  const handleCellClick = useCallback(
    (bigRow: number, bigCol: number, smallRow: number, smallCol: number) => {
      if (state.gameOver !== null || cpuThinking) return;
      if (mode === 'single' && getCurrentPlayer(state) !== 'X') return;
      const next = applyMove(state, bigRow, bigCol, smallRow, smallCol);
      if (next === state) return; // Move was invalid (wrong board, occupied cell, etc.)
      setState(next);

      if (mode === 'single') {
        setPlayerMoves((prev) => prev + 1);
      }

      if (mode === 'single' && next.gameOver === null && getCurrentPlayer(next) === 'O') {
        setCpuThinking(true);
      }
    },
    [state, mode, cpuThinking]
  );

  // CPU move effect
  useEffect(() => {
    if (mode !== 'single' || state.currentPlayerIndex !== 1 || state.gameOver !== null || cpuThinking === false)
      return;
    const timer = setTimeout(() => {
      const move = getCPUMove(state, difficulty);
      const next = applyMove(state, move.bigRow, move.bigCol, move.smallRow, move.smallCol);
      setState(next);
      setCpuThinking(false);
    }, CPU_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mode, state.currentPlayerIndex, state.gameOver, cpuThinking, state, difficulty]);

  // Hell mode timer effect
  useEffect(() => {
    if (!isHellMode || state.gameOver !== null || cpuThinking) return;
    if (state.currentPlayerIndex !== 0) return; // Only time the human player

    const start = Date.now();
    setTimeLeft(HELL_TURN_SECONDS);

    const interval = setInterval(() => {
      const remaining = Math.max(0, HELL_TURN_SECONDS - (Date.now() - start) / 1000);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Time's up: make a random legal move for the human
        const currentState = stateRef.current;
        if (currentState.gameOver !== null || currentState.currentPlayerIndex !== 0) return;
        const moves = getLegalMoves(currentState);
        if (moves.length > 0) {
          const randomMove = moves[Math.floor(Math.random() * moves.length)];
          const next = applyMove(currentState, randomMove.bigRow, randomMove.bigCol, randomMove.smallRow, randomMove.smallCol);
          setState(next);
          setPlayerMoves((prev) => prev + 1);
          if (next.gameOver === null && getCurrentPlayer(next) === 'O') {
            setCpuThinking(true);
          }
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isHellMode, state.currentPlayerIndex, state.gameOver, cpuThinking]);

  const handleRematch = useCallback(() => {
    setState(createInitialState(numPlayers));
    setCpuThinking(false);
    setPlayerMoves(0);
    setStartTime(Date.now());
    setElapsed(0);
    setTimeLeft(HELL_TURN_SECONDS);
  }, [numPlayers]);

  const handleLoadGame = useCallback(
    (loaded: { state: GameState; mode: 'single' | 'two' | 'three' | 'four' | 'hell'; difficulty: number | null }) => {
      setState(loaded.state);
      setCpuThinking(false);
      setPlayerMoves(0);
      setStartTime(Date.now());
      setElapsed(0);
    },
    []
  );

  const gameOver = state.gameOver !== null;
  const winner = state.gameOver === 'draw' ? 'draw' : state.gameOver;
  const hasFilledBoards = score.symbols.some((s) => score.counts[s] > 0) || score.tied > 0;

  const isSinglePlayer = mode === 'single';
  const statusLine = isSinglePlayer
    ? isHellMode
      ? `HELL MODE · Level 10`
      : `You are X · CPU is O · Level ${difficulty}`
    : score.symbols.join(' · ') + ' (same device)';

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Game stats for leaderboard submission
  const gameStats = isSinglePlayer
    ? {
        mode: gameMode,
        difficulty,
        playerMoves,
        totalSeconds: elapsed,
        result: (state.gameOver === 'X' ? 'win' : state.gameOver === 'O' ? 'loss' : 'draw') as 'win' | 'loss' | 'draw',
      }
    : null;

  return (
    <div className="flex-1 flex flex-col py-4 px-2 max-w-sm mx-auto w-full">
      {/* Status bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex-1 flex justify-center min-w-0">
          {hasFilledBoards ? (
            <p className="text-sm font-semibold truncate flex flex-wrap justify-center gap-x-1 gap-y-0">
              {score.symbols.map((sym) => (
                <span key={sym} className={symbolColorClass(sym)}>
                  {sym} {score.counts[sym]}
                </span>
              ))}
              {score.tied > 0 && (
                <span className="text-zinc-500 dark:text-zinc-400">· Tied {score.tied}</span>
              )}
            </p>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{statusLine}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 ml-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Score / timer bar for single player */}
      {isSinglePlayer && (
        <div className="mb-2 px-1">
          <div className="flex items-center justify-center gap-3 text-xs font-medium">
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {livePoints?.toLocaleString() ?? 0} pts
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">|</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              Moves: {playerMoves}
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">|</span>
            <span className="text-zinc-600 dark:text-zinc-400">
              {formatTime(elapsed)}
            </span>
          </div>

          {/* Hell mode countdown timer */}
          {isHellMode && !gameOver && state.currentPlayerIndex === 0 && !cpuThinking && (
            <div className="mt-1.5">
              <div className="relative h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-100 ${
                    timeLeft > 2.5
                      ? 'bg-emerald-500'
                      : timeLeft > 1
                        ? 'bg-amber-500'
                        : 'bg-red-500 animate-pulse'
                  }`}
                  style={{ width: `${(timeLeft / HELL_TURN_SECONDS) * 100}%` }}
                />
              </div>
              <p className={`text-center text-xs font-bold mt-0.5 ${
                timeLeft > 2.5
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : timeLeft > 1
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
              }`}>
                {timeLeft.toFixed(1)}s
              </p>
            </div>
          )}
        </div>
      )}

      {/* Game board */}
      <div className="flex-1 flex items-center justify-center">
        <GameBoard state={state} onCellClick={handleCellClick} />
      </div>

      {/* Game over dialog */}
      <GameOverDialog
        open={gameOver}
        winner={winner}
        score={score}
        onRematch={handleRematch}
        points={isSinglePlayer ? livePoints ?? 0 : undefined}
        gameStats={gameStats ?? undefined}
      />

      {/* Menu */}
      <GameMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onRestart={handleRematch}
        state={state}
        gameMode={gameMode}
        difficulty={difficulty}
        onLoadGame={handleLoadGame}
      />
    </div>
  );
}

function symbolColorClass(sym: Player): string {
  switch (sym) {
    case 'X': return 'text-violet-600 dark:text-violet-400';
    case 'O': return 'text-amber-500 dark:text-amber-400';
    case '△': return 'text-emerald-600 dark:text-emerald-400';
    case '□': return 'text-rose-500 dark:text-rose-400';
    default: return 'text-zinc-600 dark:text-zinc-400';
  }
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center max-w-sm mx-auto">
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      }
    >
      <GamePageContent />
    </Suspense>
  );
}
