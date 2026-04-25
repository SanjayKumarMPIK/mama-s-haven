/**
 * useCustomSymptoms.ts
 *
 * Hook for managing predefined symptom library and active symptom slots.
 * Users can only select from predefined symptoms and swap them into 6 active slots.
 */

import { createContext, useContext, useState, useEffect, ReactNode, createElement } from "react";

export type SymptomCategory = "recovery" | "mental" | "period" | "breastfeeding" | "medical";

export interface PredefinedSymptom {
  id: string;
  name: string;
  category: SymptomCategory;
}

export interface ActiveSymptom {
  id: string;
  name: string;
  isCore: boolean;
}

// Core default symptoms (always active initially)
const CORE_SYMPTOMS: ActiveSymptom[] = [
  { id: "bleeding", name: "Bleeding", isCore: true },
  { id: "pain", name: "Pain", isCore: true },
  { id: "mood", name: "Mood", isCore: true },
  { id: "energy", name: "Energy", isCore: true },
  { id: "breast_health", name: "Breast Health", isCore: true },
  { id: "pelvic_health", name: "Pelvic Health", isCore: true },
];

// Predefined symptom library
const PREDEFINED_LIBRARY: PredefinedSymptom[] = [
  // Recovery
  { id: "back_pain", name: "Back Pain", category: "recovery" },
  { id: "swelling", name: "Swelling", category: "recovery" },
  { id: "scar_pain", name: "Scar Pain", category: "recovery" },
  { id: "body_ache", name: "Body Ache", category: "recovery" },
  { id: "dizziness", name: "Dizziness", category: "recovery" },

  // Mental
  { id: "stress", name: "Stress", category: "mental" },
  { id: "anxiety", name: "Anxiety", category: "mental" },
  { id: "brain_fog", name: "Brain Fog", category: "mental" },
  { id: "irritability", name: "Irritability", category: "mental" },

  // Period Related
  { id: "spotting", name: "Spotting", category: "period" },
  { id: "cramps", name: "Cramps", category: "period" },
  { id: "cycle_irregularity", name: "Cycle Irregularity", category: "period" },

  // Breastfeeding
  { id: "milk_supply", name: "Milk Supply", category: "breastfeeding" },
  { id: "nipple_pain", name: "Nipple Pain", category: "breastfeeding" },
  { id: "engorgement", name: "Engorgement", category: "breastfeeding" },

  // Medical Monitoring
  { id: "fever", name: "Fever", category: "medical" },
  { id: "chills", name: "Chills", category: "medical" },
  { id: "headache", name: "Headache", category: "medical" },
  { id: "appetite_changes", name: "Appetite Changes", category: "medical" },
  { id: "sleep_quality", name: "Sleep Quality", category: "medical" },
];

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

const ACTIVE_SYMPTOMS_KEY = "swasthyasakhi_active_symptoms";

export function CustomSymptomsProvider({ children }: { children: ReactNode }) {
  const [activeSymptoms, setActiveSymptoms] = useState<ActiveSymptom[]>(CORE_SYMPTOMS);

  // Load active symptoms from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ACTIVE_SYMPTOMS_KEY);
      if (stored) {
        setActiveSymptoms(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load active symptoms from localStorage", e);
    }
  }, []);

  // Save to localStorage whenever active symptoms change
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_SYMPTOMS_KEY, JSON.stringify(activeSymptoms));
    } catch (e) {
      console.error("Failed to save active symptoms to localStorage", e);
    }
  }, [activeSymptoms]);

  const swapActiveSymptom = (slotIndex: number, newSymptomId: string) => {
    if (slotIndex < 0 || slotIndex >= activeSymptoms.length) return;

    const newSymptom = PREDEFINED_LIBRARY.find((s) => s.id === newSymptomId);
    if (!newSymptom) return;

    // Check for duplicate
    const isDuplicate = activeSymptoms.some((s) => s.id === newSymptomId);
    if (isDuplicate) return;

    setActiveSymptoms((prev) => {
      const updated = [...prev];
      updated[slotIndex] = {
        id: newSymptom.id,
        name: newSymptom.name,
        isCore: false,
      };
      return updated;
    });
  };

  const resetToCore = () => {
    setActiveSymptoms(CORE_SYMPTOMS);
  };

  const canSwap = activeSymptoms.length < MAX_ACTIVE_SYMPTOMS;
  const isFull = activeSymptoms.length >= MAX_ACTIVE_SYMPTOMS;

  const value: CustomSymptomsContextType = {
    activeSymptoms,
    predefinedLibrary: PREDEFINED_LIBRARY,
    swapActiveSymptom,
    resetToCore,
    canSwap,
    isFull,
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
