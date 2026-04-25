/**
 * ProtectionReminder.tsx
 *
 * Avoid Tool: Suggests protection during high-risk days.
 * Shows a visual risk timeline with actionable reminders.
 */

import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import {
  getCycleDay,
  getRiskFromCycleDay,
} from "@/lib/familyPlanningPersonalizationEngine";

export default function ProtectionReminder() {
  const { profile } = useProfile();
  const cycleLength = profile.cycleLength || 28;
  const cycleDay = getCycleDay(profile.lastPeriodDate || "", cycleLength);
  const riskLevel = getRiskFromCycleDay(cycleDay, cycleLength);
  const ovDay = cycleLength - 14;

  const upcomingRiskDays = useMemo(() => {
    if (cycleDay === null) return [];
    const fertileStart = ovDay - 5;
    const fertileEnd = ovDay + 1;
    const result: { day: number; daysFromNow: number; risk: "high" | "moderate" }[] = [];

    for (let d = cycleDay; d <= Math.min(cycleDay + 10, cycleLength); d++) {
      if (d >= fertileStart && d <= fertileEnd) {
        result.push({ day: d, daysFromNow: d - cycleDay, risk: "high" });
      } else if (Math.abs(d - ovDay) <= 7) {
        result.push({ day: d, daysFromNow: d - cycleDay, risk: "moderate" });
      }
    }
    return result.slice(0, 7);
  }, [cycleDay, ovDay, cycleLength]);

  const reminders = [
    { emoji: "🛡️", text: "Consider using barrier methods during high-risk days", priority: "high" },
    { emoji: "📅", text: "Track your cycle consistently for better awareness", priority: "all" },
    { emoji: "💬", text: "Discuss contraception options with your healthcare provider", priority: "all" },
    { emoji: "⏰", text: "Set a daily reminder to check your risk status", priority: "moderate" },
  ];

  if (cycleDay === null) {
    return (
      <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
        <p className="text-sm text-amber-800">
          📅 Log your last period date to receive personalized protection reminders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <div
        className={`rounded-2xl p-5 border text-center ${
          riskLevel === "high"
            ? "bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
            : riskLevel === "moderate"
            ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"
            : "bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200"
        }`}
      >
        <p className="text-3xl mb-2">
          {riskLevel === "high" ? "🔔" : riskLevel === "moderate" ? "🔶" : "✅"}
        </p>
        <p
          className={`text-base font-bold ${
            riskLevel === "high"
              ? "text-red-700"
              : riskLevel === "moderate"
              ? "text-amber-700"
              : "text-emerald-700"
          }`}
        >
          {riskLevel === "high"
            ? "Protection Recommended Today"
            : riskLevel === "moderate"
            ? "Stay Mindful Today"
            : "Lower Risk — Stay Informed"}
        </p>
        <p className="text-xs text-slate-500 mt-1">Day {cycleDay} of {cycleLength}</p>
      </div>

      {/* Upcoming Risk Days */}
      {upcomingRiskDays.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Upcoming Risk Days
          </p>
          <div className="space-y-1.5">
            {upcomingRiskDays.map((d, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                  d.risk === "high"
                    ? "bg-red-50 border-red-200"
                    : "bg-amber-50 border-amber-200"
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    d.risk === "high" ? "bg-red-400" : "bg-amber-400"
                  }`}
                />
                <div className="flex-1">
                  <span className="text-xs font-semibold text-slate-700">
                    Day {d.day}
                  </span>
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    d.risk === "high"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {d.risk === "high" ? "High Risk" : "Moderate"}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {d.daysFromNow === 0 ? "Today" : `in ${d.daysFromNow}d`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminder Tips */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Reminders
        </p>
        <div className="space-y-2">
          {reminders.map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
            >
              <span className="text-sm mt-0.5">{r.emoji}</span>
              <p className="text-xs text-slate-600 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-200 pt-3">
        ⚕️ These are awareness reminders, not medical advice. Consult a healthcare professional for guidance.
      </p>
    </div>
  );
}
