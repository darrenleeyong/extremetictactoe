'use client';

import { useRouter } from 'next/navigation';

interface GameMenuProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export default function GameMenu({ open, onClose, onRestart }: GameMenuProps) {
  const router = useRouter();

  const handleHome = () => {
    onClose();
    router.push('/');
  };

  const handleRestart = () => {
    onClose();
    onRestart();
  };

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
        <div className="px-6 pt-6 pb-2">
          <h2 id="game-menu-title" className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Menu
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Restart the current game or return to the home screen.
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6 pt-4">
          <button
            type="button"
            onClick={handleHome}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700"
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
