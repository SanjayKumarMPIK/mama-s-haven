import { useState, useEffect } from "react";
import type { MaternityEntry, MoodType, FatigueLevel } from "@/hooks/useHealthLog";

const MOODS: MoodType[] = ["Good", "Okay", "Low"];
const FATIGUE_LEVELS: FatigueLevel[] = ["Low", "Medium", "High"];

const MOOD_COLORS: Record<MoodType, string> = {
  Good: "border-green-400 bg-green-50 text-green-800",
  Okay: "border-amber-400 bg-amber-50 text-amber-800",
  Low: "border-rose-400 bg-rose-50 text-rose-800",
};

const FATIGUE_COLORS: Record<FatigueLevel, string> = {
  Low: "border-green-400 bg-green-50 text-green-800",
  Medium: "border-amber-400 bg-amber-50 text-amber-800",
  High: "border-red-400 bg-red-50 text-red-800",
};

interface Props {
  initial?: MaternityEntry;
  onChange: (entry: MaternityEntry) => void;
}

export default function MaternityLogForm({ initial, onChange }: Props) {
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel | null>(initial?.fatigueLevel ?? null);
  const [hydrationGlasses, setHydrationGlasses] = useState<number | null>(initial?.hydrationGlasses ?? null);
  const [sleepHours, setSleepHours] = useState<number | null>(initial?.sleepHours ?? null);
  const [nausea, setNausea] = useState(initial?.symptoms.nausea ?? false);
  const [dizziness, setDizziness] = useState(initial?.symptoms.dizziness ?? false);
  const [swelling, setSwelling] = useState(initial?.symptoms.swelling ?? false);
  const [backPain, setBackPain] = useState(initial?.symptoms.backPain ?? false);
  const [sleepDisturbance, setSleepDisturbance] = useState(initial?.symptoms.sleepDisturbance ?? false);
  const [mood, setMood] = useState<MoodType | null>(initial?.mood ?? null);

  useEffect(() => {
    onChange({
      phase: "maternity",
      fatigueLevel,
      hydrationGlasses,
      sleepHours,
      symptoms: { nausea, dizziness, swelling, backPain, sleepDisturbance },
      mood,
    });
  }, [
    fatigueLevel,
    hydrationGlasses,
    sleepHours,
    nausea,
    dizziness,
    swelling,
    backPain,
    sleepDisturbance,
    mood,
    onChange,
  ]);

  const isLowHydration = hydrationGlasses !== null && hydrationGlasses < 6;
  const isLowSleep = sleepHours !== null && sleepHours < 6;

  return (
    <div className="space-y-5">
      {/* Fatigue Level */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Fatigue Level</p>
        <div className="flex gap-2">
          {FATIGUE_LEVELS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFatigueLevel(f === fatigueLevel ? null : f)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                fatigueLevel === f ? FATIGUE_COLORS[f] : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Hydration */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Hydration (glasses of water)
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHydrationGlasses((v) => Math.max(0, (v ?? 0) - 1))}
            className="w-10 h-10 rounded-full border-2 border-border text-lg font-bold bg-muted/40 hover:bg-muted flex items-center justify-center"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="text-3xl font-bold text-purple-700">{hydrationGlasses ?? 0}</span>
            <span className="text-sm text-muted-foreground ml-1">glasses</span>
          </div>
          <button
            type="button"
            onClick={() => setHydrationGlasses((v) => (v ?? 0) + 1)}
            className="w-10 h-10 rounded-full border-2 border-border text-lg font-bold bg-muted/40 hover:bg-muted flex items-center justify-center"
          >
            +
          </button>
        </div>
        {isLowHydration && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠ Aim for at least 8–10 glasses during pregnancy.
          </p>
        )}
      </div>

      {/* Sleep Hours */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Sleep Hours</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSleepHours((v) => Math.max(0, (v ?? 0) - 0.5))}
            className="w-10 h-10 rounded-full border-2 border-border text-lg font-bold bg-muted/40 hover:bg-muted flex items-center justify-center"
          >
            −
          </button>
          <div className="flex-1 text-center">
            <span className="text-3xl font-bold text-purple-700">{sleepHours ?? 0}</span>
            <span className="text-sm text-muted-foreground ml-1">hrs</span>
          </div>
          <button
            type="button"
            onClick={() => setSleepHours((v) => Math.min(24, (v ?? 0) + 0.5))}
            className="w-10 h-10 rounded-full border-2 border-border text-lg font-bold bg-muted/40 hover:bg-muted flex items-center justify-center"
          >
            +
          </button>
        </div>
        {isLowSleep && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠ 7–9 hours of sleep is recommended during pregnancy.
          </p>
        )}
      </div>

      {/* Symptoms */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Symptoms</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Nausea", value: nausea, set: setNausea },
            { label: "Dizziness", value: dizziness, set: setDizziness },
            { label: "Swelling", value: swelling, set: setSwelling },
            { label: "Back Pain", value: backPain, set: setBackPain },
            { label: "Sleep Disturbance", value: sleepDisturbance, set: setSleepDisturbance },
          ].map(({ label, value, set }) => (
            <button
              key={label}
              type="button"
              onClick={() => set((v) => !v)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                value
                  ? "border-purple-300 bg-purple-50 text-purple-800"
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
