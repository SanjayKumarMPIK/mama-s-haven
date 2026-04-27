// ─── Weekly Progress Card ─────────────────────────────────────────────────────
// Displays weekly progress metrics for pregnancy dashboard
// STRICTLY isolated to Maternity Phase only

import { useMemo } from "react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { Apple, Droplets, Activity, Moon } from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface WeeklyProgressMetric {
  label: string;
  value: string;
  icon: React.ElementType;
}

export interface WeeklyProgressData {
  week: number;
  metrics: WeeklyProgressMetric[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function WeeklyProgressCard() {
  const { currentWeek } = usePregnancyProfile();
  const { getPhaseLogs } = useHealthLog();
  const maternityLogs = getPhaseLogs("maternity");

  const progressData = useMemo((): WeeklyProgressData => {
    const last7Days = getLast7Days();
    
    // Calculate metrics from maternity logs
    let hydrationSum = 0;
    let hydrationCount = 0;
    let sleepSum = 0;
    let sleepCount = 0;
    let activityDays = 0;
    let nutritionDays = 0;

    for (const date of last7Days) {
      const entry = maternityLogs[date];
      if (!entry) continue;

      // Hydration
      if (entry.hydrationGlasses !== null && entry.hydrationGlasses !== undefined) {
        hydrationSum += entry.hydrationGlasses;
        hydrationCount++;
      }

      // Sleep
      if (entry.sleepHours !== null && entry.sleepHours !== undefined) {
        sleepSum += entry.sleepHours;
        sleepCount++;
      }

      // Activity (derived from fatigue level - low fatigue = more active)
      if (entry.fatigueLevel === "Low") {
        activityDays++;
      }

      // Nutrition (placeholder - would need nutrition tracking in logs)
      // For now, assume tracked if hydration is logged
      if (entry.hydrationGlasses !== null) {
        nutritionDays++;
      }
    }

    // Build metrics
    const metrics: WeeklyProgressMetric[] = [];

    // Nutrition
    const nutritionScore = nutritionDays > 0 ? "Good" : "Not tracked";
    metrics.push({
      label: "Nutrition",
      value: nutritionScore,
      icon: Apple,
    });

    // Hydration
    const avgHydration = hydrationCount > 0 ? Math.round(hydrationSum / hydrationCount) : 0;
    const hydrationValue = hydrationCount > 0 ? `${avgHydration} / 8 glasses` : "No logs";
    metrics.push({
      label: "Hydration",
      value: hydrationValue,
      icon: Droplets,
    });

    // Activity
    const activityValue = activityDays > 0 ? `${activityDays} / 7 days` : "No activity logged";
    metrics.push({
      label: "Activity",
      value: activityValue,
      icon: Activity,
    });

    // Sleep
    const avgSleep = sleepCount > 0 ? (sleepSum / sleepCount).toFixed(1) : 0;
    const sleepValue = sleepCount > 0 ? `${avgSleep} hrs / night` : "Not tracked";
    metrics.push({
      label: "Sleep",
      value: sleepValue,
      icon: Moon,
    });

    return {
      week: currentWeek,
      metrics,
    };
  }, [maternityLogs, currentWeek]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100">
          <Activity className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-bold text-base">Weekly Progress</h2>
          <p className="text-[11px] font-medium text-muted-foreground mt-0.5">Week {progressData.week}</p>
        </div>
      </div>

      <div className="space-y-3">
        {progressData.metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-muted/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 border border-border/50 shadow-sm">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground flex-1">{metric.label}</span>
              <span className="text-[13px] font-bold text-foreground">{metric.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
