import { useState, useMemo, useEffect, useRef } from "react";
import { Apple, Dumbbell, Moon, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import { buildMenopauseUserContext } from "@/lib/menopausePersonalization";

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
            <span className="text-amber-400 mt-0.5">•</span>
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
      isToday ? "border-amber-300 bg-amber-50 shadow-sm" : "border-slate-200 bg-white"
    )}>
      <span className="text-2xl">{exercise.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800">{exercise.day}</p>
          {isToday && <span className="text-[10px] px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full font-bold">TODAY</span>}
        </div>
        <p className="text-xs text-slate-600">{exercise.activity} · {exercise.duration}</p>
        <p className="text-[11px] text-slate-500">Intensity: {exercise.intensity} · Goal: {exercise.goal}</p>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function WellnessPlan() {
  const { profile, logs } = useMenopause();
  const [activeTab, setActiveTab] = useState<"food" | "exercise" | "sleep">("food");
  const ctx = useMemo(() => (profile ? buildMenopauseUserContext(profile, logs) : null), [profile, logs]);

  const foodData = useMemo(() => {
    if (!ctx) return { cards: [], alerts: [], banner: null as string | null };
    const cards: Record<Meal, FoodCard> = {
      breakfast: { meal: "breakfast", emoji: "🌅", items: [] },
      lunch: { meal: "lunch", emoji: "☀️", items: [] },
      dinner: { meal: "dinner", emoji: "🌙", items: [] },
      snacks: { meal: "snacks", emoji: "🍎", items: [] },
    };
    const alerts: string[] = [];
    let banner: string | null = null;
    const add = (meal: Meal, title: string, reason: string) => cards[meal].items.push({ title, reason });

    add("breakfast", "Tofu / soy milk / flaxseeds", "Phytoestrogens may support estrogen transition");
    add("lunch", "Calcium foods (dairy or fortified milk, ragi, sesame)", "Supports bone protection during menopause");
    add("snacks", "Turmeric + ginger + berries + leafy greens", "Anti-inflammatory baseline for symptoms");
    add("dinner", "Hydration target 8-10 glasses", "Helps heat symptoms, fatigue, and dryness");
    add("snacks", "Vitamin D support + sunlight", "Improves calcium absorption");

    if (ctx.diet === "veg") {
      add("breakfast", "Lentils/chickpeas/rajma/tofu/paneer", "Plant proteins support muscle and energy");
      add("snacks", "B12 fortified cereal/dairy/nutritional yeast", "B12 support is important in vegetarian pattern");
      add("lunch", "Spinach/dates/ragi/jaggery + vitamin C", "Iron absorption and fatigue support");
    } else if (ctx.diet === "mixed") {
      add("lunch", "Salmon/mackerel 2x weekly", "Omega-3 supports joints and heart");
      add("breakfast", "Eggs", "Protein and vitamin D support");
      add("dinner", "Lean chicken/turkey", "Tryptophan may support sleep quality");
    } else {
      add("breakfast", "Swap white bread to multigrain", "Gentle step for steady energy");
      add("snacks", "Add one fruit to current snack", "Easy micronutrient upgrade");
      add("dinner", "One small change at a time", "You are doing great");
    }

    if (ctx.conditions.includes("thyroid")) alerts.push("Cook cruciferous vegetables; add selenium and iodine sources.");
    if (ctx.conditions.includes("diabetes")) alerts.push("Prefer low-GI meals, 5-6 smaller meals, and check with doctor before major diet changes.");
    if (ctx.conditions.includes("hypertension")) alerts.push("Reduce sodium, add potassium foods, and use DASH pattern.");
    if (ctx.familyHistory.includes("osteoporosis")) {
      alerts.unshift("Bone health is a priority for you.");
      add("breakfast", "Ragi porridge / sesame chutney / dairy", "3x daily calcium supports bone goals");
    }

    if (ctx.avgHotFlash > 3) { alerts.push("Avoid caffeine, alcohol, spicy food, and hot drinks; choose cooling foods."); banner = "Your hot flashes are worsening - plan updated."; }
    if (ctx.avgNightSweats > 3) alerts.push("Keep dinner light and early, avoid alcohol, add evening magnesium snack.");
    if (ctx.avgJointPain > 3) { alerts.push("Prioritize anti-inflammatory foods and vitamin C rich choices."); banner = "Your joint pain has increased recently - we've updated your food plan."; }
    if (ctx.avgHeadache > 3) alerts.push("Hydration target: 10-12 glasses/day; avoid MSG/alcohol and keep regular meals.");
    if (ctx.avgAnxiety > 3) alerts.push("Add calming foods, probiotics, and reduce caffeine.");
    if (ctx.avgVaginalDryness > 2) alerts.push("Prioritize phytoestrogens, omega-3, vitamin E, and hydration.");
    if (ctx.avgMood < 3) alerts.push("Mood support foods: walnuts, berries, leafy greens, legumes, tryptophan sources.");
    if (ctx.avgSleep < 6) alerts.push("Avoid heavy dinners near bedtime and caffeine after 2 PM.");
    if (ctx.avgFatigue > 3) alerts.push("Energy support: iron + B12 + complex carbs, avoid sugar spikes.");

    return { cards: Object.values(cards), alerts, banner };
  }, [ctx]);

  const exerciseData = useMemo(() => {
    if (!ctx) return { plan: [], notes: [], banner: null as string | null };
    const plan: ExerciseDay[] = [
      { day: "Monday", activity: "Brisk walk", duration: "30 min", intensity: "moderate", goal: "Cardio" },
      { day: "Tuesday", activity: "Strength training", duration: "25 min", intensity: "moderate", goal: "Bone" },
      { day: "Wednesday", activity: "Yoga + mobility", duration: "30 min", intensity: "low", goal: "Flexibility" },
      { day: "Thursday", activity: "Cycling / walk", duration: "30 min", intensity: "moderate", goal: "Cardio" },
      { day: "Friday", activity: "Resistance bands", duration: "25 min", intensity: "moderate", goal: "Strength" },
      { day: "Saturday", activity: "Nature walk", duration: "30 min", intensity: "low", goal: "Mood" },
      { day: "Sunday", activity: "Rest + stretch", duration: "20 min", intensity: "low", goal: "Recovery" },
    ];
    const notes: string[] = ["150 min/week moderate activity baseline", "Strength x2 and flexibility x2 weekly baseline"];
    let banner: string | null = null;
    if (ctx.avgJointPain > 3 || ctx.symptoms.jointPain >= 3) {
      notes.push("LOW IMPACT ONLY: swimming, yoga, walking, cycling, chair exercises.");
      plan.forEach((d) => { d.intensity = "low"; d.duration = "20 min"; });
      banner = "Your joint pain has increased - exercise plan adjusted to protect your joints.";
    }
    if (ctx.avgFatigue > 3 || ctx.symptoms.fatigue >= 4) {
      notes.push("Short sessions (15-20 min), morning preferred, and 2 rest days/week.");
      plan.forEach((d) => { if (d.day !== "Sunday") d.duration = "15-20 min"; });
      banner = "Fatigue has been higher recently - we have lightened your exercise schedule.";
    }
    if (ctx.avgAnxiety > 3) notes.push("Prioritize mindful movement and add 5-min breathing cooldown each session.");
    if (ctx.avgHeadache > 3) notes.push("Avoid high intensity cardio; add neck/shoulder stretching daily and hydrate.");
    if (ctx.avgHotFlash > 3 || ctx.avgNightSweats > 3) notes.push("Exercise in cool environment, early morning preferred.");
    if (ctx.avgVaginalDryness > 2) notes.push("Add pelvic floor (Kegels) daily and hip-opening yoga.");
    if (ctx.conditions.includes("hypertension")) notes.push("Avoid heavy lifting/breath-holding; stop if dizzy or short of breath.");
    if (ctx.conditions.includes("diabetes")) notes.push("Post-meal 15-20 min walk daily and resistance bands 3x/week.");
    if (ctx.familyHistory.includes("osteoporosis")) notes.push("Weight-bearing exercise every day and dedicated bone-health moves.");
    if (ctx.avgMood < 3 || ctx.moodTrend === "worsening") notes.push("Mood-lifting movement (dance, outdoor walk, group yoga) promoted.");
    return { plan, notes, banner };
  }, [ctx]);

  const sleepData = useMemo(() => {
    if (!ctx) return { tips: [], banner: null as string | null };
    const tips: SleepTip[] = [
      { title: "Consistent sleep-wake schedule", description: "Keep wake time fixed daily", priority: "medium" },
      { title: "No screens 1 hour before bed", description: "Reduces alertness and supports melatonin", priority: "medium" },
      { title: "Dark, quiet, cool room", description: "Basic sleep environment support", priority: "medium" },
      { title: "Avoid caffeine after 2 PM", description: "Limits nighttime stimulation", priority: "medium" },
    ];
    let banner: string | null = null;
    const addHigh = (title: string, description: string) => tips.unshift({ title, description, priority: "high" });
    if (ctx.avgNightSweats > 3) addHigh("Cooling sleep environment", "Breathable bedding, 18-20 C room, moisture-wicking sleepwear, water at bedside.");
    if (ctx.avgHotFlash > 3) addHigh("Cool down before bed", "Lukewarm shower, light layers, avoid heavy meals and alcohol.");
    if (ctx.avgAnxiety > 3) addHigh("Anxiety wind-down", "4-7-8 breathing, progressive relaxation, journaling, avoid stressful media.");
    if (ctx.avgHeadache > 3) tips.push({ title: "Headache-aware sleep", description: "Back sleeping, lavender pillow spray, evening magnesium foods.", priority: "medium" });
    if (ctx.avgVaginalDryness > 2) tips.push({ title: "Night comfort support", description: "Cotton fabrics, hydration, gentle pelvic floor relaxation.", priority: "medium" });
    if (ctx.avgJointPain > 3) tips.push({ title: "Joint comfort setup", description: "Pillow between knees, warm compress, light mobility before bed.", priority: "medium" });
    if (ctx.avgSleep < 5) addHigh("Sleep reset basics", "Fixed wake time, avoid long naps, leave bed if awake over 20 minutes.");
    if (ctx.avgFatigue > 3) tips.push({ title: "Fatigue vs sleepiness", description: "Short naps only (10-20 min before 3 PM).", priority: "medium" });
    if (ctx.conditions.includes("thyroid")) tips.push({ title: "Thyroid note", description: "Persistent sleep issues should be discussed with doctor.", priority: "medium" });
    if (ctx.sleepTrend === "worsening") banner = "Your sleep quality has declined recently - prioritised tips are shown first.";
    if (ctx.anxietyTrend === "worsening") banner = "Anxiety has been higher this week - extra wind-down support added.";
    return { tips, banner };
  }, [ctx]);

  const todayDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];

  if (!profile || !ctx) {
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
            <p className="text-xs text-slate-500">Personalised from your last 14 days of logs</p>
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
            {foodData.banner ? <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">{foodData.banner}</div> : null}

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
              <h2 className="text-sm font-bold text-slate-700 mb-3">Targeted Alerts</h2>
              <div className="space-y-2">{foodData.alerts.map((a) => <p key={a} className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-2">{a}</p>)}</div>
              <p className="text-[11px] text-slate-500 mt-3">Last updated: {new Date().toLocaleDateString("en-IN")} · Based on your last 14 days</p>
            </div>
          </div>
        )}

        {/* ───── Exercise Tab ───── */}
        {activeTab === "exercise" && (
          <div className="animate-fadeIn space-y-5">
            {exerciseData.banner ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{exerciseData.banner}</div> : null}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
              <h2 className="text-sm font-bold text-amber-800 mb-2">💡 Your Exercise Notes</h2>
              <ul className="space-y-1.5">
                {exerciseData.notes.map((note, i) => (
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
            {sleepData.banner ? <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700">{sleepData.banner}</div> : null}
            {/* Breathing exercise */}
            {ctx.avgAnxiety > 3 && <BreathingExercise />}

            {/* Sleep tips */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">💤 Your Sleep Tips</h2>
              <div className="space-y-3">
                {sleepData.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 transition-all hover:shadow-sm"
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">{tip.emoji}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{tip.title} {tip.priority === "high" ? "• High priority" : ""}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{tip.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-3">Last updated: {new Date().toLocaleDateString("en-IN")} · Based on your last 14 days</p>
            </div>
            {ctx.avgAnxiety <= 3 && <BreathingExercise />}
          </div>
        )}
      </div>
    </div>
  );
}
