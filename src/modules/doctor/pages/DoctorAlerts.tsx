import { useState, useEffect, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Eye,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const DOCTOR_ALERTS_KEY = "ss-maternity-doctor-alerts";

type AlertPriority = "green" | "yellow" | "orange" | "red";
type AlertStatus = "active" | "reviewed" | "resolved";

interface DoctorAlert {
  id: string;
  patientName: string;
  symptomName: string | null;
  triggerType: string;
  priority: AlertPriority;
  symptomCount: number;
  consecutiveDays: number;
  timestamp: number;
  maternityPhase: string;
  alertStatus: AlertStatus;
}

const priorityConfig: Record<AlertPriority, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  cardBorder: string;
  badgeClass: string;
  iconBg: string;
  iconColor: string;
}> = {
  red: {
    label: "Critical",
    icon: ShieldAlert,
    cardBorder: "border-l-red-500",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  orange: {
    label: "High",
    icon: AlertTriangle,
    cardBorder: "border-l-orange-500",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  yellow: {
    label: "Moderate",
    icon: AlertTriangle,
    cardBorder: "border-l-amber-400",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  green: {
    label: "Low",
    icon: AlertCircle,
    cardBorder: "border-l-green-500",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
};

const statusConfig: Record<AlertStatus, { label: string; badge: string }> = {
  active: { label: "Active", badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  reviewed: { label: "Reviewed", badge: "bg-blue-100 text-blue-700 border-blue-200" },
  resolved: { label: "Resolved", badge: "bg-slate-100 text-slate-600 border-slate-200" },
};

const priorityOrder: Record<AlertPriority, number> = { red: 0, orange: 1, yellow: 2, green: 3 };

const triggerLabels: Record<string, string> = {
  consecutive_symptoms: "Consecutive Days Symptom Pattern",
  weekly_frequency: "Weekly Symptom Frequency Alert",
  monthly_frequency: "Monthly Symptom Frequency Alert",
  high_risk_monthly_frequency: "High Risk: Critical Monthly Frequency",
};

function getTriggerLabel(triggerType: string): string {
  return triggerLabels[triggerType] ?? triggerType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimestamp(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(ts).toLocaleDateString();
}

function loadDoctorAlerts(): DoctorAlert[] {
  try {
    const raw = localStorage.getItem(DOCTOR_ALERTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((a: Partial<DoctorAlert>) => ({
        id: a.id || `ALT-${a.timestamp}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        patientName: a.patientName || "Unknown",
        symptomName: a.symptomName || null,
        triggerType: a.triggerType || "unknown",
        priority: (a.priority && ["green", "yellow", "orange", "red"].includes(a.priority) ? a.priority : "green") as AlertPriority,
        symptomCount: a.symptomCount || 0,
        consecutiveDays: a.consecutiveDays || 0,
        timestamp: a.timestamp || Date.now(),
        maternityPhase: a.maternityPhase || "maternity",
        alertStatus: (a.alertStatus && ["active", "reviewed", "resolved"].includes(a.alertStatus) ? a.alertStatus : "active") as AlertStatus,
      }));
    }
  } catch {
    /* ignore */
  }
  return [];
}

type FilterType = "all" | "green" | "yellow" | "orange" | "red" | "active" | "resolved";

const filterDefs: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "red", label: "Critical" },
  { key: "orange", label: "High" },
  { key: "yellow", label: "Moderate" },
  { key: "green", label: "Low" },
  { key: "active", label: "Active" },
  { key: "resolved", label: "Resolved" },
];

const priorityFilterColors: Record<string, string> = {
  all: "bg-slate-900 text-white border-slate-900",
  red: "bg-red-100 text-red-700 border-red-400",
  orange: "bg-orange-100 text-orange-700 border-orange-400",
  yellow: "bg-amber-100 text-amber-700 border-amber-400",
  green: "bg-green-100 text-green-700 border-green-400",
  active: "bg-emerald-100 text-emerald-700 border-emerald-400",
  resolved: "bg-slate-100 text-slate-600 border-slate-300",
};

const priorityFilterInactive = "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";

export default function DoctorAlerts() {
  const [alerts, setAlerts] = useState<DoctorAlert[]>(() => loadDoctorAlerts());
  const [filter, setFilter] = useState<FilterType>("all");

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === DOCTOR_ALERTS_KEY) {
        setAlerts(loadDoctorAlerts());
      }
    };
    const interval = setInterval(() => {
      const fresh = loadDoctorAlerts();
      setAlerts((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(fresh)) return fresh;
        return prev;
      });
    }, 3000);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const saveAlerts = (updated: DoctorAlert[]) => {
    setAlerts(updated);
    try {
      localStorage.setItem(DOCTOR_ALERTS_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const filteredAlerts = useMemo(() => {
    let result = [...alerts];
    switch (filter) {
      case "green":
        result = result.filter((a) => a.priority === "green");
        break;
      case "yellow":
        result = result.filter((a) => a.priority === "yellow");
        break;
      case "orange":
        result = result.filter((a) => a.priority === "orange");
        break;
      case "red":
        result = result.filter((a) => a.priority === "red");
        break;
      case "active":
        result = result.filter((a) => a.alertStatus === "active");
        break;
      case "resolved":
        result = result.filter((a) => a.alertStatus === "resolved");
        break;
    }
    result.sort((a, b) => {
      const pa = priorityOrder[a.priority] ?? 99;
      const pb = priorityOrder[b.priority] ?? 99;
      if (pa !== pb) return pa - pb;
      return b.timestamp - a.timestamp;
    });
    return result;
  }, [alerts, filter]);

  const updateStatus = (alertId: string, newStatus: AlertStatus) => {
    saveAlerts(alerts.map((a) => (a.id === alertId ? { ...a, alertStatus: newStatus } : a)));
  };

  const activeCount = alerts.filter((a) => a.alertStatus === "active").length;

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
                <p className="text-red-100 text-sm">
                  Symptom escalation alerts from maternity patients
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
              {activeCount} Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterDefs.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  filter === f.key ? priorityFilterColors[f.key] : priorityFilterInactive
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Alert List */}
          {filteredAlerts.length > 0 ? (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => {
                const pConfig = priorityConfig[alert.priority];
                const sConfig = statusConfig[alert.alertStatus];
                const Icon = pConfig.icon;
                return (
                  <Card
                    key={alert.id}
                    className={cn(
                      "border-l-4",
                      pConfig.cardBorder,
                      alert.alertStatus === "resolved" && "opacity-60"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                            pConfig.iconBg
                          )}
                        >
                          <Icon className={cn("h-5 w-5", pConfig.iconColor)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {alert.patientName}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {alert.symptomName || "General Symptom Activity"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge className={pConfig.badgeClass}>
                                {pConfig.label}
                              </Badge>
                              <Badge className={sConfig.badge}>{sConfig.label}</Badge>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                            <span className="font-medium">
                              {getTriggerLabel(alert.triggerType)}
                            </span>
                            <span>
                              {alert.symptomCount}x in {alert.consecutiveDays} days
                            </span>
                            <span className="text-slate-400 capitalize">
                              {alert.maternityPhase}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(alert.timestamp)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {alert.alertStatus === "active" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => updateStatus(alert.id, "reviewed")}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    Mark Reviewed
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50"
                                    onClick={() => updateStatus(alert.id, "resolved")}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Resolve
                                  </Button>
                                </>
                              )}
                              {alert.alertStatus === "reviewed" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs"
                                    onClick={() => updateStatus(alert.id, "active")}
                                  >
                                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                    Keep Active
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs text-green-700 border-green-200 hover:bg-green-50"
                                    onClick={() => updateStatus(alert.id, "resolved")}
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                    Resolve
                                  </Button>
                                </>
                              )}
                              {alert.alertStatus === "resolved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs text-blue-700 border-blue-200 hover:bg-blue-50"
                                  onClick={() => updateStatus(alert.id, "active")}
                                >
                                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                                  Reactivate
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {filter === "all" ? "All Clear!" : "No Matching Alerts"}
                </h3>
                <p className="text-slate-500">
                  {filter === "all"
                    ? "No alerts at this time."
                    : `No alerts match the selected filter.`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
