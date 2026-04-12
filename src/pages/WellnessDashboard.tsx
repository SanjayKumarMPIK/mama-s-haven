import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useWellnessRecommendation } from "@/hooks/useWellnessRecommendation";
import { usePhase } from "@/hooks/usePhase";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog } from "@/hooks/useHealthLog";
import { SYMPTOM_FOOD_BOOSTS } from "@/lib/wellnessEngine";
import { computeDailyRecommendations } from "@/lib/dailyStateEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import type { Region } from "@/lib/nutritionData";

import {
  Sparkles,
  Utensils,
  Droplets,
  Moon,
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Heart,
  Leaf,
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

// ─── BMI Visual Card ──────────────────────────────────────────────────────────

function BMICard({ value, category, weight, height }: { value: number; category: string; weight: number; height: number }) {
  const pct = Math.min(100, Math.max(0, ((value - 10) / 30) * 100));
  const color =
    category === "Normal" ? "from-emerald-400 to-green-500"
    : category === "Underweight" ? "from-amber-400 to-yellow-500"
    : "from-red-400 to-orange-500";
  const textColor =
    category === "Normal" ? "text-emerald-700"
    : category === "Underweight" ? "text-amber-700"
    : "text-red-700";
  const bgColor =
    category === "Normal" ? "bg-emerald-50 border-emerald-100"
    : category === "Underweight" ? "bg-amber-50 border-amber-100"
    : "bg-red-50 border-red-100";

  const advice =
    category === "Normal" ? "Your BMI is in the healthy range. Keep maintaining this with balanced meals."
    : category === "Underweight" ? "Your BMI is below normal. Focus on nutrient-dense foods to gain healthy weight."
    : category === "Overweight" ? "Your BMI is above normal. Focus on portion control and regular activity."
    : "Your BMI is high. Prioritize fiber-rich foods, reduce sugar, and consult your doctor.";

  return (
    <div className={`rounded-2xl border p-4 ${bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Scale className={`w-4 h-4 ${textColor}`} />
          <p className="text-sm font-semibold text-foreground">Your Body Profile</p>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${textColor} bg-white/60`}>
          BMI {value}
        </span>
      </div>

      {/* Mini bar */}
      <div className="relative h-2 w-full rounded-full bg-white/60 mb-2">
        <div
          className={`absolute h-2 rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute -top-0.5 w-3 h-3 rounded-full bg-white border-2 border-foreground/40 shadow-sm transition-all duration-700"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-3">
        <span>Underweight</span>
        <span>Normal</span>
        <span>Overweight</span>
      </div>

      <div className="flex gap-4 text-xs text-foreground/70 mb-2">
        <span>{weight} kg</span>
        <span>{height} cm</span>
        <span className={`font-semibold ${textColor}`}>{category}</span>
      </div>

      <p className="text-[11px] text-foreground/60 leading-relaxed">{advice}</p>
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

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

  // Symptom boost tips — always computed, never conditional
  const symptomFoodTips = useMemo(() => {
    if (!recommendation) return [];
    const tips: string[] = [];
    for (const sym of recommendation.dominantSymptoms) {
      for (const [k, v] of Object.entries(SYMPTOM_FOOD_BOOSTS)) {
        if (k.toLowerCase() === sym.toLowerCase().replace(/\s+/g, "") || sym.toLowerCase().includes(k.toLowerCase())) {
          tips.push(...v.slice(0, 1));
          break;
        }
      }
    }
    return tips.slice(0, 3);
  }, [recommendation]);

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

  const sleepInsights = useMemo(() => {
    if (!yesterdaySleep) return null;
    const poorSleep = yesterdaySleep.hours < 6 || yesterdaySleep.quality === "Poor";
    const goodSleep = yesterdaySleep.hours >= 7 && (yesterdaySleep.quality === "Good" || !yesterdaySleep.quality);
    if (poorSleep) return `Low energy (${yesterdaySleep.hours}h sleep last night)`;
    if (goodSleep) return "Great energy (well rested)";
    return null;
  }, [yesterdaySleep]);

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

  // 5. Daily State Engine — Hormone → Performance Translator
  const dailyRec = useMemo(() => {
    return computeDailyRecommendations(logs, phase, recommendation?.cyclePhase ?? null);
  }, [logs, phase, recommendation]);

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

  // Personalized insight line based on data context
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

      <div className="container py-6 space-y-4">
        {/* ── Special Care Alert ───────────────────────────────────────────── */}
        {rec.specialAlert && (
          <ScrollReveal>
            <div
              id="wellness-alert"
              className="rounded-2xl border-2 border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-4 flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  {firstName ? `${firstName}, please take care` : "Special Care Alert"}
                </p>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">{rec.specialAlert}</p>
                <Link
                  to="/phc-nearby"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 mt-2 hover:underline"
                >
                  Find nearest PHC <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* ── Today's Focus — Hormone → Performance Translator ───────────── */}
        <ScrollReveal delay={60}>
          <div
            id="wellness-focus"
            className="rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 p-5 text-white shadow-lg shadow-teal-200/30 relative overflow-hidden"
          >
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5" />
            <div className="absolute top-1/2 right-12 w-16 h-16 rounded-full bg-white/5" />

            <div className="relative">
              {/* Title + Execution Mode */}
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">
                {firstName ? `${firstName}'s Focus for Today` : "Today's Focus"}
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full px-3 py-1 backdrop-blur-md ${
                  dailyRec.executionMode === "Recovery Day"
                    ? "bg-amber-400/30 text-amber-100 border border-amber-300/30"
                    : dailyRec.executionMode === "Peak Performance Day"
                    ? "bg-emerald-300/30 text-emerald-100 border border-emerald-200/30"
                    : "bg-white/20 text-white/90 border border-white/20"
                }`}>
                  {dailyRec.executionMode === "Recovery Day" ? "🛌" : dailyRec.executionMode === "Peak Performance Day" ? "⚡" : "⚖️"}
                  {dailyRec.executionMode}
                </span>
              </div>
              <p className="text-lg font-bold leading-snug">{dailyRec.summary}</p>

              {rec.dominantSymptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {rec.dominantSymptoms.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-medium bg-white/20 rounded-full px-2.5 py-0.5 backdrop-blur-sm"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Why This Recommendation ──────────────────────────────────────── */}
        <ScrollReveal delay={70}>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Why this recommendation
            </p>
            <div className="space-y-2">
              {dailyRec.why.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-foreground/80 leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ── Today's Plan (4 categories) ─────────────────────────────────── */}
        <ScrollReveal delay={75}>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Today's Plan
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Dumbbell className="w-3.5 h-3.5 text-green-600" />
                  <p className="text-[10px] font-bold text-green-700 uppercase">Movement</p>
                </div>
                <p className="text-xs text-green-900/80 leading-snug">{dailyRec.plan.movement}</p>
              </div>
              <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
                  <p className="text-[10px] font-bold text-orange-700 uppercase">Nutrition</p>
                </div>
                <p className="text-xs text-orange-900/80 leading-snug">{dailyRec.plan.nutrition}</p>
              </div>
              <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Brain className="w-3.5 h-3.5 text-violet-600" />
                  <p className="text-[10px] font-bold text-violet-700 uppercase">Productivity</p>
                </div>
                <p className="text-xs text-violet-900/80 leading-snug">{dailyRec.plan.productivity}</p>
              </div>
              <div className="rounded-xl bg-sky-50 border border-sky-100 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BatteryCharging className="w-3.5 h-3.5 text-sky-600" />
                  <p className="text-[10px] font-bold text-sky-700 uppercase">Recovery</p>
                </div>
                <p className="text-xs text-sky-900/80 leading-snug">{dailyRec.plan.recovery}</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Do / Avoid ──────────────────────────────────────────────────── */}
        <ScrollReveal delay={80}>
          <div className="grid grid-cols-2 gap-3">
            {/* DO */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Do
              </p>
              <div className="space-y-2">
                {dailyRec.doItems.map((item, i) => (
                  <p key={i} className="text-[11px] text-emerald-900/80 flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-400 shrink-0 mt-0.5">✦</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
            {/* AVOID */}
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-4">
              <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Avoid
              </p>
              <div className="space-y-2">
                {dailyRec.avoidItems.map((item, i) => (
                  <p key={i} className="text-[11px] text-red-900/80 flex items-start gap-1.5 leading-snug">
                    <span className="text-red-300 shrink-0 mt-0.5">✕</span>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Prediction ──────────────────────────────────────────────────── */}
        <ScrollReveal delay={85}>
          <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-3.5 flex items-start gap-2.5">
            <TrendingUp className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Prediction</p>
              <p className="text-xs text-indigo-900/80 leading-relaxed">{dailyRec.prediction}</p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── BMI & Body Profile ────────────────────────────────────────────── */}
        <ScrollReveal delay={80}>
          <BMICard
            value={rec.bmi.value}
            category={rec.bmi.category}
            weight={profile!.weight}
            height={profile!.height}
          />
        </ScrollReveal>

        {/* ── Calendar CTA ─────────────────────────────────────────────────── */}
        <ScrollReveal delay={100}>
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

        {/* ── Diet Plan ────────────────────────────────────────────────────── */}
        <ScrollReveal delay={120}>
          <DietSection
            diet={rec.diet}
            region={profile!.region}
            onRegionChange={(r) => saveProfile({ ...profile!, region: r })}
            symptomTips={symptomFoodTips}
            firstName={firstName}
            phaseName={phaseName}
          />
        </ScrollReveal>

        {/* ── Nutrition ────────────────────────────────────────────────────── */}
        <ScrollReveal delay={160}>
          <ExpandableCard
            id="wellness-nutrition"
            icon={Flame}
            iconBg="bg-orange-100 text-orange-600"
            title={firstName ? `${firstName}'s Nutrition Plan` : "Calorie & Nutrition Plan"}
            summary={`~${rec.nutrition.dailyCalories} kcal/day based on your profile`}
          >
            <div className="space-y-4">
              {/* Calorie display */}
              <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-4 text-center">
                <p className="text-3xl font-bold text-orange-700">{rec.nutrition.dailyCalories}</p>
                <p className="text-xs text-orange-600 font-medium mt-1">
                  kcal/day · Based on {profile!.weight}kg, {profile!.height}cm, age {age}
                </p>
              </div>

              {/* Nutrient cards */}
              <div className="grid grid-cols-2 gap-2">
                {rec.nutrition.nutrients.map((n) => (
                  <div key={n.name} className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="text-base">{n.icon}</span>
                      <p className="text-xs font-bold text-foreground">{n.name}</p>
                    </div>
                    <p className="text-[11px] font-semibold text-primary">{n.target}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{n.foods}</p>
                  </div>
                ))}
              </div>
            </div>
          </ExpandableCard>
        </ScrollReveal>

        {/* ── Water Intake ─────────────────────────────────────────────────── */}
        <ScrollReveal delay={200}>
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

        {/* ── Sleep & Activity ─────────────────────────────────────────────── */}
        <ScrollReveal delay={240}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="wellness-sleep-activity">
            {/* Sleep */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Sleep Analytics</p>
                  <p className="text-xs text-muted-foreground">{yesterdaySleep ? "Based on last night" : "For you"}</p>
                </div>
              </div>
              
              {yesterdaySleep ? (
                <>
                  <div className="flex items-end gap-2 mb-3">
                    <p className="text-2xl font-bold text-indigo-700">{yesterdaySleep.hours}h</p>
                    <p className="text-sm text-indigo-500 font-medium pb-0.5">{yesterdaySleep.quality || "Logged"}</p>
                  </div>
                  {sleepCorrelation && (
                    <div className="rounded-lg bg-indigo-50/50 p-3 mb-3 border border-indigo-100/50">
                      <p className="text-xs text-indigo-900 font-medium leading-relaxed">💡 {sleepCorrelation}</p>
                    </div>
                  )}
                  <div className="space-y-1.5 mt-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Actions</p>
                    <p className="text-xs text-foreground/80 flex items-start gap-2">
                      <span className="text-indigo-400 mt-0.5">•</span> Aim for 7-8 hours of sleep tonight
                    </p>
                    {(yesterdaySleep.hours < 6 || yesterdaySleep.quality === "Poor") && (
                      <>
                        <p className="text-xs text-foreground/80 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">•</span> Avoid caffeine after 4 PM
                        </p>
                        <p className="text-xs text-foreground/80 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">•</span> Wind down with low screen exposure before bed
                        </p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-indigo-700">{rec.sleep.hours}</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{rec.sleep.tip}</p>
                </>
              )}
            </div>

            {/* Activity */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  rec.activity.intensity === "rest"
                    ? "bg-amber-100"
                    : rec.activity.intensity === "light"
                    ? "bg-green-100"
                    : "bg-teal-100"
                }`}>
                  <Activity className={`w-4 h-4 ${
                    rec.activity.intensity === "rest"
                      ? "text-amber-600"
                      : rec.activity.intensity === "light"
                      ? "text-green-600"
                      : "text-teal-600"
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-semibold">Activity</p>
                  <p className="text-xs text-muted-foreground capitalize">{rec.activity.intensity} intensity</p>
                </div>
              </div>
              <p className="text-xs text-foreground leading-relaxed">{rec.activity.suggestion}</p>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Privacy footer ───────────────────────────────────────────────── */}
        <ScrollReveal delay={260}>
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

// ─── Diet Section (Standalone for complexity) ─────────────────────────────────

function DietSection({
  diet,
  region,
  onRegionChange,
  symptomTips,
  firstName,
  phaseName,
}: {
  diet: { breakfast: string[]; lunch: string[]; dinner: string[]; snacks: string[] };
  region: Region;
  onRegionChange: (r: Region) => void;
  symptomTips: string[];
  firstName: string;
  phaseName: string;
}) {
  const [open, setOpen] = useState(true);
  const regionLabel = REGIONS.find((r) => r.val === region)?.label ?? region;
  const mealTypes = [
    { key: "breakfast" as const, label: "Breakfast", emoji: "🌅", color: "bg-amber-50 border-amber-100" },
    { key: "lunch" as const, label: "Lunch", emoji: "☀️", color: "bg-green-50 border-green-100" },
    { key: "dinner" as const, label: "Dinner", emoji: "🌙", color: "bg-indigo-50 border-indigo-100" },
    { key: "snacks" as const, label: "Snacks", emoji: "🍎", color: "bg-pink-50 border-pink-100" },
  ];

  return (
    <div
      id="wellness-diet"
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-300"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
        aria-expanded={open}
      >
        <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
          <Utensils className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {firstName ? `${firstName}'s ${regionLabel} Diet Plan` : "Diet Plan"}
          </p>
          <p className="text-xs text-muted-foreground">
            Tailored {regionLabel} meals for your {phaseName.toLowerCase()} stage
          </p>
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
          maxHeight: open ? "3000px" : "0px",
          opacity: open ? 1 : 0,
          overflow: "hidden",
        }}
      >
        <div className="px-5 pb-5 pt-1 space-y-4">
          {/* Region pills */}
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((r) => (
              <button
                key={r.val}
                type="button"
                onClick={() => onRegionChange(r.val)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.97] ${
                  region === r.val
                    ? "bg-teal-500 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <span>{r.emoji}</span> {r.label}
              </button>
            ))}
          </div>

          {/* Symptom-specific food tips */}
          {symptomTips.length > 0 && (
            <div className="rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-3">
              <p className="text-xs font-semibold text-purple-800 flex items-center gap-1 mb-1.5">
                <Heart className="w-3 h-3" /> {firstName ? `${firstName}, based on your symptoms` : "Based on your recent symptoms"}
              </p>
              {symptomTips.map((tip, i) => (
                <p key={i} className="text-[11px] text-purple-700 flex items-start gap-1.5 mt-1">
                  <Leaf className="w-3 h-3 shrink-0 mt-0.5 text-purple-400" />
                  {tip}
                </p>
              ))}
            </div>
          )}

          {/* Meal cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {mealTypes.map((meal) => (
              <div key={meal.key} className={`rounded-xl border p-4 ${meal.color}`}>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                  <span>{meal.emoji}</span> {meal.label}
                </p>
                <ul className="space-y-1.5">
                  {diet[meal.key].map((item, i) => (
                    <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                      <span className="text-teal-500 shrink-0 mt-0.5">✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
