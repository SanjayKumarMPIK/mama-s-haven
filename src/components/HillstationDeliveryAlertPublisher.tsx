import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import {
  publishPatientHillstationAlert,
  revokePatientHillstationAlerts,
} from "@/services/maternityHillstationSupabase";
import { HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE } from "@/lib/maternityHillstationConstants";
import { computeDaysLeftToDueDate } from "@/lib/maternityHillstationAlertWindow";

/**
 * When a mother is in maternity (pregnancy) + hillstation, EDD within 0..7 days,
 * and nearby PHC matches a doctor in `doctor_profiles`, publishes a Supabase alert
 * so those doctors see the in-app popup on any doctor route.
 */
export default function HillstationDeliveryAlertPublisher() {
  const { user, fullProfile } = useAuth();
  const { role } = useRole();
  const lastSig = useRef<string>("");

  useEffect(() => {
    if (role === "doctor" || !user?.id || !fullProfile) return;

    const life = fullProfile.health?.lifeStage ?? "";
    const regionType = fullProfile.location?.regionType ?? "";
    const nearby = fullProfile.location?.nearbyPhc ?? "";
    const edd = fullProfile.health?.expectedDueDate ?? "";
    const name = fullProfile.basic?.fullName ?? "Patient";
    const mobile = fullProfile.basic?.mobile ?? "";
    const state = fullProfile.location?.state ?? "";
    const age = parseInt(String(fullProfile.basic?.age ?? "0"), 10) || undefined;
    const blood = fullProfile.basic?.bloodGroup ?? undefined;
    const trim = fullProfile.health?.trimester
      ? parseInt(String(fullProfile.health.trimester), 10)
      : undefined;

    const eddYmd = edd ? String(edd).split("T")[0] : "";
    const daysLeft = eddYmd ? computeDaysLeftToDueDate(eddYmd) : Number.NaN;
    const sig = `${life}|${regionType}|${nearby}|${eddYmd}|${name}|${mobile}|${state}|${daysLeft}`;
    if (sig === lastSig.current) return;

    const lifeNorm = String(life).trim().toLowerCase();
    const regionNorm = String(regionType).trim().toLowerCase().replace(/\s+/g, "");
    const isMaternity = lifeNorm === "maternity";
    const isHill =
      regionNorm === "hillstation" || regionNorm === "hill-station";
    const inDeliveryWindow =
      Number.isFinite(daysLeft) &&
      daysLeft >= 0 &&
      daysLeft <= HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE;

    if (
      !isMaternity ||
      !isHill ||
      !String(nearby).trim() ||
      !eddYmd ||
      !inDeliveryWindow
    ) {
      lastSig.current = sig;
      void revokePatientHillstationAlerts(user.id);
      return;
    }

    lastSig.current = sig;

    void publishPatientHillstationAlert({
      patientId: user.id,
      patientName: name,
      nearbyPhc: String(nearby).trim(),
      stateOrVillage: state,
      emergencyContact: mobile || "—",
      expectedDueDate: eddYmd,
      age,
      bloodGroup: blood,
      trimester: Number.isFinite(trim) ? trim : undefined,
    });
  }, [user?.id, fullProfile, role]);

  return null;
}
