import { useState } from "react";
import { usePhase } from "@/hooks/usePhase";
import { useHealthLog } from "@/hooks/useHealthLog";
import { KEY_SYMPTOMS_BY_PHASE, type KeySymptomId } from "@/lib/symptomAnalysis";

export default function SymptomQuickLogger() {
  const { phase } = usePhase();
  const { logKeySymptom } = useHealthLog();
  const [selected, setSelected] = useState<KeySymptomId | null>(null);
  const symptoms = KEY_SYMPTOMS_BY_PHASE[phase];

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quick symptom log</p>
      <div className="grid grid-cols-2 gap-2">
        {symptoms.slice(0, 4).map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={`rounded-lg border px-2.5 py-2 text-xs text-left transition-colors ${
              selected === s.id ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-muted/50"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={!selected}
        onClick={() => selected && logKeySymptom(new Date().toISOString().slice(0, 10), phase, selected)}
        className="mt-3 w-full rounded-lg bg-primary text-primary-foreground py-2 text-xs font-semibold disabled:opacity-40"
      >
        Save to today
      </button>
    </div>
  );
}

