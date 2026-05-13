// ─── Maternity Test & Scan Reminder Popup ────────────────────────────────────
// Screen popup that shows test/scan reminders from CareLog → Tests & Scans.
// Strictly maternity-phase only. Queue-based, one-at-a-time display.
// Handles GTT specially with GDM status updates.
// Never affects SOS, other modules, or global notification systems.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMaternalTestReminders,
  getTestCategoryEmoji,
  HIGH_PRIORITY_TESTS,
  type MaternalTestReminder,
} from "@/hooks/useMaternalTestReminders";
import { MATERNAL_TESTS, CATEGORY_COLORS, type MaternalTest } from "@/lib/maternalTestsData";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { useMaternityPopupQueue } from "@/hooks/useMaternityPopupQueue";
import { isMaternityRoute } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import {
  X, Calendar, BellRing, Bell, BellOff, CheckCircle2,
  AlertCircle, Clock, Stethoscope, CalendarDays, RefreshCw,
  ChevronRight, Sparkles, ShieldCheck, HeartPulse, ExternalLink,
} from "lucide-react";

type PopupView = "reminder" | "gtt-result" | "date-picker" | "confirmation";

export default function MaternityTestScanReminderPopup() {
  const {
    activeRecommendation,
    dueReminder,
    ignoreTest,
    remindLater,
    scheduleReminder,
    completeTest,
    markPopupShown,
    getTestForReminder,
    getDateRange,
    currentWeek,
    lmp,
    today,
    isMaternity,
  } = useMaternalTestReminders();

  const { profile, mode, setGDMStatus, markGTTQuestionCompleted } = usePregnancyProfile();
  const { activePopup, requestShow, notifyDismissed, cancelRequest } = useMaternityPopupQueue();

  const navigate = useNavigate();
  const location = useLocation();

  const [visible, setVisible] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [view, setView] = useState<PopupView>("reminder");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentTest, setCurrentTest] = useState<MaternalTest | null>(null);
  const [currentReminder, setCurrentReminder] = useState<MaternalTestReminder | null>(null);

  const triggerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const sessionDismissedRef = useRef(false);

  const isDeliveryDone = profile.delivery.isDelivered || mode !== "pregnancy";

  // Reset session guard on mount (page refresh)
  useEffect(() => {
    mountedRef.current = true;
    sessionDismissedRef.current = false;
    return () => { mountedRef.current = false; };
  }, []);

  // Determine which test to show
  const testToShow = useMemo<{
    test: MaternalTest;
    reminder: MaternalTestReminder | null;
  } | null>(() => {
    if (!isMaternity || isDeliveryDone) return null;
    if (!isMaternityRoute(location.pathname)) return null;
    if (sessionDismissedRef.current) return null;

    // Priority 1: Due reminder for today
    if (dueReminder) {
      const test = getTestForReminder(dueReminder);
      if (test) return { test, reminder: dueReminder };
    }

    // Priority 2: Active recommendation (not already shown today)
    if (activeRecommendation) {
      return { test: activeRecommendation, reminder: null };
    }

    return null;
  }, [isMaternity, isDeliveryDone, dueReminder, activeRecommendation, getTestForReminder, location.pathname]);

  // Request popup queue slot when there's a test to show
  useEffect(() => {
    if (!testToShow || !isMaternityRoute(location.pathname) || sessionDismissedRef.current) {
      if (triggerTimerRef.current) {
        clearTimeout(triggerTimerRef.current);
        triggerTimerRef.current = null;
      }
      return;
    }

    if (triggerTimerRef.current) {
      clearTimeout(triggerTimerRef.current);
      triggerTimerRef.current = null;
    }

    triggerTimerRef.current = setTimeout(() => {
      if (mountedRef.current && !sessionDismissedRef.current) {
        requestShow("test-reminder");
      }
    }, 1500);

    return () => {
      if (triggerTimerRef.current) {
        clearTimeout(triggerTimerRef.current);
        triggerTimerRef.current = null;
      }
    };
  }, [testToShow, requestShow, location.pathname]);

  // Open popup when queue allows
  useEffect(() => {
    if (activePopup === "test-reminder" && testToShow && !visible) {
      setCurrentTest(testToShow.test);
      setCurrentReminder(testToShow.reminder);
      setView(testToShow.reminder ? "reminder" : "reminder");
      setVisible(true);
      requestAnimationFrame(() => {
        if (mountedRef.current) setSlideIn(true);
      });
    }
  }, [activePopup, testToShow, visible]);

  // Slide-out animation on close + prevent re-show in same session
  const closePopup = useCallback(() => {
    sessionDismissedRef.current = true;
    notifyDismissed("test-reminder");
    setSlideIn(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setVisible(false);
        setView("reminder");
        setSelectedDate("");
      }
    }, 300);
  }, [notifyDismissed]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (triggerTimerRef.current) clearTimeout(triggerTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      cancelRequest("test-reminder");
    };
  }, [cancelRequest]);

  const handleMarkDone = useCallback(() => {
    if (!currentTest) return;
    // GTT needs result collection
    if (currentTest.id === "gtt") {
      setView("gtt-result");
    } else {
      completeTest(currentTest.id);
      setView("confirmation");
    }
  }, [currentTest, completeTest]);

  const handleGTTConfirmed = useCallback(() => {
    if (!currentTest) return;
    setGDMStatus("confirmed");
    markGTTQuestionCompleted();
    completeTest("gtt");
    setView("confirmation");
  }, [currentTest, setGDMStatus, markGTTQuestionCompleted, completeTest]);

  const handleGTTNormal = useCallback(() => {
    if (!currentTest) return;
    setGDMStatus("negative");
    markGTTQuestionCompleted();
    completeTest("gtt");
    setView("confirmation");
  }, [currentTest, setGDMStatus, markGTTQuestionCompleted, completeTest]);

  const handleGTTWaiting = useCallback(() => {
    if (!currentTest) return;
    setGDMStatus("not_sure");
    setView("reminder");
  }, [currentTest, setGDMStatus]);

  const handleIgnore = useCallback(() => {
    if (currentTest) {
      ignoreTest(currentTest.id);
      closePopup();
    }
  }, [currentTest, ignoreTest, closePopup]);

  const handleRemindLater = useCallback(() => {
    if (currentTest) {
      remindLater(currentTest.id);
      markPopupShown(currentTest.id);
      closePopup();
    }
  }, [currentTest, remindLater, markPopupShown, closePopup]);

  const dateRange = useMemo(() => {
    if (!currentTest || !lmp) return null;
    return getDateRange(currentTest);
  }, [currentTest, lmp, getDateRange]);

  const handleSetReminder = useCallback(() => {
    setView("date-picker");
    if (dateRange) {
      const start = new Date(dateRange.startDate + "T00:00:00");
      const end = new Date(dateRange.endDate + "T00:00:00");
      const mid = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);
      const midISO = mid.toISOString().slice(0, 10);
      setSelectedDate(midISO < today ? today : midISO);
    }
  }, [dateRange, today]);

  const handleConfirmDate = useCallback(() => {
    if (currentTest && selectedDate) {
      scheduleReminder(currentTest.id, selectedDate);
      setView("confirmation");
    }
  }, [currentTest, selectedDate, scheduleReminder]);

  const handleViewCareLog = useCallback(() => {
    closePopup();
    setTimeout(() => navigate("/medicine-reminder?tab=tests"), 400);
  }, [closePopup, navigate]);

  if (!visible || !currentTest) return null;
  if (!isMaternityRoute(location.pathname)) return null;

  const isHighPriority = HIGH_PRIORITY_TESTS.includes(currentTest.id);
  const categoryColor = CATEGORY_COLORS[currentTest.category];
  const emoji = getTestCategoryEmoji(currentTest.category);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto">
      {/* Backdrop with blur */}
      <div
        className={`absolute inset-0 transition-all duration-400 ${slideIn ? "bg-black/50 backdrop-blur-md opacity-100" : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"}`}
        onClick={closePopup}
      />

      {/* Modal card */}
      <div
        className={`relative w-full max-w-[420px] rounded-[28px] overflow-hidden transition-all duration-500 ease-out ${slideIn ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-6 opacity-0"}`}
        style={{
          background: "linear-gradient(180deg, #ffffff 0%, #fafbff 100%)",
          boxShadow: isHighPriority
            ? "0 32px 64px -12px rgba(124, 58, 237, 0.28), 0 0 0 1px rgba(124, 58, 237, 0.08)"
            : "0 32px 64px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04)",
        }}
      >
        {/* Top gradient accent */}
        <div
          className={`h-1 ${isHighPriority
            ? "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-400"
            : "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400"
          }`}
          style={{ animation: slideIn ? "shimmer 2s ease-in-out infinite" : "none" }}
        />

        {/* Close button */}
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/80 backdrop-blur border border-gray-200/60 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-white hover:border-gray-300 transition-all z-10 pointer-events-auto shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content area */}
        <div className="px-6 pt-5 pb-6">
          {view === "reminder" && (
            <ReminderView
              test={currentTest}
              currentWeek={currentWeek}
              emoji={emoji}
              categoryColor={categoryColor}
              isHighPriority={isHighPriority}
              isDueReminder={!!currentReminder}
              onMarkDone={handleMarkDone}
              onSetReminder={handleSetReminder}
              onRemindLater={handleRemindLater}
              onIgnore={handleIgnore}
              onViewCareLog={handleViewCareLog}
            />
          )}

          {view === "gtt-result" && (
            <GTTResultView
              onConfirmed={handleGTTConfirmed}
              onNormal={handleGTTNormal}
              onWaiting={handleGTTWaiting}
              onBack={() => setView("reminder")}
            />
          )}

          {view === "date-picker" && (
            <DatePickerView
              test={currentTest}
              dateRange={dateRange}
              today={today}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onConfirm={handleConfirmDate}
              onBack={() => setView("reminder")}
            />
          )}

          {view === "confirmation" && (
            <ConfirmationView
              test={currentTest}
              emoji={emoji}
              onClose={closePopup}
            />
          )}
        </div>
      </div>

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.2); }
          50% { box-shadow: 0 0 16px 4px rgba(124, 58, 237, 0.15); }
        }
        @keyframes slideUpFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Reminder View ───────────────────────────────────────────────────────────

function ReminderView({
  test,
  currentWeek,
  emoji,
  categoryColor,
  isHighPriority,
  isDueReminder,
  onMarkDone,
  onSetReminder,
  onRemindLater,
  onIgnore,
  onViewCareLog,
}: {
  test: MaternalTest;
  currentWeek: number;
  emoji: string;
  categoryColor: { bg: string; text: string; border: string };
  isHighPriority: boolean;
  isDueReminder: boolean;
  onMarkDone: () => void;
  onSetReminder: () => void;
  onRemindLater: () => void;
  onIgnore: () => void;
  onViewCareLog: () => void;
}) {
  const weekLabel = `Week ${test.weekStart}${test.weekEnd > test.weekStart ? `–${test.weekEnd}` : ""}`;

  // Progress through the test window
  const windowSize = test.weekEnd - test.weekStart + 1;
  const weekInWindow = Math.max(0, Math.min(currentWeek - test.weekStart, windowSize));
  const progressPct = windowSize > 0 ? Math.round((weekInWindow / windowSize) * 100) : 0;

  return (
    <>
      {/* Header badge + icon */}
      <div className="flex flex-col items-center text-center mb-4" style={{ animation: "slideUpFadeIn 0.4s ease-out" }}>
        <div className="relative mb-4">
          <div
            className={`w-[72px] h-[72px] rounded-[22px] flex items-center justify-center shadow-xl ${
              isDueReminder
                ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200/40"
                : isHighPriority
                  ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-200/40"
                  : "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-200/40"
            }`}
            style={isHighPriority ? { animation: "pulseGlow 3s ease-in-out infinite" } : {}}
          >
            {isDueReminder ? (
              <BellRing className="w-8 h-8 text-white drop-shadow-md" style={{ animation: "swing 1.5s ease-in-out infinite" }} />
            ) : (
              <span className="text-[32px] drop-shadow-sm">{emoji}</span>
            )}
          </div>
          {/* Trimester badge on corner */}
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full px-1.5 py-0.5 shadow-md border border-gray-100">
            <span className="text-[9px] font-bold text-gray-500">T{test.trimester}</span>
          </div>
        </div>

        {/* Label */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-2.5 ${
            isDueReminder
              ? "bg-amber-50 border border-amber-200"
              : isHighPriority
                ? "bg-violet-50 border border-violet-200"
                : "bg-blue-50 border border-blue-200"
          }`}
        >
          {isDueReminder ? (
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Sparkles className={`w-3.5 h-3.5 ${isHighPriority ? "text-violet-500" : "text-blue-500"}`} />
          )}
          <span
            className={`text-[10px] font-bold uppercase tracking-widest ${
              isDueReminder ? "text-amber-600" : isHighPriority ? "text-violet-600" : "text-blue-600"
            }`}
          >
            {isDueReminder ? "Reminder Due Today" : "Recommended"}
          </span>
        </div>

        <h2 className="text-lg font-bold text-gray-900 leading-snug">{test.title}</h2>
      </div>

      {/* Pregnancy week progress card */}
      <div
        className={`rounded-2xl border p-4 mb-3.5 ${
          isHighPriority ? "bg-violet-50/60 border-violet-100" : "bg-blue-50/60 border-blue-100"
        }`}
        style={{ animation: "slideUpFadeIn 0.5s ease-out" }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isHighPriority ? "text-violet-500" : "text-blue-500"}`} />
            <span className={`text-xs font-semibold ${isHighPriority ? "text-violet-700" : "text-blue-700"}`}>
              {weekLabel}
            </span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isHighPriority ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"
          }`}>
            Week {currentWeek}
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 bg-white/80 rounded-full overflow-hidden border border-gray-200/40">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out ${
              isHighPriority
                ? "bg-gradient-to-r from-violet-400 to-purple-500"
                : "bg-gradient-to-r from-blue-400 to-cyan-500"
            }`}
            style={{ width: `${Math.min(progressPct, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-gray-400 font-medium">Wk {test.weekStart}</span>
          <span className="text-[10px] text-gray-400 font-medium">Wk {test.weekEnd}</span>
        </div>

        <p className="text-[13px] text-gray-600 leading-relaxed mt-2">
          {isDueReminder
            ? <>Today is your scheduled reminder for <strong className="text-gray-800">{test.title}</strong>.</>
            : <>This {test.category.toLowerCase()} is recommended during <strong className="text-gray-800">{weekLabel}</strong>.</>
          }
        </p>
      </div>

      {/* Why it matters */}
      <div
        className="flex items-start gap-3 rounded-xl bg-gray-50/80 border border-gray-100 p-3 mb-4"
        style={{ animation: "slideUpFadeIn 0.6s ease-out" }}
      >
        <HeartPulse className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-gray-500 leading-relaxed">{test.whyItMatters}</p>
      </div>

      {/* Category + priority badges */}
      <div className="flex items-center gap-1.5 mb-4" style={{ animation: "slideUpFadeIn 0.65s ease-out" }}>
        <span
          className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
        >
          {emoji} {test.category}
        </span>
        {isHighPriority && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            ⚡ Priority
          </span>
        )}
        {test.optional && (
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 border border-gray-200">
            Optional
          </span>
        )}
      </div>

      {/* Action buttons — 2-column grid for primary, full-width for secondary */}
      <div className="space-y-2" style={{ animation: "slideUpFadeIn 0.7s ease-out" }}>
        {/* Primary row: Already Done + Set Reminder */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onMarkDone}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-[13px] shadow-md shadow-emerald-200/40 hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.97]"
          >
            <ShieldCheck className="w-4 h-4" />
            Already Done
          </button>

          <button
            onClick={onSetReminder}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-[13px] shadow-md transition-all active:scale-[0.97] ${
              isHighPriority
                ? "bg-gradient-to-r from-violet-500 to-purple-600 shadow-purple-200/40 hover:shadow-lg hover:from-violet-600 hover:to-purple-700"
                : "bg-gradient-to-r from-blue-500 to-cyan-600 shadow-blue-200/40 hover:shadow-lg hover:from-blue-600 hover:to-cyan-700"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Set Reminder
          </button>
        </div>

        {/* Remind Later */}
        <button
          onClick={onRemindLater}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border-2 border-amber-200 text-amber-700 font-semibold text-[13px] hover:bg-amber-50/60 hover:border-amber-300 transition-all active:scale-[0.98]"
        >
          <Bell className="w-4 h-4" />
          Remind Me Later
          <span className="text-[10px] font-medium text-amber-400 ml-0.5">(5 days)</span>
        </button>

        {/* Bottom row: View CareLog + Ignore */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={onViewCareLog}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-gray-500 text-[12px] font-medium hover:text-gray-700 hover:bg-gray-50 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View in CareLog
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <button
            onClick={onIgnore}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-gray-400 text-[12px] font-medium hover:text-gray-600 hover:bg-gray-50 transition-all"
          >
            <BellOff className="w-3.5 h-3.5" />
            Ignore
          </button>
        </div>
      </div>
    </>
  );
}

// ─── GTT Result View ─────────────────────────────────────────────────────────

function GTTResultView({
  onConfirmed,
  onNormal,
  onWaiting,
  onBack,
}: {
  onConfirmed: () => void;
  onNormal: () => void;
  onWaiting: () => void;
  onBack: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">GTT Result</h2>
          <p className="text-xs text-gray-500">Glucose Tolerance Test</p>
        </div>
      </div>

      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-200/50 mb-4">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>

        <p className="text-sm text-gray-700 leading-relaxed mb-2">
          What was your <strong className="text-gray-900">GTT test outcome</strong>?
        </p>
      </div>

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

// ─── Date Picker View ─────────────────────────────────────────────────────────

function DatePickerView({
  test,
  dateRange,
  today,
  selectedDate,
  onDateChange,
  onConfirm,
  onBack,
}: {
  test: MaternalTest;
  dateRange: { startDate: string; endDate: string } | null;
  today: string;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const minDate = dateRange
    ? dateRange.startDate < today ? today : dateRange.startDate
    : today;
  const maxDate = dateRange ? dateRange.endDate : "";
  const isValid = selectedDate >= minDate && (!maxDate || selectedDate <= maxDate);

  const formatDisplayDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    });
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Schedule Reminder</h2>
          <p className="text-xs text-gray-500">{test.title}</p>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 border border-blue-100 p-3.5 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <AlertCircle className="w-4 h-4 text-blue-500" />
          <p className="text-xs font-semibold text-blue-700">Valid Test Window</p>
        </div>
        <p className="text-xs text-blue-600">
          Week {test.weekStart}–{test.weekEnd} →{" "}
          <strong>
            {formatDisplayDate(minDate)} – {maxDate ? formatDisplayDate(maxDate) : "End of window"}
          </strong>
        </p>
        <p className="text-[10px] text-blue-500 mt-1">
          You can only select dates within this timeframe.
        </p>
      </div>

      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Reminder Date
        </label>
        <input
          type="date"
          value={selectedDate}
          min={minDate}
          max={maxDate}
          onChange={(e) => onDateChange(e.target.value)}
          className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
            isValid
              ? "border-gray-200 focus:border-blue-400 focus:ring-blue-200"
              : "border-red-300 focus:border-red-400 focus:ring-red-200"
          }`}
        />
        {selectedDate && !isValid && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Please select a date within the valid test window.
          </p>
        )}
      </div>

      <button
        onClick={onConfirm}
        disabled={!selectedDate || !isValid}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-md shadow-emerald-200/50 hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <CheckCircle2 className="w-5 h-5" />
        Confirm Reminder
      </button>
    </>
  );
}

// ─── Confirmation View ───────────────────────────────────────────────────────

function ConfirmationView({
  test,
  emoji,
  onClose,
}: {
  test: MaternalTest;
  emoji: string;
  onClose: () => void;
}) {
  return (
    <div className="text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 animate-scaleIn">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Saved!</h2>
      <p className="text-sm text-gray-600 mb-5">
        Your <strong>{test.title}</strong> has been updated.
      </p>

      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-emerald-900">{test.title}</p>
            <p className="text-xs text-emerald-600">Marked as completed</p>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-2xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all active:scale-[0.97]"
      >
        Done
      </button>
    </div>
  );
}
