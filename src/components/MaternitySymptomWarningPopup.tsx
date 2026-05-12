import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useMaternitySymptomWarning } from "@/hooks/useMaternitySymptomWarning";
import { useMaternityPopupQueue } from "@/hooks/useMaternityPopupQueue";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  X,
  Calendar,
  Activity,
  Stethoscope,
  Send,
  BellOff,
} from "lucide-react";

export default function MaternitySymptomWarningPopup() {
  const { activeWarning, visible, ignoreWarning, sendDoctorAlert, isHighRisk } =
    useMaternitySymptomWarning();
  const { activePopup, requestShow, notifyDismissed, cancelRequest } = useMaternityPopupQueue();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (visible && activeWarning) {
      requestShow("symptom");
      setOpen(true);
    } else {
      notifyDismissed("symptom");
      const timer = setTimeout(() => setOpen(false), 200);
      return () => {
        clearTimeout(timer);
        cancelRequest("symptom");
      };
    }
  }, [visible, activeWarning, requestShow, notifyDismissed, cancelRequest]);

  const handleIgnore = useCallback(() => {
    setOpen(false);
    notifyDismissed("symptom");
    setTimeout(() => ignoreWarning(), 200);
  }, [ignoreWarning, notifyDismissed]);

  const handleSendAlert = useCallback(() => {
    sendDoctorAlert();
    setOpen(false);
    notifyDismissed("symptom");
    toast({
      title: "Doctor Alert Sent",
      description: "Your symptom alert has been recorded and will be reviewed.",
      variant: "default",
    });
  }, [sendDoctorAlert, notifyDismissed]);

  if (!open || !activeWarning || (activePopup !== "symptom" && activePopup !== null)) return null;

  const triggerLabel = {
    "consecutive-3": "3 Consecutive Days",
    "within-7d-4": "4 Times in 7 Days",
    "within-30d-10": "10 Times in 30 Days",
    "consecutive-4": "4 Consecutive Days",
    "weekly-5": "5+ Symptoms This Week",
    "monthly-15": "15+ Symptoms This Month",
    "high-risk-25": "CRITICAL: 25+ Symptoms This Month",
  }[activeWarning.triggerType];

  const triggerDescription = {
    "consecutive-3": `${activeWarning.symptomName} has been logged on 3 consecutive days without interruption.`,
    "within-7d-4": `${activeWarning.symptomName} has occurred 4 times within the last 7 days.`,
    "within-30d-10": `${activeWarning.symptomName} has occurred 10 times within the last 30 days.`,
    "consecutive-4": `${activeWarning.symptomName} has been logged for 4 consecutive days.`,
    "weekly-5": `You have logged symptoms on ${activeWarning.count} separate days within the last 7 days.`,
    "monthly-15": `You have logged symptoms on ${activeWarning.count} separate days within the last 30 days.`,
    "high-risk-25": `You have logged ${activeWarning.count} individual symptom entries within the last 30 days.`,
  }[activeWarning.triggerType];

  const recommendation = {
    "consecutive-3":
      "Persistent symptoms over multiple days may indicate an underlying concern. Please monitor closely and consult your healthcare provider if the pattern continues.",
    "within-7d-4":
      "Frequent symptoms may require medical attention. Please monitor closely or consult a healthcare professional.",
    "within-30d-10":
      "High-frequency symptoms over the past month should be evaluated. Please consult your healthcare provider for a thorough assessment.",
    "consecutive-4":
      "Persistent symptoms detected over multiple consecutive days.",
    "weekly-5":
      "Frequent symptom activity detected this week.",
    "monthly-15":
      "High symptom frequency detected this month.",
    "high-risk-25":
      "Critical symptom frequency detected. Consider immediate medical attention.",
  }[activeWarning.triggerType];

  const topBarGradient = isHighRisk
    ? "h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-orange-500"
    : "h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-amber-400";

  const iconBg = isHighRisk
    ? "w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mb-2 animate-pulse"
    : "w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-2 animate-pulse";

  const badgeStyle = isHighRisk
    ? "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 border border-red-300 mb-2"
    : "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 mb-2";

  const badgeTextStyle = isHighRisk
    ? "text-[11px] font-bold uppercase tracking-wider text-red-700"
    : "text-[11px] font-bold uppercase tracking-wider text-red-600";

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleIgnore(); }}>
      <DialogContent className="sm:max-w-md border-0 p-0 gap-0 overflow-hidden">
        <div className={topBarGradient} />

        <div className="p-5">
          <button
            onClick={handleIgnore}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-col items-center text-center mb-4">
            <div className={iconBg}>
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className={badgeStyle}>
              <Activity className="w-3 h-3 text-red-500" />
              <span className={badgeTextStyle}>
                {triggerLabel}
              </span>
            </div>
            <h2 className={`text-lg font-bold leading-tight ${isHighRisk ? "text-red-800" : "text-gray-900"}`}>
              {activeWarning.symptomName}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{activeWarning.emoji}</p>
          </div>

          <div className={`rounded-xl p-4 mb-4 ${isHighRisk ? "bg-gradient-to-br from-red-100 to-orange-100 border border-red-300" : "bg-gradient-to-br from-red-50 to-orange-50 border border-red-200"}`}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isHighRisk ? "bg-red-200" : "bg-red-100"}`}>
                <Calendar className={`w-4 h-4 ${isHighRisk ? "text-red-700" : "text-red-600"}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold mb-1 ${isHighRisk ? "text-red-900" : "text-red-900"}`}>
                  Frequency Summary
                </p>
                <p className={`text-sm leading-relaxed ${isHighRisk ? "text-red-800" : "text-red-800"}`}>
                  {triggerDescription}
                </p>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg ${isHighRisk ? "bg-red-200/80" : "bg-red-100/80"}`}>
                  <Activity className={`w-3 h-3 ${isHighRisk ? "text-red-700" : "text-red-600"}`} />
                  <span className={`text-[11px] font-semibold ${isHighRisk ? "text-red-800" : "text-red-700"}`}>
                    {activeWarning.count}x in {activeWarning.windowDays} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`flex items-start gap-2.5 rounded-xl p-3 mb-4 ${isHighRisk ? "bg-red-50 border border-red-300" : "bg-amber-50 border border-amber-200"}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isHighRisk ? "bg-red-100" : "bg-amber-100"}`}>
              <Stethoscope className={`w-3.5 h-3.5 ${isHighRisk ? "text-red-600" : "text-amber-600"}`} />
            </div>
            <p className={`text-sm leading-relaxed ${isHighRisk ? "text-red-800 font-medium" : "text-amber-800"}`}>
              {recommendation}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSendAlert}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold transition-all active:scale-[0.97] ${isHighRisk ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800" : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"}`}
            >
              <Send className="w-4 h-4" />
              Send Doctor Alert
            </button>

            <button
              onClick={handleIgnore}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.97]"
            >
              <BellOff className="w-4 h-4" />
              Ignore
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
