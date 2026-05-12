import { useState, useRef, useCallback, useEffect } from "react";
import { AlertTriangle, Phone, CheckCircle2, XCircle, Loader2, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { canTriggerSOS, createSOSAlert, findActiveDoctorConnection, type SOSAlert, type SOSStatus } from "@/lib/sosStore";
import { SOSEmergencyPopup } from "@/modules/doctor/components/SOSEmergencyPopup";
import { toast } from "sonner";

const HOLD_DURATION = 2000;
const R = 52;
const CIRCUMFERENCE = 2 * Math.PI * R;

type SOSButtonState = 
  | "idle"
  | "no-auth"
  | "no-doctor"
  | "rate-limited"
  | "submitting"
  | "success"
  | "error";

export default function SOSButton() {
  const { user, fullProfile } = useAuth();
  const { phase } = usePhase();
  const { gestationalWeek } = usePregnancyProfile();
  
  const [holding, setHolding] = useState(false);
  const [buttonState, setButtonState] = useState<SOSButtonState>("idle");
  const [progress, setProgress] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [demoAlert, setDemoAlert] = useState<SOSAlert | null>(null);
  
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    async function checkPrerequisites() {
      if (!user) {
        setButtonState("no-auth");
        return;
      }
      
      const connection = await findActiveDoctorConnection(user.id);
      if (!connection) {
        setButtonState("no-doctor");
        return;
      }
      
      const eligibility = await canTriggerSOS(user.id);
      if (!eligibility.allowed) {
        setButtonState("rate-limited");
        setDaysRemaining(eligibility.daysRemaining ?? 30);
        return;
      }
      
      setButtonState("idle");
      setDaysRemaining(null);
    }
    
    checkPrerequisites();
  }, [user]);

  const submitSOS = useCallback(async () => {
    if (!user) {
      setButtonState("no-auth");
      return;
    }

    setButtonState("submitting");

    try {
      const eligibility = await canTriggerSOS(user.id);
      if (!eligibility.allowed) {
        setButtonState("rate-limited");
        setDaysRemaining(eligibility.daysRemaining ?? 30);
        toast.warning("Emergency SOS already used this month.");
        return;
      }

      const connection = await findActiveDoctorConnection(user.id);
      if (!connection) {
        setButtonState("no-doctor");
        toast.error("No doctor connected. Please connect with a doctor first.");
        return;
      }

      const patientName = fullProfile?.basic.fullName || user.name || "Patient";
      const effectivePhase = connection.patientPhase || phase;
      const effectivePregnancyWeek = connection.pregnancyWeek ?? 
        (effectivePhase === "maternity" ? gestationalWeek : undefined);

      const sos = await createSOSAlert({
        patientId: user.id,
        patientName,
        patientPhase: effectivePhase,
        doctorId: connection.doctorId,
        doctorCode: connection.doctorCode,
        pregnancyWeek: effectivePregnancyWeek,
        emergencyMessage: "Emergency SOS triggered by patient",
      });

      if (sos) {
        setButtonState("success");
        setDemoAlert(sos);
        toast.success("Emergency SOS sent to your doctor!");
        setTimeout(() => {
          setButtonState("rate-limited");
          setDaysRemaining(30);
        }, 5000);
      } else {
        throw new Error("Failed to create SOS alert");
      }
    } catch (err) {
      console.error("SOS submission error:", err);
      setButtonState("error");
      setErrorMessage("Failed to send SOS. Please try again or call emergency services directly.");
      toast.error("Failed to send SOS alert");
    }
  }, [user, fullProfile, phase, gestationalWeek]);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const pct = Math.min(elapsed / HOLD_DURATION, 1);
    setProgress(pct);
    if (pct < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setHolding(false);
      setProgress(0);
      submitSOS();
    }
  }, [submitSOS]);

  const down = useCallback(() => {
    if (buttonState !== "idle") return;
    setHolding(true);
    setProgress(0);
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [buttonState, tick]);

  const up = useCallback(() => {
    if (holding) {
      setHolding(false);
      setProgress(0);
      cancelAnimationFrame(rafRef.current);
    }
  }, [holding]);

  const leave = useCallback(() => {
    if (holding) {
      setHolding(false);
      setProgress(0);
      cancelAnimationFrame(rafRef.current);
    }
  }, [holding]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const offset = CIRCUMFERENCE - progress * CIRCUMFERENCE;
  
  const isButtonInteractive = buttonState === "idle";
  const activated = buttonState === "success";

  const renderButtonContent = () => {
    if (buttonState === "success") {
      return (
        <>
          <CheckCircle2 className="w-8 h-8" />
          <span className="text-[10px] font-semibold mt-0.5">Sent!</span>
        </>
      );
    }
    
    if (buttonState === "submitting") {
      return (
        <>
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-[9px] font-medium opacity-80 mt-0.5">Sending</span>
        </>
      );
    }

    if (buttonState === "error") {
      return (
        <>
          <XCircle className="w-8 h-8" />
          <span className="text-[9px] font-medium opacity-80 mt-0.5">Error</span>
        </>
      );
    }

    if (buttonState === "rate-limited") {
      return (
        <>
          <XCircle className="w-7 h-7 opacity-70" />
          <span className="text-[8px] font-medium opacity-50 mt-1">Unavailable</span>
        </>
      );
    }

    if (buttonState === "no-auth" || buttonState === "no-doctor") {
      return (
        <>
          <AlertTriangle className="w-7 h-7 opacity-70" />
          <span className="text-[8px] font-medium opacity-50 mt-1">Disabled</span>
        </>
      );
    }

    return (
      <>
        <span className="text-2xl font-black tracking-[0.15em]">SOS</span>
        <span className="text-[9px] font-medium opacity-80 mt-0.5">
          {holding ? "Release\nto cancel" : "Hold"}
        </span>
      </>
    );
  };

  const getButtonStyles = () => {
    const base = "relative w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-bold select-none touch-none transition-all duration-200 shadow-xl";
    
    if (buttonState === "success") {
      return `${base} bg-emerald-600 scale-110`;
    }
    
    if (buttonState === "submitting") {
      return `${base} bg-blue-600`;
    }

    if (buttonState === "error") {
      return `${base} bg-red-800`;
    }

    if (buttonState === "rate-limited" || buttonState === "no-auth" || buttonState === "no-doctor") {
      return `${base} bg-slate-400 cursor-not-allowed`;
    }

    if (holding) {
      return `${base} bg-red-700 scale-[0.93]`;
    }

    return `${base} bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95`;
  };

  const getButtonShadow = () => {
    if (buttonState === "success") {
      return "0 0 30px rgba(5,150,105,0.4)";
    }
    if (holding) {
      return `0 0 ${30 + progress * 40}px rgba(220,38,38,${0.4 + progress * 0.4})`;
    }
    return "0 0 20px rgba(220,38,38,0.3)";
  };

  const renderMessage = () => {
    if (buttonState === "success") {
      return (
        <div className="mt-6 px-5 py-3.5 rounded-xl bg-emerald-50 border border-emerald-200 shadow-lg animate-scaleIn max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-semibold text-emerald-800">Emergency alert sent to linked PHC doctors</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="tel:104" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 104
            </a>
            <a href="tel:108" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 108
            </a>
          </div>
        </div>
      );
    }

    if (buttonState === "rate-limited") {
      return (
        <div className="mt-4 px-5 py-4 rounded-xl bg-amber-50 border border-amber-200 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Emergency SOS already used this month.</p>
              <p className="text-xs text-amber-600 mt-1">
                Available again in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href="tel:104" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 104
            </a>
            <a href="tel:108" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 108
            </a>
          </div>
        </div>
      );
    }

    if (buttonState === "no-auth") {
      return (
        <div className="mt-4 px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-slate-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Please log in to use SOS</p>
              <p className="text-xs text-slate-500 mt-1">Sign in to connect with your doctor</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href="tel:104" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 104
            </a>
            <a href="tel:108" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 108
            </a>
          </div>
        </div>
      );
    }

    if (buttonState === "no-doctor") {
      return (
        <div className="mt-4 px-5 py-4 rounded-xl bg-blue-50 border border-blue-200 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">No doctor connected</p>
              <p className="text-xs text-blue-600 mt-1">Connect with a PHC doctor first to use SOS</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href="tel:104" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 104
            </a>
            <a href="tel:108" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 108
            </a>
          </div>
        </div>
      );
    }

    if (buttonState === "error") {
      return (
        <div className="mt-4 px-5 py-4 rounded-xl bg-red-50 border border-red-200 max-w-sm mx-auto">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href="tel:104" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 104
            </a>
            <a href="tel:108" className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-300 text-red-700 text-xs font-semibold hover:bg-red-50 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              Call 108
            </a>
          </div>
        </div>
      );
    }

    if (holding) {
      return (
        <div className="flex items-center gap-2 mt-4 text-amber-600 text-sm font-medium animate-fadeIn">
          <AlertTriangle className="w-4 h-4" />
          <span>Keep holding... {Math.round(progress * 100)}%</span>
        </div>
      );
    }

    if (buttonState === "idle" && !holding) {
      return (
        <p className="text-sm text-red-600 font-semibold mt-4">Hold to Send SOS</p>
      );
    }

    return null;
  };

  const showPulseGlow = buttonState === "idle" && !holding;
  const showProgressRing = holding && buttonState === "idle";

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        {showPulseGlow && (
          <div className="absolute inset-0 rounded-full animate-pulse-glow" />
        )}

        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 120 120"
          width="120"
          height="120"
        >
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
          {showProgressRing && (
            <circle
              cx="60" cy="60" r={R}
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              className="transition-[stroke-dashoffset] duration-75"
            />
          )}
        </svg>

        <button
          onPointerDown={isButtonInteractive ? down : undefined}
          onPointerUp={isButtonInteractive ? up : undefined}
          onPointerLeave={isButtonInteractive ? leave : undefined}
          disabled={!isButtonInteractive}
          className={getButtonStyles()}
          style={{ boxShadow: getButtonShadow() }}
        >
          {renderButtonContent()}
        </button>
      </div>

      {renderMessage()}

      {demoAlert && (
        <SOSEmergencyPopup
          alert={demoAlert}
          onAction={() => setDemoAlert(null)}
        />
      )}
    </div>
  );
}
