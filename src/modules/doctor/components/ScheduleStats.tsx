import { Calendar, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface ScheduleStatsProps {
  todayCount: number;
  upcomingCount: number;
  emergencyCount: number;
  completedThisWeekCount: number;
}

export default function ScheduleStats({
  todayCount,
  upcomingCount,
  emergencyCount,
  completedThisWeekCount,
}: ScheduleStatsProps) {
  const stats = [
    {
      label: "Today's Schedules",
      value: todayCount,
      icon: Calendar,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Upcoming Schedules",
      value: upcomingCount,
      icon: Clock,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Emergency Cases",
      value: emergencyCount,
      icon: AlertCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
    },
    {
      label: "Completed This Week",
      value: completedThisWeekCount,
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.bgColor} rounded-xl p-6 border border-gray-200`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${stat.textColor}`}>{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.textColor} mt-2`}>{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
