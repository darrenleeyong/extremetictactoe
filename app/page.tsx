'use client';

import { useState } from 'react';
import Link from 'next/link';
import RulesModal from '@/components/RulesModal';

export default function HomePage() {
  const [difficulty, setDifficulty] = useState(5);
  const [rulesOpen, setRulesOpen] = useState(false);

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-8 max-w-sm mx-auto w-full">
      <h1 className="sr-only">Extreme Tic Tac Toe</h1>
      <p className="text-center text-zinc-500 dark:text-zinc-400 text-lg mb-1" role="doc-subtitle">
        Win three boards in a row on the big grid
      </p>
      <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 mb-8">
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
      <div className="flex flex-col gap-6 w-full">
        {/* Single player with difficulty */}
        <section aria-labelledby="single-player-heading">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-4">
          <h2 id="single-player-heading" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Single player (vs CPU)</h2>
          <div className="flex items-center gap-3 mb-3">
            <label htmlFor="difficulty" className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              Difficulty
            </label>
            <input
              id="difficulty"
              type="range"
              min={1}
              max={10}
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="flex-1 h-2 rounded-full appearance-none bg-zinc-200 dark:bg-zinc-600 accent-violet-600"
            />
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 w-6">{difficulty}</span>
          </div>
          <Link
            href={`/game?mode=single&difficulty=${difficulty}`}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533z" />
            </svg>
            Play (level {difficulty})
          </Link>
        </div>
        </section>

        {/* Multiplayer: 2, 3, 4 players */}
        <section aria-labelledby="multiplayer-heading">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-4">
          <h2 id="multiplayer-heading" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Multiplayer (same device)</h2>
          <div className="flex flex-col gap-2">
            <Link
              href="/game?mode=two"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
            >
              <span className="flex gap-1 text-sm font-bold">
                <span className="text-violet-200">✕</span>
                <span className="text-amber-300">○</span>
              </span>
              2 players
            </Link>
            <Link
              href="/game?mode=three"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
            >
              <span className="flex gap-1 text-sm font-bold">
                <span className="text-violet-200">✕</span>
                <span className="text-amber-300">○</span>
                <span className="text-emerald-300">△</span>
              </span>
              3 players
            </Link>
            <Link
              href="/game?mode=four"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
            >
              <span className="flex gap-1 text-sm font-bold">
                <span className="text-violet-200">✕</span>
                <span className="text-amber-300">○</span>
                <span className="text-emerald-300">△</span>
                <span className="text-rose-300">□</span>
              </span>
              4 players
            </Link>
          </div>
        </div>
        </section>

        {/* Hell Mode */}
        <section aria-labelledby="hell-mode-heading">
        <div className="rounded-xl border-2 border-red-500/50 dark:border-red-500/40 bg-red-50 dark:bg-red-950/30 p-4">
          <h2 id="hell-mode-heading" className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">HELL MODE</h2>
          <p className="text-xs text-red-600/80 dark:text-red-400/70 mb-3">
            Max difficulty. 5 seconds per turn. Miss your window and the CPU takes over.
          </p>
          <Link
            href="/game?mode=hell"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.176 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.546 3.75 3.75 0 013.255 3.718z" clipRule="evenodd" />
            </svg>
            Enter Hell Mode
          </Link>
        </div>
        </section>

        {/* Bottom row: Leaderboard + How to Play */}
        <div className="flex gap-2">
          <Link
            href="/leaderboard"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-500" aria-hidden="true">
              <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a.75.75 0 000 1.5h12.17a.75.75 0 000-1.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.707 6.707 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 3.246 2.632 5.88 5.875 5.88s5.875-2.634 5.875-5.88V3.357a47.63 47.63 0 00-5.875-.357c-2.032 0-3.99.127-5.875.357v1.893z" clipRule="evenodd" />
            </svg>
            Leaderboard
          </Link>
          <button
            type="button"
            onClick={() => setRulesOpen(true)}
            aria-label="How to Play"
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-violet-500" aria-hidden="true">
              <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.220 0 4.544-.676.593-1.562.890-2.43.980V14.25a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75c.826 0 1.607-.28 2.13-.727.623-.545.623-1.393 0-1.938zM12 17.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
            How to Play
          </button>
        </div>
      </div>

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}
