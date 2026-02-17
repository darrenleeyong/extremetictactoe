'use client';

import SmallBoard from './SmallBoard';
import BoardStepper from './BoardStepper';
import type { GameState } from '@/lib/gameLogic';
import { isSmallBoardFull, getCurrentPlayer, BOARD_NAMES } from '@/lib/gameLogic';

interface GameBoardProps {
  state: GameState;
  onCellClick: (bigRow: number, bigCol: number, smallRow: number, smallCol: number) => void;
}

export default function GameBoard({ state, onCellClick }: GameBoardProps) {
  const { boards, globalWins, nextBoard, gameOver, hasWildcard } = state;
  const currentPlayer = getCurrentPlayer(state);

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Board sequence stepper */}
      <BoardStepper state={state} />

      {!gameOver && (
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          {hasWildcard
            ? `🎯 Wildcard: Choose any board! (${currentPlayer}'s turn)`
            : nextBoard !== null
            ? `Board ${nextBoard + 1} · ${BOARD_NAMES[nextBoard]} (${currentPlayer}'s turn)`
            : `Choose any board (${currentPlayer}'s turn)`}
        </p>
      )}
      <div className="grid grid-cols-3 gap-1.5 justify-center">
        {[0, 1, 2].map((bigRow) =>
          [0, 1, 2].map((bigCol) => {
            const boardIndex = bigRow * 3 + bigCol;
            const wonBy = globalWins[boardIndex];
            const board = boards[boardIndex];
            const tied = isSmallBoardFull(board) && wonBy === null;
            const boardComplete = wonBy !== null || tied;

            // Highlight the active board (not during wildcard — all are valid then)
            const isTarget = !hasWildcard && nextBoard === boardIndex && gameOver === null;

            // During wildcard, all incomplete boards are playable
            // Otherwise, only the sequenced board is playable
            const mustPlayInOther = gameOver === null && !hasWildcard &&
              nextBoard !== null && nextBoard !== boardIndex &&
              globalWins[nextBoard] === null && !isSmallBoardFull(boards[nextBoard]);
            const disabled = boardComplete || gameOver !== null || mustPlayInOther;
            return (
              <div key={boardIndex} className="flex justify-center">
                <div className="w-full max-w-[130px]">
                  <SmallBoard
                    boardIndex={boardIndex}
                    board={board}
                    wonBy={wonBy}
                    isTied={tied}
                    disabled={disabled}
                    isTarget={isTarget}
                    onCellClick={onCellClick}
                    bigRow={bigRow}
                    bigCol={bigCol}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
