/**
 * useGlobalSymptoms.ts
 *
 * React hook for using the global symptoms engine.
 * Provides phase-aware symptom management with shared mechanics.
 */

import { createContext, useContext, useState, useEffect, ReactNode, createElement } from "react";
import type { ExtendedPhase } from "../config/phaseSymptomConfigs";
import type {
  ActiveSymptom,
  PredefinedSymptom,
  SymptomCategory,
} from "../config/phaseSymptomConfigs";
import type {
  CustomSymptom,
  SymptomLogEntry,
} from "../engine/globalSymptomsEngine";
import {
  getGlobalSymptomsEngine,
} from "../engine/globalSymptomsEngine";

interface GlobalSymptomsContextType {
  phase: ExtendedPhase;
  activeSymptoms: ActiveSymptom[];
  predefinedLibrary: PredefinedSymptom[];
  customSymptoms: CustomSymptom[];
  swapActiveSymptom: (slotIndex: number, newSymptomId: string) => void;
  resetToCore: () => void;
  addCustomSymptom: (name: string, category: SymptomCategory) => CustomSymptom;
  removeCustomSymptom: (symptomId: string) => boolean;
  canAddSymptom: boolean;
  isFull: boolean;
  switchPhase: (newPhase: ExtendedPhase) => void;
  logSymptom: (
    symptomId: string,
    symptomName: string,
    severity: "mild" | "moderate" | "severe",
    date: string,
    notes?: string
  ) => SymptomLogEntry;
}

const GlobalSymptomsContext = createContext<GlobalSymptomsContextType | null>(null);

interface GlobalSymptomsProviderProps {
  children: ReactNode;
  phase: ExtendedPhase;
}

export function GlobalSymptomsProvider({ children, phase }: GlobalSymptomsProviderProps) {
  const [currentPhase, setCurrentPhase] = useState<ExtendedPhase>(phase);
  const [engine] = useState(() => getGlobalSymptomsEngine(phase));
  const [activeSymptoms, setActiveSymptoms] = useState<ActiveSymptom[]>([]);
  const [customSymptoms, setCustomSymptoms] = useState<CustomSymptom[]>([]);

  // Sync with engine when phase changes
  useEffect(() => {
    engine.switchPhase(currentPhase);
    setActiveSymptoms(engine.getActiveSymptoms());
    setCustomSymptoms(engine.getCustomSymptoms());
  }, [currentPhase, engine]);

  // Re-sync when engine state changes (e.g., after swap)
  useEffect(() => {
    const checkEngine = () => {
      setActiveSymptoms(engine.getActiveSymptoms());
      setCustomSymptoms(engine.getCustomSymptoms());
    };

    // Initial sync
    checkEngine();

    // Set up interval to check for changes (simple polling)
    const interval = setInterval(checkEngine, 1000);
    return () => clearInterval(interval);
  }, [engine]);

  const swapActiveSymptom = (slotIndex: number, newSymptomId: string) => {
    const success = engine.swapActiveSymptom(slotIndex, newSymptomId);
    if (success) {
      setActiveSymptoms(engine.getActiveSymptoms());
    }
  };

  const resetToCore = () => {
    engine.resetToCore();
    setActiveSymptoms(engine.getActiveSymptoms());
  };

  const addCustomSymptom = (name: string, category: SymptomCategory): CustomSymptom => {
    const customSymptom = engine.addCustomSymptom(name, category);
    setCustomSymptoms(engine.getCustomSymptoms());
    return customSymptom;
  };

  const removeCustomSymptom = (symptomId: string): boolean => {
    const success = engine.removeCustomSymptom(symptomId);
    if (success) {
      setActiveSymptoms(engine.getActiveSymptoms());
      setCustomSymptoms(engine.getCustomSymptoms());
    }
    return success;
  };

  const switchPhase = (newPhase: ExtendedPhase) => {
    setCurrentPhase(newPhase);
  };

  const logSymptom = (
    symptomId: string,
    symptomName: string,
    severity: "mild" | "moderate" | "severe",
    date: string,
    notes?: string
  ): SymptomLogEntry => {
    return engine.logSymptom(symptomId, symptomName, severity, date, notes);
  };

  const canAddSymptom = engine.canAddSymptom();
  const isFull = engine.isFull();

  const value: GlobalSymptomsContextType = {
    phase: currentPhase,
    activeSymptoms,
    predefinedLibrary: engine.getPredefinedLibrary(),
    customSymptoms,
    swapActiveSymptom,
    resetToCore,
    addCustomSymptom,
    removeCustomSymptom,
    canAddSymptom,
    isFull,
    switchPhase,
    logSymptom,
  };

  return createElement(GlobalSymptomsContext.Provider, { value }, children);
}

export function useGlobalSymptoms(phase?: ExtendedPhase) {
  const context = useContext(GlobalSymptomsContext);
  
  // If context is not available (not wrapped in provider), create a temporary engine instance
  if (!context) {
    if (!phase) {
      throw new Error("useGlobalSymptoms must be used within GlobalSymptomsProvider or with a phase parameter");
    }
    const engine = getGlobalSymptomsEngine(phase);
    return {
      phase,
      activeSymptoms: engine.getActiveSymptoms(),
      predefinedLibrary: engine.getPredefinedLibrary(),
      customSymptoms: engine.getCustomSymptoms(),
      swapActiveSymptom: (slotIndex: number, newSymptomId: string) => {
        engine.swapActiveSymptom(slotIndex, newSymptomId);
      },
      resetToCore: () => {
        engine.resetToCore();
      },
      addCustomSymptom: (name: string, category: SymptomCategory) => {
        return engine.addCustomSymptom(name, category);
      },
      removeCustomSymptom: (symptomId: string) => {
        return engine.removeCustomSymptom(symptomId);
      },
      canAddSymptom: engine.canAddSymptom(),
      isFull: engine.isFull(),
      switchPhase: (newPhase: ExtendedPhase) => {
        engine.switchPhase(newPhase);
      },
      logSymptom: (
        symptomId: string,
        symptomName: string,
        severity: "mild" | "moderate" | "severe",
        date: string,
        notes?: string
      ) => {
        return engine.logSymptom(symptomId, symptomName, severity, date, notes);
      },
    };
  }

  return context;
}
