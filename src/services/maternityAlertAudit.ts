/**
 * maternityAlertAudit.ts
 *
 * Lightweight audit logger for maternity risk alert lifecycle events.
 * Writes to Supabase `maternity_alert_audit_log` if available,
 * with localStorage fallback for demo/offline.
 */

import { supabaseUserClient } from '@/lib/supabase-user';

export type AuditAction =
  | 'alert_created'
  | 'alert_updated'
  | 'alert_acknowledged'
  | 'alert_resolved'
  | 'alert_expired'
  | 'alert_revoked'
  | 'alert_publish_failed'
  | 'connection_check_failed';

export type ActorRole = 'patient' | 'doctor' | 'system';

interface AuditEntry {
  alert_id?: string;
  actor_id?: string;
  actor_role: ActorRole;
  action: AuditAction;
  detail?: Record<string, unknown>;
  created_at: string;
}

const LOCAL_AUDIT_KEY = 'ss-maternity-alert-audit';
const MAX_LOCAL_ENTRIES = 200;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseUserClient as any;

const AUDIT_TABLE_MISSING_KEY = 'ss-audit-table-missing';

/** Cache: once we detect the audit table is missing, skip network calls permanently. */
function isAuditTableKnownMissing(): boolean {
  return localStorage.getItem(AUDIT_TABLE_MISSING_KEY) === 'true';
}

function markAuditTableMissing() {
  localStorage.setItem(AUDIT_TABLE_MISSING_KEY, 'true');
}

/**
 * Lazily check table availability on first audit write.
 * Uses localStorage cache so the 404 probe fires at most ONCE across reloads.
 */
async function isTableAvailable(): Promise<boolean> {
  if (isAuditTableKnownMissing()) return false;
  try {
    const { error } = await db
      .from('maternity_alert_audit_log')
      .select('id')
      .limit(1);
    if (error) {
      markAuditTableMissing();
      return false;
    }
    return true;
  } catch {
    markAuditTableMissing();
    return false;
  }
}

function appendLocalAudit(entry: AuditEntry) {
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
    const entries: AuditEntry[] = raw ? JSON.parse(raw) : [];
    entries.push(entry);
    // Keep bounded
    while (entries.length > MAX_LOCAL_ENTRIES) entries.shift();
    localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(entries));
  } catch {
    /* ignore */
  }
}

/**
 * Log a maternity alert lifecycle event.
 * Best-effort: never throws, never blocks critical path.
 */
export async function logAlertAudit(
  action: AuditAction,
  opts: {
    alertId?: string;
    actorId?: string;
    actorRole: ActorRole;
    detail?: Record<string, unknown>;
  },
): Promise<void> {
  const entry: AuditEntry = {
    alert_id: opts.alertId,
    actor_id: opts.actorId,
    actor_role: opts.actorRole,
    action,
    detail: opts.detail,
    created_at: new Date().toISOString(),
  };

  // Always write locally for reliability
  appendLocalAudit(entry);

  // Attempt Supabase write (non-blocking)
  try {
    const available = await isTableAvailable();
    if (!available) return;

    await db.from('maternity_alert_audit_log').insert({
      alert_id: entry.alert_id || null,
      actor_id: entry.actor_id || null,
      actor_role: entry.actor_role,
      action: entry.action,
      detail: entry.detail || null,
    });
  } catch {
    // Silent — audit must never break the feature
  }
}

/** Read local audit log (for debugging/admin views). */
export function getLocalAuditLog(): AuditEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
