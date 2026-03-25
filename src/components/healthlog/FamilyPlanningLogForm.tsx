import { useState, useEffect } from "react";
import type { FamilyPlanningEntry, MoodType } from "@/hooks/useHealthLog";
import { calcFertileWindow } from "@/hooks/useHealthLog";

const MOODS: MoodType[] = ["Good", "Okay", "Low"];

const MOOD_COLORS: Record<MoodType, string> = {
  Good: "border-green-400 bg-green-50 text-green-800",
  Okay: "border-amber-400 bg-amber-50 text-amber-800",
  Low: "border-rose-400 bg-rose-50 text-rose-800",
};

interface Props {
  initial?: FamilyPlanningEntry;
  onChange: (entry: FamilyPlanningEntry) => void;
}

export default function FamilyPlanningLogForm({ initial, onChange }: Props) {
  const [lastPeriodDate, setLastPeriodDate] = useState(initial?.lastPeriodDate ?? "");
  const [cycleLength, setCycleLength] = useState<number | null>(initial?.cycleLength ?? null);
  const [cycleLengthStr, setCycleLengthStr] = useState(
    initial?.cycleLength != null ? String(initial.cycleLength) : ""
  );
  const [irregularCycle, setIrregularCycle] = useState(initial?.symptoms.irregularCycle ?? false);
  const [ovulationPain, setOvulationPain] = useState(initial?.symptoms.ovulationPain ?? false);
  const [moodChanges, setMoodChanges] = useState(initial?.symptoms.moodChanges ?? false);
  const [fatigue, setFatigue] = useState(initial?.symptoms.fatigue ?? false);
  const [stress, setStress] = useState(initial?.symptoms.stress ?? false);
  const [sleepIssues, setSleepIssues] = useState(initial?.symptoms.sleepIssues ?? false);
  const [mood, setMood] = useState<MoodType | null>(initial?.mood ?? null);
  const [sleepHours, setSleepHours] = useState<number | null>(initial?.sleepHours ?? null);

  useEffect(() => {
    onChange({
      phase: "family-planning",
      lastPeriodDate,
      cycleLength,
      symptoms: { irregularCycle, ovulationPain, moodChanges, fatigue, stress, sleepIssues },
      mood,
      sleepHours,
    });
  }, [
    lastPeriodDate,
    cycleLength,
    irregularCycle,
    ovulationPain,
    moodChanges,
    fatigue,
    stress,
    sleepIssues,
    mood,
    sleepHours,
    onChange,
  ]);

  const fertileWindow =
    lastPeriodDate && cycleLength ? calcFertileWindow(lastPeriodDate, cycleLength) : null;

  return (
    <div className="space-y-5">
      {/* Last Period Date */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Last Period Date</p>
        <input
          type="date"
          value={lastPeriodDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setLastPeriodDate(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
      </div>

      {/* Cycle Length */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Average Cycle Length (days)</p>
        <input
          type="number"
          min={10}
          max={60}
          placeholder="e.g. 28"
          value={cycleLengthStr}
          onChange={(e) => {
            setCycleLengthStr(e.target.value);
            const n = parseInt(e.target.value, 10);
            setCycleLength(!isNaN(n) && n >= 10 && n <= 60 ? n : null);
          }}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
        />
        <p className="mt-1 text-xs text-muted-foreground">Normal range: 21–35 days</p>
      </div>

      {/* Fertile Window Preview */}
      {fertileWindow && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
          <p className="text-xs font-semibold text-teal-800 mb-2">Estimated Fertile Window</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded-xl p-2 border border-teal-100">
              <p className="text-[10px] text-muted-foreground font-medium">Window Start</p>
              <p className="text-xs font-bold text-teal-800 mt-0.5">{fertileWindow.fertileStart}</p>
            </div>
            <div className="bg-teal-100 rounded-xl p-2 border border-teal-300">
              <p className="text-[10px] text-muted-foreground font-medium">Ovulation</p>
              <p className="text-xs font-bold text-teal-900 mt-0.5">{fertileWindow.ovulation}</p>
            </div>
            <div className="bg-white rounded-xl p-2 border border-teal-100">
              <p className="text-[10px] text-muted-foreground font-medium">Window End</p>
              <p className="text-xs font-bold text-teal-800 mt-0.5">{fertileWindow.fertileEnd}</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-teal-700">Estimated only. Consult a healthcare provider for confirmation.</p>
        </div>
      )}

      {/* Symptoms */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Symptoms</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Irregular Cycle", value: irregularCycle, set: setIrregularCycle },
            { label: "Ovulation Pain", value: ovulationPain, set: setOvulationPain },
            { label: "Mood Changes", value: moodChanges, set: setMoodChanges },
            { label: "Fatigue", value: fatigue, set: setFatigue },
            { label: "Stress", value: stress, set: setStress },
            { label: "Sleep Issues", value: sleepIssues, set: setSleepIssues },
          ].map(({ label, value, set }) => (
            <button
              key={label}
              type="button"
              onClick={() => set((v) => !v)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                value
                  ? "border-teal-300 bg-teal-50 text-teal-800"
                  : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {value ? "✓ " : ""}{label}
            </button>
          ))}
        </div>
      </div>

      {/* Sleep */}
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
            <span className="text-3xl font-bold text-teal-700">{sleepHours ?? 0}</span>
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
