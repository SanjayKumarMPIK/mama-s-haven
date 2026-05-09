import { useState } from "react";
import { Check, X, AlertTriangle, Calendar, Edit2 } from "lucide-react";
import type { Schedule } from "../types/schedule";

interface ScheduleActionsProps {
  schedule: Schedule;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onEmergency: (id: string) => void;
  onReschedule: (id: string, newDate: string, newTime: string) => void;
  onEdit: (schedule: Schedule) => void;
}

export default function ScheduleActions({
  schedule,
  onComplete,
  onCancel,
  onEmergency,
  onReschedule,
  onEdit,
}: ScheduleActionsProps) {
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newDate, setNewDate] = useState(schedule.scheduleDate);
  const [newTime, setNewTime] = useState(schedule.scheduleTime);

  const handleReschedule = () => {
    if (newDate && newTime) {
      onReschedule(schedule.id, newDate, newTime);
      setShowRescheduleModal(false);
    }
  };

  const isCompleted = schedule.status === "Completed";
  const isCancelled = schedule.status === "Cancelled";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!isCompleted && !isCancelled && (
          <>
            <button
              onClick={() => onComplete(schedule.id)}
              className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              Complete
            </button>
            <button
              onClick={() => onEmergency(schedule.id)}
              className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              <AlertTriangle className="w-4 h-4" />
              Emergency
            </button>
            <button
              onClick={() => setShowRescheduleModal(true)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <Calendar className="w-4 h-4" />
              Reschedule
            </button>
            <button
              onClick={() => onEdit(schedule)}
              className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onCancel(schedule.id)}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </>
        )}
        {isCompleted && (
          <span className="text-sm text-green-600 font-medium">✓ Completed</span>
        )}
        {isCancelled && (
          <span className="text-sm text-gray-600 font-medium">✕ Cancelled</span>
        )}
      </div>

      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reschedule Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Time
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReschedule}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
