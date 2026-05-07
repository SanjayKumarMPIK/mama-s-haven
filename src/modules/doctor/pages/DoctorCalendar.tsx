import { useState } from "react";
import { Calendar as CalendarIcon, Plus, X, Clock, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Mock appointments data
const mockAppointments = [
  { id: 1, date: "2026-05-07", title: "Routine Checkup", patient: "Priya Sharma", time: "09:00 AM", notes: "Monthly prenatal checkup" },
  { id: 2, date: "2026-05-07", title: "Postpartum Review", patient: "Anita Devi", time: "10:30 AM", notes: "6-week postpartum examination" },
  { id: 3, date: "2026-05-08", title: "Consultation", patient: "Meera Kumari", time: "11:45 AM", notes: "Family planning consultation" },
  { id: 4, date: "2026-05-09", title: "Follow-up", patient: "Sunita Patel", time: "02:00 PM", notes: "Menopause symptom follow-up" },
  { id: 5, date: "2026-05-10", title: "Vaccination", patient: "Rekha Singh", time: "09:30 AM", notes: "HPV vaccination" },
];

const timeSlots = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
];

export default function DoctorCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    patient: "",
    time: "",
    notes: "",
    date: "",
  });

  const today = new Date();
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getAppointmentsForDate = (dateStr: string) => {
    return mockAppointments.filter(apt => apt.date === dateStr);
  };

  const selectedDateStr = formatDate(currentYear, currentMonth, selectedDate.getDate());
  const selectedDateAppointments = getAppointmentsForDate(selectedDateStr);

  const handlePrevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleScheduleAppointment = () => {
    if (newAppointment.title && newAppointment.patient && newAppointment.time) {
      // In future: API call to save appointment
      alert(`Appointment scheduled: ${newAppointment.title} with ${newAppointment.patient} at ${newAppointment.time}`);
      setNewAppointment({ title: "", patient: "", time: "", notes: "", date: "" });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Calendar</h1>
              <p className="text-teal-100 text-sm">Manage your appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button variant="outline" onClick={handlePrevMonth}>
                    ← Prev
                  </Button>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {monthNames[currentMonth]} {currentYear}
                  </h2>
                  <Button variant="outline" onClick={handleNextMonth}>
                    Next →
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDayOfMonth }, (_, i) => (
                    <div key={`empty-${i}`} className="h-10" />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const dateStr = formatDate(currentYear, currentMonth, day);
                    const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                    const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear;
                    const hasAppointments = getAppointmentsForDate(dateStr).length > 0;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day))}
                        className={cn(
                          "h-10 rounded-lg text-sm font-medium transition-colors relative",
                          isToday && "bg-teal-100 text-teal-700",
                          isSelected && !isToday && "bg-teal-600 text-white",
                          !isSelected && !isToday && "hover:bg-slate-100 text-slate-700",
                        )}
                      >
                        {day}
                        {hasAppointments && (
                          <span className={cn(
                            "absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full",
                            isSelected ? "bg-white" : "bg-teal-500"
                          )} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Schedule Appointment Button */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 w-full bg-teal-600 hover:bg-teal-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Schedule New Appointment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Appointment Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Routine Checkup"
                      value={newAppointment.title}
                      onChange={(e) => setNewAppointment({ ...newAppointment, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient">Patient Name</Label>
                    <Input
                      id="patient"
                      placeholder="e.g., Priya Sharma"
                      value={newAppointment.patient}
                      onChange={(e) => setNewAppointment({ ...newAppointment, patient: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <select
                      id="time"
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                    >
                      <option value="">Select time</option>
                      {timeSlots.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes..."
                      value={newAppointment.notes}
                      onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleScheduleAppointment} className="w-full bg-teal-600 hover:bg-teal-700">
                    Schedule Appointment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Appointments for Selected Date */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-teal-600" />
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>

                {selectedDateAppointments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p>No appointments scheduled</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateAppointments.map((apt) => (
                      <div key={apt.id} className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900 text-sm">{apt.title}</h4>
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {apt.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                          <User className="h-3.5 w-3.5" />
                          {apt.patient}
                        </div>
                        {apt.notes && (
                          <div className="flex items-start gap-2 text-xs text-slate-500">
                            <FileText className="h-3.5 w-3.5 mt-0.5" />
                            {apt.notes}
                          </div>
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
