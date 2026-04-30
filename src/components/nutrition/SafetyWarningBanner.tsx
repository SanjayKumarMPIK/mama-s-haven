import type { SafetyWarning } from "@/lib/nutrition/nutritionTypes";
import { AlertTriangle, ShieldAlert } from "lucide-react";

interface SafetyWarningBannerProps {
  warnings: SafetyWarning[];
}

export default function SafetyWarningBanner({ warnings }: SafetyWarningBannerProps) {
  if (warnings.length === 0) return null;

  const hasRed = warnings.some(w => w.severity === "red");
  const bgColor = hasRed ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200";
  const iconColor = hasRed ? "text-red-500" : "text-amber-500";
  const textColor = hasRed ? "text-red-800" : "text-amber-800";

  return (
    <div className={`rounded-2xl border-2 ${bgColor} p-5`} id="safety-warning-banner">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${hasRed ? "bg-red-100" : "bg-amber-100"} flex items-center justify-center shrink-0`}>
          {hasRed ? <ShieldAlert className={`w-5 h-5 ${iconColor}`} /> : <AlertTriangle className={`w-5 h-5 ${iconColor}`} />}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-bold ${textColor} mb-1`}>
            {hasRed ? "⚠️ Important Health Alert" : "⚡ Health Advisory"}
          </h3>
          <p className={`text-xs ${textColor} mb-3 opacity-80`}>
            Please consult a healthcare professional about the following:
          </p>
          <div className="space-y-2">
            {warnings.map((w) => (
              <div key={w.symptomId} className="flex items-start gap-2 rounded-lg bg-white/60 p-3 border border-current/5">
                <span className="text-base shrink-0">{w.emoji}</span>
                <div>
                  <p className={`text-xs font-semibold ${textColor}`}>{w.label}</p>
                  <p className={`text-[11px] ${textColor} opacity-80 leading-relaxed`}>{w.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
