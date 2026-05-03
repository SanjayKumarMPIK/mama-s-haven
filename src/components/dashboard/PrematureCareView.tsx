/**
 * PrematureCareView.tsx
 *
 * Full premature baby care dashboard — replaces pregnancy content
 * when mode === "premature". Renders inside PregnancyDashboard.
 *
 * Includes maternal recovery analytics (score, status, priorities,
 * symptom summary, activities, timeline, checkups) powered by
 * real health-log data via recoveryScoreEngine.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  usePregnancyProfile,
  getRiskLevel,
  type DeliveryData,
} from "@/hooks/usePregnancyProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePrematureBabyWeight, type WeightEntry } from "@/hooks/usePrematureBabyWeight";
import { usePrematureRecovery } from "@/modules/premature/recovery/usePrematureRecovery";
import { filterLogsByPhase, buildChartDataset } from "@/shared/symptom-sync/symptomAnalyticsAdapter";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import HealthSummaryCards from "@/components/shared/HealthSummaryCards";
import PrematureRecoveryTimeline from "@/components/dashboard/PrematureRecoveryTimeline";
import PrematureNutritionTipsCard from "./premature/PrematureNutritionTipsCard";
import PrematureActiveAlertsCard from "./premature/PrematureActiveAlertsCard";
import { getMaternityDashboardMetrics } from "@/modules/maternity/dashboard/adapters/maternityDashboardMetricsAdapter";
import {
  Baby, Heart, AlertTriangle,
  Scale, ClipboardCheck, Phone, Sparkles, ChevronRight,
  Plus, TrendingUp, TrendingDown, Minus, Calendar,
  ArrowLeft, RotateCcw, Activity, Droplets, Moon,
  Zap, Brain, CheckCircle2, Circle, Flame,
} from "lucide-react";
import VisualAnalytics from "./VisualAnalytics";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function riskBadge(risk: ReturnType<typeof getRiskLevel>) {
  if (risk === "high") return { label: "High Risk", cls: "bg-red-100 text-red-800 border-red-200" };
  if (risk === "moderate") return { label: "Moderate Risk", cls: "bg-amber-100 text-amber-800 border-amber-200" };
  if (risk === "low") return { label: "Low Risk", cls: "bg-green-100 text-green-800 border-green-200" };
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function PrematureCareView() {
  const { profile, clearProfile } = usePregnancyProfile();
  const { maternityLogs } = useHealthLog();
  const delivery = profile.delivery;
  const risk = getRiskLevel(delivery.weeksAtBirth);
  const riskInfo = riskBadge(risk);
  const weightTracker = usePrematureBabyWeight();

  // ─── Premature Recovery Analytics (memoized) ────────────────────────────────
  const prematureRecovery = usePrematureRecovery();
  const weeksPostDelivery = prematureRecovery.weeksPostDelivery;

  // ─── Health Summary Stats for Premature Dashboard ────────────────────────
  const healthSummaryStats = useMemo(() => {
    const metrics = getMaternityDashboardMetrics(maternityLogs);
    return {
      loggedDays: metrics.loggedDays,
      symptomsTracked: metrics.symptomsTracked,
      avgSleep: metrics.avgSleep,
      avgMood: metrics.avgMood,
    };
  }, [maternityLogs]);

  // Convert maternityLogs using the unified adapter to strictly isolate premature phase
  const maternityLogsArray = useMemo(() => {
    const deliveryDateISO = delivery.birthDate || new Date().toISOString().split("T")[0];
    const filtered = filterLogsByPhase(maternityLogs, "premature", deliveryDateISO);
    return buildChartDataset(filtered);
  }, [maternityLogs, delivery.birthDate]);

  // Weight input state
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [weightDate, setWeightDate] = useState(new Date().toISOString().slice(0, 10));
  const [weightValue, setWeightValue] = useState("");

  const handleAddWeight = () => {
    const w = parseInt(weightValue, 10);
    if (!w || w < 200 || w > 10000) return;
    weightTracker.addEntry({ date: weightDate, weight: w });
    setWeightValue("");
    setShowWeightForm(false);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* ─── Hero Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 border-b border-border">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
              <button
                onClick={clearProfile}
                title="Clear pregnancy data"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Data
              </button>
            </div>

            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    Premature Baby Care
                  </span>
                  {riskInfo && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskInfo.cls}`}>
                      {riskInfo.label}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Baby born at {delivery.weeksAtBirth} weeks
                </h1>
                {profile.name && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {profile.name}'s baby • Born {formatDate(delivery.birthDate)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {delivery.birthWeight && (
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{delivery.birthWeight}g</p>
                    <p className="text-[10px] text-muted-foreground font-medium">birth weight</p>
                  </div>
                )}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center shadow-lg text-2xl">
                  👶
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ─── Helpline strip ───────────────────────────────────────────── */}
      <div className="bg-red-600 text-white">
        <div className="container py-2 flex items-center justify-center gap-6 text-xs">
          <a href="tel:104" className="flex items-center gap-1.5 font-semibold hover:underline">
            <Phone className="w-3.5 h-3.5" /> 104 — Health Helpline
          </a>
          <a href="tel:108" className="flex items-center gap-1.5 font-semibold hover:underline">
            <Phone className="w-3.5 h-3.5" /> 108 — Ambulance
          </a>
        </div>
      </div>

      <div className="container py-6 space-y-6">

        {/* ═══════════════════════════════════════════════════════════════════
             MATERNAL RECOVERY ANALYTICS
           ═══════════════════════════════════════════════════════════════════ */}

        {/* ═══ Recovery Score + Timeline (25/75 Layout) ══════════════════════ */}
        <ScrollReveal>
          <div className="premature-recovery-layout">
            {/* ── Left: Recovery Score (25%) ── */}
            <div className="premature-recovery-score-panel">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-violet-700" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Recovery Score</h2>
                  <p className="text-[10px] text-muted-foreground">7-day inference</p>
                </div>
              </div>

              {/* Radial Gauge */}
              <div className="relative mx-auto" style={{ width: 130, height: 130 }}>
                <svg width="130" height="130" className="transform -rotate-90">
                  <circle cx="65" cy="65" r="50" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted-foreground/15" />
                  <circle
                    cx="65" cy="65" r="50"
                    stroke="url(#premRecGrad)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 - (prematureRecovery.recoveryBreakdown.overall / 100) * 2 * Math.PI * 50}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="premRecGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-foreground">{prematureRecovery.recoveryBreakdown.overall}</span>
                    <span className="text-xs text-muted-foreground font-medium">/100</span>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className={`mt-3 text-center px-3 py-1.5 rounded-xl border text-xs font-bold ${
                prematureRecovery.recoveryStatus.level === "critical" ? "bg-red-50 border-red-200 text-red-800" :
                prematureRecovery.recoveryStatus.level === "earlyStabilization" ? "bg-orange-50 border-orange-200 text-orange-800" :
                prematureRecovery.recoveryStatus.level === "improving" ? "bg-amber-50 border-amber-200 text-amber-800" :
                prematureRecovery.recoveryStatus.level === "stable" ? "bg-green-50 border-green-200 text-green-800" :
                "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}>
                {prematureRecovery.recoveryStatus.emoji} {prematureRecovery.recoveryStatus.label}
              </div>

              {/* Signal breakdown mini-bars */}
              <div className="mt-4 space-y-2">
                {prematureRecovery.signalMeta.map(signal => {
                  const value = prematureRecovery.recoveryBreakdown[signal.key];
                  return (
                    <div key={signal.key} className="premature-signal-row">
                      <div className="premature-signal-label">
                        <span className="text-[10px]">{signal.emoji}</span>
                        <span className="text-[10px] text-muted-foreground font-medium truncate">{signal.label}</span>
                      </div>
                      <div className="premature-signal-bar-bg">
                        <div
                          className={`premature-signal-bar-fill ${
                            value >= 70 ? "good" : value >= 45 ? "moderate" : "low"
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="premature-signal-value">{value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Right: Recovery Timeline (75%) ── */}
            <div className="premature-recovery-timeline-panel">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-indigo-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-sm">Recovery Timeline</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[10px] text-muted-foreground">
                      Week {weeksPostDelivery} · Day {prematureRecovery.daysPostDelivery}
                    </p>
                    {prematureRecovery.recoveryBreakdown.overall >= 85 && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ Accelerated</span>
                    )}
                    {prematureRecovery.recoveryBreakdown.overall < 45 && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">⚠ Monitoring</span>
                    )}
                  </div>
                </div>
              </div>
              <PrematureRecoveryTimeline
                phases={prematureRecovery.timelinePhases}
                currentPhase={prematureRecovery.currentPhase}
              />
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ Health Summary Analytics Cards ═════════════════════════════ */}
        <ScrollReveal delay={30}>
          <HealthSummaryCards
            loggedDays={healthSummaryStats.loggedDays}
            symptomsTracked={healthSummaryStats.symptomsTracked}
            avgSleep={healthSummaryStats.avgSleep}
            avgMood={healthSummaryStats.avgMood}
          />
        </ScrollReveal>

        <VisualAnalytics pubertyLogs={maternityLogsArray} />

        {/* ═══ Recovery Insight Cards ═════════════════════════════════════ */}
        <ScrollReveal delay={45}>
          <div className="grid gap-4 md:grid-cols-2">
            <PrematureNutritionTipsCard />
            <PrematureActiveAlertsCard />
          </div>
        </ScrollReveal>

        {/* ═══ Recovery Status + Daily Priority (side by side) ══════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Recovery Status */}
          <ScrollReveal delay={60}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-emerald-700" />
                </div>
                <h2 className="font-bold text-sm">Recovery Status</h2>
              </div>
              <div className={`rounded-xl p-4 border text-center ${
                prematureRecovery.recoveryStatus.level === "critical" ? "bg-red-50 border-red-200" :
                prematureRecovery.recoveryStatus.level === "earlyStabilization" ? "bg-orange-50 border-orange-200" :
                prematureRecovery.recoveryStatus.level === "improving" ? "bg-amber-50 border-amber-200" :
                prematureRecovery.recoveryStatus.level === "stable" ? "bg-green-50 border-green-200" :
                "bg-emerald-50 border-emerald-200"
              }`}>
                <span className="text-3xl block mb-2">{prematureRecovery.recoveryStatus.emoji}</span>
                <p className={`text-sm font-bold ${
                  prematureRecovery.recoveryStatus.level === "critical" ? "text-red-800" :
                  prematureRecovery.recoveryStatus.level === "earlyStabilization" ? "text-orange-800" :
                  prematureRecovery.recoveryStatus.level === "improving" ? "text-amber-800" :
                  prematureRecovery.recoveryStatus.level === "stable" ? "text-green-800" :
                  "text-emerald-800"
                }`}>{prematureRecovery.recoveryStatus.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Score: {prematureRecovery.recoveryBreakdown.overall} / 100
                </p>
              </div>

            </div>
          </ScrollReveal>

          {/* Daily Priorities */}
          <ScrollReveal delay={90}>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ClipboardCheck className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Today's Priorities</h2>
                  <p className="text-[10px] text-muted-foreground">Focus areas for today</p>
                </div>
              </div>
              <div className="space-y-2">
                {prematureRecovery.dailyPriorities.map(p => (
                  <div key={p.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-background">
                    <span className="text-lg shrink-0">{p.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{p.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{p.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ═══ Activity Suggestions ═════════════════════════════════════════ */}
        <ScrollReveal delay={150}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <Flame className="w-4 h-4 text-teal-700" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Suggested Activities</h2>
                <p className="text-[10px] text-muted-foreground">Personalized to your recovery state</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {prematureRecovery.activitySuggestions.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-background hover:bg-muted/30 transition-colors">
                  <span className="text-lg shrink-0 mt-0.5">{a.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{a.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══ Recovery Checkups ════════════════════════════════════════════ */}
        <ScrollReveal delay={210}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
                <ClipboardCheck className="w-4 h-4 text-pink-700" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Recovery Checkups</h2>
                <p className="text-[10px] text-muted-foreground">
                  {prematureRecovery.checkups.filter(c => c.completed).length} / {prematureRecovery.checkups.length} completed
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {prematureRecovery.checkups.map(c => (
                <button
                  key={c.id}
                  onClick={() => prematureRecovery.toggleCheckup(c.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                    c.completed
                      ? "bg-green-50 border-green-200 shadow-sm"
                      : "bg-background border-border/60 hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    c.completed ? "bg-green-500 border-green-500" : "border-muted-foreground/40"
                  }`}>
                    {c.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <div>
                    <p className={`text-xs font-medium ${
                      c.completed ? "text-green-800 line-through" : "text-foreground"
                    }`}>
                      {c.emoji} {c.label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════════════════════════════════════
             BABY CARE SECTIONS
           ═══════════════════════════════════════════════════════════════════ */}

        {/* ═══ Section 5: Weight Tracker ═══════════════════════════════════ */}
        <ScrollReveal delay={240}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                  <Scale className="w-4 h-4 text-teal-700" />
                </div>
                <div>
                  <h2 className="font-bold text-sm">Weight Tracker</h2>
                  <p className="text-[10px] text-muted-foreground">Track weekly weight gain</p>
                </div>
              </div>
              <button
                onClick={() => setShowWeightForm(!showWeightForm)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
              >
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>

            {/* Weight input form */}
            {showWeightForm && (
              <div className="mb-4 p-4 rounded-xl border border-border bg-background space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Date</label>
                    <input
                      type="date"
                      value={weightDate}
                      onChange={(e) => setWeightDate(e.target.value)}
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Weight (grams)</label>
                    <input
                      type="number"
                      value={weightValue}
                      onChange={(e) => setWeightValue(e.target.value)}
                      placeholder="e.g. 1800"
                      className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <button
                  onClick={handleAddWeight}
                  disabled={!weightValue || parseInt(weightValue) < 200}
                  className="w-full py-2 rounded-lg bg-teal-600 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-40"
                >
                  Save Weight Entry
                </button>
              </div>
            )}

            {/* Trend indicator */}
            {weightTracker.entries.length >= 2 && (
              <div className={`mb-4 p-3 rounded-xl border flex items-center gap-3 ${
                weightTracker.trend === "gaining"
                  ? "bg-green-50 border-green-200"
                  : weightTracker.trend === "slow"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-red-50 border-red-200"
              }`}>
                {weightTracker.trend === "gaining" && <TrendingUp className="w-5 h-5 text-green-600" />}
                {weightTracker.trend === "slow" && <Minus className="w-5 h-5 text-amber-600" />}
                {weightTracker.trend === "losing" && <TrendingDown className="w-5 h-5 text-red-600" />}
                <p className={`text-xs font-semibold ${
                  weightTracker.trend === "gaining" ? "text-green-800"
                  : weightTracker.trend === "slow" ? "text-amber-800"
                  : "text-red-800"
                }`}>
                  {weightTracker.trend === "gaining" && "Good progress! Baby is gaining weight as expected."}
                  {weightTracker.trend === "slow" && "Baby weight gain is slower than expected. Monitor closely."}
                  {weightTracker.trend === "losing" && "Baby is not gaining weight. Please consult your doctor."}
                </p>
              </div>
            )}

            {/* Weight entries list */}
            {weightTracker.entries.length > 0 ? (
              <div className="space-y-1.5">
                {weightTracker.entries.slice().reverse().map((entry) => (
                  <div key={entry.date} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background border border-border/60">
                    <div className="flex items-center gap-2">
                      <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                    </div>
                    <span className="text-sm font-bold">{entry.weight}g</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">
                No weight entries yet. Add your baby's weight to track progress.
              </p>
            )}
          </div>
        </ScrollReveal>

        {/* ─── Medical Disclaimer ──────────────────────────────────────── */}
        <ScrollReveal delay={420}>
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <p className="text-xs text-blue-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Disclaimer:</strong> This guide provides general care tips for premature babies. It is NOT a substitute for medical advice. Always consult your doctor or NICU team for your baby's specific needs.
              </span>
            </p>
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}