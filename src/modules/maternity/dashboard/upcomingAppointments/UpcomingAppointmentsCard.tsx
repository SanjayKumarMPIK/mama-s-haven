// ─── Upcoming Appointments Card ───────────────────────────────────────────────
// Displays upcoming appointments from Care Log for pregnancy dashboard
// STRICTLY isolated to Maternity Phase only

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppointments } from "@/hooks/useAppointments";
import { ChevronRight, Calendar } from "lucide-react";

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMonth(dateISO: string): string {
  const date = new Date(dateISO + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
}

function formatDay(dateISO: string): string {
  const date = new Date(dateISO + "T12:00:00");
  return date.getDate().toString();
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function UpcomingAppointmentsCard() {
  const { upcomingAppointments } = useAppointments();
  const todayISO = getTodayISO();

  const displayAppointments = useMemo(() => {
    // Filter for future appointments only
    const futureAppointments = upcomingAppointments.filter(
      (apt) => apt.date >= todayISO
    );
    
    // Sort by nearest date first
    const sorted = [...futureAppointments].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    
    // Return max 2 appointments
    return sorted.slice(0, 2);
  }, [upcomingAppointments, todayISO]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shadow-sm border border-purple-100">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-bold text-base">Upcoming Appointments</h2>
          </div>
        </div>
        <Link
          to="/medicine-reminder"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </div>

      {displayAppointments.length === 0 ? (
        <div className="text-center py-6">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted-foreground mb-1">No upcoming appointments</p>
          <p className="text-[10px] text-muted-foreground">Add your next check-up</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayAppointments.map((appointment) => (
            <Link
              key={appointment.id}
              to="/medicine-reminder"
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-3 hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              {/* Date Tile */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-50 to-white flex flex-col items-center justify-center shrink-0 shadow-sm border border-purple-100/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600">
                  {formatMonth(appointment.date)}
                </span>
                <span className="text-lg font-black text-purple-900 leading-tight">
                  {formatDay(appointment.date)}
                </span>
              </div>

              {/* Appointment Details */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-foreground truncate">
                  {appointment.title}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground truncate mt-0.5">
                  {appointment.doctorName || appointment.hospitalName || "No doctor specified"}
                </p>
                <p className="text-[11px] font-medium text-primary mt-1 flex items-center gap-1">
                  {formatTime(appointment.time)}
                </p>
              </div>

              {/* Chevron */}
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
