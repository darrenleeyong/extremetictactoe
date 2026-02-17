import type { GameState, Player } from './gameLogic';
import { getCPUMove } from './cpuPlayer';

// Web Worker message types
interface WorkerRequest {
  type: 'getMove';
  state: GameState;
  difficulty: number;
  cpuPlayer: Player;
  humanPlayer: Player;
}

interface WorkerResponse {
  type: 'move';
  move: {
    bigRow: number;
    bigCol: number;
    smallRow: number;
    smallCol: number;
  };
}

// Worker message handler
self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { type, state, difficulty, cpuPlayer, humanPlayer } = e.data;

  if (type === 'getMove') {
    const startTime = performance.now();
    const move = getCPUMove(state, difficulty, cpuPlayer, humanPlayer);
    const elapsed = performance.now() - startTime;
    
    console.log(`[CPU Worker] Level ${difficulty} move calculated in ${elapsed.toFixed(1)}ms`);

    const response: WorkerResponse = {
      type: 'move',
      move,
    };

    self.postMessage(response);
  }
};
