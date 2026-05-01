import { useState, useMemo, useCallback, useEffect } from "react";
import { getMaternitySymptomsForPhase, type AdaptedSymptom } from "./maternitySymptomAdapter";
import type { MaternityPhaseStage } from "./maternitySymptomConfig";

export interface UseDynamicMaternitySymptomsReturn {
  activeSymptoms: AdaptedSymptom[];
  customizableLibrary: AdaptedSymptom[];
  swapSymptom: (slotIndex: number, newSymptomId: string) => void;
  resetToCore: () => void;
}

export function useDynamicMaternitySymptoms(
  stage: MaternityPhaseStage
): UseDynamicMaternitySymptomsReturn {
  // 1. Get raw symptoms from adapter based on stage
  const { coreSymptoms, customizableSymptoms } = useMemo(
    () => getMaternitySymptomsForPhase(stage),
    [stage]
  );

  // 2. Load and manage user swaps from localStorage for this specific stage
  const storageKey = `maternity_swaps_${stage}`;
  
  const [swaps, setSwaps] = useState<Record<number, string>>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Sync state if stage changes and storage differs
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setSwaps(stored ? JSON.parse(stored) : {});
    } catch {
      setSwaps({});
    }
  }, [storageKey]);

  const swapSymptom = useCallback((slotIndex: number, newSymptomId: string) => {
    setSwaps((prev) => {
      const updated = { ...prev, [slotIndex]: newSymptomId };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  const resetToCore = useCallback(() => {
    setSwaps({});
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  // 3. Compute final active symptoms by applying swaps
  const activeSymptoms = useMemo(() => {
    const active = [...coreSymptoms];
    
    // Create a lookup for all available library symptoms
    const libraryMap = new Map<string, AdaptedSymptom>();
    for (const sym of customizableSymptoms) {
      libraryMap.set(sym.id, sym);
    }
    
    for (const [slotStr, symptomId] of Object.entries(swaps)) {
      const slotIndex = parseInt(slotStr, 10);
      if (slotIndex >= 0 && slotIndex < active.length) {
        const replacement = libraryMap.get(symptomId);
        if (replacement) {
          active[slotIndex] = { ...replacement, isCore: false };
        }
      }
    }
    
    return active;
  }, [coreSymptoms, customizableSymptoms, swaps]);

  return {
    activeSymptoms,
    customizableLibrary: customizableSymptoms,
    swapSymptom,
    resetToCore,
  };
}
