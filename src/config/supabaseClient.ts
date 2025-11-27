// src/config/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabase() {
  if (!supabase) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error("[Supabase] Missing env vars:", { url, key });
      throw new Error("Supabase not ready yet");
    }

    supabase = createClient(url, key);
  }

  return supabase;
}
