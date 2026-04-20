import { useState, useMemo, useEffect, useRef } from "react";
import { Apple, Dumbbell, Moon, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import {
  generateFoodPlan,
  getFoodsToLimit,
  generateExercisePlan,
  getExerciseNotes,
  generateSleepTips,
  type FoodCard,
  type ExerciseDay,
  type SleepTip,
} from "@/lib/menopauseWellnessEngine";

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

    let elapsed = 0;
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
  const circleColor = phase === "inhale" ? "from-amber-300 to-amber-500" : phase === "hold" ? "from-amber-400 to-orange-500" : "from-orange-300 to-amber-400";

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 text-center">
      <h3 className="text-sm font-bold text-amber-800 mb-1">🫁 4-7-8 Breathing</h3>
      <p className="text-xs text-amber-600 mb-5">Inhale 4s · Hold 7s · Exhale 8s · 4 cycles</p>

      <div className="flex items-center justify-center mb-5">
        <div className={cn(
          "w-32 h-32 rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-[1000ms] ease-in-out shadow-lg",
          circleColor,
          active ? circleScale : "scale-75",
          active && "shadow-amber-200/50"
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
            ? "bg-white text-amber-700 border border-amber-200 hover:bg-amber-50"
            : "bg-amber-500 text-white shadow-lg shadow-amber-200 hover:bg-amber-600"
        )}
      >
        {active ? "Stop" : "Start Breathing"}
      </button>
    </div>
  );
}

// ─── Food Card Component ─────────────────────────────────────────────────────

function FoodCardView({ card }: { card: FoodCard }) {
  const mealLabels = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks" };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{card.emoji}</span>
        <h4 className="text-sm font-bold text-slate-800">{mealLabels[card.meal]}</h4>
      </div>
      <ul className="space-y-1.5">
        {card.items.map((item, i) => (
          <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
            <span className="text-amber-400 mt-0.5">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {card.highlight && (
        <div className="mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
          <p className="text-[11px] text-amber-700 font-medium">{card.highlight}</p>
        </div>
      )}
    </div>
  );
}

// ─── Exercise Day Card ───────────────────────────────────────────────────────

function ExerciseDayCard({ exercise, isToday }: { exercise: ExerciseDay; isToday: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all",
      isToday ? "border-amber-300 bg-amber-50 shadow-sm" : "border-slate-200 bg-white"
    )}>
      <span className="text-2xl">{exercise.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{exercise.day}</p>
          {isToday && <span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-bold">TODAY</span>}
        </div>
        <p className="text-xs text-slate-600">{exercise.activity} · {exercise.duration}</p>
        {exercise.note && <p className="text-[11px] text-amber-600 mt-0.5">{exercise.note}</p>}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WellnessPlan() {
  const { profile } = useMenopause();
  const [activeTab, setActiveTab] = useState<"food" | "exercise" | "sleep">("food");

  const foodPlan = useMemo(() => profile ? generateFoodPlan(profile) : [], [profile]);
  const foodsToLimit = useMemo(() => getFoodsToLimit(), []);
  const exercisePlan = useMemo(() => profile ? generateExercisePlan(profile) : [], [profile]);
  const exerciseNotes = useMemo(() => profile ? getExerciseNotes(profile) : [], [profile]);
  const sleepTips = useMemo(() => profile ? generateSleepTips(profile) : [], [profile]);

  const todayDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 flex items-center justify-center">
        <div className="text-center px-4">
          <span className="text-5xl mb-4 block">🌿</span>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Complete your profile first</h2>
          <p className="text-sm text-slate-500">We need your health info to create a personalised wellness plan.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "food" as const, label: "Food Chart", icon: Apple, emoji: "🥗" },
    { id: "exercise" as const, label: "Exercise", icon: Dumbbell, emoji: "💪" },
    { id: "sleep" as const, label: "Sleep Hygiene", icon: Moon, emoji: "😴" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60">
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Your Wellness Plan</h1>
            <p className="text-xs text-slate-500">Personalised just for you</p>
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
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-amber-200"
              )}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ───── Food Tab ───── */}
        {activeTab === "food" && (
          <div className="animate-fadeIn space-y-5">
            {/* Core food recommendations */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-1">🌱 Essential Nutrients</h2>
              <p className="text-xs text-slate-500 mb-4">Foods that support your body during this transition</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { emoji: "🫘", label: "Phytoestrogens", desc: "Tofu, flaxseeds, soy milk" },
                  { emoji: "🦴", label: "Calcium-rich", desc: "Milk, yoghurt, ragi, greens" },
                  { emoji: "☀️", label: "Vitamin D", desc: "Sunlight, fortified foods" },
                  { emoji: "💧", label: "Hydration", desc: "8+ glasses, herbal teas" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                    <span className="text-lg">{item.emoji}</span>
                    <p className="text-xs font-bold text-slate-700 mt-1">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Meal grid */}
            <div>
              <h2 className="text-sm font-bold text-slate-700 mb-3 px-1">🍽️ Your Daily Meal Plan</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {foodPlan.map((card) => (
                  <FoodCardView key={card.meal} card={card} />
                ))}
              </div>
            </div>

            {/* Foods to limit */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-3">🚫 Foods to be mindful of</h2>
              <div className="space-y-2">
                {foodsToLimit.map((item) => (
                  <div key={item.item} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-50/50 border border-red-100">
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{item.item}</p>
                      <p className="text-[10px] text-slate-500">{item.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ───── Exercise Tab ───── */}
        {activeTab === "exercise" && (
          <div className="animate-fadeIn space-y-5">
            {/* Notes */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
              <h2 className="text-sm font-bold text-amber-800 mb-2">💡 Your Exercise Notes</h2>
              <ul className="space-y-1.5">
                {exerciseNotes.map((note, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weekly schedule */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">📅 Your Weekly Schedule</h2>
              <div className="space-y-2">
                {exercisePlan.map((exercise) => (
                  <ExerciseDayCard
                    key={exercise.day}
                    exercise={exercise}
                    isToday={exercise.day === todayDay}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ───── Sleep Tab ───── */}
        {activeTab === "sleep" && (
          <div className="animate-fadeIn space-y-5">
            {/* Breathing exercise */}
            {profile.symptoms.anxiety >= 3 && <BreathingExercise />}

            {/* Sleep tips */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">💤 Your Sleep Tips</h2>
              <div className="space-y-3">
                {sleepTips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 transition-all hover:shadow-sm"
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{tip.emoji}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{tip.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Always show breathing even if anxiety < 3 */}
            {profile.symptoms.anxiety < 3 && <BreathingExercise />}
          </div>
        )}
      </div>
    </div>
  );
}
