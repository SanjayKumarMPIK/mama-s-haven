/**
 * globalSymptomsEngine.ts
 *
 * Global symptoms engine for managing symptoms across all phases.
 * Provides phase-specific symptom management with shared mechanics.
 */

import type { ExtendedPhase } from "../config/phaseSymptomConfigs";
import type {
  PhaseSymptomConfig,
  ActiveSymptom,
  PredefinedSymptom,
  SymptomCategory,
} from "../config/phaseSymptomConfigs";
import { getPhaseSymptomConfig } from "../config/phaseSymptomConfigs";

export interface CustomSymptom {
  id: string;
  name: string;
  phase: ExtendedPhase;
  category: SymptomCategory;
  createdByUser: boolean;
  createdAt: string;
}

export interface SymptomLogEntry {
  id: string;
  phase: ExtendedPhase;
  subPhase?: string;
  symptomId: string;
  symptomName: string;
  severity: "mild" | "moderate" | "severe";
  date: string; // YYYY-MM-DD
  notes?: string;
  source: "predefined" | "custom";
  isCustom: boolean;
}

// ─── Symptom Management Engine ─────────────────────────────────────────────

class GlobalSymptomsEngine {
  private phase: ExtendedPhase;
  private config: PhaseSymptomConfig;
  private activeSymptoms: ActiveSymptom[];
  private customSymptoms: CustomSymptom[];

  constructor(phase: ExtendedPhase) {
    this.phase = phase;
    this.config = getPhaseSymptomConfig(phase);
    this.activeSymptoms = [...this.config.coreSymptoms];
    this.customSymptoms = [];
    this.loadFromStorage();
  }

  // ─── Storage Management ───────────────────────────────────────────────

  private loadFromStorage(): void {
    try {
      // Load active symptoms
      const storedActive = localStorage.getItem(this.config.localStorageKey);
      if (storedActive) {
        this.activeSymptoms = JSON.parse(storedActive);
      }

      // Load custom symptoms
      const customKey = `${this.config.localStorageKey}_custom`;
      const storedCustom = localStorage.getItem(customKey);
      if (storedCustom) {
        this.customSymptoms = JSON.parse(storedCustom);
      }
    } catch (e) {
      console.error(`Failed to load symptoms for phase ${this.phase}:`, e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.config.localStorageKey, JSON.stringify(this.activeSymptoms));
      const customKey = `${this.config.localStorageKey}_custom`;
      localStorage.setItem(customKey, JSON.stringify(this.customSymptoms));
    } catch (e) {
      console.error(`Failed to save symptoms for phase ${this.phase}:`, e);
    }
  }

  // ─── Active Symptoms Management ───────────────────────────────────────

  getActiveSymptoms(): ActiveSymptom[] {
    return this.activeSymptoms;
  }

  getPredefinedLibrary(): PredefinedSymptom[] {
    return this.config.predefinedLibrary;
  }

  getCustomSymptoms(): CustomSymptom[] {
    return this.customSymptoms;
  }

  getAllAvailableSymptoms(): PredefinedSymptom[] {
    const customAsPredefined: PredefinedSymptom[] = this.customSymptoms.map(cs => ({
      id: cs.id,
      name: cs.name,
      category: cs.category,
    }));
    return [...this.config.predefinedLibrary, ...customAsPredefined];
  }

  swapActiveSymptom(slotIndex: number, newSymptomId: string): boolean {
    if (slotIndex < 0 || slotIndex >= this.activeSymptoms.length) {
      return false;
    }

    // Find symptom in library (predefined or custom)
    const librarySymptom = this.config.predefinedLibrary.find(s => s.id === newSymptomId);
    const customSymptom = this.customSymptoms.find(s => s.id === newSymptomId);
    const newSymptom = librarySymptom || customSymptom;

    if (!newSymptom) {
      return false;
    }

    // Check for duplicate
    const isDuplicate = this.activeSymptoms.some(s => s.id === newSymptomId);
    if (isDuplicate) {
      return false;
    }

    this.activeSymptoms = [...this.activeSymptoms];
    this.activeSymptoms[slotIndex] = {
      id: newSymptom.id,
      name: newSymptom.name,
      isCore: false,
    };

    this.saveToStorage();
    return true;
  }

  resetToCore(): void {
    this.activeSymptoms = [...this.config.coreSymptoms];
    this.saveToStorage();
  }

  canAddSymptom(): boolean {
    return this.activeSymptoms.length < this.config.maxActiveSymptoms;
  }

  isFull(): boolean {
    return this.activeSymptoms.length >= this.config.maxActiveSymptoms;
  }

  // ─── Custom Symptom Management ───────────────────────────────────────

  addCustomSymptom(name: string, category: SymptomCategory): CustomSymptom {
    const customSymptom: CustomSymptom = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      phase: this.phase,
      category,
      createdByUser: true,
      createdAt: new Date().toISOString(),
    };

    this.customSymptoms.push(customSymptom);
    this.saveToStorage();
    return customSymptom;
  }

  removeCustomSymptom(symptomId: string): boolean {
    const index = this.customSymptoms.findIndex(s => s.id === symptomId);
    if (index === -1) {
      return false;
    }

    // Remove from active symptoms if present
    this.activeSymptoms = this.activeSymptoms.filter(s => s.id !== symptomId);

    // Remove from custom symptoms
    this.customSymptoms.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // ─── Symptom Logging ───────────────────────────────────────────────

  logSymptom(
    symptomId: string,
    symptomName: string,
    severity: "mild" | "moderate" | "severe",
    date: string,
    notes?: string
  ): SymptomLogEntry {
    const isCustom = this.customSymptoms.some(s => s.id === symptomId);

    const logEntry: SymptomLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phase: this.phase,
      symptomId,
      symptomName,
      severity,
      date,
      notes,
      source: isCustom ? "custom" : "predefined",
      isCustom,
    };

    // This would integrate with useHealthLog for actual persistence
    // For now, we return the entry structure
    return logEntry;
  }

  // ─── Phase Filtering ───────────────────────────────────────────────

  getSymptomsForPhase(phase: ExtendedPhase): PhaseSymptomConfig {
    return getPhaseSymptomConfig(phase);
  }

  switchPhase(newPhase: ExtendedPhase): void {
    this.phase = newPhase;
    this.config = getPhaseSymptomConfig(newPhase);
    this.activeSymptoms = [...this.config.coreSymptoms];
    this.customSymptoms = [];
    this.loadFromStorage();
  }
}

// ─── Factory Function ───────────────────────────────────────────────

let engineInstance: GlobalSymptomsEngine | null = null;

export function getGlobalSymptomsEngine(phase: ExtendedPhase): GlobalSymptomsEngine {
  if (!engineInstance || engineInstance["phase"] !== phase) {
    engineInstance = new GlobalSymptomsEngine(phase);
  }
  return engineInstance;
}

export function resetGlobalSymptomsEngine(): void {
  engineInstance = null;
}

// ─── Utility Functions ───────────────────────────────────────────────

/**
 * Get all predefined symptoms for a phase
 */
export function getPhasePredefinedSymptoms(phase: ExtendedPhase): PredefinedSymptom[] {
  const config = getPhaseSymptomConfig(phase);
  return config.predefinedLibrary;
}

/**
 * Get core symptoms for a phase
 */
export function getPhaseCoreSymptoms(phase: ExtendedPhase): ActiveSymptom[] {
  const config = getPhaseSymptomConfig(phase);
  return config.coreSymptoms;
}

/**
 * Check if a symptom is core for a phase
 */
export function isCoreSymptom(phase: ExtendedPhase, symptomId: string): boolean {
  const config = getPhaseSymptomConfig(phase);
  return config.coreSymptoms.some(s => s.id === symptomId);
}
