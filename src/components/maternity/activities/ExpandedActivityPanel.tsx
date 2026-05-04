import { formatDifficultyLabel } from "./SchedulerUtils";
import type { NormalizedActivity } from "./SchedulerUtils";
import { cn } from "@/lib/utils";

interface ExpandedActivityPanelProps {
  activity: NormalizedActivity;
  onReplace: () => void;
  onComplete: () => void;
  onSkip: () => void;
  className?: string;
}

export default function ExpandedActivityPanel({
  activity,
  onReplace,
  onComplete,
  onSkip,
  className,
}: ExpandedActivityPanelProps) {
  const emoji = activity.icon ?? "✨";

  return (
    <div className={cn("border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5", className)}>
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-inner shadow-slate-100">
          {emoji}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-sm leading-relaxed text-slate-600">{activity.description}</p>
          <div className="flex flex-wrap gap-2">
            <MetaPill label="Duration" value={`${activity.durationMinutes} min`} />
            <MetaPill label="Intensity" value={formatDifficultyLabel(activity.difficulty)} />
            <MetaPill label="Calories" value={`~${activity.caloriesBurned} kcal`} />
            <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-semibold text-purple-800">
              {formatDifficultyLabel(activity.difficulty)} focus
            </span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Target areas</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {activity.targetAreas.map((a) => (
                <span key={a} className="rounded-lg bg-white px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
                  {a}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Benefit</p>
            <p className="text-sm text-slate-700">{activity.benefit}</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800/90">Safety</p>
            <p className="text-xs leading-relaxed text-amber-900/90">{activity.safetyTip}</p>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onReplace}
              className="rounded-xl border border-purple-200 bg-white px-4 py-2 text-xs font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50"
            >
              Replace activity
            </button>
            <button
              type="button"
              onClick={onComplete}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-purple-200 transition hover:opacity-95"
            >
              Mark complete
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Mark skipped
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] ring-1 ring-slate-200">
      <span className="font-medium text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </span>
  );
}
