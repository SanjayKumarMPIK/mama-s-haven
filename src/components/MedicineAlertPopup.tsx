import { useState, useEffect } from "react";
import { useMedicineReminder } from "@/hooks/useMedicineReminder";
import { Pill, CheckCircle2, AlarmClock, X, ChevronDown, Timer } from "lucide-react";

/**
 * Full-screen in-app alert popup that appears when a medicine dose is due.
 * Shows action buttons: Take, Snooze (5/10/30 min), Dismiss.
 * Renders globally — place in App.tsx alongside <Toaster />.
 */
export default function MedicineAlertPopup() {
  const {
    activeAlert,
    markAsTaken,
    snoozeDose,
    dismissAlert,
    MAX_SNOOZE_COUNT,
  } = useMedicineReminder();

  const [showSnooze, setShowSnooze] = useState(false);
  const [slideIn, setSlideIn] = useState(false);

  useEffect(() => {
    if (activeAlert) {
      requestAnimationFrame(() => setSlideIn(true));
      setShowSnooze(false);
    } else {
      setSlideIn(false);
    }
  }, [activeAlert]);

  if (!activeAlert) return null;

  const handleTake = () => {
    markAsTaken(activeAlert.id);
  };

  const handleSnooze = (min: number) => {
    snoozeDose(activeAlert.id, min);
    setShowSnooze(false);
  };

  const canSnooze = activeAlert.snoozeCount < MAX_SNOOZE_COUNT;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300 ${
          slideIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={dismissAlert}
      />

      {/* Alert Card */}
      <div
        className={`relative w-full max-w-sm rounded-3xl border border-purple-200 bg-white shadow-2xl shadow-purple-200/30 overflow-hidden transition-all duration-500 ${
          slideIn ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-8 opacity-0"
        }`}
      >
        {/* Top glow bar */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 animate-pulse" />

        <div className="p-6">
          {/* Dismiss button */}
          <button
            onClick={dismissAlert}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon + title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-200/50 mb-4 animate-bounce">
              <Pill className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Time for Your Medicine!</h2>
            <p className="text-sm text-gray-500 mt-1">
              Scheduled at <strong>{activeAlert.scheduledTime}</strong>
            </p>
          </div>

          {/* Medicine info */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-100 p-4 mb-6">
            <h3 className="text-lg font-bold text-purple-900">{activeAlert.medicineName}</h3>
            <p className="text-sm text-purple-600 mt-0.5">{activeAlert.dosage}</p>
            {activeAlert.snoozeCount > 0 && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                ⏰ Snoozed {activeAlert.snoozeCount}/{MAX_SNOOZE_COUNT} times
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Take button */}
            <button
              onClick={handleTake}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-md shadow-emerald-200/50 hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.97]"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark as Taken ✅
            </button>

            {/* Snooze */}
            <div>
              <button
                onClick={() => setShowSnooze(!showSnooze)}
                disabled={!canSnooze}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <AlarmClock className="w-5 h-5" />
                Snooze ⏰
                <ChevronDown className={`w-4 h-4 transition-transform ${showSnooze ? "rotate-180" : ""}`} />
              </button>

              {showSnooze && (
                <div className="mt-2 grid grid-cols-3 gap-2 animate-fadeIn">
                  {[5, 10, 30].map((min) => (
                    <button
                      key={min}
                      onClick={() => handleSnooze(min)}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-all active:scale-[0.95]"
                    >
                      <Timer className="w-3.5 h-3.5" />
                      {min} min
                    </button>
                  ))}
                </div>
              )}

              {!canSnooze && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Maximum snoozes reached
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
