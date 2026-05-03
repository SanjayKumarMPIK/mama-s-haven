import type { HealthLogs, MaternityEntry } from "@/hooks/useHealthLog";
import type { PubertyLogItem } from "@/components/dashboard/VisualAnalytics";

export type PostpartumPrematurePhase = "postpartum" | "premature";

export interface ExtractedSymptomLog {
  date: string;
  entry: MaternityEntry;
}

/**
 * Extractor: Filters maternity logs to return only logs belonging to a specific target phase.
 * Uses explicit `maternityStage` if available, otherwise falls back to date inference.
 */
export function filterLogsByPhase(
  logs: HealthLogs,
  targetPhase: PostpartumPrematurePhase,
  deliveryDateISO: string
): ExtractedSymptomLog[] {
  const deliveryDate = new Date(deliveryDateISO + "T00:00:00");
  const extracted: ExtractedSymptomLog[] = [];

  for (const [dateISO, entry] of Object.entries(logs)) {
    if (entry.phase !== "maternity") continue;

    const mEntry = entry as MaternityEntry;
    
    // Primary Filter: explicit stage
    if (mEntry.maternityStage) {
      if (mEntry.maternityStage === targetPhase) {
        extracted.push({ date: dateISO, entry: mEntry });
      }
      continue;
    }

    // Fallback: inference based on delivery date
    // If it doesn't have a maternityStage and logDate >= deliveryDate, it's postpartum or premature (we rely on the current mode for this)
    if (!isNaN(deliveryDate.getTime())) {
      const logDate = new Date(dateISO + "T12:00:00");
      if (logDate >= deliveryDate) {
        // If we are looking for postpartum/premature and it's past delivery, we assume it matches the current user's profile state
        extracted.push({ date: dateISO, entry: mEntry });
      }
    }
  }

  return extracted;
}

/**
 * Builds a mapped dataset for the Visual Analytics Chart component.
 * Ensures custom symptoms map correctly to the expected generic chart properties.
 */
export function buildChartDataset(filteredLogs: ExtractedSymptomLog[]): PubertyLogItem[] {
  return filteredLogs.map(({ date, entry }) => {
    return {
      date,
      entry: entry as any, // Cast as any since VisualAnalytics currently expects PubertyEntry type (we will update VisualAnalytics to support dynamic symptoms)
    };
  });
}

/**
 * Shared category mapping for Postpartum/Premature Core 6 symptoms and common recovery symptoms.
 * Used across dashboard cards and analytics to group specific symptoms correctly.
 */
export const SYMPTOM_CATEGORY_MAP: Record<string, string> = {
  breastPain: "recovery discomfort",
  nipplePain: "feeding discomfort",
  lowMilkSupply: "feeding stability",
  lowEnergy: "fatigue",
  sleepDeprivation: "recovery fatigue",
  bodyAche: "physical recovery",
  fatigue: "physical recovery",
  weakness: "physical recovery",
  moodSwings: "emotional",
  anxietyStress: "emotional",
};
