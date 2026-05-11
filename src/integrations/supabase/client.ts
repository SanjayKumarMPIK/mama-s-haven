/**
 * Shared Supabase client — data-plane only.
 *
 * This client is used for generic database queries (user_profiles, health_logs,
 * doctor_connections, etc.).  It should NOT be used for auth operations
 * (signIn / signOut / onAuthStateChange).
 *
 * Auth operations use the isolated clients:
 *   - User auth  → @/lib/supabase-user   (storageKey: 'swasthya-user-auth')
 *   - Doctor auth → @/lib/supabase-doctor (storageKey: 'swasthya-doctor-auth')
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storageKey: 'swasthya-shared-data',
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});