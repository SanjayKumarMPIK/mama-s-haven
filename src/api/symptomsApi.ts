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

export type MenstrualPhaseParam = "period" | "other";

export async function postSymptomLogsForDate(
  dateISO: string,
  symptoms: CalendarSymptomLogItem[],
  userKey?: string,
  opts?: { menstrualPhase?: MenstrualPhaseParam },
): Promise<CalendarSymptomLogResponse> {
  return apiFetch<CalendarSymptomLogResponse>("/api/symptoms/log", {
    method: "POST",
    headers: userKey ? { "X-User-Key": userKey } : {},
    body: JSON.stringify({
      date: dateISO,
      menstrualPhase: opts?.menstrualPhase ?? "period",
      symptoms,
    }),
  });
}

export async function getSymptomLogsByDate(dateISO: string, userKey?: string): Promise<CalendarSymptomLogResponse> {
  return apiFetch<CalendarSymptomLogResponse>(`/api/symptoms/date/${dateISO}`, {
    headers: userKey ? { "X-User-Key": userKey } : {},
  });
}

export async function getSymptomLogsInRange(
  startISO: string,
  endISO: string,
  userKey?: string,
): Promise<CalendarSymptomLogResponse[]> {
  return apiFetch<CalendarSymptomLogResponse[]>(
    `/api/symptoms/range?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`,
    {
      headers: userKey ? { "X-User-Key": userKey } : {},
    },
  );
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

