import {
  createAlert,
  expireOldAlerts,
  canGenerateAlert,
} from "./maternityAlertStore";
import { patientPhcMatchesDoctorPhc } from "@/lib/phcMatch";
import { HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE } from "@/lib/maternityHillstationConstants";

const DEMO_PATIENTS_KEY = "ss-maternity-hillstation-demo-patients";
const SEEDED_KEY = "ss-maternity-hillstation-seeded";

function seededPatientsExist(): boolean {
  return localStorage.getItem(SEEDED_KEY) === "true";
}

function markSeeded() {
  localStorage.setItem(SEEDED_KEY, "true");
}

// ── Demo patient profile (mirrors relevant fields from StoredUserData) ───

export interface HillstationPatientProfile {
  id: string;
  full_name: string;
  age: number;
  phase: "maternity";
  pregnancy_status: "active";
  pregnancy_due_date: string;
  region_type: "hillstation";
  nearby_phc: string;
  village_town: string;
  emergency_contact: string;
}

function getTodayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function seedDemoPatients(): HillstationPatientProfile[] {
  const today = getTodayISO();

  const patients: HillstationPatientProfile[] = [
    {
      id: "demo-hill-pat-1",
      full_name: "Priya R",
      age: 26,
      phase: "maternity",
      pregnancy_status: "active",
      pregnancy_due_date: addDays(today, 2),
      region_type: "hillstation",
      nearby_phc: "Anna Nagar PHC",
      village_town: "Kodaikanal Hill Region",
      emergency_contact: "+91 98765 43210",
    },
    {
      id: "demo-hill-pat-2",
      full_name: "Lakshmi S",
      age: 29,
      phase: "maternity",
      pregnancy_status: "active",
      pregnancy_due_date: addDays(today, 1),
      region_type: "hillstation",
      nearby_phc: "Anna Nagar PHC",
      village_town: "Ooty Town",
      emergency_contact: "+91 98765 43211",
    },
    {
      id: "demo-hill-pat-3",
      full_name: "Ananya K",
      age: 24,
      phase: "maternity",
      pregnancy_status: "active",
      pregnancy_due_date: addDays(today, 0),
      region_type: "hillstation",
      nearby_phc: "Tambaram PHC",
      village_town: "Yercaud Hills",
      emergency_contact: "+91 98765 43212",
    },
  ];

  localStorage.setItem(DEMO_PATIENTS_KEY, JSON.stringify(patients));
  markSeeded();
  return patients;
}

function loadDemoPatients(): HillstationPatientProfile[] {
  try {
    const raw = localStorage.getItem(DEMO_PATIENTS_KEY);
    if (raw) return JSON.parse(raw) as HillstationPatientProfile[];
  } catch {}
  return [];
}

function loadDoctorProfiles(): { id: string; phc_center: string; phc_location?: string }[] {
  const doctors: { id: string; phc_center: string; phc_location?: string }[] = [];
  try {
    const raw = localStorage.getItem("ss-doctor-profile");
    if (raw) {
      const doc = JSON.parse(raw) as { id?: string; phc_center?: string; phc_location?: string };
      if (doc.id && doc.phc_center) {
        doctors.push({ id: doc.id, phc_center: doc.phc_center, phc_location: doc.phc_location });
      }
    }
  } catch {}
  try {
    const raw = localStorage.getItem("ss-doctor-profiles");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const doc of parsed as { id?: string; phc_center?: string; phc_location?: string }[]) {
          if (doc.id && doc.phc_center) {
            if (!doctors.find((d) => d.id === doc.id)) {
              doctors.push({ id: doc.id, phc_center: doc.phc_center, phc_location: doc.phc_location });
            }
          }
        }
      }
    }
  } catch {}
  return doctors;
}

function calcDaysLeft(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr + "T00:00:00");
  const diffTime = due.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isDeliveryImminent(daysLeft: number): boolean {
  return (
    daysLeft >= 0 &&
    daysLeft <= HILLSTATION_MATERNITY_ALERT_MAX_DAYS_BEFORE_DUE
  );
}

export function runRiskEvaluation(): number {
  expireOldAlerts();

  /* Real mothers publish via Supabase (HillstationDeliveryAlertPublisher). Local demo patients only here. */
  const allPatients = [...loadDemoPatients()];

  const doctors = loadDoctorProfiles();
  if (doctors.length === 0 && allPatients.length === 0) return 0;

  let alertsCreated = 0;

  for (const patient of allPatients) {
    if (patient.phase !== "maternity") continue;
    if (patient.pregnancy_status !== "active") continue;
    if (patient.region_type !== "hillstation") continue;

    const daysLeft = calcDaysLeft(patient.pregnancy_due_date);
    if (!isDeliveryImminent(daysLeft)) continue;

    const phc = patient.nearby_phc;
    const matchingDoctors = doctors.filter((d) =>
      patientPhcMatchesDoctorPhc(phc, d.phc_center, d.phc_location),
    );

    if (matchingDoctors.length === 0) continue;

    if (!canGenerateAlert(patient.id)) continue;

    const alert = createAlert(
      patient.id,
      patient.full_name,
      phc,
      patient.village_town,
      patient.emergency_contact,
      daysLeft,
      patient.pregnancy_due_date,
    );

    if (alert) {
      alertsCreated++;
    }
  }

  return alertsCreated;
}

export function ensureDemoPatients() {
  if (!seededPatientsExist()) {
    seedDemoPatients();
    runRiskEvaluation();
  }
}

export function resetDemoPatients() {
  localStorage.removeItem(SEEDED_KEY);
  localStorage.removeItem(DEMO_PATIENTS_KEY);
}
