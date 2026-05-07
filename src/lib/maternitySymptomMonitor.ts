import type { HealthLogs } from "@/hooks/useHealthLog";
import type { Notification } from "./notificationTypes";

export type SevereSymptomId =
  | "headache"
  | "bleeding"
  | "abdominalPain"
  | "dizziness"
  | "chestPain"
  | "shortnessOfBreath"
  | "severeNausea"
  | "vomiting"
  | "severeFatigue"
  | "fever";

const SEVERE_SYMPTOMS: SevereSymptomId[] = [
  "headache",
  "bleeding",
  "abdominalPain",
  "dizziness",
  "chestPain",
  "shortnessOfBreath",
  "severeNausea",
  "vomiting",
  "severeFatigue",
  "fever",
];

const DAY_MS = 1000 * 60 * 60 * 24;
const ROLLING_WINDOW_DAYS = 40;
const REQUIRED_SEVERE_DAYS = 10;

export function getSymptomDisplayName(symptomId: SevereSymptomId): string {
  const names: Record<SevereSymptomId, string> = {
    headache: "Severe Headache",
    bleeding: "Severe Bleeding",
    abdominalPain: "Severe Abdominal Pain",
    dizziness: "Severe Dizziness",
    chestPain: "Chest Pain",
    shortnessOfBreath: "Shortness of Breath",
    severeNausea: "Severe Nausea",
    vomiting: "Severe Vomiting",
    severeFatigue: "Severe Fatigue",
    fever: "Fever",
  };
  return names[symptomId] ?? symptomId;
}

function isSymptomSevere(
  entry: Record<string, unknown>,
  symptomId: SevereSymptomId
): boolean {
  const severities = (entry as any).symptomSeverities as
    | Record<string, "mild" | "moderate" | "severe">
    | undefined;
  if (severities?.[symptomId] === "severe") return true;

  if (symptomId === "severeFatigue") {
    const fatigueLevel = (entry as any).fatigueLevel;
    if (fatigueLevel === "High") return true;
  }

  const symptoms = (entry as any).symptoms as Record<string, boolean> | undefined;
  if (symptoms?.[symptomId]) {
    const intensities = (entry as any).symptomIntensities as
      | Record<string, number>
      | undefined;
    if (intensities?.[symptomId] >= 7) return true;
  }

  return false;
}

export function analyzeMaternitySymptoms(
  logs: HealthLogs,
  currentDate: Date = new Date()
): Omit<Notification, "id" | "timestamp" | "read" | "dismissed">[] {
  const notifications: Omit<Notification, "id" | "timestamp" | "read" | "dismissed">[] = [];

  const windowStart = new Date(currentDate);
  windowStart.setDate(windowStart.getDate() - ROLLING_WINDOW_DAYS);

  const windowLogs = Object.entries(logs)
    .filter(([dateStr]) => {
      const logDate = new Date(dateStr + "T12:00:00");
      return logDate >= windowStart && logDate <= currentDate;
    })
    .sort(([a], [b]) => a.localeCompare(b));

  for (const symptomId of SEVERE_SYMPTOMS) {
    const consecutiveDays = findConsecutiveSevereDays(windowLogs, symptomId);

    if (consecutiveDays >= REQUIRED_SEVERE_DAYS) {
      const displayName = getSymptomDisplayName(symptomId);
      notifications.push({
        type: "emergency",
        severity: "critical",
        title: "Persistent Severe Symptoms Detected",
        message: `${displayName} has been marked as severe for ${consecutiveDays} days within a 40-day period. Immediate medical attention recommended.`,
        metadata: {
          symptomName: symptomId,
          consecutiveDays,
          doctorEscalationRecommended: true,
        },
      });
    }
  }

  return notifications;
}

function findConsecutiveSevereDays(
  windowLogs: [string, Record<string, unknown>][],
  symptomId: SevereSymptomId
): number {
  let maxConsecutive = 0;
  let currentStreak = 0;

  for (const [, entry] of windowLogs) {
    if ((entry as any).phase !== "maternity") continue;

    if (isSymptomSevere(entry, symptomId)) {
      currentStreak++;
      maxConsecutive = Math.max(maxConsecutive, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return maxConsecutive;
}

export function generateRecommendationNotifications(
  dueDateISO: string | null,
  currentDate: Date = new Date()
): Omit<Notification, "id" | "timestamp" | "read" | "dismissed">[] {
  const notifications: Omit<Notification, "id" | "timestamp" | "read" | "dismissed">[] = [];

  if (!dueDateISO) return notifications;

  const dueDate = new Date(dueDateISO + "T12:00:00");
  if (isNaN(dueDate.getTime())) return notifications;

  const totalDays = 280;
  const daysLeft = Math.ceil((dueDate.getTime() - currentDate.getTime()) / DAY_MS);
  const daysPassed = totalDays - daysLeft;
  const week = Math.max(1, Math.min(40, Math.ceil(daysPassed / 7)));

  if (week >= 6 && week <= 8) {
    notifications.push({
      type: "recommendation",
      severity: "medium",
      title: "Blood Test Due",
      message: "First trimester blood work is recommended between weeks 6-8 of pregnancy.",
      metadata: { recommendationType: "blood-test" },
    });
  }

  if (week >= 8 && week <= 12) {
    notifications.push({
      type: "recommendation",
      severity: "medium",
      title: "ANC Scan Reminder",
      message: "Your first ANC (Antenatal Care) scan is due. Please schedule an appointment with your doctor.",
      metadata: { recommendationType: "anc-scan" },
    });
  }

  if (week >= 16 && week <= 20) {
    notifications.push({
      type: "recommendation",
      severity: "medium",
      title: "Glucose Screening Recommended",
      message: "Gestational diabetes screening is recommended between weeks 16-20.",
      metadata: { recommendationType: "glucose-screening" },
    });
  }

  if (week >= 24 && week <= 28) {
    notifications.push({
      type: "recommendation",
      severity: "medium",
      title: "Iron Level Test Reminder",
      message: "Iron deficiency screening is recommended in the second trimester.",
      metadata: { recommendationType: "iron-test" },
    });
  }

  if (week >= 32) {
    notifications.push({
      type: "reminder",
      severity: "low",
      title: "Third Trimester Checkups",
      message: "You should have checkups every 2 weeks until 36 weeks, then weekly thereafter.",
      metadata: { recommendationType: "checkup-reminder" },
    });
  }

  return notifications;
}

export function runMaternityNotificationCheck(
  maternityLogs: HealthLogs,
  dueDateISO: string | null
): Omit<Notification, "id" | "timestamp" | "read" | "dismissed">[] {
  const emergencyNotifications = analyzeMaternitySymptoms(maternityLogs);
  const recommendationNotifications = generateRecommendationNotifications(dueDateISO);
  return [...emergencyNotifications, ...recommendationNotifications];
}