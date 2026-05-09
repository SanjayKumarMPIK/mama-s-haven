import { Users, Calendar, FileText, AlertCircle, Search, Clock, ChevronRight, Bell, Stethoscope } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const mockPatients = [
  { id: 1, name: "Priya Sharma", age: 28, phase: "Maternity", lastVisit: "2025-05-02", status: "Active", avatar: "PS" },
  { id: 2, name: "Anita Devi", age: 32, phase: "Postpartum", lastVisit: "2025-05-04", status: "Follow-up", avatar: "AD" },
  { id: 3, name: "Meera Kumari", age: 24, phase: "Family Planning", lastVisit: "2025-05-01", status: "Active", avatar: "MK" },
  { id: 4, name: "Sunita Patel", age: 48, phase: "Menopause", lastVisit: "2025-04-28", status: "Monitoring", avatar: "SP" },
  { id: 5, name: "Rekha Singh", age: 22, phase: "Puberty", lastVisit: "2025-05-05", status: "Active", avatar: "RS" },
];

const mockAppointments = [
  { id: 1, time: "09:00 AM", patient: "Priya Sharma", type: "Routine Checkup" },
  { id: 2, time: "10:30 AM", patient: "Anita Devi", type: "Postpartum Review" },
  { id: 3, time: "11:45 AM", patient: "Meera Kumari", type: "Consultation" },
  { id: 4, time: "02:00 PM", patient: "Sunita Patel", type: "Follow-up" },
];

const statusColors: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "Follow-up": "bg-amber-100 text-amber-700",
  Monitoring: "bg-blue-100 text-blue-700",
};

export default function DoctorDashboard() {
  const { user } = useAuth();

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
              <button className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium hover:bg-white/30 transition-colors max-sm:hidden">
                <Search className="h-4 w-4" />
                Search Patient
              </button>
              <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">3</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Patients" value="248" color="teal" trend="+12 this month" />
          <StatCard icon={Calendar} label="Today's Appointments" value="8" color="blue" trend="4 remaining" />
          <StatCard icon={FileText} label="Pending Reports" value="5" color="amber" trend="2 due today" />
          <StatCard icon={AlertCircle} label="Active Alerts" value="3" color="red" trend="Requires attention" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-teal-600" />
                Today's Appointments
              </h2>
              <Link to="#" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {mockAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700 font-semibold text-sm">
                      {apt.patient.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{apt.patient}</p>
                      <p className="text-sm text-slate-500">{apt.type}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">{apt.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <QuickAction icon={Users} label="View All Patients" description="Browse patient records" />
              <QuickAction icon={Calendar} label="Schedule Appointment" description="Book new consultations" />
              <QuickAction icon={FileText} label="Generate Reports" description="Create health summaries" />
              <QuickAction icon={AlertCircle} label="Review Alerts" description="Pending notifications" />
            </div>
          </div>
        </div>

        {/* Recent Patients */}
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Recent Patients</h2>
            <Link to="#" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
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
                {mockPatients.map((patient) => (
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
    <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-left group">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </button>
  );
}
