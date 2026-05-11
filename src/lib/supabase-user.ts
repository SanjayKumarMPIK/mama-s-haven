/**
 * Isolated Supabase client for USER authentication.
 *
 * Uses a dedicated `storageKey` so the user's JWT is stored in its own
 * localStorage slot (`swasthya-user-auth`). This prevents doctor logins
 * from overwriting the user session and vice-versa.
 *
 * ONLY import this in user-facing auth code (AuthProvider / useAuth).
 * For generic data-plane queries, use the shared client from
 * `@/integrations/supabase/client`.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseUserClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storageKey: 'swasthya-user-auth',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
