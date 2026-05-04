import { Stethoscope } from "lucide-react";
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

      <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
            <Stethoscope className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Recommended this week</h3>
            <p className="text-[11px] text-slate-500">Why these? {schedule.themeClinicalNote}</p>
          </div>
        </div>
        <ul className="space-y-2.5">
          {schedule.recommendations.map((row) => (
            <li
              key={row.activityId}
              className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-sm"
            >
              <span className="mt-0.5 font-bold text-purple-500">→</span>
              <div className="min-w-0">
                <p className="font-semibold text-slate-800">{row.name}</p>
                <p className="text-xs leading-relaxed text-slate-600">&ldquo;{row.rationale}&rdquo;</p>
              </div>
            </li>
          ))}
        </ul>
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
