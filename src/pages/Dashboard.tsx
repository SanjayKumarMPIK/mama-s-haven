import { useMemo } from "react";
import { LayoutDashboard, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useHealthLog, PubertyEntry } from "@/hooks/useHealthLog";
import HealthScoreHero from "@/components/dashboard/HealthScoreHero";
import VisualAnalytics from "@/components/dashboard/VisualAnalytics";
import ActionList from "@/components/dashboard/ActionList";

/* ── Helpers ────────────────────────────────────────────── */

/** Compute a health score 0‒100 from the latest puberty log.
 *  Higher = healthier (fewer symptoms, better mood). */
function computeHealthScore(latest: PubertyEntry | undefined): number {
  if (!latest) return 50;
  let score = 100;
  if (latest.symptoms.cramps) score -= 20;
  if (latest.symptoms.fatigue) score -= 15;
  if (latest.symptoms.moodSwings) score -= 12;
  if (latest.symptoms.headache) score -= 15;
  if (latest.symptoms.acne) score -= 8;
  if (latest.symptoms.breastTenderness) score -= 10;
  if (latest.mood === "Low") score -= 10;
  else if (latest.mood === "Okay") score -= 5;
  if (latest.periodStarted) score -= 5;
  return Math.max(0, Math.min(100, score));
}

/** Compute probability (0‒100) of a symptom occurring soon
 *  based on recent historical frequency. */
function symptomProbability(
  logs: { entry: PubertyEntry }[],
  getter: (e: PubertyEntry) => boolean,
): number {
  if (logs.length === 0) return 30; // baseline
  const window = logs.slice(0, 7);
  const hits = window.filter((l) => getter(l.entry)).length;
  // Weighted: recent logs count more
  const base = Math.round((hits / window.length) * 100);
  // Add a small uncertainty bump so it never shows 0%
  return Math.max(10, Math.min(95, base + 10));
}

/** Generate a smart daily insight sentence. */
function generateInsight(latest: PubertyEntry | undefined): string {
  if (!latest) return "Log your symptoms today and get personalized insights.";
  const parts: string[] = [];
  if (latest.periodStarted) {
    parts.push("Your body is in its active menstrual phase — prioritize rest and hydration.");
  } else if (latest.symptoms.cramps || latest.symptoms.breastTenderness) {
    parts.push("Your body may be preparing for menstruation — take it easy today.");
  } else if (latest.mood === "Low" || latest.symptoms.moodSwings) {
    parts.push("Your mood has been fluctuating — try mindfulness or gentle movement.");
  } else if (latest.symptoms.fatigue) {
    parts.push("You seem low on energy — an early bedtime could help recharge.");
  } else {
    parts.push("You're doing great! Keep up your balanced routine. 🌟");
  }
  return parts.join(" ");
}

/* ── Dashboard Page ─────────────────────────────────────── */

export default function Dashboard() {
  const { logs } = useHealthLog();

  // 1. Extract Puberty Logs & Sort Descending
  //    – Exclude auto-projected period entries (_periodAutoMarked)
  //    – Exclude future-dated entries
  const pubertyLogs = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return Object.entries(logs)
      .filter(([date, entry]) => {
        if (entry.phase !== "puberty") return false;
        if (date > today) return false; // skip future
        if ((entry as any)._periodAutoMarked) return false; // skip auto-projected
        // Must have at least some real data (symptom, mood, or notes)
        const e = entry as PubertyEntry;
        const hasSymptom = Object.values(e.symptoms).some(Boolean);
        const hasMood = !!e.mood;
        const hasNotes = !!(e as any).notes;
        return hasSymptom || hasMood || hasNotes || e.periodStarted;
      })
      .map(([date, entry]) => ({ date, entry: entry as PubertyEntry }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs]);

  const latestLog = pubertyLogs[0]?.entry;

  // 2. Health Score Hero data
  const heroData = useMemo(() => ({
    score: computeHealthScore(latestLog),
    phase: latestLog?.periodStarted ? "Menstruation" : "Follicular / Luteal",
    dailyInsight: generateInsight(latestLog),
    predictions: {
      cramps: symptomProbability(pubertyLogs, (e) => e.symptoms.cramps),
      moodSwings: symptomProbability(pubertyLogs, (e) => e.symptoms.moodSwings),
      fatigue: symptomProbability(pubertyLogs, (e) => e.symptoms.fatigue),
    },
  }), [pubertyLogs, latestLog]);

  // 3. Dynamic Actions
  const actions = useMemo(() => {
    if (pubertyLogs.length === 0) return [{ text: "Log your health today", emoji: "📝", link: "/health-log" }];
    const acts: { text: string; emoji: string; link: string }[] = [];
    if (latestLog?.symptoms?.cramps) acts.push({ text: "Do light stretching for 10 minutes", emoji: "🤸", link: "/tools" });
    if (latestLog?.symptoms?.fatigue) acts.push({ text: "Take a short nap or rest early", emoji: "🛌", link: "/stress-relief" });
    if (latestLog?.symptoms?.headache) acts.push({ text: "Stay hydrated & reduce screen time", emoji: "💧", link: "/nutrition" });
    if (latestLog?.symptoms?.acne) acts.push({ text: "Follow a gentle skincare routine tonight", emoji: "🧼", link: "/tools" });
    if (latestLog?.symptoms?.moodSwings) acts.push({ text: "Try a 5-minute breathing exercise", emoji: "🧘", link: "/stress-relief" });
    if (acts.length === 0) {
      acts.push({ text: "Maintain your regular active routine", emoji: "🏃‍♀️", link: "/weekly-guide" });
      acts.push({ text: "Explore balanced nutrition tips", emoji: "🥗", link: "/nutrition" });
    }
    acts.push({ text: "Update today's health log", emoji: "📝", link: "/health-log" });
    return acts;
  }, [pubertyLogs, latestLog]);

  // ── Zero State ───────────────────────────────────────
  if (pubertyLogs.length === 0) {
    return (
      <main className="dashboard-page flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-pink-200/40">
          <Activity className="w-9 h-9 text-pink-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Welcome to your Dashboard
        </h1>
        <p className="text-slate-500 mb-8 mt-2 max-w-xs leading-relaxed">
          Start logging your symptoms to unlock personalized health insights, predictions, and visual analytics.
        </p>
        <Link
          to="/health-log"
          className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3.5 rounded-full font-semibold shadow-lg shadow-pink-500/25 hover:shadow-xl hover:shadow-pink-500/30 hover:-translate-y-0.5 transition-all duration-300"
        >
          Log Symptoms
        </Link>
      </main>
    );
  }

  // ── Main Dashboard ───────────────────────────────────
  return (
    <main className="dashboard-page">
      {/* Page heading */}
      <header className="dashboard-header mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            My Insights
          </h1>
          <p className="text-sm font-medium text-pink-500 mt-0.5">
            Your personalized health overview
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        {/* 1. Smart Health Summary (Hero) */}
        <HealthScoreHero data={heroData} />

        {/* 2. Visual Analytics (Graphs) */}
        <VisualAnalytics pubertyLogs={pubertyLogs} />

        {/* 3. Actions */}
        <ActionList actions={actions} />
      </div>
    </main>
  );
}

