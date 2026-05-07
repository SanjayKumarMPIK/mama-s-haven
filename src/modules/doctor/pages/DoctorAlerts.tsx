import { AlertCircle, AlertTriangle, ShieldAlert, X, CheckCircle2, Clock, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AlertSeverity = "critical" | "high" | "medium" | "low";

interface Alert {
  id: number;
  severity: AlertSeverity;
  title: string;
  patient: string;
  message: string;
  time: string;
  dismissed: boolean;
}

const mockAlerts: Alert[] = [
  {
    id: 1,
    severity: "critical",
    title: "Critical BP Reading",
    patient: "Anita Devi",
    message: "Blood pressure elevated at 160/95. Immediate follow-up required.",
    time: "10 minutes ago",
    dismissed: false,
  },
  {
    id: 2,
    severity: "high",
    title: "Missed Appointment",
    patient: "Kavita Rao",
    message: "Patient missed scheduled appointment on May 5th. No response to reminders.",
    time: "2 hours ago",
    dismissed: false,
  },
  {
    id: 3,
    severity: "high",
    title: "Abnormal Lab Results",
    patient: "Sunita Patel",
    message: "Cholesterol levels significantly elevated (280 mg/dL). Requires consultation.",
    time: "3 hours ago",
    dismissed: false,
  },
  {
    id: 4,
    severity: "medium",
    title: "Medication Refill Due",
    patient: "Meera Kumari",
    message: "Birth control prescription expires in 3 days. Patient has not requested refill.",
    time: "5 hours ago",
    dismissed: false,
  },
  {
    id: 5,
    severity: "medium",
    title: "Follow-up Overdue",
    patient: "Priya Sharma",
    message: "6-week postpartum checkup was due yesterday. Patient not contacted.",
    time: "Yesterday",
    dismissed: true,
  },
  {
    id: 6,
    severity: "low",
    title: "Vaccination Due",
    patient: "Rekha Singh",
    message: "HPV vaccination second dose due next week. Send reminder.",
    time: "2 days ago",
    dismissed: true,
  },
];

const severityConfig: Record<AlertSeverity, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string; badge: string }> = {
  critical: { icon: ShieldAlert, color: "text-red-700", bgColor: "bg-red-50", badge: "bg-red-100 text-red-700" },
  high: { icon: AlertTriangle, color: "text-orange-700", bgColor: "bg-orange-50", badge: "bg-orange-100 text-orange-700" },
  medium: { icon: AlertCircle, color: "text-amber-700", bgColor: "bg-amber-50", badge: "bg-amber-100 text-amber-700" },
  low: { icon: AlertCircle, color: "text-blue-700", bgColor: "bg-blue-50", badge: "bg-blue-100 text-blue-700" },
};

export default function DoctorAlerts() {
  const activeAlerts = mockAlerts.filter(a => !a.dismissed);
  const dismissedAlerts = mockAlerts.filter(a => a.dismissed);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">Alerts</h1>
                <p className="text-red-100 text-sm">Critical patient alerts and notifications</p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
              {activeAlerts.length} Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h2 className="text-lg font-semibold text-slate-900">Active Alerts</h2>
              </div>
              <div className="space-y-3">
                {activeAlerts.map((alert) => {
                  const config = severityConfig[alert.severity];
                  const Icon = config.icon;
                  return (
                    <Card key={alert.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", config.bgColor)}>
                            <Icon className={cn("h-5 w-5", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{alert.patient}</p>
                              </div>
                              <Badge className={config.badge}>{alert.severity}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{alert.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock className="h-3 w-3" />
                                {alert.time}
                              </div>
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dismissed Alerts */}
          {dismissedAlerts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-semibold text-slate-900">Dismissed</h2>
              </div>
              <div className="space-y-3">
                {dismissedAlerts.map((alert) => {
                  const config = severityConfig[alert.severity];
                  const Icon = config.icon;
                  return (
                    <Card key={alert.id} className="opacity-60">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", config.bgColor)}>
                            <Icon className={cn("h-5 w-5", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-semibold text-slate-900">{alert.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{alert.patient}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">Dismissed</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-2">{alert.message}</p>
                            <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              {alert.time}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {mockAlerts.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">All Clear!</h3>
                <p className="text-slate-500">No active alerts at this time.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
