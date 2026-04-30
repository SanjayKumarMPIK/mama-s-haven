import { useState } from "react";
import { X, Calendar, Clock, User, MapPin, FileText, Bell } from "lucide-react";
import { AppointmentType, ReminderType, APPOINTMENT_TYPE_LABELS, REMINDER_TYPE_LABELS } from "@/lib/appointments/appointmentTypes";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: {
    title: string;
    type: AppointmentType;
    date: string;
    time: string;
    doctorName?: string;
    hospitalName?: string;
    notes?: string;
    pregnancyWeek?: number;
    reminderType: ReminderType;
  }) => void;
}

export default function AddAppointmentModal({ isOpen, onClose, onSave }: AddAppointmentModalProps) {
  const { currentWeek } = usePregnancyProfile();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<AppointmentType>("doctor_consultation");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [notes, setNotes] = useState("");
  const [pregnancyWeek, setPregnancyWeek] = useState(currentWeek || undefined);
  const [reminderType, setReminderType] = useState<ReminderType>("1_day_before");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) return;

    onSave({
      title: title.trim(),
      type,
      date,
      time,
      doctorName: doctorName.trim() || undefined,
      hospitalName: hospitalName.trim() || undefined,
      notes: notes.trim() || undefined,
      pregnancyWeek,
      reminderType,
    });

    // Reset form
    setTitle("");
    setType("doctor_consultation");
    setDate("");
    setTime("");
    setDoctorName("");
    setHospitalName("");
    setNotes("");
    setPregnancyWeek(currentWeek || undefined);
    setReminderType("1_day_before");
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setTitle("");
    setType("doctor_consultation");
    setDate("");
    setTime("");
    setDoctorName("");
    setHospitalName("");
    setNotes("");
    setPregnancyWeek(currentWeek || undefined);
    setReminderType("1_day_before");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold">Add Appointment</h2>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Appointment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Monthly Checkup"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Appointment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AppointmentType)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {Object.entries(APPOINTMENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Doctor Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Doctor Name
            </label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Dr. Smith"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Hospital Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              Hospital/Clinic Name
            </label>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="City Hospital"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Pregnancy Week */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Pregnancy Week (Optional)
            </label>
            <input
              type="number"
              value={pregnancyWeek || ""}
              onChange={(e) => setPregnancyWeek(e.target.value ? parseInt(e.target.value) : undefined)}
              min="1"
              max="42"
              placeholder="Auto-filled from profile"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Bell className="w-4 h-4" />
              Reminder
            </label>
            <select
              value={reminderType}
              onChange={(e) => setReminderType(e.target.value as ReminderType)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              {Object.entries(REMINDER_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !date || !time}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
