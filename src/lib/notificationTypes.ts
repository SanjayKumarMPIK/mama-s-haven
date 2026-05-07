export type NotificationType = "emergency" | "recommendation" | "reminder" | "doctor-alert" | "informational";

export type NotificationSeverity = "critical" | "high" | "medium" | "low";

export interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  dismissed: boolean;
  metadata?: Record<string, unknown>;
}

export interface NotificationStore {
  notifications: Notification[];
}

export const NOTIFICATION_STORAGE_KEY = "ss-notifications-v1";

export const SEVERITY_COLORS: Record<NotificationSeverity, { bg: string; text: string; border: string; icon: string }> = {
  critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "text-red-600" },
  high: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", icon: "text-orange-600" },
  medium: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "text-amber-600" },
  low: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "text-blue-600" },
};

export const TYPE_ICONS: Record<NotificationType, { icon: string; label: string }> = {
  emergency: { icon: "AlertTriangle", label: "Emergency" },
  "doctor-alert": { icon: "Stethoscope", label: "Doctor Alert" },
  recommendation: { icon: "ClipboardList", label: "Recommendation" },
  reminder: { icon: "Clock", label: "Reminder" },
  informational: { icon: "Info", label: "Info" },
};