import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Bed,
  Bone,
  CalendarDays,
  CheckCircle2,
  Circle,
  CircleDot,
  ClipboardCheck,
  Compass,
  Droplets,
  Flame,
  HeartPulse,
  Minus,
  Moon,
  Shield,
  Smile,
  Sun,
  TrendingDown,
  TrendingUp,
  Weight,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useMenopause, getStageDescription, getStageLabel, type MenopauseLogEntry } from "@/hooks/useMenopause";
import { useHealthLog, type MenopauseEntry } from "@/hooks/useHealthLog";
import {
  computeMenoWellnessScore,
  getBoneHealthStatus,
  getDailyGuidance,
  getHeartHealthStatus,
  getSleepMoodSummary,
  getTopSymptomsThisWeek,
  getWellnessFocusToday,
  getWeightStatus,
  type WellnessFocusAction,
} from "@/lib/menopauseDashboardEngine";
import { cn } from "@/lib/utils";

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

function WellnessFocusPanel({ focusEmoji, focusTitle, explanation, actions, redFlagAlert, tone }: {
  focusEmoji: string;
  focusTitle: string;
  explanation: string;
  actions: WellnessFocusAction[];
  redFlagAlert: string | null;
  tone: "positive" | "caution" | "info" | "alert";
}) {
  const [checked, setChecked] = useState<string[]>(() => readTodayChecked());
  const toggle = useCallback((id: string) => {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      writeTodayChecked(next);
      return next;
    });
  }, []);

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
              onClick={() => toggle(action.id)}
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
  const { profile, logs } = useMenopause();
  const { getPhaseLogs } = useHealthLog();
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [range, setRange] = useState<7 | 30>(7);
  const [todayMood, setTodayMood] = useState<string>(() => readTodayMood());

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

  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  })();

  const menopauseCalendarLogs = useMemo(() => {
    const phaseLogs = getPhaseLogs("menopause");
    return Object.entries(phaseLogs)
      .map(([date, entry]) => ({ date, entry: entry as MenopauseEntry }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getPhaseLogs]);

  const recentRangeLogs = useMemo(() => recentLogsByDays(logs, range), [logs, range]);
  const recentCalendarRange = useMemo(() => {
    const now = new Date();
    return menopauseCalendarLogs.filter(({ date }) => {
      const diff = (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= range && diff >= 0;
    });
  }, [menopauseCalendarLogs, range]);
  const selectedSymptomData = topSymptoms.find((s) => s.id === selectedSymptom) || null;
  const trendSeries = useMemo(() => {
    const moodToScore = (m: MenopauseEntry["mood"]) => {
      if (m === "Good") return 5;
      if (m === "Okay") return 3;
      if (m === "Low") return 1;
      return 0;
    };
    const sleepQualityToScore = (q: MenopauseEntry["sleepQuality"]) => {
      if (q === "Good") return 4;
      if (q === "Okay") return 3;
      if (q === "Poor") return 2;
      return 0;
    };
    const safeAvg = (vals: number[]) => vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

    const sleepValues = recentCalendarRange.map(({ entry }) => entry.sleepHours ?? 0).filter((v) => v > 0).slice(-10);
    const moodValues = recentCalendarRange.map(({ entry }) => moodToScore(entry.mood)).filter((v) => v > 0).slice(-10);
    const hotFlashValues = recentCalendarRange.map(({ entry }) => (entry.symptoms?.hotFlashes ? 1 : 0)).slice(-10);
    const energyValues = recentCalendarRange.map(({ entry }) => {
      const sleepQualityScore = sleepQualityToScore(entry.sleepQuality);
      const moodScore = moodToScore(entry.mood);
      return Math.max(sleepQualityScore, moodScore || 0);
    }).filter((v) => v > 0).slice(-10);

    return {
      sleep: sleepValues,
      mood: moodValues,
      hotFlashes: hotFlashValues,
      energy: energyValues,
      sleepTakeaway: safeAvg(sleepValues) >= 7 ? "Sleep baseline is healthy." : sleepValues.length ? "Sleep needs support this week." : "Add sleep entries in calendar logs for this trend.",
      moodTakeaway: safeAvg(moodValues) >= 3.5 ? "Mood remains mostly steady." : moodValues.length ? "Mood has been lower than usual." : "Add mood entries in calendar logs for this trend.",
      hotTakeaway: safeAvg(hotFlashValues) <= 0.5 ? "Hot flashes are manageable." : hotFlashValues.length ? "Cooling and hydration should be prioritized." : "Track hot flashes in calendar logs to unlock this trend.",
      energyTakeaway: safeAvg(energyValues) >= 3 ? "Energy pattern is stable." : energyValues.length ? "Low energy appears frequently." : "Add sleep quality or mood entries in calendar logs.",
    };
  }, [recentCalendarRange]);

  const noLogs = logs.length === 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f5f7ff_0%,#eef8f6_40%,#fdf8f2_100%)]">
      <div className="container py-6 space-y-6">
        <ScrollReveal>
          <section className="relative overflow-hidden rounded-3xl border border-teal-200/60 bg-gradient-to-br from-teal-100/80 via-cyan-50 to-rose-50 shadow-lg shadow-teal-100/50 p-6 md:p-8">
            <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/40 blur-3xl" />
            <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center shadow"><Sun className="w-5 h-5 text-white" /></div>
                  <p className="text-sm font-semibold text-slate-700">{greeting}</p>
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">Menopause Wellness Command Center</h1>
                <p className="text-sm text-slate-600 mt-2 max-w-xl">Wellness Score {wellnessScore.score} - {wellnessScore.label}. {wellnessScore.insight}</p>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className={cn("px-3 py-1.5 rounded-full border text-xs font-semibold", stageTheme)}>{stageLabel}</span>
                  <span className="px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 text-xs font-semibold text-slate-700">{wellnessScore.loggedDays}/{wellnessScore.totalDays} days logged</span>
                  <span className="px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 text-xs font-semibold text-slate-700">Current streak: {Math.min(wellnessScore.loggedDays, 7)} days</span>
                </div>
                <p className="text-xs text-slate-600 mt-3">{stageDesc}</p>
                <div className="flex flex-wrap gap-2 mt-5">
                  <Link
                    to="/menopause/symptoms"
                    className="px-4 py-2 rounded-xl border border-teal-800 bg-teal-700 hover:bg-teal-800 !text-white text-sm font-semibold shadow-sm transition-colors"
                    style={{ color: "#ffffff", backgroundColor: "#0f766e" }}
                  >
                    Log Symptoms
                  </Link>
                  <Link to="/menopause/analytics" className="px-4 py-2 rounded-xl bg-white/85 hover:bg-white border border-slate-200 text-slate-800 text-sm font-semibold transition-colors">View Trends</Link>
                </div>
              </div>
              <div className="flex md:justify-end">
                <div className="rounded-2xl border border-white/70 bg-white/75 backdrop-blur-sm p-4"><ScoreRing score={wellnessScore.score} color={wellnessScore.color} /></div>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {noLogs && (
          <ScrollReveal delay={40}>
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-900">Start your personalized dashboard</h2>
              <p className="text-sm text-slate-600 mt-1">Start logging symptoms to unlock personalized menopause guidance.</p>
              <Link to="/menopause/symptoms" className="inline-flex mt-3 px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold">Log first entry</Link>
            </section>
          </ScrollReveal>
        )}

        <ScrollReveal delay={60}>
          <WellnessFocusPanel
            focusEmoji={wellnessFocus.focusEmoji}
            focusTitle={wellnessFocus.focusTitle}
            explanation={wellnessFocus.explanation}
            actions={wellnessFocus.actions}
            redFlagAlert={wellnessFocus.redFlagAlert}
            tone={wellnessFocus.tone}
          />
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <section className="rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-50/70 to-blue-50/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center"><Activity className="w-4 h-4" /></div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Top Symptoms This Week</h2>
            </div>
            {topSymptoms.length === 0 ? <p className="text-sm text-slate-600">No dominant symptoms this week. Keep logging daily for clearer trends.</p> : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {topSymptoms.map((sym) => (
                    <button
                      key={sym.id}
                      onClick={() => setSelectedSymptom(selectedSymptom === sym.id ? null : sym.id)}
                      className={cn("text-left rounded-2xl p-4 border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500", selectedSymptom === sym.id ? "border-violet-400 bg-white shadow-md" : "border-white/70 bg-white/80 hover:shadow hover:-translate-y-0.5")}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{sym.label}</p>
                          <p className="text-xs text-slate-500 mt-1">{sym.frequency} times this week</p>
                        </div>
                        <span className="text-lg" aria-hidden>{sym.emoji}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="font-semibold text-violet-700">Severity {sym.avgSeverity}/5</span>
                        <span className="inline-flex items-center gap-1 text-slate-600"><TrendArrow dir={sym.trend} good={sym.trend === "down"} />{sym.trend === "up" ? "Increasing" : sym.trend === "down" ? "Improving" : "Stable"}</span>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedSymptomData && (
                  <div className="mt-4 rounded-xl border border-violet-200 bg-white/85 p-4 animate-in fade-in duration-200">
                    <h3 className="text-sm font-bold text-slate-800">{selectedSymptomData.label} details</h3>
                    <p className="text-xs text-slate-600 mt-1">What this means: this symptom appears consistently in your recent logs and should be watched through the week.</p>
                    <p className="text-xs text-slate-600 mt-1">When it occurred most: recent evenings and late-day windows are common for this pattern.</p>
                    <p className="text-xs text-slate-700 mt-2 font-medium">What you can do: complete one action from your wellness focus and log this symptom again today.</p>
                  </div>
                )}
              </>
            )}
          </section>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <section className="rounded-2xl border border-rose-200/70 bg-gradient-to-br from-rose-50 to-amber-50 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">Daily Check-in</h2>
            <p className="text-sm text-slate-600 mb-3">How are you feeling today?</p>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setTodayMood(m);
                    writeTodayMood(m);
                  }}
                  className={cn(
                    "px-3 py-2 rounded-full border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500",
                    todayMood === m ? "border-rose-400 bg-rose-100 text-rose-800" : "border-white/80 bg-white/85 hover:bg-white text-slate-700",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
            {todayMood && <p className="text-xs text-slate-600 mt-3">Saved for today: <span className="font-semibold">{todayMood}</span></p>}
          </section>
        </ScrollReveal>

        <ScrollReveal delay={140}>
          <section className="rounded-2xl border border-slate-200 bg-white/85 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Mini Trends</h2>
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button onClick={() => setRange(7)} className={cn("px-3 py-1 text-xs rounded-lg", range === 7 ? "bg-white shadow-sm font-semibold text-slate-800" : "text-slate-500")}>7 days</button>
                <button onClick={() => setRange(30)} className={cn("px-3 py-1 text-xs rounded-lg", range === 30 ? "bg-white shadow-sm font-semibold text-slate-800" : "text-slate-500")}>30 days</button>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-indigo-700"><div className="flex items-center justify-between text-xs font-semibold mb-2"><span>Sleep</span><Bed className="w-4 h-4" /></div><TinySparkline points={trendSeries.sleep} /><p className="text-[11px] mt-2">{trendSeries.sleepTakeaway}</p></div>
              <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3 text-violet-700"><div className="flex items-center justify-between text-xs font-semibold mb-2"><span>Mood</span><Smile className="w-4 h-4" /></div><TinySparkline points={trendSeries.mood} /><p className="text-[11px] mt-2">{trendSeries.moodTakeaway}</p></div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-rose-700"><div className="flex items-center justify-between text-xs font-semibold mb-2"><span>Hot flashes</span><Flame className="w-4 h-4" /></div><TinySparkline points={trendSeries.hotFlashes} /><p className="text-[11px] mt-2">{trendSeries.hotTakeaway}</p></div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-amber-700"><div className="flex items-center justify-between text-xs font-semibold mb-2"><span>Energy</span><CircleDot className="w-4 h-4" /></div><TinySparkline points={trendSeries.energy} /><p className="text-[11px] mt-2">{trendSeries.energyTakeaway}</p></div>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <section className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Link to="/menopause/symptoms" className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-3 text-xs font-semibold text-slate-700 flex items-center gap-2"><ClipboardCheck className="w-4 h-4" />Log Symptoms</Link>
              <Link to="/menopause/sleep-mood" className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-3 text-xs font-semibold text-slate-700 flex items-center gap-2"><Moon className="w-4 h-4" />Track Sleep</Link>
              <Link to="/menopause/weight-metabolism" className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-3 text-xs font-semibold text-slate-700 flex items-center gap-2"><Weight className="w-4 h-4" />Update Weight</Link>
              <Link to="/menopause/nutrition" className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-3 text-xs font-semibold text-slate-700 flex items-center gap-2"><Droplets className="w-4 h-4" />Nutrition Guide</Link>
              <Link to="/menopause/ai-assistant" className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 p-3 text-xs font-semibold text-slate-700 flex items-center gap-2"><CalendarDays className="w-4 h-4" />Ask AI Assistant</Link>
            </div>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <section className={cn("rounded-2xl border p-5", guidance.tone === "caution" ? "border-amber-200 bg-amber-50" : guidance.tone === "positive" ? "border-teal-200 bg-teal-50" : "border-violet-200 bg-violet-50")}>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Guidance</h2>
            <p className="text-sm font-semibold text-slate-800 mt-2">{guidance.headline}</p>
            <p className="text-sm text-slate-600 mt-1">What this means: {guidance.message}</p>
            <p className="text-sm text-slate-700 mt-2">What you can do: complete one focus action and recheck your trend tomorrow.</p>
          </section>
        </ScrollReveal>

        <ScrollReveal delay={220}>
          <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-slate-400 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-relaxed">All health data stays on your device. Insights are informational and do not replace medical advice.</p>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
