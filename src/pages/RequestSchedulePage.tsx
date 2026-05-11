import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Clock, MapPin, Activity, CheckCircle2,
  XCircle, RefreshCw, ArrowLeft, Send, Calendar,
  Users, Stethoscope,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getRequestByCode } from "@/lib/connectionStore";
import type { ScheduleRequest, ScheduleRequestStatus } from "@/lib/scheduleStore";
import {
  getScheduleRequestsByCode,
  updateScheduleRequestStatus,
  createScheduleRequest,
} from "@/lib/scheduleStore";
import ScheduleRequestForm from "@/components/connect/ScheduleRequestForm";

type Tab = "upcoming" | "pending" | "incoming" | "completed";

const TAB_LABELS: Record<Tab, string> = {
  upcoming: "Upcoming Schedules",
  pending: "Pending Requests",
  incoming: "Incoming Requests",
  completed: "Completed",
};

const STATUS_BADGE: Record<ScheduleRequestStatus, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", classes: "bg-blue-100 text-blue-700" },
  declined: { label: "Declined", classes: "bg-red-100 text-red-700" },
  confirmed: { label: "Confirmed", classes: "bg-emerald-100 text-emerald-700" },
  rescheduled: { label: "Rescheduled", classes: "bg-purple-100 text-purple-700" },
  completed: { label: "Completed", classes: "bg-slate-100 text-slate-600" },
};

const PRIORITY_BADGE: Record<string, string> = {
  Normal: "bg-slate-100 text-slate-600",
  Moderate: "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
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
  return `${diffDays}d ago`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function loadProfile() {
  let doctorCode = "";
  let doctorName = "Your Doctor";
  let patientName = "Patient";
  let phase = "Maternity";

  try {
    const docRaw = localStorage.getItem("ss-doctor-profile");
    if (docRaw) {
      const doc = JSON.parse(docRaw);
      doctorCode = doc.doctorCode || "";
      doctorName = doc.name || "Your Doctor";
    }
  } catch { /* ignore */ }

  try {
    const userRaw = localStorage.getItem("swasthyasakhi_user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      patientName = user.basic?.fullName || "Patient";
      phase = user.health?.lifeStage || "Maternity";
    }
  } catch { /* ignore */ }

  return { doctorCode, doctorName, patientName, phase };
}

export default function RequestSchedulePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const { doctorCode, doctorName, patientName, phase } = useMemo(() => loadProfile(), []);

  const isConnected = useMemo(() => {
    if (!doctorCode) return false;
    try {
      const req = getRequestByCode(doctorCode);
      return req?.status === "accepted";
    } catch { return false; }
  }, [doctorCode]);

  const [requests, setRequests] = useState<ScheduleRequest[]>(() =>
    doctorCode ? getScheduleRequestsByCode(doctorCode) : []
  );

  const refresh = useCallback(() => {
    if (mountedRef.current && doctorCode) {
      setRequests(getScheduleRequestsByCode(doctorCode));
    }
  }, [doctorCode]);

  useEffect(() => {
    mountedRef.current = true;
    if (!doctorCode) return;
    const interval = setInterval(refresh, 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [doctorCode, refresh]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleFormSubmit = useCallback(
    (data: { appointmentReason: string; preferredDate: string; preferredTime: string; consultationMode: string; priority: string; notes: string; symptomsSummary: string }) => {
      if (!doctorCode) return;
      createScheduleRequest({
        patientName,
        doctorName,
        phase,
        requestType: "user_to_doctor",
        appointmentReason: data.appointmentReason as any,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        consultationMode: data.consultationMode as any,
        priority: data.priority as any,
        notes: data.notes,
        symptomsSummary: data.symptomsSummary || undefined,
        status: "pending",
        doctorCode,
      });
      setShowForm(false);
      setSuccessMsg("Appointment request sent successfully.");
      refresh();
    },
    [doctorCode, doctorName, patientName, phase, refresh]
  );

  const handleAccept = useCallback(
    (id: string) => {
      updateScheduleRequestStatus(id, "confirmed");
      refresh();
    },
    [refresh]
  );

  const handleDecline = useCallback(
    (id: string) => {
      updateScheduleRequestStatus(id, "declined");
      refresh();
    },
    [refresh]
  );

  const handleReschedule = useCallback(
    (id: string) => {
      updateScheduleRequestStatus(id, "rescheduled");
      refresh();
    },
    [refresh]
  );

  const upcoming = useMemo(
    () => requests.filter((r) => r.status === "confirmed" && r.preferredDate >= new Date().toISOString().split("T")[0]),
    [requests]
  );

  const pending = useMemo(
    () => requests.filter((r) => r.status === "pending" && r.requestType === "user_to_doctor"),
    [requests]
  );

  const incoming = useMemo(
    () => requests.filter((r) => (r.status === "pending" || r.status === "rescheduled") && r.requestType === "doctor_to_user"),
    [requests]
  );

  const completed = useMemo(
    () => requests.filter((r) => r.status === "completed" || (r.status === "confirmed" && r.preferredDate < new Date().toISOString().split("T")[0])),
    [requests]
  );

  function renderScheduleCard(req: ScheduleRequest, actions?: React.ReactNode) {
    return (
      <Card key={req.id} className="rounded-xl shadow-sm border border-slate-100">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">{req.appointmentReason}</p>
              <p className="text-xs text-slate-500">
                {req.requestType === "doctor_to_user" ? `${req.doctorName} proposed` : req.patientName}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", STATUS_BADGE[req.status].classes)}>
                {STATUS_BADGE[req.status].label}
              </span>
              {req.priority !== "Normal" && (
                <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", PRIORITY_BADGE[req.priority])}>
                  {req.priority}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
            <span className="flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {formatDate(req.preferredDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {req.preferredTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {req.consultationMode}
            </span>
          </div>

          {req.notes && (
            <p className="text-xs text-slate-400 mt-2 bg-slate-50 rounded-lg p-2">{req.notes}</p>
          )}

          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
            <span>{formatDateTime(req.createdAt)}</span>
            {req.symptomsSummary && (
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {req.symptomsSummary}
              </span>
            )}
          </div>

          {actions && <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">{actions}</div>}
        </CardContent>
      </Card>
    );
  }

  const tabs: Tab[] = ["upcoming", "pending", "incoming", "completed"];

  if (!doctorCode) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
          <div className="container py-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Request Schedule</h1>
          </div>
        </div>
        <div className="container py-16 text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-600">Connect with a doctor to request schedules.</p>
          <button
            onClick={() => navigate("/connect")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            Go to My Doctor
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
          <div className="container py-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Request Schedule</h1>
          </div>
        </div>
        <div className="container py-16 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-600">Connect with a doctor to request schedules.</p>
          <p className="text-sm text-slate-400 mt-1">Your connection request is still pending or was declined.</p>
          <button
            onClick={() => navigate("/connect")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            Go to My Doctor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6" />
              <div>
                <h1 className="text-2xl font-bold">Request Schedule</h1>
                <p className="text-teal-100 text-sm">Book and manage appointment requests with {doctorName}</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              Request Appointment
            </button>
          </div>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {successMsg && (
          <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const count =
              tab === "upcoming" ? upcoming.length :
              tab === "pending" ? pending.length :
              tab === "incoming" ? incoming.length :
              completed.length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
                  activeTab === tab
                    ? "bg-teal-100 text-teal-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
              >
                {TAB_LABELS[tab]}
                {count > 0 && (
                  <span className={cn(
                    "ml-2 px-1.5 py-0.5 rounded-full text-xs",
                    activeTab === tab ? "bg-teal-200 text-teal-800" : "bg-slate-200 text-slate-600"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "upcoming" && (
          upcoming.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CalendarDays className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No schedules yet.</p>
              <p className="text-xs text-slate-400 mt-1">Confirmed appointments will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((req) => renderScheduleCard(req))}
            </div>
          )
        )}

        {activeTab === "pending" && (
          pending.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No pending requests.</p>
              <p className="text-xs text-slate-400 mt-1">Waiting for doctor approval</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pending.map((req) => renderScheduleCard(req,
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Waiting for doctor approval
                </span>
              ))}
            </div>
          )
        )}

        {activeTab === "incoming" && (
          incoming.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No incoming requests.</p>
              <p className="text-xs text-slate-400 mt-1">Doctor proposals will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incoming.map((req) =>
                renderScheduleCard(req, (
                  <>
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDecline(req.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                      Decline
                    </button>
                    <button
                      onClick={() => handleReschedule(req.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reschedule
                    </button>
                  </>
                ))
              )}
            </div>
          )
        )}

        {activeTab === "completed" && (
          completed.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Activity className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No completed appointments.</p>
              <p className="text-xs text-slate-400 mt-1">Appointment history will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map((req) => renderScheduleCard(req))}
            </div>
          )
        )}
      </div>

      {showForm && (
        <ScheduleRequestForm
          doctorName={doctorName}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
