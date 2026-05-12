/** Normalize PHC labels for comparison (case + spacing). */
export function normalizePhcLabel(s: string | undefined | null): string {
  return (s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Doctor rows from localStorage (demo / before Supabase sync). */
export function loadStoredDoctorPhcProfiles(): {
  phc_center: string;
  phc_location?: string;
}[] {
  const doctors: { phc_center: string; phc_location?: string }[] = [];
  try {
    const raw = localStorage.getItem("ss-doctor-profile");
    if (raw) {
      const doc = JSON.parse(raw) as {
        phc_center?: string;
        phc_location?: string;
      };
      const c = doc.phc_center?.trim();
      const loc = doc.phc_location?.trim();
      if (c || loc) {
        doctors.push({ phc_center: c ?? "", phc_location: loc });
      }
    }
  } catch {
    /* ignore */
  }
  try {
    const raw = localStorage.getItem("ss-doctor-profiles");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const doc of parsed as { phc_center?: string; phc_location?: string }[]) {
          const c = doc.phc_center?.trim();
          const loc = doc.phc_location?.trim();
          if (c || loc) {
            const key = `${c ?? ""}|${loc ?? ""}`;
            if (!doctors.some((d) => `${d.phc_center}|${d.phc_location ?? ""}` === key)) {
              doctors.push({ phc_center: c ?? "", phc_location: loc });
            }
          }
        }
      }
    }
  } catch {
    /* ignore */
  }
  return doctors;
}

/** Split "PHC A, PHC B / PHC C" so each nearby PHC can match a different doctor row. */
export function splitPatientNearbyPhcTokens(
  patientNearbyPhc: string | undefined | null,
): string[] {
  const n = normalizePhcLabel(patientNearbyPhc);
  if (!n) return [];
  const parts = n
    .split(/[,;/|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [n];
}

function patientOneNormalizedPhcMatchesDoctor(
  patientToken: string,
  doctorPhcCenter: string | undefined | null,
  doctorPhcLocation: string | undefined | null,
): boolean {
  const p = patientToken;
  if (!p) return false;
  const center = normalizePhcLabel(doctorPhcCenter);
  const loc = normalizePhcLabel(doctorPhcLocation);
  if (center && p === center) return true;
  if (center && (p.includes(center) || center.includes(p))) return true;
  if (loc && (loc.includes(p) || p.includes(loc))) return true;
  const strip = (s: string) => s.replace(/[.,\-_/()]/g, "");
  const ps = strip(p);
  if (center && ps === strip(center)) return true;
  if (loc && ps === strip(loc)) return true;
  return false;
}

/**
 * True when any patient nearby PHC token aligns with the doctor's PHC center
 * or PHC location (all doctors at matching PHCs receive the same shared alert).
 */
export function patientPhcMatchesDoctorPhc(
  patientNearbyPhc: string | undefined | null,
  doctorPhcCenter: string | undefined | null,
  doctorPhcLocation: string | undefined | null,
): boolean {
  return splitPatientNearbyPhcTokens(patientNearbyPhc).some((token) =>
    patientOneNormalizedPhcMatchesDoctor(token, doctorPhcCenter, doctorPhcLocation),
  );
}
