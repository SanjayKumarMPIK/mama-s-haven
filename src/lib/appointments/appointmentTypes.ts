// ─── Appointment Types & Constants ────────────────────────────────────────────────
// Maternity-specific appointment tracking for Care Log module

export type AppointmentStatus = "upcoming" | "completed" | "missed" | "rescheduled";

export type AppointmentType =
  | "doctor_consultation"
  | "ultrasound_scan"
  | "blood_test"
  | "lab_test"
  | "vaccination"
  | "nutrition_counseling"
  | "follow_up"
  | "hospital_visit"
  | "other";

export type ReminderType = "1_day_before" | "3_days_before" | "same_day" | "custom" | "none";

export interface Appointment {
  id: string;
  title: string;
  type: AppointmentType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM format
  doctorName?: string;
  hospitalName?: string;
  notes?: string;
  pregnancyWeek?: number;
  reminderType: ReminderType;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Appointment Type Labels ─────────────────────────────────────────────────────

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  doctor_consultation: "Doctor Consultation",
  ultrasound_scan: "Ultrasound / Scan",
  blood_test: "Blood Test",
  lab_test: "Lab Test",
  vaccination: "Vaccination",
  nutrition_counseling: "Nutrition Counseling",
  follow_up: "Follow-up Visit",
  hospital_visit: "Hospital Visit",
  other: "Other",
};

// ─── Appointment Type Icons (emoji for simplicity) ─────────────────────────────────

export const APPOINTMENT_TYPE_ICONS: Record<AppointmentType, string> = {
  doctor_consultation: "👨‍⚕️",
  ultrasound_scan: "🔬",
  blood_test: "🩸",
  lab_test: "🧪",
  vaccination: "💉",
  nutrition_counseling: "🥗",
  follow_up: "📋",
  hospital_visit: "🏥",
  other: "📅",
};

// ─── Status Configuration ───────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  AppointmentStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  upcoming: {
    label: "Upcoming",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  completed: {
    label: "Completed",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  missed: {
    label: "Missed",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
  },
  rescheduled: {
    label: "Rescheduled",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

// ─── Reminder Type Labels ─────────────────────────────────────────────────────────

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  "1_day_before": "1 day before",
  "3_days_before": "3 days before",
  same_day: "Same day",
  custom: "Custom",
  none: "No reminder",
};

// ─── Filter Options ───────────────────────────────────────────────────────────────

export type AppointmentFilter = "all" | "upcoming" | "completed" | "missed" | "this_month";

export const FILTER_LABELS: Record<AppointmentFilter, string> = {
  all: "All",
  upcoming: "Upcoming",
  completed: "Completed",
  missed: "Missed",
  this_month: "This Month",
};

// ─── Storage Key ─────────────────────────────────────────────────────────────────

export const APPOINTMENTS_STORAGE_KEY = "mh-maternity-appointments";
