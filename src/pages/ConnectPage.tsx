import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, Stethoscope, Send, Clock, AlertCircle, XCircle, Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { StoredUserData } from "@/hooks/useAuth";
import {
  createSupabaseRequest,
  getSupabaseRequestByCode,
} from "@/lib/supabaseConnectionStore";
import type { PatientProfileData } from "@/lib/connectionStore";
import type { ConnectionStatus } from "@/lib/connectionStore";
import MyDoctorDashboard from "@/components/connect/MyDoctorDashboard";

function mapStoredUserToPatientProfile(fp: StoredUserData): PatientProfileData {
  const age = parseInt(fp.basic.age, 10) || 0;
  const lifeStage = fp.health.lifeStage || "Maternity";
  let trimester: number | undefined;
  let pregnancyWeek: number | undefined;
  let expectedDueDate: string | undefined;

  if (fp.health.trimester) trimester = parseInt(String(fp.health.trimester), 10);
  if (fp.health.expectedDueDate) expectedDueDate = fp.health.expectedDueDate;

  try {
    const pregRaw = localStorage.getItem("mh-profile");
    if (pregRaw) {
      const pregProfile = JSON.parse(pregRaw) as Record<string, unknown>;
      const edd = (pregProfile.dueDate || pregProfile.calculatedEDD || pregProfile.userEDD) as string | undefined;
      if (edd) {
        expectedDueDate = edd;
        const weeksLeft = Math.ceil((new Date(edd).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000));
        pregnancyWeek = Math.max(1, 40 - weeksLeft);
      }
      if (!trimester && pregProfile.currentTrimester != null) {
        trimester = Number(pregProfile.currentTrimester);
      }
    }
  } catch {
    /* ignore */
  }

  return {
    fullName: fp.basic.fullName,
    age,
    lifeStage,
    trimester,
    pregnancyWeek,
    expectedDueDate,
  };
}

/** Prefer live auth profile; fall back to localStorage cache. */
function buildPatientProfile(fullProfile: StoredUserData | null): PatientProfileData | undefined {
  if (fullProfile?.basic?.fullName) {
    return mapStoredUserToPatientProfile(fullProfile);
  }
  try {
    const userRaw = localStorage.getItem("swasthyasakhi_user");
    if (!userRaw) return undefined;
    return mapStoredUserToPatientProfile(JSON.parse(userRaw) as StoredUserData);
  } catch {
    return undefined;
  }
}

export default function ConnectPage() {
  const { user, fullProfile } = useAuth();
  const [doctorCode, setDoctorCode] = useState("");
  const [requestStatus, setRequestStatus] = useState<"idle" | "invalid" | "submitting">("idle");
  const [connection, setConnection] = useState<{ status: ConnectionStatus; code: string } | null>(null);

  // On mount, check for existing pending request stored in sessionStorage
  useEffect(() => {
    const savedCode = sessionStorage.getItem("ss-active-doctor-code");
    if (!savedCode || !user?.id) return;
    getSupabaseRequestByCode(savedCode, user.id).then((req) => {
      if (req) setConnection({ status: req.status, code: savedCode });
    });
  }, [user?.id]);

  // Poll for status changes when a connection exists
  const pollStatus = useCallback(() => {
    if (!connection || !user?.id) return;
    getSupabaseRequestByCode(connection.code, user.id).then((req) => {
      if (req && req.status !== connection.status) {
        setConnection({ status: req.status, code: connection.code });
      }
    });
  }, [connection, user?.id]);

  useEffect(() => {
    if (!connection) return;
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [connection, pollStatus]);

  const handleSubmit = async () => {
    if (!doctorCode.trim() || !user?.id) return;
    setRequestStatus("submitting");

    const profile = buildPatientProfile(fullProfile);
    const req = await createSupabaseRequest(doctorCode.trim(), user.id, profile);

    if (req) {
      sessionStorage.setItem("ss-active-doctor-code", req.doctorCode);
      setConnection({ status: req.status, code: req.doctorCode });
      setRequestStatus("idle");
    } else {
      setRequestStatus("invalid");
    }
  };

  const reset = () => {
    setRequestStatus("idle");
    setConnection(null);
    setDoctorCode("");
    sessionStorage.removeItem("ss-active-doctor-code");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-sky-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {connection?.status === "accepted" ? (
          <MyDoctorDashboard doctorCode={connection.code} onDisconnect={reset} />
        ) : (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-200/50">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect with a Doctor</h1>
              <p className="text-sm text-gray-500">Enter your doctor's unique code to send a connection request</p>
            </div>

            {connection ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
                {connection.status === "pending" && (
                  <>
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-7 h-7 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Request Sent</h2>
                    <p className="text-sm text-gray-500 mb-4">Your request is waiting for doctor approval.</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-sm font-medium text-amber-700">
                      <Clock className="w-4 h-4" />
                      Pending Approval
                    </div>
                  </>
                )}
                {connection.status === "rejected" && (
                  <>
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-7 h-7 text-red-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Request Rejected</h2>
                    <p className="text-sm text-gray-500 mb-4">Your connection request was declined by the doctor.</p>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-sm font-medium text-red-700">
                      <XCircle className="w-4 h-4" />
                      Rejected
                    </div>
                  </>
                )}
                <button onClick={reset} className="mt-6 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors">
                  Connect with a different doctor
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="mb-5">
                  <label htmlFor="code" className="block text-sm font-semibold text-gray-700 mb-2">
                    Doctor Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    placeholder="e.g., A7h34l"
                    value={doctorCode}
                    onChange={(e) => {
                      setDoctorCode(e.target.value);
                      if (requestStatus === "invalid") setRequestStatus("idle");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className={`w-full h-12 px-4 rounded-xl border text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-slate-400 transition-shadow ${
                      requestStatus === "invalid"
                        ? "border-red-300 focus:ring-red-400"
                        : "border-slate-200 focus:ring-teal-400"
                    }`}
                  />
                  {requestStatus === "invalid" ? (
                    <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                      <AlertCircle className="w-3 h-3" />
                      Doctor code not found. Please check and try again.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1.5">Ask your doctor for their unique connection code</p>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!doctorCode.trim() || requestStatus === "submitting"}
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-teal-200/50 hover:shadow-lg hover:from-teal-700 hover:to-cyan-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {requestStatus === "submitting" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Request
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
