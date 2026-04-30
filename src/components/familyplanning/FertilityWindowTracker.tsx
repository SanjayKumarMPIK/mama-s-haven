/**
 * FertilityWindowTracker.tsx
 *
 * TTC Tool: Highlights fertile days and ovulation prediction.
 * Shows a visual timeline of the current cycle with the fertile
 * window marked, and today's position highlighted.
 */

import { useState, useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import {
  getCycleDay,
  isInFertileWindow,
  isOvulationDay,
} from "@/lib/familyPlanningPersonalizationEngine";

export default function FertilityWindowTracker() {
  const { profile } = useProfile();
  const cycleLength = profile.cycleLength || 28;
  const cycleDay = getCycleDay(profile.lastPeriodDate || "", cycleLength);
  const ovDay = cycleLength - 14;

  const phases = useMemo(() => {
    const fertileStart = ovDay - 5;
    const fertileEnd = ovDay + 1;
    return Array.from({ length: cycleLength }, (_, i) => {
      const day = i + 1;
      return {
        day,
        isMenstrual: day <= 5,
        isFertile: day >= fertileStart && day <= fertileEnd,
        isOvulation: day === ovDay,
        isToday: day === cycleDay,
        isPast: cycleDay !== null && day < cycleDay,
      };
    });
  }, [cycleLength, ovDay, cycleDay]);

  const todayInFertile = cycleDay !== null && isInFertileWindow(cycleDay, cycleLength);
  const todayIsOv = cycleDay !== null && isOvulationDay(cycleDay, cycleLength);

  return (
    <div className="space-y-5">
      {/* Status Banner */}
      {cycleDay !== null ? (
        <div
          className={`rounded-xl p-4 border ${
            todayIsOv
              ? "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200"
              : todayInFertile
              ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200"
              : "bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {todayIsOv ? "🎯" : todayInFertile ? "🌟" : "📅"}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Cycle Day {cycleDay} of {cycleLength}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {todayIsOv
                  ? "You may be at peak ovulation — highest fertility potential"
                  : todayInFertile
                  ? "You appear to be in your fertile window"
                  : cycleDay <= 5
                  ? "Menstrual phase — focus on rest and hydration"
                  : cycleDay < ovDay - 5
                  ? "Follicular phase — energy may be building"
                  : "Luteal phase — post-ovulation period"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-800">
            📅 Log your last period date in your profile to see fertile window predictions.
          </p>
        </div>
      )}

      {/* Cycle Timeline */}
      {cycleDay !== null && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Cycle Timeline
          </p>
          <div className="flex gap-[2px] flex-wrap">
            {phases.map((p) => (
              <div
                key={p.day}
                className={`relative group w-[calc(100%/14-2px)] min-w-[18px] aspect-square rounded-md flex items-center justify-center text-[9px] font-bold transition-all duration-200 ${
                  p.isToday
                    ? "ring-2 ring-offset-1 ring-rose-400 scale-110 z-10"
                    : ""
                } ${
                  p.isOvulation
                    ? "bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm"
                    : p.isFertile
                    ? "bg-gradient-to-br from-emerald-300 to-teal-400 text-white"
                    : p.isMenstrual
                    ? "bg-rose-200 text-rose-700"
                    : p.isPast
                    ? "bg-slate-200 text-slate-500"
                    : "bg-slate-100 text-slate-400"
                }`}
                title={`Day ${p.day}${p.isOvulation ? " (Ovulation)" : p.isFertile ? " (Fertile)" : p.isMenstrual ? " (Period)" : ""}`}
              >
                {p.day}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3">
            {[
              { color: "bg-rose-200", label: "Period" },
              { color: "bg-gradient-to-r from-emerald-300 to-teal-400", label: "Fertile" },
              { color: "bg-gradient-to-r from-rose-400 to-pink-500", label: "Ovulation" },
              { color: "bg-slate-200", label: "Other" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${l.color}`} />
                <span className="text-[10px] text-slate-500 font-medium">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-200 pt-3">
        ⚕️ Predictions are estimates based on a standard luteal phase. Individual results may vary.
      </p>
    </div>
  );
}
