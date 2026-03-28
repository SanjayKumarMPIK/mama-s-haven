export type SymptomTime = "morning" | "afternoon" | "evening";

export interface CalendarSymptomLogItem {
  name: string; // normalized key symptom name (lowercase)
  severity: number; // 1-5
  time: SymptomTime;
  notes?: string | null;
}

export interface CalendarSymptomLogResponse {
  date: string; // yyyy-MM-dd
  symptoms: CalendarSymptomLogItem[];
}

export interface SymptomAnalyticsResponse {
  insight: string;
  prediction: string;
  trend: string;
  timing: string;
  trendDirection: string;
  timingPattern: string;
  confidence: string;
  showSuggestions: boolean;
  showPHC: boolean;
  suggestions: string[];
  barData: { label: string; count: number }[];
  pieData: { name: string; value: number }[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} for ${path}: ${text || res.statusText}`);
  }

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// ─── localStorage calendar symptom store ────────────────────────────────────

const CAL_LS_KEY = "ss-calendar-symptom-logs";

function readCalendarLS(): Record<string, CalendarSymptomLogItem[]> {
  try {
    const raw = localStorage.getItem(CAL_LS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CalendarSymptomLogItem[]>) : {};
  } catch {
    return {};
  }
}

function writeCalendarLS(data: Record<string, CalendarSymptomLogItem[]>) {
  try {
    localStorage.setItem(CAL_LS_KEY, JSON.stringify(data));
  } catch { /* quota exceeded — silently fail */ }
}

// ─── API functions with localStorage fallback ───────────────────────────────

export type MenstrualPhaseParam = "period" | "other";

export async function postSymptomLogsForDate(
  dateISO: string,
  symptoms: CalendarSymptomLogItem[],
  userKey?: string,
  opts?: { menstrualPhase?: MenstrualPhaseParam },
): Promise<CalendarSymptomLogResponse> {
  // Always persist locally so Calendar works offline
  const store = readCalendarLS();
  if (symptoms.length > 0) {
    store[dateISO] = symptoms;
  } else {
    delete store[dateISO];
  }
  writeCalendarLS(store);

  // Also sync the puberty health-log in localStorage so the
  // weekly-guidance engine picks up the period-phase symptoms.
  syncToHealthLog(dateISO, symptoms, opts?.menstrualPhase ?? "period");

  // Try remote API (fire-and-forget; calendar still works if it fails)
  try {
    return await apiFetch<CalendarSymptomLogResponse>("/api/symptoms/log", {
      method: "POST",
      headers: userKey ? { "X-User-Key": userKey } : {},
      body: JSON.stringify({
        date: dateISO,
        menstrualPhase: opts?.menstrualPhase ?? "period",
        symptoms,
      }),
    });
  } catch {
    return { date: dateISO, symptoms };
  }
}

export async function getSymptomLogsByDate(dateISO: string, userKey?: string): Promise<CalendarSymptomLogResponse> {
  try {
    return await apiFetch<CalendarSymptomLogResponse>(`/api/symptoms/date/${dateISO}`, {
      headers: userKey ? { "X-User-Key": userKey } : {},
    });
  } catch {
    // Fallback: read from localStorage
    const store = readCalendarLS();
    return { date: dateISO, symptoms: store[dateISO] ?? [] };
  }
}

export async function getSymptomLogsInRange(
  startISO: string,
  endISO: string,
  userKey?: string,
): Promise<CalendarSymptomLogResponse[]> {
  try {
    return await apiFetch<CalendarSymptomLogResponse[]>(
      `/api/symptoms/range?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`,
      {
        headers: userKey ? { "X-User-Key": userKey } : {},
      },
    );
  } catch {
    // Fallback: read from localStorage and filter by range
    const store = readCalendarLS();
    const results: CalendarSymptomLogResponse[] = [];
    for (const [date, symptoms] of Object.entries(store)) {
      if (date >= startISO && date <= endISO && symptoms.length > 0) {
        results.push({ date, symptoms });
      }
    }
    return results;
  }
}

export async function getSymptomAnalytics(symptomName: string, userKey?: string): Promise<SymptomAnalyticsResponse> {
  const normalized = symptomName.trim().toLowerCase();
  return apiFetch<SymptomAnalyticsResponse>(`/api/symptoms/${encodeURIComponent(normalized)}/analytics`, {
    headers: userKey ? { "X-User-Key": userKey } : {},
  });
}

export interface WeeklyGuidanceResponse {
  ageGroup: string;
  topSymptoms: string[];
  experience: string;
  nutrition: string[];
  emotionalCare: string[];
}

export async function getWeeklyGuidance(userKey?: string, dob?: string): Promise<WeeklyGuidanceResponse> {
  const q = dob ? `?dob=${encodeURIComponent(dob)}` : "";
  return apiFetch<WeeklyGuidanceResponse>(`/api/weekly-guidance${q}`, {
    headers: userKey ? { "X-User-Key": userKey } : {},
  });
}

export async function syncProfileDob(dateOfBirth: string, userKey?: string): Promise<void> {
  await apiFetch<void>("/api/profile/dob", {
    method: "POST",
    headers: userKey ? { "X-User-Key": userKey } : {},
    body: JSON.stringify({ dateOfBirth }),
  });
}

// ─── Helper: sync calendar symptom logs → useHealthLog's localStorage ────────
// This bridges calendar entries into the health-log store so the
// WeeklyGuidance engine (which reads health-logs) stays in sync.

function syncToHealthLog(dateISO: string, symptoms: CalendarSymptomLogItem[], phase: string) {
  if (phase !== "period") return; // only sync period-phase entries

  const HL_KEY = "ss-health-logs";
  try {
    const raw = localStorage.getItem(HL_KEY);
    const logs: Record<string, any> = raw ? JSON.parse(raw) : {};

    if (symptoms.length === 0) {
      delete logs[dateISO];
    } else {
      const symptomFlags: Record<string, boolean> = {
        cramps: false,
        fatigue: false,
        moodSwings: false,
        headache: false,
        acne: false,
        breastTenderness: false,
      };
      for (const s of symptoms) {
        if (s.name in symptomFlags) symptomFlags[s.name] = true;
      }

      logs[dateISO] = {
        phase: "puberty",
        periodStarted: false,
        periodEnded: false,
        flowIntensity: null,
        symptoms: symptomFlags,
        mood: null,
      };
    }

    localStorage.setItem(HL_KEY, JSON.stringify(logs));
  } catch { /* silently fail */ }
}
