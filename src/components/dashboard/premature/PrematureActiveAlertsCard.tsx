/**
 * PrematureActiveAlertsCard.tsx
 *
 * Active alerts and recommendations card for Premature Dashboard.
 * Displays premature baby care alerts with priority-based styling.
 * Fully isolated from Postpartum Dashboard.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  ChevronRight, 
  Moon, 
  Droplets, 
  Heart,
  Activity,
  Scale,
  Baby,
  Clock
} from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";
import { usePrematureBabyWeight } from "@/hooks/usePrematureBabyWeight";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";

const accent = {
  gradient: "from-violet-500 to-purple-400",
  bg: "bg-violet-50",
  text: "text-violet-700",
  border: "border-violet-200/60",
  cardBg: "bg-gradient-to-br from-violet-50 to-purple-50",
};

type AlertPriority = "low" | "medium" | "high" | "critical";

interface RecoveryAlert {
  id: string;
  icon: any;
  title: string;
  description: string;
  priority: AlertPriority;
  timestamp: string;
}

// Generate alerts based on premature baby care data
function generatePrematureAlerts(
  logs: any,
  weightEntries: any[],
  weeksAtBirth: number
): RecoveryAlert[] {
  const alerts: RecoveryAlert[] = [];
  const now = new Date();
  
  // Get recent logs (last 7 days)
  const recentLogs = Object.values(logs || {}).filter((log: any) => {
    if (!log || !log.date) return false;
    const logDate = new Date(log.date);
    const daysDiff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  // Check weight tracking - critical for premature babies
  if (weightEntries.length === 0) {
    alerts.push({
      id: "weight-missing",
      icon: Scale,
      title: "Weight Monitoring Suggested",
      description: "Start tracking baby's weight weekly",
      priority: "high",
      timestamp: "Today",
    });
  } else if (weightEntries.length >= 2) {
    const latestWeight = weightEntries[weightEntries.length - 1].weight;
    const previousWeight = weightEntries[weightEntries.length - 2].weight;
    const weightDiff = latestWeight - previousWeight;
    
    // Weight loss or very slow gain is concerning for premature babies
    if (weightDiff < 0) {
      alerts.push({
        id: "weight-loss",
        icon: Scale,
        title: "Weight Loss Detected",
        description: "Baby lost weight - consult doctor",
        priority: "critical",
        timestamp: "Today",
      });
    } else if (weightDiff < 50) {
      alerts.push({
        id: "weight-slow",
        icon: Scale,
        title: "Slow Weight Gain",
        description: "Monitor weight gain closely",
        priority: "high",
        timestamp: "Today",
      });
    }
  }

  // Check maternal sleep patterns - affects baby care
  const sleepLogs = recentLogs.filter((log: any) => log.sleepHours !== null && log.sleepHours !== undefined);
  if (sleepLogs.length > 0) {
    let totalSleep = 0;
    sleepLogs.forEach((log: any) => {
      if (typeof log.sleepHours === 'number') {
        totalSleep += log.sleepHours;
      }
    });
    const avgSleep = totalSleep / sleepLogs.length;
    if (avgSleep < 4) {
      alerts.push({
        id: "sleep-critical",
        icon: Moon,
        title: "Sleep Recovery Alert",
        description: "Severe sleep deprivation - seek support",
        priority: "critical",
        timestamp: "Today",
      });
    } else if (avgSleep < 5) {
      alerts.push({
        id: "sleep-low",
        icon: Moon,
        title: "Rest More",
        description: "Adequate rest needed for baby care",
        priority: "high",
        timestamp: "Today",
      });
    }
  }

  // Check hydration
  const hydrationLogs = recentLogs.filter((log: any) => log.hydrationGlasses !== null && log.hydrationGlasses !== undefined);
  if (hydrationLogs.length > 0) {
    let totalHydration = 0;
    hydrationLogs.forEach((log: any) => {
      if (typeof log.hydrationGlasses === 'number') {
        totalHydration += log.hydrationGlasses;
      }
    });
    const avgHydration = totalHydration / hydrationLogs.length;
    if (avgHydration < 6) {
      alerts.push({
        id: "hydration-low",
        icon: Droplets,
        title: "Hydration Support Needed",
        description: "Increase water for breastfeeding",
        priority: "medium",
        timestamp: "Today",
      });
    }
  }

  // Check mood - important for maternal mental health
  const moodLogs = recentLogs.filter((log: any) => log.mood === "Low");
  if (moodLogs.length >= 3) {
    alerts.push({
      id: "mood-low",
      icon: Heart,
      title: "Emotional Support",
      description: "Low mood detected - seek help",
      priority: "high",
      timestamp: "Today",
    });
  }

  // High-risk premature babies need more frequent monitoring
  if (weeksAtBirth < 32) {
    alerts.push({
      id: "monitoring-reminder",
      icon: Clock,
      title: "Feeding Interval Reminder",
      description: "Frequent feeds needed for growth",
      priority: "medium",
      timestamp: "Today",
    });
  }

  // Check symptoms for any severe issues
  const symptomLogs = recentLogs.filter((log: any) => log.symptoms && typeof log.symptoms === 'object');
  if (symptomLogs.length > 0) {
    const severeSymptoms = symptomLogs.filter((log: any) => {
      const severities = log.symptomSeverities as Record<string, string> | undefined;
      if (!severities) return false;
      return Object.values(severities).some(s => s === "severe");
    });
    if (severeSymptoms.length > 0) {
      alerts.push({
        id: "symptoms-severe",
        icon: AlertTriangle,
        title: "Symptom Check Recommended",
        description: "Severe symptoms - consult doctor",
        priority: "critical",
        timestamp: "Today",
      });
    }
  }

  // Default alert if no specific alerts
  if (alerts.length === 0) {
    alerts.push({
      id: "care-on-track",
      icon: Baby,
      title: "Care On Track",
      description: "Continue current care routine",
      priority: "low",
      timestamp: "Today",
    });
  }

  return alerts.slice(0, 4); // Show max 4 alerts
}

function getPriorityStyles(priority: AlertPriority) {
  switch (priority) {
    case "critical":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        titleColor: "text-red-800",
      };
    case "high":
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        titleColor: "text-orange-800",
      };
    case "medium":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        titleColor: "text-amber-800",
      };
    case "low":
    default:
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        titleColor: "text-green-800",
      };
  }
}

export default function PrematureActiveAlertsCard() {
  const { maternityLogs } = useHealthLog();
  const weightTracker = usePrematureBabyWeight();
  const { profile } = usePregnancyProfile();
  const weeksAtBirth = profile.delivery?.weeksAtBirth || 37;
  
  const alerts = useMemo(() => 
    generatePrematureAlerts(maternityLogs, weightTracker.entries, weeksAtBirth),
    [maternityLogs, weightTracker.entries, weeksAtBirth]
  );
  const activeCount = alerts.filter(a => a.priority !== "low").length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-violet-700" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Active Alerts & Recommendations</h2>
            <p className="text-[10px] text-muted-foreground">
              {activeCount} active alert{activeCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          const styles = getPriorityStyles(alert.priority);
          
          return (
            <Link
              key={alert.id}
              to="#"
              className={`flex items-center gap-3 p-3 rounded-xl border ${styles.border} ${styles.bg} hover:opacity-80 transition-opacity group`}
            >
              <div className={`w-8 h-8 rounded-lg ${styles.iconBg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-4 h-4 ${styles.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${styles.titleColor}`}>{alert.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{alert.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-muted-foreground">{alert.timestamp}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        to="#"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold transition-colors"
      >
        View All Alerts & Recommendations
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
