import { Calendar, Clock, MapPin, User, ChevronRight, CheckCircle2, XCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { Appointment, STATUS_CONFIG, APPOINTMENT_TYPE_LABELS, APPOINTMENT_TYPE_ICONS } from "@/lib/appointments/appointmentTypes";

interface AppointmentCardProps {
  appointment: Appointment;
  onClick: () => void;
  onMarkComplete?: (id: string) => void;
  onMarkMissed?: (id: string) => void;
}

export default function AppointmentCard({ appointment, onClick, onMarkComplete, onMarkMissed }: AppointmentCardProps) {
  const statusConfig = STATUS_CONFIG[appointment.status];
  const typeLabel = APPOINTMENT_TYPE_LABELS[appointment.type];
  const typeIcon = APPOINTMENT_TYPE_ICONS[appointment.type];

  // Format date for display
  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isUpcoming = appointment.status === "upcoming";

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] ${
        appointment.status === "completed"
          ? "bg-emerald-50/50 border-emerald-200"
          : appointment.status === "missed"
          ? "bg-red-50/50 border-red-200"
          : appointment.status === "rescheduled"
          ? "bg-amber-50/50 border-amber-200"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Type Icon */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
            appointment.status === "completed"
              ? "bg-emerald-100"
              : appointment.status === "missed"
              ? "bg-red-100"
              : appointment.status === "rescheduled"
              ? "bg-amber-100"
              : "bg-purple-100"
          }`}>
            {typeIcon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title and Type */}
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{appointment.title}</h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                {statusConfig.label}
              </span>
            </div>

            {/* Type Label */}
            <p className="text-xs text-muted-foreground mb-2">{typeLabel}</p>

            {/* Date and Time */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(appointment.date)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(appointment.time)}</span>
              </div>
            </div>

            {/* Doctor and Hospital */}
            {(appointment.doctorName || appointment.hospitalName) && (
              <div className="space-y-1">
                {appointment.doctorName && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate">{appointment.doctorName}</span>
                  </div>
                )}
                {appointment.hospitalName && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{appointment.hospitalName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Pregnancy Week Tag */}
            {appointment.pregnancyWeek && (
              <div className="mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-medium border border-purple-200">
                  Week {appointment.pregnancyWeek}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
      </div>

      {/* Quick Actions for Upcoming Appointments */}
      {isUpcoming && (onMarkComplete || onMarkMissed) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
          {onMarkComplete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete(appointment.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Complete
            </button>
          )}
          {onMarkMissed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkMissed(appointment.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-medium hover:bg-red-100 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Mark Missed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
