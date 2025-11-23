import { createClient } from '@supabase/supabase-js'

// nRécupériw les variables dTA3 el envirment 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// nthabtou les variables mrgline
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing from .env.local file");
}

// Créeation et export taa l client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)