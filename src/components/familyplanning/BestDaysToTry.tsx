/**
 * BestDaysToTry.tsx
 *
 * TTC Tool: Suggests optimal days for conception based on cycle data.
 * Shows the top 3 best days with confidence indicators.
 */

import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { getCycleDay } from "@/lib/familyPlanningPersonalizationEngine";

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", weekday: "short" });
}

interface BestDay {
  date: Date;
  label: string;
  confidence: "highest" | "high" | "good";
  emoji: string;
  description: string;
}

export default function BestDaysToTry() {
  const { profile } = useProfile();
  const cycleLength = profile.cycleLength || 28;
  const lastPeriod = profile.lastPeriodDate;

  const bestDays = useMemo<BestDay[]>(() => {
    if (!lastPeriod) return [];
    const lmp = new Date(lastPeriod);
    if (isNaN(lmp.getTime())) return [];

    const cycleLenSafe = cycleLength >= 10 ? cycleLength : 28;
    const today = new Date();
    const diffMs = today.getTime() - lmp.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const currentCycleStart = addDays(lmp, Math.floor(diffDays / cycleLenSafe) * cycleLenSafe);
    const nextCycleStart = addDays(currentCycleStart, cycleLenSafe);
    const ovulationDate = addDays(nextCycleStart, -14);

    return [
      {
        date: addDays(ovulationDate, -1),
        label: "Day Before Ovulation",
        confidence: "highest",
        emoji: "🌟",
        description: "Statistically the most favorable day for conception attempts",
      },
      {
        date: ovulationDate,
        label: "Ovulation Day",
        confidence: "highest",
        emoji: "🎯",
        description: "Peak fertility — the egg may be available for fertilization",
      },
      {
        date: addDays(ovulationDate, -2),
        label: "2 Days Before Ovulation",
        confidence: "high",
        emoji: "💫",
        description: "Very favorable conditions — sperm can survive and be ready",
      },
      {
        date: addDays(ovulationDate, -3),
        label: "3 Days Before Ovulation",
        confidence: "good",
        emoji: "🌱",
        description: "Good fertility potential — early window advantage",
      },
    ];
  }, [lastPeriod, cycleLength]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const confidenceConfig = {
    highest: {
      bg: "bg-gradient-to-r from-emerald-50 to-teal-50",
      border: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-700",
      bar: "bg-gradient-to-r from-emerald-400 to-teal-500",
      width: "w-full",
    },
    high: {
      bg: "bg-gradient-to-r from-blue-50 to-sky-50",
      border: "border-blue-200",
      badge: "bg-blue-100 text-blue-700",
      bar: "bg-gradient-to-r from-blue-400 to-sky-500",
      width: "w-4/5",
    },
    good: {
      bg: "bg-gradient-to-r from-violet-50 to-purple-50",
      border: "border-violet-200",
      badge: "bg-violet-100 text-violet-700",
      bar: "bg-gradient-to-r from-violet-400 to-purple-500",
      width: "w-3/5",
    },
  };

  if (!lastPeriod || bestDays.length === 0) {
    return (
      <div className="rounded-xl p-4 border border-amber-200 bg-amber-50">
        <p className="text-sm text-amber-800">
          📅 Set your last period date in your profile to see the best days to try.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bestDays.map((day, i) => {
        const isToday = day.date.toDateString() === today.toDateString();
        const isPast = day.date < today;
        const conf = confidenceConfig[day.confidence];

        return (
          <div
            key={i}
            className={`rounded-xl border p-4 transition-all duration-300 ${conf.bg} ${conf.border} ${
              isToday ? "ring-2 ring-rose-300 ring-offset-1 shadow-md" : ""
            } ${isPast ? "opacity-50" : ""}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{day.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-800">{day.label}</p>
                  {isToday && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 animate-pulse">
                      TODAY
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${conf.badge}`}>
                    {day.confidence === "highest" ? "★ Highest" : day.confidence === "high" ? "High" : "Good"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{formatShortDate(day.date)}</p>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{day.description}</p>

                {/* Confidence bar */}
                <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div className={`h-full rounded-full ${conf.bar} ${conf.width} transition-all duration-700`} />
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <p className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-200 pt-3">
        ⚕️ These are estimates. Individual biology may vary. Consult a healthcare professional for personalized guidance.
      </p>
    </div>
  );
}
