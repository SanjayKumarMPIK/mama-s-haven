// ─── Symptoms Overview Card ─────────────────────────────────────────────────
// Displays weekly symptoms summary from Maternity Calendar
// STRICTLY isolated to Maternity Phase only

import { useMemo } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { Zap, Bone, Flame, Droplets, Brain, Activity } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SymptomSummary {
  name: string;
  severity: "None" | "Mild" | "Moderate" | "Severe";
  frequency: number;
  icon: React.ElementType;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function getSeverityFromFrequency(frequency: number): "None" | "Mild" | "Moderate" | "Severe" {
  if (frequency === 0) return "None";
  if (frequency <= 2) return "Mild";
  if (frequency <= 4) return "Moderate";
  return "Severe";
}

function getSeverityColor(severity: "None" | "Mild" | "Moderate" | "Severe"): string {
  switch (severity) {
    case "None": return "bg-green-100 text-green-700 border-green-200";
    case "Mild": return "bg-amber-100 text-amber-700 border-amber-200";
    case "Moderate": return "bg-orange-100 text-orange-700 border-orange-200";
    case "Severe": return "bg-red-100 text-red-700 border-red-200";
  }
}

import {
  MATERNITY_PHASE_CONFIG,
  COMMON_CUSTOMIZABLE_SYMPTOMS
} from "@/modules/maternity/symptoms/maternitySymptomConfig";

// Create a unified dictionary of all maternity symptoms
function getSymptomDictionary() {
  const dictionary: Record<string, { label: string; emoji: string }> = {};
  
  const allSymptoms = [
    ...MATERNITY_PHASE_CONFIG.T1,
    ...MATERNITY_PHASE_CONFIG.T2,
    ...MATERNITY_PHASE_CONFIG.T3,
    ...MATERNITY_PHASE_CONFIG.postpartum,
    ...COMMON_CUSTOMIZABLE_SYMPTOMS
  ];

  for (const sym of allSymptoms) {
    dictionary[sym.id] = { label: sym.label, emoji: sym.emoji };
  }

  return dictionary;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SymptomsOverviewCard() {
  const { getPhaseLogs } = useHealthLog();
  const maternityLogs = getPhaseLogs("maternity");

  const symptomsSummary = useMemo((): SymptomSummary[] => {
    const last7Days = getLast7Days();
    
    // Aggregate symptom frequencies from calendar entries
    const symptomCounts: Record<string, number> = {};
    
    for (const date of last7Days) {
      const entry = maternityLogs[date];
      if (!entry || !entry.symptoms) continue;
      
      for (const [symptomKey, hasSymptom] of Object.entries(entry.symptoms)) {
        if (hasSymptom) {
          symptomCounts[symptomKey] = (symptomCounts[symptomKey] || 0) + 1;
        }
      }
    }
    
    const dict = getSymptomDictionary();

    // Convert to summary array
    const summary: SymptomSummary[] = Object.entries(symptomCounts)
      .map(([key, frequency]) => {
        const severity = getSeverityFromFrequency(frequency);
        const def = dict[key];
        const name = def?.label || key;
        const icon = () => <span className="text-sm">{def?.emoji || "🩺"}</span>;
        
        return { name, severity, frequency, icon };
      })
      .sort((a, b) => b.frequency - a.frequency) // Sort by frequency (highest first)
      .slice(0, 6); // Max 6 symptoms
    
    // If no symptoms, return empty array
    return summary;
  }, [maternityLogs]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shadow-sm border border-rose-100">
            <Activity className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="font-bold text-base">Symptoms Overview</h2>
          </div>
        </div>
        <span className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">This week</span>
      </div>

      {symptomsSummary.length === 0 ? (
        <div className="text-center py-6">
          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted-foreground">No symptoms logged this week</p>
        </div>
      ) : (
            <div className="space-y-3">
          {symptomsSummary.map((symptom) => {
            const Icon = symptom.icon;
            return (
              <div
                key={symptom.name}
                className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 border border-border/50 shadow-sm">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-[13px] font-semibold text-foreground/80 flex-1">{symptom.name}</span>
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full border shadow-sm font-bold uppercase tracking-wider shrink-0 ${getSeverityColor(symptom.severity)}`}
                >
                  {symptom.severity}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
