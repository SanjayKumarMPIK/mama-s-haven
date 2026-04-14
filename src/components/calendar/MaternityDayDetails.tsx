import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  X,
  Activity,
  Moon,
  Droplets,
  Apple,
  Dumbbell,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useHealthLog, type HealthLogEntry, type MaternityEntry } from "@/hooks/useHealthLog";
import {
  KEY_SYMPTOMS_BY_PHASE,
  analyzePhaseSymptom,
  type KeySymptomId,
} from "@/lib/symptomAnalysis";

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

// ─── Component ────────────────────────────────────────────────────────────────

interface MaternityDayDetailsProps {
  dateISO: string;
  onClose: () => void;
}

export function MaternityDayDetails({ dateISO, onClose }: MaternityDayDetailsProps) {
  const { getLog, saveLog } = useHealthLog();
  const existingEntry = getLog(dateISO);
  const isMaternity = existingEntry?.phase === "maternity";

  const symptomOptions = useMemo(() => {
    const phaseSymptoms = KEY_SYMPTOMS_BY_PHASE["maternity"] ?? [];
    return phaseSymptoms.map((s) => ({ id: s.id, label: s.label }));
  }, []);

  // ─── State ──────────────────────────────────────────────────────────────────

  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>(() => {
    if (!isMaternity) return {};
    return { ...(existingEntry.symptoms as Record<string, boolean>) };
  });

  const [mood, setMood] = useState<"Good" | "Okay" | "Low" | "">(() => {
    if (isMaternity && (existingEntry as any).mood) return (existingEntry as any).mood;
    return "";
  });

  const [sleepHours, setSleepHours] = useState<number | "">(() => {
    if (isMaternity && (existingEntry as MaternityEntry).sleepHours != null)
      return (existingEntry as MaternityEntry).sleepHours!;
    return "";
  });

  const [sleepQuality, setSleepQuality] = useState<"Good" | "Okay" | "Poor" | "">(() => {
    if (isMaternity && (existingEntry as MaternityEntry).sleepQuality)
      return (existingEntry as MaternityEntry).sleepQuality!;
    return "";
  });

  const [notes, setNotes] = useState<string>(() => {
    if (isMaternity && (existingEntry as MaternityEntry).notes)
      return (existingEntry as MaternityEntry).notes!;
    return "";
  });

  const [energyLevel, setEnergyLevel] = useState<"Low" | "Medium" | "High" | "">(() => {
    if (isMaternity && (existingEntry as MaternityEntry).fatigueLevel)
      return (existingEntry as MaternityEntry).fatigueLevel!;
    return "";
  });

  const [hydration, setHydration] = useState<number | "">(() => {
    if (isMaternity && (existingEntry as MaternityEntry).hydrationGlasses != null)
      return (existingEntry as MaternityEntry).hydrationGlasses!;
    return "";
  });

  // Nutrition checklist state
  const [nutritionChecks, setNutritionChecks] = useState<Record<string, boolean>>(() => {
    // Load from notes if previously saved (simple approach)
    return { water: false, iron: false, calcium: false, folicAcid: false };
  });

  const [saving, setSaving] = useState(false);

  const toggleSymptom = useCallback((id: string) => {
    setSelectedSymptoms((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleNutrition = useCallback((key: string) => {
    setNutritionChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ─── Save Handler ───────────────────────────────────────────────────────────

  function handleSave() {
    if (saving) return;

    const hasSymptoms = Object.values(selectedSymptoms).some(Boolean);
    const hasMood = mood !== "";
    const hasSleep = sleepHours !== "" || sleepQuality !== "";
    const hasNotes = notes.trim().length > 0;
    const hasEnergy = energyLevel !== "";
    const hasHydration = hydration !== "";

    if (!hasSymptoms && !hasMood && !hasSleep && !hasNotes && !hasEnergy && !hasHydration) {
      toast.error("Please log at least one piece of data before saving.");
      return;
    }

    setSaving(true);

    const entry: HealthLogEntry = {
      phase: "maternity",
      fatigueLevel: energyLevel !== "" ? (energyLevel as "Low" | "Medium" | "High") : null,
      hydrationGlasses: hydration !== "" ? Number(hydration) : null,
      sleepHours: sleepHours !== "" ? Number(sleepHours) : null,
      sleepQuality: sleepQuality !== "" ? (sleepQuality as "Good" | "Okay" | "Poor") : null,
      symptoms: {
        nausea: !!selectedSymptoms.nausea,
        dizziness: !!selectedSymptoms.dizziness,
        swelling: !!selectedSymptoms.swelling,
        backPain: !!selectedSymptoms.backPain,
        sleepDisturbance: !!selectedSymptoms.sleepDisturbance,
      },
      mood: mood !== "" ? (mood as "Good" | "Okay" | "Low") : null,
      notes: notes || undefined,
    };

    saveLog(dateISO, entry);

    toast.success(`Maternity log saved for ${formatDisplayDate(dateISO)}`, {
      description: hasSymptoms
        ? `${Object.values(selectedSymptoms).filter(Boolean).length} symptom(s)${hasMood ? " + mood" : ""} saved`
        : hasMood
        ? "Mood logged"
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
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border/60">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {formatDisplayDate(dateISO)}
            </p>
            <h2 className="text-lg font-bold mt-0.5">Maternity Daily Log</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Track your pregnancy symptoms, nutrition, and wellbeing.
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
          {/* Symptoms */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              Symptoms
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {symptomOptions.map((opt) => {
                const isActive = !!selectedSymptoms[opt.id];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSymptom(opt.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                      isActive
                        ? "bg-blue-100 border-blue-400/50 text-blue-700 shadow-sm"
                        : "bg-card border-border hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-3 h-3 rounded-full border-2 transition-colors",
                          isActive ? "bg-blue-500 border-blue-500" : "border-muted-foreground/40"
                        )}
                      />
                      {opt.label}
                    </span>
                  </button>
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
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={sleepHours !== "" ? sleepHours : 0}
                onChange={(e) => setSleepHours(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0h</span>
                <span>5h</span>
                <span>10h+</span>
              </div>
            </div>
            <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
              <span className="text-xs font-medium text-foreground">Quality</span>
              <div className="flex gap-2">
                {(["Good", "Okay", "Poor"] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSleepQuality(sleepQuality === q ? "" : q)}
                    className={cn(
                      "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                      sleepQuality === q
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-background border-border hover:bg-muted/50 text-foreground"
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
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
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={hydration !== "" ? hydration : 0}
              onChange={(e) => setHydration(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0</span>
              <span>8 (recommended)</span>
              <span>15</span>
            </div>
          </section>

          {/* Nutrition Checklist */}
          <section className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Apple className="w-4 h-4 text-emerald-500" />
              Nutrition Check
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "water", label: "Water (8+ cups)", emoji: "💧" },
                { key: "iron", label: "Iron-rich food", emoji: "🥩" },
                { key: "calcium", label: "Calcium source", emoji: "🥛" },
                { key: "folicAcid", label: "Folic Acid", emoji: "💊" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => toggleNutrition(item.key)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                    nutritionChecks[item.key]
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                      : "bg-background border-border hover:bg-muted/50 text-foreground"
                  )}
                >
                  {nutritionChecks[item.key] ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                  )}
                  <span>
                    {item.emoji} {item.label}
                  </span>
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
