import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, Plus, Clock, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useSchedules } from "../hooks/useSchedules";
import type { ScheduleStatus } from "../types/schedule";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const statusDot: Record<ScheduleStatus, string> = {
  Scheduled: "bg-blue-500",
  Completed: "bg-green-500",
  Cancelled: "bg-gray-400",
  Emergency: "bg-orange-500",
  Rescheduled: "bg-purple-500",
};

const statusBadge: Record<ScheduleStatus, string> = {
  Scheduled: "text-blue-600 bg-blue-50",
  Completed: "text-green-600 bg-green-50",
  Cancelled: "text-gray-400 bg-gray-50",
  Emergency: "text-orange-600 bg-orange-50",
  Rescheduled: "text-purple-600 bg-purple-50",
};

export default function DoctorCalendar() {
  const { schedules } = useSchedules();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  const today = new Date();
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const getSchedulesForDate = (dateStr: string) =>
    schedules.filter((s) => s.scheduleDate === dateStr);

  const selectedDateStr = formatDate(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate()
  );
  const selectedDateSchedules = getSchedulesForDate(selectedDateStr);

  const handlePrev = () => {
    if (viewMode === "month") {
      setViewDate(new Date(currentYear, currentMonth - 1, 1));
    } else {
      setViewDate(new Date(currentYear - 1, 0, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setViewDate(new Date(currentYear, currentMonth + 1, 1));
    } else {
      setViewDate(new Date(currentYear + 1, 0, 1));
    }
  };

  const handleToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDate(now);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setViewDate(new Date(currentYear, monthIndex, 1));
    setViewMode("month");
  };

  const renderYearView = () => (
    <div className="grid grid-cols-4 gap-2.5">
      {monthNames.map((name, index) => {
        const isCurrentMonth =
          today.getMonth() === index && today.getFullYear() === currentYear;
        return (
          <button
            key={name}
            onClick={() => handleMonthSelect(index)}
            className={cn(
              "h-20 rounded-xl text-sm font-medium transition-all duration-150 border",
              "hover:shadow-sm hover:border-teal-300 active:scale-[0.97]",
              isCurrentMonth
                ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-teal-50 hover:text-teal-700"
            )}
          >
            {name}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Calendar</h1>
              <p className="text-teal-100 text-sm">View scheduled appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border border-slate-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handlePrev}
                      className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all duration-150"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h2 className="text-lg font-semibold text-slate-800 min-w-[150px] text-center select-none tracking-tight">
                      {viewMode === "month"
                        ? `${monthNames[currentMonth]} ${currentYear}`
                        : String(currentYear)}
                    </h2>
                    <button
                      onClick={handleNext}
                      className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all duration-150"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleToday}
                      className="h-9 px-4 text-sm font-medium rounded-full border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300 transition-all duration-150"
                    >
                      Today
                    </button>
                    <div className="flex bg-slate-100 rounded-full p-0.5">
                      <button
                        onClick={() => setViewMode("month")}
                        className={cn(
                          "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-150",
                          viewMode === "month"
                            ? "bg-teal-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        Month
                      </button>
                      <button
                        onClick={() => setViewMode("year")}
                        className={cn(
                          "px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-150",
                          viewMode === "year"
                            ? "bg-teal-600 text-white shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        Year
                      </button>
                    </div>
                  </div>
                </div>

                {viewMode === "month" ? (
                  <div className="bg-slate-100 rounded-xl overflow-hidden border border-slate-100">
                    <div className="grid grid-cols-7 bg-white">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <div
                            key={day}
                            className="text-center text-xs font-medium text-slate-400 py-2.5 border-b border-slate-100"
                          >
                            {day}
                          </div>
                        )
                      )}
                    </div>
                    <div className="grid grid-cols-7 bg-slate-100 gap-px">
                      {Array.from({ length: firstDayOfMonth }, (_, i) => (
                        <div key={`empty-${i}`} className="min-h-[92px] bg-white" />
                      ))}

                      {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dateStr = formatDate(currentYear, currentMonth, day);
                        const isToday =
                          today.getDate() === day &&
                          today.getMonth() === currentMonth &&
                          today.getFullYear() === currentYear;
                        const isSelected =
                          selectedDate.getDate() === day &&
                          selectedDate.getMonth() === currentMonth &&
                          selectedDate.getFullYear() === currentYear;
                        const daySchedules = getSchedulesForDate(dateStr);

                        return (
                          <button
                            key={day}
                            onClick={() =>
                              setSelectedDate(new Date(currentYear, currentMonth, day))
                            }
                            className={cn(
                              "min-h-[92px] w-full text-left p-2 transition-colors duration-150",
                              isToday && "bg-teal-50",
                              isSelected && !isToday && "bg-blue-50",
                              !isSelected && !isToday && "bg-white hover:bg-slate-50"
                            )}
                          >
                            <span
                              className={cn(
                                "inline-flex items-center justify-center w-7 h-7 text-sm transition-colors duration-150",
                                isToday && "rounded-full ring-2 ring-teal-400 font-semibold text-teal-700",
                                isSelected && !isToday && "rounded-lg bg-blue-100 font-semibold text-blue-700",
                                !isSelected && !isToday && "text-slate-400 font-medium"
                              )}
                            >
                              {day}
                            </span>
                            {daySchedules.length > 0 && (
                              <div className="mt-1.5 space-y-1">
                                {daySchedules.slice(0, 2).map((s) => (
                                  <div
                                    key={s.id}
                                    className="flex items-center gap-1"
                                  >
                                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot[s.status])} />
                                    <span className="text-[10px] leading-tight truncate text-slate-500">
                                      {s.patientName}
                                    </span>
                                  </div>
                                ))}
                                {daySchedules.length > 2 && (
                                  <div className="text-[10px] text-slate-400 pl-2.5">
                                    +{daySchedules.length - 2} more
                                  </div>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  renderYearView()
                )}

                <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Selected Date
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    Today
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className={cn("w-2 h-2 rounded-full", statusDot.Scheduled)} />
                    Has Schedule
                  </div>
                </div>
              </CardContent>
            </Card>

            <button
              onClick={() => navigate("/doctor/schedules")}
              className="mt-4 w-full h-10 flex items-center justify-center gap-2 text-sm font-medium rounded-xl border border-teal-200 text-teal-600 hover:bg-teal-50 hover:border-teal-300 transition-all duration-150"
            >
              <Plus className="h-4 w-4" />
              Create Schedule
            </button>
          </div>

          <div>
            <Card className="rounded-2xl shadow-sm border border-slate-100">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-teal-500" />
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>

                {selectedDateSchedules.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <CalendarIcon className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">No schedules for this date</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDateSchedules.map((s) => (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all duration-150"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-800 text-sm flex items-center gap-1.5">
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusDot[s.status])} />
                            {s.patientName}
                          </h4>
                          <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", statusBadge[s.status])}>
                            {s.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                          <Clock className="h-3 w-3" />
                          <span>{s.scheduleTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <User className="h-3 w-3" />
                          <span>{s.scheduleType}</span>
                          {s.priority !== "Normal" && (
                            <span
                              className={cn(
                                "text-[11px] font-medium px-1.5 py-0.5 rounded",
                                s.priority === "Critical"
                                  ? "bg-red-50 text-red-500"
                                  : "bg-yellow-50 text-yellow-600"
                              )}
                            >
                              {s.priority}
                            </span>
                          )}
                        </div>
                        {s.notes && (
                          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                            {s.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
