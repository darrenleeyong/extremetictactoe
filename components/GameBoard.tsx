'use client';

import SmallBoard from './SmallBoard';
import type { GameState } from '@/lib/gameLogic';
import { isSmallBoardFull, getCurrentPlayer } from '@/lib/gameLogic';

interface GameBoardProps {
  state: GameState;
  onCellClick: (bigRow: number, bigCol: number, smallRow: number, smallCol: number) => void;
}

export default function GameBoard({ state, onCellClick }: GameBoardProps) {
  const { boards, globalWins, nextBoard, gameOver } = state;
  const currentPlayer = getCurrentPlayer(state);

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {!gameOver && (
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          {nextBoard !== null
            ? `Play in the highlighted board (${currentPlayer}'s turn)`
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
            const isTarget = nextBoard === boardIndex && gameOver === null;
            const mustPlayInOther = gameOver === null && nextBoard !== null && nextBoard !== boardIndex &&
              globalWins[nextBoard] === null && !isSmallBoardFull(boards[nextBoard]);
            const disabled = wonBy !== null || tied || gameOver !== null || mustPlayInOther;
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
