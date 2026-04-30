import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, ChevronDown, ChevronUp, Info, Zap, Sparkles } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import { predictPubertyDeficiencies, type PubertyDeficiencyPrediction } from "@/lib/pubertyNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";

const CONFIDENCE_STYLE = {
  High: { bg: "bg-amber-50", text: "text-amber-700", ring: "border-amber-300", badge: "bg-amber-100/80 text-amber-800", bar: "bg-gradient-to-r from-amber-400 to-orange-400", pct: "80%" },
  Medium: { bg: "bg-blue-50", text: "text-blue-700", ring: "border-blue-300", badge: "bg-blue-100/80 text-blue-800", bar: "bg-gradient-to-r from-blue-400 to-indigo-400", pct: "55%" },
  Low: { bg: "bg-slate-50", text: "text-slate-600", ring: "border-slate-300", badge: "bg-slate-100/80 text-slate-700", bar: "bg-gradient-to-r from-slate-400 to-gray-400", pct: "30%" },
};

function DeficiencyDetailCard({ pred, accent, index }: { pred: PubertyDeficiencyPrediction; accent: any; index: number }) {
  const [showWhy, setShowWhy] = useState(false);
  const [showRec, setShowRec] = useState(index === 0);
  const style = CONFIDENCE_STYLE[pred.confidence];

  return (
    <div className={`rounded-2xl border-2 ${style.ring} bg-card overflow-hidden hover:shadow-lg transition-all duration-300`}>
      {/* Header */}
      <div className={`px-5 py-4 ${style.bg}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${style.bg} border ${style.ring}`}>
              <span className="text-2xl">{pred.emoji}</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">{pred.nutrient}</h3>
              <p className={`text-[11px] font-semibold ${style.text} mt-0.5`}>{pred.confidence} likelihood</p>
            </div>
          </div>
          <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${style.ring} ${style.badge}`}>
            {pred.confidence}
          </span>
        </div>
        {/* Confidence bar */}
        <div className="mt-3">
          <div className="h-1.5 rounded-full bg-white/60">
            <div className={`h-1.5 rounded-full ${style.bar}`} style={{ width: style.pct }} />
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="px-5 py-4 border-t border-border/30">
        <p className="text-sm text-foreground/85 leading-relaxed">{pred.explanation}</p>
        {/* Trigger tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {pred.triggers.map((t) => (
            <span key={t} className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted/50 text-[11px] font-medium text-muted-foreground border border-border/30">{t}</span>
          ))}
        </div>

        {/* Why toggle */}
        <button
          type="button"
          onClick={() => setShowWhy(!showWhy)}
          className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          Why this suggestion?
          {showWhy ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <div className="transition-all duration-300 overflow-hidden" style={{ maxHeight: showWhy ? "200px" : "0", opacity: showWhy ? 1 : 0 }}>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2 bg-muted/20 rounded-lg p-3 border border-border/20">
            {pred.whyThisSuggestion}
          </p>
        </div>
      </div>

      {/* Recommendations expandable */}
      <div className="border-t border-border/30">
        <button
          type="button"
          onClick={() => setShowRec(!showRec)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors"
        >
          <span className="text-sm font-semibold text-foreground flex items-center gap-2">🍽️ Recommended Support</span>
          {showRec ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <div className="transition-all duration-300 overflow-hidden" style={{ maxHeight: showRec ? "600px" : "0", opacity: showRec ? 1 : 0 }}>
          <div className="px-5 pb-5 space-y-4">
            {/* Foods */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Foods to include</p>
              <div className="flex flex-wrap gap-1.5">
                {pred.foods.map((food) => (
                  <span key={food} className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm">{food}</span>
                ))}
              </div>
            </div>
            {/* Habits */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Healthy habits</p>
              <ul className="space-y-1.5 ml-4">
                {pred.habits.map((habit, i) => (
                  <li key={i} className="text-sm text-foreground/85 list-disc leading-relaxed">{habit}</li>
                ))}
              </ul>
            </div>
            {/* Daily tip */}
            <div className="rounded-xl bg-pink-50 border border-pink-200 p-3 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Daily Tip</p>
                <p className="text-sm font-medium text-foreground/90">{pred.dailyTip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PubertyNutritionalInsightsPage() {
  const { logs } = useHealthLog();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();

  const pubertyData = useMemo(
    () => predictPubertyDeficiencies(logs, profile, onboardingConfig),
    [logs, profile, onboardingConfig]
  );

  const accent = { gradient: "from-pink-500 to-rose-400", bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200/60" };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8fb] via-[#fdfbff] to-[#fff8fb] py-6">
      <div className="container mx-auto max-w-4xl px-4 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="rounded-[28px] border border-pink-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(236,72,153,0.08)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link to="/nutrition" className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md shadow-rose-200/40">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Nutritional Insights</h1>
                  <p className="text-sm text-muted-foreground">Detailed deficiency analysis with foods, habits & daily tips</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Note */}
        <ScrollReveal delay={10}>
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
            <p className="text-xs text-blue-800 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>Note:</strong> This is a dynamic prediction based on your recent calendar symptoms and profile data. It is not a medical diagnosis. Always consult your doctor for medical advice.</span>
            </p>
          </div>
        </ScrollReveal>

        {!pubertyData.hasData || pubertyData.deficiencies.length === 0 ? (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-5 shadow-lg opacity-40">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Insights Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Log your symptoms in the Calendar to get detailed nutritional deficiency insights.
              </p>
              <Link to="/calendar" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all">
                Go to Calendar
              </Link>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Deficiency Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {pubertyData.deficiencies.map((pred, i) => (
                <ScrollReveal key={pred.id} delay={20 + i * 10}>
                  <DeficiencyDetailCard pred={pred} accent={accent} index={i} />
                </ScrollReveal>
              ))}
            </div>

            {/* General Tips */}
            <ScrollReveal delay={80}>
              <div className="rounded-2xl border border-border/40 bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">⚡</span>
                  <h2 className="text-base font-bold">General Daily Tips</h2>
                </div>
                <div className="rounded-xl border border-border/40 divide-y divide-border/30">
                  {pubertyData.generalTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <span className="text-base mt-0.5 shrink-0">✅</span>
                      <p className="text-sm leading-relaxed text-foreground/85">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Disclaimer */}
            <ScrollReveal delay={100}>
              <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  <strong>Disclaimer:</strong> {pubertyData.disclaimer} Do not start any supplements without consulting a doctor.
                </p>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </main>
  );
}
