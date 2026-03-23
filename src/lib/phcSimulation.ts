import type { Phase } from "@/hooks/usePhase";

export type RiskLevel = "stable" | "attention" | "priority";

export const DEFAULT_PHC_NAME = "Urban PHC – Sector 12";

export interface PhcInputs {
  phase: Phase;
  cycleLength: number | null;
  hb: number | null;
  symptoms: string[];
}

export function cycleStatusLabel(cycleLength: number | null): string {
  if (cycleLength === null || Number.isNaN(cycleLength)) return "Not provided";
  if (cycleLength < 21 || cycleLength > 35) return "Irregular pattern (outside 21–35 days)";
  return "Regular (21–35 days)";
}

export function evaluateRisk(input: PhcInputs): {
  level: RiskLevel;
  banner: string;
  phcResponse: string;
  reminders: string[];
} {
  const { phase, cycleLength, hb, symptoms } = input;
  const hasSevereSymptom = symptoms.some((s) =>
    /severe|bleeding|faint|high fever|vision/i.test(s),
  );
  const hasAnySymptom = symptoms.length > 0;
  const irregular = cycleLength !== null && (cycleLength < 21 || cycleLength > 35);
  const lowHb = hb !== null && !Number.isNaN(hb) && hb < 12;
  const criticalHb = hb !== null && !Number.isNaN(hb) && hb < 8;

  let level: RiskLevel = "stable";

  if (criticalHb || hasSevereSymptom || (phase === "maternity" && hasAnySymptom && /bleed|severe pain/i.test(symptoms.join(" ")))) {
    level = "priority";
  } else if (irregular || lowHb || hasAnySymptom) {
    level = "attention";
  }

  const banner =
    level === "stable"
      ? "Routine check-up recommended every 6 months"
      : level === "attention"
        ? "Visit PHC within 2–4 weeks"
        : "Immediate PHC consultation recommended";

  const phcResponse =
    level === "stable"
      ? `${DEFAULT_PHC_NAME}: Your inputs suggest routine follow-up. Continue healthy habits and keep ANC or adolescent records updated.`
      : level === "attention"
        ? `${DEFAULT_PHC_NAME}: Please schedule a non-urgent review within 2–4 weeks. Bring any recent lab reports if available.`
        : `${DEFAULT_PHC_NAME}: Please attend the centre as soon as possible for assessment, or use emergency services if symptoms worsen.`;

  const reminders: string[] = [];
  if (level === "stable") {
    reminders.push("Time for your 6-month check-up");
  }
  if (lowHb) {
    reminders.push("Low Hb detected — visit PHC");
  }
  if (irregular && phase !== "maternity") {
    reminders.push("Irregular cycle — discuss with PHC nurse");
  }
  if (reminders.length === 0 && level !== "stable") {
    reminders.push("Follow PHC guidance for your current symptoms");
  }

  return { level, banner, phcResponse, reminders };
}

export function randomAppointmentSlot(): { date: Date; timeLabel: string } {
  const daysAhead = 3 + Math.floor(Math.random() * 5);
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const hour = 9 + Math.floor(Math.random() * 7);
  const minute = Math.random() < 0.5 ? "00" : "30";
  const timeLabel = `${hour.toString().padStart(2, "0")}:${minute}`;
  return { date: d, timeLabel };
}

export function formatAppointmentDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
