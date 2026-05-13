import React, { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Calendar, 
  Activity, 
  Sparkles, 
  ChevronRight, 
  Thermometer, 
  Moon, 
  Utensils, 
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Compass,
  Smile,
  Flame,
  Bed,
  CircleDot,
  ClipboardCheck,
  Weight,
  Droplets,
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause, MenopauseLogEntry, MenopauseProfile, getStageLabel, getStageDescription } from "@/hooks/useMenopause";
import { useHealthLog } from "@/hooks/useHealthLog";
import ScrollReveal from "@/components/ScrollReveal";

// ─── Types ───────────────────────────────────────────────────────────────────

type TrendDir = "up" | "down" | "stable";

const FOCUS_STORAGE_KEY = "ss-meno-wellness-focus-done";
const MOOD_STORAGE_KEY = "ss-meno-quick-checkin";
const moodOptions = ["Calm", "Okay", "Low energy", "Tired", "Anxious", "Restless"];

function recentLogsByDays(logs: MenopauseLogEntry[], days: number) {
  const now = new Date();
  return logs.filter((l) => {
    const diff = (now.getTime() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= days && diff >= 0;
  });
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const radius = 54;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;
  const strokeColor = color === "emerald" ? "#0f766e" : color === "amber" ? "#d97706" : color === "rose" ? "#e11d48" : "#64748b";

  return (
    <div className="relative w-32 h-32">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          transform="rotate(-90 64 64)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black" style={{ color: strokeColor }}>{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Wellness</span>
      </div>
    </div>
  );
}

function TrendArrow({ dir, good }: { dir: TrendDir; good?: boolean }) {
  if (dir === "stable") return <Minus className="w-3.5 h-3.5 text-slate-400" />;
  if (dir === "up") return <TrendingUp className={cn("w-3.5 h-3.5", good ? "text-teal-600" : "text-rose-600")} />;
  return <TrendingDown className={cn("w-3.5 h-3.5", good ? "text-teal-600" : "text-rose-600")} />;
}

function readTodayChecked(): string[] {
  try {
    const raw = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    return data.date === today ? (data.checked as string[]) : [];
  } catch {
    return [];
  }
}

function writeTodayChecked(checked: string[]) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify({ date: today, checked }));
}

function readTodayMood(): string {
  try {
    const raw = localStorage.getItem(MOOD_STORAGE_KEY);
    if (!raw) return "";
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    return data.date === today ? String(data.mood || "") : "";
  } catch {
    return "";
  }
}

function writeTodayMood(mood: string) {
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify({ date: today, mood }));
}

function TinySparkline({ points }: { points: number[] }) {
  if (points.length < 2) return <div className="h-8 rounded-md bg-slate-100" />;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const spread = Math.max(1, max - min);
  const coords = points.map((p, i) => `${(i / (points.length - 1)) * 100},${100 - ((p - min) / spread) * 100}`).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="h-8 w-full">
      <polyline points={coords} fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function actionReason(actionText: string, focusTitle: string) {
  const text = actionText.toLowerCase();
  if (text.includes("water") || text.includes("hydrat")) return "Supports temperature balance and may ease symptom intensity.";
  if (text.includes("sleep") || text.includes("bed")) return "Better rest can improve mood, energy, and symptom recovery.";
  if (text.includes("calcium") || text.includes("sun") || text.includes("vitamin")) return "Helps protect bone strength during menopause transition.";
  if (text.includes("walk") || text.includes("stretch") || text.includes("movement")) return "Gentle movement eases stiffness and improves energy.";
  if (focusTitle.toLowerCase().includes("mood") || focusTitle.toLowerCase().includes("anxiety")) return "Small calming actions can reduce stress spikes through the day.";
  return "One small daily step now can reduce symptom build-up later.";
}

function WellnessFocusPanel({ focusEmoji, focusTitle, explanation, actions, redFlagAlert, tone, checked, onToggle }: {
  focusEmoji: string;
  focusTitle: string;
  explanation: string;
  actions: WellnessFocusAction[];
  redFlagAlert: string | null;
  tone: "positive" | "caution" | "info" | "alert";
  checked: string[];
  onToggle: (id: string) => void;
}) {

  const allDone = actions.length > 0 && actions.every((a) => checked.includes(a.id));
  const toneColors = {
    positive: { border: "border-teal-200/80", bg: "bg-gradient-to-br from-teal-50 to-sky-50", icon: "from-teal-600 to-cyan-600", title: "text-teal-900" },
    caution: { border: "border-amber-200/80", bg: "bg-gradient-to-br from-amber-50 to-orange-50", icon: "from-amber-600 to-orange-600", title: "text-amber-900" },
    info: { border: "border-violet-200/80", bg: "bg-gradient-to-br from-violet-50 to-sky-50", icon: "from-violet-600 to-sky-600", title: "text-violet-900" },
    alert: { border: "border-rose-200/80", bg: "bg-gradient-to-br from-rose-50 to-red-50", icon: "from-rose-600 to-red-600", title: "text-rose-900" },
  };
  const c = toneColors[tone];

  return (
    <section className={cn("rounded-2xl border p-5 relative overflow-hidden shadow-sm", c.border, c.bg)}>
      <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-white/20 blur-3xl pointer-events-none" />
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md", c.icon)}>
            <Compass className="w-5 h-5 text-white" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Your Wellness Focus Today</p>
        </div>
        <span className="text-xs font-semibold text-slate-600">{checked.length} of {actions.length}</span>
      </div>

      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl mt-0.5" aria-hidden>{focusEmoji}</span>
        <div>
          <h3 className={cn("text-base font-bold leading-snug mb-1", c.title)}>{focusTitle}</h3>
          <p className="text-xs text-slate-600 leading-relaxed">{explanation}</p>
        </div>
      </div>

      {redFlagAlert && (
        <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-rose-100 border border-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5" />
          <p className="text-xs font-semibold text-rose-700">{redFlagAlert}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-3">
        {actions.map((action) => {
          const isDone = checked.includes(action.id);
          return (
            <button
              key={action.id}
              onClick={() => onToggle(action.id)}
              aria-pressed={isDone}
              className={cn(
                "w-full p-3 rounded-2xl border text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
                isDone ? "bg-teal-50 border-teal-300 shadow-sm" : "bg-white/85 border-slate-200 hover:bg-white hover:shadow-md hover:-translate-y-0.5",
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{action.icon}</span>
                  <p className={cn("text-xs font-semibold", isDone ? "text-teal-800" : "text-slate-800")}>{action.text}</p>
                </div>
                {isDone ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : <Circle className="w-4 h-4 text-slate-300" />}
              </div>
              <p className={cn("text-[11px] leading-relaxed", isDone ? "text-teal-700" : "text-slate-500")}>{actionReason(action.text, focusTitle)}</p>
            </button>
          );
        })}
      </div>

      {allDone && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-100 border border-emerald-200 animate-in fade-in duration-300">
          <p className="text-xs font-semibold text-emerald-700">Great work. You completed your wellness focus for today.</p>
        </div>
      )}
    </section>
  );
}

export default function MenopauseDashboard() {
  const { profile, logs, dashboardState, setTodayMood, toggleFocusAction } = useMenopause();
  const { mood: todayMood, checkedActions: checked } = dashboardState;

  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [range, setRange] = useState<7 | 30>(7);

  const wellnessScore = useMemo(() => computeMenoWellnessScore(logs, profile), [logs, profile]);
  const topSymptoms = useMemo(() => getTopSymptomsThisWeek(logs), [logs]);
  const sleepMood = useMemo(() => getSleepMoodSummary(logs), [logs]);
  const guidance = useMemo(() => getDailyGuidance(profile, logs), [profile, logs]);
  const boneHealth = useMemo(() => getBoneHealthStatus(logs, profile), [logs, profile]);
  const wellnessFocus = useMemo(() => getWellnessFocusToday(logs, profile), [logs, profile]);
  const heartHealth = useMemo(() => getHeartHealthStatus(logs), [logs]);

  const stage = profile?.stage || "menopause";
  const stageLabel = getStageLabel(stage);
  const stageDesc = getStageDescription(stage);
  const stageTheme = stage === "perimenopause" ? "bg-teal-50 text-teal-700 border-teal-200" : stage === "menopause" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-blue-50 text-blue-700 border-blue-200";

  const trendSeries = useMemo(() => {
    const recent = recentLogsByDays(logs, range);
    const sleep = recent.map((l) => l.sleepHrs);
    const mood = recent.map((l) => l.mood);
    const hotFlashes = recent.map((l) => l.hotFlashCount);
    const energy = recent.map((l) => l.energyLevel);

    const getTakeaway = (data: number[], label: string) => {
      if (data.length < 3) return "Log more days for trend analysis.";
      const last = data[data.length - 1];
      const prev = data[data.length - 2];
      if (last > prev) return `Your ${label} is improving! Keep it up.`;
      if (last < prev) return `Small dip in ${label} today. Prioritize rest.`;
      return `${label} is steady. Stable routines help balance.`;
    };

    return {
      sleep,
      mood,
      hotFlashes,
      energy,
      sleepTakeaway: getTakeaway(sleep, "sleep"),
      moodTakeaway: getTakeaway(mood, "mood"),
      hotTakeaway: getTakeaway(hotFlashes, "hot flashes"),
      energyTakeaway: getTakeaway(energy, "energy"),
    };
  }, [logs, range]);

  return (
    <div className="min-h-screen bg-[#fdfcfb]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10">
        
        {/* Header with Stage Info */}
        <ScrollReveal>
          <div className="flex flex-col items-center text-center space-y-4 mb-2">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-10 h-10 text-violet-500 fill-violet-100 animate-pulse" />
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                Your Journey
              </h1>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className={cn("px-6 py-1.5 rounded-full text-sm font-bold border shadow-sm", stageTheme)}>
                {stageLabel}
              </div>
              <p className="text-base text-slate-500 font-medium max-w-2xl">{stageDesc}</p>
            </div>
            <div className="pt-4">
              <Link 
                to="/menopause/onboarding" 
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:shadow-md transition-all group"
              >
                Update Profile <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </ScrollReveal>

        {/* Main Content Area */}
        <div className="space-y-8">
          
          {/* Wellness Score & Key Metrics */}
          <ScrollReveal delay={40}>
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-10 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-[5rem] -z-0" />
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 relative z-10">
                <ScoreRing score={wellnessScore.score} color={wellnessScore.color} />
                
                <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8 w-full">
                  <div className="space-y-1 text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sleep</p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="text-2xl font-black text-slate-800">{sleepMood.avgSleep.toFixed(1)}h</span>
                      <TrendArrow dir={sleepMood.sleepTrend} good={sleepMood.sleepTrend === "up"} />
                    </div>
                  </div>
                  <div className="space-y-1 text-center md:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mood</p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="text-2xl font-black text-slate-800">{sleepMood.avgMood.toFixed(1)}/5</span>
                      <TrendArrow dir={sleepMood.moodTrend} good={sleepMood.moodTrend === "up"} />
                    </div>
                  </div>
                  <div className="space-y-1 text-center md:text-left col-span-2 md:col-span-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Symptom Load</p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <span className="text-2xl font-black text-slate-800">{topSymptoms.length} active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Daily Focus - Smart Component */}
          <ScrollReveal delay={60}>
            <WellnessFocusPanel
              focusEmoji={wellnessFocus.focusEmoji}
              focusTitle={wellnessFocus.focusTitle}
              explanation={wellnessFocus.explanation}
              actions={wellnessFocus.actions}
              redFlagAlert={wellnessFocus.redFlagAlert}
              tone={wellnessFocus.tone}
              checked={checked}
              onToggle={toggleFocusAction}
            />
          </ScrollReveal>

          {/* Quick Summary / Key Focus (Moved from Sidebar) */}
          <ScrollReveal delay={80}>
            <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4 text-violet-500" />
                Symptom Focus This Week
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topSymptoms.length > 0 ? (
                  topSymptoms.map((s, i) => (
                    <div key={s.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl border border-slate-100">{s.emoji}</div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.count} logs</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 truncate">{s.label}</p>
                      <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-400 rounded-full" 
                          style={{ width: `${Math.min(100, (s.count / 7) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center py-4">
                    <p className="text-sm text-slate-500 italic">No major symptoms logged this week. Doing well!</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Daily Check-in */}
          <ScrollReveal delay={100}>
            <section className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 relative overflow-hidden shadow-sm text-center">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Heart className="w-24 h-24 text-rose-500 fill-rose-500" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center justify-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-500" />
                Daily Check-in
              </h2>
              <p className="text-base text-slate-600 mb-6 font-medium">How are you feeling right now?</p>
              <div className="flex flex-wrap justify-center gap-3">
                {moodOptions.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setTodayMood(m);
                      writeTodayMood(m);
                    }}
                    className={cn(
                      "px-5 py-2.5 rounded-2xl border text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 hover:-translate-y-0.5",
                      todayMood === m ? "border-rose-400 bg-rose-50 text-rose-800 shadow-sm" : "border-slate-100 bg-white hover:bg-slate-50 text-slate-700 shadow-sm",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {todayMood && <p className="text-xs text-slate-500 mt-5 italic">Logged as <span className="font-bold text-rose-600">{todayMood}</span></p>}
            </section>
          </ScrollReveal>

          {/* Mini Trends */}
          <ScrollReveal delay={140}>
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Your Progress Trends</h2>
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button onClick={() => setRange(7)} className={cn("px-4 py-1.5 text-xs rounded-lg transition-all", range === 7 ? "bg-white shadow-sm font-bold text-slate-800" : "text-slate-500 hover:text-slate-700")}>7 days</button>
                  <button onClick={() => setRange(30)} className={cn("px-4 py-1.5 text-xs rounded-lg transition-all", range === 30 ? "bg-white shadow-sm font-bold text-slate-800" : "text-slate-500 hover:text-slate-700")}>30 days</button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5 text-indigo-700">
                  <div className="flex items-center justify-between text-sm font-bold mb-3"><span>Sleep Duration</span><Bed className="w-5 h-5" /></div>
                  <TinySparkline points={trendSeries.sleep} />
                  <p className="text-xs mt-3 opacity-80">{trendSeries.sleepTakeaway}</p>
                </div>
                <div className="rounded-2xl border border-violet-100 bg-violet-50/30 p-5 text-violet-700">
                  <div className="flex items-center justify-between text-sm font-bold mb-3"><span>Overall Mood</span><Smile className="w-5 h-5" /></div>
                  <TinySparkline points={trendSeries.mood} />
                  <p className="text-xs mt-3 opacity-80">{trendSeries.moodTakeaway}</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-5 text-rose-700">
                  <div className="flex items-center justify-between text-sm font-bold mb-3"><span>Hot Flash Episodes</span><Flame className="w-5 h-5" /></div>
                  <TinySparkline points={trendSeries.hotFlashes} />
                  <p className="text-xs mt-3 opacity-80">{trendSeries.hotTakeaway}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5 text-amber-700">
                  <div className="flex items-center justify-between text-sm font-bold mb-3"><span>Energy Levels</span><CircleDot className="w-5 h-5" /></div>
                  <TinySparkline points={trendSeries.energy} />
                  <p className="text-xs mt-3 opacity-80">{trendSeries.energyTakeaway}</p>
                </div>
              </div>
            </section>
          </ScrollReveal>

          {/* Quick Actions & Support Links (Integrated) */}
          <ScrollReveal delay={160}>
            <section className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 text-center">Toolkit & Support</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Link to="/menopause/symptoms" className="group rounded-2xl border border-slate-200 bg-white hover:border-violet-300 hover:shadow-md p-4 text-center transition-all">
                  <ClipboardCheck className="w-6 h-6 mx-auto mb-2 text-violet-500 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-slate-700">Log Symptoms</p>
                </Link>
                <Link to="/menopause/sleep-mood" className="group rounded-2xl border border-slate-200 bg-white hover:border-violet-300 hover:shadow-md p-4 text-center transition-all">
                  <Moon className="w-6 h-6 mx-auto mb-2 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-slate-700">Track Sleep</p>
                </Link>
                <Link to="/menopause/nutrition" className="group rounded-2xl border border-slate-200 bg-white hover:border-violet-300 hover:shadow-md p-4 text-center transition-all">
                  <Utensils className="w-6 h-6 mx-auto mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-slate-700">Nutrition Guide</p>
                </Link>
                <Link to="/menopause/ai-assistant" className="group rounded-2xl border border-slate-200 bg-white hover:border-teal-300 hover:shadow-md p-4 text-center transition-all">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 text-teal-500 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-slate-700">Ask AI Sakhi</p>
                </Link>
              </div>
            </section>
          </ScrollReveal>


          {/* Guidance */}
          <ScrollReveal delay={200}>
            <section className={cn("rounded-3xl border p-6 text-center", guidance.tone === "caution" ? "border-amber-200 bg-amber-50" : guidance.tone === "positive" ? "border-teal-200 bg-teal-50" : "border-violet-200 bg-violet-50")}>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Daily Guidance</h2>
              <p className="text-lg font-bold text-slate-800">{guidance.headline}</p>
              <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">{guidance.message}</p>
              <div className="mt-4 pt-4 border-t border-slate-200/50">
                <p className="text-xs font-semibold text-slate-700 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Your next check-in is due tomorrow morning.
                </p>
              </div>
            </section>
          </ScrollReveal>

          {/* Bone Health Check */}
          <ScrollReveal delay={220}>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                <Activity className="w-6 h-6 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">Bone Health Check</p>
                <p className="text-xs text-slate-500 leading-snug">{boneHealth.recommendation}</p>
              </div>
              <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0", boneHealth.status === "good" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                {boneHealth.status === "good" ? "Status: Optimal" : "Status: Needs Focus"}
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </div>
  );
}

// ─── Helpers (Moved from bottom) ─────────────────────────────────────────────

interface WellnessScore {
  score: number;
  color: "emerald" | "amber" | "rose" | "slate";
}

function computeMenoWellnessScore(logs: MenopauseLogEntry[], profile: MenopauseProfile | null): WellnessScore {
  if (logs.length === 0) return { score: 0, color: "slate" };
  const recent = recentLogsByDays(logs, 7);
  if (recent.length === 0) return { score: 0, color: "slate" };

  let total = 0;
  recent.forEach(l => {
    let day = 0;
    day += (l.sleepHrs >= 7 ? 30 : 15);
    day += (l.mood >= 4 ? 30 : 15);
    day += (l.severity === "mild" ? 40 : l.severity === "moderate" ? 20 : 0);
    total += day;
  });
  
  const score = Math.round(total / recent.length);
  const color = score >= 80 ? "emerald" : score >= 50 ? "amber" : "rose";
  return { score, color };
}

function getTopSymptomsThisWeek(logs: MenopauseLogEntry[]) {
  const recent = recentLogsByDays(logs, 7);
  const counts: Record<string, number> = {};
  recent.forEach(l => {
    l.symptoms.forEach(s => {
      counts[s] = (counts[s] || 0) + 1;
    });
  });
  
  return Object.entries(counts)
    .map(([id, count]) => {
      const opt = SYMPTOM_OPTIONS.find(o => o.id === id);
      return { id, count, label: opt?.label || id, emoji: opt?.emoji || "✨" };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
}

const SYMPTOM_OPTIONS = [
  { id: 'hot_flashes', label: 'Hot flashes', emoji: '🔥' },
  { id: 'night_sweats', label: 'Night sweats', emoji: '🌙' },
  { id: 'mood_swings', label: 'Mood swings', emoji: '🎭' },
  { id: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { id: 'sleep_issues', label: 'Sleep issues', emoji: '😴' },
  { id: 'fatigue', label: 'Fatigue', emoji: '🪫' },
  { id: 'brain_fog', label: 'Brain fog', emoji: '🌫️' },
  { id: 'headache', label: 'Headache', emoji: '🤕' },
  { id: 'joint_pain', label: 'Joint pain', emoji: '🦴' },
  { id: 'vaginal_dryness', label: 'Vaginal dryness', emoji: '💧' },
  { id: 'muscle_stiffness', label: 'Muscle stiffness', emoji: '💪' },
  { id: 'weight_gain', label: 'Weight gain', emoji: '⚖️' },
  { id: 'low_libido', label: 'Low libido', emoji: '💜' },
  { id: 'dry_skin', label: 'Dry skin', emoji: '🧴' },
  { id: 'hair_thinning', label: 'Hair thinning', emoji: '💇' },
  { id: 'palpitations', label: 'Palpitations', emoji: '💓' },
];

function getSleepMoodSummary(logs: MenopauseLogEntry[]) {
  const recent = recentLogsByDays(logs, 7);
  if (recent.length < 2) return { avgSleep: 0, sleepTrend: "stable" as const, avgMood: 0, moodTrend: "stable" as const };
  
  const sleeps = recent.map(l => l.sleepHrs);
  const moods = recent.map(l => l.mood);
  const avgSleep = sleeps.reduce((a, b) => a + b, 0) / sleeps.length;
  const avgMood = moods.reduce((a, b) => a + b, 0) / moods.length;
  
  const getTrend = (data: number[]) => {
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    if (last > prev) return "up" as const;
    if (last < prev) return "down" as const;
    return "stable" as const;
  };

  return { avgSleep, sleepTrend: getTrend(sleeps), avgMood, moodTrend: getTrend(moods) };
}

function getDailyGuidance(profile: MenopauseProfile | null, logs: MenopauseLogEntry[]) {
  if (!profile) return { tone: "info", headline: "Welcome to your journey", message: "Complete your onboarding for personalized guidance." };
  const recent = recentLogsByDays(logs, 7);
  
  if (recent.length === 0) return { tone: "positive", headline: "A fresh start today", message: "Log your first entry to see how your body is adjusting." };
  
  const last = recent[recent.length - 1];
  if (last.hotFlashCount >= 5) return { tone: "caution", headline: "Temperature spikes detected", message: "Your hot flash frequency is up. Prioritize hydration and cotton clothing." };
  if (last.sleepHrs < 6) return { tone: "caution", headline: "Rest is vital", message: "Your sleep was low yesterday. Try a cool room and limited caffeine today." };
  
  return { tone: "positive", headline: "You're doing great", message: "Your consistency is key to managing this transition smoothly." };
}

function getBoneHealthStatus(logs: MenopauseLogEntry[], profile: MenopauseProfile | null) {
  const recent = recentLogsByDays(logs, 14);
  const supplements = recent.filter(l => l.vitaminDTaken).length;
  if (supplements > 10) return { status: "good", recommendation: "Excellent consistency with supplements and activity." };
  return { status: "needs_focus", recommendation: "Focus on calcium-rich foods and 15 mins of morning sun." };
}

interface WellnessFocusAction {
  id: string;
  icon: string;
  text: string;
}

function getWellnessFocusToday(logs: MenopauseLogEntry[], profile: MenopauseProfile | null) {
  if (!profile) return { focusEmoji: "✨", focusTitle: "Setup Journey", explanation: "Onboarding helps customize your focus.", actions: [], redFlagAlert: null, tone: "info" as const };
  
  const recent = recentLogsByDays(logs, 7);
  const sleepIssues = recent.filter(l => l.sleepHrs < 6).length > 3;
  const hotFlashes = recent.some(l => l.hotFlashCount > 4);

  if (hotFlashes) return {
    focusEmoji: "❄️",
    focusTitle: "Stay Cool & Balanced",
    explanation: "Frequent temperature spikes detected this week.",
    tone: "caution" as const,
    redFlagAlert: null,
    actions: [
      { id: "hydrate", icon: "💧", text: "2L Water with electrolytes" },
      { id: "clothing", icon: "🧥", text: "Layered cotton clothing" },
      { id: "cool_down", icon: "🧊", text: "Cool shower before bed" }
    ]
  };

  if (sleepIssues) return {
    focusEmoji: "🌙",
    focusTitle: "Restoration Focus",
    explanation: "Your sleep pattern has been fragmented lately.",
    tone: "info" as const,
    redFlagAlert: null,
    actions: [
      { id: "magnesium", icon: "💊", text: "Magnesium-rich dinner" },
      { id: "no_screen", icon: "📵", text: "No screens 1hr before bed" },
      { id: "reading", icon: "📖", text: "15 mins light reading" }
    ]
  };

  return {
    focusEmoji: "🌿",
    focusTitle: "Nourish & Move",
    explanation: "Maintain your energy and bone strength today.",
    tone: "positive" as const,
    redFlagAlert: null,
    actions: [
      { id: "walk", icon: "🚶", text: "20 min morning walk" },
      { id: "calcium", icon: "🥛", text: "Calcium-rich meal" },
      { id: "stretch", icon: "🧘", text: "Gentle pelvic floor work" }
    ]
  };
}

function getHeartHealthStatus(logs: MenopauseLogEntry[]) {
  const recent = recentLogsByDays(logs, 30);
  const bpLogs = recent.filter(l => l.bpSystolic);
  if (bpLogs.length === 0) return { message: "Log your BP occasionally to track cardiovascular wellness." };
  return { message: "Your vascular health looks stable based on recent logs." };
}
