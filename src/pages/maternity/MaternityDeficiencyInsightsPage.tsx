/**
 * MaternityDeficiencyInsightsPage.tsx
 *
 * Dedicated page for maternity deficiency insights at
 * /maternity/nutrition/deficiency-insights
 *
 * Uses the new 8-step deficiency scoring engine to show
 * symptom-driven nutritional insights for pregnant users.
 */

import { Link } from "react-router-dom";
import { ArrowLeft, Activity, TrendingUp, Sparkles, AlertTriangle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { useDeficiencyInsights } from "@/hooks/useDeficiencyInsights";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import DeficiencyInsightsSection from "@/components/nutrition/DeficiencyInsightsSection";

export default function MaternityDeficiencyInsightsPage() {
  const insights = useDeficiencyInsights();
  const { trimester, mode } = usePregnancyProfile();
  const { analysis } = insights;

  const stageLabel = mode === "postpartum" ? "Postpartum"
    : mode === "premature" ? "Premature Care"
    : trimester ? `Trimester ${trimester}` : "Pregnancy";

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-400 flex items-center justify-center shadow-lg shadow-purple-200/30">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Deficiency Insights</h1>
                <p className="text-sm text-muted-foreground">
                  🤰 {stageLabel} • Symptom-driven nutrition analysis
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Disclaimer banner */}
        <ScrollReveal>
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50/60 border border-amber-200/60 p-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              These are <strong>possible deficiency indicators</strong> based on your logged symptoms, not medical diagnoses.
              Always consult your healthcare provider for clinical evaluation.
            </p>
          </div>
        </ScrollReveal>

        {/* New engine results */}
        {analysis.hasData ? (
          <>
            {/* Quick stats */}
            <ScrollReveal delay={50}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-violet-50 p-4 text-center">
                  <p className="text-3xl font-bold text-purple-700">{analysis.overallScore}</p>
                  <p className="text-[11px] text-purple-500 font-medium mt-1">Risk Score</p>
                </div>
                <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-pink-50 p-4 text-center">
                  <p className="text-3xl font-bold text-rose-600">{analysis.riskCounts.high}</p>
                  <p className="text-[11px] text-rose-500 font-medium mt-1">High Risk</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 text-center">
                  <p className="text-3xl font-bold text-amber-600">{analysis.riskCounts.moderate}</p>
                  <p className="text-[11px] text-amber-500 font-medium mt-1">Moderate</p>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-600">{analysis.activeSymptomCount}</p>
                  <p className="text-[11px] text-emerald-500 font-medium mt-1">Symptoms</p>
                </div>
              </div>
            </ScrollReveal>

            {/* Top deficiency cards from new engine */}
            {analysis.results.length > 0 && (
              <ScrollReveal delay={100}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <h2 className="text-base font-bold">Possible Deficiency Indicators</h2>
                </div>
                <div className="space-y-3">
                  {analysis.results
                    .filter(r => r.confidence > 0)
                    .map((result) => {
                      const levelColor = result.confidenceLevel === "High" ? "border-rose-200 bg-rose-50/40"
                        : result.confidenceLevel === "Moderate" ? "border-amber-200 bg-amber-50/40"
                        : result.confidenceLevel === "Mild" ? "border-blue-200 bg-blue-50/40"
                        : "border-gray-200 bg-gray-50/40";
                      const barColor = result.confidenceLevel === "High" ? "bg-gradient-to-r from-rose-400 to-rose-500"
                        : result.confidenceLevel === "Moderate" ? "bg-gradient-to-r from-amber-400 to-amber-500"
                        : result.confidenceLevel === "Mild" ? "bg-gradient-to-r from-blue-400 to-blue-500"
                        : "bg-gradient-to-r from-gray-300 to-gray-400";
                      const textColor = result.confidenceLevel === "High" ? "text-rose-600"
                        : result.confidenceLevel === "Moderate" ? "text-amber-600"
                        : result.confidenceLevel === "Mild" ? "text-blue-600"
                        : "text-gray-500";

                      return (
                        <div key={result.nutrientId} className={`rounded-2xl border p-4 ${levelColor}`}>
                          {/* Header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{result.emoji}</span>
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">{result.label}</h3>
                                <p className="text-[11px] text-muted-foreground">Potential nutritional imbalance</p>
                              </div>
                            </div>
                            <span className={`text-xs font-bold ${textColor}`}>
                              {result.confidenceLevel}
                            </span>
                          </div>

                          {/* Confidence bar */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-2 flex-1 rounded-full bg-white/80 border border-gray-200/40 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-700 ${barColor}`}
                                style={{ width: `${Math.min(result.confidence, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-foreground w-8 text-right">{result.confidence}%</span>
                          </div>

                          {/* Matched symptoms */}
                          <div className="mb-3">
                            <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Based on your symptoms:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {result.reasons.map((reason, i) => (
                                <span key={i} className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-medium text-foreground/80 border border-gray-200/60">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Food recommendations */}
                          <div className="rounded-xl bg-white/70 border border-gray-100 p-3">
                            <p className="text-[11px] font-semibold text-foreground/70 mb-2">
                              <TrendingUp className="w-3.5 h-3.5 inline mr-1" />
                              Recommended Foods
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {result.foods.slice(0, 5).map((food, i) => (
                                <span key={i} className="rounded-lg bg-purple-50/80 px-2 py-1 text-[11px] font-medium text-purple-700 border border-purple-200/50">
                                  {food.emoji} {food.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Lifestyle tips */}
                          {result.lifestyleTips.length > 0 && (
                            <div className="mt-2.5">
                              <p className="text-[10px] text-muted-foreground leading-relaxed">
                                💡 {result.lifestyleTips[0]}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </ScrollReveal>
            )}
          </>
        ) : (
          /* Empty state */
          <ScrollReveal>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-purple-200/60 bg-purple-50/20">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center mb-5 opacity-50">
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Not enough nutrition signals yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Log your symptoms in the Calendar to get personalized deficiency insights
                tailored to your pregnancy stage.
              </p>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-400 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-[0.97]"
              >
                Go to Calendar
              </Link>
            </div>
          </ScrollReveal>
        )}

        {/* Legacy insights section for backward compat */}
        <ScrollReveal delay={150}>
          <DeficiencyInsightsSection insights={insights} />
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
