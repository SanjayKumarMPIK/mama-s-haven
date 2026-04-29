// ─── Smart Maternal Test Recommendation Popup ────────────────────────────────
// Center-screen modal that intelligently recommends maternal tests/scans
// based on pregnancy week progression. Integrates with the existing
// Care Log architecture — NO duplicate pages or modules.

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  useMaternalTestReminders,
  getTestCategoryEmoji,
  HIGH_PRIORITY_TESTS,
  type MaternalTestReminder,
} from "@/hooks/useMaternalTestReminders";
import { MATERNAL_TESTS, CATEGORY_COLORS, type MaternalTest } from "@/lib/maternalTestsData";
import {
  X, Calendar, BellRing, Bell, BellOff, CheckCircle2,
  AlertCircle, Clock, Stethoscope, CalendarDays, RefreshCw,
  ChevronRight, Sparkles, ShieldCheck, HeartPulse,
} from "lucide-react";

// ─── Sub-views ───────────────────────────────────────────────────────────────

type PopupView = "recommendation" | "date-picker" | "reminder-confirmation" | "due-reminder";

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MaternalTestRecommendationPopup() {
  const {
    activeRecommendation,
    dueReminder,
    ignoreTest,
    remindLater,
    scheduleReminder,
    completeTest,
    rescheduleReminder,
    markPopupShown,
    markAllEligibleShown,
    getTestForReminder,
    getDateRange,
    currentWeek,
    lmp,
    today,
    isMaternity,
  } = useMaternalTestReminders();

  const [visible, setVisible] = useState(false);
  const [slideIn, setSlideIn] = useState(false);
  const [view, setView] = useState<PopupView>("recommendation");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentTest, setCurrentTest] = useState<MaternalTest | null>(null);
  const [currentReminder, setCurrentReminder] = useState<MaternalTestReminder | null>(null);

  // Session-level guard: once user dismisses ANY popup, stop showing more until next page load
  const sessionDismissed = useRef(false);

  // Route restriction: only show on relevant maternity pages
  const location = useLocation();
  const allowedRoutes = ["/pregnancy-dashboard", "/maternity", "/calendar", "/health-log"];
  const isAllowedRoute = allowedRoutes.some((route) => location.pathname.startsWith(route));

  // Determine what to show (with 1.5s delay to let page settle)
  useEffect(() => {
    if (!isMaternity || !isAllowedRoute || sessionDismissed.current) {
      setVisible(false);
      setSlideIn(false);
      return;
    }

    // Determine which test/reminder to show
    let testToShow: MaternalTest | null = null;
    let reminderToShow: MaternalTestReminder | null = null;
    let viewToShow: PopupView = "recommendation";

    // Priority 1: Due reminder for today
    if (dueReminder) {
      const test = getTestForReminder(dueReminder);
      if (test) {
        testToShow = test;
        reminderToShow = dueReminder;
        viewToShow = "due-reminder";
      }
    }

    // Priority 2: Active recommendation
    if (!testToShow && activeRecommendation) {
      testToShow = activeRecommendation;
      viewToShow = "recommendation";
    }

    if (!testToShow) {
      setVisible(false);
      setSlideIn(false);
      return;
    }

    // Delay popup by 1.5s so the user isn't immediately blocked
    const timer = setTimeout(() => {
      if (sessionDismissed.current) return;
      setCurrentTest(testToShow);
      setCurrentReminder(reminderToShow);
      setView(viewToShow);
      setVisible(true);
      requestAnimationFrame(() => setSlideIn(true));
    }, 1500);

    return () => clearTimeout(timer);
  }, [isMaternity, isAllowedRoute, dueReminder, activeRecommendation, getTestForReminder]);

  // Date range for test window
  const dateRange = useMemo(() => {
    if (!currentTest || !lmp) return null;
    return getDateRange(currentTest);
  }, [currentTest, lmp, getDateRange]);

  // ─── Handlers ──────────────────────────────────────────────────────────

  const closePopup = useCallback(() => {
    sessionDismissed.current = true;
    setSlideIn(false);
    setTimeout(() => {
      setVisible(false);
      setView("recommendation");
      setSelectedDate("");
    }, 300);
  }, []);

  const handleIgnore = useCallback(() => {
    if (currentTest) {
      ignoreTest(currentTest.id);
      closePopup();
    }
  }, [currentTest, ignoreTest, closePopup]);

  const handleRemindLater = useCallback(() => {
    if (currentTest) {
      remindLater(currentTest.id);
      closePopup();
    }
  }, [currentTest, remindLater, closePopup]);

  const handleSetReminder = useCallback(() => {
    setView("date-picker");
    // Pre-populate with midpoint of test window
    if (dateRange) {
      const start = new Date(dateRange.startDate + "T00:00:00");
      const end = new Date(dateRange.endDate + "T00:00:00");
      const mid = new Date(start.getTime() + (end.getTime() - start.getTime()) / 2);
      const midISO = mid.toISOString().slice(0, 10);
      // Ensure mid is not before today
      setSelectedDate(midISO < today ? today : midISO);
    }
  }, [dateRange, today]);

  const handleConfirmDate = useCallback(() => {
    if (currentTest && selectedDate) {
      scheduleReminder(currentTest.id, selectedDate);
      setView("reminder-confirmation");
    }
  }, [currentTest, selectedDate, scheduleReminder]);

  const handleCompleteTest = useCallback(() => {
    if (currentTest) {
      completeTest(currentTest.id);
      closePopup();
    }
  }, [currentTest, completeTest, closePopup]);

  const handleReschedule = useCallback(() => {
    if (currentTest) {
      setView("date-picker");
    }
  }, [currentTest]);

  const handleDismissRecommendation = useCallback(() => {
    // Mark ALL eligible tests as shown so no cascading popups occur
    markAllEligibleShown();
    closePopup();
  }, [markAllEligibleShown, closePopup]);

  // ─── Render ────────────────────────────────────────────────────────────

  if (!visible || !currentTest) return null;

  const isHighPriority = HIGH_PRIORITY_TESTS.includes(currentTest.id);
  const categoryColor = CATEGORY_COLORS[currentTest.category];
  const emoji = getTestCategoryEmoji(currentTest.category);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${slideIn ? "opacity-100" : "opacity-0"
          }`}
        onClick={handleDismissRecommendation}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden transition-all duration-500 ${slideIn ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-8 opacity-0"
          }`}
        style={{
          boxShadow: isHighPriority
            ? "0 25px 80px rgba(124, 58, 237, 0.25), 0 10px 30px rgba(124, 58, 237, 0.15)"
            : "0 25px 80px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Top accent bar */}
        <div
          className={`h-1.5 ${isHighPriority
              ? "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
              : "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
            }`}
        />

        {/* Close button */}
        <button
          onClick={handleDismissRecommendation}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content area */}
        <div className="p-6">
          {view === "recommendation" && (
            <RecommendationView
              test={currentTest}
              currentWeek={currentWeek}
              emoji={emoji}
              categoryColor={categoryColor}
              isHighPriority={isHighPriority}
              onIgnore={handleIgnore}
              onRemindLater={handleRemindLater}
              onSetReminder={handleSetReminder}
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
              onBack={() => setView(currentReminder ? "due-reminder" : "recommendation")}
            />
          )}

          {view === "reminder-confirmation" && (
            <ConfirmationView
              test={currentTest}
              selectedDate={selectedDate}
              emoji={emoji}
              onClose={closePopup}
            />
          )}

          {view === "due-reminder" && (
            <DueReminderView
              test={currentTest}
              emoji={emoji}
              categoryColor={categoryColor}
              isHighPriority={isHighPriority}
              onComplete={handleCompleteTest}
              onReschedule={handleReschedule}
              onIgnore={handleIgnore}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Recommendation View ─────────────────────────────────────────────────────

function RecommendationView({
  test,
  currentWeek,
  emoji,
  categoryColor,
  isHighPriority,
  onIgnore,
  onRemindLater,
  onSetReminder,
}: {
  test: MaternalTest;
  currentWeek: number;
  emoji: string;
  categoryColor: { bg: string; text: string; border: string };
  isHighPriority: boolean;
  onIgnore: () => void;
  onRemindLater: () => void;
  onSetReminder: () => void;
}) {
  return (
    <>
      {/* Header icon */}
      <div className="flex flex-col items-center text-center mb-5">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg mb-4 ${isHighPriority
              ? "bg-gradient-to-br from-violet-500 to-purple-600 shadow-purple-200/50"
              : "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-200/50"
            }`}
        >
          <span className="text-3xl">{emoji}</span>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className={`w-4 h-4 ${isHighPriority ? "text-violet-500" : "text-blue-500"}`} />
          <span
            className={`text-xs font-bold uppercase tracking-wider ${isHighPriority ? "text-violet-600" : "text-blue-600"
              }`}
          >
            Recommendation Available
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 leading-tight">{test.title}</h2>
      </div>

      {/* Week info card */}
      <div
        className={`rounded-2xl border p-4 mb-4 ${isHighPriority
            ? "bg-violet-50/80 border-violet-200"
            : "bg-blue-50/80 border-blue-200"
          }`}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          You have entered <strong className="text-gray-900">Week {currentWeek}</strong>.
        </p>
        <p className="text-sm text-gray-700 leading-relaxed mt-1.5">
          Your <strong className="text-gray-900">{test.title}</strong> is recommended during{" "}
          <strong className="text-gray-900">
            Week {test.weekStart}–{test.weekEnd}
          </strong>{" "}
          based on maternal care guidelines.
        </p>
      </div>

      {/* Why it matters */}
      <div className="flex items-start gap-3 rounded-xl bg-gray-50 border border-gray-100 p-3.5 mb-5">
        <HeartPulse className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
        <p className="text-xs text-gray-600 leading-relaxed">{test.whyItMatters}</p>
      </div>

      {/* Category + priority badges */}
      <div className="flex items-center gap-2 mb-5">
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
        >
          {test.category}
        </span>
        {isHighPriority && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            ⚡ High Priority
          </span>
        )}
        {test.optional && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
            Optional
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="space-y-2.5">
        {/* Set Reminder — primary */}
        <button
          onClick={onSetReminder}
          className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-semibold shadow-md transition-all active:scale-[0.97] ${isHighPriority
              ? "bg-gradient-to-r from-violet-500 to-purple-600 shadow-purple-200/50 hover:shadow-lg hover:from-violet-600 hover:to-purple-700"
              : "bg-gradient-to-r from-blue-500 to-cyan-600 shadow-blue-200/50 hover:shadow-lg hover:from-blue-600 hover:to-cyan-700"
            }`}
        >
          <CalendarDays className="w-5 h-5" />
          Set Reminder
        </button>

        {/* Remind Later */}
        <button
          onClick={onRemindLater}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition-all active:scale-[0.97]"
        >
          <Bell className="w-4.5 h-4.5" />
          Remind Me Later
          <span className="text-[10px] font-medium text-amber-500 ml-1">(5 days)</span>
        </button>

        {/* Ignore */}
        <button
          onClick={onIgnore}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-gray-400 text-sm font-medium hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          <BellOff className="w-4 h-4" />
          Don't remind me for this test
        </button>
      </div>
    </>
  );
}

// ─── Date Picker View ────────────────────────────────────────────────────────

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
    ? dateRange.startDate < today
      ? today
      : dateRange.startDate
    : today;
  const maxDate = dateRange ? dateRange.endDate : "";

  const isValid = selectedDate >= minDate && (!maxDate || selectedDate <= maxDate);

  // Format dates for display
  const formatDisplayDate = (iso: string) => {
    if (!iso) return "";
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
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

      {/* Valid date range info */}
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

      {/* Date input */}
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
          className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 transition-all ${isValid
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

      {/* Confirm */}
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
  selectedDate,
  emoji,
  onClose,
}: {
  test: MaternalTest;
  selectedDate: string;
  emoji: string;
  onClose: () => void;
}) {
  const formatDisplayDate = (iso: string) => {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="text-center">
      {/* Success animation */}
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5 animate-scaleIn">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Reminder Set! ✨</h2>
      <p className="text-sm text-gray-600 mb-5">
        Your reminder for <strong>{test.title}</strong> has been scheduled.
      </p>

      {/* Reminder card */}
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{emoji}</span>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-emerald-900">{test.title}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <p className="text-xs text-emerald-700">{formatDisplayDate(selectedDate)}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mb-5">
        You'll see this reminder on your calendar and receive a popup on the scheduled date.
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

// ─── Due Reminder View ───────────────────────────────────────────────────────

function DueReminderView({
  test,
  emoji,
  categoryColor,
  isHighPriority,
  onComplete,
  onReschedule,
  onIgnore,
}: {
  test: MaternalTest;
  emoji: string;
  categoryColor: { bg: string; text: string; border: string };
  isHighPriority: boolean;
  onComplete: () => void;
  onReschedule: () => void;
  onIgnore: () => void;
}) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-200/50 mb-4">
          <BellRing className="w-8 h-8 text-white animate-swing" />
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Scheduled Test Reminder
          </span>
        </div>

        <h2 className="text-xl font-bold text-gray-900 leading-tight">{test.title}</h2>
      </div>

      {/* Reminder info */}
      <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4 mb-4">
        <p className="text-sm text-gray-700 leading-relaxed">
          Today is your scheduled <strong className="text-gray-900">{test.title}</strong> reminder.
        </p>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          {test.whyItMatters}
        </p>
      </div>

      {/* Category badge */}
      <div className="flex items-center gap-2 mb-5">
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
        >
          {test.category}
        </span>
        {isHighPriority && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            ⚡ High Priority
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        {/* Mark Complete — primary */}
        <button
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-md shadow-emerald-200/50 hover:shadow-lg hover:from-emerald-600 hover:to-emerald-700 transition-all active:scale-[0.97]"
        >
          <ShieldCheck className="w-5 h-5" />
          Mark as Complete
        </button>

        {/* Reschedule */}
        <button
          onClick={onReschedule}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-blue-300 text-blue-700 font-semibold hover:bg-blue-50 transition-all active:scale-[0.97]"
        >
          <RefreshCw className="w-4.5 h-4.5" />
          Reschedule
        </button>

        {/* Ignore */}
        <button
          onClick={onIgnore}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-gray-400 text-sm font-medium hover:text-gray-600 hover:bg-gray-50 transition-all"
        >
          <BellOff className="w-4 h-4" />
          Ignore
        </button>
      </div>
    </>
  );
}
