import { useState, useEffect } from "react";
import type { PubertyEntry, MoodType, FlowIntensity } from "@/hooks/useHealthLog";

const MOODS: MoodType[] = ["Good", "Okay", "Low"];
const FLOWS: FlowIntensity[] = ["Light", "Medium", "Heavy"];

const MOOD_COLORS: Record<MoodType, string> = {
  Good: "border-green-400 bg-green-50 text-green-800",
  Okay: "border-amber-400 bg-amber-50 text-amber-800",
  Low: "border-rose-400 bg-rose-50 text-rose-800",
};

interface Props {
  initial?: PubertyEntry;
  onChange: (entry: PubertyEntry) => void;
}

export default function PubertyLogForm({ initial, onChange }: Props) {
  const [periodStarted, setPeriodStarted] = useState(initial?.periodStarted ?? false);
  const [periodEnded, setPeriodEnded] = useState(initial?.periodEnded ?? false);
  const [flowIntensity, setFlowIntensity] = useState<FlowIntensity | null>(
    initial?.flowIntensity ?? null
  );
  const [cramps, setCramps] = useState(initial?.symptoms.cramps ?? false);
  const [fatigue, setFatigue] = useState(initial?.symptoms.fatigue ?? false);
  const [moodSwings, setMoodSwings] = useState(initial?.symptoms.moodSwings ?? false);
  const [headache, setHeadache] = useState(initial?.symptoms.headache ?? false);
  const [acne, setAcne] = useState(initial?.symptoms.acne ?? false);
  const [breastTenderness, setBreastTenderness] = useState(initial?.symptoms.breastTenderness ?? false);
  const [mood, setMood] = useState<MoodType | null>(initial?.mood ?? null);

  useEffect(() => {
    onChange({
      phase: "puberty",
      periodStarted,
      periodEnded,
      flowIntensity: periodStarted ? flowIntensity : null,
      symptoms: { cramps, fatigue, moodSwings, headache, acne, breastTenderness },
      mood,
    });
  }, [
    periodStarted,
    periodEnded,
    flowIntensity,
    cramps,
    fatigue,
    moodSwings,
    headache,
    acne,
    breastTenderness,
    mood,
    onChange,
  ]);

  return (
    <div className="space-y-5">
      {/* Period Status */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Period Status</p>
        <div className="flex flex-col gap-2.5">
          <label className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm font-medium">Period started today</span>
            <div
              role="switch"
              aria-checked={periodStarted}
              onClick={() => setPeriodStarted((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                periodStarted ? "bg-pink-500" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                  periodStarted ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </label>
          <label className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <span className="text-sm font-medium">Period ended today</span>
            <div
              role="switch"
              aria-checked={periodEnded}
              onClick={() => setPeriodEnded((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                periodEnded ? "bg-pink-500" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${
                  periodEnded ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </label>
        </div>
      </div>

      {/* Flow Intensity */}
      {periodStarted && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Flow Intensity</p>
          <div className="flex gap-2">
            {FLOWS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFlowIntensity(f === flowIntensity ? null : f)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  flowIntensity === f
                    ? "border-pink-400 bg-pink-50 text-pink-800"
                    : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Symptoms */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Symptoms</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Cramps", value: cramps, set: setCramps },
            { label: "Fatigue", value: fatigue, set: setFatigue },
            { label: "Mood Swings", value: moodSwings, set: setMoodSwings },
            { label: "Headache", value: headache, set: setHeadache },
            { label: "Acne", value: acne, set: setAcne },
            { label: "Breast Tenderness", value: breastTenderness, set: setBreastTenderness },
          ].map(({ label, value, set }) => (
            <button
              key={label}
              type="button"
              onClick={() => set((v) => !v)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                value
                  ? "border-pink-300 bg-pink-50 text-pink-800"
                  : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {value ? "✓ " : ""}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Mood</p>
        <div className="flex gap-2">
          {MOODS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMood(m === mood ? null : m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                mood === m ? MOOD_COLORS[m] : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
