'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { saveGame, loadGamesList, loadGameById } from '@/app/actions/games';
import { deserializeState } from '@/lib/gameState';
import type { GameState } from '@/lib/gameLogic';
import type { GameMode, SavedGame } from '@/lib/games';

interface GameMenuProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  state: GameState;
  gameMode: GameMode;
  difficulty: number;
  onLoadGame: (game: { state: GameState; mode: GameMode; difficulty: number | null }) => void;
}

export default function GameMenu({
  open,
  onClose,
  onRestart,
  state,
  gameMode,
  difficulty,
  onLoadGame,
}: GameMenuProps) {
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadPhase, setLoadPhase] = useState<'idle' | 'loading' | 'list' | 'empty' | 'error'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [games, setGames] = useState<SavedGame[]>([]);

  const handleHome = () => {
    onClose();
    router.push('/');
  };

  const handleRestart = () => {
    onClose();
    onRestart();
  };

  async function handleSave() {
    setSaveStatus('saving');
    setSaveError(null);
    const result = await saveGame(state, gameMode, gameMode === 'single' ? difficulty : null);
    if (result.ok) {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setSaveError(result.error);
    }
  }

  async function handleLoadClick() {
    setLoadPhase('loading');
    setLoadError(null);
    const result = await loadGamesList();
    if (!result.ok) {
      setLoadPhase('error');
      setLoadError(result.error);
      return;
    }
    if (result.games.length === 0) {
      setLoadPhase('empty');
      return;
    }
    setGames(result.games);
    setLoadPhase('list');
  }

  async function handleLoadGame(gameId: string) {
    const result = await loadGameById(gameId);
    if (!result.ok) {
      setLoadError(result.error);
      return;
    }
    if (result.game) {
      const restored = deserializeState(result.game.state);
      onLoadGame({
        state: restored,
        mode: result.game.mode,
        difficulty: result.game.difficulty,
      });

      onClose();
      
      const difficultyParam = result.game.difficulty !== null ? `&difficulty=${result.game.difficulty}` : '';
      router.push(
        `/game?mode=${result.game.mode}${difficultyParam}`
      );
    }
  }

  function closeLoadPhase() {
    setLoadPhase('idle');
    setLoadError(null);
    setGames([]);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-menu-title"
        className="w-full max-w-xs rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6">
          <h2 id="game-menu-title" className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Menu
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Return to home, save or load your game, or restart.
          </p>
        </div>

        <div className="px-6 pb-4 space-y-3">
          {/* Save */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveStatus === 'saving'}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {saveStatus === 'saving' && 'Saving…'}
              {saveStatus === 'saved' && 'Saved!'}
              {saveStatus === 'error' && 'Save failed'}
              {saveStatus === 'idle' && 'Save game'}
            </button>
            {saveStatus === 'error' && saveError && (
              <p className="text-xs text-red-600 dark:text-red-400">
                {saveError}
                {saveError.includes('Sign in') && (
                  <>
                    {' '}
                    <Link href="/login" className="underline" onClick={(e) => e.stopPropagation()}>
                      Sign in
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>

          {/* Load */}
          {loadPhase === 'idle' && (
            <button
              type="button"
              onClick={handleLoadClick}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Load game
            </button>
          )}
          {loadPhase === 'loading' && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
          )}
          {loadPhase === 'error' && loadError && (
            <div className="space-y-1">
              <p className="text-xs text-red-600 dark:text-red-400">{loadError}</p>
              {loadError.includes('Sign in') && (
                <Link href="/login" className="text-sm text-violet-600 dark:text-violet-400 underline">
                  Sign in
                </Link>
              )}
              <button type="button" onClick={closeLoadPhase} className="text-sm text-zinc-500 underline">
                Dismiss
              </button>
            </div>
          )}
          {loadPhase === 'empty' && (
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No saved game.</p>
              <button type="button" onClick={closeLoadPhase} className="text-sm text-violet-600 dark:text-violet-400 underline mt-1">
                Dismiss
              </button>
            </div>
          )}
          {loadPhase === 'list' && games.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Saved game</p>
              {games.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-700 p-3"
                >
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {g.mode} · {g.difficulty != null ? `Level ${g.difficulty}` : '—'} · {new Date(g.updated_at).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadGame(g.id)}
                      className="py-1.5 px-3 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white"
                    >
                      Load
                    </button>
                    <button type="button" onClick={closeLoadPhase} className="py-1.5 px-3 rounded-lg text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={handleHome}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Back to Home
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
          >
            Restart
          </button>
        </div>
      </div>
    </div>
  );
}