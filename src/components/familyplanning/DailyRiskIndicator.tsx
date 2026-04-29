/**
 * DailyRiskIndicator.tsx
 *
 * Avoid Tool: Shows today's probability level — Low / Medium / High
 * with a visual gauge and contextual guidance.
 */

import { useProfile } from "@/hooks/useProfile";
import {
  getCycleDay,
  getRiskFromCycleDay,
} from "@/lib/familyPlanningPersonalizationEngine";

export default function DailyRiskIndicator() {
  const { profile } = useProfile();
  const cycleLength = profile.cycleLength || 28;
  const cycleDay = getCycleDay(profile.lastPeriodDate || "", cycleLength);
  const riskLevel = getRiskFromCycleDay(cycleDay, cycleLength);
  const ovDay = cycleLength - 14;

  const riskConfig = {
    high: {
      emoji: "🔴",
      label: "HIGH",
      color: "text-red-700",
      bgGradient: "from-red-50 to-rose-50",
      border: "border-red-200",
      gaugeColor: "from-red-400 to-rose-500",
      gaugeWidth: "100%",
      message: "Pregnancy risk may be elevated today. You may want to consider using protection.",
      advice: "This is typically the most fertile period of your cycle.",
    },
    moderate: {
      emoji: "🟡",
      label: "MODERATE",
      color: "text-amber-700",
      bgGradient: "from-amber-50 to-orange-50",
      border: "border-amber-200",
      gaugeColor: "from-amber-400 to-orange-500",
      gaugeWidth: "60%",
      message: "Risk is moderate today. Continue being mindful of your cycle timing.",
      advice: "The fertile window may be approaching or recently passed.",
    },
    low: {
      emoji: "🟢",
      label: "LOW",
      color: "text-emerald-700",
      bgGradient: "from-emerald-50 to-green-50",
      border: "border-emerald-200",
      gaugeColor: "from-emerald-400 to-green-500",
      gaugeWidth: "25%",
      message: "Risk appears lower today. However, no day is completely risk-free.",
      advice: "Stay informed about your cycle patterns for better awareness.",
    },
    unknown: {
      emoji: "❓",
      label: "UNKNOWN",
      color: "text-slate-600",
      bgGradient: "from-slate-50 to-gray-50",
      border: "border-slate-200",
      gaugeColor: "from-slate-300 to-gray-400",
      gaugeWidth: "0%",
      message: "Unable to calculate risk without cycle data.",
      advice: "Log your last period date for personalized risk assessment.",
    },
  };

  const conf = riskConfig[riskLevel];

  // Compute days until next key event
  const daysUntilOvulation = cycleDay !== null ? ovDay - cycleDay : null;
  const daysUntilSafe = cycleDay !== null ? (ovDay + 2) - cycleDay : null;

  return (
    <div className="space-y-4">
      {/* Main Risk Display */}
      <div className={`rounded-2xl p-6 border bg-gradient-to-br ${conf.bgGradient} ${conf.border} text-center`}>
        <div className="text-5xl mb-3">{conf.emoji}</div>
        <p className={`text-2xl font-black tracking-tight ${conf.color}`}>{conf.label}</p>
        <p className="text-xs text-slate-500 mt-1">
          {cycleDay ? `Day ${cycleDay} of ${cycleLength}` : "Cycle day unknown"}
        </p>

        {/* Risk Gauge */}
        <div className="mt-4 mx-auto max-w-xs">
          <div className="h-3 rounded-full bg-slate-200 overflow-hidden shadow-inner">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${conf.gaugeColor} transition-all duration-1000 ease-out`}
              style={{ width: conf.gaugeWidth }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-emerald-500 font-medium">Low</span>
            <span className="text-[9px] text-amber-500 font-medium">Moderate</span>
            <span className="text-[9px] text-red-500 font-medium">High</span>
          </div>
        </div>
      </div>

      {/* Message Card */}
      <div className={`rounded-xl p-4 border ${conf.border} bg-white`}>
        <p className={`text-sm font-semibold ${conf.color} mb-1`}>{conf.message}</p>
        <p className="text-xs text-slate-500 leading-relaxed">{conf.advice}</p>
      </div>

      {/* Timeline Info */}
      {cycleDay !== null && (
        <div className="grid grid-cols-2 gap-3">
          {daysUntilOvulation !== null && daysUntilOvulation > 0 && (
            <div className="rounded-xl p-3 bg-slate-50 border border-slate-200 text-center">
              <p className="text-lg font-bold text-slate-700">{daysUntilOvulation}</p>
              <p className="text-[10px] text-slate-500 font-medium">Days to Ovulation</p>
            </div>
          )}
          {daysUntilSafe !== null && daysUntilSafe > 0 && riskLevel !== "low" && (
            <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-200 text-center">
              <p className="text-lg font-bold text-emerald-700">{daysUntilSafe}</p>
              <p className="text-[10px] text-emerald-600 font-medium">Days to Lower Risk</p>
            </div>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-200 pt-3">
        ⚕️ Risk levels are estimates. No method is 100% reliable. Consult a healthcare professional.
      </p>
    </div>
  );
}
