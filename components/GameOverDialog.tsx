'use client';

import { useRouter } from 'next/navigation';
import type { Player } from '@/lib/gameLogic';

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
}

export default function GameOverDialog({ open, winner, score, onRematch }: GameOverDialogProps) {
  const router = useRouter();

  const title =
    winner === 'draw' ? "It's a draw!" : `${winner} wins!`;

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
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Final score:</span>
            {score.symbols.map((sym) => (
              <span key={sym} className={`font-semibold ${SYMBOL_COLORS[sym]}`}>
                {sym} {score.counts[sym]}
              </span>
            ))}
            {score.tied > 0 && (
              <span className="text-zinc-500 dark:text-zinc-400 font-semibold">
                · Tied {score.tied}
              </span>
            )}
          </div>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Rematch or return to the menu.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Back to Home
          </button>
          <button
            type="button"
            onClick={onRematch}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
          >
            Rematch
          </button>
        </div>
      </div>
    </div>
  );
}
