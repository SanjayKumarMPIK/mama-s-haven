import { useState, useEffect, useRef } from "react";
import { Apple, Dumbbell, Moon, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import ExerciseTab from "@/components/maternity/activities/ExerciseTab";

// ─── Breathing Animation Component ──────────────────────────────────────────

function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cycleRef = useRef(0);

  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const phaseDurations = { inhale: 4, hold: 7, exhale: 8 };
    const phases: ("inhale" | "hold" | "exhale")[] = ["inhale", "hold", "exhale"];
    let phaseIdx = 0;
    let phaseElapsed = 0;

    setPhase("inhale");
    setSeconds(phaseDurations.inhale);
    cycleRef.current = 0;

    intervalRef.current = setInterval(() => {
      phaseElapsed++;
      const currentPhase = phases[phaseIdx];
      const remaining = phaseDurations[currentPhase] - phaseElapsed;
      setSeconds(remaining);

      if (remaining <= 0) {
        phaseIdx++;
        if (phaseIdx >= phases.length) {
          phaseIdx = 0;
          cycleRef.current++;
          if (cycleRef.current >= 4) {
            setActive(false);
            return;
          }
        }
        phaseElapsed = 0;
        setPhase(phases[phaseIdx]);
        setSeconds(phaseDurations[phases[phaseIdx]]);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

  const circleScale = phase === "inhale" ? "scale-100" : phase === "hold" ? "scale-100" : "scale-50";
  const circleColor = phase === "inhale" ? "from-purple-300 to-violet-500" : phase === "hold" ? "from-purple-400 to-indigo-500" : "from-indigo-300 to-purple-400";

  return (
    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-200 p-6 text-center">
      <h3 className="text-sm font-bold text-purple-800 mb-1">🫁 4-7-8 Breathing</h3>
      <p className="text-xs text-purple-600 mb-5">Inhale 4s · Hold 7s · Exhale 8s · 4 cycles</p>

      <div className="flex items-center justify-center mb-5">
        <div className={cn(
          "w-32 h-32 rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-[1000ms] ease-in-out shadow-lg",
          circleColor,
          active ? circleScale : "scale-75",
          active && "shadow-purple-200/50"
        )}>
          {active ? (
            <div className="text-center">
              <p className="text-white text-2xl font-bold">{seconds}</p>
              <p className="text-white/80 text-xs font-semibold capitalize">{phase}</p>
            </div>
          ) : (
            <span className="text-white text-3xl">🫁</span>
          )}
        </div>
      </div>

      <button
        onClick={() => setActive(!active)}
        className={cn(
          "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all",
          active
            ? "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50"
            : "bg-purple-500 text-white shadow-lg shadow-purple-200 hover:bg-purple-600"
        )}
      >
        {active ? "Stop" : "Start Breathing"}
      </button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MaternityWellnessPlan() {
  const [activeTab, setActiveTab] = useState<"food" | "exercise" | "sleep">("food");

  const tabs = [
    { id: "food" as const, label: "Food Chart", icon: Apple, emoji: "🥗" },
    { id: "exercise" as const, label: "Exercise", icon: Dumbbell, emoji: "💪" },
    { id: "sleep" as const, label: "Sleep Hygiene", icon: Moon, emoji: "😴" },
  ];

  return (
    <div className="bg-transparent">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-md shadow-purple-200">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Your Wellness Plan</h1>
          <p className="text-xs text-slate-500">Maternity-safe health guidance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all",
              activeTab === tab.id
                ? "bg-purple-500 text-white shadow-lg shadow-purple-200"
                : "bg-white text-slate-600 border border-slate-200 hover:border-purple-200"
            )}
          >
            <span>{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ───── Food Tab ───── */}
      {activeTab === "food" && (
        <div className="animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
              <Apple className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-2">Food Chart</h2>
            <p className="text-sm text-slate-500">Personalized meal guidance will appear here soon.</p>
          </div>
        </div>
      )}

      {/* ───── Exercise Tab ───── */}
      {activeTab === "exercise" && (
        <div className="animate-fadeIn space-y-5">
          <ExerciseTab />
        </div>
      )}

      {/* ───── Sleep Tab ───── */}
      {activeTab === "sleep" && (
        <div className="animate-fadeIn space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
              <Moon className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-700 mb-2">Sleep Hygiene</h2>
            <p className="text-sm text-slate-500">Sleep wellness guidance will appear here soon.</p>
          </div>
        </div>
      )}
    </div>
  );
}
