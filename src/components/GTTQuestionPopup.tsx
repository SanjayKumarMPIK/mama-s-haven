// ─── GTT Question Popup ─────────────────────────────────────────────────────────────
// Specialized popup for GTT (Glucose Tolerance Test) result tracking at 24 weeks.
// Extends the existing maternal test reminder system with GDM status handling.

import { useState, useCallback, useMemo, useEffect } from "react";
import { usePregnancyProfile, type GDMStatus } from "@/hooks/usePregnancyProfile";
import { useMaternalTestReminders } from "@/hooks/useMaternalTestReminders";
import { X, CheckCircle2, Calendar, AlertCircle, Stethoscope } from "lucide-react";

type GTTView = "question" | "result" | "reminder" | "confirmation";

export function GTTQuestionPopup() {
  const { profile, currentWeek, mode, setGDMStatus, markGTTQuestionCompleted, isGTTPopupOpen, openGTTPopup, closeGTTPopup } = usePregnancyProfile();
  const { completeTest, scheduleReminder } = useMaternalTestReminders();
  
  const [slideIn, setSlideIn] = useState(false);
  const [view, setView] = useState<GTTView>("question");

  // Auto-trigger condition: weeks 24-34, pregnancy mode only, gdmStatus is null AND gttQuestionCompleted is false
  useEffect(() => {
    if (
      mode === "pregnancy" &&
      currentWeek >= 24 &&
      currentWeek <= 34 &&
      profile.isSetup &&
      !profile.gttQuestionCompleted &&
      profile.gdmStatus === null &&
      !isGTTPopupOpen
    ) {
      // Small delay so it doesn't pop up instantly on first load
      const timer = setTimeout(() => {
        openGTTPopup();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentWeek, mode, profile.isSetup, profile.gttQuestionCompleted, profile.gdmStatus, isGTTPopupOpen, openGTTPopup]);

  // Handle slide animation
  useEffect(() => {
    if (isGTTPopupOpen) {
      // Reset view when opening
      setView("question");
      requestAnimationFrame(() => setSlideIn(true));
    } else {
      setSlideIn(false);
    }
  }, [isGTTPopupOpen]);

  const handleClose = useCallback(() => {
    setSlideIn(false);
    setTimeout(() => closeGTTPopup(), 300);
  }, [closeGTTPopup]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleAnswerYes = useCallback(() => {
    setView("result");
  }, []);

  const handleAnswerNo = useCallback(() => {
    setGDMStatus("not_done");
    setView("reminder");
  }, [setGDMStatus]);

  const handleAnswerNotSure = useCallback(() => {
    setGDMStatus("not_sure");
    setView("reminder");
  }, [setGDMStatus]);

  const handleResultConfirmed = useCallback(() => {
    setGDMStatus("confirmed");
    markGTTQuestionCompleted();
    completeTest("gtt");
    setView("confirmation");
  }, [setGDMStatus, markGTTQuestionCompleted, completeTest]);

  const handleResultNormal = useCallback(() => {
    setGDMStatus("negative");
    markGTTQuestionCompleted();
    completeTest("gtt");
    setView("confirmation");
  }, [setGDMStatus, markGTTQuestionCompleted, completeTest]);

  const handleResultWaiting = useCallback(() => {
    setGDMStatus("not_sure");
    setView("reminder");
  }, [setGDMStatus]);

  const handleSetReminder = useCallback(() => {
    // Schedule reminder for 1 week from now
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const reminderDate = nextWeek.toISOString().slice(0, 10);
    scheduleReminder("gtt", reminderDate);
    markGTTQuestionCompleted();
    setView("confirmation");
  }, [scheduleReminder, markGTTQuestionCompleted]);

  if (!isGTTPopupOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          slideIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden transition-all duration-500 ${
          slideIn ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-8 opacity-0"
        }`}
        style={{
          boxShadow: "0 25px 80px rgba(124, 58, 237, 0.25), 0 10px 30px rgba(124, 58, 237, 0.15)",
        }}
      >
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content area */}
        <div className="p-6">
          {view === "question" && (
            <QuestionView
              onYes={handleAnswerYes}
              onNo={handleAnswerNo}
              onNotSure={handleAnswerNotSure}
            />
          )}

          {view === "result" && (
            <ResultView
              onConfirmed={handleResultConfirmed}
              onNormal={handleResultNormal}
              onWaiting={handleResultWaiting}
            />
          )}

          {view === "reminder" && (
            <ReminderView onSetReminder={handleSetReminder} onClose={handleClose} />
          )}

          {view === "confirmation" && (
            <ConfirmationView onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Question View ─────────────────────────────────────────────────────────────

function QuestionView({
  onYes,
  onNo,
  onNotSure,
}: {
  onYes: () => void;
  onNo: () => void;
  onNotSure: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-200/50 mb-4">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-violet-600">
            Week 25 Check
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 leading-tight">GTT Test Update</h2>
      </div>

      {/* Message */}
      <div className="rounded-2xl bg-violet-50/80 border border-violet-200 p-4 mb-5">
        <p className="text-sm text-gray-700 leading-relaxed">
          You are now past 25 weeks of pregnancy. Have you completed your <strong className="text-gray-900">GTT test</strong>?
        </p>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          This test is typically done between weeks 24-28 to check for gestational diabetes.
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-2.5">
        <button
          onClick={onYes}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-md shadow-purple-200/50 hover:shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all active:scale-[0.97]"
        >
          <CheckCircle2 className="w-5 h-5" />
          Yes, I've completed it
        </button>

        <button
          onClick={onNo}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all active:scale-[0.97]"
        >
          No, not yet
        </button>

        <button
          onClick={onNotSure}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-gray-400 text-sm font-medium hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          Not Sure
        </button>
      </div>
    </>
  );
}

// ─── Result View ───────────────────────────────────────────────────────────────

function ResultView({
  onConfirmed,
  onNormal,
  onWaiting,
}: {
  onConfirmed: () => void;
  onNormal: () => void;
  onWaiting: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-200/50 mb-4">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Test Result
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 leading-tight">GTT Result</h2>
      </div>

      {/* Message */}
      <div className="rounded-2xl bg-blue-50/80 border border-blue-200 p-4 mb-5">
        <p className="text-sm text-gray-700 leading-relaxed">
          What was your <strong className="text-gray-900">GTT test outcome</strong>?
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-2.5">
        <button
          onClick={onConfirmed}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-semibold shadow-md shadow-rose-200/50 hover:shadow-lg hover:from-rose-600 hover:to-red-700 transition-all active:scale-[0.97]"
        >
          <AlertCircle className="w-5 h-5" />
          GDM Confirmed
        </button>

        <button
          onClick={onNormal}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-md shadow-emerald-200/50 hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.97]"
        >
          <CheckCircle2 className="w-5 h-5" />
          Normal Result
        </button>

        <button
          onClick={onWaiting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition-all active:scale-[0.97]"
        >
          Waiting for Result
        </button>
      </div>
    </>
  );
}

// ─── Reminder View ─────────────────────────────────────────────────────────────

function ReminderView({
  onSetReminder,
  onClose,
}: {
  onSetReminder: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200/50 mb-4">
          <Calendar className="w-8 h-8 text-white" />
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Set Reminder
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 leading-tight">Set Reminder</h2>
      </div>

      {/* Message */}
      <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 mb-5">
        <p className="text-sm text-gray-700 leading-relaxed">
          We'll remind you later to update your GTT result.
        </p>
      </div>

      {/* Action buttons */}
      <div className="space-y-2.5">
        <button
          onClick={onSetReminder}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold shadow-md shadow-purple-200/50 hover:shadow-lg hover:from-violet-600 hover:to-purple-700 transition-all active:scale-[0.97]"
        >
          <Calendar className="w-5 h-5" />
          Set Reminder
        </button>

        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-gray-400 text-sm font-medium hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          Close
        </button>
      </div>
    </>
  );
}

// ─── Confirmation View ─────────────────────────────────────────────────────────

function ConfirmationView({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center">
      {/* Success animation */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 animate-scaleIn">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Saved! ✨</h2>
      <p className="text-sm text-gray-600 mb-5">
        Your GTT status has been updated.
      </p>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all active:scale-[0.97]"
      >
        Done
      </button>
    </div>
  );
}
