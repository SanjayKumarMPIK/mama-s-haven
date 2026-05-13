import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Play, Shield, Wind } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog, type MenopauseEntry } from "@/hooks/useHealthLog";
import {
  buildCalmRoutine,
  countRecentCalendarPatterns,
  createId,
  readMenopauseToolData,
  writeMenopauseToolData,
  fetchSyncedToolData,
  type CalmRoutineRecord,
} from "@/lib/menopauseTools";
import { cn } from "@/lib/utils";

export default function MenoCalmRoutineGenerator() {
  const { user } = useAuth();
  const { getPhaseLogs } = useHealthLog();

  const calendarLogs = useMemo(() => {
    const phaseLogs = getPhaseLogs("menopause");
    return Object.entries(phaseLogs)
      .map(([date, entry]) => ({ date, entry: entry as MenopauseEntry }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getPhaseLogs]);

  const recentSummary = useMemo(() => countRecentCalendarPatterns(calendarLogs), [calendarLogs]);
  const [records, setRecords] = useState<CalmRoutineRecord[]>(() => readMenopauseToolData(user?.id, "calmRoutines", []));

  useEffect(() => {
    if (!user) return;
    const sync = async () => {
      const data = await fetchSyncedToolData(user.id, "calmRoutines");
      if (data && data.length > 0) {
        const mapped: CalmRoutineRecord[] = data.map((d: any) => ({
          id: d.id,
          moodState: d.mood_state,
          durationMinutes: d.duration_minutes,
          routineType: d.routine_type,
          generatedSteps: d.generated_steps || [],
          completed: d.completed,
          createdAt: d.created_at
        }));
        setRecords(prev => {
          const merged = [...mapped, ...prev.filter(p => !mapped.some(m => m.id === p.id))];
          return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        });
      }
    };
    sync();
  }, [user]);

  const [moodState, setMoodState] = useState<CalmRoutineRecord["moodState"]>(recentSummary.sleepDifficultyDays >= 3 ? "cannot_sleep" : "anxious");
  const [durationMinutes, setDurationMinutes] = useState<CalmRoutineRecord["durationMinutes"]>(5);
  const [routineType, setRoutineType] = useState<CalmRoutineRecord["routineType"]>(recentSummary.lowMoodDays >= 3 ? "mixed" : "breathing");
  const [currentRoutine, setCurrentRoutine] = useState<CalmRoutineRecord | null>(records[0] ?? null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [checkIn, setCheckIn] = useState<"yes" | "same" | "not_yet" | "">("");

  useEffect(() => {
    if (records.length > 0 && !currentRoutine) {
      setCurrentRoutine(records[0]);
    }
  }, [records, currentRoutine]);

  const stepSeconds = currentRoutine ? Math.max(30, Math.floor((currentRoutine.durationMinutes * 60) / currentRoutine.generatedSteps.length)) : 0;

  useEffect(() => {
    if (!isRunning || !currentRoutine || stepSeconds <= 0) return;
    const interval = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev > 1) return prev - 1;
        if (activeStepIndex < currentRoutine.generatedSteps.length - 1) {
          setActiveStepIndex((index) => index + 1);
          return stepSeconds;
        }
        setIsRunning(false);
        setCheckIn("");
        const updated = { ...currentRoutine, completed: true };
        setCurrentRoutine(updated);
        const nextRecords = [updated, ...records.filter((record) => record.id !== updated.id)];
        setRecords(nextRecords);
        writeMenopauseToolData(user?.id, "calmRoutines", nextRecords);
        toast.success("Routine completed.");
        return 0;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [activeStepIndex, currentRoutine, isRunning, records, stepSeconds, user?.id]);

  const generateRoutine = () => {
    const generatedSteps = buildCalmRoutine(moodState, durationMinutes, routineType, calendarLogs);
    const record: CalmRoutineRecord = {
      id: createId("routine"),
      moodState,
      durationMinutes,
      routineType,
      generatedSteps,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const nextRecords = [record, ...records.filter((item) => item.id !== record.id)].slice(0, 12);
    setRecords(nextRecords);
    setCurrentRoutine(record);
    setActiveStepIndex(0);
    setIsRunning(false);
    setRemainingSeconds(stepSeconds || Math.max(30, Math.floor((durationMinutes * 60) / generatedSteps.length)));
    setCheckIn("");
    writeMenopauseToolData(user?.id, "calmRoutines", nextRecords);
  };

  const startRoutine = () => {
    if (!currentRoutine) return;
    setActiveStepIndex(0);
    setRemainingSeconds(stepSeconds);
    setIsRunning(true);
    setCheckIn("");
  };

  const stepCount = currentRoutine?.generatedSteps.length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40">
      <div className="container max-w-5xl space-y-6 py-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/tools" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
            <Wind className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Calm Routine Generator</h1>
            <p className="text-xs text-slate-500">Build a short calming routine for stress, restlessness, irritability, or sleep difficulty</p>
          </div>
        </div>

        <section className="rounded-3xl border border-emerald-200/70 bg-white/85 p-5 shadow-sm">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-slate-800">Choose your reset</p>
                <p className="mt-1 text-xs text-slate-500">The routine adapts to how you feel right now and the time you have available.</p>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700">How are you feeling right now?</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["anxious", "Anxious"],
                    ["irritable", "Irritable"],
                    ["restless", "Restless"],
                    ["overwhelmed", "Overwhelmed"],
                    ["cannot_sleep", "Cannot sleep"],
                  ].map(([value, label]) => (
                    <button key={value} onClick={() => setMoodState(value as CalmRoutineRecord["moodState"])} className={cn("rounded-2xl border px-3 py-3 text-sm font-medium transition-all", moodState === value ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700">How much time do you have?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 10].map((minutes) => (
                    <button key={minutes} onClick={() => setDurationMinutes(minutes as 3 | 5 | 10)} className={cn("rounded-2xl border px-3 py-3 text-sm font-medium transition-all", durationMinutes === minutes ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50")}>
                      {minutes} minutes
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold text-slate-700">Preferred type</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["breathing", "Breathing"],
                    ["gentle_stretch", "Gentle stretch"],
                    ["quiet_reflection", "Quiet reflection"],
                    ["mixed", "Mixed routine"],
                  ].map(([value, label]) => (
                    <button key={value} onClick={() => setRoutineType(value as CalmRoutineRecord["routineType"])} className={cn("rounded-2xl border px-3 py-3 text-sm font-medium transition-all", routineType === value ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={generateRoutine} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700">
                Generate routine
              </button>
            </div>

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-800">Routine generator</p>
                  <p className="mt-1 text-xs text-slate-500">{currentRoutine ? `${stepCount} steps in ${currentRoutine.durationMinutes} minutes` : "Generate a routine to begin"}</p>
                </div>
                {currentRoutine && <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">Step {Math.min(activeStepIndex + 1, stepCount)} of {stepCount}</span>}
              </div>

              <div className="mt-4 space-y-3">
                {currentRoutine ? currentRoutine.generatedSteps.map((step, index) => (
                  <div key={`${step}-${index}`} className={cn("rounded-2xl border p-4 text-sm", index === activeStepIndex && isRunning ? "border-emerald-300 bg-white text-slate-800 shadow-sm" : "border-white/80 bg-white/70 text-slate-600")}>
                    {index + 1}. {step}
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-4 text-sm text-slate-500">
                    Your generated steps will appear here after you choose a mood, time, and preferred routine style.
                  </div>
                )}
              </div>

              {currentRoutine && (
                <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Start routine</p>
                      <p className="mt-1 text-sm text-slate-700">{isRunning ? `Current step timer: ${remainingSeconds}s` : "Start when you are ready"}</p>
                    </div>
                    <button onClick={startRoutine} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200 transition-colors hover:bg-emerald-50">
                      <Play className="h-4 w-4" /> Start
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">Post-routine check-in</h2>
          <p className="mt-1 text-xs text-slate-500">Do you feel a little better?</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["yes", "Yes"],
              ["same", "Same"],
              ["not_yet", "Not yet"],
            ].map(([value, label]) => (
              <button key={value} onClick={() => setCheckIn(value as typeof checkIn)} className={cn("rounded-full border px-4 py-2 text-sm font-medium transition-all", checkIn === value ? "border-emerald-300 bg-emerald-100 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50")}>
                {label}
              </button>
            ))}
          </div>
          {checkIn && <p className="mt-3 text-sm text-slate-600">{checkIn === "yes" ? "Good. Keep the next hour gentle if you can." : checkIn === "same" ? "That is okay. You can try a different routine style next time." : "Try a shorter breathing-first routine or step away from stimulation for a few minutes."}</p>}
        </section>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <Shield className="h-5 w-5 shrink-0 text-slate-500" />
          <p className="text-[11px] leading-relaxed text-slate-500">These routines are supportive self-care prompts only. They are not treatment for anxiety, insomnia, or mental health conditions.</p>
        </div>
      </div>
    </div>
  );
}
