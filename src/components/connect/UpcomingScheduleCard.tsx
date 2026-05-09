import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, MapPin, ChevronRight } from "lucide-react";
import { getScheduleRequestsByCode } from "@/lib/scheduleStore";

interface Props {
  doctorCode: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function UpcomingScheduleCard({ doctorCode }: Props) {
  const navigate = useNavigate();
  const [requests, setRequests] = useState(() => getScheduleRequestsByCode(doctorCode));
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

  const upcoming = useMemo(
    () => requests.filter(
      (r) => (r.status === "confirmed" || r.status === "accepted") && r.preferredDate >= new Date().toISOString().split("T")[0]
    ),
    [requests]
  );

  if (upcoming.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-900 mb-3">Upcoming Schedule</h3>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
            <CalendarDays className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-gray-500">No upcoming schedules</p>
          <p className="text-xs text-gray-400 mt-0.5">Book an appointment to see your doctor</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">Upcoming Schedule</h3>
        <button
          onClick={() => navigate("/request-schedule")}
          className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-0.5"
        >
          View all
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-3">
        {upcoming.slice(0, 2).map((s) => (
          <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">{s.appointmentReason}</p>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                  Confirmed
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {formatDate(s.preferredDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {s.preferredTime}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                {s.consultationMode}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
