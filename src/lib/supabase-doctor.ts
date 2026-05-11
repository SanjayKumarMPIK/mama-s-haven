/**
 * Isolated Supabase client for DOCTOR authentication.
 *
 * Uses a dedicated `storageKey` so the doctor's JWT is stored in its own
 * localStorage slot (`swasthya-doctor-auth`). This prevents user logins
 * from overwriting the doctor session and vice-versa.
 *
 * ONLY import this in doctor-facing auth code (DoctorAuthProvider / DoctorAuthContext).
 * For generic data-plane queries, use the shared client from
 * `@/integrations/supabase/client`.
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabaseDoctorClient = createClient<Database>(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storageKey: 'swasthya-doctor-auth',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
