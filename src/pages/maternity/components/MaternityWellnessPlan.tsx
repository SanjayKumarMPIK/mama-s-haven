import { useState, useMemo, useEffect, useRef } from "react";
import { Apple, Dumbbell, Moon, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

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

// ─── Food Card Component ─────────────────────────────────────────────────────

type Meal = "breakfast" | "lunch" | "dinner" | "snacks";
type FoodItem = { title: string; reason: string };
type FoodCard = { meal: Meal; emoji: string; items: FoodItem[] };
type ExerciseDay = { day: string; activity: string; duration: string; intensity: "low" | "moderate" | "high"; goal: string };
type SleepTip = { title: string; description: string; priority: "high" | "medium" };

function FoodCardView({ card }: { card: FoodCard }) {
  const mealLabels: Record<Meal, string> = { breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snacks: "Snacks" };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{card.emoji}</span>
        <h4 className="text-sm font-bold text-slate-800">{mealLabels[card.meal]}</h4>
      </div>
      <ul className="space-y-1.5">
        {card.items.map((item, i) => (
          <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
            <span className="text-purple-400 mt-0.5">•</span>
            <span>{item.title} - {item.reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Exercise Day Card ───────────────────────────────────────────────────────

function ExerciseDayCard({ exercise, isToday }: { exercise: ExerciseDay; isToday: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all",
      isToday ? "border-purple-300 bg-purple-50 shadow-sm" : "border-slate-200 bg-white"
    )}>
      <span className="text-2xl">{exercise.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{exercise.day}</p>
          {isToday && <span className="text-[10px] px-2 py-0.5 bg-purple-200 text-purple-800 rounded-full font-bold">TODAY</span>}
        </div>
        <p className="text-xs text-slate-600">{exercise.activity} · {exercise.duration}</p>
        <p className="text-[11px] text-slate-500">Intensity: {exercise.intensity} · Goal: {exercise.goal}</p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MaternityWellnessPlan() {
  const [activeTab, setActiveTab] = useState<"food" | "exercise" | "sleep">("food");

  const foodData = useMemo(() => {
    const cards: Record<Meal, FoodCard> = {
      breakfast: { meal: "breakfast", emoji: "🌅", items: [
        { title: "Oatmeal with berries", reason: "Provides complex carbs for morning energy and fiber" },
        { title: "Eggs or paneer", reason: "Protein support for baby's tissue development" }
      ] },
      lunch: { meal: "lunch", emoji: "☀️", items: [
        { title: "Dark leafy greens", reason: "Folate to support neural tube development" },
        { title: "Lean protein (chicken/tofu/lentils)", reason: "Sustained energy and iron absorption" }
      ] },
      snacks: { meal: "snacks", emoji: "🍎", items: [
        { title: "Greek yogurt & walnuts", reason: "Calcium for bone health and Omega-3s" },
        { title: "Fresh fruit", reason: "Natural vitamins and hydration" }
      ] },
      dinner: { meal: "dinner", emoji: "🌙", items: [
        { title: "Salmon or flaxseeds", reason: "DHA support for baby's brain development" },
        { title: "Sweet potatoes", reason: "Vitamin A and gentle digestion before bed" }
      ] }
    };
    const alerts: string[] = ["Ensure all meats and eggs are fully cooked.", "Wash all fruits and vegetables thoroughly.", "Limit caffeine to 200mg per day."];
    return { cards: Object.values(cards), alerts, banner: null };
  }, []);

  const exerciseData = useMemo(() => {
    const plan: ExerciseDay[] = [
      { day: "Monday", activity: "Prenatal Yoga", duration: "25 min", intensity: "low", goal: "Flexibility & Breath" },
      { day: "Tuesday", activity: "Brisk Walk", duration: "30 min", intensity: "moderate", goal: "Cardio & Circulation" },
      { day: "Wednesday", activity: "Pelvic Floor Exercises", duration: "15 min", intensity: "low", goal: "Strength" },
      { day: "Thursday", activity: "Swimming / Walk", duration: "30 min", intensity: "moderate", goal: "Low-impact Cardio" },
      { day: "Friday", activity: "Prenatal Stretching", duration: "20 min", intensity: "low", goal: "Relieve back pain" },
      { day: "Saturday", activity: "Nature Walk", duration: "40 min", intensity: "moderate", goal: "Mood & Stamina" },
      { day: "Sunday", activity: "Rest & Meditation", duration: "20 min", intensity: "low", goal: "Recovery" },
    ];
    const notes: string[] = [
      "Always listen to your body and rest if you feel fatigued.",
      "Stay hydrated before, during, and after exercise.",
      "Avoid exercises that require lying flat on your back after the first trimester.",
      "Stop immediately if you feel dizzy or experience any pain."
    ];
    return { plan, notes, banner: null };
  }, []);

  const sleepData = useMemo(() => {
    const tips: SleepTip[] = [
      { title: "Sleep on your side", description: "The left side is best for blood flow to the baby and your kidneys.", priority: "high" },
      { title: "Use pregnancy pillows", description: "Place one between your knees and under your belly for support.", priority: "high" },
      { title: "Hydrate early", description: "Drink most of your water earlier in the day to reduce midnight bathroom trips.", priority: "medium" },
      { title: "Cool bedroom", description: "Pregnancy increases body temperature; keep the room cool and well-ventilated.", priority: "medium" },
      { title: "Avoid heartburn triggers", description: "Eat dinner 2-3 hours before bed and avoid spicy/acidic foods late at night.", priority: "medium" },
    ];
    return { tips, banner: null };
  }, []);

  const todayDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

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
        <div className="animate-fadeIn space-y-5">
          {/* Meal grid */}
          <div>
            <h2 className="text-sm font-bold text-slate-700 mb-3 px-1">🍽️ Your Daily Meal Plan</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {foodData.cards.map((card) => (
                <FoodCardView key={card.meal} card={card} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-3">Maternity Nutrition Alerts</h2>
            <div className="space-y-2">{foodData.alerts.map((a) => <p key={a} className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-2">{a}</p>)}</div>
            <p className="text-[11px] text-slate-500 mt-3">Follow your doctor's specific dietary advice.</p>
          </div>
        </div>
      )}

      {/* ───── Exercise Tab ───── */}
      {activeTab === "exercise" && (
        <div className="animate-fadeIn space-y-5">
          <div className="bg-purple-50 rounded-2xl border border-purple-200 p-4">
            <h2 className="text-sm font-bold text-purple-800 mb-2">💡 Maternity Exercise Notes</h2>
            <ul className="space-y-1.5">
              {exerciseData.notes.map((note, i) => (
                <li key={i} className="text-xs text-purple-700 flex items-start gap-2">
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
              {exerciseData.plan.map((exercise) => (
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
          <BreathingExercise />

          {/* Sleep tips */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-700 mb-4">💤 Pregnancy Sleep Tips</h2>
            <div className="space-y-3">
              {sleepData.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/50 border border-purple-100 transition-all hover:shadow-sm"
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">✨</span>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{tip.title} {tip.priority === "high" ? "• High priority" : ""}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
