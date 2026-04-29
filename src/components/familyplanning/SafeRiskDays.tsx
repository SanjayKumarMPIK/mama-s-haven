/**
 * SafeRiskDays.tsx
 *
 * Avoid Tool: Marks low-risk and high-risk days for pregnancy on a visual calendar.
 * Uses shared cycle data to compute risk zones.
 */

import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { getCycleDay } from "@/lib/familyPlanningPersonalizationEngine";

export default function SafeRiskDays() {
  const { profile } = useProfile();
  const cycleLength = profile.cycleLength || 28;
  const cycleDay = getCycleDay(profile.lastPeriodDate || "", cycleLength);
  const ovDay = cycleLength - 14;

  const days = useMemo(() => {
    const fertileStart = ovDay - 5;
    const fertileEnd = ovDay + 1;
    return Array.from({ length: cycleLength }, (_, i) => {
      const day = i + 1;
      let risk: "high" | "moderate" | "low" | "period";
      if (day <= 5) risk = "period";
      else if (day >= fertileStart && day <= fertileEnd) risk = "high";
      else if (Math.abs(day - ovDay) <= 7) risk = "moderate";
      else risk = "low";

      return {
        day,
        risk,
        isToday: day === cycleDay,
      };
    });
  }, [cycleLength, ovDay, cycleDay]);

  const riskConfig = {
    high: { bg: "bg-red-400", text: "text-white", label: "High Risk" },
    moderate: { bg: "bg-amber-300", text: "text-amber-900", label: "Moderate" },
    low: { bg: "bg-emerald-200", text: "text-emerald-800", label: "Lower Risk" },
    period: { bg: "bg-rose-200", text: "text-rose-700", label: "Period" },
  };

  // Count days per risk
  const counts = days.reduce(
    (acc, d) => {
      acc[d.risk]++;
      return acc;
    },
    { high: 0, moderate: 0, low: 0, period: 0 } as Record<string, number>,
  );

  if (cycleDay === null) {
    return (
      <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
        <p className="text-sm text-amber-800">
          📅 Set your last period date to see your safe and risk days map.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 bg-emerald-50 border border-emerald-200 text-center">
          <p className="text-2xl font-bold text-emerald-700">{counts.low}</p>
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Lower-Risk Days</p>
        </div>
        <div className="rounded-xl p-3 bg-red-50 border border-red-200 text-center">
          <p className="text-2xl font-bold text-red-700">{counts.high}</p>
          <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">High-Risk Days</p>
        </div>
      </div>

      {/* Day Grid */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Cycle Day {cycleDay} — Risk Map
        </p>
        <div className="flex gap-[2px] flex-wrap">
          {days.map((d) => {
            const conf = riskConfig[d.risk];
            return (
              <div
                key={d.day}
                className={`relative w-[calc(100%/14-2px)] min-w-[18px] aspect-square rounded-md flex items-center justify-center text-[9px] font-bold transition-all duration-200 ${conf.bg} ${conf.text} ${
                  d.isToday ? "ring-2 ring-offset-1 ring-slate-800 scale-110 z-10 shadow-md" : ""
                }`}
                title={`Day ${d.day} — ${conf.label}`}
              >
                {d.day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {(["period", "low", "moderate", "high"] as const).map((key) => {
          const conf = riskConfig[key];
          return (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${conf.bg}`} />
              <span className="text-[10px] text-slate-500 font-medium">{conf.label}</span>
            </div>
          );
        })}
      </div>

      {/* Current Day Alert */}
      {cycleDay !== null && (
        <div
          className={`rounded-xl p-3 border ${
            days[cycleDay - 1]?.risk === "high"
              ? "bg-red-50 border-red-200"
              : days[cycleDay - 1]?.risk === "moderate"
              ? "bg-amber-50 border-amber-200"
              : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <p className={`text-xs font-semibold ${
            days[cycleDay - 1]?.risk === "high"
              ? "text-red-700"
              : days[cycleDay - 1]?.risk === "moderate"
              ? "text-amber-700"
              : "text-emerald-700"
          }`}>
            {days[cycleDay - 1]?.risk === "high"
              ? "⚠️ Today is a high-risk day — you may want to consider using protection."
              : days[cycleDay - 1]?.risk === "moderate"
              ? "🔶 Moderate risk today — stay mindful of your cycle timing."
              : "🟢 Today appears to be a lower-risk day. However, no day is completely risk-free."}
          </p>
        </div>
      )}

      <p className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-200 pt-3">
        ⚕️ Risk estimates are based on cycle calculations. They are not guaranteed. Consult a healthcare professional.
      </p>
    </div>
  );
}
