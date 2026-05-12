import { useState, useEffect, useRef, useCallback } from "react";
import { X, Phone, Clock, ShieldAlert, User, Baby, Stethoscope, CheckCircle2, Eye } from "lucide-react";
import { updateSOSStatus, getPendingSOSAlertsByDoctor, type SOSAlert, type SOSStatus } from "@/lib/sosStore";

interface SOSEmergencyPopupProps {
  doctorId: string;
  onClose: () => void;
}

function formatSOSRelativeTime(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getPhaseLabel(phase: string): string {
  const labels: Record<string, string> = {
    puberty: "Puberty",
    maternity: "Maternity",
    "family-planning": "Family Planning",
    menopause: "Menopause",
    postpartum: "Postpartum",
  };
  return labels[phase] || phase;
}

export function SOSEmergencyPopup({ alert, onAction }: { alert: SOSAlert; onAction: (sosId: string, status: SOSStatus) => void }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAcknowledge = async () => {
    setIsProcessing(true);
    const ok = await updateSOSStatus(alert.id, "acknowledged");
    setIsProcessing(false);
    if (ok) {
      onAction(alert.id, "acknowledged");
    }
  };

  const handleResolve = async () => {
    setIsProcessing(true);
    const ok = await updateSOSStatus(alert.id, "resolved");
    setIsProcessing(false);
    if (ok) {
      onAction(alert.id, "resolved");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border-l-4 border-red-500 overflow-hidden animate-scaleIn">
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">EMERGENCY SOS</h2>
                <p className="text-red-100 text-xs">Patient triggered emergency alert</p>
              </div>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
              {formatSOSRelativeTime(alert.createdAt)}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
              <User className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs text-red-500">Patient</p>
                <p className="font-semibold text-red-900">{alert.patientName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <Baby className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs text-slate-500">Phase</p>
                  <p className="text-sm font-semibold text-slate-900">{getPhaseLabel(alert.patientPhase)}</p>
                </div>
              </div>

              {alert.pregnancyWeek && (
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <div>
                    <p className="text-xs text-slate-500">Week</p>
                    <p className="text-sm font-semibold text-slate-900">Week {alert.pregnancyWeek}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <Stethoscope className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">Doctor Code</p>
                <p className="text-sm font-semibold text-slate-900">{alert.doctorCode}</p>
              </div>
            </div>
          </div>

          {alert.emergencyMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">{alert.emergencyMessage}</p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            <a
              href="tel:104"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call 104
            </a>
            <button
              onClick={handleAcknowledge}
              disabled={isProcessing}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              Acknowledge
            </button>
            <button
              onClick={handleResolve}
              disabled={isProcessing}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Resolve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function useDoctorSOSAlerts(doctorId: string | undefined, {
  pollInterval = 5000,
}: { pollInterval?: number } = {}) {
  const [pendingAlerts, setPendingAlerts] = useState<SOSAlert[]>([]);
  const acknowledgedAlertIds = useRef<Set<string>>(new Set());
  const mountedRef = useRef(true);

  const fetchAlerts = useCallback(async () => {
    if (!doctorId) return;
    const alerts = await getPendingSOSAlertsByDoctor(doctorId);
    
    const newAlerts = alerts.filter(a => !acknowledgedAlertIds.current.has(a.id));
    setPendingAlerts(newAlerts);
  }, [doctorId]);

  useEffect(() => {
    mountedRef.current = true;
    fetchAlerts();
    const interval = setInterval(fetchAlerts, pollInterval);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchAlerts, pollInterval]);

  const acknowledgeAlertLocally = useCallback((sosId: string) => {
    acknowledgedAlertIds.current.add(sosId);
    setPendingAlerts(prev => prev.filter(a => a.id !== sosId));
  }, []);

  return {
    pendingAlerts,
    acknowledgeAlertLocally,
    refresh: fetchAlerts,
  };
}
