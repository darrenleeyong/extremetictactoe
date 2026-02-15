'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [difficulty, setDifficulty] = useState(5);

  return (
    <div className="flex-1 flex flex-col justify-center px-4 py-8 max-w-sm mx-auto w-full">
      <p className="text-center text-zinc-500 dark:text-zinc-400 text-lg mb-8">
        Win three boards in a row on the big grid
      </p>
      <div className="flex flex-col gap-6 w-full">
        {/* Single player with difficulty */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-4">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Single player (vs CPU)</p>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533z" />
            </svg>
            Play (level {difficulty})
          </Link>
        </div>

        {/* Multiplayer: 2, 3, 4 players */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 p-4">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">Multiplayer (same device)</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/game?mode=two"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
            >
              <span className="flex gap-0.5">
                <span className="text-violet-200">X</span>
                <span className="text-amber-200">O</span>
              </span>
              2 players
            </Link>
            <Link
              href="/game?mode=three"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
            >
              <span className="flex gap-0.5 text-white/90">X O △</span>
              3 players
            </Link>
            <Link
              href="/game?mode=four"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white transition-colors"
            >
              <span className="flex gap-0.5 text-white/90">X O △ □</span>
              4 players
            </Link>
          </div>
        </div>

        {/* Hell Mode */}
        <div className="rounded-xl border-2 border-red-500/50 dark:border-red-500/40 bg-red-50 dark:bg-red-950/30 p-4">
          <p className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">HELL MODE</p>
          <p className="text-xs text-red-600/80 dark:text-red-400/70 mb-3">
            Max difficulty. 5 seconds per turn. Miss your window and the CPU takes over.
          </p>
          <Link
            href="/game?mode=hell"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.176 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.546 3.75 3.75 0 013.255 3.718z" clipRule="evenodd" />
            </svg>
            Enter Hell Mode
          </Link>
        </div>

        {/* Leaderboard */}
        <Link
          href="/leaderboard"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-medium text-sm border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-500">
            <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a.75.75 0 000 1.5h12.17a.75.75 0 000-1.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.707 6.707 0 01-1.112-3.173 6.73 6.73 0 002.743-1.347 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 3.246 2.632 5.88 5.875 5.88s5.875-2.634 5.875-5.88V3.357a47.63 47.63 0 00-5.875-.357c-2.032 0-3.99.127-5.875.357v1.893z" clipRule="evenodd" />
          </svg>
          Leaderboard
        </Link>
      </div>
    </div>
  );
}
