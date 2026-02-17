'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type LeaderboardEntry = {
  id: string;
  player_name: string;
  score: number;
  mode: string;
  difficulty: number;
  moves: number;
  time_seconds: number;
  result: string;
  created_at: string;
};

const MODE_LABELS: Record<string, string> = {
  single: 'Single',
  hell: 'Hell',
};

const RESULT_BADGES: Record<string, { label: string; className: string }> = {
  win: { label: 'Win', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
  loss: { label: 'Loss', className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' },
  draw: { label: 'Draw', className: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400' },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = () => {
    setLoading(true);
    const supabase = createClient();
    supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setEntries((data as LeaderboardEntry[]) ?? []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="flex-1 flex flex-col px-4 py-6 max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Back to home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Leaderboard</h1>
        </div>
        <button
          type="button"
          onClick={fetchLeaderboard}
          className="p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Refresh leaderboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
            <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903H14.25a.75.75 0 000 1.5h6a.75.75 0 00.75-.75v-6a.75.75 0 00-1.5 0v3.068l-1.961-1.96A9 9 0 002.342 9.66a.75.75 0 101.416.494l.001-.003a7.47 7.47 0 01.996-.092zm14.49 3.882a7.5 7.5 0 01-12.548 3.364l-1.902-1.903h4.955a.75.75 0 000-1.5h-6a.75.75 0 00-.75.75v6a.75.75 0 001.5 0v-3.068l1.96 1.96A9 9 0 0021.66 14.34a.75.75 0 10-1.416-.494 7.47 7.47 0 01-.998.095z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 dark:text-zinc-400">Loading...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">No scores yet.</p>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs">Play a game and post your score!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                index === 0
                  ? 'border-amber-300 dark:border-amber-600/50 bg-amber-50 dark:bg-amber-950/20'
                  : index === 1
                    ? 'border-zinc-300 dark:border-zinc-500/50 bg-zinc-50 dark:bg-zinc-800/30'
                    : index === 2
                      ? 'border-orange-300 dark:border-orange-600/50 bg-orange-50 dark:bg-orange-950/20'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50'
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center">
                {index === 0 ? (
                  <span className="text-lg" role="img" aria-label="1st place">&#x1F947;</span>
                ) : index === 1 ? (
                  <span className="text-lg" role="img" aria-label="2nd place">&#x1F948;</span>
                ) : index === 2 ? (
                  <span className="text-lg" role="img" aria-label="3rd place">&#x1F949;</span>
                ) : (
                  <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{index + 1}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {entry.player_name}
                  </p>
                  <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold leading-none ${
                    RESULT_BADGES[entry.result]?.className ?? ''
                  }`}>
                    {RESULT_BADGES[entry.result]?.label ?? entry.result}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>{MODE_LABELS[entry.mode] ?? entry.mode}</span>
                  <span>·</span>
                  <span>Lv {entry.difficulty}</span>
                  <span>·</span>
                  <span>{entry.moves} moves</span>
                  <span>·</span>
                  <span>{formatTime(entry.time_seconds)}</span>
                  <span>·</span>
                  <span>{formatDate(entry.created_at)}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {entry.score.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
