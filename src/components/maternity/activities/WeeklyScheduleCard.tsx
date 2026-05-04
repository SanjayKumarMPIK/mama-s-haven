import { CheckCircle2, ChevronDown, Circle, Leaf, MinusCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { ScheduledSlot } from "./SchedulerEngine";
import type { DayCompletionStatus } from "./SchedulerUtils";
import ExpandedActivityPanel from "./ExpandedActivityPanel";
import { formatDifficultyLabel } from "./SchedulerUtils";
import { cn } from "@/lib/utils";

interface WeeklyScheduleCardProps {
  slot: ScheduledSlot;
  status: DayCompletionStatus;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  onReplace: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

export default function WeeklyScheduleCard({
  slot,
  status,
  expanded,
  onExpandedChange,
  onReplace,
  onComplete,
  onSkip,
}: WeeklyScheduleCardProps) {
  if (slot.isRecovery) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-gradient-to-r from-emerald-50/90 to-teal-50/50 px-4 py-3.5 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
          <Leaf className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-emerald-900">{slot.dayLabel}</p>
          <p className="text-xs text-emerald-800/90">Recovery day — rest, hydration, and gentle movement only as you feel able.</p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
          Rest
        </span>
      </div>
    );
  }

  const act = slot.activity;
  if (!act) {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        {slot.dayLabel}: no activity available for this theme — try refreshing the theme.
      </div>
    );
  }

  const statusIcon =
    status === "completed" ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="Completed" />
    ) : status === "skipped" ? (
      <MinusCircle className="h-5 w-5 text-amber-500" aria-label="Skipped" />
    ) : (
      <Circle className="h-5 w-5 text-slate-300" aria-label="Pending" />
    );

  return (
    <Collapsible open={expanded} onOpenChange={onExpandedChange}>
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow",
          expanded ? "border-purple-200 shadow-md shadow-purple-100/50" : "border-slate-200 hover:border-purple-100",
        )}
      >
        <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-3.5 text-left outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-purple-400">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-800">{slot.dayLabel}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {act.durationMinutes} min
              </span>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-800">
                {formatDifficultyLabel(act.difficulty)}
              </span>
            </div>
            <p className="truncate text-sm text-slate-600">{act.name}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {statusIcon}
            <ChevronDown
              className={cn("h-5 w-5 text-slate-400 transition-transform duration-200", expanded && "rotate-180")}
            />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden transition-[max-height] duration-300 ease-out data-[state=closed]:max-h-0 data-[state=open]:max-h-[560px]">
          <ExpandedActivityPanel
            activity={act}
            onReplace={onReplace}
            onComplete={onComplete}
            onSkip={onSkip}
          />
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
