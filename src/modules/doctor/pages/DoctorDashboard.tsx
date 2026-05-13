import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Users, Calendar, FileText, AlertCircle, Search, ChevronRight, Bell, Stethoscope, ShieldAlert, Timer } from "lucide-react";
import { useDoctorAuth } from "@/modules/doctor/hooks/useDoctorAuth";
import { Link } from "react-router-dom";
import { getRequestsByDoctor } from "@/lib/connectionStore";
import { getReportsByDoctor } from "@/components/connect/medicalReportStore";
import { useDoctorRouteAlertCounts } from "@/modules/doctor/components/DoctorRouteAlertOverlays";

const DOCTOR_ID = "doctor-demo-123";
const DOCTOR_ALERTS_KEY = "ss-maternity-doctor-alerts";

interface LmpEddInfo {
  patientId: string;
  patientName: string;
  lmp: string;
  edd: string;
  daysRemaining: number;
  status: "upcoming" | "due-soon" | "overdue" | "unknown";
}

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  phase: string;
  lastVisit: string;
  status: string;
  avatar: string;
}

function addDays(ymd: string, days: number): string {
  const d = new Date(ymd + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysUntil(ymd: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(ymd + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function loadPatients(): PatientRecord[] {
  const requests = getRequestsByDoctor(DOCTOR_ID).filter((r) => r.status === "accepted");
  return requests.map((r) => {
    const prof = r.patientProfile;
    return {
      id: r.id,
      name: prof?.fullName ?? r.patientName,
      age: prof?.age ?? 0,
      phase: r.patientPhase,
      lastVisit: formatLastActivity(r.createdAt),
      status: r.riskLevel === "High" ? "Follow-up" : "Active",
      avatar: (prof?.fullName ?? r.patientName).split(" ").map((n) => n[0]).join("").slice(0, 2),
    };
  });
}

function loadLmpEddAlerts(): LmpEddInfo[] {
  const requests = getRequestsByDoctor(DOCTOR_ID).filter((r) => r.status === "accepted");
  const result: LmpEddInfo[] = [];
  for (const r of requests) {
    const edd = r.patientProfile?.expectedDueDate;
    if (!edd) continue;
    const lmp = addDays(edd, -280);
    const days = daysUntil(edd);
    let status: LmpEddInfo["status"] = "upcoming";
    if (days < 0) status = "overdue";
    else if (days <= 7) status = "due-soon";
    result.push({
      patientId: r.id,
      patientName: r.patientProfile?.fullName ?? r.patientName,
      lmp,
      edd,
      daysRemaining: days,
      status,
    });
  }
  result.sort((a, b) => a.daysRemaining - b.daysRemaining);
  return result;
}

function loadActiveAlertsCount(): number {
  try {
    const raw = localStorage.getItem(DOCTOR_ALERTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.filter((a: { alertStatus?: string }) => a.alertStatus === "active").length;
    }
  } catch {}
  return 0;
}

function loadPendingReportsCount(): number {
  return getReportsByDoctor(DOCTOR_ID).filter((r) => r.status === "Sent").length;
}

function formatLastActivity(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "Follow-up": "bg-amber-100 text-amber-700",
  Monitoring: "bg-blue-100 text-blue-700",
};

export default function DoctorDashboard() {
  const { doctorProfile, refreshDoctorProfile } = useDoctorAuth();
  const displayName = doctorProfile?.full_name ?? "Doctor";

  useEffect(() => {
    void refreshDoctorProfile();
  }, [refreshDoctorProfile]);
  const [patients, setPatients] = useState<PatientRecord[]>(loadPatients);
  const [lmpEddAlerts, setLmpEddAlerts] = useState<LmpEddInfo[]>(loadLmpEddAlerts);
  const [pendingReports, setPendingReports] = useState(loadPendingReportsCount);
  const [activeAlerts, setActiveAlerts] = useState(loadActiveAlertsCount);
  const [notificationCount, setNotificationCount] = useState(0);
  const mountedRef = useRef(true);

  const { pendingSos: totalActiveSOS, maternityHillstation: totalMaternityHillstationAlerts, realtimeConnected } =
    useDoctorRouteAlertCounts();

  const totalPatients = useMemo(() => patients.length, [patients]);
  const effectiveAlertCount = activeAlerts + totalActiveSOS + totalMaternityHillstationAlerts;

  const refresh = useCallback(() => {
    if (!mountedRef.current) return;
    setPatients(loadPatients());
    setLmpEddAlerts(loadLmpEddAlerts());
    const pr = loadPendingReportsCount();
    setPendingReports(pr);
    const aa = loadActiveAlertsCount();
    setActiveAlerts(aa);
    setNotificationCount(pr + aa);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    const refreshInterval = setInterval(refresh, 3000);
    window.addEventListener("storage", refresh);

    function loadCount() {
      try {
        const raw = localStorage.getItem(DOCTOR_ALERTS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const count = parsed.filter((a: { alertStatus?: string }) => a.alertStatus === "active").length;
          setActiveAlerts(count);
        }
      } catch { }
    }

    loadCount();
    const countInterval = setInterval(loadCount, 3000);
    window.addEventListener("storage", loadCount);

    return () => {
      mountedRef.current = false;
      clearInterval(refreshInterval);
      clearInterval(countInterval);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("storage", loadCount);
    };
  }, [refresh]);

  const sortedPatients = useMemo(
    () => [...patients].sort((a, b) => {
      const aTime = new Date(a.lastVisit === "Just now" ? Date.now() : Date.now()).getTime();
      const bTime = new Date(b.lastVisit === "Just now" ? Date.now() : Date.now()).getTime();
      return 0;
    }),
    [patients],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <Stethoscope className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Doctor Dashboard</h1>
                <p className="text-teal-100 mt-1">Welcome back, {displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/doctor/patients"
                className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors max-sm:hidden"
              >
                <Search className="h-4 w-4" />
                Search Patient
              </Link>
              <div className="flex items-center gap-1.5">
                {/* Realtime connection indicator */}
                <span
                  title={realtimeConnected ? "Live alert monitoring active" : "Alert monitoring via polling"}
                  className={`inline-block h-2 w-2 rounded-full ${
                    realtimeConnected
                      ? "bg-emerald-400 animate-pulse shadow-[0_0_4px_rgba(52,211,153,0.6)]"
                      : "bg-amber-400"
                  }`}
                />
                <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                  {totalActiveSOS > 0 || totalMaternityHillstationAlerts > 0 ? (
                    <ShieldAlert className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  {(notificationCount + totalActiveSOS + totalMaternityHillstationAlerts) > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                      {(notificationCount + totalActiveSOS + totalMaternityHillstationAlerts) > 9 ? "9+" : (notificationCount + totalActiveSOS + totalMaternityHillstationAlerts)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Patients"
            value={String(totalPatients)}
            color="teal"
            trend={totalPatients > 0 ? `${totalPatients} connected` : "No patients yet"}
          />
          <StatCard
            icon={Timer}
            label="LMP / EDD Alerts"
            value={String(lmpEddAlerts.length)}
            color="blue"
            trend={lmpEddAlerts.length > 0 ? `${lmpEddAlerts.filter(a => a.status === "due-soon").length} due soon` : "No LMP records"}
          />
          <StatCard
            icon={FileText}
            label="Pending Reports"
            value={String(pendingReports)}
            color="amber"
            trend={pendingReports > 0 ? `${pendingReports} need review` : "All reviewed"}
          />
           <StatCard
              icon={totalActiveSOS > 0 || totalMaternityHillstationAlerts > 0 ? ShieldAlert : AlertCircle}
              label="Active Alerts"
              value={String(effectiveAlertCount)}
              color="red"
              trend={totalActiveSOS > 0 
                ? `${totalActiveSOS} SOS emergency${totalActiveSOS > 1 ? "s" : ""} pending`
                : totalMaternityHillstationAlerts > 0
                  ? `${totalMaternityHillstationAlerts} hillstation delivery alert${totalMaternityHillstationAlerts > 1 ? "s" : ""}`
                  : effectiveAlertCount > 0 
                    ? "Requires attention" 
                    : "No active alerts"}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LMP / EDD Alerts */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Timer className="h-5 w-5 text-teal-600" />
                LMP &amp; EDD Alerts
              </h2>
              <Link
                to="/doctor/patients"
                className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {lmpEddAlerts.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {lmpEddAlerts.map((alert) => {
                  const statusBadge = {
                    "due-soon": "bg-red-100 text-red-700",
                    overdue: "bg-amber-100 text-amber-700",
                    upcoming: "bg-blue-100 text-blue-700",
                    unknown: "bg-slate-100 text-slate-600",
                  }[alert.status];
                  const statusLabel = {
                    "due-soon": "Due Soon",
                    overdue: "Overdue",
                    upcoming: "Upcoming",
                    unknown: "Unknown",
                  }[alert.status];
                  return (
                    <div key={alert.patientId} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-semibold text-sm">
                          {alert.patientName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{alert.patientName}</p>
                          <p className="text-sm text-slate-500">
                            LMP: {alert.lmp} &middot; EDD: {alert.edd}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full whitespace-nowrap">
                          {alert.daysRemaining > 0 ? `${alert.daysRemaining}d left` : alert.daysRemaining === 0 ? "Due today" : `${Math.abs(alert.daysRemaining)}d overdue`}
                        </span>
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusBadge}`}>
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-500">No LMP / EDD records</p>
                <p className="text-xs text-slate-400 mt-1">Patient LMP data will appear when patients connect and set their due dates</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/doctor/patients" className="block">
                <QuickAction icon={Users} label="View All Patients" description="Browse patient records" />
              </Link>
              <Link to="/doctor/schedules" className="block">
                <QuickAction icon={Calendar} label="Schedule Appointment" description="Book new consultations" />
              </Link>
              <Link to="/doctor/history" className="block">
                <QuickAction icon={FileText} label="Generate Reports" description="Create health summaries" />
              </Link>
                <Link to="/doctor/alerts" className="block">
                  <QuickAction
                    icon={effectiveAlertCount > 0 ? ShieldAlert : AlertCircle}
                    label="Review Alerts"
                    description={totalActiveSOS > 0 
                      ? `${totalActiveSOS} SOS emergency${totalActiveSOS > 1 ? "ies" : ""} — ${activeAlerts} symptom alerts`
                      : totalMaternityHillstationAlerts > 0
                        ? `${totalMaternityHillstationAlerts} hillstation delivery alert${totalMaternityHillstationAlerts > 1 ? "s" : ""}`
                        : activeAlerts > 0 
                          ? `${activeAlerts} pending alerts` 
                          : "No pending alerts"}
                  />
                </Link>
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Recent Patients</h2>
            <Link
              to="/doctor/patients"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {sortedPatients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Patient</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Phase</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Last Visit</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedPatients.slice(0, 10).map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 text-teal-700 font-semibold text-xs">
                            {patient.avatar}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{patient.name}</p>
                            <p className="text-xs text-slate-500">Age {patient.age}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{patient.phase}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{patient.lastVisit}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[patient.status] ?? "bg-slate-100 text-slate-600"}`}>
                          {patient.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-500">No patients yet</p>
              <p className="text-xs text-slate-400 mt-1">Patient records will appear when patients connect</p>
            </div>
          )}
         </div>
       </div>

     </div>
   );
 }

function StatCard({ icon: Icon, label, value, color, trend }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string; trend: string }) {
  const colorMap: Record<string, { bg: string; iconBg: string; iconText: string }> = {
    teal: { bg: "bg-teal-50", iconBg: "bg-teal-100", iconText: "text-teal-600" },
    blue: { bg: "bg-blue-50", iconBg: "bg-blue-100", iconText: "text-blue-600" },
    amber: { bg: "bg-amber-50", iconBg: "bg-amber-100", iconText: "text-amber-600" },
    red: { bg: "bg-red-50", iconBg: "bg-red-100", iconText: "text-red-600" },
  };
  const c = colorMap[color] ?? colorMap.teal;

  return (
    <div className={`rounded-2xl border border-slate-200 p-5 bg-white shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.iconBg}`}>
          <Icon className={`h-5 w-5 ${c.iconText}`} />
        </div>
        <span className="text-sm font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{trend}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, description }: { icon: React.ComponentType<{ className?: string }>; label: string; description: string }) {
  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-left group cursor-pointer">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}
