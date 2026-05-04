import type { WeeklySchedulerStats } from "./useWeeklyScheduler";
import { cn } from "@/lib/utils";

interface WeeklySummaryProps {
  stats: WeeklySchedulerStats;
  className?: string;
}

export default function WeeklySummary({ stats, className }: WeeklySummaryProps) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-5 shadow-sm", className)}>
      <h3 className="text-sm font-bold text-slate-800">Weekly summary</h3>
      <p className="mt-1 text-xs text-slate-500">Snapshot of your scheduled week and follow-through.</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Scheduled" value={String(stats.scheduledTotal)} />
        <Stat label="Completed" value={String(stats.completed)} />
        <Stat label="Skipped" value={String(stats.skipped)} />
        <Stat label="Pending" value={String(stats.pending)} />
        <Stat label="Active minutes" value={`${stats.completedMinutes}`} sub="completed" />
        <Stat label="Est. calories" value={`${stats.completedCalories}`} sub="completed" />
        <Stat
          label="Consistency"
          value={`${stats.consistencyPercent}%`}
          sub="completed ÷ non-rest days"
          className="col-span-2 sm:col-span-1"
        />
      </dl>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5", className)}>
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-lg font-bold text-slate-800">{value}</dd>
      {sub ? <p className="text-[10px] text-slate-400">{sub}</p> : null}
    </div>
  );
}
