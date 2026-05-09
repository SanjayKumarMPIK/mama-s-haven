import { useState, useMemo } from "react";

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

const mockPatients: Patient[] = [
  { id: "P-001", name: "Priya Sharma", phase: "Maternity", trimester: 3, pregnancyWeek: 32, riskLevel: "Low", recentSymptoms: ["Mild backache", "Fatigue"], warningCount: 0, lastActivity: "2 hours ago", age: 28 },
  { id: "P-002", name: "Anita Devi", phase: "Postpartum", pregnancyWeek: 6, riskLevel: "Moderate", recentSymptoms: ["Postpartum blues", "Breast engorgement"], warningCount: 2, lastActivity: "30 mins ago", age: 31 },
  { id: "P-003", name: "Meera Kumari", phase: "Maternity", trimester: 2, pregnancyWeek: 18, riskLevel: "High", recentSymptoms: ["Severe headaches", "Blurred vision", "Swelling"], warningCount: 4, lastActivity: "15 mins ago", age: 26 },
  { id: "P-004", name: "Sunita Patel", phase: "Menopause", riskLevel: "Low", recentSymptoms: ["Hot flashes", "Mood swings"], warningCount: 0, lastActivity: "1 day ago", age: 48 },
  { id: "P-005", name: "Rekha Singh", phase: "Maternity", trimester: 1, pregnancyWeek: 10, riskLevel: "Low", recentSymptoms: ["Morning sickness"], warningCount: 0, lastActivity: "3 hours ago", age: 24 },
  { id: "P-006", name: "Lakshmi Nair", phase: "Postpartum", pregnancyWeek: 12, riskLevel: "Moderate", recentSymptoms: ["Incision pain", "Difficulty breastfeeding"], warningCount: 1, lastActivity: "1 hour ago", age: 34 },
  { id: "P-007", name: "Kavya Reddy", phase: "Maternity", trimester: 3, pregnancyWeek: 36, riskLevel: "High", recentSymptoms: ["Preterm contractions", "Lower back pain"], warningCount: 5, lastActivity: "10 mins ago", age: 29 },
  { id: "P-008", name: "Deepa Joshi", phase: "Family Planning", riskLevel: "Low", recentSymptoms: ["Irregular cycles"], warningCount: 0, lastActivity: "2 days ago", age: 33 },
  { id: "P-009", name: "Maya Gupta", phase: "Maternity", trimester: 2, pregnancyWeek: 22, riskLevel: "Moderate", recentSymptoms: ["Gestational diabetes", "Frequent urination"], warningCount: 2, lastActivity: "45 mins ago", age: 35 },
  { id: "P-010", name: "Saraswati Iyer", phase: "Menopause", riskLevel: "Low", recentSymptoms: ["Sleep disturbances", "Joint pain"], warningCount: 0, lastActivity: "5 hours ago", age: 51 },
  { id: "P-011", name: "Geeta Verma", phase: "Maternity", trimester: 1, pregnancyWeek: 8, riskLevel: "Moderate", recentSymptoms: ["Nausea", "Spotting"], warningCount: 3, lastActivity: "20 mins ago", age: 27 },
  { id: "P-012", name: "Neha Kapoor", phase: "Postpartum", pregnancyWeek: 4, riskLevel: "High", recentSymptoms: ["Postpartum hemorrhage", "Severe anxiety"], warningCount: 6, lastActivity: "5 mins ago", age: 30 },
];

export function usePatientsData() {
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const stats = useMemo(() => ({
    total: mockPatients.length,
    highRisk: mockPatients.filter((p) => p.riskLevel === "High").length,
    moderateRisk: mockPatients.filter((p) => p.riskLevel === "Moderate").length,
    maternity: mockPatients.filter((p) => p.phase === "Maternity").length,
  }), []);

  const filteredPatients = useMemo(() => {
    let result = [...mockPatients];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (phaseFilter !== "all") {
      result = result.filter((p) => p.phase === phaseFilter);
    }

    if (riskFilter !== "all") {
      result = result.filter((p) => p.riskLevel === riskFilter);
    }

    return result;
  }, [search, phaseFilter, riskFilter]);

  return {
    patients: filteredPatients,
    stats,
    search,
    setSearch,
    phaseFilter,
    setPhaseFilter,
    riskFilter,
    setRiskFilter,
  };
}
