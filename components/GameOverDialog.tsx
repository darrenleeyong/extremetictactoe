'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Player } from '@/lib/gameLogic';
import { createClient } from '@/lib/supabase/client';

const SYMBOL_COLORS: Record<Player, string> = {
  X: 'text-violet-600 dark:text-violet-400',
  O: 'text-amber-500 dark:text-amber-400',
  '△': 'text-emerald-600 dark:text-emerald-400',
  '□': 'text-rose-500 dark:text-rose-400',
};

interface GameOverDialogProps {
  open: boolean;
  winner: Player | 'draw' | null;
  score: { counts: Record<Player, number>; tied: number; symbols: readonly Player[] };
  onRematch: () => void;
  /** Final points (only for single-player / hell mode) */
  points?: number;
  /** Game stats for leaderboard submission */
  gameStats?: {
    mode: string;
    difficulty: number;
    playerMoves: number;
    totalSeconds: number;
    result: 'win' | 'loss' | 'draw';
  };
}

export default function GameOverDialog({ open, winner, score, onRematch, points, gameStats }: GameOverDialogProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const title = winner === 'draw' ? "It's a draw!" : `${winner} wins!`;

  const handleSubmitScore = async () => {
    if (!gameStats || points === undefined) return;
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 30) {
      setSubmitError('Name must be 1–30 characters.');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.from('leaderboard').insert({
        player_name: trimmed,
        score: points,
        mode: gameStats.mode,
        difficulty: gameStats.difficulty,
        moves: gameStats.playerMoves,
        time_seconds: Math.round(gameStats.totalSeconds * 10) / 10,
        result: gameStats.result,
      });
      if (error) throw new Error(error.message);
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit score.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRematch = () => {
    setName('');
    setSubmitted(false);
    setSubmitError('');
    onRematch();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-over-title"
        className="w-full max-w-xs rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
      >
        <div className="px-6 pt-6">
          <h2 id="game-over-title" className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>

          {/* Board score */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Final score:</span>
            {score.symbols.map((sym) => (
              <span key={sym} className={`font-semibold ${SYMBOL_COLORS[sym]}`}>
                {sym} {score.counts[sym]}
              </span>
            ))}
            {score.tied > 0 && (
              <span className="text-zinc-500 dark:text-zinc-400 font-semibold">· Tied {score.tied}</span>
            )}
          </div>

          {/* Points display */}
          {points !== undefined && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {points.toLocaleString()}
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">points</span>
            </div>
          )}

          {/* Leaderboard submission */}
          {gameStats && points !== undefined && (
            <div className="mt-4">
              {submitted ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Score posted!</p>
                  <button
                    type="button"
                    onClick={() => router.push('/leaderboard')}
                    className="mt-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
                  >
                    View Leaderboard
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Post to Leaderboard
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      maxLength={30}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitScore()}
                      className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      type="button"
                      onClick={handleSubmitScore}
                      disabled={submitting || name.trim().length === 0}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '...' : 'Post'}
                    </button>
                  </div>
                  {submitError && (
                    <p className="mt-1 text-xs text-red-500">{submitError}</p>
                  )}
                </>
              )}
            </div>
          )}

          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Rematch or return to the menu.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-6 pb-6 pt-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Back to Home
          </button>
          <button
            type="button"
            onClick={handleRematch}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
          >
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
}
