import { createClient as createServerClient } from '@/lib/supabase/server';

export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
}
