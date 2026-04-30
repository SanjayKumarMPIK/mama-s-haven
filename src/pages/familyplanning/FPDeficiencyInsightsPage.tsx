import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import {
  predictFamilyPlanningDeficiencies,
  analyzeSymptomFrequency,
  computeRiskScore,
} from "@/lib/familyPlanningNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import {
  ArrowLeft, Zap, TrendingUp, TrendingDown, Minus,
  Calendar, AlertTriangle, ShieldCheck,
} from "lucide-react";

export default function FPDeficiencyInsightsPage() {
  const { logs } = useHealthLog();
  const { profile } = useProfile();
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const intent = fpProfile?.intent ?? "tracking";

  const predictions = useMemo(() => predictFamilyPlanningDeficiencies(logs, intent), [logs, intent]);
  const frequency = useMemo(() => analyzeSymptomFrequency(logs, 30), [logs]);
  const risk = useMemo(() => computeRiskScore(logs, intent), [logs, intent]);

  const trendIcon = (trend: string) => {
    if (trend === "rising") return <TrendingUp className="w-3.5 h-3.5 text-red-500" />;
    if (trend === "falling") return <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />;
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  const riskBarColor = (score: number) => {
    if (score >= 70) return "bg-red-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted/50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Deficiency Insights</h1>
                <p className="text-sm text-muted-foreground">
                  Personalized nutrient analysis • Based on your last 30 days of logs
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Overall Risk Score */}
        <ScrollReveal>
          <div className={`rounded-2xl border-2 p-6 ${
            risk.color === "red" ? "border-red-200 bg-red-50/50"
            : risk.color === "amber" ? "border-amber-200 bg-amber-50/50"
            : "border-emerald-200 bg-emerald-50/50"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Nutrition Risk Score</p>
                <h2 className="text-3xl font-bold">{risk.overallScore}<span className="text-lg text-muted-foreground">/100</span></h2>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                risk.color === "red" ? "bg-red-100 text-red-700"
                : risk.color === "amber" ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
              }`}>{risk.label}</span>
            </div>
            <div className="h-3 rounded-full bg-white/60 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${riskBarColor(risk.overallScore)}`} style={{ width: `${risk.overallScore}%` }} />
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span>{risk.deficiencyCount} nutrient gap{risk.deficiencyCount !== 1 ? "s" : ""}</span>
              <span>•</span>
              <span>{risk.logConsistency}% log consistency</span>
              {risk.topRisk && <><span>•</span><span>Top: {risk.topRisk}</span></>}
            </div>
          </div>
        </ScrollReveal>

        {/* Symptom Frequency Table */}
        {frequency.length > 0 && (
          <ScrollReveal delay={10}>
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-base font-bold mb-4">Symptom Frequency (Last 30 Days)</h3>
              <div className="space-y-3">
                {frequency.map((item) => (
                  <div key={item.symptomId} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.label}</span>
                        <div className="flex items-center gap-2">
                          {trendIcon(item.trend)}
                          <span className="text-xs text-muted-foreground">{item.count}/{item.totalDays} days</span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${
                          item.percentage >= 50 ? "bg-red-400" : item.percentage >= 25 ? "bg-amber-400" : "bg-teal-400"
                        }`} style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      item.percentage >= 50 ? "bg-red-100 text-red-700"
                      : item.percentage >= 25 ? "bg-amber-100 text-amber-700"
                      : "bg-teal-100 text-teal-700"
                    }`}>{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Deficiency Prediction Cards */}
        {predictions.hasData && predictions.predictions.length > 0 ? (
          <ScrollReveal delay={20}>
            <h3 className="text-base font-bold mb-4">Predicted Nutrient Gaps</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {predictions.predictions.map((pred) => (
                <div key={pred.id} className={`rounded-2xl border-2 p-5 bg-card hover:shadow-md transition-all ${
                  pred.confidence === "High" ? "border-amber-200" : "border-border/60"
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-bold">{pred.title}</h4>
                      <p className="text-sm text-primary font-semibold mt-0.5">{pred.nutrient}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                      pred.confidence === "High" ? "bg-amber-100 text-amber-800"
                      : pred.confidence === "Medium" ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                    }`}>{pred.confidence}</span>
                  </div>

                  {/* Risk Score Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Risk Score</span>
                      <span className="font-bold">{pred.riskScore}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                      <div className={`h-full rounded-full ${riskBarColor(pred.riskScore)}`} style={{ width: `${pred.riskScore}%` }} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Why we predict this</p>
                      <p className="text-sm bg-muted/20 p-2.5 rounded-lg border border-border/50 text-foreground/90">{pred.whyPredicted}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Why it matters</p>
                      <p className="text-sm text-foreground/85 leading-relaxed">{pred.whyItMatters}</p>
                    </div>
                    <div className="pt-2 border-t border-border/40">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Recommended Foods</p>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {pred.foods.map((food) => (
                          <span key={food} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm">{food}</span>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Healthy Habits</p>
                      <ul className="space-y-1 ml-4">
                        {pred.habits.map((habit, i) => (
                          <li key={i} className="text-sm text-foreground/85 list-disc">{habit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center text-center py-12 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <Zap className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold mb-2">No Nutrient Gaps Detected</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-6">Log your symptoms regularly in the calendar to get personalized deficiency predictions.</p>
              <Link to="/calendar" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold shadow-md">
                <Calendar className="w-4 h-4" /> Go to Calendar
              </Link>
            </div>
          </ScrollReveal>
        )}

        {/* Disclaimer */}
        <ScrollReveal delay={30}>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> These predictions are based on symptom patterns from your logs. They are not a medical diagnosis. Consult a healthcare professional before starting any supplements.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={40}>
          <Link to="/nutrition" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Nutrition Guide
          </Link>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
