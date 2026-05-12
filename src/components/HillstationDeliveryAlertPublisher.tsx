import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import {
  publishPatientHillstationAlert,
  revokePatientHillstationAlerts,
  hasAnyDoctorForPatient,
} from "@/services/maternityHillstationSupabase";
import { HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE } from "@/lib/maternityHillstationConstants";
import { computeDaysLeftToDueDate } from "@/lib/maternityHillstationAlertWindow";
import { isHighRiskRegionType } from "@/lib/regionalRiskZones";
import { logAlertAudit } from "@/services/maternityAlertAudit";

/**
 * When a mother is in maternity (pregnancy) + hillstation/high-risk region,
 * EDD within 0..7 days, and a doctor is connected or PHC-matched,
 * publishes a Supabase alert so doctors see the in-app popup on any doctor route.
 *
 * Enhanced with:
 * - Regional risk zone matching (not just string equality)
 * - Connection-aware doctor validation
 * - Audit logging for failures
 * - Dual EDD source: auth profile OR pregnancy profile (whichever is available)
 */
export default function HillstationDeliveryAlertPublisher() {
  const { user, fullProfile } = useAuth();
  const { role } = useRole();
  const { activeEDD: pregnancyEDD, profile: pregProfile } = usePregnancyProfile();
  const lastSig = useRef<string>("");

  useEffect(() => {
    if (role === "doctor" || !user?.id || !fullProfile) return;

    const life = fullProfile.health?.lifeStage ?? "";
    const regionType = fullProfile.location?.regionType ?? "";
    const nearby = fullProfile.location?.nearbyPhc ?? "";
    // Use auth profile EDD first, fall back to pregnancy profile's computed EDD
    const authEdd = fullProfile.health?.expectedDueDate ?? "";
    const edd = authEdd || pregnancyEDD || "";
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
    const isMaternity = lifeNorm === "maternity";

    // Enhanced region detection: uses regionalRiskZones registry + legacy string check
    const regionNorm = String(regionType).trim().toLowerCase().replace(/\s+/g, "");
    const isHill =
      isHighRiskRegionType(regionType) ||
      regionNorm === "hillstation" ||
      regionNorm === "hill-station";

    const inDeliveryWindow =
      Number.isFinite(daysLeft) &&
      daysLeft >= 0 &&
      daysLeft <= HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE;

    // ── Diagnostic logging ──
    console.log("=== HillstationDeliveryAlertPublisher ===");
    console.log("  lifeStage:", life, "→ isMaternity:", isMaternity);
    console.log("  regionType:", regionType, "→ isHillstation:", isHill);
    console.log("  EDD:", eddYmd, "→ daysLeft:", daysLeft, "→ inWindow (0-7):", inDeliveryWindow);
    console.log("  nearbyPhc:", nearby);
    console.log("  patientName:", name);

    if (
      !isMaternity ||
      !isHill ||
      !String(nearby).trim() ||
      !eddYmd ||
      !inDeliveryWindow
    ) {
      const reasons = [];
      if (!isMaternity) reasons.push("not maternity phase");
      if (!isHill) reasons.push("not hillstation region");
      if (!String(nearby).trim()) reasons.push("no nearby PHC");
      if (!eddYmd) reasons.push("no EDD set");
      if (!inDeliveryWindow) reasons.push(`EDD not in 0-7 day window (daysLeft=${daysLeft})`);
      console.log("  ❌ Alert NOT triggered:", reasons.join(", "));
      console.log("=========================================");
      lastSig.current = sig;
      void revokePatientHillstationAlerts(user.id);
      return;
    }

    console.log("  ✅ All conditions met — publishing alert...");
    console.log("=========================================");
    lastSig.current = sig;

    // Connection-aware doctor check: connection first, then PHC fallback
    void (async () => {
      const hasDoctor = await hasAnyDoctorForPatient(user.id, String(nearby).trim());
      if (!hasDoctor) {
        console.warn('[HillstationAlert] No connected doctor or PHC match — alert not published');
        void logAlertAudit('connection_check_failed', {
          actorId: user.id,
          actorRole: 'patient',
          detail: { nearbyPhc: String(nearby).trim(), state, regionType },
        });
        return;
      }

      console.log('[HillstationAlert] ✅ Doctor found — publishing to Supabase...');
      const success = await publishPatientHillstationAlert({
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
      console.log('[HillstationAlert]', success ? '✅ Alert published successfully' : '❌ Publish failed');
    })();
  }, [user?.id, fullProfile, role, pregnancyEDD]);

  return null;
}

