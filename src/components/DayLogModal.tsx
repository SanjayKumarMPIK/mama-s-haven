import { useState, useCallback, useEffect } from "react";
import { X, Trash2, Save } from "lucide-react";
import { usePhase } from "@/hooks/usePhase";
import { useHealthLog } from "@/hooks/useHealthLog";
import type { HealthLogEntry, PubertyEntry, MaternityEntry, FamilyPlanningEntry, MenopauseEntry } from "@/hooks/useHealthLog";
import PubertyLogForm from "@/components/healthlog/PubertyLogForm";
import MaternityLogForm from "@/components/healthlog/MaternityLogForm";
import FamilyPlanningLogForm from "@/components/healthlog/FamilyPlanningLogForm";
import MenopauseLogForm from "@/components/healthlog/MenopauseLogForm";

interface Props {
  dateISO: string | null;
  onClose: () => void;
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

const PHASE_BADGE: Record<string, { label: string; cls: string }> = {
  puberty: { label: "🌸 Puberty", cls: "bg-pink-100 text-pink-700 border-pink-200" },
  maternity: { label: "🤰 Maternity", cls: "bg-purple-100 text-purple-700 border-purple-200" },
  "family-planning": { label: "🌿 Family Planning", cls: "bg-teal-100 text-teal-700 border-teal-200" },
  menopause: { label: "✨ Menopause", cls: "bg-amber-100 text-amber-700 border-amber-200" },
};

export default function DayLogModal({ dateISO, onClose }: Props) {
  const { phase } = usePhase();
  const { getLog, saveLog, deleteLog } = useHealthLog();
  const [currentEntry, setCurrentEntry] = useState<HealthLogEntry | null>(null);
  const [saved, setSaved] = useState(false);

  // Reset form state when date changes
  useEffect(() => {
    if (!dateISO) return;
    setSaved(false);
    setCurrentEntry(null);
  }, [dateISO, phase]);

  const existing = dateISO ? getLog(dateISO, phase) : undefined;
  const badge = PHASE_BADGE[phase];

  const handleChange = useCallback((entry: HealthLogEntry) => {
    setSaved(false);
    setCurrentEntry(entry);
  }, []);

  const handleSave = () => {
    if (!dateISO || !currentEntry) return;
    saveLog(dateISO, currentEntry);
    setSaved(true);
  };

  const handleDelete = () => {
    if (!dateISO) return;
    if (window.confirm("Remove the log for this day?")) {
      deleteLog(dateISO, phase);
      onClose();
    }
  };

  if (!dateISO) return null;

  // Only show existing entry if it matches the current phase
  const matchingExisting =
    existing && existing.phase === phase ? existing : undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Log health data for ${dateISO}`}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border/60">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{formatDisplayDate(dateISO)}</p>
            <h2 className="text-lg font-bold mt-0.5">
              {matchingExisting ? "Edit Log" : "Log Health Data"}
            </h2>
            <span className={`mt-1.5 inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
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

        {/* Form body – scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {phase === "puberty" && (
            <PubertyLogForm
              key={`${dateISO}-puberty`}
              initial={matchingExisting as PubertyEntry | undefined}
              onChange={handleChange as (e: PubertyEntry) => void}
            />
          )}
          {phase === "maternity" && (
            <MaternityLogForm
              key={`${dateISO}-maternity`}
              initial={matchingExisting as MaternityEntry | undefined}
              onChange={handleChange as (e: MaternityEntry) => void}
            />
          )}
          {phase === "family-planning" && (
            <FamilyPlanningLogForm
              key={`${dateISO}-fp`}
              initial={matchingExisting as FamilyPlanningEntry | undefined}
              onChange={handleChange as (e: FamilyPlanningEntry) => void}
            />
          )}
          {phase === "menopause" && (
            <MenopauseLogForm
              key={`${dateISO}-menopause`}
              initial={matchingExisting as MenopauseEntry | undefined}
              onChange={handleChange as (e: MenopauseEntry) => void}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border/60 flex gap-3">
          {matchingExisting && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!currentEntry}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all ${
              saved
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-primary text-primary-foreground hover:shadow-md active:scale-[0.97]"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {saved ? (
              <>✓ Saved</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Log
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
