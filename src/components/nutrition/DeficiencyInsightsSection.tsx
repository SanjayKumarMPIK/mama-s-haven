import { type ReactNode } from "react";
import { Flame, Leaf, Moon, Shield, Sparkles, Sun } from "lucide-react";
import type { ComputedDeficiencyInsights } from "@/services/deficiency/types";

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

export default function DeficiencyInsightsSection({ insights }: { insights: ComputedDeficiencyInsights }) {
  if (!insights.hasData) return null;

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

        <div className="space-y-3 rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Top Deficiency Insights</h2>
            <button type="button" className="text-xs font-semibold text-[#b26d95]">View All</button>
          </div>
          {insights.topDeficiencies.map((d) => (
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
          ))}
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
