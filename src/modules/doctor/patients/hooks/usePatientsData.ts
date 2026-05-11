import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { getSupabaseRequestsByDoctor } from "@/lib/supabaseConnectionStore";
import type { ConnectionRequest } from "@/lib/connectionStore";
import { useDoctorAuth } from "@/modules/doctor/hooks/useDoctorAuth";

export interface Patient {
  id: string;
  name: string;
  phase: "Puberty" | "Maternity" | "Postpartum" | "Menopause" | "Family Planning";
  trimester?: number;
  pregnancyWeek?: number;
  riskLevel: "Low" | "Moderate" | "High";
  recentSymptoms: string[];
  warningCount: number;
  lastActivity: string;
  age: number;
}

const PHASE_MAP: Record<string, Patient["phase"]> = {
  maternity: "Maternity",
  postpartum: "Postpartum",
  menopause: "Menopause",
  "family-planning": "Family Planning",
  puberty: "Puberty",
};

function mapPhase(lifeStage: string): Patient["phase"] {
  return PHASE_MAP[lifeStage.toLowerCase()] ?? "Maternity";
}

function mapRisk(risk?: string): Patient["riskLevel"] {
  if (risk === "High" || risk === "Moderate") return risk;
  return "Low";
}

function formatLastActivity(iso: string): string {
  const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function mapRequestToPatient(req: ConnectionRequest): Patient {
  const prof = req.patientProfile;
  return {
    id: req.id,
    name: prof?.fullName ?? req.patientName,
    phase: prof ? mapPhase(prof.lifeStage) : (req.patientPhase as Patient["phase"] ?? "Maternity"),
    trimester: prof?.trimester,
    pregnancyWeek: prof?.pregnancyWeek ?? req.pregnancyWeek,
    riskLevel: mapRisk(req.riskLevel),
    recentSymptoms: [],
    warningCount: 0,
    lastActivity: formatLastActivity(req.createdAt),
    age: prof?.age ?? 0,
  };
}

export function usePatientsData() {
  const { doctorProfile } = useDoctorAuth();
  const doctorId = doctorProfile?.id ?? "";

  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [accepted, setAccepted] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!doctorId) return;
    const data = await getSupabaseRequestsByDoctor(doctorId);
    if (mountedRef.current) {
      setAccepted(data.filter((r) => r.status === "accepted"));
    }
  }, [doctorId]);

  useEffect(() => {
    mountedRef.current = true;
    setIsLoading(true);
    refresh().finally(() => {
      if (mountedRef.current) setIsLoading(false);
    });
    const interval = setInterval(refresh, 10_000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  const patients = useMemo(() => accepted.map(mapRequestToPatient), [accepted]);

  const stats = useMemo(() => ({
    total: patients.length,
    highRisk: patients.filter((p) => p.riskLevel === "High").length,
    moderateRisk: patients.filter((p) => p.riskLevel === "Moderate").length,
    maternity: patients.filter((p) => p.phase === "Maternity").length,
  }), [patients]);

  const filteredPatients = useMemo(() => {
    let result = patients;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (phaseFilter !== "all") result = result.filter((p) => p.phase === phaseFilter);
    if (riskFilter !== "all")  result = result.filter((p) => p.riskLevel === riskFilter);
    return result;
  }, [patients, search, phaseFilter, riskFilter]);

  return {
    patients: filteredPatients,
    totalPatients: patients.length,
    isLoading,
    stats,
    search, setSearch,
    phaseFilter, setPhaseFilter,
    riskFilter, setRiskFilter,
  };
}
