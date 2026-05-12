import { useMemo } from "react";
import { useHealthLog, calcFertileWindow, calcAverageCycleLength, type PubertyEntry } from "@/hooks/useHealthLog";
import { useAuth } from "@/hooks/useAuth";
import {
  Moon, Brain, Sparkles, Droplets, Heart, Activity,
  Sunrise,
} from "lucide-react";

interface Tip {
  id: string;
  title: string;
  desc: string;
}

interface Section {
  id: string;
  emoji: string;
  icon: typeof Heart;
  title: string;
  bg: string;
  iconBg: string;
  iconColor: string;
  tips: Tip[];
}

// ─── Data helpers ────────────────────────────────────────────────────────────

function getCyclePhaseLabel(logs: Record<string, any>): string {
  const periodDates = Object.entries(logs)
    .filter(([, e]) => e.phase === "puberty" && (e as PubertyEntry).periodStarted && !(e as PubertyEntry)._periodAutoMarked)
    .map(([d]) => d)
    .sort((a, b) => b.localeCompare(a));
  const lastPeriod = periodDates[0];
  if (!lastPeriod) return "";
  const avg = calcAverageCycleLength(logs as any);
  if (!avg) return "";
  const fertile = calcFertileWindow(lastPeriod, avg);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lp = new Date(lastPeriod);
  lp.setHours(0, 0, 0, 0);
  const daysSince = Math.round((today.getTime() - lp.getTime()) / 86400000);
  if (daysSince < 0) return "";
  const todayStr = today.toISOString().slice(0, 10);
  if (fertile && todayStr >= fertile.fertileStart && todayStr <= fertile.fertileEnd) return "Ovulatory Phase";
  if (daysSince < 5) return "Menstrual Phase";
  if (fertile && todayStr < fertile.fertileStart) return "Follicular Phase";
  return "Luteal Phase";
}

function getPubertyStatus(fullProfile: any): string {
  const cat = fullProfile?.onboardingData?.pubertyData?.menarche_category;
  if (cat === "Early Puberty" || cat === "Late Puberty" || cat === "Normal") return cat;
  return "";
}

// ─── Section generators ──────────────────────────────────────────────────────

function buildDailyRoutine(logs: Record<string, any>, cyclePhase: string): Section | null {
  const tips: Tip[] = [];
  const id = "daily-routine";

  const isLowEnergy = cyclePhase === "Menstrual Phase" || cyclePhase === "Luteal Phase";
  const isHighEnergy = cyclePhase === "Follicular Phase" || cyclePhase === "Ovulatory Phase";

  if (isLowEnergy) {
    tips.push({ id: "low-energy-pace", title: "Pace Your Day", desc: "You may feel lower energy today. Prioritize hydration, shorter work sessions, and rest when needed." });
    tips.push({ id: "screen-breaks", title: "Screen-Time Breaks", desc: "Take a 5-minute break every 30 minutes to reduce eye strain and mental fatigue." });
  } else if (isHighEnergy) {
    tips.push({ id: "high-energy-plan", title: "Plan Active Hours", desc: "Your energy is naturally higher. Schedule focused work, study, or creative tasks for peak hours." });
    tips.push({ id: "hydration-schedule", title: "Hydration Schedule", desc: "Keep a water bottle at your desk. Aim for a glass every hour to maintain your energy." });
  } else {
    tips.push({ id: "general-routine", title: "Balanced Routine", desc: "Start your day with a glass of water and 5 minutes of stretching to set a positive tone." });
    tips.push({ id: "screen-time", title: "Screen-Time Balance", desc: "Limit recreational screen time to 1 hour before bed for better sleep quality." });
  }

  if (tips.length === 0) return null;
  return { id, emoji: "🌅", icon: Sunrise, title: "Daily Routine", bg: "bg-amber-50/70 border-amber-200", iconBg: "bg-amber-100", iconColor: "text-amber-600", tips };
}

function buildSleepGuidance(logs: Record<string, any>, cyclePhase: string): Section | null {
  const tips: Tip[] = [];
  const id = "sleep-wellness";

  const hasFatigue = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.fatigue);
  const hasAnxiety = Object.values(logs).some((e: any) => e.phase === "puberty" && (e.symptoms?.anxiety || e.symptoms?.moodSwings));
  const hasHeadache = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.headache);
  const hasSleepIssues = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.sleepIssues);

  if (hasFatigue || hasSleepIssues) {
    tips.push({ id: "sleep-duration", title: "Optimal Sleep Duration", desc: "Your body needs 8–9 hours during puberty. Aim to be in bed for at least 8.5 hours each night." });
    tips.push({ id: "bedtime-reminder", title: "Consistent Bedtime", desc: "Going to bed at the same time nightly trains your internal clock for deeper, more restorative sleep." });
  }
  if (hasAnxiety) {
    tips.push({ id: "calming-routine", title: "Calming Nighttime Routine", desc: "Try a warm bath, light reading, or gratitude journaling 30 minutes before bed to ease anxious thoughts." });
  }
  if (hasHeadache) {
    tips.push({ id: "reduce-caffeine", title: "Reduce Caffeine", desc: "Caffeine can trigger headaches and disrupt sleep. Try herbal tea or warm milk instead of coffee after 4 PM." });
  }
  if (tips.length === 0 && cyclePhase) {
    tips.push({ id: "phase-sleep", title: "Phase-Aware Rest", desc: cyclePhase === "Luteal Phase" ? "The luteal phase can disrupt sleep. A cool, dark room and white noise may help you stay asleep." : "Maintain a consistent wind-down routine for steady sleep throughout your cycle." });
  }

  if (tips.length === 0) return null;
  return { id, emoji: "😴", icon: Moon, title: "Sleep Wellness", bg: "bg-indigo-50/70 border-indigo-200", iconBg: "bg-indigo-100", iconColor: "text-indigo-600", tips };
}

function buildStressManagement(logs: Record<string, any>, cyclePhase: string): Section | null {
  const tips: Tip[] = [];
  const id = "stress-management";

  const hasMoodSwings = Object.values(logs).some((e: any) => e.phase === "puberty" && (e.symptoms?.moodSwings || e.symptoms?.irritability));
  const hasAnxiety = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.anxiety);
  const isLuteal = cyclePhase === "Luteal Phase";

  if (hasMoodSwings || hasAnxiety || isLuteal) {
    tips.push({ id: "deep-breathing", title: "5-Minute Deep Breathing", desc: "Inhale for 4 counts, hold for 7, exhale for 8. Repeat 3 times to activate your parasympathetic nervous system." });
    tips.push({ id: "journaling", title: "Journaling Prompt", desc: "Write down three things you're grateful for and one thing you accomplished today. This shifts focus to the positive." });
  }
  if (hasAnxiety) {
    tips.push({ id: "calming-activity", title: "Calming Activities", desc: "Listen to soft instrumental music, color in a mandala, or step outside for 5 minutes of fresh air." });
  }
  if (isLuteal && !hasMoodSwings && !hasAnxiety) {
    tips.push({ id: "luteal-stress", title: "Luteal Phase Calm", desc: "Your body is in the luteal phase. Prioritize relaxing activities and avoid overcommitting to social obligations." });
  }
  if (tips.length === 0) {
    tips.push({ id: "general-stress", title: "Daily Stress Check", desc: "Take 2 minutes to check in with yourself. How are you feeling right now? A simple pause can reset your mood." });
  }

  return { id, emoji: "🧘", icon: Brain, title: "Stress Management", bg: "bg-purple-50/70 border-purple-200", iconBg: "bg-purple-100", iconColor: "text-purple-600", tips };
}

function buildPhysicalActivity(logs: Record<string, any>, cyclePhase: string, conditions: string[]): Section | null {
  const tips: Tip[] = [];
  const id = "physical-activity";

  const hasCramps = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.cramps);
  const hasFatigue = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.fatigue);
  const hasBackPain = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.backPain);
  const isMenstrual = cyclePhase === "Menstrual Phase";
  const isFollicular = cyclePhase === "Follicular Phase";
  const isOvulatory = cyclePhase === "Ovulatory Phase";
  const isLuteal = cyclePhase === "Luteal Phase";
  const hasPCOS = conditions.some(c => c === "PCOS" || c === "PCOD");
  const hasAnemia = conditions.some(c => c === "Anemia");

  if (isMenstrual || hasCramps) {
    tips.push({ id: "menstrual-movement", title: "Gentle Movement", desc: "Light stretching, yoga (child's pose, cat-cow), or a slow walk can ease cramps without straining your body." });
  } else if (isFollicular || isOvulatory) {
    tips.push({ id: "active-phase", title: "Active Phase Workout", desc: "Your energy peaks now. Try brisk walking, cycling, dancing, or strength training for 30-40 minutes." });
  } else if (isLuteal) {
    tips.push({ id: "luteal-movement", title: "Moderate Movement", desc: "Pilates, swimming, or moderate walking supports your body during the luteal phase without overexertion." });
  } else if (hasFatigue) {
    tips.push({ id: "fatigue-movement", title: "Low-Energy Activity", desc: "A 10-minute walk or gentle stretching can boost circulation and energy without draining you further." });
  }

  if (hasBackPain) {
    tips.push({ id: "back-pain-relief", title: "Back Pain Relief", desc: "Try gentle twists, knee-to-chest stretches, and using a small pillow for lower back support while sitting." });
  }
  if (hasPCOS) {
    tips.push({ id: "pcos-activity", title: "PCOS-Friendly Activity", desc: "Consistent moderate exercise like brisk walking or swimming for 30 minutes, 5 days a week, helps manage insulin levels." });
  }
  if (hasAnemia) {
    tips.push({ id: "anemia-activity", title: "Anemia-Conscious Movement", desc: "Light walking and gentle stretching are best. Avoid高强度 workouts until your energy levels improve." });
  }
  if (tips.length === 0) {
    tips.push({ id: "general-activity", title: "Daily Movement", desc: "Aim for 20-30 minutes of physical activity daily. Walking, dancing, or playing a sport counts!" });
  }

  return { id, emoji: "🏃", icon: Activity, title: "Physical Activity", bg: "bg-emerald-50/70 border-emerald-200", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", tips: tips.slice(0, 2) };
}

function buildHydrationGuidance(logs: Record<string, any>): Section | null {
  const tips: Tip[] = [];
  const id = "hydration";

  const hasHeadache = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.headache);
  const hasBloating = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.bloating);
  const hasFatigue = Object.values(logs).some((e: any) => e.phase === "puberty" && e.symptoms?.fatigue);

  if (hasHeadache && hasBloating) {
    tips.push({ id: "headache-bloat", title: "Hydration for Headache & Bloating", desc: "Increased hydration helps both. Aim for 8-10 glasses of water today, and sip herbal teas like peppermint or ginger." });
  } else if (hasHeadache) {
    tips.push({ id: "headache-water", title: "Hydration for Headaches", desc: "Headaches often signal dehydration. Start your day with a full glass of water and keep sipping through the day." });
  } else if (hasBloating) {
    tips.push({ id: "bloat-water", title: "Hydration for Bloating", desc: "Drinking enough water helps flush excess sodium. Add cucumber or lemon slices for a refreshing twist." });
  } else if (hasFatigue) {
    tips.push({ id: "fatigue-water", title: "Hydration for Energy", desc: "Fatigue often links to dehydration. Aim for 8 glasses of water daily and include hydrating foods like watermelon and cucumber." });
  } else {
    tips.push({ id: "general-water", title: "Daily Hydration Goal", desc: "Aim for 6-8 glasses of water today. Keep a bottle nearby as a reminder to sip regularly." });
  }

  return { id, emoji: "💧", icon: Droplets, title: "Hydration Guidance", bg: "bg-sky-50/70 border-sky-200", iconBg: "bg-sky-100", iconColor: "text-sky-600", tips };
}

function buildConditionGuidance(conditions: string[]): Section | null {
  const tips: Tip[] = [];
  const id = "condition-specific";

  if (conditions.includes("PCOS") || conditions.includes("PCOD")) {
    tips.push({ id: "pcos-exercise", title: "Regular Exercise", desc: "Consistent moderate activity like brisk walking or swimming helps manage weight and insulin levels with PCOS/PCOD." });
    tips.push({ id: "pcos-stress", title: "Stress Reduction", desc: "Chronic stress can worsen PCOS. Incorporate daily relaxation like deep breathing or gentle yoga." });
    tips.push({ id: "pcos-sleep", title: "Sleep Consistency", desc: "Irregular sleep affects hormone balance. Aim for 7-8 hours at the same time each night." });
  }
  if (conditions.includes("Hypothyroidism")) {
    tips.push({ id: "hypo-energy", title: "Energy Management", desc: "Listen to your body and pace yourself. Short rest periods between activities can prevent energy crashes." });
    tips.push({ id: "hypo-movement", title: "Moderate Movement", desc: "Gentle walking, yoga, or swimming for 20-30 minutes helps boost metabolism without overstraining." });
    tips.push({ id: "hypo-sleep", title: "Sleep Support", desc: "Consistent sleep is essential for thyroid function. Aim for 7-8 hours at the same time nightly." });
  }
  if (conditions.includes("Hyperthyroidism")) {
    tips.push({ id: "hyper-stress", title: "Stress Reduction", desc: "Hyperthyroidism can cause restlessness. Calming practices like meditation and gentle breathing help." });
    tips.push({ id: "hyper-hydrate", title: "Stay Hydrated", desc: "Hyperthyroidism raises fluid needs. Sip water consistently through the day." });
  }
  if (conditions.includes("Diabetes")) {
    tips.push({ id: "diabetes-meal", title: "Meal Timing", desc: "Eating at regular intervals helps maintain stable blood sugar levels throughout the day." });
    tips.push({ id: "diabetes-movement", title: "Daily Movement", desc: "Regular walking or light activity after meals helps improve insulin sensitivity." });
    tips.push({ id: "diabetes-hydrate", title: "Hydration", desc: "Proper hydration supports kidney function and helps regulate blood sugar levels." });
  }
  if (conditions.includes("Osteoporosis")) {
    tips.push({ id: "osteo-posture", title: "Posture Guidance", desc: "Good posture reduces spinal strain. Practice sitting tall with shoulders relaxed and core engaged." });
    tips.push({ id: "osteo-mobility", title: "Mobility Exercises", desc: "Gentle stretching and balance exercises like tai chi can improve stability and prevent falls." });
    tips.push({ id: "osteo-bone", title: "Bone-Supportive Habits", desc: "Weight-bearing activities like walking or stair climbing support bone density." });
  }
  if (conditions.includes("Anemia")) {
    tips.push({ id: "anemia-rest", title: "Rest & Pace Yourself", desc: "Fatigue from anemia is real. Take short breaks between tasks and prioritize early bedtimes." });
    tips.push({ id: "anemia-movement", title: "Gentle Daily Movement", desc: "Light walking or stretching can improve circulation without draining your energy reserves." });
  }

  if (tips.length === 0) return null;
  return { id, emoji: "🫀", icon: Heart, title: "Condition-Specific Guidance", bg: "bg-rose-50/70 border-rose-200", iconBg: "bg-rose-100", iconColor: "text-rose-600", tips: tips.slice(0, 3) };
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PubertyWellnessPlan() {
  const { logs } = useHealthLog();
  const { fullProfile } = useAuth();

  const cyclePhase = useMemo(() => getCyclePhaseLabel(logs), [logs]);
  const pubertyStatus = getPubertyStatus(fullProfile);
  const conditions: string[] = (fullProfile as any)?.health?.medicalConditions ?? [];

  const sections = useMemo(() => {
    const result: Section[] = [];

    const routine = buildDailyRoutine(logs, cyclePhase);
    if (routine) result.push(routine);

    const sleep = buildSleepGuidance(logs, cyclePhase);
    if (sleep) result.push(sleep);

    const stress = buildStressManagement(logs, cyclePhase);
    if (stress) result.push(stress);

    const activity = buildPhysicalActivity(logs, cyclePhase, conditions);
    if (activity) result.push(activity);

    const hydration = buildHydrationGuidance(logs);
    if (hydration) result.push(hydration);

    const condition = buildConditionGuidance(conditions);
    if (condition) result.push(condition);

    return result;
  }, [logs, cyclePhase, conditions]);

  const hasAnyLogs = Object.values(logs).some((e: any) => e.phase === "puberty");

  return (
    <div className="bg-transparent space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-md shadow-purple-200">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Your Daily Wellness Assistant</h1>
          <p className="text-xs text-slate-500">Personalized lifestyle guidance based on your health profile</p>
        </div>
      </div>

      {(cyclePhase || pubertyStatus) && (
        <div className="flex flex-wrap gap-2">
          {cyclePhase && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full border border-purple-200 bg-purple-50 text-purple-700 px-3 py-1">
              🌸 {cyclePhase}
            </span>
          )}
          {pubertyStatus && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full border border-amber-200 bg-amber-50 text-amber-700 px-3 py-1">
              📈 {pubertyStatus}
            </span>
          )}
          {conditions.length > 0 && conditions.slice(0, 2).map((c) => (
            <span key={c} className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-3 py-1">
              🩺 {c}
            </span>
          ))}
        </div>
      )}

      {!hasAnyLogs && sections.length === 0 ? (
        <div className="flex items-start gap-3 p-5 rounded-xl bg-blue-50 border border-blue-200">
          <Heart className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Complete your wellness profile to receive personalized lifestyle recommendations.</p>
            <p className="text-xs text-blue-600 mt-1">Log your symptoms, conditions, and cycle data in the Calendar and Profile sections to unlock tailored lifestyle guidance.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className={`rounded-2xl border ${section.bg} p-5 shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${section.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${section.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">{section.emoji} {section.title}</h2>
                  </div>
                </div>
                <div className="space-y-3">
                  {section.tips.map((tip) => (
                    <div key={tip.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/70 border border-border/50">
                      <div className="w-1.5 h-full min-h-[2rem] rounded-full bg-current shrink-0 mt-0.5" style={{ opacity: 0.3 }} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{tip.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
