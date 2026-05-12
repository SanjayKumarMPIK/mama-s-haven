const ALERTS_KEY = "ss-maternity-hillstation-alerts";
const ACKNOWLEDGED_KEY = "ss-maternity-hillstation-acknowledged";
const COOLDOWN_KEY = "ss-maternity-hillstation-cooldown";

export interface MaternityHillstationAlert {
  id: string;
  patient_id: string;
  patient_name: string;
  phc_location: string;
  village_town: string;
  emergency_contact: string;
  /** -1 when unknown / not calculated */
  days_left: number;
  /** ISO date or empty when not on file */
  due_date: string;
  alert_message: string;
  priority: "HIGH";
  type: "maternity_hillstation_delivery_alert";
  status: "active" | "expired" | "resolved";
  created_at: string;
  expires_at: string;
  patient_age?: number;
  blood_group?: string;
  trimester?: number;
  weeks_pregnant?: number;
}

interface AlertStore {
  alerts: MaternityHillstationAlert[];
}

function loadStore(): AlertStore {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    if (raw) return JSON.parse(raw) as AlertStore;
  } catch {}
  return { alerts: [] };
}

function saveStore(store: AlertStore) {
  try {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(store));
  } catch {}
}

function loadAcknowledged(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(ACKNOWLEDGED_KEY);
    if (raw) return JSON.parse(raw) as Record<string, string[]>;
  } catch {}
  return {};
}

function saveAcknowledged(map: Record<string, string[]>) {
  try {
    localStorage.setItem(ACKNOWLEDGED_KEY, JSON.stringify(map));
  } catch {}
}

function loadCooldown(): Record<string, number> {
  try {
    const raw = localStorage.getItem(COOLDOWN_KEY);
    if (raw) return JSON.parse(raw) as Record<string, number>;
  } catch {}
  return {};
}

function saveCooldown(map: Record<string, number>) {
  try {
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(map));
  } catch {}
}

function phcLabelsMatch(alertPhc: string, doctorPhc: string | undefined): boolean {
  if (!doctorPhc?.trim()) return false;
  const a = alertPhc.trim().toLowerCase().replace(/\s+/g, " ");
  const b = doctorPhc.trim().toLowerCase().replace(/\s+/g, " ");
  return a === b || a.includes(b) || b.includes(a);
}

/** Local demo alerts: match doctor dashboard PHC string (centre name) flexibly. */
export function getActiveAlertsByPhc(phcLocation: string): MaternityHillstationAlert[] {
  const store = loadStore();
  const now = new Date().toISOString();
  return store.alerts.filter(
    (a) =>
      phcLabelsMatch(a.phc_location, phcLocation) &&
      a.status === "active" &&
      a.expires_at > now,
  );
}

export function getAllActiveAlerts(): MaternityHillstationAlert[] {
  const store = loadStore();
  const now = new Date().toISOString();
  return store.alerts.filter((a) => a.status === "active" && a.expires_at > now);
}

export function isAlertAcknowledgedByDoctor(alertId: string, doctorId: string): boolean {
  const map = loadAcknowledged();
  const list = map[doctorId] || [];
  return list.includes(alertId);
}

export function acknowledgeAlert(alertId: string, doctorId: string) {
  const map = loadAcknowledged();
  const list = map[doctorId] || [];
  if (!list.includes(alertId)) {
    list.push(alertId);
    map[doctorId] = list;
    saveAcknowledged(map);
  }
}

function hasActiveAlertForPatient(patientId: string): boolean {
  const store = loadStore();
  const now = new Date().toISOString();
  return store.alerts.some(
    (a) =>
      a.patient_id === patientId &&
      a.status === "active" &&
      a.expires_at > now,
  );
}

function hasCooldownForPatient(patientId: string): boolean {
  const cooldown = loadCooldown();
  const lastTime = cooldown[patientId];
  if (!lastTime) return false;
  const hoursSince = (Date.now() - lastTime) / (1000 * 60 * 60);
  return hoursSince < 24;
}

export function canGenerateAlert(patientId: string): boolean {
  if (hasActiveAlertForPatient(patientId)) return false;
  if (hasCooldownForPatient(patientId)) return false;
  return true;
}

export function createAlert(
  patientId: string,
  patientName: string,
  phcLocation: string,
  villageTown: string,
  emergencyContact: string,
  daysLeft: number,
  dueDate: string,
): MaternityHillstationAlert | null {
  if (!canGenerateAlert(patientId)) return null;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const alert: MaternityHillstationAlert = {
    id: `mha_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    patient_id: patientId,
    patient_name: patientName,
    phc_location: phcLocation,
    village_town: villageTown,
    emergency_contact: emergencyContact,
    days_left: daysLeft,
    due_date: dueDate,
    alert_message: `Hillstation delivery alert: ${patientName} is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Patient located in ${villageTown}, ${phcLocation}.`,
    priority: "HIGH",
    type: "maternity_hillstation_delivery_alert",
    status: "active",
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  };

  const store = loadStore();
  store.alerts.push(alert);
  saveStore(store);

  const cooldown = loadCooldown();
  cooldown[patientId] = Date.now();
  saveCooldown(cooldown);

  return alert;
}

export function expireOldAlerts() {
  const store = loadStore();
  const now = new Date().toISOString();
  let changed = false;
  for (const alert of store.alerts) {
    if (alert.status === "active" && alert.expires_at <= now) {
      alert.status = "expired";
      changed = true;
    }
  }
  if (changed) saveStore(store);
}

export function resolveAlert(alertId: string) {
  const store = loadStore();
  const alert = store.alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.status = "resolved";
    saveStore(store);
  }
}
