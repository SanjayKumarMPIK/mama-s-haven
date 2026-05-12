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
    if (!isMaternityRoute()) return null;
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
  }, [isMaternity, isDeliveryDone, dueReminder, activeRecommendation, getTestForReminder]);

  // Request popup queue slot when there's a test to show
  useEffect(() => {
    if (!testToShow || !isMaternityRoute() || sessionDismissedRef.current) {
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
  }, [testToShow, requestShow]);

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
    setTimeout(() => navigate("/maternity"), 400);
  }, [closePopup, navigate]);

  if (!visible || !currentTest) return null;
  if (!isMaternityRoute()) return null;

  const isHighPriority = HIGH_PRIORITY_TESTS.includes(currentTest.id);
  const categoryColor = CATEGORY_COLORS[currentTest.category];
  const emoji = getTestCategoryEmoji(currentTest.category);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-auto">
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${slideIn ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={closePopup}
      />

      <div
        className={`relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden transition-all duration-500 ${slideIn ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-8 opacity-0"}`}
        style={{
          boxShadow: isHighPriority
            ? "0 25px 80px rgba(124, 58, 237, 0.25), 0 10px 30px rgba(124, 58, 237, 0.15)"
            : "0 25px 80px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className={`h-1.5 ${isHighPriority
            ? "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
            : "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
          }`}
        />

        <button
          onClick={closePopup}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all z-10 pointer-events-auto"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
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

  return (
    <>
      <div className="flex flex-col items-center text-center mb-5">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 ${
            isDueReminder
              ? "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200/50"
              : isHighPriority
                ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-200/50"
                : "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-200/50"
          }`}
        >
          {isDueReminder ? (
            <BellRing className="w-8 h-8 text-white animate-swing" />
          ) : (
            <span className="text-3xl">{emoji}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          {isDueReminder ? (
            <Clock className="w-4 h-4 text-amber-500" />
          ) : (
            <Sparkles className={`w-4 h-4 ${isHighPriority ? "text-violet-500" : "text-blue-500"}`} />
          )}
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isDueReminder ? "text-amber-600" : isHighPriority ? "text-violet-600" : "text-blue-600"
            }`}
          >
            {isDueReminder ? "Scheduled Test Reminder" : "Test Reminder"}
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 leading-tight">{test.title}</h2>
      </div>

      <div
        className={`rounded-2xl border p-4 mb-4 ${
          isHighPriority
            ? "bg-violet-50/80 border-violet-200"
            : "bg-blue-50/80 border-blue-200"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Calendar className={`w-4 h-4 ${isHighPriority ? "text-violet-600" : "text-blue-600"}`} />
          <span className={`text-xs font-semibold ${isHighPriority ? "text-violet-700" : "text-blue-700"}`}>
            {weekLabel} &middot; Current: Week {currentWeek}
          </span>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {isDueReminder
            ? `Today is your scheduled reminder for your ${test.title}.`
            : `Your ${test.title} is recommended during ${weekLabel}. You are currently at Week ${currentWeek}.`
          }
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 p-3.5 mb-5">
        <HeartPulse className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-600 leading-relaxed">{test.whyItMatters}</p>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
        >
          {test.category}
        </span>
        {isHighPriority && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            High Priority
          </span>
        )}
        {test.optional && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            Optional
          </span>
        )}
      </div>

      <div className="space-y-2.5">
        <button
          onClick={onMarkDone}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-md shadow-emerald-200/50 hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.97]"
        >
          <ShieldCheck className="w-5 h-5" />
          Mark as Done
        </button>

        <button
          onClick={onSetReminder}
          className={`w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-white font-semibold shadow-md transition-all active:scale-[0.97] ${
            isHighPriority
              ? "bg-gradient-to-r from-violet-500 to-purple-600 shadow-purple-200/50 hover:shadow-lg hover:from-violet-600 hover:to-purple-700"
              : "bg-gradient-to-r from-blue-500 to-cyan-600 shadow-blue-200/50 hover:shadow-lg hover:from-blue-600 hover:to-cyan-700"
          }`}
        >
          <CalendarDays className="w-5 h-5" />
          Set Reminder
        </button>

        <button
          onClick={onRemindLater}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition-all active:scale-[0.97]"
        >
          <Bell className="w-4.5 h-4.5" />
          Remind Me Later
          <span className="text-[10px] font-medium text-amber-500 ml-1">(5 days)</span>
        </button>

        <button
          onClick={onViewCareLog}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          View in CareLog
        </button>

        <button
          onClick={onIgnore}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-2xl text-gray-400 text-sm font-medium hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          <BellOff className="w-4 h-4" />
          Don't remind me for this test
        </button>
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
