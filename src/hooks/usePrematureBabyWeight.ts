import { useCallback, useState } from "react";
import { getWeightTrend } from "@/lib/prematureCareData";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WeightEntry {
  date: string;   // YYYY-MM-DD
  weight: number; // grams
}

const STORAGE_KEY = "mh-premature-weight";

function loadEntries(): WeightEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as WeightEntry[];
  } catch { /* ignore */ }
  return [];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePrematureBabyWeight() {
  const [entries, setEntries] = useState<WeightEntry[]>(loadEntries);

  const addEntry = useCallback((entry: WeightEntry) => {
    setEntries((prev) => {
      // Replace if same date exists, otherwise append
      const filtered = prev.filter((e) => e.date !== entry.date);
      const next = [...filtered, entry].sort((a, b) => a.date.localeCompare(b.date));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const removeEntry = useCallback((date: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.date !== date);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const trend = getWeightTrend(entries);
  const latestWeight = entries.length > 0 ? entries[entries.length - 1].weight : null;

  return { entries, addEntry, removeEntry, trend, latestWeight };
}
