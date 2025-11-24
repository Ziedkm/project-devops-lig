import { createClient } from '@supabase/supabase-js'

// Load variables from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Vérification claire pour Docker / Jenkins
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(" [Supabase] Les variables VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ne sont pas définies.")
  console.error(" Vérifie ton Dockerfile + Jenkinsfile (build-arg)")
  throw new Error("Supabase configuration missing.");
}

// Create and export client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
