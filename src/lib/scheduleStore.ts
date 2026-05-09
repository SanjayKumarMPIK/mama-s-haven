export type ScheduleRequestStatus = "pending" | "accepted" | "declined" | "confirmed" | "rescheduled" | "completed";
export type RequestType = "user_to_doctor" | "doctor_to_user";
export type AppointmentReason = "General Checkup" | "Pregnancy Consultation" | "Scan/Test Review" | "Emergency Concern" | "Medication Discussion" | "Follow-up";
export type ConsultationMode = "In-person" | "Online";
export type Priority = "Normal" | "Moderate" | "Urgent";

export interface ScheduleRequest {
  id: string;
  patientName: string;
  doctorName: string;
  phase: string;
  requestType: RequestType;
  appointmentReason: AppointmentReason;
  preferredDate: string;
  preferredTime: string;
  consultationMode: ConsultationMode;
  priority: Priority;
  notes: string;
  symptomsSummary?: string;
  status: ScheduleRequestStatus;
  doctorCode: string;
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = "ss-schedule-requests";

function load(): ScheduleRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ScheduleRequest[];
  } catch { /* ignore */ }
  return [];
}

function save(requests: ScheduleRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch { /* ignore */ }
}

export function createScheduleRequest(
  data: Omit<ScheduleRequest, "id" | "createdAt" | "updatedAt">
): ScheduleRequest {
  const requests = load();
  const newReq: ScheduleRequest = {
    ...data,
    id: `sr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };
  requests.push(newReq);
  save(requests);
  return newReq;
}

export function getScheduleRequestsByCode(doctorCode: string): ScheduleRequest[] {
  return load()
    .filter((r) => r.doctorCode === doctorCode)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateScheduleRequestStatus(
  requestId: string,
  status: ScheduleRequestStatus
): ScheduleRequest | null {
  const requests = load();
  const idx = requests.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  requests[idx].status = status;
  requests[idx].updatedAt = new Date().toISOString();
  save(requests);
  return requests[idx];
}

export function getFilteredScheduleRequests(
  doctorCode: string,
  filterFn: (r: ScheduleRequest) => boolean
): ScheduleRequest[] {
  return load().filter((r) => r.doctorCode === doctorCode && filterFn(r));
}

export function getAllScheduleActivity(
  doctorCode: string,
  limit = 10
): ScheduleRequest[] {
  return load()
    .filter((r) => r.doctorCode === doctorCode)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
