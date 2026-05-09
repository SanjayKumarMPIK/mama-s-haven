export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface ConnectionRequest {
  id: string;
  patientName: string;
  patientPhase: string;
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

export function createRequest(doctorCode: string): ConnectionRequest | null {
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
    patientName: "Patient",
    patientPhase: "Maternity",
    doctorCode,
    doctorId,
    status: "pending",
    createdAt: new Date().toISOString(),
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
