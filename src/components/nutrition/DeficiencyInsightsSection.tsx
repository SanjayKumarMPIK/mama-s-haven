import { type ReactNode } from "react";
import { Flame, Leaf, Moon, Shield, Sparkles, Sun, TrendingUp } from "lucide-react";
import type { ComputedDeficiencyInsights } from "@/services/deficiency/types";
import type { DeficiencyAnalysis, DeficiencyResult } from "@/services/deficiency/deficiencyRulesEngine";

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-xl border border-[#eee8f4] bg-white px-3 py-1 text-xs font-medium text-[#6f6583]">
      {text}
    </span>
  );
}

function RiskChip({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-[#eee7f4] bg-white p-3 shadow-[0_4px_18px_rgba(184,164,198,0.1)]">
      <p className={`text-xs font-semibold ${tone}`}>{label}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function DeficiencyItem({
  icon,
  title,
  risk,
  probability,
  symptoms,
  why,
  bar,
  tone,
  recommendations,
}: {
  icon: ReactNode;
  title: string;
  risk: string;
  probability: string;
  symptoms: string;
  why: string;
  bar: string;
  tone: string;
  recommendations: string[];
}) {
  return (
    <div className="rounded-2xl border border-[#eee7f4] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4f8]">{icon}</div>
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">Probability</p>
          </div>
        </div>
        <p className={`text-xs font-semibold ${tone}`}>{risk}</p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-[#f2edf6]">
          <div className={`h-2 rounded-full ${bar}`} style={{ width: probability }} />
        </div>
        <span className="text-xs font-semibold text-foreground">{probability}</span>
      </div>
      <p className="mt-2 text-xs text-foreground/90"><strong>Common Symptoms:</strong> {symptoms}</p>
      <p className="mt-1 text-xs text-muted-foreground"><strong>Why it matters:</strong> {why}</p>
      {recommendations.length > 0 && (
        <div className="mt-3 rounded-xl bg-[#fff4f8] p-3">
          <p className="text-xs font-semibold text-[#9c5f84] mb-2">Recommended Foods:</p>
          <div className="flex flex-wrap gap-1.5">
            {recommendations.slice(0, 4).map((rec, idx) => (
              <span key={idx} className="rounded-lg bg-white px-2 py-1 text-[11px] font-medium text-[#7d6fbc] border border-[#f0e7f5]">
                {rec}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const severityTone: Record<string, string> = {
  Low: "text-[#41a25f]",
  Moderate: "text-[#bc8b32]",
  Elevated: "text-[#c97d2e]",
  High: "text-[#dc4f6f]",
  Critical: "text-[#dc4f6f]",
};

const severityColor: Record<string, string> = {
  Good: "text-[#41a25f]",
  Mild: "text-[#bc8b32]",
  Low: "text-[#c9862f]",
  Moderate: "text-[#c9862f]",
  Elevated: "text-[#c97d2e]",
  High: "text-[#d85386]",
  Critical: "text-[#d85386]",
};

const nutrientIcon: Record<string, ReactNode> = {
  Iron: <Flame className="h-5 w-5 text-[#ea527b]" />,
  "Vitamin D": <Sun className="h-5 w-5 text-[#df9a2c]" />,
  Magnesium: <Leaf className="h-5 w-5 text-[#4fb069]" />,
  Calcium: <Shield className="h-5 w-5 text-[#639ac5]" />,
  Protein: <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  Folate: <Leaf className="h-5 w-5 text-[#4fb069]" />,
  B12: <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  DHA: <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  Fiber: <Leaf className="h-5 w-5 text-[#4fb069]" />,
  Zinc: <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
  Potassium: <Leaf className="h-5 w-5 text-[#4fb069]" />,
  "Vitamin C": <Sparkles className="h-5 w-5 text-[#8d73c7]" />,
};

const nutrientBarColor: Record<string, string> = {
  Iron: "bg-gradient-to-r from-[#f25b83] to-[#f896b0]",
  "Vitamin D": "bg-gradient-to-r from-[#eeb34e] to-[#f5d498]",
  Magnesium: "bg-gradient-to-r from-[#56ba72] to-[#9dd7af]",
  Calcium: "bg-gradient-to-r from-[#5a9bc4] to-[#9bc4e8]",
  Protein: "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  Folate: "bg-gradient-to-r from-[#56ba72] to-[#9dd7af]",
  B12: "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  DHA: "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  Fiber: "bg-gradient-to-r from-[#56ba72] to-[#9dd7af]",
  Zinc: "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
  Potassium: "bg-gradient-to-r from-[#56ba72] to-[#9dd7af]",
  "Vitamin C": "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]",
};

const severityToneMap: Record<string, string> = {
  high: "text-[#dc4f6f]",
  moderate: "text-[#bc8b32]",
  low: "text-[#41a25f]",
  good: "text-[#3b8ed0]",
};

function getEnergyImpact(insights: ComputedDeficiencyInsights): string {
  const hasFatigue = insights.summary.activeSymptoms.some((s) => s.canonicalId === "fatigue");
  const hasSleepIssues = insights.summary.activeSymptoms.some((s) => s.canonicalId === "sleepIssues");
  const highScore = insights.overallScore >= 50;
  if (hasFatigue && hasSleepIssues && highScore) return "High";
  if (hasFatigue || hasSleepIssues) return "Medium";
  if (highScore) return "Low";
  return "Low";
}

// ─── Radial Progress Ring ──────────────────────────────────────────────────

function RadialRing({ value, size = 72, stroke = 6, color }: {
  value: number; size?: number; stroke?: number; color: string;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="#f3eef8" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
    </svg>
  );
}

// ─── Severity Design Tokens ────────────────────────────────────────────────

const LEVEL_STYLES: Record<string, {
  bg: string; border: string; ringColor: string;
  textColor: string; barGradient: string; badgeBg: string; badgeText: string;
}> = {
  High: {
    bg: "bg-gradient-to-br from-rose-50/80 to-pink-50/60",
    border: "border-rose-200/70",
    ringColor: "#e11d48",
    textColor: "text-rose-600",
    barGradient: "from-rose-400 to-rose-500",
    badgeBg: "bg-rose-100",
    badgeText: "text-rose-700",
  },
  Moderate: {
    bg: "bg-gradient-to-br from-amber-50/80 to-yellow-50/60",
    border: "border-amber-200/70",
    ringColor: "#d97706",
    textColor: "text-amber-600",
    barGradient: "from-amber-400 to-amber-500",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
  },
  Mild: {
    bg: "bg-gradient-to-br from-blue-50/80 to-sky-50/60",
    border: "border-blue-200/70",
    ringColor: "#2563eb",
    textColor: "text-blue-600",
    barGradient: "from-blue-400 to-blue-500",
    badgeBg: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  Low: {
    bg: "bg-gradient-to-br from-slate-50/80 to-gray-50/60",
    border: "border-slate-200/70",
    ringColor: "#94a3b8",
    textColor: "text-slate-500",
    barGradient: "from-slate-300 to-slate-400",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-600",
  },
};

// ─── Top 3 Analytics Card ──────────────────────────────────────────────────

function TopDeficiencyCard({ result, rank }: { result: DeficiencyResult; rank: number }) {
  const styles = LEVEL_STYLES[result.confidenceLevel] || LEVEL_STYLES.Low;
  const icon = nutrientIcon[result.label] || <Sparkles className="h-5 w-5 text-[#8d73c7]" />;

  return (
    <div className={`rounded-[22px] border ${styles.border} ${styles.bg} p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] transition-all hover:shadow-md`}>
      {/* Header row */}
      <div className="flex items-start gap-3.5">
        {/* Radial progress ring */}
        <div className="relative flex-shrink-0">
          <RadialRing value={result.confidence} color={styles.ringColor} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold leading-none text-foreground">{result.confidence}</span>
            <span className="text-[9px] text-muted-foreground font-medium">%</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 border border-gray-200/40 shadow-sm">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground truncate">{result.label}</h3>
              <p className="text-[10px] text-muted-foreground">Possible deficiency indicator</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.badgeBg} ${styles.badgeText}`}>
              #{rank} {result.confidenceLevel}
            </span>
          </div>

          {/* Confidence bar */}
          <div className="flex items-center gap-2 mt-2">
            <div className="h-[6px] flex-1 rounded-full bg-white/70 border border-gray-200/30 overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${styles.barGradient}`}
                style={{ width: `${Math.min(result.confidence, 100)}%`, transition: "width 0.8s ease-out" }}
              />
            </div>
            <span className={`text-[11px] font-bold ${styles.textColor} w-7 text-right`}>{result.confidence}%</span>
          </div>
        </div>
      </div>

      {/* Matched symptoms */}
      <div className="mt-3 pt-3 border-t border-gray-200/40">
        <p className="text-[10px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Based on your symptoms</p>
        <div className="flex flex-wrap gap-1.5">
          {result.reasons.map((reason, i) => (
            <span key={i} className="rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-medium text-foreground/75 border border-gray-200/50 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              {reason}
            </span>
          ))}
        </div>
      </div>

      {/* Food recommendations */}
      <div className="mt-2.5 rounded-xl bg-white/60 border border-gray-100/60 p-2.5">
        <p className="text-[10px] font-semibold text-foreground/60 mb-1.5 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" /> Recommended Foods
        </p>
        <div className="flex flex-wrap gap-1">
          {result.foods.slice(0, 4).map((food, i) => (
            <span key={i} className="rounded-md bg-purple-50/70 px-1.5 py-0.5 text-[10px] font-medium text-purple-700 border border-purple-100/50">
              {food.emoji} {food.name}
            </span>
          ))}
        </div>
      </div>

      {/* Lifestyle tip */}
      {result.lifestyleTips.length > 0 && (
        <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
          💡 {result.lifestyleTips[0]}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function DeficiencyInsightsSection({ insights }: { insights: ComputedDeficiencyInsights & { analysis?: DeficiencyAnalysis } }) {
  if (!insights.hasData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3 mt-1">
          <span className="text-base">🔍</span>
          <h2 className="text-base font-bold tracking-tight">Deficiency Insights</h2>
        </div>
        <div className="flex flex-col items-center justify-center text-center py-14 rounded-2xl border-2 border-dashed border-[#eee7f3] bg-[#fefcff]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center mb-4 opacity-60">
            <span className="text-2xl">🧪</span>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1.5">Not enough nutrition signals yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-1">
            Log your symptoms and health data in the Calendar to get personalized deficiency insights.
          </p>
          <ul className="text-xs text-muted-foreground mt-3 space-y-1">
            <li>• Log symptoms regularly</li>
            <li>• Track sleep & mood</li>
            <li>• Update hydration</li>
          </ul>
        </div>
      </div>
    );
  }

  const likelyCount = insights.deficiencies.filter(
    (d) => d.severity === "high" || d.severity === "moderate"
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3 mt-1">
        <span className="text-base">🔍</span>
        <h2 className="text-base font-bold tracking-tight">Deficiency Insights</h2>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <div className="rounded-2xl border border-[#f0e7f5] bg-[#fffafd] p-4 text-center">
              <p className="text-xs font-semibold text-muted-foreground">Your Nutrition Risk Score</p>
              <div className="mx-auto mt-4 grid h-24 w-24 place-content-center rounded-full border-[8px] border-[#f4d9e9] bg-white">
                <p className="text-4xl font-bold leading-none text-foreground">{insights.overallScore}</p>
                <p className="text-[11px] text-muted-foreground">/100</p>
              </div>
              <p className={`mt-2 text-sm font-semibold ${severityColor[insights.overallSeverity]}`}>{insights.overallSeverity} Risk</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-[#f2ebf6] bg-[#fefcff] p-3">
                <p className="text-sm text-foreground">Likely Deficiencies</p>
                <p className="text-sm font-semibold">{likelyCount}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#f2ebf6] bg-[#fefcff] p-3">
                <p className="text-sm text-foreground">Priority Nutrient</p>
                <p className={`text-sm font-semibold ${severityColor[insights.overallSeverity]}`}>{insights.priorityNutrient?.label || "N/A"}</p>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-[#f2ebf6] bg-[#fefcff] p-3">
                <p className="text-sm text-foreground">Energy Impact</p>
                <p className="text-sm font-semibold text-[#ba8a35]">{getEnergyImpact(insights)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <h2 className="text-base font-semibold">Deficiency Risk Overview</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <RiskChip label="High Risk" value={insights.riskCounts.high} tone="text-[#dc4f6f]" />
            <RiskChip label="Moderate Risk" value={insights.riskCounts.moderate} tone="text-[#bc8b32]" />
            <RiskChip label="Mild Risk" value={insights.riskCounts.low} tone="text-[#41a25f]" />
            <RiskChip label="Good" value={insights.riskCounts.good} tone="text-[#3b8ed0]" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
        <div className="space-y-4 rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <div>
            <h2 className="text-base font-semibold">Symptom-Based Detection</h2>
            <p className="text-xs text-muted-foreground">Symptoms detected from your health logs</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {insights.summary.frequentSymptoms.length > 0 ? (
              insights.summary.frequentSymptoms.map((s) => (
                <Badge key={s.symptom} text={s.symptom} />
              ))
            ) : (
              <p className="col-span-full text-xs text-muted-foreground">No frequent symptoms detected</p>
            )}
          </div>
          <div className="rounded-2xl border border-[#f0e8f5] bg-[#fffafe] p-3">
            <p className="text-sm font-semibold">Possible Deficiencies</p>
            <p className="text-xs text-muted-foreground">Based on your symptoms</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {insights.topDeficiencies.slice(0, 3).map((d) => (
                <span key={d.nutrientId} className="rounded-lg bg-[#ffeef4] px-2.5 py-1 text-xs font-medium text-[#c85888]">
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Top 3 Visual Analytics ─── */}
        <div className="space-y-3 rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold">Top Deficiency Insights</h2>
            <span className="text-[10px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100">Top 3</span>
          </div>
          {(() => {
            // Use new engine if available, fall back to legacy
            const analysisResults = insights.analysis?.results;
            if (analysisResults && analysisResults.length > 0) {
              return (
                <div className="space-y-3">
                  {analysisResults.slice(0, 3).map((result, i) => (
                    <TopDeficiencyCard key={result.nutrientId} result={result} rank={i + 1} />
                  ))}
                </div>
              );
            }
            // Fallback: use legacy deficiencies (top 3 regardless of severity)
            const top3 = insights.deficiencies.slice(0, 3);
            if (top3.length === 0) {
              return (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No deficiency signals detected yet</p>
                </div>
              );
            }
            return top3.map((d) => (
              <DeficiencyItem
                key={d.nutrientId}
                icon={nutrientIcon[d.label] || <Sparkles className="h-5 w-5 text-[#8d73c7]" />}
                title={`${d.label} Deficiency`}
                risk={`${d.severity.charAt(0).toUpperCase() + d.severity.slice(1)} Risk`}
                probability={`${d.score}%`}
                symptoms={d.symptomSources.slice(0, 4).join(", ")}
                why={`Based on your symptoms and phase context. Confidence: ${Math.min(d.score, 95)}%`}
                bar={nutrientBarColor[d.label] || "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]"}
                tone={severityToneMap[d.severity] || "text-[#41a25f]"}
                recommendations={d.recommendedFoods.map((f) => `${f.emoji} ${f.name}`)}
              />
            ));
          })()}
        </div>
      </section>

      <section className="rounded-2xl border border-[#efe6f3] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Moon className="h-4 w-4 text-[#8f7bbc]" />
            Insights are based on the information you provide and are not a substitute for medical advice.
          </p>
          <button type="button" className="shrink-0 text-xs font-semibold text-[#b16d96]">
            Know More
          </button>
        </div>
      </section>
    </div>
  );
}
