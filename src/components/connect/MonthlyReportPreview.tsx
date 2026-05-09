import { useMemo } from "react";
import {
  X, User, CalendarDays, Activity, Stethoscope,
  Calendar, Heart, AlertTriangle, Lightbulb, Clock, FileText,
  TrendingUp, Brain, Pill,
} from "lucide-react";

interface Props {
  patientName: string;
  phase: string;
  healthId: string | null;
  doctorName: string;
  selectedMonth: string;
  onClose: () => void;
  lastGenerated: string | null;
}

const PHASE_THEMES: Record<string, { gradient: string; badge: string }> = {
  Puberty: { gradient: "from-pink-500 to-rose-500", badge: "bg-pink-100 text-pink-700" },
  Maternity: { gradient: "from-teal-500 to-cyan-500", badge: "bg-teal-100 text-teal-700" },
  "Family Planning": { gradient: "from-violet-500 to-purple-500", badge: "bg-violet-100 text-violet-700" },
  Menopause: { gradient: "from-orange-500 to-amber-500", badge: "bg-orange-100 text-orange-700" },
};

const theme = { gradient: "from-teal-500 to-cyan-500", badge: "bg-teal-100 text-teal-700" };

function SectionCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500">
          <Icon className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
      {trend && <p className="text-[11px] text-emerald-600 font-medium mt-0.5">{trend}</p>}
    </div>
  );
}

function PlaceholderBadge({ label, variant = "info" }: { label: string; variant?: "info" | "success" | "warning" | "danger" }) {
  const colors = {
    info: "bg-blue-50 text-blue-700 border-blue-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${colors[variant]}`}>
      {label}
    </span>
  );
}

function PlaceholderRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <span className="text-xs text-slate-500 flex-1">{label}</span>
      <span className="text-xs font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function formatMonthLabel(month: string): string {
  const d = new Date(month + "-01");
  return d.toLocaleDateString("en-IN", { year: "numeric", month: "long" });
}

export default function MonthlyReportPreview({
  patientName,
  phase,
  healthId,
  doctorName,
  selectedMonth,
  onClose,
  lastGenerated,
}: Props) {
  const phaseTheme = PHASE_THEMES[phase] || theme;

  const monthLabel = useMemo(() => formatMonthLabel(selectedMonth), [selectedMonth]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl mx-auto my-6 sm:my-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-2xl border-b border-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${phaseTheme.gradient}`}>
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Monthly Health Report</h2>
                <p className="text-xs text-slate-500">{monthLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Report body */}
        <div className="bg-slate-50 px-6 pb-8 space-y-5">
          {/* 1. User Information */}
          <div className="pt-6">
            <SectionCard icon={User} title="Patient Information">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Name</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{patientName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Phase</p>
                  <span className={`inline-block mt-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${phaseTheme.badge}`}>
                    {phase}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Health ID</p>
                  <p className="text-sm font-mono font-bold text-gray-900 mt-0.5">{healthId || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Connected Doctor</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{doctorName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Report Month</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{monthLabel}</p>
                </div>
                {lastGenerated && (
                  <div>
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Last Generated</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{lastGenerated}</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          {/* 2. Health Overview */}
          <SectionCard icon={Heart} title="Health Overview">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="Appointments" value="0" trend="No data yet" />
              <MetricCard label="Symptoms Logged" value="0" trend="No data yet" />
              <MetricCard label="Doctor Interactions" value="0" trend="No data yet" />
              <MetricCard label="Wellness Score" value="—" trend="Tracking starts after first interaction" />
            </div>
            <p className="text-[11px] text-slate-400 mt-4 text-center italic border-t border-slate-100 pt-4">
              Health metrics will populate once you begin logging symptoms and interacting with your doctor.
            </p>
          </SectionCard>

          {/* 3. Symptom Analytics */}
          <SectionCard icon={Activity} title="Symptom Analytics">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                <p className="text-[11px] font-medium text-amber-600 uppercase tracking-wider">Most Reported</p>
                <p className="text-sm font-semibold text-amber-800 mt-1">—</p>
                <p className="text-[10px] text-amber-500 mt-0.5">Log symptoms to track patterns</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <p className="text-[11px] font-medium text-blue-600 uppercase tracking-wider">Frequency</p>
                <p className="text-sm font-semibold text-blue-800 mt-1">—</p>
                <p className="text-[10px] text-blue-500 mt-0.5">Symptom frequency data pending</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">Trend</p>
                <p className="text-sm font-semibold text-emerald-800 mt-1">—</p>
                <p className="text-[10px] text-emerald-500 mt-0.5">Insufficient data for trends</p>
              </div>
            </div>
            <div className="mt-4 h-24 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Symptom trend chart will appear here after sufficient data collection
              </p>
            </div>
          </SectionCard>

          {/* 4. Doctor Interaction Summary */}
          <SectionCard icon={Stethoscope} title="Doctor Interaction Summary">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="Schedules" value="0" />
              <MetricCard label="Questions Asked" value="0" />
              <MetricCard label="Reports Shared" value="0" />
              <MetricCard label="Alerts Sent" value="0" />
            </div>
            <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-400" />
                Interaction analytics will be available once you begin scheduling appointments and communicating with your doctor.
              </p>
            </div>
          </SectionCard>

          {/* 5. Schedule Summary */}
          <SectionCard icon={Calendar} title="Schedule Summary">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard label="Total Appointments" value="0" />
              <MetricCard label="Completed" value="0" />
              <MetricCard label="Upcoming" value="0" />
              <MetricCard label="Missed" value="0" />
            </div>
          </SectionCard>

          {/* 6. Wellness Tracking */}
          <SectionCard icon={TrendingUp} title="Wellness Tracking">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-rose-400" />
                  <p className="text-xs font-semibold text-slate-700">Physical Activity</p>
                </div>
                <p className="text-xs text-slate-400">No activity data recorded</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-4 w-4 text-violet-400" />
                  <p className="text-xs font-semibold text-slate-700">Mood & Mental Health</p>
                </div>
                <p className="text-xs text-slate-400">No mood data recorded</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <Pill className="h-4 w-4 text-amber-400" />
                  <p className="text-xs font-semibold text-slate-700">Medication Adherence</p>
                </div>
                <p className="text-xs text-slate-400">No medication data recorded</p>
              </div>
            </div>
          </SectionCard>

          {/* 7. Risk Indicators */}
          <SectionCard icon={AlertTriangle} title="Risk Indicators">
            <div className="flex flex-wrap gap-2">
              <PlaceholderBadge label="No critical symptoms detected" variant="success" />
              <PlaceholderBadge label="All vitals within normal range" variant="success" />
              <PlaceholderBadge label="No missed appointments" variant="success" />
              <PlaceholderBadge label="Medication adherence good" variant="success" />
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Risk indicators are based on logged symptoms, vitals, appointment history, and doctor feedback.
            </p>
          </SectionCard>

          {/* 8. Recommendations */}
          <SectionCard icon={Lightbulb} title="Recommendations">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 shrink-0">
                  <Lightbulb className="h-3.5 w-3.5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-teal-800">Start Tracking Symptoms</p>
                  <p className="text-[11px] text-teal-600 mt-0.5">Regular symptom logging helps identify patterns early.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 shrink-0">
                  <CalendarDays className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-800">Schedule Regular Checkups</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">Stay on top of your health with routine appointments.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 shrink-0">
                  <Heart className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-800">Stay Connected With Your Doctor</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Use Ask Doctor for any health concerns between visits.</p>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 9. Activity Timeline */}
          <SectionCard icon={Clock} title="Activity Timeline">
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <Clock className="h-5 w-5" />
                <p className="text-sm font-medium">No activity recorded for this month</p>
              </div>
              <p className="text-xs text-slate-300 mt-1">Your appointments, symptom logs, and interactions will appear here chronologically.</p>
            </div>
          </SectionCard>

          {/* Report footer */}
          <div className="text-center pt-2 pb-4">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              This is a preview. Report data will populate once health tracking is active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
