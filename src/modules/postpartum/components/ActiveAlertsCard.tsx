/**
 * ActiveAlertsCard.tsx
 *
 * Active alerts and recommendations card for Postpartum Dashboard.
 * Displays postpartum recovery alerts with priority-based styling.
 */

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  AlertTriangle, 
  ChevronRight, 
  Moon, 
  Droplets, 
  Heart,
  Activity
} from "lucide-react";
import { useHealthLog } from "@/hooks/useHealthLog";

const accent = {
  gradient: "from-rose-500 to-pink-400",
  bg: "bg-rose-50",
  text: "text-rose-700",
  border: "border-rose-200/60",
  cardBg: "bg-gradient-to-br from-rose-50 to-pink-50",
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

// Generate alerts based on health log data
function generateRecoveryAlerts(logs: any): RecoveryAlert[] {
  const alerts: RecoveryAlert[] = [];
  const now = new Date();
  
  // Get recent logs (last 7 days)
  const recentLogs = Object.values(logs || {}).filter((log: any) => {
    if (!log || !log.date) return false;
    const logDate = new Date(log.date);
    const daysDiff = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7;
  });

  // Check sleep patterns
  const sleepLogs = recentLogs.filter((log: any) => log.sleepHours !== null && log.sleepHours !== undefined);
  if (sleepLogs.length > 0) {
    let totalSleep = 0;
    sleepLogs.forEach((log: any) => {
      if (typeof log.sleepHours === 'number') {
        totalSleep += log.sleepHours;
      }
    });
    const avgSleep = totalSleep / sleepLogs.length;
    if (avgSleep < 5) {
      alerts.push({
        id: "sleep-low",
        icon: Moon,
        title: "Sleep Recovery Needed",
        description: "Average sleep below 5 hours - prioritize rest",
        priority: "high",
        timestamp: "Today",
      });
    } else if (avgSleep < 6) {
      alerts.push({
        id: "sleep-medium",
        icon: Moon,
        title: "Rest More",
        description: "Try to increase sleep for better recovery",
        priority: "medium",
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
        title: "Hydration Reminder",
        description: "Increase water intake to 8-10 glasses daily",
        priority: "medium",
        timestamp: "Today",
      });
    }
  }

  // Check mood
  const moodLogs = recentLogs.filter((log: any) => log.mood === "Low");
  if (moodLogs.length >= 3) {
    alerts.push({
      id: "mood-low",
      icon: Heart,
      title: "Emotional Support",
      description: "Low mood detected - consider talking to someone",
      priority: "high",
      timestamp: "Today",
    });
  }

  // Check symptoms
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
        description: "Severe symptoms detected - monitor closely",
        priority: "critical",
        timestamp: "Today",
      });
    }
  }

  // Default alert if no specific alerts
  if (alerts.length === 0) {
    alerts.push({
      id: "recovery-progress",
      icon: Activity,
      title: "Recovery On Track",
      description: "Continue with your current care routine",
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

export default function ActiveAlertsCard() {
  const { maternityLogs } = useHealthLog();
  
  const alerts = useMemo(() => generateRecoveryAlerts(maternityLogs), [maternityLogs]);
  const activeCount = alerts.filter(a => a.priority !== "low").length;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-rose-700" />
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
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
      >
        View All Alerts & Recommendations
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
