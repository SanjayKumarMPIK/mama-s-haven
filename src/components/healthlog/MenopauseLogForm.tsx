import { useState, useEffect } from "react";
import type { MenopauseEntry, MoodType } from "@/hooks/useHealthLog";

const MOODS: MoodType[] = ["Good", "Okay", "Low"];

const MOOD_COLORS: Record<MoodType, string> = {
  Good: "border-green-400 bg-green-50 text-green-800",
  Okay: "border-amber-400 bg-amber-50 text-amber-800",
  Low: "border-rose-400 bg-rose-50 text-rose-800",
};

interface Props {
  initial?: MenopauseEntry;
  onChange: (entry: MenopauseEntry) => void;
}

export default function MenopauseLogForm({ initial, onChange }: Props) {
  const [hotFlashes, setHotFlashes] = useState(initial?.symptoms.hotFlashes ?? false);
  const [nightSweats, setNightSweats] = useState(initial?.symptoms.nightSweats ?? false);
  const [moodSwings, setMoodSwings] = useState(initial?.symptoms.moodSwings ?? false);
  const [jointPain, setJointPain] = useState(initial?.symptoms.jointPain ?? false);
  const [sleepDisturbance, setSleepDisturbance] = useState(initial?.symptoms.sleepDisturbance ?? false);
  const [fatigue, setFatigue] = useState(initial?.symptoms.fatigue ?? false);
  const [sleepHours, setSleepHours] = useState<number | null>(initial?.sleepHours ?? null);
  const [mood, setMood] = useState<MoodType | null>(initial?.mood ?? null);

  useEffect(() => {
    onChange({
      phase: "menopause",
      symptoms: { hotFlashes, nightSweats, moodSwings, jointPain, sleepDisturbance, fatigue },
      sleepHours,
      mood,
    });
  }, [hotFlashes, nightSweats, moodSwings, jointPain, sleepDisturbance, fatigue, sleepHours, mood, onChange]);

  const symptoms = [
    { label: "Hot Flashes", value: hotFlashes, set: setHotFlashes },
    { label: "Night Sweats", value: nightSweats, set: setNightSweats },
    { label: "Mood Swings", value: moodSwings, set: setMoodSwings },
    { label: "Joint Pain", value: jointPain, set: setJointPain },
    { label: "Sleep Disturbance", value: sleepDisturbance, set: setSleepDisturbance },
    { label: "Fatigue", value: fatigue, set: setFatigue },
  ];

  return (
    <div className="space-y-5">
      {/* Symptoms */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Symptoms Today</p>
        <div className="grid grid-cols-2 gap-2">
          {symptoms.map(({ label, value, set }) => (
            <button
              key={label}
              type="button"
              onClick={() => set((v) => !v)}
              className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all text-left ${
                value
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {value ? "✓ " : ""}{label}
            </button>
          ))}
        </div>
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
            <span className="text-3xl font-bold text-amber-700">{sleepHours ?? 0}</span>
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
        {sleepHours !== null && sleepHours < 6 && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠ Disrupted sleep is common in menopause. Consider discussing with a healthcare provider if persistent.
          </p>
        )}
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
