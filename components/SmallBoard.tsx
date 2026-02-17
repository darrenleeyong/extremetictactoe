'use client';

import type { SmallBoard as SmallBoardType, CellValue } from '@/lib/gameLogic';
import { BOARD_NAMES, CELL_NAMES } from '@/lib/gameLogic';

interface SmallBoardProps {
  boardIndex: number;
  board: SmallBoardType;
  wonBy: CellValue;
  isTied: boolean;
  disabled: boolean;
  isTarget: boolean;
  onCellClick: (bigRow: number, bigCol: number, smallRow: number, smallCol: number) => void;
  bigRow: number;
  bigCol: number;
}

function boardBgClass(wonBy: CellValue, isTied: boolean, isTarget: boolean): string {
  if (wonBy === 'X') return 'bg-violet-500/20 dark:bg-violet-500/25 border-violet-500/50';
  if (wonBy === 'O') return 'bg-amber-500/20 dark:bg-amber-500/25 border-amber-500/50';
  if (wonBy === '△') return 'bg-emerald-500/20 dark:bg-emerald-500/25 border-emerald-500/50';
  if (wonBy === '□') return 'bg-rose-500/20 dark:bg-rose-500/25 border-rose-500/50';
  if (isTied) return 'bg-zinc-200/80 dark:bg-zinc-700/50 border-zinc-300 dark:border-zinc-600';
  if (isTarget) return 'bg-violet-500/10 dark:bg-violet-500/15 border-violet-500 dark:border-violet-400';
  return 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
}

function cellColorClass(cell: CellValue): string {
  if (cell === 'X') return 'text-violet-600 dark:text-violet-400';
  if (cell === 'O') return 'text-amber-500 dark:text-amber-400';
  if (cell === '△') return 'text-emerald-600 dark:text-emerald-400';
  if (cell === '□') return 'text-rose-500 dark:text-rose-400';
  return 'text-zinc-700 dark:text-zinc-300';
}

export default function SmallBoard({
  boardIndex,
  board,
  wonBy,
  isTied,
  disabled,
  isTarget,
  onCellClick,
  bigRow,
  bigCol,
}: SmallBoardProps) {
  const bgClass = boardBgClass(wonBy, isTied, isTarget);

  return (
    <div className="relative">
      {/* Board number indicator */}
      <div className="absolute -top-1 -left-1 z-10 w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700 border border-zinc-400 dark:border-zinc-600 flex items-center justify-center">
        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
          {boardIndex + 1}
        </span>
      </div>
      
      <div
        className={`
          grid grid-cols-3 gap-0.5 aspect-square p-0.5 rounded-lg border-2 ${bgClass}
          ${disabled ? 'opacity-90' : ''}
          ${isTarget ? 'ring-2 ring-violet-500 dark:ring-violet-400 ring-offset-1' : ''}
        `}
      >
      {board.map((cell, i) => {
        const smallRow = Math.floor(i / 3);
        const smallCol = i % 3;
        const cellDisabled = disabled || cell !== null;
        const boardName = BOARD_NAMES[boardIndex];
        const cellName = CELL_NAMES[i];
        const ariaLabel = cellDisabled
          ? `Board ${boardIndex + 1} ${boardName}, cell ${cellName}, ${cell ? `occupied by ${cell}` : 'tied or completed'}`
          : `Board ${boardIndex + 1} ${boardName}, cell ${cellName}, empty, play here`;
        return (
          <button
            key={i}
            type="button"
            onClick={() => !cellDisabled && onCellClick(bigRow, bigCol, smallRow, smallCol)}
            disabled={cellDisabled}
            aria-label={ariaLabel}
            className={`
              min-h-[44px] min-w-[44px] flex items-center justify-center text-xs sm:text-base font-bold
              rounded border border-zinc-200 dark:border-zinc-600
              bg-zinc-100 dark:bg-zinc-800/80 ${cellColorClass(cell)}
              ${cellDisabled ? 'cursor-default' : 'cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700'}
            `}
          >
            {cell}
          </button>
        );
      })}
      </div>
    </div>
  );
}
