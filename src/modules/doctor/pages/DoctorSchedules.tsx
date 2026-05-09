import { useState } from "react";
import { Plus, Calendar, AlertTriangle } from "lucide-react";
import { useSchedules } from "../hooks/useSchedules";
import ScheduleStats from "../components/ScheduleStats";
import ScheduleForm from "../components/ScheduleForm";
import ScheduleFilters from "../components/ScheduleFilters";
import ScheduleCard from "../components/ScheduleCard";
import type { Schedule, ScheduleFormData } from "../types/schedule";

export default function DoctorSchedules() {
  const {
    schedules,
    isLoading,
    createSchedule,
    updateSchedule,
    markComplete,
    markCancelled,
    markEmergency,
    reschedule,
    getTodaySchedules,
    getUpcomingSchedules,
    getEmergencySchedules,
    getCompletedThisWeek,
    getFilteredSchedules,
  } = useSchedules();

  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "today" | "completed" | "emergency" | "critical">("all");

  const handleCreateSchedule = (formData: ScheduleFormData) => {
    createSchedule(formData);
  };

  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const handleUpdateSchedule = (formData: ScheduleFormData) => {
    if (editingSchedule) {
      updateSchedule(editingSchedule.id, formData);
      setEditingSchedule(null);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  const displayedSchedules = getFilteredSchedules(activeFilter);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading schedules...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
              <p className="text-gray-600 mt-1">Manage your appointment schedules</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Schedule
            </button>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mb-8">
          <ScheduleStats
            todayCount={getTodaySchedules().length}
            upcomingCount={getUpcomingSchedules().length}
            emergencyCount={getEmergencySchedules().length}
            completedThisWeekCount={getCompletedThisWeek().length}
          />
        </div>

        {/* Upcoming Soon Section */}
        {activeFilter === "all" && getEmergencySchedules().length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Emergency Cases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getEmergencySchedules().map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onComplete={markComplete}
                  onCancel={markCancelled}
                  onEmergency={markEmergency}
                  onReschedule={reschedule}
                  onEdit={handleEditSchedule}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="mb-6">
          <ScheduleFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Schedules List */}
        <div>
          {displayedSchedules.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No schedules found</h3>
              <p className="text-gray-600">
                {activeFilter === "all"
                  ? "No schedules created yet. Create your first schedule to get started."
                  : `No ${activeFilter} schedules found.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedSchedules.map((schedule) => (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onComplete={markComplete}
                  onCancel={markCancelled}
                  onEmergency={markEmergency}
                  onReschedule={reschedule}
                  onEdit={handleEditSchedule}
                />
              ))}
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <ScheduleForm
            onSubmit={editingSchedule ? handleUpdateSchedule : handleCreateSchedule}
            onClose={handleCloseForm}
            initialData={editingSchedule || undefined}
          />
        )}
      </div>
    </div>
  );
}
