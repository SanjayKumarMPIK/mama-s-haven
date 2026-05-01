/**
 * DateSymptomCustomizer.tsx
 *
 * Date-specific symptom customizer for the Family Planning phase.
 * Unlike the global customizer, swaps are persisted per-date only.
 */

import { useState } from "react";
import { X, Settings, RefreshCw, Check, Info } from "lucide-react";
import type { ActiveSymptom, PredefinedSymptom, SymptomCategory } from "@/shared/symptoms/config/phaseSymptomConfigs";

const CATEGORY_COLORS: Record<string, string> = {
  recovery: "bg-emerald-100 text-emerald-700 border-emerald-200",
  mental: "bg-purple-100 text-purple-700 border-purple-200",
  period: "bg-pink-100 text-pink-700 border-pink-200",
  breastfeeding: "bg-blue-100 text-blue-700 border-blue-200",
  medical: "bg-amber-100 text-amber-700 border-amber-200",
  physical: "bg-teal-100 text-teal-700 border-teal-200",
  emotional: "bg-indigo-100 text-indigo-700 border-indigo-200",
  hormonal: "bg-rose-100 text-rose-700 border-rose-200",
  skin: "bg-orange-100 text-orange-700 border-orange-200",
  digestive: "bg-yellow-100 text-yellow-700 border-yellow-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  recovery: "Recovery",
  mental: "Mental Health",
  period: "Cycle & Reproductive",
  breastfeeding: "Breastfeeding",
  medical: "Medical Monitoring",
  physical: "Physical",
  emotional: "Emotional",
  hormonal: "Hormonal",
  skin: "Skin",
  digestive: "Digestive",
};

interface DateSymptomCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  dateISO: string;
  activeSymptoms: ActiveSymptom[];
  predefinedLibrary: PredefinedSymptom[];
  onSwap: (slotIndex: number, newSymptomId: string) => void;
  onReset: () => void;
  isCustomized: boolean;
}

export function DateSymptomCustomizer({
  isOpen,
  onClose,
  dateISO,
  activeSymptoms,
  predefinedLibrary,
  onSwap,
  onReset,
  isCustomized,
}: DateSymptomCustomizerProps) {
  if (!isOpen) return null;

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [selectedLibrarySymptom, setSelectedLibrarySymptom] = useState<PredefinedSymptom | null>(null);

  const handleSlotClick = (index: number) => {
    setSelectedSlotIndex(index);
    setSelectedLibrarySymptom(null);
  };

  const handleLibrarySymptomClick = (symptom: PredefinedSymptom) => {
    if (selectedSlotIndex === null) {
      const firstNonCoreIndex = activeSymptoms.findIndex((s) => !s.isCore);
      if (firstNonCoreIndex !== -1) {
        setSelectedSlotIndex(firstNonCoreIndex);
      } else {
        setSelectedSlotIndex(0);
      }
    }
    setSelectedLibrarySymptom(symptom);
  };

  const handleSwap = () => {
    if (selectedSlotIndex !== null && selectedLibrarySymptom) {
      onSwap(selectedSlotIndex, selectedLibrarySymptom.id);
      setSelectedSlotIndex(null);
      setSelectedLibrarySymptom(null);
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default symptoms for this date? This will undo customizations for this date only.")) {
      onReset();
      setSelectedSlotIndex(null);
      setSelectedLibrarySymptom(null);
    }
  };

  const groupedLibrary = predefinedLibrary.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, PredefinedSymptom[]>);

  const isDuplicate = selectedLibrarySymptom
    ? activeSymptoms.some((s) => s.id === selectedLibrarySymptom.id)
    : false;

  const displayDate = new Date(dateISO + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Customize Symptoms</h2>
              <p className="text-xs text-muted-foreground">
                For {displayDate} only • {activeSymptoms.length} active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date-specific notice */}
        <div className="px-6 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700">
            Changes apply to <strong>{displayDate}</strong> only. Other dates are not affected.
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Symptoms */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">Active Symptoms</h3>
              <button
                onClick={handleReset}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Reset to Default
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activeSymptoms.map((symptom, index) => (
                <button
                  key={symptom.id}
                  onClick={() => handleSlotClick(index)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedSlotIndex === index
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{symptom.name}</span>
                    {symptom.isCore && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        Core
                      </span>
                    )}
                  </div>
                  {selectedSlotIndex === index && (
                    <p className="text-xs text-muted-foreground mt-1">Click a library symptom to swap</p>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Predefined Library */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Symptom Library</h3>
            <div className="space-y-4">
              {Object.entries(groupedLibrary).map(([category, symptoms]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${CATEGORY_COLORS[category as SymptomCategory]}`}
                    >
                      {CATEGORY_LABELS[category as SymptomCategory] ?? category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {symptoms.map((symptom) => {
                      const isActive = activeSymptoms.some((s) => s.id === symptom.id);
                      const isSelected = selectedLibrarySymptom?.id === symptom.id;
                      return (
                        <button
                          key={symptom.id}
                          onClick={() => handleLibrarySymptomClick(symptom)}
                          disabled={isActive}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : isActive
                              ? "border-border bg-muted/30 opacity-50 cursor-not-allowed"
                              : "border-border hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{symptom.name}</span>
                            {isActive && <Check className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {selectedSlotIndex !== null && selectedLibrarySymptom ? (
              isDuplicate ? (
                <span className="text-amber-600">This symptom is already active</span>
              ) : (
                <span>
                  Replace <strong>{activeSymptoms[selectedSlotIndex].name}</strong> with{" "}
                  <strong>{selectedLibrarySymptom.name}</strong>
                </span>
              )
            ) : (
              <span>Select a symptom slot and a library symptom to swap</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Done
            </button>
            <button
              onClick={handleSwap}
              disabled={selectedSlotIndex === null || !selectedLibrarySymptom || isDuplicate}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Swap Symptom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
