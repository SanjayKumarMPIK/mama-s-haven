import { useState, useCallback, useMemo } from "react";
import { Send, FileText, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Clock, Eye, Stethoscope, User } from "lucide-react";
import { KEY_SYMPTOMS_BY_PHASE } from "@/lib/symptomAnalysis";
import {
  addReport, getAllReports, getAvailableCredits, deductCredits, getCreditCost,
  getDoctorResponsesByCode, updateDoctorResponseStatus,
  DURATION_OPTIONS, type SeverityLevel, type DoctorResponse,
} from "./medicalReportStore";

interface Props {
  doctorCode: string;
  doctorName: string;
}

const SEVERITIES: { level: SeverityLevel; color: string; activeColor: string; label: string }[] = [
  { level: "Low", color: "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100", activeColor: "bg-emerald-500 text-white border-emerald-500", label: "Low" },
  { level: "Moderate", color: "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100", activeColor: "bg-amber-500 text-white border-amber-500", label: "Moderate" },
  { level: "High", color: "border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100", activeColor: "bg-orange-500 text-white border-orange-500", label: "High" },
  { level: "Emergency", color: "border-red-200 text-red-700 bg-red-50 hover:bg-red-100", activeColor: "bg-red-600 text-white border-red-600", label: "Emergency" },
];

const severityBadge: Record<SeverityLevel, string> = {
  Low: "bg-emerald-100 text-emerald-700",
  Moderate: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  Emergency: "bg-red-100 text-red-700",
};

function loadUserProfile() {
  try {
    const raw = localStorage.getItem("swasthyasakhi_user");
    if (raw) {
      const user = JSON.parse(raw);
      return {
        name: user.basic?.fullName || "Patient",
        phase: user.health?.lifeStage || "maternity",
        trimester: user.health?.trimester || undefined,
        pregnancyWeek: user.health?.pregnancyWeek || undefined,
      };
    }
  } catch { }
  try {
    const raw = localStorage.getItem("mh-profile");
    if (raw) {
      const mh = JSON.parse(raw);
      return {
        name: "Patient",
        phase: mh.phase || "maternity",
        trimester: mh.currentTrimester || undefined,
        pregnancyWeek: mh.pregnancyWeek || undefined,
      };
    }
  } catch { }
  return { name: "Patient", phase: "maternity", trimester: undefined, pregnancyWeek: undefined };
}

function getPhaseKey(phase: string): string {
  const p = phase.toLowerCase();
  if (p === "postpartum" || p === "maternity_postpartum") return "maternity_postpartum";
  if (p === "puberty") return "puberty";
  if (p === "family-planning" || p === "family planning") return "family-planning";
  if (p === "menopause") return "menopause";
  return "maternity";
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ReportCard({ report, onClose }: { report: { id: string; title: string; symptoms: string[]; severity: SeverityLevel; duration: string; description: string; phase: string; trimester?: number; pregnancyWeek?: number; timestamp: string; doctorName: string; status: string }; onClose?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const sv = severityBadge[report.severity] || "bg-slate-100 text-slate-700";

  return (
    <div className={`rounded-xl border border-slate-100 border-l-4 ${report.severity === "Emergency" ? "border-l-red-500" : report.severity === "High" ? "border-l-orange-400" : report.severity === "Moderate" ? "border-l-amber-400" : "border-l-emerald-400"} bg-white shadow-sm`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 shrink-0 mt-0.5">
          <FileText className="h-4 w-4 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{report.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${sv}`}>{report.severity}</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{report.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap shrink-0">
              <Clock className="w-3 h-3" />
              {formatTime(report.timestamp)}
            </div>
          </div>
          {report.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {report.symptoms.slice(0, expanded ? undefined : 3).map((s) => (
                <span key={s} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">{s}</span>
              ))}
              {!expanded && report.symptoms.length > 3 && (
                <span className="text-[10px] text-teal-500 font-medium">+{report.symptoms.length - 3} more</span>
              )}
            </div>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-50">
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-slate-500">Duration:</span> <span className="font-medium text-slate-700">{report.duration}</span></div>
            <div><span className="text-slate-500">Phase:</span> <span className="font-medium text-slate-700">{report.phase}</span></div>
            {report.trimester && <div><span className="text-slate-500">Trimester:</span> <span className="font-medium text-slate-700">{report.trimester}</span></div>}
            {report.pregnancyWeek && <div><span className="text-slate-500">Week:</span> <span className="font-medium text-slate-700">{report.pregnancyWeek}</span></div>}
            <div className="col-span-2"><span className="text-slate-500">Sent:</span> <span className="font-medium text-slate-700">{formatDate(report.timestamp)}</span></div>
          </div>
          {report.description && (
            <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-600">{report.description}</p>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <Eye className="w-3 h-3" />
            Sent to <strong>{report.doctorName}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

function DoctorResponseCard({ response }: { response: DoctorResponse }) {
  const [expanded, setExpanded] = useState(false);
  const sv = severityBadge[response.severity] || "bg-slate-100 text-slate-700";

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
    if (response.status === "Sent") {
      updateDoctorResponseStatus(response.id, "Viewed");
    }
  }, [response.id, response.status]);

  return (
    <div className={`rounded-xl border border-slate-100 border-l-4 ${response.severity === "Emergency" ? "border-l-red-500" : response.severity === "High" ? "border-l-orange-400" : response.severity === "Moderate" ? "border-l-amber-400" : "border-l-emerald-400"} bg-gradient-to-r from-teal-50/30 to-white shadow-sm`}>
      <button
        onClick={handleToggle}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600/10 shrink-0 mt-0.5">
          <Stethoscope className="h-4 w-4 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-900 truncate">{response.title}</p>
                <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-200 shrink-0">Doctor</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${sv}`}>{response.severity}</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{response.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 whitespace-nowrap shrink-0">
              <Clock className="w-3 h-3" />
              {formatTime(response.createdAt)}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <User className="w-3 h-3 text-slate-400" />
            <span className="text-[11px] text-slate-500">{response.doctorName}</span>
          </div>
          {response.basedOnReportTitle && (
            <div className="flex items-center gap-1 mt-1">
              <Eye className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-400">Based on: <span className="font-medium text-slate-500">{response.basedOnReportTitle}</span></span>
            </div>
          )}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-50">
          {response.notes && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold text-slate-500 mb-1">Doctor Notes</p>
              <div className="p-3 rounded-lg bg-white border border-slate-100">
                <p className="text-xs text-slate-600">{response.notes}</p>
              </div>
            </div>
          )}
          {response.recommendations && (
            <div className="mt-2">
              <p className="text-[11px] font-semibold text-slate-500 mb-1">Recommendations</p>
              <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
                <p className="text-xs text-teal-700">{response.recommendations}</p>
              </div>
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {response.followUpAdvice && <div className="col-span-2"><span className="text-slate-500">Follow-up:</span> <span className="font-medium text-slate-700">{response.followUpAdvice}</span></div>}
            {response.suggestedNutrients && <div><span className="text-slate-500">Nutrients:</span> <span className="font-medium text-slate-700">{response.suggestedNutrients}</span></div>}
            {response.lifestyleAdvice && <div><span className="text-slate-500">Lifestyle:</span> <span className="font-medium text-slate-700">{response.lifestyleAdvice}</span></div>}
            {response.restRecommendation && <div><span className="text-slate-500">Rest:</span> <span className="font-medium text-slate-700">{response.restRecommendation}</span></div>}
            {response.hydrationReminder && <div><span className="text-slate-500">Hydration:</span> <span className="font-medium text-slate-700">{response.hydrationReminder}</span></div>}
            <div className="col-span-2"><span className="text-slate-500">Received:</span> <span className="font-medium text-slate-700">{formatDate(response.createdAt)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function SendReportTab({ doctorCode, doctorName, onSent }: { doctorCode: string; doctorName: string; onSent: () => void }) {
  const [title, setTitle] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [severity, setSeverity] = useState<SeverityLevel | null>(null);
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const profile = useMemo(() => loadUserProfile(), []);
  const credits = useMemo(() => getAvailableCredits(), [sent]);
  const phaseKey = useMemo(() => getPhaseKey(profile.phase), [profile.phase]);
  const availableSymptoms = useMemo(() => KEY_SYMPTOMS_BY_PHASE[phaseKey] || KEY_SYMPTOMS_BY_PHASE.maternity, [phaseKey]);

  const phaseLabel = useMemo(() => {
    const map: Record<string, string> = {
      puberty: "Puberty",
      maternity: "Maternity",
      "family-planning": "Family Planning",
      menopause: "Menopause",
      maternity_postpartum: "Postpartum",
    };
    return map[phaseKey] || "Maternity";
  }, [phaseKey]);

  const toggleSymptom = useCallback((symptomLabel: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomLabel) ? prev.filter((s) => s !== symptomLabel) : [...prev, symptomLabel],
    );
  }, []);

  const handleSubmit = useCallback(() => {
    setError("");
    if (!title.trim()) { setError("Please enter a report title."); return; }
    if (selectedSymptoms.length === 0) { setError("Please select at least one symptom."); return; }
    if (!severity) { setError("Please select a severity level."); return; }
    if (!duration) { setError("Please select duration."); return; }
    const cost = getCreditCost(severity);
    if (credits < cost) { setError(`Not enough report credits. Need ${cost} credit${cost > 1 ? "s" : ""}, have ${credits}.`); return; }
    if (!deductCredits(severity)) { setError("Not enough report credits."); return; }
    addReport({
      id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      symptoms: selectedSymptoms,
      severity,
      duration,
      description: description.trim(),
      phase: phaseLabel,
      trimester: profile.trimester,
      pregnancyWeek: profile.pregnancyWeek,
      patientName: profile.name,
      doctorCode,
      doctorId: "doctor-demo-123",
      doctorName,
      timestamp: new Date().toISOString(),
      status: "Sent",
    });
    setSent(true);
    setTitle("");
    setSelectedSymptoms([]);
    setSeverity(null);
    setDuration("");
    setDescription("");
    setTimeout(() => { setSent(false); onSent(); }, 2000);
  }, [title, selectedSymptoms, severity, duration, description, credits, doctorCode, doctorName, profile, phaseLabel, onSent]);

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-2">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <p className="text-sm font-semibold text-gray-900">Report sent successfully</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100">
        <span className="text-xs font-medium text-teal-700">Credits</span>
        <span className="text-sm font-bold text-teal-800">{credits} / 2 <span className="text-[10px] font-normal text-teal-500">(resets 2 days)</span></span>
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Fever since yesterday"
        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400"
      />
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1.5">Symptoms</p>
        <div className="flex flex-wrap gap-1">
          {availableSymptoms.map((sym) => {
            const selected = selectedSymptoms.includes(sym.label);
            return (
              <button
                key={sym.id}
                type="button"
                onClick={() => toggleSymptom(sym.label)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  selected ? "bg-teal-500 text-white border-teal-500" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                }`}
              >
                {sym.label}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1.5">
          Severity {severity && <span className="text-[10px] text-slate-400">(costs {getCreditCost(severity)} credit{getCreditCost(severity) > 1 ? "s" : ""})</span>}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SEVERITIES.map((s) => (
            <button
              key={s.level}
              type="button"
              onClick={() => setSeverity(s.level)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${severity === s.level ? s.activeColor : s.color}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1.5">Duration</p>
        <div className="flex flex-wrap gap-1.5">
          {DURATION_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                duration === d ? "bg-teal-500 text-white border-teal-500" : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe how you're feeling..."
        rows={2}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 placeholder:text-slate-400 resize-none"
      />
      {error && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!title.trim() || selectedSymptoms.length === 0 || !severity || !duration}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        Send Report
      </button>
    </div>
  );
}

function DoctorReportTab({ doctorCode }: { doctorCode: string }) {
  const [filter, setFilter] = useState<"all" | SeverityLevel>("all");
  const [activeTab, setActiveTab] = useState<"all" | "sent" | "doctor">("all");

  const patientReports = useMemo(() => getAllReports().filter((r) => r.doctorCode === doctorCode), [doctorCode]);
  const doctorResponses = useMemo(() => getDoctorResponsesByCode(doctorCode), [doctorCode]);

  const allItems = useMemo(() => {
    const items: Array<{ type: "patient" | "doctor"; data: unknown; timestamp: string; severity: SeverityLevel }> = [
      ...patientReports.map((r) => ({ type: "patient" as const, data: r, timestamp: r.timestamp, severity: r.severity })),
      ...doctorResponses.map((r) => ({ type: "doctor" as const, data: r, timestamp: r.createdAt, severity: r.severity })),
    ];
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items;
  }, [patientReports, doctorResponses]);

  const filteredItems = useMemo(() => {
    let items = allItems;
    if (activeTab === "sent") items = items.filter((i) => i.type === "patient");
    else if (activeTab === "doctor") items = items.filter((i) => i.type === "doctor");
    if (filter !== "all") items = items.filter((i) => i.severity === filter);
    return items;
  }, [allItems, filter, activeTab]);

  const hasAny = patientReports.length > 0 || doctorResponses.length > 0;

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
          <FileText className="w-5 h-5 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-gray-500">No reports yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
            activeTab === "all" ? "bg-teal-500 text-white border-teal-500" : "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600"
          }`}
        >
          All ({allItems.length})
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
            activeTab === "sent" ? "bg-teal-500 text-white border-teal-500" : "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600"
          }`}
        >
          Sent ({patientReports.length})
        </button>
        <button
          onClick={() => setActiveTab("doctor")}
          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
            activeTab === "doctor" ? "bg-teal-500 text-white border-teal-500" : "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600"
          }`}
        >
          Doctor ({doctorResponses.length})
        </button>
        <div className="w-px h-5 bg-slate-200 mx-1" />
        {(["all", "Low", "Moderate", "High", "Emergency"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
              filter === f ? "bg-teal-500 text-white border-teal-500" : "bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600"
            }`}
          >
            {f === "all" ? "All" : f}
          </button>
        ))}
      </div>
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <AlertTriangle className="w-5 h-5 text-slate-300 mb-1" />
          <p className="text-xs text-slate-400">No items match this filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) =>
            item.type === "patient" ? (
              <ReportCard key={(item.data as { id: string }).id} report={item.data as Parameters<typeof ReportCard>[0]["report"]} />
            ) : (
              <DoctorResponseCard key={(item.data as DoctorResponse).id} response={item.data as DoctorResponse} />
            ),
          )}
        </div>
      )}
    </div>
  );
}

export default function DoctorReportsSection({ doctorCode, doctorName }: Props) {
  const [tab, setTab] = useState<"send" | "reports">("send");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSent = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setTab("reports");
  }, []);

  return (
    <div id="doctor-reports-section" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-2">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-teal-600" />
          Doctor Reports
        </h3>
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setTab("send")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "send" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Send className="w-4 h-4" />
            Send Report
          </button>
          <button
            onClick={() => setTab("reports")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === "reports" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" />
            Doctor Report
          </button>
        </div>
      </div>
      <div className="p-5">
        {tab === "send" ? (
          <SendReportTab doctorCode={doctorCode} doctorName={doctorName} onSent={handleSent} />
        ) : (
          <DoctorReportTab key={refreshKey} doctorCode={doctorCode} />
        )}
      </div>
    </div>
  );
}
