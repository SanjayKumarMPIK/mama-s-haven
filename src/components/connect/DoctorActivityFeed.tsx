import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { UserCheck, ShieldCheck, Bell, Clock, Activity, CalendarDays, CheckCircle2, XCircle, RefreshCw, Siren, ShieldAlert } from "lucide-react";
import { getAllScheduleActivity, type ScheduleRequest } from "@/lib/scheduleStore";
import { useAuth } from "@/hooks/useAuth";
import { getSOSAlertsByPatient } from "@/lib/sosStore";
import { fetchHillstationAcknowledgmentsForPatient } from "@/services/maternityHillstationSupabase";

interface ActivityItem {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  text: string;
  timestamp: string;
  time?: string;
}

interface Props {
  connectedAt: string;
  connectedDate: string;
  doctorCode?: string;
  doctorId?: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const STATUS_ACTIVITY: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; textPrefix: string }> = {
  pending: { icon: CalendarDays, color: "text-amber-600", bgColor: "bg-amber-100", textPrefix: "Schedule requested" },
  accepted: { icon: CheckCircle2, color: "text-blue-600", bgColor: "bg-blue-100", textPrefix: "Request accepted" },
  declined: { icon: XCircle, color: "text-red-600", bgColor: "bg-red-100", textPrefix: "Request declined" },
  confirmed: { icon: CheckCircle2, color: "text-emerald-600", bgColor: "bg-emerald-100", textPrefix: "Schedule confirmed" },
  rescheduled: { icon: RefreshCw, color: "text-purple-600", bgColor: "bg-purple-100", textPrefix: "Reschedule requested" },
  completed: { icon: Clock, color: "text-slate-600", bgColor: "bg-slate-100", textPrefix: "Appointment completed" },
};

export default function DoctorActivityFeed({ connectedAt, connectedDate, doctorCode, doctorId }: Props) {
  const { user } = useAuth();
  const [allRequests, setAllRequests] = useState<ScheduleRequest[]>([]);
  const [remoteActivities, setRemoteActivities] = useState<ActivityItem[]>([]);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (mountedRef.current && doctorCode) {
      try {
        const data = await getAllScheduleActivity(doctorCode, 10);
        if (mountedRef.current) setAllRequests(data);
      } catch (err) {
        console.warn('[DoctorActivityFeed] refresh error:', err);
      }
    }
  }, [doctorCode]);

  const refreshRemoteActivities = useCallback(async () => {
    if (!mountedRef.current || !user?.id || !doctorCode) {
      if (mountedRef.current) {
        setRemoteActivities([]);
      }
      return;
    }

    const [sosAlerts, hillstationAcknowledgments] = await Promise.all([
      getSOSAlertsByPatient(user.id),
      fetchHillstationAcknowledgmentsForPatient(user.id, doctorId),
    ]);

    if (!mountedRef.current) return;

    const sosItems: ActivityItem[] = sosAlerts
      .filter(
        (alert) =>
          alert.doctorCode === doctorCode &&
          (alert.status === "acknowledged" || alert.status === "resolved"),
      )
      .map((alert) => ({
        icon: alert.status === "resolved" ? CheckCircle2 : Siren,
        color: alert.status === "resolved" ? "text-emerald-600" : "text-red-600",
        bgColor: alert.status === "resolved" ? "bg-emerald-100" : "bg-red-100",
        text:
          alert.status === "resolved"
            ? "Doctor resolved your emergency SOS"
            : "Doctor acknowledged your emergency SOS",
        timestamp: alert.handledAt || alert.updatedAt || alert.createdAt,
      }));

    const hillstationItems: ActivityItem[] = hillstationAcknowledgments.map((activity) => ({
      icon: ShieldAlert,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      text: "Doctor acknowledged your high-risk maternity alert",
      timestamp: activity.acknowledgedAt,
    }));

    setRemoteActivities([...sosItems, ...hillstationItems]);
  }, [doctorCode, doctorId, user?.id]);

  useEffect(() => {
    if (!doctorCode) return;
    mountedRef.current = true;
    void refresh();
    void refreshRemoteActivities();
    const interval = setInterval(() => void refresh(), 5000);
    const remoteInterval = setInterval(() => {
      void refreshRemoteActivities();
    }, 5000);
    const handleStorage = () => {
      void refresh();
      void refreshRemoteActivities();
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
      clearInterval(remoteInterval);
      window.removeEventListener("storage", handleStorage);
    };
  }, [doctorCode, refresh, refreshRemoteActivities]);

  const activities: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [
      {
        icon: UserCheck,
        color: "text-emerald-600",
        bgColor: "bg-emerald-100",
        text: "Connection accepted by doctor",
        timestamp: connectedAt,
        time: connectedDate,
      },
      {
        icon: ShieldCheck,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        text: "Profile shared with doctor",
        timestamp: connectedAt,
        time: connectedDate,
      },
      {
        icon: Bell,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        text: "Health alerts enabled for sharing",
        timestamp: connectedAt,
        time: "Today",
      },
    ];

    for (const req of allRequests) {
      const config = STATUS_ACTIVITY[req.status];
      if (config) {
        const Icon = config.icon;
        items.push({
          icon: Icon,
          color: config.color,
          bgColor: config.bgColor,
          text: `${config.textPrefix} · ${req.appointmentReason}`,
          timestamp: req.updatedAt || req.createdAt,
        });
      }
    }

    return [...remoteActivities, ...items].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [allRequests, connectedAt, connectedDate, remoteActivities]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Doctor Activity</h3>
      <div className="space-y-0">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">No recent doctor activity</p>
            <p className="text-xs text-gray-400 mt-0.5">Activity updates will appear here</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-slate-100" />
            {activities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-start gap-3 pb-4 last:pb-0 relative">
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center shrink-0 z-10`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1.5">
                    <p className="text-sm font-medium text-gray-700">{item.text}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {item.time ?? formatTime(item.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
