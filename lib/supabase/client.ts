import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Preparado para la Etapa 2 (catálogo, login y panel conectados a Supabase).
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
  }
  return client;
}
