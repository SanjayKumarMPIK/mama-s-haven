import { cn } from "@/lib/utils";
import type { WeeklySchedulerStats } from "./useWeeklyScheduler";

interface WeeklyGoalProgressProps {
  stats: WeeklySchedulerStats;
  className?: string;
}

export default function WeeklyGoalProgress({ stats, className }: WeeklyGoalProgressProps) {
  const pct = Math.min(100, Math.max(0, stats.completionPercent));
  const r = 40;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - pct / 100);

  const statusColor =
    stats.goalLabel === "Complete"
      ? "text-emerald-600"
      : stats.goalLabel === "Behind"
        ? "text-amber-600"
        : "text-purple-700";

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <svg className="-rotate-90" width="112" height="112" viewBox="0 0 112 112" aria-hidden>
            <circle cx="56" cy="56" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="56"
              cy="56"
              r={r}
              fill="none"
              stroke="url(#goalRing)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={dash}
              className="transition-[stroke-dashoffset] duration-500 ease-out"
            />
            <defs>
              <linearGradient id="goalRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-slate-800">{pct}%</span>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-500">done</span>
          </div>
        </div>

        <div className="w-full flex-1 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-800">Weekly goal</h3>
            <span className={cn("rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold", statusColor)}>
              {stats.goalLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {stats.completed} of {stats.scheduledTotal} activities completed this week.
          </p>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-xl bg-purple-50/80 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-purple-700/80">Active minutes</p>
              <p className="text-lg font-bold text-slate-800">{stats.completedMinutes}</p>
            </div>
            <div className="rounded-xl bg-fuchsia-50/80 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-fuchsia-800/80">Est. kcal</p>
              <p className="text-lg font-bold text-slate-800">{stats.completedCalories}</p>
            </div>
            <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2 sm:col-span-1">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Scheduled total</p>
              <p className="text-lg font-bold text-slate-800">{stats.scheduledMinutes} min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
