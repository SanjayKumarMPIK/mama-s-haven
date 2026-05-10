import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Users, Calendar, FileText, AlertCircle, Search, Clock, ChevronRight, Bell, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { getRequestsByDoctor } from "@/lib/connectionStore";
import { getReportsByDoctor } from "@/components/connect/medicalReportStore";

const DOCTOR_ID = "doctor-demo-123";
const DOCTOR_ALERTS_KEY = "ss-maternity-doctor-alerts";
const SCHEDULES_KEY = "doctor-schedules";

interface ScheduleItem {
  id: string;
  patientName: string;
  scheduleDate: string;
  scheduleTime: string;
  scheduleType: string;
  phase: string;
  consultationMode: string;
  status: string;
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

function getTodayStr(): string {
  return new Date().toISOString().split("T")[0];
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

function loadTodayAppointments(): ScheduleItem[] {
  try {
    const raw = localStorage.getItem(SCHEDULES_KEY);
    if (raw) {
      const all: ScheduleItem[] = JSON.parse(raw);
      const today = getTodayStr();
      return all
        .filter((s) => s.scheduleDate === today && s.status !== "Cancelled")
        .sort((a, b) => a.scheduleTime.localeCompare(b.scheduleTime));
    }
  } catch {}
  return [];
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
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>(loadPatients);
  const [appointments, setAppointments] = useState<ScheduleItem[]>(loadTodayAppointments);
  const [pendingReports, setPendingReports] = useState(loadPendingReportsCount);
  const [activeAlerts, setActiveAlerts] = useState(loadActiveAlertsCount);
  const [notificationCount, setNotificationCount] = useState(0);
  const mountedRef = useRef(true);

  const totalPatients = useMemo(() => patients.length, [patients]);

  const refresh = useCallback(() => {
    if (!mountedRef.current) return;
    setPatients(loadPatients());
    setAppointments(loadTodayAppointments());
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
                <p className="text-teal-100 mt-1">Welcome back, Dr. {user?.name ?? "Doctor"}</p>
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
              <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </button>
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
            icon={Calendar}
            label="Today's Appointments"
            value={String(appointments.length)}
            color="blue"
            trend={appointments.length > 0 ? `${appointments.length} scheduled` : "No appointments today"}
          />
          <StatCard
            icon={FileText}
            label="Pending Reports"
            value={String(pendingReports)}
            color="amber"
            trend={pendingReports > 0 ? `${pendingReports} need review` : "All reviewed"}
          />
          <StatCard
            icon={AlertCircle}
            label="Active Alerts"
            value={String(activeAlerts)}
            color="red"
            trend={activeAlerts > 0 ? "Requires attention" : "No active alerts"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" />
                Today's Appointments
              </h2>
              <Link
                to="/doctor/schedules"
                className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            {appointments.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-semibold text-sm">
                        {apt.patientName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{apt.patientName}</p>
                        <p className="text-sm text-slate-500">{apt.scheduleType}{apt.consultationMode ? ` · ${apt.consultationMode}` : ""}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      {apt.scheduleTime}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-500">No appointments today</p>
                <p className="text-xs text-slate-400 mt-1">Schedule a new appointment to get started</p>
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
                  icon={AlertCircle}
                  label="Review Alerts"
                  description={activeAlerts > 0 ? `${activeAlerts} pending alerts` : "No pending alerts"}
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
