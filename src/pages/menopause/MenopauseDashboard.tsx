import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Activity, Bone, Apple, Moon, Scale, Heart, Bot, Building2,
  Target, Sparkles, TrendingUp, TrendingDown, Minus, ChevronRight,
  Sun, Calendar, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause, getStageLabel, getStageDescription } from "@/hooks/useMenopause";
import {
  computeMenoWellnessScore,
  getTopSymptomsThisWeek,
  getSleepMoodSummary,
  getDailyGuidance,
  getBoneHealthStatus,
} from "@/lib/menopauseDashboardEngine";
import ScrollReveal from "@/components/ScrollReveal";

// ─── Animated Score Ring ──────────────────────────────────────────────────────

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 50;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;
  const strokeColor = color === "emerald" ? "#10b981" : color === "amber" ? "#f59e0b" : color === "rose" ? "#f43f5e" : "#94a3b8";

  return (
    <div className="relative w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="hsl(260 20% 94%)" strokeWidth={stroke} />
        <circle cx="56" cy="56" r={radius} fill="none" stroke={strokeColor} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={progress} transform="rotate(-90 56 56)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold" style={{ color: strokeColor }}>{score}</span>
        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────────

function ModuleCard({ to, icon: Icon, label, emoji, gradient, delay = 0 }: {
  to: string; icon: any; label: string; emoji: string; gradient: string; delay?: number;
}) {
  return (
    <ScrollReveal delay={delay}>
      <Link
        to={to}
        className={cn(
          "group flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm",
          "shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-[0.97]"
        )}
      >
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110", gradient)}>
          <Icon className="w-5.5 h-5.5 text-white" />
        </div>
        <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{label}</span>
      </Link>
    </ScrollReveal>
  );
}

// ─── Trend Arrow ──────────────────────────────────────────────────────────────

function TrendArrow({ dir, good }: { dir: "up" | "down" | "stable"; good?: boolean }) {
  if (dir === "stable") return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  if (dir === "up") return <TrendingUp className={cn("w-3.5 h-3.5", good ? "text-emerald-500" : "text-rose-500")} />;
  return <TrendingDown className={cn("w-3.5 h-3.5", good ? "text-emerald-500" : "text-rose-500")} />;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MenopauseDashboard() {
  const { profile, logs } = useMenopause();

  const wellnessScore = useMemo(() => computeMenoWellnessScore(logs, profile), [logs, profile]);
  const topSymptoms = useMemo(() => getTopSymptomsThisWeek(logs), [logs]);
  const sleepMood = useMemo(() => getSleepMoodSummary(logs), [logs]);
  const guidance = useMemo(() => getDailyGuidance(profile, logs), [profile, logs]);
  const boneHealth = useMemo(() => getBoneHealthStatus(logs, profile), [logs, profile]);

  const stage = profile?.stage || "menopause";
  const stageLabel = getStageLabel(stage);
  const stageDesc = getStageDescription(stage);

  const stageTheme = stage === "perimenopause"
    ? "bg-teal-50 text-teal-700 border-teal-200"
    : stage === "menopause"
    ? "bg-purple-50 text-purple-700 border-purple-200"
    : "bg-indigo-50 text-indigo-700 border-indigo-200";

  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-teal-50/20">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="border-b border-purple-100/60 bg-white/40 backdrop-blur-sm">
        <div className="container py-6 space-y-4">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center shadow-lg shadow-purple-200/40">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{greeting} ✨</h1>
                <p className="text-xs text-slate-500">Your Menopause Wellness Dashboard</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Stage badge */}
          <ScrollReveal delay={50}>
            <div className={cn("rounded-xl border p-4 flex items-start gap-3", stageTheme)}>
              <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center flex-shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">Your Stage</span>
                  <span className="text-sm font-bold">{stageLabel}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-80">{stageDesc}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-5 space-y-5">
        {/* ── 1. Wellness Score + Daily Guidance ─────────────────── */}
        <div className="grid md:grid-cols-2 gap-4">
          <ScrollReveal>
            <div className={cn(
              "rounded-2xl p-5 border-2 relative overflow-hidden",
              wellnessScore.color === "emerald" ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50"
                : wellnessScore.color === "amber" ? "border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/50"
                : wellnessScore.color === "rose" ? "border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50/50"
                : "border-slate-200 bg-white"
            )}>
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/20 blur-3xl pointer-events-none" />
              <div className="flex items-center gap-4">
                <ScoreRing score={wellnessScore.score} color={wellnessScore.color} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Wellness Score</p>
                  <h2 className="text-lg font-bold text-slate-800">{wellnessScore.label}</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{wellnessScore.insight}</p>
                  <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-medium text-slate-400">
                    <Sparkles className="w-3 h-3" /> {wellnessScore.loggedDays}/{wellnessScore.totalDays} days logged
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={60}>
            <div className={cn(
              "rounded-2xl border p-5 h-full flex items-start gap-4",
              guidance.tone === "positive" ? "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
                : guidance.tone === "caution" ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
                : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
            )}>
              <span className="text-4xl flex-shrink-0">{guidance.emoji}</span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Today's Guidance</p>
                <h3 className={cn("text-base font-bold mb-1",
                  guidance.tone === "positive" ? "text-emerald-800" : guidance.tone === "caution" ? "text-amber-800" : "text-purple-800"
                )}>{guidance.headline}</h3>
                <p className={cn("text-sm leading-relaxed opacity-80",
                  guidance.tone === "positive" ? "text-emerald-700" : guidance.tone === "caution" ? "text-amber-700" : "text-purple-700"
                )}>{guidance.message}</p>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ── 2. Top Symptoms This Week ─────────────────────────── */}
        {topSymptoms.length > 0 && (
          <ScrollReveal delay={80}>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Top Symptoms This Week</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {topSymptoms.map((sym) => (
                  <div key={sym.id} className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/60 border border-purple-100/60 hover:shadow-sm transition-all">
                    <span className="text-xl flex-shrink-0">{sym.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{sym.label}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold text-purple-600">{sym.avgSeverity}/5</span>
                        <TrendArrow dir={sym.trend} />
                        <span className="text-[10px] text-slate-400">{sym.frequency}d</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ── 3. Sleep & Mood + Bone Health ─────────────────────── */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Sleep & Mood Summary */}
          <ScrollReveal delay={100}>
            <div className="rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                  <Moon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Sleep & Mood</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/70 p-3.5 border border-indigo-100/50">
                  <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">Avg Sleep</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-800">{sleepMood.avgSleep || "–"}h</span>
                    <TrendArrow dir={sleepMood.sleepTrend} good={sleepMood.sleepTrend === "up"} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{sleepMood.sleepLabel}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-3.5 border border-indigo-100/50">
                  <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider mb-1">Avg Mood</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-800">{sleepMood.avgMood || "–"}/5</span>
                    <TrendArrow dir={sleepMood.moodTrend} good={sleepMood.moodTrend === "up"} />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{sleepMood.moodLabel}</p>
                </div>
              </div>
              <Link to="/menopause/sleep-mood" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
                View details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Bone Health Reminder */}
          <ScrollReveal delay={120}>
            <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50/80 to-emerald-50/40 p-5 h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md">
                  <Bone className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Bone Health</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/70 p-3.5 border border-teal-100/50">
                  <p className="text-[10px] font-semibold text-teal-600 uppercase tracking-wider mb-1">Calcium</p>
                  <span className="text-xl font-bold text-slate-800">{boneHealth.calciumAdequacy}%</span>
                  <p className="text-[10px] text-slate-500 mt-1">of 1200mg target</p>
                </div>
                <div className="rounded-xl bg-white/70 p-3.5 border border-teal-100/50">
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Vitamin D</p>
                  <span className="text-xl font-bold text-slate-800">{boneHealth.vitaminDStreak}</span>
                  <p className="text-[10px] text-slate-500 mt-1">day streak</p>
                </div>
              </div>
              {boneHealth.alerts.length > 0 && (
                <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-medium">
                  ⚠️ {boneHealth.alerts[0]}
                </div>
              )}
              <Link to="/menopause/bone-health" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors">
                View details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* ── 4. Quick Access Grid ──────────────────────────────── */}
        <ScrollReveal delay={140}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Your Modules</h2>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <ModuleCard to="/menopause/symptoms" icon={Activity} label="Symptom Tracker" emoji="📊" gradient="bg-gradient-to-br from-purple-500 to-indigo-500" delay={150} />
          <ModuleCard to="/menopause/bone-health" icon={Bone} label="Bone Health" emoji="🦴" gradient="bg-gradient-to-br from-teal-500 to-emerald-500" delay={160} />
          <ModuleCard to="/menopause/nutrition" icon={Apple} label="Nutrition Guide" emoji="🥗" gradient="bg-gradient-to-br from-green-500 to-emerald-500" delay={170} />
          <ModuleCard to="/menopause/sleep-mood" icon={Moon} label="Sleep & Mood" emoji="😴" gradient="bg-gradient-to-br from-indigo-500 to-purple-500" delay={180} />
          <ModuleCard to="/menopause/weight" icon={Scale} label="Weight & Metabolism" emoji="⚖️" gradient="bg-gradient-to-br from-blue-500 to-cyan-500" delay={190} />
          <ModuleCard to="/menopause/heart" icon={Heart} label="Heart Health" emoji="❤️" gradient="bg-gradient-to-br from-rose-500 to-pink-500" delay={200} />
          <ModuleCard to="/menopause/goals" icon={Target} label="Daily Goals" emoji="🎯" gradient="bg-gradient-to-br from-amber-500 to-orange-500" delay={210} />
          <ModuleCard to="/menopause/fun" icon={Sparkles} label="Fun Activity" emoji="🌟" gradient="bg-gradient-to-br from-pink-500 to-rose-400" delay={220} />
          <ModuleCard to="/assistant" icon={Bot} label="AI Assistant" emoji="🤖" gradient="bg-gradient-to-br from-violet-500 to-purple-600" delay={230} />
          <ModuleCard to="/phc-nearby" icon={Building2} label="PHC Support" emoji="🏥" gradient="bg-gradient-to-br from-slate-600 to-slate-800" delay={240} />
        </div>

        {/* ── Privacy Footer ────────────────────────────────────── */}
        <ScrollReveal delay={260}>
          <div className="rounded-2xl border border-slate-200/60 bg-white/60 p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              All health data stays on your device. These insights are for guidance only — always consult your doctor.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
