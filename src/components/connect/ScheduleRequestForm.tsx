import { useState } from "react";
import { X, Send } from "lucide-react";
import type { AppointmentReason, ConsultationMode, Priority } from "@/lib/scheduleStore";

interface FormData {
  appointmentReason: AppointmentReason;
  preferredDate: string;
  preferredTime: string;
  consultationMode: ConsultationMode;
  priority: Priority;
  notes: string;
  symptomsSummary: string;
}

interface Props {
  doctorName: string;
  onSubmit: (data: FormData) => void;
  onClose: () => void;
}

const REASONS: AppointmentReason[] = [
  "General Checkup",
  "Pregnancy Consultation",
  "Scan/Test Review",
  "Emergency Concern",
  "Medication Discussion",
  "Follow-up",
];

export default function ScheduleRequestForm({ doctorName, onSubmit, onClose }: Props) {
  const [formData, setFormData] = useState<FormData>({
    appointmentReason: "General Checkup",
    preferredDate: "",
    preferredTime: "",
    consultationMode: "In-person",
    priority: "Normal",
    notes: "",
    symptomsSummary: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.preferredDate || !formData.preferredTime) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">Request Appointment</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-slate-500">
            Requesting appointment with <span className="font-semibold text-slate-700">{doctorName}</span>
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Appointment Reason</label>
            <select
              name="appointmentReason"
              value={formData.appointmentReason}
              onChange={handleChange}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preferred Date</label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Preferred Time</label>
              <input
                type="time"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consultation Mode</label>
              <select
                name="consultationMode"
                value={formData.consultationMode}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="In-person">In-person</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="Normal">Normal</option>
                <option value="Moderate">Moderate</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any specific concerns..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Symptoms / Concern Summary (optional)</label>
            <textarea
              name="symptomsSummary"
              value={formData.symptomsSummary}
              onChange={handleChange}
              rows={2}
              placeholder="Briefly describe any symptoms or concerns..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            Send Request
          </button>
        </form>
      </div>
    </div>
  );
}
