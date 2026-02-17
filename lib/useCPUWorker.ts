'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { GameState, Player } from './gameLogic';
import { getCPUMove as getCPUMoveDirect } from './cpuPlayer';

type Move = {
  bigRow: number;
  bigCol: number;
  smallRow: number;
  smallCol: number;
};

interface WorkerResponse {
  type: 'move';
  move: Move;
}

/**
 * Hook that wraps CPU move computation.
 * Tries to use a Web Worker for levels 7-10 to keep the UI responsive.
 * Falls back to a direct call (wrapped in a setTimeout to yield the main thread)
 * if the Worker can't be created or errors out.
 */
export function useCPUWorker() {
  const workerRef = useRef<Worker | null>(null);
  const workerFailed = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Worker) {
      workerFailed.current = true;
      return;
    }

    try {
      const w = new Worker(new URL('./cpuWorker.ts', import.meta.url));

      // If the worker script itself fails to load, mark it as broken
      w.addEventListener('error', () => {
        workerFailed.current = true;
        w.terminate();
        workerRef.current = null;
      });

      workerRef.current = w;
    } catch {
      workerFailed.current = true;
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const getCPUMove = useCallback(
    (
      state: GameState,
      difficulty: number,
      cpuPlayer: Player,
      humanPlayer: Player
    ): Promise<Move> => {
      // If Worker is available and hasn't failed, try it
      if (workerRef.current && !workerFailed.current) {
        return new Promise<Move>((resolve) => {
          const worker = workerRef.current!;

          const timeoutId = setTimeout(() => {
            // Worker is taking too long — fall back
            resolve(getCPUMoveDirect(state, difficulty, cpuPlayer, humanPlayer));
          }, 5000);

          const handleMessage = (e: MessageEvent<WorkerResponse>) => {
            clearTimeout(timeoutId);
            if (e.data.type === 'move') {
              resolve(e.data.move);
            }
          };

          const handleError = () => {
            clearTimeout(timeoutId);
            workerFailed.current = true;
            resolve(getCPUMoveDirect(state, difficulty, cpuPlayer, humanPlayer));
          };

          worker.addEventListener('message', handleMessage, { once: true });
          worker.addEventListener('error', handleError, { once: true });

          worker.postMessage({
            type: 'getMove',
            state,
            difficulty,
            cpuPlayer,
            humanPlayer,
          });
        });
      }

      // Fallback: run directly but yield the main thread first
      return new Promise<Move>((resolve) => {
        setTimeout(() => {
          resolve(getCPUMoveDirect(state, difficulty, cpuPlayer, humanPlayer));
        }, 0);
      });
    },
    []
  );

  return { getCPUMove };
}
