import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  X,
  Activity,
  Moon,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { EnhancedSlider, type Checkpoint } from "@/components/ui/enhanced-slider";
import { useHealthLog, type HealthLogEntry, type MenopauseEntry } from "@/hooks/useHealthLog";
import { useMenopause, SYMPTOM_OPTIONS } from "@/hooks/useMenopause";

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

const SLEEP_CHECKPOINTS: Checkpoint[] = [
  { value: 4, label: "4h (Low)", priority: "low" },
  { value: 6, label: "6h (Min)", priority: "medium" },
  { value: 8, label: "8h (Optimal)", priority: "high" },
  { value: 10, label: "10h+ (High)", priority: "medium" },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface MenopauseDayDetailsProps {
  dateISO: string;
  onClose: () => void;
}

export function MenopauseDayDetails({ dateISO, onClose }: MenopauseDayDetailsProps) {
  const { getLog, saveLog, deleteLog } = useHealthLog();
  const { profile } = useMenopause();

  const existingEntry = getLog(dateISO) as MenopauseEntry | undefined;
  const isMenopause = existingEntry?.phase === "menopause";

  // ─── State ──────────────────────────────────────────────────────────────────

  const [selectedSymptoms, setSelectedSymptoms] = useState<MenopauseEntry["symptoms"]>(() => {
    if (!isMenopause) {
      return {
        hotFlashes: false,
        nightSweats: false,
        moodSwings: false,
        jointPain: false,
        sleepDisturbance: false,
        fatigue: false,
      };
    }
    return { ...existingEntry.symptoms };
  });

  const [mood, setMood] = useState<"Good" | "Okay" | "Low" | "">(() => {
    return isMenopause && existingEntry.mood ? existingEntry.mood : "";
  });

  const [sleepHours, setSleepHours] = useState<number | "">(() => {
    return isMenopause && existingEntry.sleepHours != null ? existingEntry.sleepHours : "";
  });

  const [sleepQuality, setSleepQuality] = useState<string>(() => {
    return isMenopause && existingEntry.sleepQuality ? existingEntry.sleepQuality : "";
  });

  const [notes, setNotes] = useState<string>(() => {
    return isMenopause && existingEntry.notes ? existingEntry.notes : "";
  });

  const [saving, setSaving] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const toggleSymptom = useCallback((id: string) => {
    setSelectedSymptoms((prev) => {
      const isSelected = !prev[id];
      const next = { ...prev, [id]: isSelected };
      return next;
    });
  }, []);

  // ─── Save ───────────────────────────────────────────────────────────────────

  function handleSave() {
    if (saving) return;

    const hasSymptoms = Object.values(selectedSymptoms).some(Boolean);
    const hasMood = mood !== "";
    const hasSleep = sleepHours !== "";
    const hasNotes = notes.trim().length > 0;

    if (!hasSymptoms && !hasMood && !hasSleep && !hasNotes) {
      toast.error("Please log at least one piece of data before saving.");
      return;
    }

    setSaving(true);

    const entry: HealthLogEntry = {
      phase: "menopause",
      symptoms: selectedSymptoms,
      mood: mood !== "" ? (mood as "Good" | "Okay" | "Low") : null,
      sleepHours: sleepHours !== "" ? Number(sleepHours) : null,
      sleepQuality: sleepQuality !== "" ? (sleepQuality as any) : null,
      notes: notes || undefined,
    };

    saveLog(dateISO, entry);

    toast.success(`Menopause log saved for ${formatDisplayDate(dateISO)}`, {
      description: hasSymptoms
        ? `${Object.values(selectedSymptoms).filter(Boolean).length} symptom(s) saved`
        : "Data saved",
    });

    setSaving(false);
    onClose();
  }

  function handleDelete() {
    if (confirm("Delete this log entry?")) {
      deleteLog(dateISO);
      toast.success("Log entry deleted");
      onClose();
    }
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
        aria-label={`Menopause log for ${dateISO}`}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border/60">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              {formatDisplayDate(dateISO)}
            </p>
            <h2 className="text-lg font-bold mt-1.5">Menopause Daily Log</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track your symptoms and wellness.
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
              <Activity className="w-4 h-4 text-amber-500" />
              Symptoms
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {SYMPTOM_OPTIONS.map((opt) => {
                const isActive = !!selectedSymptoms[opt.id];

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSymptom(opt.id)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-xl border transition-all text-left",
                      isActive
                        ? "bg-amber-50/50 border-amber-400 shadow-sm"
                        : "bg-card border-border hover:bg-muted/50"
                    )}
                  >
                    <span className="text-lg">{opt.emoji}</span>
                    <span className={cn("text-sm font-medium", isActive ? "text-amber-900" : "text-foreground")}>
                      {opt.label}
                    </span>
                    {isActive && (
                      <CheckCircle2 className="w-4 h-4 text-amber-500 ml-auto" />
                    )}
                  </button>
                );
              })}
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
                      ? "bg-amber-100 border-amber-400/50 text-amber-700"
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
              <EnhancedSlider
                phase="menopause"
                checkpoints={SLEEP_CHECKPOINTS}
                min={0}
                max={15}
                step={0.5}
                value={sleepHours !== "" ? sleepHours : 0}
                onChange={(val) => setSleepHours(val)}
                className="w-full [&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-500 [&_.relative.h-full]:bg-indigo-500"
              />
              <div className="flex gap-2 mt-2">
                {["good", "average", "poor"].map((quality) => (
                  <button
                    key={quality}
                    type="button"
                    onClick={() => setSleepQuality(sleepQuality === quality ? "" : quality)}
                    className={cn(
                      "flex-1 py-2 rounded-xl border text-xs font-medium capitalize transition-all",
                      sleepQuality === quality
                        ? "bg-indigo-100 border-indigo-400/50 text-indigo-700"
                        : "bg-card border-border hover:bg-muted/50 text-foreground"
                    )}
                  >
                    {quality}
                  </button>
                ))}
              </div>
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
              placeholder="How are you feeling today? Any observations..."
            />
          </section>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-5 py-4 border-t border-border/60 flex gap-3">
          {existingEntry && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 text-sm font-semibold hover:bg-rose-100 transition-colors"
              disabled={saving}
            >
              Delete
            </button>
          )}
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
                : "bg-amber-600 text-white hover:bg-amber-700 hover:shadow-md active:scale-[0.97]"
            }`}
          >
            {saving ? "Saving…" : "Save log"}
          </button>
        </div>
      </div>
    </>
  );
}
