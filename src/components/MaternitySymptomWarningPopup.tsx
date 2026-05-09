import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useMaternitySymptomWarning } from "@/hooks/useMaternitySymptomWarning";
import {
  AlertTriangle,
  X,
  Calendar,
  Activity,
  Stethoscope,
  Eye,
} from "lucide-react";

export default function MaternitySymptomWarningPopup() {
  const { activeWarning, visible, dismissWarning, dismissAll } =
    useMaternitySymptomWarning();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (visible && activeWarning) {
      setOpen(true);
    } else {
      const timer = setTimeout(() => setOpen(false), 200);
      return () => clearTimeout(timer);
    }
  }, [visible, activeWarning]);

  const handleDismiss = useCallback(() => {
    setOpen(false);
    setTimeout(() => dismissWarning(), 200);
  }, [dismissWarning]);

  const handleDismissAll = useCallback(() => {
    setOpen(false);
    setTimeout(() => dismissAll(), 200);
  }, [dismissAll]);

  const handleViewLogs = useCallback(() => {
    setOpen(false);
    setTimeout(() => {
      dismissAll();
      navigate("/health-log");
    }, 200);
  }, [dismissAll, navigate]);

  if (!open || !activeWarning) return null;

  const triggerLabel = {
    "consecutive-3": "3 Consecutive Days",
    "within-7d-4": "4 Times in 7 Days",
    "within-30d-10": "10 Times in 30 Days",
  }[activeWarning.triggerType];

  const triggerDescription = {
    "consecutive-3": `${activeWarning.symptomName} has been logged on 3 consecutive days without interruption.`,
    "within-7d-4": `${activeWarning.symptomName} has occurred 4 times within the last 7 days.`,
    "within-30d-10": `${activeWarning.symptomName} has occurred 10 times within the last 30 days.`,
  }[activeWarning.triggerType];

  const recommendation = {
    "consecutive-3":
      "Persistent symptoms over multiple days may indicate an underlying concern. Please monitor closely and consult your healthcare provider if the pattern continues.",
    "within-7d-4":
      "Frequent symptoms may require medical attention. Please monitor closely or consult a healthcare professional.",
    "within-30d-10":
      "High-frequency symptoms over the past month should be evaluated. Please consult your healthcare provider for a thorough assessment.",
  }[activeWarning.triggerType];

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md border-0 p-0 gap-0 overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-400 to-amber-400" />

        <div className="p-5">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-2 animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 mb-2">
              <Activity className="w-3 h-3 text-red-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                {triggerLabel}
              </span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {activeWarning.symptomName}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{activeWarning.emoji}</p>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                <Calendar className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-900 mb-1">
                  Frequency Summary
                </p>
                <p className="text-sm text-red-800 leading-relaxed">
                  {triggerDescription}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-red-100/80">
                  <Activity className="w-3 h-3 text-red-600" />
                  <span className="text-[11px] font-semibold text-red-700">
                    {activeWarning.count}x in {activeWarning.windowDays} days
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3 mb-4">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Stethoscope className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">
              {recommendation}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleDismiss}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:from-red-600 hover:to-orange-600 transition-all active:scale-[0.97]"
            >
              <Eye className="w-4 h-4" />
              I Understand
            </button>

            <button
              onClick={handleViewLogs}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.97]"
            >
              <Calendar className="w-4 h-4" />
              View Symptom Logs
            </button>

            <button
              onClick={handleDismissAll}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-gray-400 text-sm font-medium hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <X className="w-3.5 h-3.5" />
              Dismiss All Warnings
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
