import type { Schedule } from "../types/schedule";
import ScheduleActions from "./ScheduleActions";

interface ScheduleCardProps {
  schedule: Schedule;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onEmergency: (id: string) => void;
  onReschedule: (id: string, newDate: string, newTime: string) => void;
  onEdit: (schedule: Schedule) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Completed":
      return "bg-green-100 text-green-700 border-green-200";
    case "Cancelled":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Emergency":
      return "bg-red-100 text-red-700 border-red-200";
    case "Rescheduled":
      return "bg-purple-100 text-purple-700 border-purple-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Normal":
      return "text-gray-600";
    case "Moderate":
      return "text-yellow-600";
    case "Critical":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

export default function ScheduleCard({
  schedule,
  onComplete,
  onCancel,
  onEmergency,
  onReschedule,
  onEdit,
}: ScheduleCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{schedule.patientName}</h3>
          <p className="text-sm text-gray-500">{schedule.phase}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(schedule.status)}`}>
          {schedule.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Date</p>
          <p className="text-sm font-medium text-gray-900">{schedule.scheduleDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Time</p>
          <p className="text-sm font-medium text-gray-900">{schedule.scheduleTime}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Type</p>
          <p className="text-sm font-medium text-gray-900">{schedule.scheduleType}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Mode</p>
          <p className="text-sm font-medium text-gray-900">{schedule.consultationMode}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Priority</p>
          <p className={`text-sm font-medium ${getPriorityColor(schedule.priority)}`}>
            {schedule.priority}
          </p>
        </div>
        {schedule.status === "Emergency" && (
          <div className="flex items-center gap-1 text-red-600">
            <span className="text-xs font-medium">⚠️ Emergency</span>
          </div>
        )}
      </div>

      {schedule.notes && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">{schedule.notes}</p>
        </div>
      )}

      <ScheduleActions
        schedule={schedule}
        onComplete={onComplete}
        onCancel={onCancel}
        onEmergency={onEmergency}
        onReschedule={onReschedule}
        onEdit={onEdit}
      />
    </div>
  );
}
