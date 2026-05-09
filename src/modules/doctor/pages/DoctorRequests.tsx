import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  FileText, Clock, CheckCircle2, XCircle, User, Calendar,
  Stethoscope, Send, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  getRequestsByDoctor,
  updateRequestStatus,
  type ConnectionRequest,
  type ConnectionStatus,
} from "@/lib/connectionStore";
import {
  getReportsByDoctor,
  updateReportStatus,
  type MedicalReport,
  type SeverityLevel,
} from "@/components/connect/medicalReportStore";

const DOCTOR_ID = "doctor-demo-123";

const statusConfig: Record<ConnectionStatus, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { color: "text-amber-700", bgColor: "bg-amber-50", icon: Clock },
  accepted: { color: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle2 },
  rejected: { color: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

const reportSeverityConfig: Record<SeverityLevel, { border: string; badge: string }> = {
  Low: { border: "border-l-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
  Moderate: { border: "border-l-amber-400", badge: "bg-amber-100 text-amber-700" },
  High: { border: "border-l-orange-400", badge: "bg-orange-100 text-orange-700" },
  Emergency: { border: "border-l-red-500", badge: "bg-red-100 text-red-700" },
};

const SEVERITY_ORDER: SeverityLevel[] = ["Emergency", "High", "Moderate", "Low"];

function ReportCard({ report }: { report: MedicalReport }) {
  const [expanded, setExpanded] = useState(false);
  const sv = reportSeverityConfig[report.severity];

  return (
    <Card className={`border-l-4 ${sv.border}`}>
      <CardContent className="p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 shrink-0">
              <Send className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{report.title}</h4>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${sv.badge}`}>{report.severity}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3 text-slate-400" />
                    <p className="text-xs text-slate-500">{report.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatDate(report.timestamp)}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Stethoscope className="h-3 w-3" />
                  {report.phase}
                </div>
                {report.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {report.symptoms.slice(0, 3).map((s) => (
                      <span key={s} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">{s}</span>
                    ))}
                    {report.symptoms.length > 3 && <span className="text-[10px] text-teal-500 font-medium">+{report.symptoms.length - 3}</span>}
                  </div>
                )}
              </div>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />}
          </div>
        </button>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            {report.description && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 mb-3">
                <p className="text-xs text-slate-600">{report.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">Duration:</span> <span className="font-medium text-slate-700">{report.duration}</span></div>
              {report.trimester && <div><span className="text-slate-500">Trimester:</span> <span className="font-medium text-slate-700">{report.trimester}</span></div>}
              {report.pregnancyWeek && <div><span className="text-slate-500">Week:</span> <span className="font-medium text-slate-700">{report.pregnancyWeek}</span></div>}
              <div className="col-span-2">
                <span className="text-slate-500">Received:</span>{" "}
                <span className="font-medium text-slate-700">{new Date(report.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DoctorRequests() {
  const [activeFilter, setActiveFilter] = useState<ConnectionStatus | "all">("all");
  const [requests, setRequests] = useState<ConnectionRequest[]>(() =>
    getRequestsByDoctor(DOCTOR_ID),
  );
  const [reports, setReports] = useState<MedicalReport[]>(() => getReportsByDoctor(DOCTOR_ID));
  const [reportFilter, setReportFilter] = useState<"all" | SeverityLevel>("all");
  const mountedRef = useRef(true);

  const refresh = useCallback(() => {
    if (mountedRef.current) {
      setRequests(getRequestsByDoctor(DOCTOR_ID));
      setReports(getReportsByDoctor(DOCTOR_ID));
    }
  }, []);

  // Poll for new/changed requests every 5 seconds
  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(refresh, 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  const handleAccept = useCallback((id: string) => {
    updateRequestStatus(id, "accepted");
    refresh();
  }, [refresh]);

  const handleReject = useCallback((id: string) => {
    updateRequestStatus(id, "rejected");
    refresh();
  }, [refresh]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const filteredRequests = activeFilter === "all"
    ? requests
    : requests.filter((r) => r.status === activeFilter);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">Requests</h1>
                <p className="text-teal-100 text-sm">Patient connection requests</p>
              </div>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-amber-400/20 text-white border-0 text-sm px-3 py-1">
                {pendingCount} Pending
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              size="sm"
              variant={activeFilter === "all" ? "default" : "outline"}
              onClick={() => setActiveFilter("all")}
              className={activeFilter === "all" ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              All ({requests.length})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "pending" ? "default" : "outline"}
              onClick={() => setActiveFilter("pending")}
              className={activeFilter === "pending" ? "bg-amber-600 hover:bg-amber-700" : ""}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "accepted" ? "default" : "outline"}
              onClick={() => setActiveFilter("accepted")}
              className={activeFilter === "accepted" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Accepted ({requests.filter((r) => r.status === "accepted").length})
            </Button>
            <Button
              size="sm"
              variant={activeFilter === "rejected" ? "default" : "outline"}
              onClick={() => setActiveFilter("rejected")}
              className={activeFilter === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Rejected ({requests.filter((r) => r.status === "rejected").length})
            </Button>
          </div>

          {/* Requests List */}
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">No requests found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((request) => {
                const config = statusConfig[request.status];
                const Icon = config.icon;
                return (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", config.bgColor)}>
                          <Icon className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-slate-900">Connection Request</h4>
                                <Badge className={cn("text-xs", config.bgColor, config.color, "border-0")}>
                                  {request.status === "accepted" ? "approved" : request.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                <User className="h-3 w-3 text-slate-400" />
                                <p className="text-xs text-slate-500">{request.patientName}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
                              <Clock className="h-3 w-3" />
                              {formatDate(request.createdAt)}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Stethoscope className="h-3 w-3" />
                              {request.patientPhase}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              {new Date(request.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </div>
                          </div>

                          {request.status === "pending" && (
                            <div className="flex items-center gap-2 mt-3">
                              <Button
                                size="sm"
                                className="h-8 bg-green-600 hover:bg-green-700 text-xs"
                                onClick={() => handleAccept(request.id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => handleReject(request.id)}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Medical Reports Section */}
        <div className="max-w-2xl mx-auto mt-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
              <Send className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Medical Reports</h2>
              <p className="text-xs text-slate-500">Reports sent by your patients</p>
            </div>
            {reports.length > 0 && (
              <Badge className="ml-auto bg-teal-100 text-teal-700 border-0 text-xs">
                {reports.length} total
              </Badge>
            )}
          </div>

          {/* Severity filter */}
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
            {(["all", ...SEVERITY_ORDER] as const).map((f) => (
              <button
                key={f}
                onClick={() => setReportFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                  reportFilter === f
                    ? "bg-teal-500 text-white border-teal-500"
                    : "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>

          {/* Reports list - prioritized by severity */}
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Send className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">No medical reports yet</p>
                <p className="text-xs text-slate-400 mt-1">Patient reports will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {(reportFilter === "all" ? SEVERITY_ORDER : [reportFilter]).flatMap((sev) =>
                reports
                  .filter((r) => reportFilter === "all" ? r.severity === sev : r.severity === sev)
                  .map((report) => (
                    <div key={report.id}>
                      {/* Severity group header */}
                      {reportFilter === "all" && (
                        <div className="flex items-center gap-2 mb-1 mt-3 first:mt-0">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{sev}</span>
                          <div className="flex-1 h-px bg-slate-100" />
                        </div>
                      )}
                      <ReportCard report={report} />
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
