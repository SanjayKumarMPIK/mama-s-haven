import { HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE } from "@/lib/maternityHillstationConstants";
import type { MaternityHillstationAlert } from "@/services/maternityAlertStore";

/** Calendar days from today to EDD (local calendar date, midnight). Past due → negative. */
export function computeDaysLeftToDueDate(ymd: string): number {
  const day = String(ymd).split("T")[0];
  const parts = day.split("-").map((x) => parseInt(x, 10));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return Number.NaN;
  const [y, m, d] = parts;
  const due = new Date(y, m - 1, d);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function effectiveDaysLeftForHillstationAlert(a: MaternityHillstationAlert): number {
  if (Number.isFinite(a.days_left) && a.days_left >= 0) return a.days_left;
  const d = a.due_date?.trim();
  if (d && d.length >= 8) {
    try {
      return computeDaysLeftToDueDate(d);
    } catch {
      return -1;
    }
  }
  return -1;
}

/** Pregnancy hillstation rule: EDD known and due within 0..N days (inclusive). */
export function isInHillstationMaternityDeliveryWindow(a: MaternityHillstationAlert): boolean {
  const dl = effectiveDaysLeftForHillstationAlert(a);
  return (
    dl >= 0 &&
    dl <= HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE
  );
}
