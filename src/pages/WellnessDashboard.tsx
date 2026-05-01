
import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useWellnessRecommendation } from "@/hooks/useWellnessRecommendation";
import { usePhase } from "@/hooks/usePhase";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog, PubertyEntry, FamilyPlanningEntry } from "@/hooks/useHealthLog";
import VisualAnalytics from "@/components/dashboard/VisualAnalytics";
import {
  computeWellnessScore,
  generatePriorityActions,
  computeBodySignals,
  generateSmartPredictions,
  getCompletedActions,
  toggleActionComplete,
  type WellnessScoreResult,
  type PriorityAction,
  type BodySignal,
  type SmartPrediction,
} from "@/lib/wellnessCommandEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import type { Region } from "@/lib/nutritionData";

import {
  Sparkles, Droplets, Moon, Activity, ArrowRight,
  Scale, Ruler, MapPin, CalendarCheck, TrendingUp, TrendingDown,
  Shield, Clock, Zap, Sun, Check, RotateCcw, Minus,
  Calendar, Heart, Utensils, ChevronRight, BarChart3, Lightbulb, AlertTriangle,
} from "lucide-react";

// ─── Region config ────────────────────────────────────────────────────────────

const REGIONS: { val: Region; label: string; emoji: string }[] = [
  { val: "south", label: "South India", emoji: "🌴" },
  { val: "north", label: "North India", emoji: "🏔️" },
  { val: "east", label: "East India", emoji: "🌿" },
  { val: "west", label: "West India", emoji: "🏖️" },
];

// ─── Time helpers ─────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hr = new Date().getHours();
  if (hr < 12) return "Good morning";
  if (hr < 17) return "Good afternoon";
  return "Good evening";
}

function getTimeIcon() {
  const hr = new Date().getHours();
  if (hr < 12) return <Sun className="w-6 h-6 text-white" />;
  if (hr < 17) return <Zap className="w-6 h-6 text-white" />;
  return <Moon className="w-6 h-6 text-white" />;
}

// ─── Animated Score Ring ──────────────────────────────────────────────────────

function ScoreRing({ score, color }: { score: number; color: string }) {
  const [animated, setAnimated] = useState(0);
  const radius = 54;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - animated) / 100) * circumference;

  const strokeColor = color === "emerald" ? "#10b981" : color === "amber" ? "#f59e0b" : color === "rose" ? "#f43f5e" : "#94a3b8";
  const glowColor = color === "emerald" ? "rgba(16,185,129,0.3)" : color === "amber" ? "rgba(245,158,11,0.3)" : "rgba(244,63,94,0.3)";

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="relative w-32 h-32">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="currentColor" className="text-slate-100" strokeWidth={stroke} />
        <circle cx="64" cy="64" r={radius} fill="none" stroke={strokeColor} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={progress} transform="rotate(-90 64 64)"
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})`, transition: "stroke-dashoffset 0.3s" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color: strokeColor }}>{animated}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ─── Setup Form (preserved) ───────────────────────────────────────────────────

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
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
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
            <div className="space-y-2">
              <label htmlFor="wellness-weight" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Scale className="w-4 h-4 text-teal-600" /> Weight (kg)
              </label>
              <input id="wellness-weight" type="number" inputMode="decimal" placeholder="e.g., 55" value={weight}
                onChange={(e) => { setWeight(e.target.value); setErrors((p) => ({ ...p, weight: undefined })); }}
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all" />
              {errors.weight && <p className="text-xs text-red-500 mt-1">{errors.weight}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="wellness-height" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-teal-600" /> Height (cm)
              </label>
              <input id="wellness-height" type="number" inputMode="decimal" placeholder="e.g., 160" value={height}
                onChange={(e) => { setHeight(e.target.value); setErrors((p) => ({ ...p, height: undefined })); }}
                className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all" />
              {errors.height && <p className="text-xs text-red-500 mt-1">{errors.height}</p>}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600" /> Your Region
              </p>
              <div className="grid grid-cols-2 gap-2">
                {REGIONS.map((r) => (
                  <button key={r.val} type="button" onClick={() => setRegion(r.val)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                      region === r.val ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    <span className="text-base">{r.emoji}</span> {r.label}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" onClick={handleSubmit}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              Get My Wellness Plan <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[11px] text-slate-400 text-center">Your data stays on your device.</p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}

// ─── Main Wellness Command Center ─────────────────────────────────────────────

export default function WellnessDashboard() {
  const { simpleMode } = useLanguage();
  const { phase, phaseEmoji, phaseName, phaseColor } = usePhase();
  const { user, fullProfile } = useAuth();
  const { getPhaseLogs } = useHealthLog();
  const logs = useMemo(() => getPhaseLogs(phase), [getPhaseLogs, phase]);
  const {
    profile: wellnessProfile, recommendation, isProfileComplete, saveProfile, clearProfile, age,
  } = useWellnessRecommendation();

  const userName = user?.name || fullProfile?.basic?.fullName || "";
  const firstName = userName.split(" ")[0] || "";
  const greeting = getGreeting();

  // ── Normalized logs for analytics charts ────────────────
  const pubertyLogs = useMemo(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    return Object.entries(logs)
      .filter(([date, entry]) => {
        if (entry.phase !== "puberty" && entry.phase !== "family-planning") return false;
        if (date > todayISO) return false;
        if ((entry as any)._periodAutoMarked) return false;
        if (entry.phase === "puberty") {
          const e = entry as PubertyEntry;
          return Object.values(e.symptoms).some(Boolean) || !!e.mood || e.periodStarted;
        }
        if (entry.phase === "family-planning") {
          const e = entry as FamilyPlanningEntry;
          return Object.values(e.symptoms).some(Boolean) || !!e.mood;
        }
        return false;
      })
      .map(([date, entry]) => {
        if (entry.phase === "family-planning") {
          const fp = entry as FamilyPlanningEntry;
          const norm: PubertyEntry = {
            phase: "puberty", periodStarted: false, periodEnded: false,
            flowIntensity: null,
            symptoms: { cramps: fp.symptoms.ovulationPain, fatigue: fp.symptoms.fatigue, moodSwings: fp.symptoms.moodChanges, headache: fp.symptoms.stress, acne: false, breastTenderness: fp.symptoms.sleepIssues },
            mood: fp.mood, sleepHours: fp.sleepHours ?? null, sleepQuality: fp.sleepQuality ?? null, notes: fp.notes,
          };
          return { date, entry: norm };
        }
        return { date, entry: entry as PubertyEntry };
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [logs]);

  // ── Chart-driven actionable insights ────────────────────
  const chartInsights = useMemo(() => {
    const items: { title: string; action: string; tone: "positive" | "warning" | "neutral" }[] = [];
    if (pubertyLogs.length < 2) return items;
    const recent = pubertyLogs.slice(0, 7);
    const moodLowDays = recent.filter(l => l.entry.mood === "Low").length;
    const fatigueDays = recent.filter(l => l.entry.symptoms.fatigue).length;
    const highSymDays = recent.filter(l => Object.values(l.entry.symptoms).filter(Boolean).length >= 3).length;
    const goodDays = recent.filter(l => l.entry.mood === "Good" && !l.entry.symptoms.fatigue).length;

    if (moodLowDays >= 3) items.push({ title: `Low mood detected (${moodLowDays} days)`, action: "Try adding omega-3 rich foods to your meals and getting 15 minutes of direct sunlight today.", tone: "warning" });
    if (fatigueDays >= 3) items.push({ title: `High fatigue (${fatigueDays} times)`, action: "Prioritize iron-rich meals like spinach or lentils, and aim for a strict 7+ hours of sleep tonight.", tone: "warning" });
    if (highSymDays >= 2) items.push({ title: `Heavy symptoms (${highSymDays} days)`, action: "Your body is working hard. Consider taking a rest day, stretching, and drinking warm ginger tea.", tone: "warning" });
    if (goodDays >= 4) items.push({ title: "Excellent wellness streak! 🌟", action: "Your current routine is working perfectly. You had 4+ great days this week. Keep up the great work!", tone: "positive" });
    if (items.length === 0 && recent.length >= 3) items.push({ title: "Patterns looking steady", action: "Continue logging your daily symptoms to refine these insights.", tone: "neutral" });
    return items.slice(0, 2);
  }, [pubertyLogs]);

  // ── Engine computations ─────────────────────────────────
  const wellnessScore = useMemo(() => computeWellnessScore(logs, phase), [logs, phase]);
  const priorityActions = useMemo(() => generatePriorityActions(logs, phase, wellnessProfile?.weight ?? null), [logs, phase, wellnessProfile]);
  const bodySignals = useMemo(() => computeBodySignals(logs, phase), [logs, phase]);
  const predictions = useMemo(() => generateSmartPredictions(logs, phase), [logs, phase]);

  // ── Action completion state ─────────────────────────────
  const [completionStore, setCompletionStore] = useState(() => getCompletedActions());
  const handleToggle = useCallback((id: string) => {
    setCompletionStore(toggleActionComplete(id));
  }, []);

  
  
  // --- Setup phase ---
  if (!isProfileComplete || !recommendation) {
    return <SetupForm userName={userName} onComplete={(data) => saveProfile({ weight: data.weight, height: data.height, region: data.region })} />;
  }

  const trendIcon = (t: string) => {
    if (t === "up") return <TrendingUp className="w-3.5 h-3.5" />;
    if (t === "down") return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const signalColor = (s: string) => {
    if (s === "good") return { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-600", bar: "bg-emerald-500" };
    if (s === "moderate") return { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-600", bar: "bg-amber-500" };
    return { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-600", bar: "bg-rose-500" };
  };

  const predBarColor = (p: number) => p >= 60 ? "bg-rose-500" : p >= 35 ? "bg-amber-400" : "bg-emerald-400";

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-teal-50 via-emerald-50/30 to-white border-b border-border">
        <div className="container py-5">
          <ScrollReveal>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-200/40">
                  {getTimeIcon()}
                </div>
                <div>
                  <h1 className="text-xl font-bold" id="wellness-title">{greeting}, {firstName || "there"}! ✨</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Your Wellness Command Center</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-3">
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full border px-2.5 py-0.5 ${phaseColor}`}>{phaseEmoji} {phaseName}</span>
              {recommendation.cyclePhaseLabel && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full border border-purple-200 bg-purple-50 text-purple-700 px-2.5 py-0.5">🔄 {recommendation.cyclePhaseLabel}</span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-medium rounded-full bg-muted/60 px-2.5 py-0.5 text-muted-foreground">
                <Clock className="w-3 h-3" /> {recommendation.dataFreshness}
              </span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-5 space-y-5">
        {/* ── 1. Daily Wellness Status ───────────────────────────── */}
        <ScrollReveal>
          <div className={`rounded-3xl p-6 border-2 relative overflow-hidden ${
            wellnessScore.color === "emerald" ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50"
            : wellnessScore.color === "amber" ? "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/50"
            : wellnessScore.color === "rose" ? "border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50/50"
            : "border-border bg-card"
          }`}>
            <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/20 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-5">
              <ScoreRing score={wellnessScore.score} color={wellnessScore.color} />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Wellness Score</p>
                <h2 className="text-lg font-bold">{wellnessScore.label}</h2>
                <p className="text-sm text-foreground/70 mt-1.5 leading-relaxed">{wellnessScore.insight}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 inline mr-1" />AI Insight
                  </span>
                  <span className="text-[10px] text-muted-foreground">{wellnessScore.loggedDays}/{wellnessScore.totalDays} days logged</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── 2. Priority Actions ────────────────────────────────── */}
        <ScrollReveal delay={10}>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider">Priority Actions</h2>
              </div>
              {completionStore.streak > 0 && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                  🔥 {completionStore.streak}-day streak
                </span>
              )}
            </div>
            <div className="space-y-3">
              {priorityActions.map((action) => {
                const done = completionStore.completed.includes(action.id);
                return (
                  <div key={action.id} className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
                    done ? "bg-emerald-50/50 border-emerald-200" : "bg-muted/20 border-border/60 hover:border-border"
                  }`}>
                    <button type="button" onClick={() => handleToggle(action.id)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        done ? "bg-emerald-500 border-emerald-500 text-white" : "border-border hover:border-primary"
                      }`}>
                      {done && <Check className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{action.icon}</span>
                        <p className={`text-sm font-semibold ${done ? "line-through text-muted-foreground" : ""}`}>{action.text}</p>
                        {action.impact === "high" && !done && (
                          <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-600">High</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{action.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* ── 3. Body Signals Grid ───────────────────────────────── */}
        <ScrollReveal delay={20}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider">Body Signals</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bodySignals.map((signal) => {
              const c = signalColor(signal.status);
              const statusLabel = signal.status === "good" ? "Optimal" : signal.status === "moderate" ? "Fair" : "Needs Attention";
              const trendLabel = signal.trend === "up" ? "Trending Up" : signal.trend === "down" ? "Trending Down" : "Stable Pattern";

              return (
                <Link key={signal.id} to="/calendar"
                  className={`rounded-2xl border p-4 ${c.bg} ${c.border} hover:shadow-md transition-all active:scale-[0.98] group flex flex-col justify-between`}>
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                        {signal.emoji}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{signal.label}</h3>
                        <p className={`text-[10px] font-extrabold uppercase tracking-widest ${c.text}`}>
                          {statusLabel}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full bg-white/60 ${c.text} shadow-sm`}>
                      {trendIcon(signal.trend)}
                    </div>
                  </div>

                  <p className="text-xs font-medium text-slate-700 leading-relaxed mb-4">
                    {signal.detail}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {trendLabel}
                    </span>
                    <div className="flex gap-1">
                      <div className={`w-3 h-1.5 rounded-full ${c.bar}`} />
                      <div className={`w-3 h-1.5 rounded-full ${signal.status === "good" || signal.status === "moderate" ? c.bar : "bg-black/10"}`} />
                      <div className={`w-3 h-1.5 rounded-full ${signal.status === "good" ? c.bar : "bg-black/10"}`} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </ScrollReveal>

        {/* ── 3b. Visual Analytics Charts ────────────────────────── */}
        {pubertyLogs.length >= 2 && (
          <ScrollReveal delay={25}>
            <VisualAnalytics pubertyLogs={pubertyLogs} />

            {/* Chart-driven actionable insights */}
            {chartInsights.length > 0 && (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {chartInsights.map((insight, i) => (
                  <div key={i} className={`flex flex-col p-5 rounded-3xl border transition-all hover:shadow-lg ${
                    insight.tone === "warning" ? "bg-amber-50/50 border-amber-200 shadow-[0_8px_24px_rgba(251,191,36,0.12)]" : 
                    insight.tone === "positive" ? "bg-emerald-50/50 border-emerald-200 shadow-[0_8px_24px_rgba(52,211,153,0.12)]" : 
                    "bg-blue-50/50 border-blue-200 shadow-[0_8px_24px_rgba(96,165,250,0.12)]"
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-2xl shadow-sm ${
                        insight.tone === "warning" ? "bg-amber-100 text-amber-600" : 
                        insight.tone === "positive" ? "bg-emerald-100 text-emerald-600" : 
                        "bg-blue-100 text-blue-600"
                      }`}>
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <h4 className={`text-sm font-bold ${
                        insight.tone === "warning" ? "text-amber-950" : 
                        insight.tone === "positive" ? "text-emerald-950" : 
                        "text-blue-950"
                      }`}>
                        {insight.title}
                      </h4>
                    </div>
                    <p className={`text-[13px] font-medium leading-relaxed ${
                      insight.tone === "warning" ? "text-amber-800" : 
                      insight.tone === "positive" ? "text-emerald-800" : 
                      "text-blue-800"
                    }`}>
                      {insight.action}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollReveal>
        )}

        {/* ── 4. Smart Predictions ───────────────────────────────── */}
        <ScrollReveal delay={30}>
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider">Smart Predictions</h2>
              <span className="ml-auto text-[10px] text-muted-foreground">Next 1-3 days</span>
            </div>
            <div className="space-y-4">
              {predictions.map((pred) => (
                <div key={pred.id} className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-border/60 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{pred.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <p className="text-base font-bold text-slate-800">{pred.symptom}</p>
                        {pred.probability > 0 && (
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                            pred.probability >= 60 ? "bg-rose-100 text-rose-700" : 
                            pred.probability >= 35 ? "bg-amber-100 text-amber-700" : 
                            "bg-emerald-100 text-emerald-700"
                          }`}>
                            <Clock className="w-3 h-3" /> Likely {pred.timeframe}
                          </span>
                        )}
                      </div>
                      {pred.probability > 0 && (
                        <span className={`text-sm font-black ${pred.probability >= 60 ? "text-rose-600" : pred.probability >= 35 ? "text-amber-600" : "text-emerald-600"}`}>
                          {pred.probability}%
                        </span>
                      )}
                    </div>
                    {pred.probability > 0 && (
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2.5">
                        <div className={`h-full rounded-full ${predBarColor(pred.probability)}`} style={{ width: `${pred.probability}%` }} />
                      </div>
                    )}
                    <div className="flex flex-wrap items-center">
                      <span className="text-xs font-semibold text-slate-500">
                        {pred.reason}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── 5. Quick Actions ──────────────────────────────────── */}
        <ScrollReveal delay={40}>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {[
              { to: "/calendar", icon: <CalendarCheck className="w-5 h-5" />, label: "Log Symptoms", color: "from-teal-500 to-emerald-500" },
              { to: "/nutrition", icon: <Utensils className="w-5 h-5" />, label: "Nutrition", color: "from-violet-500 to-purple-500" },
              { to: "/calendar", icon: <Heart className="w-5 h-5" />, label: "Track Cycle", color: "from-pink-500 to-rose-500" },
              { to: "/profile", icon: <Scale className="w-5 h-5" />, label: "Update Weight", color: "from-blue-500 to-cyan-500" },
            ].map((btn) => (
              <Link key={btn.label} to={btn.to}
                className={`flex-none flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r ${btn.color} text-white text-sm font-semibold shadow-md hover:shadow-lg active:scale-[0.97] transition-all`}>
                {btn.icon} {btn.label}
              </Link>
            ))}
          </div>
        </ScrollReveal>

        
        {/* ── Privacy Footer ────────────────────────────────────── */}
        <ScrollReveal delay={50}>
          <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              All health data stays on your device. These recommendations are for guidance only — always consult your doctor.
            </p>
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
