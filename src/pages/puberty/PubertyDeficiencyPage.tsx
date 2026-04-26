import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import { computeIntelligentNutrition } from "@/lib/pubertyIntelligentNutritionEngine";
import ScrollReveal from "@/components/ScrollReveal";

const PRIORITY_STYLE = {
  High: {
    border: "border-amber-300",
    bg: "bg-gradient-to-br from-amber-50 to-orange-50",
    badge: "bg-amber-200/70 text-amber-800 border-amber-300",
    dot: "bg-amber-500",
    label: "text-amber-700",
  },
  Medium: {
    border: "border-blue-300",
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50",
    badge: "bg-blue-200/70 text-blue-800 border-blue-300",
    dot: "bg-blue-500",
    label: "text-blue-700",
  },
  Low: {
    border: "border-slate-300",
    bg: "bg-gradient-to-br from-slate-50 to-gray-50",
    badge: "bg-slate-200/70 text-slate-700 border-slate-300",
    dot: "bg-slate-400",
    label: "text-slate-600",
  },
};

export default function PubertyDeficiencyPage() {
  const { logs } = useHealthLog();
  const { profile } = useProfile();
  const { config: onboardingConfig } = useOnboarding();

  const data = useMemo(
    () => computeIntelligentNutrition(logs, profile, onboardingConfig),
    [logs, profile, onboardingConfig]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8fb] via-[#fdfbff] to-[#f9f9ff] py-6">
      <div className="container mx-auto max-w-4xl px-4 space-y-6">
        {/* Header */}
        <ScrollReveal>
          <div className="rounded-[28px] border border-pink-100 bg-white/90 p-5 shadow-[0_10px_30px_rgba(236,72,153,0.08)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Link
                to="/nutrition"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-100 bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200/40">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Identified Deficiencies</h1>
                  <p className="text-sm text-muted-foreground">
                    Nutrient gaps detected from your symptoms, conditions & profile
                  </p>
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
              <span>
                <strong>Note:</strong> This is a dynamic prediction based on your recent calendar
                symptoms, medical conditions, and profile data. It is not a medical diagnosis.
                Always consult your doctor for medical advice.
              </span>
            </p>
          </div>
        </ScrollReveal>

        {!data.hasData ? (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-5 shadow-lg opacity-40">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed mb-5">
                Log your symptoms in the Calendar or complete your profile to get personalized
                deficiency predictions.
              </p>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Go to Calendar
              </Link>
            </div>
          </ScrollReveal>
        ) : data.deficiencyList.length === 0 ? (
          <ScrollReveal delay={20}>
            <div className="flex flex-col items-center justify-center text-center py-16 rounded-2xl border border-green-200 bg-green-50/50">
              <ShieldCheck className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">No Deficiencies Detected</h3>
              <p className="text-sm text-green-700/80 max-w-sm">
                Based on your current symptoms and profile, no significant nutrient deficiencies were
                detected. Keep maintaining your healthy habits!
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {/* Summary strip */}
            <ScrollReveal delay={20}>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "High Priority",
                    count: data.deficiencyList.filter((d) => d.priority === "High").length,
                    color: "text-amber-700",
                    bg: "bg-amber-50 border-amber-200",
                  },
                  {
                    label: "Medium Priority",
                    count: data.deficiencyList.filter((d) => d.priority === "Medium").length,
                    color: "text-blue-700",
                    bg: "bg-blue-50 border-blue-200",
                  },
                  {
                    label: "Low Priority",
                    count: data.deficiencyList.filter((d) => d.priority === "Low").length,
                    color: "text-slate-600",
                    bg: "bg-slate-50 border-slate-200",
                  },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl border p-3 text-center ${item.bg}`}>
                    <p className={`text-2xl font-black ${item.color}`}>{item.count}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>

            {/* Deficiency Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              {data.deficiencyList.map((d, i) => {
                const style = PRIORITY_STYLE[d.priority];
                return (
                  <ScrollReveal key={d.nutrient} delay={30 + i * 10}>
                    <div
                      className={`rounded-2xl border-2 ${style.border} ${style.bg} p-5 hover:shadow-lg transition-all duration-300`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white border ${style.border} shadow-sm`}
                          >
                            <span className="text-2xl">{d.emoji}</span>
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground">{d.nutrient}</h3>
                            <p className={`text-[11px] font-semibold ${style.label} mt-0.5`}>
                              {d.priority} Priority
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${style.badge}`}
                        >
                          {d.priority}
                        </span>
                      </div>

                      {/* Reason */}
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {d.reason}
                      </p>

                      {/* Priority indicator bar */}
                      <div className="mt-3">
                        <div className="h-1.5 rounded-full bg-white/70 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${style.dot}`}
                            style={{
                              width:
                                d.priority === "High"
                                  ? "80%"
                                  : d.priority === "Medium"
                                  ? "50%"
                                  : "25%",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            {/* Special Notes */}
            {data.specialNotes.length > 0 && (
              <ScrollReveal delay={80}>
                <div className="space-y-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Personalized Notes
                  </h2>
                  {data.specialNotes.map((note, i) => (
                    <div
                      key={i}
                      className={`rounded-xl border p-4 ${
                        note.type === "medical"
                          ? "border-rose-200/60 bg-rose-50/40"
                          : "border-violet-200/60 bg-violet-50/40"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="text-xl shrink-0">{note.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground">{note.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {note.advice}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            )}

            {/* Context Footer */}
            <ScrollReveal delay={100}>
              <div className="rounded-xl border border-border/40 bg-card p-4 text-xs text-muted-foreground">
                Analysis based on <strong>{data.analyzedDays} days</strong> of logged data •{" "}
                <strong>{data.pubertyTiming} Puberty</strong> •{" "}
                <strong>{data.dietPreference}</strong> diet •{" "}
                <strong>{data.regionLabel}</strong> region
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </main>
  );
}
