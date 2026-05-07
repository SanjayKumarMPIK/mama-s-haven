import { Bell, CheckCheck, Clock, AlertCircle, Info, Calendar, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NotificationType = "appointment" | "alert" | "info" | "report";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: 1,
    type: "appointment",
    title: "Upcoming Appointment",
    message: "Priya Sharma has an appointment scheduled for today at 09:00 AM",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "alert",
    title: "Critical Lab Result",
    message: "Anita Devi's blood pressure reading is elevated (140/90). Requires follow-up.",
    time: "3 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "report",
    title: "New Report Available",
    message: "Meera Kumari's monthly health report is ready for review",
    time: "5 hours ago",
    read: true,
  },
  {
    id: 4,
    type: "info",
    title: "Medicine Reminder",
    message: "Sunita Patel needs to refill her hypertension medication",
    time: "Yesterday",
    read: true,
  },
  {
    id: 5,
    type: "appointment",
    title: "Appointment Rescheduled",
    message: "Rekha Singh has rescheduled her appointment to May 10th at 09:30 AM",
    time: "Yesterday",
    read: true,
  },
  {
    id: 6,
    type: "alert",
    title: "Missed Appointment",
    message: "Patient Kavita Rao missed her scheduled appointment on May 5th",
    time: "2 days ago",
    read: true,
  },
];

const typeConfig: Record<NotificationType, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
  appointment: { icon: Calendar, color: "text-blue-600", bgColor: "bg-blue-50" },
  alert: { icon: AlertCircle, color: "text-red-600", bgColor: "bg-red-50" },
  info: { icon: Info, color: "text-teal-600", bgColor: "bg-teal-50" },
  report: { icon: FileText, color: "text-amber-600", bgColor: "bg-amber-50" },
};

export default function DoctorNotifications() {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-teal-100 text-sm">Stay updated with patient activities</p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          {mockNotifications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {mockNotifications.map((notification) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;

                return (
                  <Card key={notification.id} className={cn("transition-all", !notification.read && "border-l-4 border-l-teal-500")}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", config.bgColor)}>
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={cn("text-sm font-semibold text-slate-900", !notification.read && "font-bold")}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            {notification.time}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
