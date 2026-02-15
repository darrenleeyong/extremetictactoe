'use client';

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import GameBoard from '@/components/GameBoard';
import GameOverDialog from '@/components/GameOverDialog';
import GameMenu from '@/components/GameMenu';
import {
  createInitialState,
  applyMove,
  isSmallBoardFull,
  getCurrentPlayer,
  PLAYER_SYMBOLS,
  type GameState,
  type Player,
} from '@/lib/gameLogic';
import { getCPUMove } from '@/lib/cpuPlayer';

const CPU_DELAY_MS = 400;

type GameMode = 'single' | 'two' | 'three' | 'four';

function parseModeAndPlayers(searchParams: ReturnType<typeof useSearchParams>): { mode: 'single' | 'multi'; numPlayers: 2 | 3 | 4; difficulty: number; gameMode: GameMode } {
  const modeParam = searchParams.get('mode');
  const difficulty = Math.max(1, Math.min(10, Number(searchParams.get('difficulty')) || 5));
  if (modeParam === 'single') {
    return { mode: 'single', numPlayers: 2, difficulty, gameMode: 'single' };
  }
  if (modeParam === 'three') return { mode: 'multi', numPlayers: 3, difficulty: 5, gameMode: 'three' };
  if (modeParam === 'four') return { mode: 'multi', numPlayers: 4, difficulty: 5, gameMode: 'four' };
  return { mode: 'multi', numPlayers: 2, difficulty: 5, gameMode: 'two' };
}

function GamePageContent() {
  const searchParams = useSearchParams();
  const { mode, numPlayers, difficulty, gameMode } = parseModeAndPlayers(searchParams);

  const [state, setState] = useState<GameState>(() => createInitialState(numPlayers));
  const [cpuThinking, setCpuThinking] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleCellClick = useCallback(
    (bigRow: number, bigCol: number, smallRow: number, smallCol: number) => {
      if (state.gameOver !== null || cpuThinking) return;
      if (mode === 'single' && getCurrentPlayer(state) !== 'X') return;
      const next = applyMove(state, bigRow, bigCol, smallRow, smallCol);
      setState(next);

      if (mode === 'single' && next.gameOver === null && getCurrentPlayer(next) === 'O') {
        setCpuThinking(true);
      }
    },
    [state, mode, cpuThinking]
  );

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

  const handleRematch = useCallback(() => {
    setState(createInitialState(numPlayers));
    setCpuThinking(false);
  }, [numPlayers]);

  const handleLoadGame = useCallback(
    (loaded: { state: GameState; mode: 'single' | 'two' | 'three' | 'four'; difficulty: number | null }) => {
      setState(loaded.state);
      setCpuThinking(false);
    },
    []
  );

  const gameOver = state.gameOver !== null;
  const winner = state.gameOver === 'draw' ? 'draw' : state.gameOver;
  const hasFilledBoards = score.symbols.some((s) => score.counts[s] > 0) || score.tied > 0;

  const statusLine = mode === 'single'
    ? 'You are X · CPU is O'
    : score.symbols.join(' · ') + ' (same device)';

  return (
    <div className="flex-1 flex flex-col py-4 px-2 max-w-sm mx-auto w-full">
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
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {mode === 'single' ? `You are X · CPU is O · Level ${difficulty}` : statusLine}
            </p>
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
      <div className="flex-1 flex items-center justify-center">
        <GameBoard state={state} onCellClick={handleCellClick} />
      </div>
      <GameOverDialog open={gameOver} winner={winner} score={score} onRematch={handleRematch} />
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
