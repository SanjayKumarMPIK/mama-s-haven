import { useState, useRef, useCallback, useEffect } from "react";
import { AlertTriangle, Phone, CheckCircle2 } from "lucide-react";

const HOLD_DURATION = 2000;
const R = 52;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function SOSButton() {
  const [holding, setHolding] = useState(false);
  const [activated, setActivated] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    const pct = Math.min(elapsed / HOLD_DURATION, 1);
    setProgress(pct);
    if (pct < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      setHolding(false);
      setProgress(0);
      setActivated(true);
      setTimeout(() => setActivated(false), 4000);
    }
  }, []);

  const down = useCallback(() => {
    if (activated) return;
    setHolding(true);
    setProgress(0);
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [activated, tick]);

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

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        {!activated && (
          <div className={`absolute inset-0 rounded-full ${holding ? "" : "animate-pulse-glow"}`} />
        )}

        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 120 120"
          width="120"
          height="120"
        >
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="4" />
          {holding && (
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
          onPointerDown={down}
          onPointerUp={up}
          onPointerLeave={leave}
          className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center text-white font-bold select-none touch-none transition-all duration-200 shadow-xl ${
            activated
              ? "bg-emerald-600 scale-110"
              : holding
                ? "bg-red-700 scale-[0.93]"
                : "bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95"
          }`}
          style={{
            boxShadow: activated
              ? "0 0 30px rgba(5,150,105,0.4)"
              : holding
                ? `0 0 ${30 + progress * 40}px rgba(220,38,38,${0.4 + progress * 0.4})`
                : "0 0 20px rgba(220,38,38,0.3)",
          }}
        >
          {activated ? (
            <>
              <CheckCircle2 className="w-8 h-8" />
              <span className="text-[10px] font-semibold mt-0.5">Sent!</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-black tracking-[0.15em]">SOS</span>
              <span className="text-[9px] font-medium opacity-80 mt-0.5">
                {holding ? "Release\nto cancel" : "Hold"}
              </span>
            </>
          )}
        </button>
      </div>

      {!activated && !holding && (
        <p className="text-sm text-red-600 font-semibold mt-4">Hold to Send SOS</p>
      )}

      {holding && (
        <div className="flex items-center gap-2 mt-4 text-amber-600 text-sm font-medium animate-fadeIn">
          <AlertTriangle className="w-4 h-4" />
          <span>Keep holding... {Math.round(progress * 100)}%</span>
        </div>
      )}

      {activated && (
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
      )}
    </div>
  );
}
