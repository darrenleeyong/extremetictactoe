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
      </div>
    </div>
  );
}
