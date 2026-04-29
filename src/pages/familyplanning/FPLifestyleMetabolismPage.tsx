import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import { getLifestyleInsights, analyzeSleep, analyzeSymptomFrequency } from "@/lib/familyPlanningNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { ArrowLeft, Activity, ShieldCheck, Moon, Sparkles } from "lucide-react";

export default function FPLifestyleMetabolismPage() {
  const { profile } = useProfile();
  const { logs } = useHealthLog();
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const intent = fpProfile?.intent ?? "tracking";

  const insights = useMemo(
    () => getLifestyleInsights(profile?.bmi ?? null, profile?.weight ?? null, profile?.activityLevel ?? "moderate", intent),
    [profile?.bmi, profile?.weight, profile?.activityLevel, intent],
  );

  const sleepData = useMemo(() => analyzeSleep(logs, 30), [logs]);
  const frequency = useMemo(() => analyzeSymptomFrequency(logs, 30), [logs]);

  const sleepIssueFreq = frequency.find(s => s.symptomId === "sleepIssues");
  const stressFreq = frequency.find(s => s.symptomId === "stress");

  const statusColor = (status: string) => {
    if (status === "warning") return { border: "border-red-200", bg: "bg-red-50/50", dot: "bg-red-500", text: "text-red-600" };
    if (status === "attention") return { border: "border-amber-200", bg: "bg-amber-50/50", dot: "bg-amber-500", text: "text-amber-600" };
    return { border: "border-emerald-200", bg: "bg-emerald-50/50", dot: "bg-emerald-500", text: "text-emerald-600" };
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted/50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Lifestyle & Metabolism</h1>
                  <p className="text-sm text-muted-foreground">
                    Body metrics, sleep analysis, and lifestyle impact on hormones
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Lifestyle Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {insights.map((insight, idx) => {
            const c = statusColor(insight.status);
            return (
              <ScrollReveal key={insight.title} delay={idx * 10}>
                <div className={`rounded-2xl border-2 p-5 ${c.border} ${c.bg} h-full`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{insight.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{insight.title}</p>
                      <p className={`text-base font-bold ${c.text}`}>{insight.value}</p>
                    </div>
                    <span className={`w-3 h-3 rounded-full ${c.dot}`} />
                  </div>
                  <p className="text-sm text-foreground/70 leading-relaxed">{insight.tip}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Sleep Analysis from Real Logs */}
        <ScrollReveal delay={50}>
          <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Moon className="w-6 h-6 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold">Sleep Analysis</h3>
                <p className="text-xs text-muted-foreground">
                  {sleepData.totalTrackedDays > 0
                    ? `Based on ${sleepData.totalTrackedDays} nights tracked in the last 30 days`
                    : "Log your sleep to see analysis"}
                </p>
              </div>
            </div>

            {sleepData.avgHours !== null ? (
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">{sleepData.avgHours}h</p>
                  <p className="text-xs text-muted-foreground">Avg/Night</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${sleepData.quality === "poor" ? "text-red-600" : sleepData.quality === "fair" ? "text-amber-600" : "text-emerald-600"}`}>
                    {sleepData.quality === "poor" ? "⚠️" : sleepData.quality === "fair" ? "😐" : "✅"}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{sleepData.quality} Quality</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-500">{sleepData.poorSleepDays}</p>
                  <p className="text-xs text-muted-foreground">Poor Sleep Days</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">No sleep data logged yet. Track your sleep in the calendar for insights.</p>
            )}

            {/* Sleep-hormone connection */}
            <div className="bg-white/60 rounded-xl p-4 border border-indigo-100">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sleep & Hormone Connection</p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {sleepData.quality === "poor"
                  ? "Your sleep is below optimal. Poor sleep disrupts cortisol rhythms and can affect progesterone production. Consider chamomile tea, magnesium-rich foods before bed, and limiting screen time."
                  : sleepData.quality === "fair"
                  ? "Your sleep is decent but could improve. Try adding sleep-friendly foods like almonds, warm milk, or bananas in the evening."
                  : "Your sleep patterns look healthy! Good sleep supports balanced hormone production and cycle regularity."}
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Stress Impact */}
        {stressFreq && stressFreq.percentage >= 15 && (
          <ScrollReveal delay={60}>
            <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold">Stress Impact Alert</h3>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {stressFreq.percentage}% of logged days
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                Stress was logged on {stressFreq.count} out of {stressFreq.totalDays} days. Chronic stress elevates cortisol, which can suppress ovulation and disrupt cycle timing.
              </p>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Anti-Stress Foods</p>
              <div className="flex flex-wrap gap-1.5">
                {["Dark Chocolate (70%+)", "Chamomile Tea", "Almonds", "Oats", "Banana", "Green Tea"].map(food => (
                  <span key={food} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-sm">{food}</span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={70}>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 leading-relaxed">
                <strong>Disclaimer:</strong> Lifestyle metrics are derived from your profile and logs. For accurate health assessments, consult a healthcare provider.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <Link to="/nutrition" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Nutrition Guide
          </Link>
        </ScrollReveal>
      </div>
      <SafetyDisclaimer />
    </main>
  );
}
