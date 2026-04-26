import { useState, useMemo, useCallback } from "react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { useLanguage } from "@/hooks/useLanguage";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import { Link } from "react-router-dom";
import {
  Activity, TrendingUp, TrendingDown, Minus, Brain, Lightbulb, Heart,
  ChevronRight, Calendar, Moon, Smile, Sparkles, X, ArrowRight, BarChart3,
  Shield, Zap, Eye,
} from "lucide-react";
import StatCard, { phaseAccent } from "@/components/shared/StatCard";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  computeSymptomInsights,
  getSymptomDetail,
  type SymptomFrequency,
  type SymptomDetailData,
} from "@/lib/symptomInsightsEngine";
import {
  computeSymptomPredictions,
  type SymptomPrediction,
} from "@/lib/symptomPredictionEngine";

// ─── Chart palette ────────────────────────────────────────────────────────────

const CHART_COLORS = [
  { stroke: "#f472b6", fill: "url(#grad0)" },
  { stroke: "#a78bfa", fill: "url(#grad1)" },
  { stroke: "#34d399", fill: "url(#grad2)" },
];

const CHART_SOLID = ["#f472b6", "#a78bfa", "#34d399"];

// ─── Phase accent map ─────────────────────────────────────────────────────────

// ─── Trend icon helper ────────────────────────────────────────────────────────

function TrendBadge({ trend }: { trend: SymptomFrequency["trend"] }) {
  if (trend === "increasing") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
        <TrendingUp className="w-3 h-3" /> Rising
      </span>
    );
  }
  if (trend === "decreasing") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600">
        <TrendingDown className="w-3 h-3" /> Improving
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
      <Minus className="w-3 h-3" /> Stable
    </span>
  );
}

// ─── Mood label ───────────────────────────────────────────────────────────────

function moodLabel(val: number | null): string {
  if (val === null) return "–";
  if (val >= 2.5) return "Good 😊";
  if (val >= 1.5) return "Okay 😐";
  return "Low 😔";
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-md px-3.5 py-2.5 shadow-xl">
      <p className="text-[11px] font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-xs font-medium" style={{ color: p.stroke || p.color }}>
          {p.name}: {p.value > 0 ? "Present" : "–"}
        </p>
      ))}
    </div>
  );
}

// ─── Insight type icon ────────────────────────────────────────────────────────

function InsightIcon({ type }: { type: string }) {
  const cls = "w-4 h-4";
  switch (type) {
    case "pattern": return <Brain className={cls} />;
    case "phase": return <Heart className={cls} />;
    case "behavioral": return <Lightbulb className={cls} />;
    case "alert": return <Shield className={cls} />;
    default: return <Sparkles className={cls} />;
  }
}

const insightBg: Record<string, string> = {
  pattern: "bg-blue-50 border-blue-200/60 text-blue-800",
  phase: "bg-purple-50 border-purple-200/60 text-purple-800",
  behavioral: "bg-amber-50 border-amber-200/60 text-amber-800",
  alert: "bg-red-50 border-red-200/60 text-red-800",
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Main Component ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function SymptomChecker() {
  const { simpleMode } = useLanguage();
  const { phase } = usePhase();
  const { getPhaseLogs } = useHealthLog();

  const phaseLogs = useMemo(() => getPhaseLogs(phase), [getPhaseLogs, phase]);

  const [selectedSymptomId, setSelectedSymptomId] = useState<string | null>(null);

  const accent = phaseAccent[phase] ?? phaseAccent.puberty;

  // ── Compute analytics (memoized) ──
  const data = useMemo(() => computeSymptomInsights(phaseLogs, phase), [phaseLogs, phase]);

  // ── Compute predictions (memoized) ──
  const predictionResult = useMemo(
    () => computeSymptomPredictions(phaseLogs, phase),
    [phaseLogs, phase],
  );

  // ── Compute symptom detail (memoized) ──
  const detail = useMemo<SymptomDetailData | null>(() => {
    if (!selectedSymptomId) return null;
    return getSymptomDetail(phaseLogs, phase, selectedSymptomId);
  }, [phaseLogs, phase, selectedSymptomId]);

  const handleSymptomClick = useCallback((id: string) => {
    setSelectedSymptomId((prev) => (prev === id ? null : id));
  }, []);

  const closeDetail = useCallback(() => setSelectedSymptomId(null), []);

  // ─── Symptom label lookup for chart ──
  const symLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const s of data.allSymptoms) map[s.id] = s.label;
    return map;
  }, [data.allSymptoms]);

  // ═══ Render ═════════════════════════════════════════════════════════════════

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Symptom Insights</h1>
                <p className="text-sm text-muted-foreground">
                  Powered by your calendar data • Updated in real-time
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {!data.hasData ? (
          /* ─── Empty State ──────────────────────────────────────────────── */
          <ScrollReveal>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center mb-5 shadow-lg opacity-40`}>
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Symptom Data Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Start logging your daily symptoms in the Calendar to unlock personalized
                insights, trend analysis, and health recommendations.
              </p>
              <Link
                to="/calendar"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r ${accent.gradient} text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]`}
              >
                <Calendar className="w-4 h-4" />
                Go to Calendar
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* ─── Section 1: Summary Stats ──────────────────────────────── */}
            <ScrollReveal>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard
                  label="Days Logged"
                  value={String(data.loggedDays7d)}
                  sub="this week"
                  icon={<Calendar className="w-4 h-4" />}
                  accent={accent}
                />
                <StatCard
                  label="Symptoms Tracked"
                  value={String(data.totalSymptoms7d)}
                  sub="this week"
                  icon={<Activity className="w-4 h-4" />}
                  accent={accent}
                />
                <StatCard
                  label="Avg Sleep"
                  value={data.avgSleep7d !== null ? `${data.avgSleep7d}h` : "–"}
                  sub="this week"
                  icon={<Moon className="w-4 h-4" />}
                  accent={accent}
                />
                <StatCard
                  label="Avg Mood"
                  value={moodLabel(data.avgMood7d)}
                  sub="this week"
                  icon={<Smile className="w-4 h-4" />}
                  accent={accent}
                />
              </div>
            </ScrollReveal>

            {/* ─── Section 1.5: Predictive Symptom Insights ────────────── */}
            {predictionResult.predictions.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Upcoming Symptom Insights" emoji="🔮" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {predictionResult.predictions.map((pred) => (
                    <PredictionCard
                      key={pred.symptom}
                      prediction={pred}
                      accent={accent}
                    />
                  ))}
                </div>

                {/* Disclaimer */}
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200/60 px-4 py-2.5">
                  <Eye className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {predictionResult.disclaimer}
                  </p>
                </div>
              </ScrollReveal>
            )}

            {/* ─── Section 2: Top Symptoms ────────────────────────────────── */}
            <ScrollReveal>
              <SectionHeader title="Your Top Symptoms" emoji="📊" />
              {data.topSymptoms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {data.topSymptoms.map((sym, idx) => (
                    <button
                      key={sym.id}
                      onClick={() => handleSymptomClick(sym.id)}
                      className={`relative rounded-2xl border-2 p-5 text-left transition-all hover:shadow-lg active:scale-[0.98] ${
                        selectedSymptomId === sym.id
                          ? `${accent.border} ${accent.cardBg} ring-2 ${accent.ring}`
                          : "border-border/40 bg-card hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{sym.emoji}</span>
                        <TrendBadge trend={sym.trend} />
                      </div>
                      <h3 className="text-base font-bold mb-1">{sym.label}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-extrabold" style={{ color: CHART_SOLID[idx] ?? "#888" }}>
                          {sym.count7d}x
                        </span>
                        <span className="text-xs text-muted-foreground font-medium">this week</span>
                      </div>
                      {sym.count30d > sym.count7d && (
                        <p className="text-[11px] text-muted-foreground mt-1">{sym.count30d}x in last 30 days</p>
                      )}
                      <div className="absolute bottom-2 right-3">
                        <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4">
                  Log symptoms for a few days to see your top patterns here.
                </p>
              )}

              {/* All symptom chips */}
              {data.allSymptoms.length > 3 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.allSymptoms.slice(3).map((sym) => (
                    <button
                      key={sym.id}
                      onClick={() => handleSymptomClick(sym.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-[0.97] ${
                        selectedSymptomId === sym.id
                          ? accent.badge + " border-current"
                          : "border-border/50 bg-card hover:border-primary/30"
                      }`}
                    >
                      {sym.emoji} {sym.label}
                      <span className="ml-1.5 opacity-50">({sym.count7d}x)</span>
                    </button>
                  ))}
                </div>
              )}
            </ScrollReveal>

            {/* ─── Symptom Detail Panel ───────────────────────────────────── */}
            {detail && (
              <ScrollReveal>
                <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-5 relative`}>
                  <button
                    onClick={closeDetail}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-background border border-border/60 flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Close"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{detail.emoji}</span>
                    <div>
                      <h3 className="text-lg font-bold">{detail.label}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <TrendBadge trend={detail.trend} />
                        {detail.daysAgoLast !== null && (
                          <span className="text-[11px] text-muted-foreground">
                            Last: {detail.daysAgoLast === 0 ? "Today" : `${detail.daysAgoLast}d ago`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Frequency stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-xl bg-background/80 border border-border/30 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">7 Day</p>
                      <p className="text-xl font-extrabold mt-0.5">{detail.count7d}x</p>
                    </div>
                    <div className="rounded-xl bg-background/80 border border-border/30 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">30 Day</p>
                      <p className="text-xl font-extrabold mt-0.5">{detail.count30d}x</p>
                    </div>
                  </div>

                  {/* Patterns */}
                  {detail.patterns.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Related Patterns
                      </p>
                      <ul className="space-y-1.5">
                        {detail.patterns.map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                      What You Can Do
                    </p>
                    <ul className="space-y-1.5">
                      {detail.suggestions.map((s, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                          <span className="mt-0.5 text-xs">💡</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* ─── Section 3: Visual Trends ──────────────────────────────── */}
            {data.topSymptoms.length > 0 && data.trendData.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Visual Trends" emoji="📈" />
                <div className={`rounded-2xl border ${accent.border} bg-card p-5`}>
                  <p className="text-xs text-muted-foreground mb-4 font-medium">Last 14 days — top symptoms</p>
                  <div className="h-56 sm:h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.trendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                        <defs>
                          {CHART_SOLID.map((color, i) => (
                            <linearGradient key={i} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" opacity={0.4} />
                        <XAxis
                          dataKey="dateLabel"
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          tickLine={false}
                          axisLine={false}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          domain={[0, "dataMax + 0.5"]}
                          tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        {data.topSymptoms.map((sym, idx) => (
                          <Area
                            key={sym.id}
                            type="monotone"
                            dataKey={sym.id}
                            name={symLabelMap[sym.id] ?? sym.id}
                            stroke={CHART_COLORS[idx]?.stroke ?? "#888"}
                            fill={CHART_COLORS[idx]?.fill ?? "transparent"}
                            strokeWidth={2.5}
                            dot={{ r: 3, fill: CHART_COLORS[idx]?.stroke ?? "#888", strokeWidth: 0 }}
                            activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-4 flex-wrap mt-3 pt-3 border-t border-border/30">
                    {data.topSymptoms.map((sym, idx) => (
                      <span key={sym.id} className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CHART_SOLID[idx] ?? "#888" }}
                        />
                        {sym.label}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* ─── Section 4: Key Patterns ───────────────────────────────── */}
            {data.insights.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="Key Patterns" emoji="🧠" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {data.insights.map((insight, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl border p-4 ${insightBg[insight.type] ?? "bg-card border-border"}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{insight.icon}</span>
                        <InsightIcon type={insight.type} />
                        <h4 className="text-sm font-bold flex-1">{insight.title}</h4>
                      </div>
                      <p className="text-sm leading-relaxed opacity-80">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* ─── Section 5: What You Can Do ────────────────────────────── */}
            {data.recommendations.length > 0 && (
              <ScrollReveal>
                <SectionHeader title="What You Can Do" emoji="💡" />
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {data.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-border/40 bg-card p-4 hover:shadow-sm transition-shadow"
                    >
                      <span className="text-lg mt-0.5 shrink-0">{rec.icon}</span>
                      <p className="text-sm leading-relaxed">{rec.text}</p>
                    </div>
                  ))}
                </div>

                {/* Connect cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  <Link
                    to="/wellness"
                    className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
                  >
                    <BarChart3 className={`w-5 h-5 ${accent.text}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Wellness Dashboard</p>
                      <p className="text-[11px] text-muted-foreground">Full health overview</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/weekly-guide"
                    className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
                  >
                    <Calendar className={`w-5 h-5 ${accent.text}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Weekly Guide</p>
                      <p className="text-[11px] text-muted-foreground">Phase-specific advice</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    to="/calendar"
                    className={`flex items-center gap-3 rounded-xl border ${accent.border} ${accent.bg} p-4 hover:shadow-md transition-all active:scale-[0.98] group`}
                  >
                    <Heart className={`w-5 h-5 ${accent.text}`} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Log Symptoms</p>
                      <p className="text-[11px] text-muted-foreground">Keep tracking daily</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </ScrollReveal>
            )}
          </>
        )}
      </div>

      <SafetyDisclaimer />
    </main>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function SectionHeader({ title, emoji }: { title: string; emoji: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <span className="text-base">{emoji}</span>
      <h2 className="text-base font-bold tracking-tight">{title}</h2>
    </div>
  );
}

// ─── Prediction Card ──────────────────────────────────────────────────────────

const CONFIDENCE_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  high:   { bg: "bg-gradient-to-br from-violet-50/80 to-purple-50/60", border: "border-violet-200/60", badge: "bg-violet-100 text-violet-700" },
  medium: { bg: "bg-gradient-to-br from-slate-50/80 to-gray-50/60",   border: "border-slate-200/60",  badge: "bg-slate-100 text-slate-600" },
};

function PredictionCard({
  prediction,
  accent,
}: {
  prediction: SymptomPrediction;
  accent: typeof phaseAccent[string];
}) {
  const colors = CONFIDENCE_COLORS[prediction.confidence] ?? CONFIDENCE_COLORS.medium;

  return (
    <div
      className={`relative rounded-2xl border-2 ${colors.border} ${colors.bg} p-4 transition-all hover:shadow-md group overflow-hidden`}
    >
      {/* Decorative shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full" style={{ transition: 'transform 0.7s ease, opacity 0.3s ease' }} />

      <div className="relative z-10">
        {/* Top row: emoji + confidence */}
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-2xl">{prediction.emoji}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${colors.badge}`}>
            {prediction.confidence === "high" ? (
              <Zap className="w-2.5 h-2.5" />
            ) : (
              <Sparkles className="w-2.5 h-2.5" />
            )}
            {prediction.confidence}
          </span>
        </div>

        {/* Prediction message */}
        <p className="text-sm font-semibold leading-snug mb-1.5">
          {prediction.message}
        </p>

        {/* Confidence label */}
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {prediction.confidenceLabel}
        </p>
      </div>
    </div>
  );
}
