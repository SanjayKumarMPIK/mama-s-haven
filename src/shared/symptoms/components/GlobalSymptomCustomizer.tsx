/**
 * GlobalSymptomCustomizer.tsx
 *
 * Reusable component for customizing active symptoms across all phases.
 * Uses the global symptoms engine for phase-aware symptom management.
 */

import { useState } from "react";
import { X, Settings, RefreshCw, Check, Plus } from "lucide-react";
import { useGlobalSymptoms } from "../hooks/useGlobalSymptoms";
import type { ActiveSymptom, PredefinedSymptom, SymptomCategory } from "../config/phaseSymptomConfigs";

interface GlobalSymptomCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  phase?: string;
}

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
  period: "Period Related",
  breastfeeding: "Breastfeeding",
  medical: "Medical Monitoring",
  physical: "Physical",
  emotional: "Emotional",
  hormonal: "Hormonal",
  skin: "Skin",
  digestive: "Digestive",
};

export function GlobalSymptomCustomizer({
  isOpen,
  onClose,
  phase
}: GlobalSymptomCustomizerProps) {
  if (!isOpen) return null;

  const ctx = useGlobalSymptoms(phase as any);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [selectedLibrarySymptom, setSelectedLibrarySymptom] = useState<PredefinedSymptom | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<SymptomCategory>("physical");

  const handleSlotClick = (index: number) => {
    setSelectedSlotIndex(index);
    setSelectedLibrarySymptom(null);
    setShowCustomForm(false);
  };

  const handleLibrarySymptomClick = (symptom: PredefinedSymptom) => {
    if (selectedSlotIndex === null) {
      const firstNonCoreIndex = ctx.activeSymptoms.findIndex((s) => !s.isCore);
      if (firstNonCoreIndex !== -1) {
        setSelectedSlotIndex(firstNonCoreIndex);
      } else {
        setSelectedSlotIndex(0);
      }
    }
    setSelectedLibrarySymptom(symptom);
    setShowCustomForm(false);
  };

  const handleSwap = () => {
    if (selectedSlotIndex !== null && selectedLibrarySymptom) {
      ctx.swapActiveSymptom(selectedSlotIndex, selectedLibrarySymptom.id);
      setSelectedSlotIndex(null);
      setSelectedLibrarySymptom(null);
    }
  };

  const handleReset = () => {
    if (confirm("Reset to default core symptoms? This will undo all your customizations.")) {
      ctx.resetToCore();
      setSelectedSlotIndex(null);
      setSelectedLibrarySymptom(null);
    }
  };

  const handleAddCustom = () => {
    if (customName.trim()) {
      ctx.addCustomSymptom(customName.trim(), customCategory);
      setCustomName("");
      setShowCustomForm(false);
    }
  };

  const handleRemoveCustom = (symptomId: string) => {
    if (confirm("Remove this custom symptom?")) {
      ctx.removeCustomSymptom(symptomId);
    }
  };

  const groupedLibrary = ctx.predefinedLibrary.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, PredefinedSymptom[]>);

  const isDuplicate = selectedLibrarySymptom
    ? ctx.activeSymptoms.some((s) => s.id === selectedLibrarySymptom.id)
    : false;

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
                {ctx.activeSymptoms.length} Active Symptoms
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
              {ctx.activeSymptoms.map((symptom, index) => (
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

          {/* Custom Symptoms */}
          {ctx.customSymptoms.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Custom Symptoms</h3>
              </div>
              <div className="space-y-2">
                {ctx.customSymptoms.map((symptom) => (
                  <div
                    key={symptom.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-background"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{symptom.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[symptom.category]}`}
                      >
                        {CATEGORY_LABELS[symptom.category]}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveCustom(symptom.id)}
                      className="text-xs text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Add Custom Symptom */}
          <section>
            {!showCustomForm ? (
              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full p-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
              >
                <Plus className="w-4 h-4" />
                Add Custom Symptom
              </button>
            ) : (
              <div className="p-4 rounded-lg border border-border bg-background space-y-3">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Symptom name (e.g., Lower back pressure)"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as SymptomCategory)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCustomForm(false);
                      setCustomName("");
                    }}
                    className="flex-1 py-2 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustom}
                    disabled={!customName.trim()}
                    className="flex-1 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Symptom
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Predefined Library */}
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-3">Predefined Symptom Library</h3>
            <div className="space-y-4">
              {Object.entries(groupedLibrary).map(([category, symptoms]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${CATEGORY_COLORS[category as SymptomCategory]}`}
                    >
                      {CATEGORY_LABELS[category as SymptomCategory]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {symptoms.map((symptom) => {
                      const isActive = ctx.activeSymptoms.some((s) => s.id === symptom.id);
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
                  Replace <strong>{ctx.activeSymptoms[selectedSlotIndex].name}</strong> with{" "}
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
              Cancel
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
