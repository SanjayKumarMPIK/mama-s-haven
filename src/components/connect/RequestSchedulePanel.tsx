import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  CalendarDays, Clock, MapPin, Activity, CheckCircle2,
  XCircle, RefreshCw, ChevronRight, Send, Calendar,
  AlertTriangle, Users,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ScheduleRequest, ScheduleRequestStatus, RequestType } from "@/lib/scheduleStore";
import {
  getScheduleRequestsByCode,
  updateScheduleRequestStatus,
  createScheduleRequest,
} from "@/lib/scheduleStore";
import ScheduleRequestForm from "./ScheduleRequestForm";

interface Props {
  doctorCode: string;
  doctorName: string;
  patientName: string;
  phase: string;
}

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

export default function RequestSchedulePanel({ doctorCode, doctorName, patientName, phase }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<ScheduleRequest[]>(() =>
    getScheduleRequestsByCode(doctorCode)
  );
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(() => {
    if (mountedRef.current) {
      setRequests(getScheduleRequestsByCode(doctorCode));
    }
  }, [doctorCode]);

  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(refresh, 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleFormSubmit = useCallback(
    (data: { appointmentReason: string; preferredDate: string; preferredTime: string; consultationMode: string; priority: string; notes: string; symptomsSummary: string }) => {
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

  const renderScheduleCard = (
    req: ScheduleRequest,
    actions?: React.ReactNode
  ) => (
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

  const tabs: Tab[] = ["upcoming", "pending", "incoming", "completed"];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            Request Schedule
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Request Appointment
          </button>
        </div>

        {successMsg && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {successMsg}
          </div>
        )}

        <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
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
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all",
                  activeTab === tab
                    ? "bg-teal-100 text-teal-700"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                )}
              >
                {TAB_LABELS[tab]}
                {count > 0 && (
                  <span className={cn(
                    "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]",
                    activeTab === tab ? "bg-teal-200 text-teal-800" : "bg-slate-200 text-slate-600"
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 pt-3">
        {activeTab === "upcoming" && (
          upcoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <CalendarDays className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">No schedules yet.</p>
              <p className="text-xs text-slate-400 mt-0.5">Confirmed appointments will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((req) => renderScheduleCard(req))}
            </div>
          )
        )}

        {activeTab === "pending" && (
          pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">No pending requests.</p>
              <p className="text-xs text-slate-400 mt-0.5">Waiting for doctor approval</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((req) => renderScheduleCard(req, (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Waiting for doctor approval
                </span>
              )))}
            </div>
          )
        )}

        {activeTab === "incoming" && (
          incoming.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">No incoming requests.</p>
              <p className="text-xs text-slate-400 mt-0.5">Doctor proposals will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
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
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                <Activity className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">No completed appointments.</p>
              <p className="text-xs text-slate-400 mt-0.5">Appointment history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
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
