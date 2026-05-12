import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useHealthLog, calcFertileWindow, type PubertyEntry } from "@/hooks/useHealthLog";
import ScrollReveal from "@/components/ScrollReveal";
import {
  CalendarDays, CheckCircle2, AlertTriangle, Clock, Sparkles,
  Leaf, Stethoscope, Shield, Activity, Heart, Moon, Apple, Bell
} from "lucide-react";

function addDays(date: Date, days: number): Date {
  const r = new Date(date); r.setDate(r.getDate() + days); return r;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Daily Guidance Hero ──────────────────────────────────────────────────────

function DailyGuidanceCard({ hasData, nextPeriod, avgCycle, currentPhase }: {
  hasData: boolean; nextPeriod: Date | null; avgCycle: number | null; currentPhase: string;
}) {
  const today = new Date();
  const cycleDay = nextPeriod
    ? Math.ceil((nextPeriod.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) % (avgCycle || 28)
    : null;

  let emoji = "📊";
  let headline = "Track Your Cycle";
  let message = "Log your periods in the Calendar to unlock personalized daily insights.";
  let tone: "info" | "positive" | "neutral" | "follicular" | "luteal" = "info";

  if (hasData && cycleDay !== null) {
    const fertileWindow = avgCycle ? cycleDay >= (avgCycle - 19) && cycleDay <= (avgCycle - 10) : false;
    if (cycleDay <= 5) {
      emoji = "🩸"; headline = "You're in your Menstrual Phase"; message = "Rest when needed, stay hydrated with warm fluids, and consider iron-rich foods like spinach and lentils."; tone = "caution" as any;
    } else if (fertileWindow) {
      emoji = "🌱"; headline = "You're in your Ovulatory Phase"; message = "Your body is preparing for ovulation. This is a great time for light activity and nourishing meals."; tone = "positive";
    } else if (cycleDay <= 14) {
      emoji = "☀️"; headline = "You're in your Follicular Phase"; message = "Energy levels are rising. Focus on protein-rich meals and gentle movement."; tone = "follicular";
    } else {
      emoji = "🌙"; headline = "You're in your Luteal Phase"; message = "Your body is in the second half of the cycle. Prioritize rest, complex carbs, and stress management."; tone = "luteal";
    }
  }

  const toneStyles: Record<string, string> = {
    positive: "from-pink-50 to-rose-50 border-pink-200",
    caution: "from-red-50 to-rose-50 border-red-200",
    follicular: "from-yellow-50 to-amber-50 border-yellow-200",
    luteal: "from-orange-50 to-amber-50 border-orange-200",
    neutral: "from-slate-50 to-gray-50 border-slate-200",
    info: "from-blue-50 to-sky-50 border-blue-200",
  };
  const toneText: Record<string, string> = {
    positive: "text-pink-800", caution: "text-red-800",
    follicular: "text-yellow-800",
    luteal: "text-orange-800",
    neutral: "text-slate-800", info: "text-blue-800",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${toneStyles[tone]} p-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        <span className="text-4xl">{emoji}</span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Today's Guidance
          </p>
          <h3 className={`text-lg font-bold ${toneText[tone]} mb-1`}>{headline}</h3>
          <p className={`text-sm ${toneText[tone]} leading-relaxed opacity-80`}>{message}</p>
          {currentPhase !== "unknown" && (
            <span className={`inline-flex items-center gap-1 mt-2 text-[10px] font-semibold rounded-full border px-2.5 py-0.5 ${
              tone === "caution" ? "border-red-200 bg-red-100 text-red-700" :
              tone === "positive" ? "border-pink-200 bg-pink-100 text-pink-700" :
              tone === "follicular" ? "border-yellow-200 bg-yellow-100 text-yellow-700" :
              tone === "luteal" ? "border-orange-200 bg-orange-100 text-orange-700" :
              "border-blue-200 bg-blue-100 text-blue-700"
            }`}>
              {PHASE_EMOJIS[currentPhase]} {PHASE_LABELS[currentPhase]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cycle Calculator ─────────────────────────────────────────────────────────

function CycleCalculator({ logs }: { logs: Record<string, any> }) {
  const cycleData = useMemo(() => {
    const periodDates = Object.entries(logs)
      .filter(
        ([, e]) =>
          e.phase === "puberty" &&
          (e as PubertyEntry).periodStarted &&
          !(e as PubertyEntry)._periodAutoMarked
      )
      .map(([dateStr]) => dateStr)
      .sort((a, b) => b.localeCompare(a));

    const lastPeriodDate = periodDates.length > 0 ? periodDates[0] : null;
    const avgCycleLength = (() => {
      if (periodDates.length < 2) return null;
      const sorted = [...periodDates].sort((a, b) => a.localeCompare(b));
      const diffs: number[] = [];
      for (let i = 1; i < sorted.length; i++) {
        const d = Math.round(
          (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000
        );
        if (d > 0 && d < 100) diffs.push(d);
      }
      return diffs.length > 0 ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : null;
    })();
    const hasEnoughData = periodDates.length >= 2 && lastPeriodDate && avgCycleLength;

    if (!hasEnoughData) {
      return { lastPeriodDate, avgCycleLength, hasEnoughData: false, periodCount: periodDates.length, nextPeriod: null, fertileWindow: null };
    }

    const nextPeriod = addDays(new Date(lastPeriodDate!), avgCycleLength!);
    const fertileWindow = calcFertileWindow(lastPeriodDate!, avgCycleLength!);

    return {
      lastPeriodDate: lastPeriodDate!,
      avgCycleLength: avgCycleLength!,
      nextPeriod,
      fertileWindow,
      hasEnoughData: true,
      periodCount: periodDates.length,
    };
  }, [logs]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Cycle Insights</h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full border border-slate-200 bg-slate-50 text-slate-600 px-2 py-0.5">
                <Clock className="w-3 h-3" /> {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" })}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Cycle-based predictions from your logged data</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {!cycleData.hasEnoughData ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Not enough cycle history to generate predictions.</p>
              <p className="text-xs text-amber-600 mt-1">
                {cycleData.periodCount === 0
                  ? "Log your first period in the Calendar to start tracking."
                  : cycleData.periodCount === 1
                    ? "Log at least one more period in the Calendar to enable cycle predictions."
                    : "More cycle data is needed. Keep logging your periods regularly."}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 rounded-xl border bg-blue-50 border-blue-200 space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-bold text-blue-900">Your Cycle Predictions</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="text-center p-3.5 rounded-xl border bg-blue-100 border-blue-200">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
                    Last Period
                  </p>
                  <p className="text-sm font-bold text-blue-900">
                    {formatDate(new Date(cycleData.lastPeriodDate))}
                  </p>
                </div>
                <div className="text-center p-3.5 rounded-xl border bg-blue-100 border-blue-200">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
                    Fertile Start
                  </p>
                  <p className="text-sm font-bold text-blue-900">
                    {formatDate(new Date(cycleData.fertileWindow!.fertileStart))}
                  </p>
                </div>
                <div className="text-center p-3.5 rounded-xl border bg-blue-200/70 border-blue-300 ring-2 ring-blue-400/30">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 mb-1.5">
                    <Sparkles className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                    Ovulation Day
                  </p>
                  <p className="text-sm font-bold text-blue-950">
                    {formatDate(new Date(cycleData.fertileWindow!.ovulation))}
                  </p>
                </div>
                <div className="text-center p-3.5 rounded-xl border bg-blue-100 border-blue-200">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
                    Fertile End
                  </p>
                  <p className="text-sm font-bold text-blue-900">
                    {formatDate(new Date(cycleData.fertileWindow!.fertileEnd))}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-blue-200">
                <div className="flex items-center justify-center gap-2 text-xs text-blue-700 flex-wrap">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="font-medium">Next period predicted:</span>
                  <span className="font-bold">{formatDate(cycleData.nextPeriod)}</span>
                  <span className="text-blue-400">|</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">Avg cycle:</span>
                  <span className="font-bold">{cycleData.avgCycleLength} days</span>
                  <span className="text-blue-400">|</span>
                  <span className="font-medium">Periods logged:</span>
                  <span className="font-bold">{cycleData.periodCount}</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-dashed border-current/10">
              ⚕️ Estimate based on a standard 14-day luteal phase. Results may vary. Consult a healthcare professional.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Lifestyle Tips ───────────────────────────────────────────────────────────

const LIFESTYLE_TIPS = [
  { emoji: "🧘‍♀️", title: "Manage Stress", desc: "Practice breathing exercises, yoga, or light meditation daily." },
  { emoji: "😴", title: "Sleep Schedule", desc: "7–9 hours of quality sleep supports hormonal regulation." },
  { emoji: "🥗", title: "Balanced Nutrition", desc: "Eat iron-rich foods, calcium, healthy fats, and complex carbs." },
  { emoji: "🚶‍♀️", title: "Light Activity", desc: "30 minutes of walking or swimming most days to stay active." },
  { emoji: "💬", title: "Emotional Wellbeing", desc: "Talk openly with family or trusted friends about your health." },
  { emoji: "🚭", title: "Avoid Harmful Substances", desc: "Avoid tobacco, alcohol, and excessive caffeine." },
];

function LifestyleGuidance() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-pink-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Lifestyle & Emotional Guidance</h2>
          <p className="text-xs text-muted-foreground">Holistic support for your wellness journey</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {LIFESTYLE_TIPS.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors">
            <span className="text-2xl shrink-0">{tip.emoji}</span>
            <div>
              <p className="text-sm font-semibold">{tip.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Consultation Trigger ─────────────────────────────────────────────────────

function ConsultationTrigger() {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
        <Stethoscope className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-base font-bold text-blue-900 mb-1">👩‍⚕️ Professional Consultation</h2>
        <p className="text-sm text-blue-800 leading-relaxed">
          Consider consulting a healthcare professional for personalized advice about your reproductive health and cycle.
        </p>
        <a href="tel:104" className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition-all active:scale-[0.97]">
          📞 Call 104 for Guidance
        </a>
      </div>
    </div>
  );
}

// ─── Phase detection ─────────────────────────────────────────────────────────

function getCyclePhase(lastPeriodDate: string | null, avgCycleLength: number | null, fertileWindow: { fertileStart: string; fertileEnd: string; ovulation: string } | null): string {
  if (!lastPeriodDate || !avgCycleLength) return "unknown";
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const lp = new Date(lastPeriodDate); lp.setHours(0, 0, 0, 0);
  const daysSince = Math.round((today.getTime() - lp.getTime()) / 86400000);
  if (daysSince < 0) return "unknown";
  const todayStr = today.toISOString().slice(0, 10);
  if (fertileWindow && todayStr >= fertileWindow.fertileStart && todayStr <= fertileWindow.fertileEnd) return "ovulation";
  if (daysSince < 5) return "menstrual";
  if (fertileWindow && todayStr < fertileWindow.fertileStart) return "follicular";
  return "luteal";
}

const PHASE_LABELS: Record<string, string> = {
  menstrual: "Menstrual Phase", follicular: "Follicular Phase",
  ovulation: "Ovulatory Phase", luteal: "Luteal Phase", unknown: "Unknown",
};

const PHASE_EMOJIS: Record<string, string> = {
  menstrual: "🩸", follicular: "🌱", ovulation: "✨", luteal: "🌙", unknown: "💫",
};

const PHASE_SYMPTOMS: Record<string, { label: string; emoji: string; explanation: string }[]> = {
  menstrual: [
    { label: "Cramps", emoji: "🔥", explanation: "Common during menstrual phase due to uterine contractions." },
    { label: "Fatigue", emoji: "😴", explanation: "Energy levels dip as your body sheds the uterine lining." },
    { label: "Lower Energy", emoji: "🔋", explanation: "Hormone levels are at their lowest, reducing stamina." },
    { label: "Bloating", emoji: "🎈", explanation: "Water retention is common in the first few days." },
  ],
  follicular: [
    { label: "Higher Energy", emoji: "⚡", explanation: "Estrogen rises, boosting energy and vitality." },
    { label: "Improved Mood", emoji: "😊", explanation: "Rising estrogen supports serotonin production." },
    { label: "Increased Motivation", emoji: "🚀", explanation: "Your body feels ready to take on challenges." },
  ],
  ovulation: [
    { label: "High Energy", emoji: "⚡", explanation: "Peak estrogen levels give you a natural energy boost." },
    { label: "Increased Confidence", emoji: "💪", explanation: "Hormonal peak supports social confidence." },
    { label: "Mild Cramps", emoji: "🤏", explanation: "Some feel a twinge on one side during egg release." },
    { label: "Social Mood", emoji: "🗣️", explanation: "You may feel more outgoing and communicative." },
  ],
  luteal: [
    { label: "Mood Swings", emoji: "🎭", explanation: "Progesterone rise can affect serotonin and emotions." },
    { label: "Bloating", emoji: "🎈", explanation: "Water retention and slower digestion are common." },
    { label: "Fatigue", emoji: "😴", explanation: "Progesterone has a mild sedative effect." },
    { label: "Food Cravings", emoji: "🍽️", explanation: "Your body may crave carbs and comfort foods." },
    { label: "Irritability", emoji: "😤", explanation: "Hormonal shifts can lower your patience threshold." },
  ],
  unknown: [],
};

// ─── Nutrition Tip Mapping ────────────────────────────────────────────────────

interface NutritionTip {
  emoji: string;
  title: string;
  description: string;
}

const SYMPTOM_NUTRITION_MAP: Record<string, NutritionTip[]> = {
  fatigue: [
    { emoji: "🥬", title: "Iron Support", description: "Your recent fatigue logs suggest increasing iron-rich foods like spinach, lentils, and dates." },
    { emoji: "💧", title: "Hydration Reminder", description: "Fatigue often links to dehydration. Aim for 8 glasses of water daily." },
    { emoji: "🥜", title: "Energy-Boosting Snacks", description: "Nuts, seeds, and bananas provide steady energy throughout the day." },
  ],
  cramps: [
    { emoji: "🥑", title: "Magnesium-Rich Foods", description: "Magnesium helps relax muscles. Try avocados, nuts, and dark leafy greens." },
    { emoji: "🍵", title: "Anti-Inflammatory Warmth", description: "Ginger or chamomile tea can soothe inflammation and ease cramping." },
    { emoji: "🐟", title: "Omega-3 Support", description: "Fatty fish, flaxseeds, and walnuts help reduce prostaglandin-related pain." },
  ],
  bloating: [
    { emoji: "🥒", title: "Low-Sodium Choices", description: "Opt for fresh vegetables and fruits to reduce water retention." },
    { emoji: "🍌", title: "Potassium-Rich Foods", description: "Bananas, sweet potatoes, and papaya help balance fluids." },
    { emoji: "🌿", title: "Digestive Herbs", description: "Fennel tea, peppermint, and cumin aid digestion and reduce bloating." },
  ],
  headache: [
    { emoji: "💧", title: "Hydration First", description: "Headaches often signal dehydration. Start your day with a full glass of water." },
    { emoji: "🥥", title: "Electrolyte Balance", description: "Coconut water and electrolyte-rich drinks can help relieve tension." },
    { emoji: "🍃", title: "Magnesium & B-Vitamins", description: "Leafy greens and whole grains support nerve function and reduce headaches." },
  ],
  moodSwings: [
    { emoji: "🐟", title: "Omega-3 Boost", description: "Salmon, walnuts, and chia seeds support brain health and mood stability." },
    { emoji: "🍵", title: "Calming Teas", description: "Chamomile, lavender, or lemon balm tea can help soothe emotional highs and lows." },
    { emoji: "🍊", title: "Vitamin C & B6", description: "Citrus fruits and bananas help regulate neurotransmitters and energy." },
  ],
  irritability: [
    { emoji: "🐟", title: "Omega-3 Boost", description: "Salmon, walnuts, and chia seeds support brain health and mood stability." },
    { emoji: "🍵", title: "Calming Teas", description: "Chamomile, lavender, or lemon balm tea can help soothe emotional highs and lows." },
    { emoji: "🍊", title: "Vitamin C & B6", description: "Citrus fruits and bananas help regulate neurotransmitters and energy." },
  ],
  anxiety: [
    { emoji: "🐟", title: "Omega-3 Boost", description: "Salmon, walnuts, and chia seeds support brain health and mood stability." },
    { emoji: "🍵", title: "Calming Teas", description: "Chamomile, lavender, or lemon balm tea can help soothe emotional highs and lows." },
    { emoji: "🍊", title: "Vitamin C & B6", description: "Citrus fruits and bananas help regulate neurotransmitters and energy." },
  ],
  acne: [
    { emoji: "🫐", title: "Antioxidant Power", description: "Berries, green tea, and dark chocolate (70%+) fight skin inflammation." },
    { emoji: "🥦", title: "Low-Sugar Foods", description: "Swap sugary snacks for vegetables and whole grains to support clear skin." },
    { emoji: "🫘", title: "Zinc-Rich Choices", description: "Pumpkin seeds, chickpeas, and lentils help regulate oil production." },
  ],
  breastTenderness: [
    { emoji: "🥦", title: "Cruciferous Veggies", description: "Broccoli, cauliflower, and kale help metabolize estrogen naturally." },
    { emoji: "🫘", title: "Fiber-Rich Foods", description: "Oats, beans, and lentils support hormone balance and reduce tenderness." },
  ],
  sleepIssues: [
    { emoji: "🍌", title: "Sleep-Supporting Foods", description: "Bananas, almonds, and warm milk contain melatonin-boosting nutrients." },
    { emoji: "🍵", title: "Evening Herbal Tea", description: "Chamomile or ashwagandha tea can promote relaxation before bed." },
    { emoji: "🥝", title: "Pre-Bed Snack", description: "A small kiwi or handful of cherries may improve sleep quality." },
  ],
};

function getNutritionTips(logs: Record<string, any>): NutritionTip[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const todayDayOfYear = now.getDate(); // seed for "daily" rotation

  const recentSymptoms = new Set<string>();
  for (const [dateStr, entry] of Object.entries(logs)) {
    if (entry.phase !== "puberty") continue;
    const d = new Date(dateStr);
    if (d < thirtyDaysAgo) continue;
    const e = entry as PubertyEntry;
    for (const [sym, val] of Object.entries(e.symptoms)) {
      if (val) recentSymptoms.add(sym);
    }
  }

  const matchedTips: NutritionTip[] = [];
  const usedDescriptions = new Set<string>();

  const symptomPriority = ["fatigue", "cramps", "moodSwings", "irritability", "anxiety", "bloating", "headache", "acne", "sleepIssues", "breastTenderness"];
  const sortedSymptoms = symptomPriority.filter(s => recentSymptoms.has(s));

  for (const sym of sortedSymptoms) {
    const tips = SYMPTOM_NUTRITION_MAP[sym] || [];
    const rotatedIndex = todayDayOfYear % tips.length;
    const tip = tips[rotatedIndex];
    if (tip && !usedDescriptions.has(tip.description)) {
      matchedTips.push(tip);
      usedDescriptions.add(tip.description);
    }
    if (matchedTips.length >= 3) break;
  }

  // Fill with phase-general tips if not enough symptom-matched
  if (matchedTips.length < 3) {
    const generalTips: NutritionTip[] = [
      { emoji: "🥗", title: "Eat the Rainbow", description: "Colorful fruits and vegetables provide a wide range of vitamins and antioxidants." },
      { emoji: "💧", title: "Stay Hydrated", description: "Drink at least 8 glasses of water daily to support overall wellness." },
      { emoji: "🌾", title: "Whole Grains", description: "Brown rice, oats, and millet provide steady energy and fiber." },
    ];
    for (const tip of generalTips) {
      if (matchedTips.length >= 3) break;
      if (!usedDescriptions.has(tip.description)) {
        matchedTips.push(tip);
        usedDescriptions.add(tip.description);
      }
    }
  }

  return matchedTips;
}

// ─── Daily Nutrition Tips Card ─────────────────────────────────────────────────

function DailyNutritionTips({ logs, currentPhase }: { logs: Record<string, any>; currentPhase: string }) {
  const tips = useMemo(() => getNutritionTips(logs), [logs]);
  const hasLogs = Object.keys(logs).length > 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <Apple className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Daily Nutrition Tips</h2>
            <p className="text-xs text-muted-foreground">Food suggestions based on your logged symptoms</p>
          </div>
        </div>
      </div>
      <div className="p-5 flex-1">
        {!hasLogs ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <AlertTriangle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Log more cycle information to receive personalized insights.</p>
              <p className="text-xs text-slate-500 mt-1">Track your symptoms and periods in the Calendar to unlock nutrition tips.</p>
            </div>
          </div>
        ) : tips.length === 0 ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">No symptom-matched tips yet</p>
              <p className="text-xs text-blue-600 mt-1">Log symptoms like fatigue, cramps, or mood changes to get personalized nutrition guidance.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-green-50/60 border border-green-100">
                <span className="text-2xl shrink-0">{tip.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-slate-800">{tip.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Common Symptoms of Current Phase Card ─────────────────────────────────────

function CommonPhaseSymptoms({ currentPhase }: { currentPhase: string }) {
  const symptoms = PHASE_SYMPTOMS[currentPhase] || [];

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Common Symptoms</h2>
            <p className="text-xs text-muted-foreground">Typical signs of your current cycle phase</p>
          </div>
        </div>
      </div>
      <div className="p-5 flex-1">
        {currentPhase === "unknown" ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <AlertTriangle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Log more cycle information to receive personalized insights.</p>
              <p className="text-xs text-slate-500 mt-1">Track your periods in the Calendar to detect your current phase.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <span className="text-xl">{PHASE_EMOJIS[currentPhase]}</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Current Phase</p>
                <p className="text-sm font-bold text-amber-900">{PHASE_LABELS[currentPhase]}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {symptoms.map((sym) => (
                <div key={sym.label} className="group relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border/50 text-sm font-medium text-slate-700 hover:bg-muted/90 transition-colors cursor-default">
                    <span>{sym.emoji}</span>
                    <span>{sym.label}</span>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-slate-800 text-white text-[10px] leading-relaxed shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {sym.explanation}
                  </div>
                </div>
              ))}
            </div>
            {symptoms.length > 0 && (
              <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                Hover over each symptom for more details about why it occurs during this phase.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PubertyFertilityInsights() {
  const { logs } = useHealthLog();

  const pubertyLogs = useMemo(() => {
    return Object.fromEntries(
      Object.entries(logs).filter(([, e]) => e.phase === "puberty")
    );
  }, [logs]);

  const periodDates = useMemo(() => {
    return Object.entries(logs)
      .filter(
        ([, e]) =>
          e.phase === "puberty" &&
          (e as PubertyEntry).periodStarted &&
          !(e as PubertyEntry)._periodAutoMarked
      )
      .map(([dateStr]) => dateStr)
      .sort((a, b) => b.localeCompare(a));
  }, [logs]);

  const avgCycleLength = useMemo(() => {
    if (periodDates.length < 2) return null;
    const sorted = [...periodDates].sort((a, b) => a.localeCompare(b));
    const diffs: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const d = Math.round(
        (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / 86400000
      );
      if (d > 0 && d < 100) diffs.push(d);
    }
    return diffs.length > 0 ? Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length) : null;
  }, [periodDates]);
  const lastPeriodDate = periodDates.length > 0 ? periodDates[0] : null;
  const hasData = periodDates.length >= 2 && lastPeriodDate && avgCycleLength;
  const nextPeriod = hasData
    ? addDays(new Date(lastPeriodDate!), avgCycleLength!)
    : null;

  const fertileWindow = useMemo(() => {
    if (!lastPeriodDate || !avgCycleLength) return null;
    return calcFertileWindow(lastPeriodDate, avgCycleLength);
  }, [lastPeriodDate, avgCycleLength]);

  const currentPhase = getCyclePhase(lastPeriodDate, avgCycleLength, fertileWindow);

  return (
    <div className="space-y-6">
      <ScrollReveal delay={20}>
        <DailyGuidanceCard
          hasData={hasData}
          nextPeriod={nextPeriod}
          avgCycle={avgCycleLength}
          currentPhase={currentPhase}
        />
      </ScrollReveal>

      <ScrollReveal delay={40}>
        <CycleCalculator logs={pubertyLogs} />
      </ScrollReveal>

      <ScrollReveal delay={50}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DailyNutritionTips logs={pubertyLogs} currentPhase={currentPhase} />
          <CommonPhaseSymptoms currentPhase={currentPhase} />
        </div>
      </ScrollReveal>

      <ScrollReveal delay={60}>
        <LifestyleGuidance />
      </ScrollReveal>

      <ScrollReveal delay={80}>
        <ConsultationTrigger />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-3">
          <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All data is stored locally on your device. This guidance is for awareness only — always consult a healthcare professional for personalized medical advice.
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
