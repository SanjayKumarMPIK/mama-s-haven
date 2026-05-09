export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface PatientProfileData {
  fullName: string;
  age: number;
  lifeStage: string;
  trimester?: number;
  pregnancyWeek?: number;
  expectedDueDate?: string;
}

export interface ConnectionRequest {
  id: string;
  patientName: string;
  patientPhase: string;
  patientProfile?: PatientProfileData;
  doctorCode: string;
  doctorId: string;
  status: ConnectionStatus;
  createdAt: string;
  pregnancyWeek?: number;
  riskLevel?: string;
}

const STORAGE_KEY = "ss-connection-requests";

function load(): ConnectionRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ConnectionRequest[];
  } catch {
    /* ignore */
  }
  return [];
}

function save(requests: ConnectionRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch {
    /* ignore */
  }
}

function isValidDoctorCode(code: string): boolean {
  try {
    const raw = localStorage.getItem("ss-doctor-profile");
    if (!raw) return false;
    const profile = JSON.parse(raw) as { doctorCode?: string };
    return profile.doctorCode === code;
  } catch {
    return false;
  }
}

export function createRequest(doctorCode: string, profile?: PatientProfileData): ConnectionRequest | null {
  if (!isValidDoctorCode(doctorCode)) return null;

  const requests = load();
  const existing = requests.find((r) => r.doctorCode === doctorCode && r.status === "pending");
  if (existing) return existing;

  let doctorId = "doctor-demo-123";
  try {
    const raw = localStorage.getItem("ss-doctor-profile");
    if (raw) {
      const profile = JSON.parse(raw);
      doctorId = profile.id ?? "doctor-demo-123";
    }
  } catch {
    /* ignore */
  }

  const request: ConnectionRequest = {
    id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    patientName: profile?.fullName ?? "Patient",
    patientPhase: profile?.lifeStage ?? "Maternity",
    patientProfile: profile,
    doctorCode,
    doctorId,
    status: "pending",
    createdAt: new Date().toISOString(),
    pregnancyWeek: profile?.pregnancyWeek,
  };

  requests.push(request);
  save(requests);
  return request;
}

export function getRequestByCode(doctorCode: string): ConnectionRequest | undefined {
  return load().find((r) => r.doctorCode === doctorCode);
}

export function getAllRequests(): ConnectionRequest[] {
  return load().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getRequestsByDoctor(doctorId: string): ConnectionRequest[] {
  return load()
    .filter((r) => r.doctorId === doctorId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateRequestStatus(
  requestId: string,
  status: ConnectionStatus,
): ConnectionRequest | null {
  const requests = load();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  requests[idx].status = status;
  save(requests);
  return requests[idx];
}

export function deleteRequest(requestId: string): boolean {
  const requests = load();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx === -1) return false;
  requests.splice(idx, 1);
  save(requests);
  return true;
}

/* ─── Unique Health User ID ─── */

const HEALTH_ID_KEY = "ss-health-user-id";

interface HealthUserIdRecord {
  doctorCode: string;
  healthId: string;
  phase: string;
  createdAt: string;
}

function getPhasePrefix(phase: string): string {
  const map: Record<string, string> = {
    Puberty: "SS-PUB",
    Maternity: "SS-MAT",
    "Family Planning": "SS-FAM",
    Menopause: "SS-MEN",
  };
  return map[phase] || "SS-MAT";
}

function generateId(prefix: string): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${num}`;
}

function loadHealthIds(): HealthUserIdRecord[] {
  try {
    const raw = localStorage.getItem(HEALTH_ID_KEY);
    if (raw) return JSON.parse(raw) as HealthUserIdRecord[];
  } catch { /* ignore */ }
  return [];
}

function saveHealthIds(records: HealthUserIdRecord[]) {
  try {
    localStorage.setItem(HEALTH_ID_KEY, JSON.stringify(records));
  } catch { /* ignore */ }
}

export function getOrCreateHealthUserId(doctorCode: string, phase: string): string {
  const records = loadHealthIds();
  const existing = records.find((r) => r.doctorCode === doctorCode);
  if (existing) return existing.healthId;

  const prefix = getPhasePrefix(phase);
  let id: string;
  do {
    id = generateId(prefix);
  } while (records.some((r) => r.healthId === id));

  records.push({ doctorCode, healthId: id, phase, createdAt: new Date().toISOString() });
  saveHealthIds(records);
  return id;
}

export function getHealthUserId(doctorCode: string): string | null {
  const records = loadHealthIds();
  const existing = records.find((r) => r.doctorCode === doctorCode);
  return existing?.healthId ?? null;
}
