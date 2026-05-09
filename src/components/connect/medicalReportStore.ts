export type SeverityLevel = "Low" | "Moderate" | "High" | "Emergency";
export type ReportStatus = "Sent" | "Viewed" | "Reviewed";

export interface MedicalReport {
  id: string;
  title: string;
  symptoms: string[];
  severity: SeverityLevel;
  duration: string;
  description: string;
  phase: string;
  trimester?: number;
  pregnancyWeek?: number;
  patientName: string;
  doctorCode: string;
  doctorId: string;
  doctorName: string;
  timestamp: string;
  status: ReportStatus;
}

const REPORTS_KEY = "ss-medical-reports";
const CREDIT_KEY = "ss-report-credits";

interface CreditState {
  available: number;
  lastReset: string;
}

function loadReports(): MedicalReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (raw) return JSON.parse(raw) as MedicalReport[];
  } catch { }
  return [];
}

function saveReports(reports: MedicalReport[]) {
  try { localStorage.setItem(REPORTS_KEY, JSON.stringify(reports)); } catch { }
}

export function getAllReports(): MedicalReport[] {
  return loadReports().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getReportsByPatient(doctorCode: string): MedicalReport[] {
  return loadReports()
    .filter((r) => r.doctorCode === doctorCode)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getReportsByDoctor(doctorId: string): MedicalReport[] {
  return loadReports()
    .filter((r) => r.doctorId === doctorId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getReportsForDoctorCode(doctorCode: string): MedicalReport[] {
  return loadReports()
    .filter((r) => r.doctorCode === doctorCode)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function addReport(report: MedicalReport): void {
  const reports = loadReports();
  reports.push(report);
  saveReports(reports);
}

export function updateReportStatus(reportId: string, status: ReportStatus): void {
  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === reportId);
  if (idx !== -1) {
    reports[idx].status = status;
    saveReports(reports);
  }
}

export function getReportsCountByDoctor(doctorId: string): number {
  return loadReports().filter((r) => r.doctorId === doctorId).length;
}

function loadCredits(): CreditState {
  try {
    const raw = localStorage.getItem(CREDIT_KEY);
    if (raw) return JSON.parse(raw) as CreditState;
  } catch { }
  return { available: 2, lastReset: new Date().toISOString() };
}

function saveCredits(state: CreditState) {
  try { localStorage.setItem(CREDIT_KEY, JSON.stringify(state)); } catch { }
}

export function getAvailableCredits(): number {
  const state = loadCredits();
  const now = new Date();
  const last = new Date(state.lastReset);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays >= 2) {
    const newState: CreditState = { available: 2, lastReset: now.toISOString() };
    saveCredits(newState);
    return 2;
  }
  return state.available;
}

export function deductCredits(severity: SeverityLevel): boolean {
  const cost = severity === "High" || severity === "Emergency" ? 2 : 1;
  const state = loadCredits();
  const now = new Date();
  const last = new Date(state.lastReset);
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays >= 2) {
    const fresh: CreditState = { available: 2, lastReset: now.toISOString() };
    if (fresh.available >= cost) {
      fresh.available -= cost;
      saveCredits(fresh);
      return true;
    }
    saveCredits(fresh);
    return false;
  }
  if (state.available >= cost) {
    state.available -= cost;
    saveCredits(state);
    return true;
  }
  return false;
}

export function getCreditCost(severity: SeverityLevel): number {
  return severity === "High" || severity === "Emergency" ? 2 : 1;
}

export const DURATION_OPTIONS = ["1 day", "2 days", "3 days", "5 days", "1 week", "2 weeks"];
