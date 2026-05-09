import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Stethoscope, Users } from "lucide-react";
import { getRequestByCode } from "@/lib/connectionStore";
import DoctorReportsSection from "@/components/connect/DoctorReportsSection";

function loadProfile() {
  let doctorCode = "";
  let doctorName = "Your Doctor";

  try {
    const docRaw = localStorage.getItem("ss-doctor-profile");
    if (docRaw) {
      const doc = JSON.parse(docRaw);
      doctorCode = doc.doctorCode || "";
      doctorName = doc.name || "Your Doctor";
    }
  } catch { /* ignore */ }

  return { doctorCode, doctorName };
}

export default function DoctorReportsPage() {
  const navigate = useNavigate();

  const { doctorCode, doctorName } = useMemo(() => loadProfile(), []);

  const isConnected = useMemo(() => {
    if (!doctorCode) return false;
    try {
      const req = getRequestByCode(doctorCode);
      return req?.status === "accepted";
    } catch { return false; }
  }, [doctorCode]);

  if (!doctorCode) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 text-white">
          <div className="container py-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-teal-100 hover:text-white transition-colors text-sm mb-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold">Doctor Reports</h1>
          </div>
        </div>
        <div className="container py-16 text-center">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-600">Connect with a doctor to view reports.</p>
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
            <h1 className="text-2xl font-bold">Doctor Reports</h1>
          </div>
        </div>
        <div className="container py-16 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-semibold text-slate-600">Connect with a doctor to view reports.</p>
          <p className="text-sm text-slate-400 mt-1">Your connection request is still pending or was declined.</p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6" />
              <div>
                <h1 className="text-2xl font-bold">Doctor Reports</h1>
                <p className="text-teal-100 text-sm">Send health reports and view records with {doctorName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 max-w-2xl">
        <DoctorReportsSection doctorCode={doctorCode} doctorName={doctorName} />
      </div>
    </div>
  );
}
