import { type ReactNode } from "react";
import { ArrowLeft, Circle, Flame, Info, Leaf, Moon, Shield, Sparkles, Sun, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDeficiencyInsights } from "@/hooks/useDeficiencyInsights";
import { useSymptomDerivedRisks } from "@/hooks/useSymptomDerivedRisks";
import { usePhase } from "@/hooks/usePhase";

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

export default function DeficiencyInsights() {
  const { phase } = usePhase();
  const insights = useDeficiencyInsights();
  const symptomPatterns = useSymptomDerivedRisks();

  // Phase gate: only allow access in maternity phase
  if (phase !== "maternity") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#fff9fc] via-[#fcfbff] to-[#f9fffc] py-5">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mb-6">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Feature Not Available</h2>
            <p className="text-sm text-muted-foreground mb-8 max-w-md">
              Deficiency Insights are only available during the Maternity phase.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const severityTone: Record<string, string> = {
    Low: "text-[#41a25f]",
    Moderate: "text-[#bc8b32]",
    High: "text-[#dc4f6f]",
    Critical: "text-[#dc4f6f]",
  };

  const severityColor: Record<string, string> = {
    Low: "text-[#c9862f]",
    Moderate: "text-[#c9862f]",
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

  const likelyDeficiencies = insights.nutrientRisks.filter(r => r.probability >= 40).length;

  // Empty state: insufficient data
  const hasInsufficientData = symptomPatterns.frequentSymptoms.length === 0 && insights.overallRiskScore < 30;

  if (hasInsufficientData) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#fff9fc] via-[#fcfbff] to-[#f9fffc] py-5">
        <div className="container mx-auto max-w-6xl space-y-5 px-4 md:px-6">
          <section className="rounded-[28px] border border-[#eee6f2] bg-white p-5 shadow-[0_10px_30px_rgba(191,168,201,0.14)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Link to="/nutrition" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f0e8f5] bg-[#fdfaff] text-[#7d6fbc]">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Nutrition Deficiency Insights</h1>
                  <p className="text-sm text-muted-foreground">Understand your nutrient gaps. Nourish your best self.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-[#eee7f3] bg-white p-8 text-center">
            <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold mb-3">Log More Symptoms to Unlock Insights</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Deficiency insights are generated from your health log entries. Start tracking your symptoms in the calendar to receive personalized deficiency analysis.
            </p>
            <Link
              to="/calendar"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Go to Calendar
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff9fc] via-[#fcfbff] to-[#f9fffc] py-5">
      <div className="container mx-auto max-w-6xl space-y-5 px-4 md:px-6">
        <section className="rounded-[28px] border border-[#eee6f2] bg-white p-5 shadow-[0_10px_30px_rgba(191,168,201,0.14)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f0e8f5] bg-[#fdfaff] text-[#7d6fbc]">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nutrition Deficiency Insights</h1>
                <p className="text-sm text-muted-foreground">Understand your nutrient gaps. Nourish your best self.</p>
              </div>
            </div>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff2f8] text-[#bf7ba0]">
              <Info className="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#eee7f3] bg-white p-4">
            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <div className="rounded-2xl border border-[#f0e7f5] bg-[#fffafd] p-4 text-center">
                <p className="text-xs font-semibold text-muted-foreground">Your Nutrition Risk Score</p>
                <div className="mx-auto mt-4 grid h-24 w-24 place-content-center rounded-full border-[8px] border-[#f4d9e9] bg-white">
                  <p className="text-4xl font-bold leading-none text-foreground">{insights.overallRiskScore}</p>
                  <p className="text-[11px] text-muted-foreground">/100</p>
                </div>
                <p className={`mt-2 text-sm font-semibold ${severityColor[insights.overallSeverity]}`}>{insights.overallSeverity} Risk</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-xl border border-[#f2ebf6] bg-[#fefcff] p-3">
                  <p className="text-sm text-foreground">Likely Deficiencies</p>
                  <p className="text-sm font-semibold">{likelyDeficiencies}</p>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#f2ebf6] bg-[#fefcff] p-3">
                  <p className="text-sm text-foreground">Priority Nutrient</p>
                  <p className={`text-sm font-semibold ${severityColor[insights.overallSeverity]}`}>{insights.priorityNutrient || "N/A"}</p>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[#f2ebf6] bg-[#fefcff] p-3">
                  <p className="text-sm text-foreground">Energy Impact</p>
                  <p className="text-sm font-semibold text-[#ba8a35]">{insights.energyImpact}</p>
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
              {symptomPatterns.frequentSymptoms.length > 0 ? (
                symptomPatterns.frequentSymptoms.map((symptom) => (
                  <Badge key={symptom} text={symptom} />
                ))
              ) : (
                <p className="col-span-full text-xs text-muted-foreground">No frequent symptoms detected</p>
              )}
            </div>
            <div className="rounded-2xl border border-[#f0e8f5] bg-[#fffafe] p-3">
              <p className="text-sm font-semibold">Possible Deficiencies</p>
              <p className="text-xs text-muted-foreground">Based on your symptoms</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {insights.topDeficiencies.slice(0, 3).map((deficiency) => (
                  <span key={deficiency.nutrient} className="rounded-lg bg-[#ffeef4] px-2.5 py-1 text-xs font-medium text-[#c85888]">
                    {deficiency.nutrient}
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
            {insights.topDeficiencies.map((deficiency) => (
              <DeficiencyItem
                key={deficiency.nutrient}
                icon={nutrientIcon[deficiency.nutrient] || <Sparkles className="h-5 w-5 text-[#8d73c7]" />}
                title={`${deficiency.nutrient} Deficiency`}
                risk={`${deficiency.severity} Risk`}
                probability={`${deficiency.probability}%`}
                symptoms={deficiency.matchedSymptoms.slice(0, 4).join(", ")}
                why={`Based on your symptoms and phase context. Confidence: ${(deficiency.confidenceScore * 100).toFixed(0)}%`}
                bar={nutrientBarColor[deficiency.nutrient] || "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]"}
                tone={severityTone[deficiency.severity]}
                recommendations={deficiency.recommendations || []}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <h2 className="text-base font-semibold">Your Nutrient Risk Trend</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-2xl border border-[#efe8f4] bg-[#fefcff] p-4">
              <div className="mb-2 flex justify-between text-[11px] text-muted-foreground">
                <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
              </div>
              <div className="h-28 rounded-xl bg-[linear-gradient(to_bottom,#f9f4fb_1px,transparent_1px)] bg-[size:100%_25%] p-4">
                <div className="relative h-full">
                  {insights.topDeficiencies.slice(0, 3).map((deficiency, index) => (
                    <div
                      key={deficiency.nutrient}
                      className={`absolute left-0 h-[2px] rounded ${nutrientBarColor[deficiency.nutrient] || "bg-gradient-to-r from-[#8b73c7] to-[#b8a3e8]"}`}
                      style={{
                        top: `${(index + 1) * 16}px`,
                        width: `${deficiency.probability}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-[#efe8f4] bg-[#fff8fc] p-4">
              <div className="space-y-2 text-xs">
                {insights.topDeficiencies.slice(0, 3).map((deficiency) => (
                  <p key={deficiency.nutrient} className="flex items-center gap-2">
                    <Circle className={`h-2.5 w-2.5 fill-${deficiency.nutrient === "Iron" ? "[#e26b98]" : deficiency.nutrient === "Vitamin D" ? "[#e2a43d]" : "[#8b72c8]"} text-${deficiency.nutrient === "Iron" ? "[#e26b98]" : deficiency.nutrient === "Vitamin D" ? "[#e2a43d]" : "[#8b72c8]"}`} /> {deficiency.nutrient}
                  </p>
                ))}
              </div>
              <div className="mt-5 rounded-xl bg-white p-3">
                <p className="text-sm font-semibold">
                  {symptomPatterns.symptomTrend === "improving" ? "You're improving!" : symptomPatterns.symptomTrend === "worsening" ? "Needs attention" : "Stable"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {symptomPatterns.symptomTrend === "improving"
                    ? "Your nutrition is getting better. Keep continuing your healthy habits."
                    : symptomPatterns.symptomTrend === "worsening"
                    ? "Your symptoms are increasing. Consider adjusting your diet."
                    : "Your nutrition status is stable. Maintain your current habits."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-[24px] border border-[#eee7f3] bg-white p-4">
            <h2 className="text-base font-semibold">Today&apos;s Missing Nutrients</h2>
            <p className="text-xs text-muted-foreground">Nutrients your body needs more of today</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {insights.topDeficiencies.slice(0, 5).map((deficiency) => (
                <div key={deficiency.nutrient} className="rounded-xl border border-[#efe8f4] bg-[#fefcff] p-3 text-center">
                  {nutrientIcon[deficiency.nutrient] || <Sparkles className="mx-auto h-4 w-4 text-[#8d73c7]" />}
                  <p className="mt-1 text-xs font-semibold">{deficiency.nutrient}</p>
                  <p className={`text-[11px] text-muted-foreground ${severityTone[deficiency.severity]}`}>{deficiency.severity}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-[#eee7f3] bg-white p-4">
            <p className="text-sm font-semibold">Nutrient Gap Summary</p>
            <div className="mt-2 flex items-end gap-3">
              <div className="grid h-16 w-16 place-content-center rounded-full border-4 border-[#f2dbe8] bg-white text-2xl font-bold">
                {insights.nutrientRisks.filter(r => r.probability >= 40).length}
              </div>
              <p className="text-xs text-muted-foreground">Nutrients at risk</p>
            </div>
            <p className="mt-3 text-sm text-foreground/85">
              {insights.priorityNutrient
                ? `Focus on ${insights.priorityNutrient} first. Keep a balanced diet to reduce gaps.`
                : "Keep a balanced diet to reduce the gaps and fuel your best every day."}
            </p>
            <button type="button" className="mt-4 rounded-full bg-[#f7ebf4] px-4 py-2 text-xs font-semibold text-[#9c5f84]">
              View Full Nutrient Gaps
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-[#eee7f3] bg-white p-4">
          <h2 className="text-base font-semibold">Nutrient Deficiency Severity Guide</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-4">
            <div className="rounded-xl border border-[#e7f4ea] bg-[#f4fff6] p-3"><p className="text-sm font-semibold text-[#3f9f58]">Mild</p><p className="mt-1 text-xs text-[#51765c]">Minor deficiency. Manage with diet and lifestyle.</p></div>
            <div className="rounded-xl border border-[#f8edd9] bg-[#fffaf0] p-3"><p className="text-sm font-semibold text-[#b4852d]">Moderate</p><p className="mt-1 text-xs text-[#7d6943]">Noticeable deficiency. Needs attention and consistency.</p></div>
            <div className="rounded-xl border border-[#f8e3e6] bg-[#fff5f6] p-3"><p className="text-sm font-semibold text-[#c35a66]">High</p><p className="mt-1 text-xs text-[#865761]">High risk deficiency. Take action and improve your diet.</p></div>
            <div className="rounded-xl border border-[#f4dde8] bg-[#fff4fb] p-3"><p className="text-sm font-semibold text-[#bf4e91]">Critical</p><p className="mt-1 text-xs text-[#815b72]">Severe deficiency. Consult a healthcare professional.</p></div>
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
    </main>
  );
}
