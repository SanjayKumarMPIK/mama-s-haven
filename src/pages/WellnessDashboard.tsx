import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWellnessRecommendation } from "@/hooks/useWellnessRecommendation";
import { usePhase } from "@/hooks/usePhase";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog, PubertyEntry } from "@/hooks/useHealthLog";
import { computeDailyRecommendations } from "@/lib/dailyStateEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import HealthScoreHero from "@/components/dashboard/HealthScoreHero";
import VisualAnalytics from "@/components/dashboard/VisualAnalytics";
import WeightGauge from "@/components/dashboard/WeightGauge";
import InsightsCard from "@/components/dashboard/InsightsCard";
import type { InsightItem } from "@/components/dashboard/InsightsCard";
import type { Region } from "@/lib/nutritionData";

import {
  Sparkles,
  Droplets,
  Moon,
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ArrowRight,
  Scale,
  Ruler,
  MapPin,
  Flame,
  CalendarCheck,
  User,
  TrendingUp,
  Shield,
  Clock,
  Zap,
  Sun,
  Dumbbell,
  UtensilsCrossed,
  Brain,
  BatteryCharging,
  Check,
  X,
  Lightbulb,
} from "lucide-react";

// ─── Region config ────────────────────────────────────────────────────────────

const REGIONS: { val: Region; label: string; emoji: string }[] = [
  { val: "south", label: "South India", emoji: "🌴" },
  { val: "north", label: "North India", emoji: "🏔️" },
  { val: "east", label: "East India", emoji: "🌿" },
  { val: "west", label: "West India", emoji: "🏖️" },
];

// ─── Time-based greeting ──────────────────────────────────────────────────────

function getGreeting(): string {
  const hr = new Date().getHours();
  if (hr < 12) return "Good morning";
  if (hr < 17) return "Good afternoon";
  return "Good evening";
}

function getTimeOfDay(): "morning" | "afternoon" | "evening" {
  const hr = new Date().getHours();
  if (hr < 12) return "morning";
  if (hr < 17) return "afternoon";
  return "evening";
}

// ─── Dashboard Helpers (from old Dashboard.tsx) ───────────────────────────────

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
  const base = Math.round((hits / window.length) * 100);
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

// ─── Expandable Card ──────────────────────────────────────────────────────────

function ExpandableCard({
  id,
  icon: Icon,
  iconBg,
  title,
  summary,
  children,
  defaultOpen = false,
}: {
  id: string;
  icon: any;
  iconBg: string;
  title: string;
  summary: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      id={id}
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={open}
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{summary}</p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          maxHeight: open ? "2000px" : "0px",
          opacity: open ? 1 : 0,
          overflow: "hidden",
        }}
      >
        <div className="px-5 pb-5 pt-1">{children}</div>
      </div>
    </div>
  );
}

// ─── Setup Form ───────────────────────────────────────────────────────────────

function SetupForm({
  onComplete,
  userName,
}: {
  onComplete: (data: { weight: number; height: number; region: Region }) => void;
  userName: string;
}) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [region, setRegion] = useState<Region>("south");
  const [errors, setErrors] = useState<{ weight?: string; height?: string }>({});

  function handleSubmit() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const errs: typeof errors = {};

    if (!w || w < 20 || w > 200) errs.weight = "Enter a valid weight (20–200 kg)";
    if (!h || h < 80 || h > 250) errs.height = "Enter a valid height (80–250 cm)";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onComplete({ weight: w, height: h, region });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200/50 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {userName ? `Hi ${userName.split(" ")[0]}! 👋` : "Your Wellness Plan"}
            </h1>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
              Tell us a little about yourself and we'll create your personalized daily wellness guide
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 space-y-6">
            {/* Weight */}
            <div className="space-y-2">
              <label htmlFor="wellness-weight" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-600" /> Weight (kg)
              </label>
              <input
                id="wellness-weight"
                type="number"
                inputMode="decimal"
                placeholder="e.g., 55"
                value={weight}
                onChange={(e) => { setWeight(e.target.value); setErrors((p) => ({ ...p, weight: undefined })); }}
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
              />
              {errors.weight && <p className="text-xs text-red-500 mt-1">{errors.weight}</p>}
            </div>

            {/* Height */}
            <div className="space-y-2">
              <label htmlFor="wellness-height" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-teal-600" /> Height (cm)
              </label>
              <input
                id="wellness-height"
                type="number"
                inputMode="decimal"
                placeholder="e.g., 160"
                value={height}
                onChange={(e) => { setHeight(e.target.value); setErrors((p) => ({ ...p, height: undefined })); }}
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
              />
              {errors.height && <p className="text-xs text-red-500 mt-1">{errors.height}</p>}
            </div>

            {/* Region */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Your Region
              </p>
              <div className="grid grid-cols-2 gap-2">
                {REGIONS.map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => setRegion(r.val)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                      region === r.val
                        ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-200/40"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span className="text-base">{r.emoji}</span> {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-base shadow-lg shadow-teal-200/50 hover:shadow-xl hover:shadow-teal-300/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              Get My Wellness Plan <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-[11px] text-slate-400 text-center leading-snug">
              Your data stays on your device. We don't send anything to a server.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}

// ─── Water Ring Visual ────────────────────────────────────────────────────────

function WaterRing({ liters }: { liters: number }) {
  const pct = Math.min(100, (liters / 3.5) * 100);
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 36 36">
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="hsl(190, 30%, 90%)"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="url(#waterGradient)"
          strokeWidth="3"
          strokeDasharray={`${pct}, 100`}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(190, 80%, 50%)" />
            <stop offset="100%" stopColor="hsl(210, 80%, 55%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Droplets className="w-5 h-5 text-cyan-500 mb-0.5" />
        <span className="text-lg font-bold text-foreground">{liters}L</span>
      </div>
    </div>
  );
}

// ─── Profile Summary Strip ────────────────────────────────────────────────────

function ProfileStrip({
  age,
  weight,
  height,
  region,
  loggedDays,
}: {
  age: number;
  weight: number;
  height: number;
  region: Region;
  loggedDays: number;
}) {
  const regionLabel = REGIONS.find((r) => r.val === region)?.label ?? region;

  return (
    <div className="flex flex-wrap gap-2">
      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/60 rounded-full px-2.5 py-1">
        <User className="w-3 h-3" /> {age} yrs
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/60 rounded-full px-2.5 py-1">
        <Scale className="w-3 h-3" /> {weight} kg
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/60 rounded-full px-2.5 py-1">
        <Ruler className="w-3 h-3" /> {height} cm
      </span>
      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/60 rounded-full px-2.5 py-1">
        <MapPin className="w-3 h-3" /> {regionLabel}
      </span>
      {loggedDays > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary/10 text-primary rounded-full px-2.5 py-1">
          <TrendingUp className="w-3 h-3" /> {loggedDays} day{loggedDays > 1 ? "s" : ""} logged
        </span>
      )}
    </div>
  );
}

// ─── Main Unified Wellness Tracker ────────────────────────────────────────────

export default function WellnessDashboard() {
  const { simpleMode } = useLanguage();
  const { phase, phaseEmoji, phaseName, phaseColor } = usePhase();
  const { user, fullProfile } = useAuth();
  const { logs } = useHealthLog();
  const {
    profile,
    recommendation,
    isProfileComplete,
    saveProfile,
    clearProfile,
    age,
  } = useWellnessRecommendation();

  // Always compute these (hooks must not be conditional)
  const userName = user?.name || fullProfile?.basic?.fullName || "";
  const firstName = userName.split(" ")[0] || "";
  const greeting = getGreeting();
  const timeOfDay = getTimeOfDay();

  // Count logged days in last 7 days
  const recentLogCount = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const todayISO = now.toISOString().slice(0, 10);
    return Object.keys(logs).filter((d) => d >= sevenDaysAgo && d <= todayISO).length;
  }, [logs]);

  // ── Puberty Logs (from old Dashboard) ──────────────────────
  const pubertyLogs = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return Object.entries(logs)
      .filter(([date, entry]) => {
        if (entry.phase !== "puberty") return false;
        if (date > today) return false;
        if ((entry as any)._periodAutoMarked) return false;
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

  // ── Health Score Hero data ─────────────────────────────────
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

  // Yesterday's sleep data
  const yesterdaySleep = useMemo(() => {
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const iso = yest.toISOString().slice(0, 10);
    const entry = logs[iso] as any;
    if (entry && entry.sleepHours != null) {
      return { hours: Number(entry.sleepHours), quality: entry.sleepQuality };
    }
    return null;
  }, [logs]);

  const sleepCorrelation = useMemo(() => {
    if (!yesterdaySleep || !recommendation) return null;
    const poorSleep = yesterdaySleep.hours < 6 || yesterdaySleep.quality === "Poor";
    const goodSleep = yesterdaySleep.hours >= 7;
    const syms = recommendation.dominantSymptoms.map(s => s.toLowerCase());
    const hasCramps = syms.some(s => s.includes("cramp"));
    const hasMood = syms.some(s => s.includes("mood"));

    if (poorSleep && hasCramps) return "You experience stronger cramps when sleep is below 6 hours.";
    if (poorSleep && hasMood) return "Mood drops on days after poor sleep.";
    if (poorSleep) return "Your body needs more recovery time to reduce symptom severity.";
    if (goodSleep) return "Energy improves when sleep exceeds 7 hours. Keep it up!";
    return null;
  }, [yesterdaySleep, recommendation]);

  // Sleep insights
  const sleepInsights = useMemo(() => {
    if (!yesterdaySleep) return null;
    const poorSleep = yesterdaySleep.hours < 6 || yesterdaySleep.quality === "Poor";
    const goodSleep = yesterdaySleep.hours >= 7 && (yesterdaySleep.quality === "Good" || !yesterdaySleep.quality);
    if (poorSleep) return `Low energy (${yesterdaySleep.hours}h sleep last night)`;
    if (goodSleep) return "Great energy (well rested)";
    return null;
  }, [yesterdaySleep]);

  // Daily State Engine
  const dailyRec = useMemo(() => {
    return computeDailyRecommendations(logs, phase, recommendation?.cyclePhase ?? null);
  }, [logs, phase, recommendation]);

  // ── Smart Insights ─────────────────────────────────────────
  const smartInsights = useMemo((): InsightItem[] => {
    const items: InsightItem[] = [];

    // BMI insight
    if (recommendation) {
      const cat = recommendation.bmi.category;
      if (cat === "Normal") {
        items.push({ text: "Your weight is in the optimal range — keep it up!", icon: "scale", tone: "positive" });
      } else if (cat === "Underweight") {
        items.push({ text: "Your BMI is below normal — focus on nutrient-dense meals.", icon: "scale", tone: "warning" });
      } else {
        items.push({ text: "Your BMI is above normal — consider balanced meals and activity.", icon: "scale", tone: "warning" });
      }
    }

    // Energy/Sleep insight
    if (yesterdaySleep) {
      const poorSleep = yesterdaySleep.hours < 6 || yesterdaySleep.quality === "Poor";
      if (poorSleep) {
        items.push({ text: "You may experience low energy today due to poor sleep.", icon: "energy", tone: "warning" });
      } else if (yesterdaySleep.hours >= 7) {
        items.push({ text: "Well rested! You should have good energy today.", icon: "energy", tone: "positive" });
      }
    } else if (latestLog?.symptoms?.fatigue) {
      items.push({ text: "You may experience low energy today — take it easy.", icon: "energy", tone: "warning" });
    }

    // Mood / symptom insight
    if (latestLog) {
      if (latestLog.periodStarted) {
        items.push({ text: "You're in your active cycle — prioritize rest and hydration.", icon: "mood", tone: "neutral" });
      } else if (latestLog.mood === "Good" && !latestLog.symptoms.moodSwings) {
        items.push({ text: "Your mood has been great — keep the positive streak!", icon: "mood", tone: "positive" });
      } else if (latestLog.symptoms.moodSwings || latestLog.mood === "Low") {
        items.push({ text: "Mood fluctuations detected — try mindfulness or gentle movement.", icon: "mood", tone: "warning" });
      }
    }

    return items.slice(0, 3);
  }, [recommendation, yesterdaySleep, latestLog]);

  // --- Setup phase ---
  if (!isProfileComplete || !recommendation) {
    return (
      <SetupForm
        userName={userName}
        onComplete={(data) =>
          saveProfile({ weight: data.weight, height: data.height, region: data.region })
        }
      />
    );
  }

  const rec = recommendation;

  // Personalized insight line
  let insightLine = rec.dominantSymptoms.length > 0
    ? `Based on your recent ${rec.dominantSymptoms.join(", ").toLowerCase()} symptoms`
    : rec.cyclePhaseLabel
    ? `Tailored for your ${rec.cyclePhaseLabel.toLowerCase()}`
    : `Tailored for your ${phaseName.toLowerCase()} journey`;
    
  if (sleepInsights && sleepInsights.includes("Low energy")) {
    insightLine = sleepInsights;
  }

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* ── Personalized Header ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-teal-50 via-emerald-50/30 to-white border-b border-border">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex flex-col gap-4">
              {/* Greeting */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200/40">
                    {timeOfDay === "morning" ? (
                      <Sun className="w-6 h-6 text-white" />
                    ) : timeOfDay === "afternoon" ? (
                      <Zap className="w-6 h-6 text-white" />
                    ) : (
                      <Moon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground" id="wellness-title">
                      {greeting}, {firstName || "there"}! ✨
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {insightLine}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clearProfile}
                  title="Reset profile"
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/60 border border-border/50 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full border px-2.5 py-0.5 ${phaseColor}`}>
                  {phaseEmoji} {phaseName}
                </span>
                {rec.cyclePhaseLabel && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full border border-purple-200 bg-purple-50 text-purple-700 px-2.5 py-0.5">
                    🔄 {rec.cyclePhaseLabel}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full bg-muted/60 px-2.5 py-0.5 text-muted-foreground">
                  <Clock className="w-3 h-3" /> {rec.dataFreshness}
                </span>
              </div>

              {/* Profile data strip */}
              <ProfileStrip
                age={age}
                weight={profile!.weight}
                height={profile!.height}
                region={profile!.region}
                loggedDays={recentLogCount}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-5">
        {/* ── 1. Health Score Hero / Empty State ────────────────────────── */}
        {pubertyLogs.length > 0 ? (
          <ScrollReveal>
            <HealthScoreHero data={heroData} />
          </ScrollReveal>
        ) : (
          <ScrollReveal>
            <div className="rounded-3xl border border-dashed border-teal-200 bg-gradient-to-b from-teal-50/50 to-white p-8 text-center shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-4 drop-shadow-sm">
                <CalendarCheck className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Start Your Tracking Journey</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto leading-relaxed">
                Log your symptoms today to unlock your personalized health score, intelligent insights, and visual analytics.
              </p>
              <Link
                to="/calendar"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold text-sm shadow-lg shadow-teal-200/50 hover:shadow-xl hover:shadow-teal-300/50 transition-all active:scale-[0.98]"
              >
                Log Today's Symptoms <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        )}

        {/* ── 2. Smart Insights ────────────────────────────────────────────── */}
        {smartInsights.length > 0 && (
          <ScrollReveal delay={40}>
            <InsightsCard insights={smartInsights} />
          </ScrollReveal>
        )}

        {/* ── 3. BMI Weight Gauge ──────────────────────────────────────────── */}
        <ScrollReveal delay={60}>
          <WeightGauge
            bmi={rec.bmi.value}
            weight={profile!.weight}
            height={profile!.height}
          />
        </ScrollReveal>

        {/* ── 4. Visual Analytics (UNCHANGED from Dashboard) ───────────────── */}
        {pubertyLogs.length > 0 && (
          <ScrollReveal delay={80}>
            <VisualAnalytics pubertyLogs={pubertyLogs} />
          </ScrollReveal>
        )}

        {/* ── 5. Water Intake ───────────────────────────────────────────────── */}
        <ScrollReveal delay={140}>
          <ExpandableCard
            id="wellness-water"
            icon={Droplets}
            iconBg="bg-cyan-100 text-cyan-600"
            title="Water Intake"
            summary={`${rec.waterIntake.liters}L recommended based on your weight`}
            defaultOpen
          >
            <div className="flex flex-col items-center py-2">
              <WaterRing liters={rec.waterIntake.liters} />
              <p className="text-sm font-semibold text-foreground mt-3">{rec.waterIntake.display}</p>
              <p className="text-xs text-muted-foreground mt-1 text-center max-w-xs">
                Based on your weight of {profile!.weight}kg.
                Carry a water bottle and sip throughout the day.
              </p>
            </div>
          </ExpandableCard>
        </ScrollReveal>

        {/* ── 6. Calendar CTA ──────────────────────────────────────────────── */}
        <ScrollReveal delay={180}>
          <Link
            to="/calendar"
            className="block rounded-2xl border border-border bg-card p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Log Today's Symptoms</p>
                  <p className="text-xs text-muted-foreground">
                    {recentLogCount > 0
                      ? `${recentLogCount} log${recentLogCount > 1 ? "s" : ""} this week — keep the streak going!`
                      : "Tap to open Calendar & update your daily health log"}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </div>
          </Link>
        </ScrollReveal>

        {/* ── 12. Privacy footer ─────────────────────────────────────────────── */}
        <ScrollReveal delay={200}>
          <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              All your health data is stored locally on your device. Nothing is sent to any server.
              These recommendations are for guidance only — always consult your doctor for medical advice.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
