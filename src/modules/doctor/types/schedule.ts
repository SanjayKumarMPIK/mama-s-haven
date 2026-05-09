export type ScheduleStatus = "Scheduled" | "Completed" | "Cancelled" | "Emergency" | "Rescheduled";
export type SchedulePriority = "Normal" | "Moderate" | "Critical";
export type PregnancyPhase = "Puberty" | "Maternity" | "Postpartum";
export type ScheduleType = "Checkup" | "Emergency" | "Follow-up" | "Scan/Test";
export type ConsultationMode = "In-person" | "Online";

export interface Schedule {
  id: string;
  patientName: string;
  phase: PregnancyPhase;
  scheduleDate: string;
  scheduleTime: string;
  scheduleType: ScheduleType;
  consultationMode: ConsultationMode;
  priority: SchedulePriority;
  status: ScheduleStatus;
  notes: string;
  createdAt: string;
}

export interface ScheduleFormData {
  patientName: string;
  phase: PregnancyPhase;
  scheduleDate: string;
  scheduleTime: string;
  scheduleType: ScheduleType;
  consultationMode: ConsultationMode;
  notes: string;
  priority: SchedulePriority;
}
