import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ShieldCheck, BadgeCheck, Copy, CheckCircle2,
  Stethoscope, CalendarDays, Shield, Share2, QrCode,
  Building2, AlertCircle, FileText, ChevronDown,
} from "lucide-react";
import { getRequestByCode, getOrCreateHealthUserId } from "@/lib/connectionStore";
import MonthlyReportPreview from "@/components/connect/MonthlyReportPreview";

function loadProfile() {
  let doctorCode = "";
  let doctorName = "Your Doctor";
  let doctorSpecialty = "Healthcare Provider";
  let doctorHospital = "Registered Healthcare Facility";
  let patientName = "Patient";
  let phase = "Maternity";

  try {
    const docRaw = localStorage.getItem("ss-doctor-profile");
    if (docRaw) {
      const doc = JSON.parse(docRaw);
      doctorCode = doc.doctorCode || "";
      doctorName = doc.name || "Your Doctor";
      doctorSpecialty = doc.specialty || "Healthcare Provider";
      doctorHospital = doc.hospital || "Registered Healthcare Facility";
    }
  } catch { /* ignore */ }

  try {
    const userRaw = localStorage.getItem("swasthyasakhi_user");
    if (userRaw) {
      const user = JSON.parse(userRaw);
      patientName = user.basic?.fullName || "Patient";
      phase = user.health?.lifeStage || "Maternity";
    }
  } catch { /* ignore */ }

  return { doctorCode, doctorName, doctorSpecialty, doctorHospital, patientName, phase };
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <div className="text-sm font-semibold text-gray-900 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

export default function ConnectionStatusPage() {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);

  const { doctorCode, doctorName, doctorSpecialty, doctorHospital, patientName, phase } = useMemo(() => loadProfile(), []);

  const connection = useMemo(() => {
    if (!doctorCode) return null;
    try {
      return getRequestByCode(doctorCode) ?? null;
    } catch { return null; }
  }, [doctorCode]);

  const isConnected = connection?.status === "accepted";

  const healthId = useMemo(() => {
    if (!isConnected || !doctorCode) return null;
    return getOrCreateHealthUserId(doctorCode, connection.patientPhase || phase);
  }, [isConnected, doctorCode, connection, phase]);

  const connectedDate = useMemo(() => {
    if (!connection?.createdAt) return null;
    const d = new Date(connection.createdAt);
    return d.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  }, [connection]);

  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-IN", { year: "numeric", month: "long" });
      options.push({ value, label });
    }
    return options;
  }, []);

  const handleGenerateReport = useCallback(() => {
    const now = new Date();
    setLastGenerated(now.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }));
    setShowReport(true);
  }, []);

  const handleCopyId = useCallback(() => {
    if (!healthId) return;
    navigator.clipboard.writeText(healthId).then(() => {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }).catch(() => { /* ignore */ });
  }, [healthId]);

  if (!doctorCode) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
          <div className="container py-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Connection Status</h1>
          </div>
        </div>
        <div className="container py-16 text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-600">No active doctor connection.</p>
          <p className="text-sm text-slate-400 mt-1">Connect with a doctor to view your connection status.</p>
          <button
            onClick={() => navigate("/connect")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            Go to My Doctor
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
          <div className="container py-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Connection Status</h1>
          </div>
        </div>
        <div className="container py-16 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-600">No active doctor connection.</p>
          <p className="text-sm text-slate-400 mt-1">
            {connection?.status === "pending"
              ? "Your connection request is still pending approval."
              : "Your connection request was declined."}
          </p>
          <button
            onClick={() => navigate("/connect")}
            className="mt-4 px-6 py-2.5 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 transition-colors"
          >
            Go to My Doctor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
        <div className="container py-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6" />
            <div>
              <h1 className="text-2xl font-bold">Connection Status</h1>
              <p className="text-teal-100 text-sm">Your verified healthcare connection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-2xl mx-auto space-y-4">
        {/* Connection Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <BadgeCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Connected</h2>
                <p className="text-sm text-slate-500">Verified relationship with doctor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Unique Health ID */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <InfoRow icon={Shield} label="Unique Health ID" value={
            <div className="flex items-center gap-3 mt-1">
              <span className="text-lg font-mono font-bold text-teal-700 tracking-wider">{healthId}</span>
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shrink-0
                  border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50"
              >
                {copiedId ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy ID
                  </>
                )}
              </button>
            </div>
          } />
        </div>

        {/* Connected Doctor */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <InfoRow icon={Stethoscope} label="Connected Doctor" value={
            <div>
              <p className="text-sm font-semibold text-gray-900">{doctorName}</p>
              <p className="text-xs text-teal-600">{doctorSpecialty}</p>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {doctorHospital}
              </p>
            </div>
          } />
        </div>

        {/* Connection Date */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <InfoRow icon={CalendarDays} label="Connection Date" value={
            <p className="text-sm font-semibold text-gray-900">
              Connected since {connectedDate || "Today"}
            </p>
          } />
        </div>

        {/* Verification Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <InfoRow icon={BadgeCheck} label="Verification Status" value={
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-700">Verified Connection</span>
            </div>
          } />
        </div>

        {/* Data Sharing Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <InfoRow icon={Share2} label="Data Sharing Status" value={
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 mt-1">
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Health data sharing enabled</span>
            </div>
          } />
        </div>

        {/* Generate Monthly Report */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500" />
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 shrink-0">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900">Generate Monthly Report</h2>
                <p className="text-sm text-slate-500 mt-0.5">Review your health progress, doctor interactions, symptom trends, and schedules for a selected month.</p>
                <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full h-10 pl-3 pr-10 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 cursor-pointer"
                    >
                      {monthOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all active:scale-[0.98] shrink-0"
                  >
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </button>
                </div>
                {lastGenerated && (
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Last generated on {lastGenerated}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Future-Ready Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Additional Features</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Share2 className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">Emergency Sharing</p>
                <p className="text-[10px] text-slate-400">Coming soon</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">Linked PHC</p>
                <p className="text-[10px] text-slate-400">Coming soon</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <QrCode className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600">QR Verification</p>
                <p className="text-[10px] text-slate-400">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showReport && (
        <MonthlyReportPreview
          patientName={patientName}
          phase={phase}
          healthId={healthId}
          doctorName={doctorName}
          selectedMonth={selectedMonth}
          onClose={() => setShowReport(false)}
          lastGenerated={lastGenerated}
        />
      )}
    </div>
  );
}
