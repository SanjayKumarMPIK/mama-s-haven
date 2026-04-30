/**
 * BasicCalendar.tsx
 *
 * Neutral/Tracking Tool: Simple cycle calendar without strong predictions.
 * Shows cycle phases without TTC or Avoid specific alerts.
 */

import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { getCycleDay } from "@/lib/familyPlanningPersonalizationEngine";

export default function BasicCalendar() {
  const { profile } = useProfile();
  const cycleLength = profile.cycleLength || 28;
  const cycleDay = getCycleDay(profile.lastPeriodDate || "", cycleLength);
  const ovDay = cycleLength - 14;

  const phases = useMemo(() => {
    return [
      {
        name: "Menstrual",
        emoji: "🩸",
        days: "1–5",
        color: "bg-rose-100 border-rose-200 text-rose-700",
        active: cycleDay !== null && cycleDay <= 5,
        desc: "Period phase — rest and hydrate",
      },
      {
        name: "Follicular",
        emoji: "🌿",
        days: `6–${ovDay - 5}`,
        color: "bg-teal-100 border-teal-200 text-teal-700",
        active: cycleDay !== null && cycleDay > 5 && cycleDay < ovDay - 5,
        desc: "Energy may be rising naturally",
      },
      {
        name: "Ovulation",
        emoji: "✨",
        days: `${ovDay - 5}–${ovDay + 1}`,
        color: "bg-violet-100 border-violet-200 text-violet-700",
        active: cycleDay !== null && cycleDay >= ovDay - 5 && cycleDay <= ovDay + 1,
        desc: "Mid-cycle ovulation window",
      },
      {
        name: "Luteal",
        emoji: "🌙",
        days: `${ovDay + 2}–${cycleLength}`,
        color: "bg-indigo-100 border-indigo-200 text-indigo-700",
        active: cycleDay !== null && cycleDay > ovDay + 1,
        desc: "Post-ovulation — PMS may occur",
      },
    ];
  }, [cycleDay, ovDay, cycleLength]);

  // Simple day dots
  const dayDots = useMemo(() => {
    return Array.from({ length: cycleLength }, (_, i) => {
      const day = i + 1;
      let phase: "menstrual" | "follicular" | "ovulation" | "luteal";
      if (day <= 5) phase = "menstrual";
      else if (day < ovDay - 5) phase = "follicular";
      else if (day <= ovDay + 1) phase = "ovulation";
      else phase = "luteal";

      return { day, phase, isToday: day === cycleDay };
    });
  }, [cycleLength, ovDay, cycleDay]);

  const phaseColors = {
    menstrual: "bg-rose-300",
    follicular: "bg-teal-300",
    ovulation: "bg-violet-400",
    luteal: "bg-indigo-300",
  };

  if (cycleDay === null) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl p-4 border border-slate-200 bg-slate-50 text-center">
          <p className="text-3xl mb-2">📅</p>
          <p className="text-sm font-semibold text-slate-700">Start Tracking Your Cycle</p>
          <p className="text-xs text-slate-500 mt-1">
            Log your last period date in your profile to see your cycle phases.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {phases.map((p) => (
            <div key={p.name} className={`rounded-xl p-3 border ${p.color}`}>
              <p className="text-sm">
                {p.emoji} <span className="font-semibold">{p.name}</span>
              </p>
              <p className="text-[10px] mt-0.5 opacity-70">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Phase */}
      {phases
        .filter((p) => p.active)
        .map((p) => (
          <div key={p.name} className={`rounded-xl p-4 border ${p.color}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.emoji}</span>
              <div>
                <p className="text-sm font-bold">
                  {p.name} Phase — Day {cycleDay}
                </p>
                <p className="text-xs mt-0.5 opacity-80">{p.desc}</p>
              </div>
            </div>
          </div>
        ))}

      {/* Cycle Day Dots */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Cycle Overview
        </p>
        <div className="flex gap-[3px] flex-wrap">
          {dayDots.map((d) => (
            <div
              key={d.day}
              className={`w-[calc(100%/14-3px)] min-w-[16px] aspect-square rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${
                phaseColors[d.phase]
              } ${
                d.isToday
                  ? "ring-2 ring-offset-1 ring-slate-700 scale-125 z-10 text-white"
                  : "text-white/80"
              }`}
              title={`Day ${d.day}`}
            >
              {d.isToday ? d.day : ""}
            </div>
          ))}
        </div>
      </div>

      {/* Phase Legend */}
      <div className="grid grid-cols-2 gap-2">
        {phases.map((p) => (
          <div
            key={p.name}
            className={`rounded-lg p-2.5 border text-xs ${p.color} ${
              p.active ? "ring-1 ring-offset-1 ring-current" : "opacity-60"
            }`}
          >
            {p.emoji} <span className="font-semibold">{p.name}</span>
            <span className="ml-1 opacity-70">({p.days})</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-200 pt-3">
        📊 Simple cycle tracking — no strong predictions or alerts in neutral mode.
      </p>
    </div>
  );
}
