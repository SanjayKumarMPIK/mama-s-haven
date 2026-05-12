/**
 * maternityLmpService.ts
 *
 * Service for persisting and fetching the immutable LMP (Last Menstrual Period) date
 * from the Supabase `maternity_lmp_records` table.
 *
 * Once saved, the LMP cannot be changed (enforced by Supabase RLS — no UPDATE policy).
 */

import { supabaseUserClient } from '@/lib/supabase-user';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseUserClient as any;

export interface LmpRecord {
  userId: string;
  lmpDate: string;    // YYYY-MM-DD
  eddDate: string;    // YYYY-MM-DD (LMP + 280)
  createdAt: string;  // ISO timestamp
  isLocked: boolean;  // true = stored in Supabase, cannot be changed
}

/** Compute EDD from LMP: LMP + 280 days */
function computeEDD(lmpDate: string): string {
  const d = new Date(lmpDate + 'T00:00:00');
  d.setDate(d.getDate() + 280);
  return d.toISOString().slice(0, 10);
}

/**
 * Fetch the stored LMP record for the current user.
 * Returns null if not yet saved.
 */
export async function fetchLmpRecord(userId: string): Promise<LmpRecord | null> {
  try {
    const { data, error } = await db
      .from('maternity_lmp_records')
      .select('user_id, lmp_date, edd_date, created_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      userId: String(data.user_id),
      lmpDate: String(data.lmp_date).split('T')[0],
      eddDate: String(data.edd_date).split('T')[0],
      createdAt: String(data.created_at),
      isLocked: true,
    };
  } catch {
    return null;
  }
}

/**
 * Save the LMP date for the current user.
 * This is a ONE-TIME operation — the UNIQUE constraint and missing UPDATE policy
 * prevent any subsequent changes.
 *
 * Returns the saved record, or null if the save failed (e.g., already exists).
 */
export async function saveLmpRecord(
  userId: string,
  lmpDate: string,
): Promise<LmpRecord | null> {
  const eddDate = computeEDD(lmpDate);

  try {
    const { data, error } = await db
      .from('maternity_lmp_records')
      .insert({
        user_id: userId,
        lmp_date: lmpDate,
        edd_date: eddDate,
      })
      .select('user_id, lmp_date, edd_date, created_at')
      .single();

    if (error) {
      // If duplicate key (user already has an LMP record), fetch the existing one
      if (String(error.message).includes('duplicate') || String(error.code) === '23505') {
        console.log('[LMP] Record already exists — fetching existing (immutable)');
        return fetchLmpRecord(userId);
      }
      console.error('[LMP] Save failed:', error.message);
      return null;
    }

    console.log('[LMP] ✅ LMP saved successfully:', lmpDate, '→ EDD:', eddDate);
    return {
      userId: String(data.user_id),
      lmpDate: String(data.lmp_date).split('T')[0],
      eddDate: String(data.edd_date).split('T')[0],
      createdAt: String(data.created_at),
      isLocked: true,
    };
  } catch (err) {
    console.error('[LMP] Save exception:', err);
    return null;
  }
}

/**
 * Check if the user already has a locked LMP record.
 */
export async function isLmpLocked(userId: string): Promise<boolean> {
  const record = await fetchLmpRecord(userId);
  return record !== null;
}
