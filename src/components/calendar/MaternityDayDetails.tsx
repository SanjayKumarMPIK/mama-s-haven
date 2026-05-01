import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { X, Settings, Calendar as CalendarIcon, Clock, ChevronRight, AlertTriangle, CheckCircle2, User, MapPin, Activity, Dumbbell, Moon, Droplets, Apple, FileText } from "lucide-react";
import { EnhancedSlider, type Checkpoint } from "@/components/ui/enhanced-slider";
import { useHealthLog, type HealthLogEntry, type MaternityEntry } from "@/hooks/useHealthLog";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useProfile } from "@/hooks/useProfile";
import { useCustomSymptoms } from "@/hooks/useCustomSymptoms";
import { useAppointments } from "@/hooks/useAppointments";
import { getNutritionForTrimester, weekToTrimester, checkConsecutiveSevereSymptoms, getTrimesterLabel, type Trimester, type Severity } from "@/lib/maternityTrimesterData";
import { SymptomCustomizer } from "./SymptomCustomizer";
import { useDynamicMaternitySymptoms } from "@/modules/maternity/symptoms/useDynamicMaternitySymptoms";
import type { MaternityPhaseStage } from "@/modules/maternity/symptoms/maternitySymptomConfig";
import { APPOINTMENT_TYPE_ICONS, STATUS_CONFIG } from "@/lib/appointments/appointmentTypes";
import { GlobalSymptomCustomizer } from "@/shared/symptoms/components/GlobalSymptomCustomizer";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getWeekForDate(dateISO: string, activeEDD: string): number {
  if (!activeEDD) return 1;
  const due = new Date(activeEDD + "T12:00:00");
  const d = new Date(dateISO + "T12:00:00");
  const totalDays = 280;
  const daysLeft = Math.ceil((due.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = totalDays - daysLeft;
  return Math.max(1, Math.min(40, Math.ceil(daysPassed / 7)));
}

const SLEEP_CHECKPOINTS: Checkpoint[] = [
  { value: 4, label: "4h (Low)", priority: "low" },
  { value: 6, label: "6h (Min)", priority: "medium" },
  { value: 8, label: "8h (Optimal)", priority: "high" },
  { value: 10, label: "10h+ (High)", priority: "medium" },
];

const HYDRATION_CHECKPOINTS: Checkpoint[] = [
  { value: 4, label: "4 glasses", priority: "low" },
  { value: 8, label: "8 (Target)", priority: "high" },
  { value: 12, label: "12 (High)", priority: "medium" },
  { value: 15, label: "15 (Max)", priority: "medium" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface MaternityDayDetailsProps {
  dateISO: string;
  onClose: () => void;
}

export function MaternityDayDetails({ dateISO, onClose }: MaternityDayDetailsProps) {
  const { getLog, saveLog, maternityLogs } = useHealthLog();
  const { activeEDD, mode: pregnancyMode } = usePregnancyProfile();
  const { profile } = useProfile();
  const ctx = useCustomSymptoms();
  const { appointments } = useAppointments();
  const [showSymptomCustomizer, setShowSymptomCustomizer] = useState(false);

  // Get appointments for the selected date
  const dayAppointments = useMemo(() => {
    return appointments.filter((apt) => apt.date === dateISO);
  }, [appointments, dateISO]);

  const existingEntry = getLog(dateISO) as MaternityEntry | undefined;
  const isMaternity = existingEntry?.phase === "maternity";

  // 1. Determine lifecycle-aware stage: postpartum/premature → "postpartum", else trimester
  const isPostDelivery = pregnancyMode === "postpartum" || pregnancyMode === "premature";

  const trimester = useMemo<Trimester>(() => {
    if (isPostDelivery) return "T3"; // fallback only for nutrition tips lookup
    const week = getWeekForDate(dateISO, activeEDD);
    return weekToTrimester(week);
  }, [dateISO, activeEDD, isPostDelivery]);

  // 2. Determine exact maternity phase stage for symptoms
  const phaseStage = useMemo<MaternityPhaseStage>(() => {
    if (isPostDelivery) return "postpartum";
    return trimester;
  }, [isPostDelivery, trimester]);

  // 3. Stage-aware label for header badge
  const stageLabel = isPostDelivery
    ? (pregnancyMode === "premature" ? "Premature Care" : "Postpartum")
    : getTrimesterLabel(trimester);

  // 4. Fetch Trimester Data for nutrition (postpartum uses T3 tips as closest match)
  const nutritionDef = useMemo(() => getNutritionForTrimester(trimester), [trimester]);

  // 4. Use dynamic symptom engine
  const dynamicSymptoms = useDynamicMaternitySymptoms?.(phaseStage);
  
  const rawActiveSymptoms = dynamicSymptoms?.activeSymptoms || [];
  const rawLibrary = dynamicSymptoms?.customizableLibrary || [];
  const swapSymptom = dynamicSymptoms?.swapSymptom || (() => {});
  const resetToCore = dynamicSymptoms?.resetToCore || (() => {});

  // 5. Map library to format expected by SymptomCustomizer
  const maternityLibrary = useMemo(() => {
    return rawLibrary.map((s) => ({
      id: s.id,
      name: s.label,
      category: "physical" as any, // Simple fallback category for customizer UI
    }));
  }, [rawLibrary]);

  // 6. Map active symptoms to UI options
  const activeSymptomOptions = useMemo(() => {
    return rawActiveSymptoms.map((s) => ({
      id: s.id,
      label: s.label,
      emoji: s.emoji,
      description: "Track this symptom",
    }));
  }, [rawActiveSymptoms]);

  // 7. Adapter for SymptomCustomizer modal
  const customizerActiveSymptoms = useMemo(() => {
    return rawActiveSymptoms.map((opt) => ({
      id: opt.id,
      name: opt.label,
      isCore: opt.isCore,
    }));
  }, [rawActiveSymptoms]);

  const handleMaternitySwap = useCallback((slotIndex: number, newSymptomId: string) => {
    swapSymptom(slotIndex, newSymptomId);
  }, [swapSymptom]);

  const handleMaternityReset = useCallback(() => {
    if (confirm("Reset to default maternity symptoms for this phase?")) {
      resetToCore();
    }
  }, [resetToCore]);

  // ─── State ──────────────────────────────────────────────────────────────────

  const [noSymptomsToday, setNoSymptomsToday] = useState<boolean>(() => {
    return isMaternity ? !!existingEntry.noSymptomsToday : false;
  });

  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>(() => {
    if (!isMaternity) return {};
    return { ...existingEntry.symptoms };
  });

  const [symptomSeverities, setSymptomSeverities] = useState<Record<string, Severity>>(() => {
    if (!isMaternity || !existingEntry.symptomSeverities) return {};
    return { ...existingEntry.symptomSeverities };
  });

  const [mood, setMood] = useState<"Good" | "Okay" | "Low" | "">(() => {
    return isMaternity && existingEntry.mood ? existingEntry.mood : "";
  });

  const [sleepHours, setSleepHours] = useState<number | "">(() => {
    return isMaternity && existingEntry.sleepHours != null ? existingEntry.sleepHours : "";
  });

  const [notes, setNotes] = useState<string>(() => {
    return isMaternity && existingEntry.notes ? existingEntry.notes : "";
  });

  const [energyLevel, setEnergyLevel] = useState<"Low" | "Medium" | "High" | "">(() => {
    return isMaternity && existingEntry.fatigueLevel ? existingEntry.fatigueLevel : "";
  });

  const [hydration, setHydration] = useState<number | "">(() => {
    return isMaternity && existingEntry.hydrationGlasses != null ? existingEntry.hydrationGlasses : "";
  });

  const [nutritionChecks, setNutritionChecks] = useState<Record<string, boolean>>(() => {
    return {}; // Ideally mapped from saved data, but kept minimal for now
  });

  const [saving, setSaving] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const toggleNoSymptoms = useCallback(() => {
    setNoSymptomsToday((prev) => {
      const next = !prev;
      if (next) {
        setSelectedSymptoms({});
        setSymptomSeverities({});
      }
      return next;
    });
  }, []);

  const toggleSymptom = useCallback((id: string) => {
    setNoSymptomsToday(false);
    setSelectedSymptoms((prev) => {
      const isSelected = !prev[id];
      const next = { ...prev, [id]: isSelected };
      return next;
    });
    // Set default severity to mild if turning on
    setSymptomSeverities((prev) => {
      const isSelected = !selectedSymptoms[id];
      const next = { ...prev };
      if (isSelected && !next[id]) next[id] = "mild";
      else if (!isSelected) delete next[id];
      return next;
    });
  }, [selectedSymptoms]);

  const setSeverity = useCallback((id: string, severity: Severity) => {
    setSymptomSeverities((prev) => ({ ...prev, [id]: severity }));
  }, []);

  const toggleNutrition = useCallback((key: string) => {
    setNutritionChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ─── Smart Warnings ─────────────────────────────────────────────────────────

  const warnings = useMemo(() => {
    const recentLogs = Object.entries(maternityLogs)
      .filter(([dt]) => dt < dateISO)
      .map(([date, entry]) => ({
        date,
        symptoms: entry.symptoms || {},
        symptomSeverities: (entry as MaternityEntry).symptomSeverities || {},
      }));

    const currentLog = {
      date: dateISO,
      symptoms: selectedSymptoms,
      symptomSeverities,
    };

    return checkConsecutiveSevereSymptoms([...recentLogs, currentLog]);
  }, [maternityLogs, dateISO, selectedSymptoms, symptomSeverities]);

  // ─── Save ───────────────────────────────────────────────────────────────────

  function handleSave() {
    if (saving) return;

    const hasSymptoms = Object.values(selectedSymptoms).some(Boolean);
    const hasMood = mood !== "";
    const hasSleep = sleepHours !== "";
    const hasNotes = notes.trim().length > 0;
    const hasEnergy = energyLevel !== "";
    const hasHydration = hydration !== "";

    if (!hasSymptoms && !noSymptomsToday && !hasMood && !hasSleep && !hasNotes && !hasEnergy && !hasHydration) {
      toast.error("Please log at least one piece of data before saving.");
      return;
    }

    setSaving(true);

    const entry: HealthLogEntry = {
      phase: "maternity",
      noSymptomsToday,
      fatigueLevel: energyLevel !== "" ? (energyLevel as "Low" | "Medium" | "High") : null,
      hydrationGlasses: hydration !== "" ? Number(hydration) : null,
      sleepHours: sleepHours !== "" ? Number(sleepHours) : null,
      sleepQuality: null, // deprecated in broad usage
      symptoms: selectedSymptoms,
      symptomSeverities,
      mood: mood !== "" ? (mood as "Good" | "Okay" | "Low") : null,
      notes: notes || undefined,
    };

    saveLog(dateISO, entry);

    toast.success(`Maternity log saved for ${formatDisplayDate(dateISO)}`, {
      description: hasSymptoms
        ? `${Object.values(selectedSymptoms).filter(Boolean).length} symptom(s) saved`
        : noSymptomsToday
        ? "Marked as no symptoms"
        : "Data saved",
    });

    setSaving(false);
    onClose();
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Maternity log for ${dateISO}`}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300"
      >
        {/* Symptom Customizer Modal */}
        <SymptomCustomizer
          isOpen={showSymptomCustomizer}
          onClose={() => setShowSymptomCustomizer(false)}
          activeSymptoms={customizerActiveSymptoms}
          library={maternityLibrary}
          onSwap={handleMaternitySwap}
          onReset={handleMaternityReset}
        />
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground font-medium">
                {formatDisplayDate(dateISO)}
              </p>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                isPostDelivery
                  ? "bg-rose-100 text-rose-700"
                  : "bg-blue-100 text-blue-700"
              )}>
                {stageLabel}
              </span>
            </div>
            <h2 className="text-lg font-bold mt-1.5">
              {isPostDelivery ? "Recovery Daily Log" : "Maternity Daily Log"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isPostDelivery
                ? `Track your ${stageLabel.toLowerCase()} recovery symptoms.`
                : `Track your ${stageLabel.toLowerCase()} pregnancy symptoms.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors mt-0.5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Appointments for this day */}
          {dayAppointments.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-purple-500" />
                Appointments ({dayAppointments.length})
              </h3>
              <div className="space-y-2">
                {dayAppointments.map((apt) => {
                  const statusConfig = STATUS_CONFIG[apt.status];
                  const typeIcon = APPOINTMENT_TYPE_ICONS[apt.type];
                  return (
                    <div
                      key={apt.id}
                      className={`p-3 rounded-xl border ${statusConfig.bg} ${statusConfig.border}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{typeIcon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold truncate">{apt.title}</p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{apt.time}</span>
                            </div>
                            {apt.doctorName && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span className="truncate">{apt.doctorName}</span>
                              </div>
                            )}
                            {apt.hospitalName && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{apt.hospitalName}</span>
                              </div>
                            )}
                          </div>
                          {apt.notes && (
                            <p className="text-xs text-muted-foreground mt-2 truncate">{apt.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Smart Warnings */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
              {warnings.map((w, idx) => (
                <div key={idx} className="flex gap-2 items-start text-amber-800">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium leading-relaxed">
                    <strong>{w.symptomLabel}</strong> has been logged as <em>Severe</em> for {w.consecutiveDays} consecutive days. Consider consulting your healthcare provider.
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Symptoms */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                Symptoms
              </h3>
              <button
                type="button"
                onClick={toggleNoSymptoms}
                className={cn(
                  "text-[11px] font-semibold px-2 py-1 rounded-md transition-colors",
                  noSymptomsToday
                    ? "bg-green-100 text-green-700"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted text-foreground"
                )}
              >
                No Symptoms Today
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeSymptomOptions.map((opt) => {
                const isActive = !!selectedSymptoms[opt.id];
                const severity = symptomSeverities[opt.id];

                return (
                  <div
                    key={opt.id}
                    className={cn(
                      "flex flex-col gap-2 p-3 rounded-xl border transition-all text-left",
                      isActive
                        ? "bg-blue-50/50 border-blue-400 shadow-sm"
                        : "bg-card border-border hover:bg-muted/50"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSymptom(opt.id)}
                      className="flex items-center gap-2 text-sm font-medium focus:outline-none w-full"
                    >
                      <span
                        className={cn(
                          "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                          isActive ? "bg-blue-500 border-blue-500" : "border-muted-foreground/40"
                        )}
                      >
                        {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </span>
                      <span className="text-base leading-none">{opt.emoji}</span>
                      <span className={isActive ? "text-blue-900" : "text-foreground"}>
                        {opt.label}
                      </span>
                    </button>

                    {/* Inline Severity Selector */}
                    {isActive && (
                      <div className="flex bg-background border rounded-lg overflow-hidden mt-1 animate-in zoom-in-95 duration-200">
                        {(["mild", "moderate", "severe"] as const).map((sev) => {
                          const isSelected = severity === sev;
                          return (
                            <button
                              key={sev}
                              type="button"
                              onClick={() => setSeverity(opt.id, sev)}
                              className={cn(
                                "flex-1 py-1 px-2 text-[10px] font-bold uppercase tracking-wider border-r last:border-r-0 transition-colors",
                                isSelected
                                  ? sev === "mild"
                                    ? "bg-green-100 text-green-700"
                                    : sev === "moderate"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-rose-100 text-rose-700"
                                  : "text-muted-foreground hover:bg-muted"
                              )}
                            >
                              {sev}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Energy Level */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-amber-500" />
              Energy Level
            </h3>
            <div className="flex gap-2">
              {(["Low", "Medium", "High"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEnergyLevel(energyLevel === level ? "" : level)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-sm font-medium transition-all",
                    energyLevel === level
                      ? "bg-amber-100 border-amber-400/50 text-amber-700"
                      : "bg-card border-border hover:bg-muted/50 text-foreground"
                  )}
                >
                  {level === "Low" ? "🔋" : level === "Medium" ? "⚡" : "🔥"} {level}
                </button>
              ))}
            </div>
          </section>

          {/* Mood */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Mood</h3>
            <div className="flex gap-2">
              {(["Good", "Okay", "Low"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(mood === m ? "" : m)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-sm font-medium transition-all",
                    mood === m
                      ? "bg-blue-100 border-blue-400/50 text-blue-700"
                      : "bg-card border-border hover:bg-muted/50 text-foreground"
                  )}
                >
                  {m === "Good" ? "😊" : m === "Okay" ? "😐" : "😔"} {m}
                </button>
              ))}
            </div>
          </section>

          {/* Sleep & Hydration Stack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sleep */}
            <section className="space-y-4 rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                Sleep
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Duration (hours)</span>
                  <span className="text-sm font-bold text-indigo-700">
                    {sleepHours !== "" ? sleepHours : "–"} h
                  </span>
                </div>
                <EnhancedSlider
                  phase="maternity"
                  checkpoints={SLEEP_CHECKPOINTS}
                  min={0}
                  max={15}
                  step={0.5}
                  value={sleepHours !== "" ? sleepHours : 0}
                  onChange={(val) => setSleepHours(val)}
                  className="w-full [&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-500 [&_.relative.h-full]:bg-indigo-500"
                />
              </div>
            </section>

            {/* Hydration */}
            <section className="space-y-3 rounded-xl border border-border bg-card p-4">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" />
                Hydration (glasses)
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Water intake</span>
                <span className="text-sm font-bold text-sky-700">
                  {hydration !== "" ? hydration : "–"} glasses
                </span>
              </div>
              <EnhancedSlider
                phase="maternity"
                checkpoints={HYDRATION_CHECKPOINTS}
                min={0}
                max={15}
                step={1}
                value={hydration !== "" ? hydration : 0}
                onChange={(val) => setHydration(val)}
                className="w-full [&_[role=slider]]:bg-sky-500 [&_[role=slider]]:border-sky-500 [&_.relative.h-full]:bg-sky-500"
              />
            </section>
          </div>

          {/* Trimester-Aware Nutrition Checklist */}
          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Apple className="w-4 h-4 text-emerald-500" />
                Nutrition Tips
              </h3>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                {stageLabel}
              </span>
            </div>
            <p className="text-xs text-muted-foreground pb-1">
              Check off your {stageLabel.toLowerCase()} specific goals:
            </p>
            <div className="grid grid-cols-1 gap-2">
              {nutritionDef.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleNutrition(item.id)}
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all text-left group",
                    nutritionChecks[item.id]
                      ? "bg-emerald-50 border-emerald-300 shadow-sm"
                      : "bg-background border-border hover:bg-muted/50"
                  )}
                >
                  <div className="mt-0.5">
                    {nutritionChecks[item.id] ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0 block group-hover:border-emerald-300 transition-colors" />
                    )}
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", nutritionChecks[item.id] ? "text-emerald-800" : "text-foreground")}>
                      {item.emoji} {item.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Notes / Journal */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Notes / Journal
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
              placeholder="How are you feeling today? Any concerns, cravings, or observations..."
            />
          </section>

          {/* Customize Symptoms Section */}
          <section className="space-y-3 rounded-xl border border-dashed border-border/60 bg-muted/20 p-4">
            <button
              onClick={() => setShowSymptomCustomizer(true)}
              className="w-full py-2.5 text-sm font-medium border-2 border-dashed border-border rounded-md hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center gap-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Customize Active Symptoms
            </button>
            <p className="text-xs text-muted-foreground text-center">
              {activeSymptomOptions.length} active symptoms • Swap with predefined library
            </p>
          </section>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-border/60 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted/50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all ${
              saving
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-[0.97]"
            }`}
          >
            {saving ? "Saving…" : "Save log"}
          </button>
        </div>
      </div>
    </>
  );
}
