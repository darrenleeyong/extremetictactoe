'use client';

import type { GameState } from '@/lib/gameLogic';
import { isSmallBoardFull, BOARD_NAMES } from '@/lib/gameLogic';

interface BoardStepperProps {
  state: GameState;
}

const VISIBLE_SLOTS = 8;

export default function BoardStepper({ state }: BoardStepperProps) {
  const { masterQueue, queuePosition, globalWins, boards, hasWildcard, gameOver } = state;

  // Build the visible window: current position + next items from the queue
  const slotData: { boardIdx: number; queueIdx: number }[] = [];
  for (let i = 0; i < VISIBLE_SLOTS; i++) {
    const qi = queuePosition + i;
    if (qi < masterQueue.length) {
      slotData.push({ boardIdx: masterQueue[qi], queueIdx: qi });
    }
  }

  return (
    <div className="w-full max-w-[420px] mx-auto mb-3">
      {/* Header row */}
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Board Queue
        </span>
        {!gameOver && !hasWildcard && slotData.length > 0 && (
          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
            Next: {BOARD_NAMES[slotData[0].boardIdx]}
          </span>
        )}
        {!gameOver && hasWildcard && (
          <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400">
            ★ Wildcard — pick any board
          </span>
        )}
      </div>

      {/* Conveyor belt track */}
      <div className="flex items-stretch gap-1 overflow-hidden">
        {/* Wildcard marker in leftmost slot when active */}
        {hasWildcard && !gameOver && (
          <div
            className="
              relative flex-shrink-0 w-10 flex flex-col items-center justify-center
              rounded-lg border-2 py-1.5
              bg-violet-100 dark:bg-violet-900/40 border-violet-400 dark:border-violet-500
              ring-2 ring-violet-400/60 dark:ring-violet-500/50
              shadow-sm shadow-violet-300/40 dark:shadow-violet-700/30
            "
          >
            <span className="text-sm font-bold leading-none text-violet-600 dark:text-violet-300">★</span>
            <span className="text-[7px] font-semibold uppercase mt-0.5 text-violet-500 dark:text-violet-400">Any</span>
          </div>
        )}

        {slotData.map((slot, visIdx) => {
          const { boardIdx } = slot;
          const isFirst = visIdx === 0 && !hasWildcard;
          const wonBy = globalWins[boardIdx];
          const isFull = isSmallBoardFull(boards[boardIdx]);
          const isCompleted = wonBy !== null || isFull;

          return (
            <div
              key={`${slot.queueIdx}`}
              className={`
                relative flex-shrink-0 w-10 flex flex-col items-center justify-center
                rounded-lg border-2 py-1.5 transition-all duration-300 ease-out
                ${isFirst && !gameOver
                  ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/60 dark:ring-amber-500/50 shadow-sm shadow-amber-300/40 dark:shadow-amber-700/30'
                  : isCompleted
                    ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'
                    : 'bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700'
                }
              `}
              style={{ opacity: isFirst ? 1 : Math.max(0.3, 1 - visIdx * 0.1) }}
            >
              {/* Board number */}
              <span
                className={`text-xs font-bold leading-none ${
                  isFirst && !gameOver
                    ? 'text-amber-700 dark:text-amber-300'
                    : isCompleted
                      ? 'text-zinc-400 dark:text-zinc-500 line-through'
                      : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {boardIdx + 1}
              </span>

              {/* Completed badge */}
              {isCompleted && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600">
                  {wonBy ? (
                    <span className="text-[7px] font-bold leading-none text-emerald-600 dark:text-emerald-400">✓</span>
                  ) : (
                    <span className="text-[7px] font-bold leading-none text-zinc-400 dark:text-zinc-500">—</span>
                  )}
                </span>
              )}

              {/* Current indicator arrow */}
              {isFirst && !gameOver && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0
                  border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent
                  border-t-[4px] border-t-amber-500 dark:border-t-amber-400" />
              )}
            </div>
          );
        })}

        {/* Fade-out indicator for remaining items */}
        {queuePosition + VISIBLE_SLOTS < masterQueue.length && (
          <div className="flex-shrink-0 flex items-center px-1">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
              +{masterQueue.length - queuePosition - VISIBLE_SLOTS}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar: how far through the 81-slot queue */}
      <div className="relative h-0.5 mt-1.5 mx-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber-400 dark:bg-amber-500 transition-all duration-300"
          style={{ width: `${Math.min(100, (queuePosition / masterQueue.length) * 100)}%` }}
        />
      </div>
    </div>
  );
}
