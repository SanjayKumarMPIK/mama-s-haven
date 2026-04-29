import { useState } from "react";
import { X, Calendar, Clock, User, MapPin, FileText, Bell, Edit3, Trash2, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { Appointment, AppointmentStatus, STATUS_CONFIG, APPOINTMENT_TYPE_LABELS, APPOINTMENT_TYPE_ICONS, REMINDER_TYPE_LABELS } from "@/lib/appointments/appointmentTypes";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: string) => void;
  onMarkComplete: (id: string) => void;
  onMarkMissed: (id: string) => void;
  onReschedule: (id: string, newDate: string, newTime: string) => void;
}

export default function AppointmentDetailModal({
  isOpen,
  appointment,
  onClose,
  onEdit,
  onDelete,
  onMarkComplete,
  onMarkMissed,
  onReschedule,
}: AppointmentDetailModalProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  if (!isOpen || !appointment) return null;

  const statusConfig = STATUS_CONFIG[appointment.status];
  const typeLabel = APPOINTMENT_TYPE_LABELS[appointment.type];
  const typeIcon = APPOINTMENT_TYPE_ICONS[appointment.type];

  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleReschedule = () => {
    if (!newDate || !newTime) return;
    onReschedule(appointment.id, newDate, newTime);
    setIsRescheduling(false);
    setNewDate("");
    setNewTime("");
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      onDelete(appointment.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Appointment Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Title and Type */}
          <div className="flex items-start gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0 ${
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
            <div className="flex-1">
              <h3 className="font-bold text-lg">{appointment.title}</h3>
              <p className="text-sm text-muted-foreground">{typeLabel}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border mt-2 ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Date</p>
                <p className="text-sm font-medium">{formatDate(appointment.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground">Time</p>
                <p className="text-sm font-medium">{formatTime(appointment.time)}</p>
              </div>
            </div>
          </div>

          {/* Doctor and Hospital */}
          {(appointment.doctorName || appointment.hospitalName) && (
            <div className="space-y-2">
              {appointment.doctorName && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Doctor</p>
                    <p className="text-sm font-medium">{appointment.doctorName}</p>
                  </div>
                </div>
              )}
              {appointment.hospitalName && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Hospital/Clinic</p>
                    <p className="text-sm font-medium">{appointment.hospitalName}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Pregnancy Week */}
          {appointment.pregnancyWeek && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 border border-purple-200">
              <span className="text-2xl">🤰</span>
              <div>
                <p className="text-[10px] text-purple-600">Pregnancy Week</p>
                <p className="text-sm font-semibold text-purple-700">Week {appointment.pregnancyWeek}</p>
              </div>
            </div>
          )}

          {/* Reminder */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] text-muted-foreground">Reminder</p>
              <p className="text-sm font-medium">{REMINDER_TYPE_LABELS[appointment.reminderType]}</p>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <p className="text-[10px] text-muted-foreground">Notes</p>
              </div>
              <p className="text-sm leading-relaxed">{appointment.notes}</p>
            </div>
          )}

          {/* Reschedule Form */}
          {isRescheduling && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <p className="text-sm font-semibold text-amber-900">Reschedule Appointment</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">New Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">New Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReschedule}
                  disabled={!newDate || !newTime}
                  className="flex-1 px-3 py-2 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors disabled:opacity-40"
                >
                  Confirm Reschedule
                </button>
                <button
                  onClick={() => {
                    setIsRescheduling(false);
                    setNewDate("");
                    setNewTime("");
                  }}
                  className="px-3 py-2 rounded-lg border border-amber-300 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-2">
            {appointment.status === "upcoming" && (
              <>
                <button
                  onClick={() => onMarkComplete(appointment.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Completed
                </button>
                <button
                  onClick={() => onMarkMissed(appointment.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Mark as Missed
                </button>
                <button
                  onClick={() => setIsRescheduling(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reschedule
                </button>
              </>
            )}
            <button
              onClick={() => onEdit(appointment)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit Appointment
            </button>
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
