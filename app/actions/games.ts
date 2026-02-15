'use server';

import { createClient } from '@/lib/supabase/server';
import { saveGame as dbSaveGame, loadGames as dbLoadGames, loadGame as dbLoadGame, type GameMode } from '@/lib/games';
import type { GameState } from '@/lib/gameLogic';

export type SaveResult = { ok: true } | { ok: false; error: string };
export type LoadListResult = { ok: true; games: Awaited<ReturnType<typeof dbLoadGames>> } | { ok: false; error: string };
export type LoadOneResult =
  | { ok: true; game: Awaited<ReturnType<typeof dbLoadGame>> }
  | { ok: false; error: string };

export async function saveGame(
  state: GameState,
  mode: GameMode,
  difficulty: number | null
): Promise<SaveResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Sign in to save your game.' };

    await dbSaveGame(supabase, user.id, state, mode, difficulty);
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save game.';
    return { ok: false, error: message };
  }
}

export async function loadGamesList(): Promise<LoadListResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Sign in to load games.' };

    const games = await dbLoadGames(supabase, user.id);
    return { ok: true, games };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load games.';
    return { ok: false, error: message };
  }
}

export async function loadGameById(gameId: string): Promise<LoadOneResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: 'Sign in to load a game.' };

    const game = await dbLoadGame(supabase, user.id, gameId);
    if (!game) return { ok: false, error: 'Game not found.' };
    return { ok: true, game };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to load game.';
    return { ok: false, error: message };
  }
}
