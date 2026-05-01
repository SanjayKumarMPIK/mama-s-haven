import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog, calcFertileWindow, calcAverageCycleLength } from "@/hooks/useHealthLog";
import type { PubertyEntry } from "@/hooks/useHealthLog";
import ScrollReveal from "@/components/ScrollReveal";
import { createPubertyDashboardConfig, HormonalCondition, PubertyStatus } from "@/lib/pubertyDashboardConfig";
import {
  computeWellnessScore,
  generatePriorityActions,
  computeBodySignals,
  generateSmartPredictions,
  getCompletedActions,
  toggleActionComplete,
} from "@/lib/wellnessCommandEngine";
import type { BodySignal } from "@/lib/wellnessCommandEngine";
import {
  Calendar, Utensils, Activity, Heart, AlertTriangle, Zap, Sparkles,
  TrendingUp, Clock, Flower2, CalendarDays, ShieldAlert, Droplets,
  Moon, Sun, TrendingDown, Minus, Apple, CheckCircle2 as Check,
  Leaf, Bell, ChevronRight,
} from "lucide-react";

// Helper functions
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtDateLong(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

// Dynamic Nutrition Tips Engine
interface NutritionTip {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  priority: number;
  category: 'nutrition' | 'lifestyle' | 'medical';
}

interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  color: string;
  titleColor: string;
  priority: number;
}

function generateDynamicNutritionTips(
  pubertyStage: PubertyStatus,
  condition: HormonalCondition,
  symptoms: string[]
): NutritionTip[] {
  let tips: NutritionTip[] = [];

  // Base tips by puberty stage
  if (pubertyStage === PubertyStatus.early) {
    tips = [
      {
        id: 'early-1',
        icon: <Activity className="w-4 h-4 text-green-600" />,
        title: "Reduce Processed Foods",
        description: "Minimize sugar and processed foods to support hormonal balance",
        color: "bg-green-100",
        priority: 1,
        category: 'nutrition'
      },
      {
        id: 'early-2',
        icon: <Heart className="w-4 h-4 text-red-500" />,
        title: "Balanced Protein & Fiber",
        description: "Include lean proteins and high-fiber foods for growth",
        color: "bg-red-100",
        priority: 2,
        category: 'nutrition'
      },
      {
        id: 'early-3',
        icon: <Activity className="w-4 h-4 text-blue-500" />,
        title: "Regular Physical Activity",
        description: "Encourage daily movement and sports participation",
        color: "bg-blue-100",
        priority: 3,
        category: 'lifestyle'
      },
      {
        id: 'early-4',
        icon: <Moon className="w-4 h-4 text-purple-500" />,
        title: "Maintain Sleep Cycle",
        description: "Consistent sleep schedule supports healthy development",
        color: "bg-purple-100",
        priority: 4,
        category: 'lifestyle'
      }
    ];
  } else if (pubertyStage === PubertyStatus.late) {
    tips = [
      {
        id: 'late-1',
        icon: <Heart className="w-4 h-4 text-red-500" />,
        title: "Iron-Rich Foods",
        description: "Focus on red meat, spinach, and legumes for energy",
        color: "bg-red-100",
        priority: 1,
        category: 'nutrition'
      },
      {
        id: 'late-2',
        icon: <Sun className="w-4 h-4 text-yellow-500" />,
        title: "Healthy Fats",
        description: "Include avocados, nuts, and olive oil for development",
        color: "bg-yellow-100",
        priority: 2,
        category: 'nutrition'
      },
      {
        id: 'late-3',
        icon: <Activity className="w-4 h-4 text-green-600" />,
        title: "Protein-Rich Diet",
        description: "Support muscle and tissue development with quality protein",
        color: "bg-green-100",
        priority: 3,
        category: 'nutrition'
      },
      {
        id: 'late-4',
        icon: <Activity className="w-4 h-4 text-blue-500" />,
        title: "Stress Reduction",
        description: "Practice relaxation techniques and mindfulness",
        color: "bg-blue-100",
        priority: 4,
        category: 'lifestyle'
      }
    ];
  } else { // Normal Puberty
    tips = [
      {
        id: 'normal-1',
        icon: <Activity className="w-4 h-4 text-green-600" />,
        title: "Balanced Diet",
        description: "Include proteins, carbs, and healthy fats in proper ratios",
        color: "bg-green-100",
        priority: 1,
        category: 'nutrition'
      },
      {
        id: 'normal-2',
        icon: <Sun className="w-4 h-4 text-yellow-500" />,
        title: "Calcium & Vitamin D",
        description: "Support bone health with dairy and sunlight exposure",
        color: "bg-yellow-100",
        priority: 2,
        category: 'nutrition'
      },
      {
        id: 'normal-3',
        icon: <Activity className="w-4 h-4 text-blue-500" />,
        title: "Regular Exercise",
        description: "Maintain consistent physical activity routine",
        color: "bg-blue-100",
        priority: 3,
        category: 'lifestyle'
      }
    ];
  }

  // Override for PCOS/PCOD conditions
  if (condition === HormonalCondition.PCOS || condition === HormonalCondition.PCOD) {
    tips = [
      {
        id: 'pcos-1',
        icon: <Activity className="w-4 h-4 text-green-600" />,
        title: "Low Glycemic Index Foods",
        description: "Choose whole grains, vegetables, and lean proteins",
        color: "bg-green-100",
        priority: 1,
        category: 'medical'
      },
      {
        id: 'pcos-2',
        icon: <Heart className="w-4 h-4 text-red-500" />,
        title: "High Fiber & Protein",
        description: "Improve insulin sensitivity with fiber-rich foods",
        color: "bg-red-100",
        priority: 2,
        category: 'medical'
      },
      {
        id: 'pcos-3',
        icon: <Activity className="w-4 h-4 text-orange-500" />,
        title: "Reduce Sugar & Refined Carbs",
        description: "Minimize white bread, sweets, and processed foods",
        color: "bg-orange-100",
        priority: 3,
        category: 'medical'
      },
      {
        id: 'pcos-4',
        icon: <Activity className="w-4 h-4 text-blue-500" />,
        title: "Daily Exercise",
        description: "Regular physical activity is crucial for PCOS management",
        color: "bg-blue-100",
        priority: 4,
        category: 'lifestyle'
      },
      {
        id: 'pcos-5',
        icon: <Activity className="w-4 h-4 text-purple-500" />,
        title: "Weight Management",
        description: "Maintain healthy weight through balanced diet and exercise",
        color: "bg-purple-100",
        priority: 5,
        category: 'lifestyle'
      }
    ];
  }

  // Symptom-based overrides (highest priority)
  const symptomOverrides: NutritionTip[] = [];
  if (symptoms.includes('fatigue')) {
    symptomOverrides.push({
      id: 'symptom-fatigue',
      icon: <Heart className="w-4 h-4 text-red-500" />,
      title: "Iron + Hydration Focus",
      description: "Combat fatigue with iron-rich foods and plenty of water",
      color: "bg-red-100",
      priority: 0,
      category: 'medical'
    });
  }
  
  if (symptoms.includes('acne')) {
    symptomOverrides.push({
      id: 'symptom-acne',
      icon: <Activity className="w-4 h-4 text-green-600" />,
      title: "Reduce Dairy & Sugar",
      description: "Minimize acne triggers with clean diet and hydration",
      color: "bg-green-100",
      priority: 0,
      category: 'medical'
    });
  }
  
  if (symptoms.includes('cramps')) {
    symptomOverrides.push({
      id: 'symptom-cramps',
      icon: <Sun className="w-4 h-4 text-yellow-500" />,
      title: "Magnesium-Rich Foods",
      description: "Reduce cramps with magnesium and proper hydration",
      color: "bg-yellow-100",
      priority: 0,
      category: 'medical'
    });
  }
  
  if (symptoms.includes('irregular periods')) {
    symptomOverrides.push({
      id: 'symptom-irregular',
      icon: <Activity className="w-4 h-4 text-blue-500" />,
      title: "Hormone-Balancing Foods",
      description: "Support regular cycles with phytoestrogen-rich foods",
      color: "bg-blue-100",
      priority: 0,
      category: 'medical'
    });
  }
  
  if (symptoms.includes('mood swings')) {
    symptomOverrides.push({
      id: 'symptom-mood',
      icon: <Moon className="w-4 h-4 text-purple-500" />,
      title: "Omega-3 + Sleep Tips",
      description: "Stabilize mood with omega-3s and quality sleep",
      color: "bg-purple-100",
      priority: 0,
      category: 'medical'
    });
  }

  // Return symptom overrides first if they exist, otherwise base tips
  return symptomOverrides.length > 0 ? symptomOverrides : tips;
}

function generateDynamicAlerts(
  condition: HormonalCondition,
  symptoms: string[],
  logs: any[]
): Alert[] {
  const alerts: Alert[] = [];

  // Symptom-based alerts
  if (symptoms.includes('fatigue')) {
    alerts.push({
      id: 'fatigue-rest',
      title: 'Rest More',
      description: 'Your body needs extra rest during this phase. Prioritize sleep and reduce physical activity.',
      timestamp: '20 mins ago',
      color: 'bg-red-50 border-red-200',
      titleColor: 'text-red-600',
      priority: 1
    });
  }

  if (symptoms.includes('irregular periods')) {
    alerts.push({
      id: 'irregular-cycle',
      title: 'Cycle Irregularity Detected',
      description: 'Your cycle pattern shows irregularity. Consider tracking more closely.',
      timestamp: '45 mins ago',
      color: 'bg-orange-50 border-orange-200',
      titleColor: 'text-orange-600',
      priority: 2
    });
  }

  if (symptoms.includes('cramps')) {
    alerts.push({
      id: 'cramps-management',
      title: 'Pain Management Recommended',
      description: 'Consider gentle exercises and warm compresses for cramp relief.',
      timestamp: '1 hour ago',
      color: 'bg-amber-50 border-amber-200',
      titleColor: 'text-amber-600',
      priority: 3
    });
  }

  // Check hydration from logs
  const recentLogs = logs.slice(-3);
  const lowHydration = recentLogs.some(log =>
    log.phase === 'puberty' && log.hydrationGlasses && log.hydrationGlasses < 6
  );
  if (lowHydration) {
    alerts.push({
      id: 'hydration-alert',
      title: 'Increase Hydration',
      description: 'Your water intake seems low. Aim for at least 8 glasses daily.',
      timestamp: '2 hours ago',
      color: 'bg-blue-50 border-blue-200',
      titleColor: 'text-blue-600',
      priority: 4
    });
  }

  // PCOS-specific alerts
  if (condition === HormonalCondition.PCOS || condition === HormonalCondition.PCOD) {
    // Check for weight gain symptoms
    const weightGainSymptoms = recentLogs.some(log => 
      log.phase === 'puberty' && log.weightGain
    );
    if (weightGainSymptoms) {
      alerts.push({
        id: 'pcos-exercise',
        title: 'Exercise Recommended',
        description: 'Regular exercise can help manage PCOS symptoms effectively.',
        timestamp: '3 hours ago',
        color: 'bg-purple-50 border-purple-200',
        titleColor: 'text-purple-600',
        priority: 5
      });
    }
  }

  return alerts.sort((a, b) => a.priority - b.priority).slice(0, 3);
}



export default function PubertyGuide() {
  const { phase } = usePhase();
  const { profile } = useProfile();
  const { getPhaseLogs } = useHealthLog();
  
  // Get puberty logs for analytics
  const logs = useMemo(() => getPhaseLogs("puberty"), [getPhaseLogs]);
  const logsArray = useMemo(() => Object.entries(logs).map(([date, entry]) => ({ date, ...entry })), [logs]);

  // Extract user data for dynamic tips
  const userData = useMemo(() => {
    if (!profile) return null;
    
    // Extract hormonal condition
    let hormonalCondition: HormonalCondition = HormonalCondition.none;
    if (profile.knownConditions) {
      const conditions = profile.knownConditions.toLowerCase();
      if (conditions.includes('pcos')) {
        hormonalCondition = HormonalCondition.PCOS;
      } else if (conditions.includes('pcod')) {
        hormonalCondition = HormonalCondition.PCOD;
      }
    }
    
    // Calculate puberty stage
    let pubertyStage: PubertyStatus = PubertyStatus.normal;
    if (profile.dob) {
      const age = new Date().getFullYear() - new Date(profile.dob).getFullYear();
      if (age < 11) pubertyStage = PubertyStatus.early;
      else if (age > 16) pubertyStage = PubertyStatus.late;
    }
    
    // Extract symptoms from recent logs
    const recentLogs = logsArray.slice(-7); // Last 7 days
    const symptoms: string[] = [];
    recentLogs.forEach(log => {
      if (log.phase === 'puberty') {
        if (log.periodSymptoms) {
          Object.entries(log.periodSymptoms).forEach(([symptom, value]) => {
            if (value) symptoms.push(symptom);
          });
        }
        // Access symptoms with proper type checking
        const pubertyLog = log as any;
        if (pubertyLog.fatigue) symptoms.push('fatigue');
        if (pubertyLog.moodSwings) symptoms.push('mood swings');
        if (pubertyLog.cramps) symptoms.push('cramps');
        if (pubertyLog.acne) symptoms.push('acne');
      }
    });
    
    return {
      pubertyStage,
      hormonalCondition,
      symptoms: [...new Set(symptoms)] // Remove duplicates
    };
  }, [profile, logsArray]);

  // Generate puberty dashboard configuration from existing profile data
  const pubertyConfig = useMemo(() => {
    if (!profile || !userData) return null;
    
    const dateOfBirth = profile.dob ? new Date(profile.dob) : undefined;
    const menarcheDate = profile.lastPeriodDate ? new Date(profile.lastPeriodDate) : undefined;
    
    return createPubertyDashboardConfig(
      dateOfBirth,
      menarcheDate,
      userData.hormonalCondition,
      Object.entries(logs).map(([date, entry]) => ({ date, ...entry }))
    );
  }, [profile, userData, logs]);

  // Generate dynamic nutrition tips and alerts
  const dynamicTips = useMemo(() => {
    if (!userData) return [];
    return generateDynamicNutritionTips(userData.pubertyStage, userData.hormonalCondition, userData.symptoms);
  }, [userData]);

  const dynamicAlerts = useMemo(() => {
    if (!userData) return [];
    return generateDynamicAlerts(userData.hormonalCondition, userData.symptoms, logsArray);
  }, [userData, logsArray]);

  
  // Existing dashboard logic - hasData already calculated above
  
  const cycleInfo = useMemo(() => {
    if (!logsArray.length) return null;
    const pubertyLogs = logsArray.filter(l => l.phase === "puberty") as any[];
    const lastPeriod = pubertyLogs.find(l => l.periodStarted);
    if (!lastPeriod) return null;
    
    const lastPeriodDate = new Date(lastPeriod.date);
    const cycleLengths = pubertyLogs
      .filter(l => l.periodStarted)
      .map(l => new Date(l.date).getTime())
      .sort((a, b) => b - a)
      .slice(1)
      .map((time, i, arr) => arr[i - 1] ? daysBetween(new Date(arr[i - 1]), new Date(time)) : null)
      .filter(Boolean) as number[];
    
    const avgCycleLength = cycleLengths.length > 0 
      ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
      : 28;
    
    const nextPeriod = addDays(lastPeriodDate, avgCycleLength);
    const ovulationDate = addDays(lastPeriodDate, Math.round(avgCycleLength * 0.5));
    const fertileWindowStart = addDays(ovulationDate, -5);
    const fertileWindowEnd = addDays(ovulationDate, 1);
    
    return {
      lastPeriodDate,
      nextPeriod,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      cycleLen: avgCycleLength,
      dayInCycle: daysBetween(lastPeriodDate, new Date()) + 1,
      fertilityLevel: daysBetween(new Date(), fertileWindowStart) <= 0 && daysBetween(new Date(), fertileWindowEnd) >= 0 ? "peak" : "building",
      riskLevel: daysBetween(new Date(), fertileWindowStart) <= 0 && daysBetween(new Date(), fertileWindowEnd) >= 0 ? "high" : "low",
    };
  }, [logsArray]);

  const wellnessScore = useMemo(() => computeWellnessScore(logs, phase), [logs, phase]);
  const allActions = useMemo(() => generatePriorityActions(logs, phase, profile?.weight ?? null), [logs, phase, profile]);
  const bodySignals = useMemo(() => computeBodySignals(logs, phase), [logs, phase]);
  const predictions = useMemo(() => generateSmartPredictions(logs, phase), [logs, phase]);
  
  const [completionStore, setCompletionStore] = useState(() => getCompletedActions());
  const handleToggle = useCallback((id: string) => {
    setCompletionStore(toggleActionComplete(id));
  }, []);

  const trendIcon = (t: string) => {
    if (t === "up") return <TrendingUp className="w-3.5 h-3.5" />;
    if (t === "down") return <TrendingDown className="w-3.5 h-3.5" />;
    return <Minus className="w-3.5 h-3.5" />;
  };

  const signalColor = (s: string) => {
    if (s === "good") return { bg: "bg-emerald-50", text: "text-emerald-600", label: "Optimal" };
    if (s === "moderate") return { bg: "bg-amber-50", text: "text-amber-600", label: "Fair" };
    return { bg: "bg-rose-50", text: "text-rose-600", label: "Needs Care" };
  };

  const predBarColor = (p: number) => p >= 60 ? "bg-rose-500" : p >= 35 ? "bg-amber-400" : "bg-emerald-400";

  if (!pubertyConfig) {
    return (
      <div className="min-h-screen py-12 bg-background">
        <div className="container max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Puberty Dashboard</h2>
            <p className="text-muted-foreground">Loading your personalized dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* ═══ 1. TODAY STATUS ═══════════════════════════════════════════════ */}
      <div className="bg-white border-b border-border/50">
        <div className="container py-6">
          <ScrollReveal>
            {logsArray.length > 0 ? (
              <div className="rounded-2xl p-5 border-2 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border bg-teal-100 border-teal-200">
                    ✨
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-slate-900 mb-1">Your Cycle Intelligence</h1>
                    <p className="text-sm text-slate-600 font-medium">Day {cycleInfo?.dayInCycle || 1} of {cycleInfo?.cycleLen || 28} • Current Phase</p>
                    <p className="text-xs text-slate-500 mt-1 italic">💡 {wellnessScore.insight}</p>
                  </div>
                </div>
                {/* Key dates */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  {[
                    { label: "Fertile Window", value: cycleInfo ? `${fmtDate(cycleInfo.fertileWindowStart)} – ${fmtDate(cycleInfo.fertileWindowEnd)}` : "Not available", icon: <Heart className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-100" },
                    { label: "Peak Fertility", value: cycleInfo ? fmtDate(cycleInfo.ovulationDate) : "Not available", icon: <TrendingUp className="w-4 h-4" />, color: "text-emerald-600 bg-emerald-100" },
                    { label: "Next Period", value: cycleInfo ? fmtDate(cycleInfo.nextPeriod) : "Not available", icon: <CalendarDays className="w-4 h-4" />, color: "text-pink-600 bg-pink-100" },
                    { label: "Wellness", value: `${wellnessScore.score}/100`, icon: <Sparkles className="w-4 h-4" />, color: `text-${wellnessScore.color}-600 bg-${wellnessScore.color}-100` },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/80 rounded-2xl p-3 border border-black/[0.04] shadow-sm">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${stat.color}`}>{stat.icon}</div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-8 border border-slate-200 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-3xl mb-4">📅</div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">No Cycle Data Yet</h2>
                <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">Log your period start date in the Calendar to see personalized cycle insights.</p>
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-8">
        {/* ═══ 2. ACTION CENTER ══════════════════════════════════════════ */}
        <section>
          <ScrollReveal>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-teal-500" />
                Today's Actions
              </h2>
              {completionStore.streak > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  🔥 {completionStore.streak} day streak
                </span>
              )}
            </div>
            <div className="space-y-3">
              {allActions.map((action) => {
                const done = completionStore.completed.includes(action.id);
                return (
                  <button key={action.id} onClick={() => handleToggle(action.id)} className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.99] ${
                    done ? "bg-emerald-50 border-emerald-200 opacity-70" : "bg-white border-border/60 hover:border-primary/30 hover:shadow-md"
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl ${done ? "bg-emerald-100" : "bg-slate-100"}`}>
                      {done ? "✅" : action.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${done ? "line-through text-slate-400" : "text-slate-800"}`}>{action.text}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{action.detail}</p>
                    </div>
                    {action.impact === "high" && !done && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 shrink-0 mt-1">Priority</span>
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollReveal>
        </section>

        
        {/* ═══ PUBERTY PROFILE STATUS ═══════════════════════════════════════ */}
        <section>
          <ScrollReveal delay={40}>
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Your Puberty Profile</h2>
                  <p className="text-xs text-muted-foreground">
                    {pubertyConfig.overrideReason || `Based on your ${pubertyConfig.profile?.pubertyStatus} puberty status`}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pubertyConfig.profile?.pubertyStatus === PubertyStatus.early ? 'bg-amber-100 text-amber-700' :
                    pubertyConfig.profile?.pubertyStatus === PubertyStatus.late ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {pubertyConfig.profile?.pubertyStatus === PubertyStatus.early ? 'Early Puberty' :
                     pubertyConfig.profile?.pubertyStatus === PubertyStatus.late ? 'Late Puberty' :
                     'Normal Puberty'}
                  </span>
                  {pubertyConfig.profile?.ageAtMenarche && (
                    <span className="text-xs text-muted-foreground">
                      (Age at menarche: {pubertyConfig.profile.ageAtMenarche} years)
                    </span>
                  )}
                </div>
                {pubertyConfig.profile?.hormonalCondition !== HormonalCondition.none && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Hormonal Condition:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pubertyConfig.profile?.hormonalCondition === HormonalCondition.PCOS ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {pubertyConfig.profile?.hormonalCondition}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ PERSONALIZED NUTRITION TIPS & ALERTS ═══════════════════════════════════════ */}
        <section>
          <ScrollReveal delay={60}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Card - Nutrition Tips */}
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm border border-green-100">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Leaf className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Nutrition Tips</h2>
                    <p className="text-sm text-gray-600">Eat well to support your recovery and energy levels.</p>
                  </div>
                </div>

                {/* Dynamic Content List */}
                <div className="space-y-4">
                  {dynamicTips && dynamicTips.length > 0 ? dynamicTips.slice(0, 5).map((tip, index) => (
                    <div key={tip.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-200 cursor-pointer">
                      <div className={`w-8 h-8 rounded-full ${tip.color} flex items-center justify-center flex-shrink-0`}>
                        {tip.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900">{tip.title}</h4>
                        <p className="text-xs text-gray-500">{tip.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Loading nutrition tips...</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-green-200">
                  <button className="flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors">
                    View All Nutrition Tips
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Card - Active Alerts & Recommendations */}
              <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-sm border border-pink-100">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-pink-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">2</span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Active Alerts & Recommendations</h2>
                  </div>
                </div>

                {/* Dynamic Alert Cards */}
                <div className="space-y-4">
                  {dynamicAlerts && dynamicAlerts.length > 0 ? dynamicAlerts.map((alert, index) => (
                    <div key={alert.id} className={`p-4 rounded-xl border ${alert.color} hover:shadow-sm transition-all duration-200 cursor-pointer`}>
                      <h4 className={`text-sm font-semibold ${alert.titleColor} mb-2`}>{alert.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">{alert.description}</p>
                      <p className="text-[10px] text-gray-400">{alert.timestamp}</p>
                    </div>
                  )) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No active alerts at this time.</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-pink-200">
                  <button className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors">
                    View All Alerts & Recommendations
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}
