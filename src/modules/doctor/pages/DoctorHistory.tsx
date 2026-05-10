import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { FileText, Clock, User, Stethoscope, ChevronDown, ChevronUp, Filter, PlusCircle, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getReportsByDoctor,
  updateReportStatus,
  addDoctorResponse,
  type MedicalReport,
  type SeverityLevel,
  type ReportStatus,
} from "@/components/connect/medicalReportStore";

const DOCTOR_ID = "doctor-demo-123";

const SEVERITY_ORDER: SeverityLevel[] = ["Emergency", "High", "Moderate", "Low"];

const severityConfig: Record<SeverityLevel, { border: string; badge: string }> = {
  Low: { border: "border-l-emerald-400", badge: "bg-emerald-100 text-emerald-700" },
  Moderate: { border: "border-l-amber-400", badge: "bg-amber-100 text-amber-700" },
  High: { border: "border-l-orange-400", badge: "bg-orange-100 text-orange-700" },
  Emergency: { border: "border-l-red-500", badge: "bg-red-100 text-red-700" },
};

const statusBadge: Record<ReportStatus, string> = {
  Sent: "bg-blue-100 text-blue-700",
  Viewed: "bg-slate-100 text-slate-600",
  Reviewed: "bg-teal-100 text-teal-700",
};

const severityColors: Record<SeverityLevel, string> = {
  Low: "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100",
  Moderate: "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100",
  High: "border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100",
  Emergency: "border-red-300 text-red-700 bg-red-50 hover:bg-red-100",
};

const severityActiveColors: Record<SeverityLevel, string> = {
  Low: "bg-emerald-500 text-white border-emerald-500",
  Moderate: "bg-amber-500 text-white border-amber-500",
  High: "bg-orange-500 text-white border-orange-500",
  Emergency: "bg-red-600 text-white border-red-600",
};

function loadDoctorProfile() {
  try {
    const raw = localStorage.getItem("ss-doctor-profile");
    if (raw) {
      const doc = JSON.parse(raw);
      return { name: doc.name || "Dr. Ananya Sharma", doctorCode: doc.doctorCode || "" };
    }
  } catch {}
  return { name: "Dr. Ananya Sharma", doctorCode: "" };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportCard({
  report,
  onView,
  onGenerateReport,
}: {
  report: MedicalReport;
  onView: (id: string) => void;
  onGenerateReport: (report: MedicalReport) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
    if (report.status === "Sent") {
      onView(report.id);
    }
  }, [report.id, report.status, onView]);

  const sv = severityConfig[report.severity];

  return (
    <Card className={`border-l-4 ${sv.border} shadow-sm hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <button onClick={handleToggle} className="w-full text-left">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 shrink-0">
              <FileText className="h-5 w-5 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-slate-900">{report.title}</h4>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${sv.badge}`}>
                      {report.severity}
                    </span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusBadge[report.status]}`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3 text-slate-400" />
                    <p className="text-xs text-slate-500">{report.patientName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatTime(report.timestamp)}
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Stethoscope className="h-3 w-3" />
                  {report.phase}
                </div>
                {report.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {report.symptoms.slice(0, expanded ? undefined : 3).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                    {!expanded && report.symptoms.length > 3 && (
                      <span className="text-[10px] text-teal-500 font-medium">
                        +{report.symptoms.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
            )}
          </div>
        </button>
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            {report.description && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 mb-3">
                <p className="text-xs text-slate-600">{report.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div>
                <span className="text-slate-500">Duration:</span>{" "}
                <span className="font-medium text-slate-700">{report.duration}</span>
              </div>
              <div>
                <span className="text-slate-500">Phase:</span>{" "}
                <span className="font-medium text-slate-700">{report.phase}</span>
              </div>
              {report.trimester && (
                <div>
                  <span className="text-slate-500">Trimester:</span>{" "}
                  <span className="font-medium text-slate-700">{report.trimester}</span>
                </div>
              )}
              {report.pregnancyWeek && (
                <div>
                  <span className="text-slate-500">Week:</span>{" "}
                  <span className="font-medium text-slate-700">{report.pregnancyWeek}</span>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-slate-500">Received:</span>{" "}
                <span className="font-medium text-slate-700">{formatDate(report.timestamp)}</span>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onGenerateReport(report); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:from-teal-700 hover:to-cyan-700 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Generate Report
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function GenerateReportModal({
  report,
  onClose,
  onGenerated,
}: {
  report: MedicalReport;
  onClose: () => void;
  onGenerated: () => void;
}) {
  const [title, setTitle] = useState(`Response: ${report.title}`);
  const [notes, setNotes] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [severity, setSeverity] = useState<SeverityLevel>("Moderate");
  const [followUpAdvice, setFollowUpAdvice] = useState("");
  const [suggestedNutrients, setSuggestedNutrients] = useState("");
  const [lifestyleAdvice, setLifestyleAdvice] = useState("");
  const [restRecommendation, setRestRecommendation] = useState("");
  const [hydrationReminder, setHydrationReminder] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = useCallback(() => {
    setError("");
    if (!title.trim()) { setError("Please enter a report title."); return; }
    if (!notes.trim()) { setError("Please enter doctor notes."); return; }

    const profile = loadDoctorProfile();

    addDoctorResponse({
      id: `dr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      patientName: report.patientName,
      doctorId: DOCTOR_ID,
      doctorCode: report.doctorCode || profile.doctorCode,
      doctorName: profile.name,
      basedOnReportId: report.id,
      basedOnReportTitle: report.title,
      title: title.trim(),
      notes: notes.trim(),
      recommendations: recommendations.trim(),
      severity,
      followUpAdvice: followUpAdvice.trim(),
      suggestedNutrients: suggestedNutrients.trim() || undefined,
      lifestyleAdvice: lifestyleAdvice.trim() || undefined,
      restRecommendation: restRecommendation.trim() || undefined,
      hydrationReminder: hydrationReminder.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: "Sent",
    });

    setSent(true);
    setTimeout(() => { onGenerated(); onClose(); }, 1500);
  }, [title, notes, recommendations, severity, followUpAdvice, suggestedNutrients, lifestyleAdvice, restRecommendation, hydrationReminder, report, onClose, onGenerated]);

  if (sent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <p className="text-base font-semibold text-slate-900">Report Sent to Patient</p>
          <p className="text-xs text-slate-500 mt-1">Response will appear in patient's Doctor Reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">Generate Medical Report</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="px-5 py-3 bg-teal-50 border-b border-teal-100">
          <p className="text-xs font-medium text-teal-700">
            Responding to: <span className="font-semibold">{report.title}</span> — {report.patientName}
          </p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Report Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clinical assessment for fever"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Doctor Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Clinical observations, assessment notes..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Recommendations</label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Treatment recommendations, medications, further tests..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Severity / Priority</label>
            <div className="flex flex-wrap gap-1.5">
              {SEVERITY_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeverity(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    severity === s ? severityActiveColors[s] : severityColors[s]
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Follow-up Advice</label>
            <textarea
              value={followUpAdvice}
              onChange={(e) => setFollowUpAdvice(e.target.value)}
              placeholder="When to follow up, warning signs to watch for..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400 resize-none"
            />
          </div>

          <details className="group">
            <summary className="flex items-center gap-1.5 text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-600 transition-colors">
              <PlusCircle className="w-3.5 h-3.5" />
              Optional wellness guidance
            </summary>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Suggested Nutrients</label>
                <input
                  type="text"
                  value={suggestedNutrients}
                  onChange={(e) => setSuggestedNutrients(e.target.value)}
                  placeholder="e.g. Iron, Calcium, Vitamin D"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Lifestyle Advice</label>
                <input
                  type="text"
                  value={lifestyleAdvice}
                  onChange={(e) => setLifestyleAdvice(e.target.value)}
                  placeholder="e.g. Light walking, meditation"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Rest Recommendation</label>
                <input
                  type="text"
                  value={restRecommendation}
                  onChange={(e) => setRestRecommendation(e.target.value)}
                  placeholder="e.g. Bed rest for 48 hours"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Hydration Reminder</label>
                <input
                  type="text"
                  value={hydrationReminder}
                  onChange={(e) => setHydrationReminder(e.target.value)}
                  placeholder="e.g. Drink 8-10 glasses of water daily"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400"
                />
              </div>
            </div>
          </details>

          {error && (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !notes.trim()}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              Send Report to Patient
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorHistory() {
  const [reports, setReports] = useState<MedicalReport[]>(() => getReportsByDoctor(DOCTOR_ID));
  const [filter, setFilter] = useState<"all" | SeverityLevel | "unread">("all");
  const [sortBy, setSortBy] = useState<"priority" | "newest">("priority");
  const [generateFor, setGenerateFor] = useState<MedicalReport | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(() => {
    if (mountedRef.current) {
      setReports(getReportsByDoctor(DOCTOR_ID));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const interval = setInterval(refresh, 5000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [refresh]);

  const handleView = useCallback(
    (reportId: string) => {
      updateReportStatus(reportId, "Viewed");
      refresh();
    },
    [refresh],
  );

  const filteredReports = useMemo(() => {
    let filtered = [...reports];
    if (filter === "unread") {
      filtered = filtered.filter((r) => r.status === "Sent");
    } else if (filter !== "all") {
      filtered = filtered.filter((r) => r.severity === filter);
    }
    if (sortBy === "priority") {
      filtered.sort((a, b) => {
        const orderDiff =
          SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
        if (orderDiff !== 0) return orderDiff;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
    } else {
      filtered.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    }
    return filtered;
  }, [reports, filter, sortBy]);

  const unreadCount = useMemo(
    () => reports.filter((r) => r.status === "Sent").length,
    [reports],
  );

  const filterStyle = (f: string): string => {
    if (filter !== f) return "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600";
    const map: Record<string, string> = {
      all: "bg-teal-500 text-white border-teal-500",
      Emergency: "bg-red-500 text-white border-red-500",
      High: "bg-orange-500 text-white border-orange-500",
      Moderate: "bg-amber-500 text-white border-amber-500",
      Low: "bg-emerald-500 text-white border-emerald-500",
      unread: "bg-blue-500 text-white border-blue-500",
    };
    return map[f] || map.all;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">Reports</h1>
              <p className="text-teal-100 text-sm">Patient medical reports & updates</p>
            </div>
            {unreadCount > 0 && (
              <span className="ml-auto bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            <div className="flex items-center gap-1.5">
              {(["all", "Emergency", "High", "Moderate", "Low", "unread"] as const).map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${filterStyle(f)}`}
                  >
                    {f === "all"
                      ? "All"
                      : f === "unread"
                        ? `Unread (${unreadCount})`
                        : f}
                  </button>
                ),
              )}
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
              <Filter className="w-3 h-3" />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "priority" | "newest")
                }
                className="bg-transparent border-none text-xs font-medium text-slate-500 focus:outline-none cursor-pointer"
              >
                <option value="priority">Priority</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reports</h3>
                <p className="text-slate-500 max-w-md mx-auto text-sm">
                  {filter !== "all"
                    ? "No reports match the current filter."
                    : "Reports sent by your patients will appear here."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onView={handleView}
                  onGenerateReport={setGenerateFor}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {generateFor && (
        <GenerateReportModal
          report={generateFor}
          onClose={() => setGenerateFor(null)}
          onGenerated={() => {
            updateReportStatus(generateFor.id, "Reviewed");
            refresh();
          }}
        />
      )}
    </div>
  );
}
