import { cn } from "@/lib/utils";

interface DifficultyTrackerProps {
  curveSlot: 1 | 2 | 3 | 4;
  curveLabel: string;
  className?: string;
}

const STEPS = [
  { slot: 1 as const, label: "Very low" },
  { slot: 2 as const, label: "Low" },
  { slot: 3 as const, label: "Low–mod" },
  { slot: 4 as const, label: "Moderate" },
];

export default function DifficultyTracker({ curveSlot, curveLabel, className }: DifficultyTrackerProps) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <h3 className="text-sm font-bold text-slate-800">Difficulty progression</h3>
      <p className="mt-1 text-xs text-slate-500">
        Safe micro-cycle for your stage — never above your clinician-approved ceiling. This week:{" "}
        <span className="font-semibold text-purple-700">{curveLabel}</span>
      </p>
      <div className="mt-4 flex gap-1.5">
        {STEPS.map((s) => {
          const active = s.slot === curveSlot;
          const past = s.slot < curveSlot;
          return (
            <div
              key={s.slot}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                active && "bg-gradient-to-r from-purple-500 to-fuchsia-500 shadow-sm shadow-purple-200",
                past && !active && "bg-purple-200",
                !past && !active && "bg-slate-100",
              )}
              title={s.label}
            />
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-medium text-slate-400">
        {STEPS.map((s) => (
          <span key={s.slot} className={cn(s.slot === curveSlot && "text-purple-700")}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
