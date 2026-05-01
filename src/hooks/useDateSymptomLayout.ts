/**
 * useDateSymptomLayout.ts
 *
 * Manages per-date symptom layouts for the Family Planning phase.
 * Each calendar date can have its own customized set of active symptom IDs.
 * Falls back to the default 6 core symptoms when no custom layout exists.
 */

import { useState, useCallback, useMemo } from "react";
import { getPhaseSymptomConfig } from "@/shared/symptoms/config/phaseSymptomConfigs";
import type { PredefinedSymptom, ActiveSymptom } from "@/shared/symptoms/config/phaseSymptomConfigs";

const STORAGE_KEY = "swasthyasakhi_fp_date_symptom_layouts";

/** The shape stored in localStorage: { "2026-04-28": ["spotting","fatigue",...], ... } */
type DateLayoutMap = Record<string, string[]>;

function loadLayouts(): DateLayoutMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistLayouts(layouts: DateLayoutMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch (e) {
    console.error("Failed to persist date symptom layouts:", e);
  }
}

/**
 * Hook that provides date-specific symptom layout management for Family Planning.
 *
 * @param dateISO  The currently selected date (YYYY-MM-DD)
 */
export function useDateSymptomLayout(dateISO: string) {
  const config = useMemo(() => getPhaseSymptomConfig("family-planning"), []);

  // The default symptom IDs (core symptoms)
  const defaultIds = useMemo(
    () => config.coreSymptoms.map((s) => s.id),
    [config]
  );

  // Full library lookup: core + predefined combined for name resolution
  const allSymptomLookup = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const s of config.coreSymptoms) {
      map.set(s.id, { id: s.id, name: s.name });
    }
    for (const s of config.predefinedLibrary) {
      map.set(s.id, { id: s.id, name: s.name });
    }
    return map;
  }, [config]);

  // ─── State: active IDs for this date ─────────────────────────────────
  const [activeIds, setActiveIds] = useState<string[]>(() => {
    const layouts = loadLayouts();
    return layouts[dateISO] ?? defaultIds;
  });

  // Resolved symptom options for the UI (id + label)
  const symptomOptions = useMemo(
    () =>
      activeIds.map((id) => {
        const entry = allSymptomLookup.get(id);
        return { id, label: entry?.name ?? id };
      }),
    [activeIds, allSymptomLookup]
  );

  // Active symptoms in the shape the customizer expects
  const activeSymptoms: ActiveSymptom[] = useMemo(
    () =>
      activeIds.map((id) => {
        const entry = allSymptomLookup.get(id);
        const isCore = config.coreSymptoms.some((c) => c.id === id);
        return { id, name: entry?.name ?? id, isCore };
      }),
    [activeIds, allSymptomLookup, config.coreSymptoms]
  );

  // The full predefined library (for the customizer swap list)
  const predefinedLibrary: PredefinedSymptom[] = config.predefinedLibrary;

  // ─── Swap ────────────────────────────────────────────────────────────
  const swapActiveSymptom = useCallback(
    (slotIndex: number, newSymptomId: string) => {
      setActiveIds((prev) => {
        if (slotIndex < 0 || slotIndex >= prev.length) return prev;
        // Prevent duplicates
        if (prev.includes(newSymptomId)) return prev;
        // Verify the new symptom exists in our lookup
        if (!allSymptomLookup.has(newSymptomId)) return prev;

        const next = [...prev];
        next[slotIndex] = newSymptomId;

        // Persist for this date only
        const layouts = loadLayouts();
        layouts[dateISO] = next;
        persistLayouts(layouts);

        return next;
      });
    },
    [dateISO, allSymptomLookup]
  );

  // ─── Reset to default ────────────────────────────────────────────────
  const resetToCore = useCallback(() => {
    setActiveIds(defaultIds);

    // Remove this date's override from storage
    const layouts = loadLayouts();
    delete layouts[dateISO];
    persistLayouts(layouts);
  }, [dateISO, defaultIds]);

  // Whether a date has custom layout or is using defaults
  const isCustomized = useMemo(() => {
    const layouts = loadLayouts();
    return dateISO in layouts;
  }, [dateISO, activeIds]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    /** Symptom options formatted for the grid: { id, label }[] */
    symptomOptions,
    /** ActiveSymptom[] for the customizer UI */
    activeSymptoms,
    /** Full predefined library for the swap picker */
    predefinedLibrary,
    /** Swap a slot with a new symptom (date-specific) */
    swapActiveSymptom,
    /** Reset this date back to defaults */
    resetToCore,
    /** Whether this date has a customized layout */
    isCustomized,
  };
}
