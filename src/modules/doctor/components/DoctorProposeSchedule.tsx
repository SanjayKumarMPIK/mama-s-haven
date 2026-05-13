import { useState } from "react";
import { X, Send, Stethoscope } from "lucide-react";
import { createScheduleRequest } from "@/lib/scheduleStore";
import type { AppointmentReason, ConsultationMode, Priority } from "@/lib/scheduleStore";

interface Props {
  doctorName: string;
  doctorCode: string;
  onClose: () => void;
  onSuccess: () => void;
}

const REASONS: AppointmentReason[] = [
  "General Checkup",
  "Pregnancy Consultation",
  "Scan/Test Review",
  "Emergency Concern",
  "Medication Discussion",
  "Follow-up",
];

const PATIENT_PHASES = ["Puberty", "Maternity", "Postpartum", "Family Planning", "Menopause"];

export default function DoctorProposeSchedule({ doctorName, doctorCode, onClose, onSuccess }: Props) {
  const [patientName, setPatientName] = useState("");
  const [phase, setPhase] = useState("Maternity");
  const [appointmentReason, setAppointmentReason] = useState<AppointmentReason>("General Checkup");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>("In-person");
  const [priority, setPriority] = useState<Priority>("Normal");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !preferredDate || !preferredTime) return;

    await createScheduleRequest({
      patientName: patientName.trim(),
      doctorName,
      phase,
      requestType: "doctor_to_user",
      appointmentReason,
      preferredDate,
      preferredTime,
      consultationMode,
      priority,
      notes,
      status: "pending",
      doctorCode,
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-gray-900">Propose Schedule to Patient</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
                placeholder="Enter patient name"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phase</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                {PATIENT_PHASES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Appointment Reason</label>
            <select
              value={appointmentReason}
              onChange={(e) => setAppointmentReason(e.target.value as AppointmentReason)}
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Proposed Date</label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Proposed Time</label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Consultation Mode</label>
              <select
                value={consultationMode}
                onChange={(e) => setConsultationMode(e.target.value as ConsultationMode)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="In-person">In-person</option>
                <option value="Online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="Normal">Normal</option>
                <option value="Moderate">Moderate</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Add notes for the patient..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all"
            >
              <Send className="w-4 h-4" />
              Send Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
