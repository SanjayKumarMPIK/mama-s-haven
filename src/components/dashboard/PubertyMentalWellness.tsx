import { useMemo } from "react";
import { Lightbulb, Moon, Heart, Sparkles, Brain, Activity, Droplets, Coffee, Sun, Bed } from "lucide-react";
import { calcFertileWindow, calcAverageCycleLength, type PubertyEntry, type HealthLogs } from "@/hooks/useHealthLog";

export interface PubertyLogItem {
  date: string;
  entry: PubertyEntry;
}

type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal" | "unknown";

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: "Menstrual Phase",
  follicular: "Follicular Phase",
  ovulation: "Ovulation Phase",
  luteal: "Luteal Phase",
  unknown: "Current Phase",
};

const PHASE_EMOJIS: Record<CyclePhase, string> = {
  menstrual: "🩸",
  follicular: "🌱",
  ovulation: "✨",
  luteal: "🌙",
  unknown: "💫",
};

function getCurrentPhase(
  lastPeriodDate: string | null,
  avgCycleLength: number | null,
  fertile: { fertileStart: string; fertileEnd: string; ovulation: string } | null,
): CyclePhase {
  if (!lastPeriodDate || !avgCycleLength) return "unknown";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);

  const lastPeriod = new Date(lastPeriodDate);
  lastPeriod.setHours(0, 0, 0, 0);

  const daysSincePeriod = Math.round((today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSincePeriod < 0) return "unknown";

  if (fertile) {
    if (todayStr >= fertile.fertileStart && todayStr <= fertile.fertileEnd) return "ovulation";
  }

  const periodLen = 5;
  if (daysSincePeriod < periodLen) return "menstrual";

  if (fertile && todayStr < fertile.fertileStart) return "follicular";

  return "luteal";
}

interface PhasePattern {
  phase: CyclePhase;
  entries: PubertyLogItem[];
  avgMoodScore: number;
  topSymptoms: { name: string; count: number }[];
  count: number;
}

interface Insight {
  id: string;
  emoji: string;
  title: string;
  description: string;
  tone: "positive" | "warning" | "neutral";
}

function analyzePhasePatterns(logs: PubertyLogItem[]): PhasePattern[] {
  const byPhase: Record<string, PubertyLogItem[]> = {
    menstrual: [], follicular: [], ovulation: [], luteal: [],
  };

  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 3) return [];

  const dates = sorted.map(l => l.date);
  const startEntries = sorted.filter(l => l.entry.periodStarted && !l.entry._periodAutoMarked);

  if (startEntries.length === 0) return [];

  const lastPeriod = startEntries[0].date;
  const avgCycle = calcAverageCycleLength(Object.fromEntries(logs.map(l => [l.date, l.entry as any])));
  if (!avgCycle) return [];

  const fertile = calcFertileWindow(lastPeriod, avgCycle);

  for (const log of sorted) {
    const daysSince = (() => {
      const lp = new Date(lastPeriod);
      const ld = new Date(log.date);
      return Math.round((ld.getTime() - lp.getTime()) / (1000 * 60 * 60 * 24));
    })();

    const periodLen = 5;
    if (daysSince >= 0 && daysSince < periodLen) {
      byPhase.menstrual.push(log);
    } else if (fertile && log.date >= fertile.fertileStart && log.date <= fertile.fertileEnd) {
      byPhase.ovulation.push(log);
    } else if (daysSince < (fertile ? new Date(fertile.fertileStart).getDate() - new Date(lastPeriod).getDate() : periodLen)) {
      byPhase.follicular.push(log);
    } else if (daysSince >= periodLen) {
      byPhase.luteal.push(log);
    }
  }

  const results: PhasePattern[] = [];
  for (const [phase, phaseLogs] of Object.entries(byPhase)) {
    if (phaseLogs.length < 2) continue;
    const totalMood = phaseLogs.reduce((sum, l) => {
      const score = l.entry.mood === "Good" ? 3 : l.entry.mood === "Okay" ? 2 : l.entry.mood === "Low" ? 1 : 0;
      return sum + score;
    }, 0);
    const moodCount = phaseLogs.filter(l => l.entry.mood).length;
    const avgMoodScore = moodCount > 0 ? totalMood / moodCount : 0;

    const symptomCounts: Record<string, number> = {};
    for (const l of phaseLogs) {
      for (const [sym, val] of Object.entries(l.entry.symptoms)) {
        if (val) symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
      }
    }
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    results.push({ phase: phase as CyclePhase, entries: phaseLogs, avgMoodScore, topSymptoms, count: phaseLogs.length });
  }

  return results.sort((a, b) => b.count - a.count);
}

const SYMPTOM_LABELS: Record<string, string> = {
  cramps: "Cramps",
  fatigue: "Fatigue",
  moodSwings: "Mood Swings",
  headache: "Headache",
  acne: "Acne",
  breastTenderness: "Breast Tenderness",
  bloating: "Bloating",
  backPain: "Back Pain",
  foodCravings: "Food Cravings",
  irritability: "Irritability",
  sleepIssues: "Sleep Issues",
  anxiety: "Anxiety",
};

function moodLabel(score: number): string {
  if (score >= 2.5) return "Positive";
  if (score >= 1.5) return "Mixed";
  return "Low";
}

function moodColor(score: number): string {
  if (score >= 2.5) return "text-emerald-600";
  if (score >= 1.5) return "text-amber-600";
  return "text-rose-600";
}

function generateInsights(patterns: PhasePattern[], currentPhase: CyclePhase, latestEntries: PubertyLogItem[]): Insight[] {
  const insights: Insight[] = [];
  const seen = new Set<string>();

  if (patterns.length === 0 && latestEntries.length < 3) return insights;

  if (patterns.length === 0) {
    insights.push({
      id: "log-more",
      emoji: "📝",
      title: "Keep logging to see patterns",
      description: "Log more mood and cycle data to receive personalized wellness insights.",
      tone: "neutral",
    });
    return insights;
  }

  for (const p of patterns) {
    const phaseLabel = PHASE_LABELS[p.phase];
    const emoji = PHASE_EMOJIS[p.phase];
    const moodStr = moodLabel(p.avgMoodScore);
    const moodClr = moodColor(p.avgMoodScore);

    if (p.avgMoodScore > 0 && p.avgMoodScore < 3) {
      const key = `mood-${p.phase}`;
      if (!seen.has(key)) {
        seen.add(key);
        insights.push({
          id: key,
          emoji,
          title: `${moodStr} mood during ${phaseLabel}`,
          description: `Your logged data shows your mood tends to be ${moodStr.toLowerCase()} during the ${phaseLabel.toLowerCase()} based on ${p.count} logged day${p.count > 1 ? "s" : ""}.`,
          tone: p.avgMoodScore >= 2.5 ? "positive" : p.avgMoodScore >= 1.5 ? "neutral" : "warning",
        });
      }
    }

    for (const sym of p.topSymptoms.filter(s => s.count >= Math.ceil(p.count * 0.4))) {
      const key = `sym-${p.phase}-${sym.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        insights.push({
          id: key,
          emoji: sym.name === "fatigue" ? "😴" : sym.name === "moodSwings" || sym.name === "irritability" || sym.name === "anxiety" ? "💭" : sym.name === "cramps" || sym.name === "headache" || sym.name === "backPain" ? "🤕" : sym.name === "bloating" || sym.name === "foodCravings" ? "🍽️" : sym.name === "sleepIssues" ? "🌙" : sym.name === "acne" ? "✨" : "🔍",
          title: `${SYMPTOM_LABELS[sym.name] || sym.name} during ${phaseLabel}`,
          description: `You've logged ${SYMPTOM_LABELS[sym.name]?.toLowerCase() || sym.name} on ${sym.count} of ${p.count} days in the ${phaseLabel.toLowerCase()}. Consider tracking this pattern to understand your cycle better.`,
          tone: "warning",
        });
      }
    }
  }

  const recent = latestEntries.slice(0, 7);
  const lowMoodRecent = recent.filter(l => l.entry.mood === "Low").length;
  if (lowMoodRecent >= 2) {
    const key = "recent-low-mood";
    if (!seen.has(key)) {
      seen.add(key);
      insights.push({
        id: key,
        emoji: "💙",
        title: "Recent low mood days",
        description: `You've logged ${lowMoodRecent} day${lowMoodRecent > 1 ? "s" : ""} with low mood recently. Small self-care moments can help — try a short walk, deep breathing, or talking to someone you trust.`,
        tone: "warning",
      });
    }
  }

  const fatigueRecent = recent.filter(l => l.entry.symptoms.fatigue).length;
  if (fatigueRecent >= 3) {
    const key = "recent-fatigue";
    if (!seen.has(key)) {
      seen.add(key);
      insights.push({
        id: key,
        emoji: "🛌",
        title: "Increased fatigue this week",
        description: `Fatigue logged on ${fatigueRecent} of the last ${recent.length} day${recent.length > 1 ? "s" : ""}. Prioritize rest, iron-rich foods, and consistent sleep.`,
        tone: "warning",
      });
    }
  }

  if (currentPhase !== "unknown") {
    const phaseInsights = patterns.find(p => p.phase === currentPhase);
    if (phaseInsights && phaseInsights.avgMoodScore >= 2.5) {
      insights.push({
        id: "current-positive",
        emoji: "🌟",
        title: `You're in the ${PHASE_LABELS[currentPhase].toLowerCase()}`,
        description: `Your data shows you tend to feel well during this phase. Keep up the good habits!`,
        tone: "positive",
      });
    }
  }

  return insights.slice(0, 5);
}

interface Suggestion {
  id: string;
  icon: typeof Heart;
  title: string;
  description: string;
  bg: string;
  iconBg: string;
  iconColor: string;
}

function generateSuggestions(
  currentPhase: CyclePhase,
  latestEntries: PubertyLogItem[],
  patterns: PhasePattern[],
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const recent = latestEntries.slice(0, 5);
  const recentMoods = recent.map(l => l.entry.mood).filter(Boolean);
  const lowMood = recentMoods.filter(m => m === "Low").length;
  const recentSymptoms = new Set<string>();
  for (const l of recent) {
    for (const [sym, val] of Object.entries(l.entry.symptoms)) {
      if (val) recentSymptoms.add(sym);
    }
  }

  if (currentPhase === "menstrual" || recentSymptoms.has("cramps")) {
    suggestions.push({
      id: "heat-rest",
      icon: Sun,
      title: "Gentle warmth & rest",
      description: "A warm compress or hot water bottle on your lower belly can ease cramps. Try resting with your feet up for 15 minutes.",
      bg: "bg-rose-50/70 border-rose-200",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    });
  }

  if (recentSymptoms.has("fatigue") || currentPhase === "menstrual" || currentPhase === "luteal") {
    suggestions.push({
      id: "hydrate-sleep",
      icon: Bed,
      title: "Prioritize hydration & sleep",
      description: currentPhase === "luteal" || currentPhase === "menstrual"
        ? "Try improving hydration and sleep during this phase. Aim for 7–8 hours and drink warm fluids before bed."
        : "Fatigue is common right now. Sip water through the day and aim for an earlier bedtime.",
      bg: "bg-indigo-50/70 border-indigo-200",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    });
  }

  if (lowMood >= 2 || recentSymptoms.has("moodSwings") || recentSymptoms.has("irritability") || recentSymptoms.has("anxiety")) {
    suggestions.push({
      id: "mindful-breath",
      icon: Brain,
      title: "Gentle breathing exercise",
      description: "Try 4-7-8 breathing: inhale for 4 counts, hold for 7, exhale for 8. Repeat 3 times to help calm your mind.",
      bg: "bg-purple-50/70 border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    });
  }

  if (currentPhase === "ovulation" || currentPhase === "follicular") {
    suggestions.push({
      id: "light-activity",
      icon: Activity,
      title: "Light activity or stretching",
      description: "Your current cycle phase may benefit from lower-intensity activities. A short walk or gentle stretching can boost your energy naturally.",
      bg: "bg-emerald-50/70 border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    });
  }

  if (recentSymptoms.has("sleepIssues")) {
    suggestions.push({
      id: "sleep-routine",
      icon: Moon,
      title: "Wind-down routine",
      description: "Sleep issues detected. Try dimming lights an hour before bed, avoiding screens, and sipping chamomile or warm milk.",
      bg: "bg-sky-50/70 border-sky-200",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
    });
  }

  if (recentSymptoms.has("foodCravings") || recentSymptoms.has("bloating")) {
    suggestions.push({
      id: "gentle-nutrition",
      icon: Coffee,
      title: "Mindful eating tips",
      description: "Small, frequent meals can help with bloating or cravings. Include protein and fiber to stay full and balanced.",
      bg: "bg-amber-50/70 border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    });
  }

  if (currentPhase !== "unknown") {
    suggestions.push({
      id: "phase-self-care",
      icon: Heart,
      title: `${PHASE_LABELS[currentPhase]} self-care`,
      description: currentPhase === "menstrual" ? "Rest when you need to. Light movement like walking or stretching can help." :
        currentPhase === "follicular" ? "Your energy is building. Great time for planning and creative projects." :
        currentPhase === "ovulation" ? "You may feel more social and energetic. Enjoy connecting with others." :
        "Your body is winding down. Prioritize rest, soothing activities, and gentle movement.",
      bg: "bg-pink-50/70 border-pink-200",
      iconBg: "bg-pink-100",
      iconColor: "text-pink-600",
    });
  }

  return suggestions.slice(0, 5);
}

export function MentalWellnessInsights({ pubertyLogs, logs }: { pubertyLogs: PubertyLogItem[]; logs: HealthLogs }) {
  const latestEntries = useMemo(() =>
    [...pubertyLogs].sort((a, b) => b.date.localeCompare(a.date)),
    [pubertyLogs],
  );

  const startDates = useMemo(() =>
    latestEntries.filter(l => l.entry.periodStarted && !l.entry._periodAutoMarked).map(l => l.date),
    [latestEntries],
  );

  const lastPeriod = startDates[0] || null;
  const avgCycleLength = useMemo(() => calcAverageCycleLength(logs), [logs]);
  const fertileWindow = useMemo(() =>
    lastPeriod && avgCycleLength ? calcFertileWindow(lastPeriod, avgCycleLength) : null,
    [lastPeriod, avgCycleLength],
  );

  const currentPhase = useMemo(() =>
    getCurrentPhase(lastPeriod, avgCycleLength, fertileWindow),
    [lastPeriod, avgCycleLength, fertileWindow],
  );

  const patterns = useMemo(() => analyzePhasePatterns(latestEntries), [latestEntries]);

  const insights = useMemo(() =>
    generateInsights(patterns, currentPhase, latestEntries),
    [patterns, currentPhase, latestEntries],
  );

  const hasData = latestEntries.length > 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
            <Brain className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Mental Wellness Insights</h2>
            <p className="text-xs text-muted-foreground">Mood and wellness patterns from your logged data</p>
          </div>
          {currentPhase !== "unknown" && (
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold rounded-full border border-violet-200 bg-violet-50 text-violet-700 px-2.5 py-1 shrink-0">
              {PHASE_EMOJIS[currentPhase]} {PHASE_LABELS[currentPhase]}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {!hasData || insights.length === 0 ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Lightbulb className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Log more mood and cycle data to receive personalized wellness insights.</p>
              <p className="text-xs text-slate-500 mt-1">
                Track your daily mood, symptoms, and periods in the Calendar to unlock patterns and trends.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`flex flex-col p-4 rounded-xl border transition-all hover:shadow-md ${
                  insight.tone === "warning" ? "bg-amber-50/50 border-amber-200" :
                  insight.tone === "positive" ? "bg-emerald-50/50 border-emerald-200" :
                  "bg-blue-50/50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">{insight.emoji}</span>
                  <div className="min-w-0">
                    <h4 className={`text-sm font-bold ${
                      insight.tone === "warning" ? "text-amber-900" :
                      insight.tone === "positive" ? "text-emerald-900" :
                      "text-blue-900"
                    }`}>
                      {insight.title}
                    </h4>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      insight.tone === "warning" ? "text-amber-700" :
                      insight.tone === "positive" ? "text-emerald-700" :
                      "text-blue-700"
                    }`}>
                      {insight.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function WellnessSuggestions({ pubertyLogs, logs }: { pubertyLogs: PubertyLogItem[]; logs: HealthLogs }) {
  const latestEntries = useMemo(() =>
    [...pubertyLogs].sort((a, b) => b.date.localeCompare(a.date)),
    [pubertyLogs],
  );

  const startDates = useMemo(() =>
    latestEntries.filter(l => l.entry.periodStarted && !l.entry._periodAutoMarked).map(l => l.date),
    [latestEntries],
  );

  const lastPeriod = startDates[0] || null;
  const avgCycleLength = useMemo(() => calcAverageCycleLength(logs), [logs]);
  const fertileWindow = useMemo(() =>
    lastPeriod && avgCycleLength ? calcFertileWindow(lastPeriod, avgCycleLength) : null,
    [lastPeriod, avgCycleLength],
  );

  const currentPhase = useMemo(() =>
    getCurrentPhase(lastPeriod, avgCycleLength, fertileWindow),
    [lastPeriod, avgCycleLength, fertileWindow],
  );

  const patterns = useMemo(() => analyzePhasePatterns(latestEntries), [latestEntries]);

  const suggestions = useMemo(() =>
    generateSuggestions(currentPhase, latestEntries, patterns),
    [currentPhase, latestEntries, patterns],
  );

  const hasData = latestEntries.length > 0;

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Personalized Wellness Suggestions</h2>
            <p className="text-xs text-muted-foreground">Supportive tips based on your current phase and logs</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {!hasData || suggestions.length === 0 ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <Lightbulb className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Log more mood and cycle data to receive personalized wellness insights.</p>
              <p className="text-xs text-slate-500 mt-1">
                Track your daily mood, symptoms, and periods in the Calendar to unlock patterns and trends.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg} transition-all hover:shadow-md`}
                >
                  <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-5 h-5 ${s.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800">{s.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
