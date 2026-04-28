/**
 * useCustomSymptoms.ts
 *
 * Hook for managing predefined symptom library and active symptom slots.
 * Now delegates to the global symptoms engine for phase-aware management.
 * Maintains backward compatibility with existing code.
 */

import { createContext, useContext, ReactNode, createElement } from "react";
import { useGlobalSymptoms } from "@/shared/symptoms/hooks/useGlobalSymptoms";
import type { ActiveSymptom, PredefinedSymptom, SymptomCategory } from "@/shared/symptoms/config/phaseSymptomConfigs";

// Re-export types for backward compatibility
export type { SymptomCategory, ActiveSymptom, PredefinedSymptom };

const MAX_ACTIVE_SYMPTOMS = 6;

interface CustomSymptomsContextType {
  activeSymptoms: ActiveSymptom[];
  predefinedLibrary: PredefinedSymptom[];
  swapActiveSymptom: (slotIndex: number, newSymptomId: string) => void;
  resetToCore: () => void;
  canSwap: boolean;
  isFull: boolean;
}

const CustomSymptomsContext = createContext<CustomSymptomsContextType | null>(null);

interface CustomSymptomsProviderProps {
  children: ReactNode;
  phase?: string; // Optional phase parameter
}

export function CustomSymptomsProvider({ children, phase = "postpartum" }: CustomSymptomsProviderProps) {
  // Use global symptoms engine internally
  const globalCtx = useGlobalSymptoms(phase as any);

  const value: CustomSymptomsContextType = {
    activeSymptoms: globalCtx.activeSymptoms,
    predefinedLibrary: globalCtx.predefinedLibrary,
    swapActiveSymptom: globalCtx.swapActiveSymptom,
    resetToCore: globalCtx.resetToCore,
    canSwap: globalCtx.canAddSymptom,
    isFull: globalCtx.isFull,
  };

  return createElement(CustomSymptomsContext.Provider, { value }, children);
}

export function useCustomSymptoms() {
  const context = useContext(CustomSymptomsContext);
  if (!context) {
    throw new Error("useCustomSymptoms must be used within CustomSymptomsProvider");
  }
  return context;
}
