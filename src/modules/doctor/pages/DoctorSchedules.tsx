import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Calendar, AlertTriangle, Stethoscope, Clock, CheckCircle2, XCircle, User, FileText, Activity } from "lucide-react";
import { useSchedules } from "../hooks/useSchedules";
import ScheduleStats from "../components/ScheduleStats";
import ScheduleForm from "../components/ScheduleForm";
import ScheduleFilters from "../components/ScheduleFilters";
import ScheduleCard from "../components/ScheduleCard";
import DoctorProposeSchedule from "../components/DoctorProposeSchedule";
import type { Schedule, ScheduleFormData } from "../types/schedule";
import {
  getDoctorScheduleRequestsByCode,
  updateScheduleRequestStatus,
  type ScheduleRequest,
} from "@/lib/scheduleStore";

function loadDoctorInfo(): { name: string; code: string } {
  try {
    const raw = localStorage.getItem("ss-doctor-profile");
    if (raw) {
      const p = JSON.parse(raw);
      return { name: p.name || "Your Doctor", code: p.doctorCode || "" };
    }
  } catch { /* ignore */ }
  return { name: "Your Doctor", code: "" };
}

const PRIORITY_STYLES: Record<string, string> = {
  Normal: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/30",
  Moderate: "bg-amber-100 text-amber-700 ring-1 ring-amber-300/30",
  Urgent: "bg-red-100 text-red-700 ring-1 ring-red-300/30",
};

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending Doctor Approval", classes: "bg-amber-100 text-amber-700 ring-1 ring-amber-300/30" },
  confirmed: { label: "Confirmed", classes: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/30" },
  declined: { label: "Declined", classes: "bg-red-100 text-red-700 ring-1 ring-red-300/30" },
  accepted: { label: "Accepted", classes: "bg-blue-100 text-blue-700 ring-1 ring-blue-300/30" },
  rescheduled: { label: "Rescheduled", classes: "bg-purple-100 text-purple-700 ring-1 ring-purple-300/30" },
  completed: { label: "Completed", classes: "bg-slate-100 text-slate-600 ring-1 ring-slate-300/30" },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

type DoctorTab = "my-schedules" | "requested";
type RequestTab = "pending" | "confirmed" | "declined";

export default function DoctorSchedules() {
  const {
    schedules,
    isLoading,
    createSchedule,
    updateSchedule,
    markComplete,
    markCancelled,
    markEmergency,
    reschedule,
    getTodaySchedules,
    getUpcomingSchedules,
    getEmergencySchedules,
    getCompletedThisWeek,
    getFilteredSchedules,
  } = useSchedules();

  const [showForm, setShowForm] = useState(false);
  const [showPropose, setShowPropose] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "today" | "completed" | "emergency" | "critical">("all");
  const [proposeSuccess, setProposeSuccess] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState<ScheduleRequest[]>([]);
  const [allPatientRequests, setAllPatientRequests] = useState<ScheduleRequest[]>([]);
  const mountedRef = useRef(true);
  const doctorInfo = loadDoctorInfo();

  const [activeTab, setActiveTab] = useState<DoctorTab>("my-schedules");
  const [requestTab, setRequestTab] = useState<RequestTab>("pending");

  useEffect(() => {
    if (!doctorInfo.code) return;
    mountedRef.current = true;
    const load = async () => {
      if (mountedRef.current) {
        const allRequests = (await getDoctorScheduleRequestsByCode(doctorInfo.code)).filter(
          (r) => r.requestType === "user_to_doctor"
        );
        if (mountedRef.current) {
          setAllPatientRequests(allRequests);
          setIncomingRequests(allRequests.filter((r) => r.status === "pending"));
        }
      }
    };
    void load();
    const interval = setInterval(() => void load(), 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [doctorInfo.code]);

  const handleAcceptRequest = useCallback(async (id: string) => {
    await updateScheduleRequestStatus(id, "confirmed", true);
    setAllPatientRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "confirmed" as const } : r))
    );
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleDeclineRequest = useCallback(async (id: string) => {
    await updateScheduleRequestStatus(id, "declined", true);
    setAllPatientRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "declined" as const } : r))
    );
    setIncomingRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleCreateSchedule = (formData: ScheduleFormData) => {
    createSchedule(formData);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleUpdateSchedule = (formData: ScheduleFormData) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, formData);
      setEditingSchedule(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  const displayedSchedules = getFilteredSchedules(activeFilter);

  const filteredRequests = allPatientRequests.filter((r) => {
    if (requestTab === "pending") return r.status === "pending";
    if (requestTab === "confirmed") return r.status === "confirmed";
    return r.status === "declined" || r.status === "completed";
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading schedules...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
              <p className="text-gray-600 mt-1">Manage your appointment schedules</p>
            </div>
            {activeTab === "my-schedules" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPropose(true)}
                  className="flex items-center gap-2 px-4 py-3 border border-teal-300 text-teal-700 rounded-lg hover:bg-teal-50 transition-colors font-medium text-sm"
                >
                  <Stethoscope className="w-4 h-4" />
                  Propose to Patient
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Schedule
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab("my-schedules")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "my-schedules"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            My Schedules
          </button>
          <button
            onClick={() => setActiveTab("requested")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "requested"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-4 h-4" />
            Requested Schedules
            {incomingRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white text-blue-600">
                {incomingRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* My Schedules Tab */}
        {activeTab === "my-schedules" && (
          <>
            {/* Statistics Section */}
            <div className="mb-8">
              <ScheduleStats
                todayCount={getTodaySchedules().length}
                upcomingCount={getUpcomingSchedules().length}
                emergencyCount={getEmergencySchedules().length}
                completedThisWeekCount={getCompletedThisWeek().length}
              />
            </div>

            {/* Upcoming Soon Section */}
            {activeFilter === "all" && getEmergencySchedules().length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Emergency Cases
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getEmergencySchedules().map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onComplete={markComplete}
                      onCancel={markCancelled}
                      onEmergency={markEmergency}
                      onReschedule={reschedule}
                      onEdit={handleEditSchedule}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Filters Section */}
            <div className="mb-6">
              <ScheduleFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            </div>

            {/* Schedules List */}
            <div>
              {displayedSchedules.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No schedules found</h3>
                  <p className="text-gray-600">
                    {activeFilter === "all"
                      ? "No schedules created yet. Create your first schedule to get started."
                      : `No ${activeFilter} schedules found.`}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedSchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onComplete={markComplete}
                      onCancel={markCancelled}
                      onEmergency={markEmergency}
                      onReschedule={reschedule}
                      onEdit={handleEditSchedule}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Requested Schedules Tab */}
        {activeTab === "requested" && (
          <div>
            {/* Sub-tabs for request status filtering */}
            <div className="flex items-center gap-2 mb-6">
              {(["pending", "confirmed", "declined"] as const).map((tab) => {
                const count = allPatientRequests.filter((r) => {
                  if (tab === "pending") return r.status === "pending";
                  if (tab === "confirmed") return r.status === "confirmed";
                  return r.status === "declined" || r.status === "completed";
                }).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setRequestTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      requestTab === tab
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab === "pending" ? "Pending" : tab === "confirmed" ? "Confirmed" : "Declined"}
                    {count > 0 && (
                      <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                        requestTab === tab ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {filteredRequests.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {requestTab === "pending"
                    ? "No pending requests"
                    : requestTab === "confirmed"
                    ? "No confirmed requests"
                    : "No declined requests"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {requestTab === "pending"
                    ? "Patient appointment requests will appear here"
                    : requestTab === "confirmed"
                    ? "Accepted requests will appear here"
                    : "Declined requests will appear here"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRequests.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Top row: patient name + status badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {req.patientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">{req.patientName}</p>
                          <p className="text-[11px] text-gray-500 truncate">{req.phase}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[req.priority] || "bg-gray-100 text-gray-600"}`}>
                          {req.priority}
                        </span>
                      </div>
                    </div>

                    {/* Reason */}
                    <p className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-gray-400" />
                      {req.appointmentReason}
                    </p>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDate(req.preferredDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{req.preferredTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 text-gray-400 flex items-center justify-center text-[10px]">
                          {req.consultationMode === "Online" ? "📹" : "🏥"}
                        </span>
                        <span>{req.consultationMode}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[req.status]?.classes || "bg-gray-100 text-gray-600"}`}>
                          {STATUS_CONFIG[req.status]?.label || req.status}
                        </span>
                      </div>
                    </div>

                    {/* Notes preview */}
                    {req.notes && (
                      <div className="mb-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{req.notes}</p>
                      </div>
                    )}

                    {/* Bottom row: timestamp + actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-[10px] text-gray-400">{formatDateTime(req.createdAt)}</span>
                      {req.status === "pending" && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[11px] font-semibold hover:bg-slate-50 transition-colors"
                          >
                            <XCircle className="w-3 h-3" />
                            Reject
                          </button>
                        </div>
                      )}
                      {(req.status === "confirmed" || req.status === "declined") && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          req.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}>
                          {req.status === "confirmed" ? "Accepted" : "Rejected"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Proposal Success Message */}
        {proposeSuccess && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold animate-in slide-in-from-bottom duration-200">
            Schedule proposal sent to patient
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <ScheduleForm
            onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
            onClose={handleCloseForm}
            initialData={editingSchedule || undefined}
          />
        )}

        {/* Propose Schedule Modal */}
        {showPropose && doctorInfo.code && (
          <DoctorProposeSchedule
            doctorName={doctorInfo.name}
            doctorCode={doctorInfo.code}
            onClose={() => setShowPropose(false)}
            onSuccess={() => {
              setProposeSuccess(true);
              setTimeout(() => setProposeSuccess(false), 3000);
            }}
          />
        )}
      </div>
    </div>
  );
}
