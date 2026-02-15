import type { GameState } from '@/lib/gameLogic';
import { serializeState, type SerializedState } from '@/lib/gameState';
import type { SupabaseClient } from '@supabase/supabase-js';

export type GameMode = 'single' | 'two' | 'three' | 'four';

export type SavedGame = {
  id: string;
  state: SerializedState;
  mode: GameMode;
  difficulty: number | null;
  updated_at: string;
};

export async function saveGame(
  supabase: SupabaseClient,
  userId: string,
  state: GameState,
  mode: GameMode,
  difficulty: number | null
) {
  const serialized = serializeState(state);
  const { error } = await supabase
    .from('games')
    .upsert(
      {
        user_id: userId,
        state: serialized,
        mode,
        difficulty,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;
}

export async function loadGames(supabase: SupabaseClient, userId: string): Promise<SavedGame[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, state, mode, difficulty, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id: row.id,
    state: row.state as SerializedState,
    mode: row.mode as GameMode,
    difficulty: row.difficulty,
    updated_at: row.updated_at,
  }));
}

export async function loadGame(
  supabase: SupabaseClient,
  userId: string,
  gameId: string
): Promise<SavedGame | null> {
  const { data, error } = await supabase
    .from('games')
    .select('id, state, mode, difficulty, updated_at')
    .eq('user_id', userId)
    .eq('id', gameId)
    .single();

  if (error || !data) return null;
  return {
    id: data.id,
    state: data.state as SerializedState,
    mode: data.mode as GameMode,
    difficulty: data.difficulty,
    updated_at: data.updated_at,
  };
}
