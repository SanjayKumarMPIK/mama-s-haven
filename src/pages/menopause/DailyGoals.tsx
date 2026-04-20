import { useState, useMemo, useEffect, useCallback } from "react";
import { Target, Bell, Flame, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import { generateDailyGoals, type DailyGoalItem } from "@/lib/menopauseWellnessEngine";

// ─── Progress Ring ───────────────────────────────────────────────────────────

function ProgressRing({ percentage, size = 80, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={percentage >= 80 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#94a3b8"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-800">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

// ─── Monthly Heatmap ─────────────────────────────────────────────────────────

function MonthlyHeatmap({ completionMap, year, month }: { completionMap: Record<string, number>; year: number; month: number }) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-700 mb-3">📊 {monthNames[month]} Completion</h3>
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-[9px] text-slate-400 text-center font-semibold">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const pct = completionMap[dateStr] ?? -1;
          return (
            <div
              key={day}
              className={cn(
                "w-full aspect-square rounded-sm transition-colors",
                pct < 0 ? "bg-slate-50" :
                pct < 30 ? "bg-amber-100" :
                pct < 60 ? "bg-amber-200" :
                pct < 80 ? "bg-amber-300" :
                "bg-amber-500"
              )}
              title={pct >= 0 ? `${dateStr}: ${pct}%` : dateStr}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-1 mt-2 justify-end">
        <span className="text-[9px] text-slate-400">Less</span>
        {[50, 100, 200, 300, 500].map((shade) => (
          <div key={shade} className={`w-3 h-3 rounded-sm bg-amber-${shade}`} />
        ))}
        <span className="text-[9px] text-slate-400">More</span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DailyGoals() {
  const { profile, todayGoals, toggleGoal, getWeekStreak, getMonthCompletionMap, reminderSettings, saveReminderSettings } = useMenopause();
  const [showReminders, setShowReminders] = useState(false);
  const [localReminders, setLocalReminders] = useState(reminderSettings);
  const [reminderBanner, setReminderBanner] = useState<string | null>(null);

  const goals = useMemo(() => (profile ? generateDailyGoals(profile) : []), [profile]);
  const totalGoals = goals.length;

  const completedSet = new Set(todayGoals.completed);
  const completedCount = goals.filter((g) => completedSet.has(g.id)).length;
  const percentage = totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0;

  const weekStreak = useMemo(() => getWeekStreak(), [getWeekStreak]);
  const today = new Date();
  const completionMap = useMemo(
    () => getMonthCompletionMap(today.getFullYear(), today.getMonth()),
    [getMonthCompletionMap, today]
  );

  const morningGoals = goals.filter((g) => g.block === "morning");
  const afternoonGoals = goals.filter((g) => g.block === "afternoon");
  const eveningGoals = goals.filter((g) => g.block === "evening");

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      // Don't auto-request — wait for user action
    }
  }, []);

  // Check reminders
  useEffect(() => {
    if (!reminderSettings.notificationsEnabled) return;
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const blocks: { time: string; label: string }[] = [
        { time: reminderSettings.morningTime, label: "🌅 Morning goals are waiting for you!" },
        { time: reminderSettings.afternoonTime, label: "☀️ Time for your afternoon check-in!" },
        { time: reminderSettings.eveningTime, label: "🌙 Wind down — complete your evening goals!" },
      ];
      for (const block of blocks) {
        if (timeStr === block.time) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("SwasthyaSakhi", { body: block.label, icon: "/logo.png" });
          } else {
            setReminderBanner(block.label);
            setTimeout(() => setReminderBanner(null), 10000);
          }
        }
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [reminderSettings]);

  const handleEnableNotifications = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        saveReminderSettings({ ...localReminders, notificationsEnabled: true });
        setLocalReminders((prev) => ({ ...prev, notificationsEnabled: true }));
      }
    }
  }, [localReminders, saveReminderSettings]);

  const handleSaveReminders = () => {
    saveReminderSettings(localReminders);
    setShowReminders(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 flex items-center justify-center">
        <div className="text-center px-4">
          <span className="text-5xl mb-4 block">🎯</span>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Complete your profile first</h2>
          <p className="text-sm text-slate-500">We'll generate personalised daily goals based on your wellness plan.</p>
        </div>
      </div>
    );
  }

  const GoalBlock = ({ title, emoji, items, color }: { title: string; emoji: string; items: DailyGoalItem[]; color: string }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b", color)}>
        <span className="text-lg">{emoji}</span>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="p-3 space-y-1">
        {items.map((goal) => {
          const isComplete = completedSet.has(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id, totalGoals)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                isComplete ? "bg-green-50 border border-green-200" : "hover:bg-slate-50 border border-transparent"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                isComplete ? "border-green-500 bg-green-500" : "border-slate-300"
              )}>
                {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-lg">{goal.emoji}</span>
              <span className={cn(
                "text-sm transition-all",
                isComplete ? "text-green-700 line-through" : "text-slate-700"
              )}>
                {goal.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60">
      {/* Reminder banner */}
      {reminderBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center py-3 px-4 text-sm font-medium shadow-lg animate-fadeIn">
          {reminderBanner}
          <button onClick={() => setReminderBanner(null)} className="ml-3 text-white/80 hover:text-white">✕</button>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
        {/* Header with progress ring */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Daily Goals</h1>
              <p className="text-xs text-slate-500">{completedCount}/{totalGoals} completed</p>
            </div>
          </div>
          <ProgressRing percentage={percentage} />
        </div>

        {/* Streak */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-800">{weekStreak}</p>
              <p className="text-[10px] text-slate-500">day streak this week</p>
            </div>
          </div>
          <button
            onClick={() => setShowReminders(!showReminders)}
            className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3 hover:border-amber-200 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-700">Reminders</p>
              <p className="text-[10px] text-slate-500">
                {reminderSettings.notificationsEnabled ? "On" : "Off"}
              </p>
            </div>
          </button>
        </div>

        {/* Reminder settings panel */}
        {showReminders && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 mb-5 animate-fadeIn">
            <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Reminder Settings
            </h3>
            <div className="space-y-3">
              {(["morning", "afternoon", "evening"] as const).map((block) => {
                const key = `${block}Time` as keyof typeof localReminders;
                const labels = { morning: "🌅 Morning", afternoon: "☀️ Afternoon", evening: "🌙 Evening" };
                return (
                  <div key={block} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{labels[block]}</span>
                    <input
                      type="time"
                      value={localReminders[key] as string}
                      onChange={(e) => setLocalReminders((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                    />
                  </div>
                );
              })}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm text-slate-700">Browser notifications</span>
                <button
                  onClick={handleEnableNotifications}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    localReminders.notificationsEnabled
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  )}
                >
                  {localReminders.notificationsEnabled ? "✓ Enabled" : "Enable"}
                </button>
              </div>
            </div>
            <button
              onClick={handleSaveReminders}
              className="w-full mt-3 py-2 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-all"
            >
              Save Settings
            </button>
          </div>
        )}

        {/* Goal blocks */}
        <div className="space-y-4 mb-6">
          <GoalBlock title="Morning" emoji="🌅" items={morningGoals} color="bg-orange-50 border-orange-100" />
          <GoalBlock title="Afternoon" emoji="☀️" items={afternoonGoals} color="bg-amber-50 border-amber-100" />
          <GoalBlock title="Evening" emoji="🌙" items={eveningGoals} color="bg-indigo-50 border-indigo-100" />
        </div>

        {/* Monthly heatmap */}
        <MonthlyHeatmap
          completionMap={completionMap}
          year={today.getFullYear()}
          month={today.getMonth()}
        />
      </div>
    </div>
  );
}
