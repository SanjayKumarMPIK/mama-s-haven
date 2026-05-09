import { Stethoscope, Info } from "lucide-react";
import WeeklyThemeBanner from "./WeeklyThemeBanner";
import WeeklyGoalProgress from "./WeeklyGoalProgress";
import DifficultyTracker from "./DifficultyTracker";
import WeeklySummary from "./WeeklySummary";
import WeeklyScheduler from "./WeeklyScheduler";
import ActivityPicker from "./ActivityPicker";
import { useWeeklyScheduler } from "./useWeeklyScheduler";

export default function ExerciseTab() {
  const {
    stage,
    schedule,
    statuses,
    setStatus,
    replaceActivity,
    expandedDay,
    setExpandedDay,
    pickerDayIndex,
    openPicker,
    closePicker,
    refreshTheme,
    reshuffleWeek,
    stats,
  } = useWeeklyScheduler();

  return (
    <div className="space-y-5">
      <WeeklyThemeBanner
        themeTitle={schedule.themeId}
        tagline={schedule.themeTagline}
        weekKey={schedule.weekKey}
        onRefreshTheme={refreshTheme}
        onShuffleWeek={reshuffleWeek}
      />

      <section className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/30 p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shadow-inner">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">Clinical Recommendations</h3>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700">
                  {stage}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-xl">
                <span className="font-semibold text-purple-700">Why these exercises?</span> {schedule.themeClinicalNote}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {schedule.recommendations.map((row) => (
            <div
              key={row.activityId}
              className="flex items-start gap-3 rounded-xl border border-purple-100/50 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-purple-200"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-500">
                <Info className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800">{row.name}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600 italic border-l-2 border-purple-200 pl-2">
                  &ldquo;{row.rationale}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <WeeklyGoalProgress stats={stats} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <WeeklyScheduler
          schedule={schedule}
          statuses={statuses}
          expandedDay={expandedDay}
          setExpandedDay={setExpandedDay}
          onReplaceRequest={openPicker}
          onComplete={(i) => setStatus(i, "completed")}
          onSkip={(i) => setStatus(i, "skipped")}
        />
      </div>

      <DifficultyTracker curveSlot={schedule.curveSlot} curveLabel={schedule.curveLabel} />

      <WeeklySummary stats={stats} />

      <ActivityPicker
        open={pickerDayIndex !== null}
        onOpenChange={(o) => {
          if (!o) closePicker();
        }}
        stage={stage}
        themeId={schedule.themeId}
        onPick={(id) => {
          if (pickerDayIndex !== null) replaceActivity(pickerDayIndex, id);
        }}
      />
    </div>
  );
}
