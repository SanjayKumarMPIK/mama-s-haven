import type { GeneratedSchedule } from "./SchedulerEngine";
import type { DayCompletionStatus } from "./SchedulerUtils";
import WeeklyScheduleCard from "./WeeklyScheduleCard";

interface WeeklySchedulerProps {
  schedule: GeneratedSchedule;
  statuses: DayCompletionStatus[];
  expandedDay: number | null;
  setExpandedDay: (idx: number | null) => void;
  onReplaceRequest: (dayIndex: number) => void;
  onComplete: (dayIndex: number) => void;
  onSkip: (dayIndex: number) => void;
}

export default function WeeklyScheduler({
  schedule,
  statuses,
  expandedDay,
  setExpandedDay,
  onReplaceRequest,
  onComplete,
  onSkip,
}: WeeklySchedulerProps) {
  return (
    <div className="space-y-2.5">
      <h3 className="text-sm font-bold text-slate-800">Weekly schedule</h3>
      <div className="space-y-2">
        {schedule.days.map((slot) => (
          <WeeklyScheduleCard
            key={slot.dayLabel}
            slot={slot}
            status={statuses[slot.dayIndex] ?? "pending"}
            expanded={expandedDay === slot.dayIndex}
            onExpandedChange={(open) => {
              if (open) setExpandedDay(slot.dayIndex);
              else if (expandedDay === slot.dayIndex) setExpandedDay(null);
            }}
            onReplace={() => onReplaceRequest(slot.dayIndex)}
            onComplete={() => onComplete(slot.dayIndex)}
            onSkip={() => onSkip(slot.dayIndex)}
          />
        ))}
      </div>
    </div>
  );
}
