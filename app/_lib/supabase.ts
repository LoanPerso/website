import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/_lib/env";

export const supabase = createClient(
  publicEnv.supabaseUrl,
  publicEnv.supabaseAnonKey
);
