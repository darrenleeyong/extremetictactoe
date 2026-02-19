'use client';

interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RulesModal({ open, onClose }: RulesModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
          <h2 id="rules-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            How to Play
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-5 py-4 space-y-5 text-sm text-zinc-700 dark:text-zinc-300">
          <section>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Objective</h3>
            <p>Win <strong>3 small boards in a row</strong> on the big 3×3 grid — horizontally, vertically, or diagonally — before your opponent does.</p>
          </section>

          <section>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Board Queue</h3>
            <p>
              Each turn follows a <strong>pre-shuffled queue</strong> that determines which small board you must play in.
              The amber-highlighted board is where you play <em>now</em>; the violet-glowing board shows where the <em>next</em> turn will go — plan ahead!
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">⭐ Wildcards</h3>
            <p>
              Whenever a small board is <strong>completed</strong> (won or filled), the next player earns a wildcard and may play in <em>any</em> available board.
              The queue resumes after the wildcard turn.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5">Players &amp; Symbols</h3>
            <div className="flex flex-wrap gap-4 mt-1">
              <span className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-violet-600 dark:text-violet-400">✕</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Purple</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-amber-500 dark:text-amber-400">○</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Yellow</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">△</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Green</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-rose-500 dark:text-rose-400">□</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Red</span>
              </span>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Scoring (Single Player)</h3>
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 p-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Base score</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+10,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Per player move</span>
                <span className="text-rose-500 font-semibold">−150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Per second elapsed</span>
                <span className="text-rose-500 font-semibold">−30</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Per board won</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Per board lost</span>
                <span className="text-rose-500 font-semibold">−200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Win bonus</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Draw bonus</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">+1,000</span>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-1.5 flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Difficulty multiplier</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">×0.5 – ×2.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">Hell Mode multiplier</span>
                <span className="text-rose-500 font-semibold">×2</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Only <strong>wins</strong> are eligible for leaderboard submission.
            </p>
          </section>

          <section>
            <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1.5">🔥 Hell Mode</h3>
            <p>
              Max difficulty (Level 10). You have <strong>5 seconds per turn</strong> — miss the window and a random move is made for you. All scores are doubled.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-200 dark:border-zinc-700 flex-shrink-0 space-y-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
          >
            Got it!
          </button>
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            a game by{' '}
            <a
              href="http://darrenleeyong.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Darren Lee
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
