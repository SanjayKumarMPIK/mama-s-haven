import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useAuth } from "@/hooks/useAuth";
import { usePhase } from "@/hooks/usePhase";
import { CalendarCheck, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DISMISS_KEY = "ss-missed-log-dismissed";

/**
 * A floating reminder that appears when the user hasn't logged
 * any mood or symptoms for today. Tapping it navigates to the Calendar.
 * Dismisses for the session when closed.
 */
export default function MissedLogReminder() {
  const { logs } = useHealthLog();
  const { user } = useAuth();
  const { phase } = usePhase();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Phase-aware calendar route
  const calendarRoute = useMemo(() => {
    switch (phase) {
      case "maternity":
        return "/calendar";
      case "puberty":
        return "/calendar";
      case "menopause":
        return "/menopause/calendar";
      case "family-planning":
        return "/calendar";
      default:
        return "/calendar";
    }
  }, [phase]);

  const hasTodayLog = useMemo(() => {
    const entry = logs[todayISO];
    if (!entry) return false;
    // Check if there's actual data (not just an empty skeleton)
    const symptoms = entry.symptoms;
    const hasSymptoms = symptoms
      ? Object.values(symptoms).some(Boolean)
      : false;
    const hasMood = !!(entry as any).mood;
    const hasNotes = !!(entry as any).notes;
    return hasSymptoms || hasMood || hasNotes;
  }, [logs, todayISO]);

  // Don't show on calendar page, login, or register pages
  const isExcludedPage =
    location.pathname === "/calendar" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  // Check session dismiss
  useEffect(() => {
    try {
      const val = sessionStorage.getItem(DISMISS_KEY);
      if (val === todayISO) setDismissed(true);
    } catch {}
  }, [todayISO]);

  // Show with delay
  useEffect(() => {
    if (!user || hasTodayLog || dismissed || isExcludedPage) {
      setVisible(false);
      setAnimateIn(false);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
      // Trigger animation after a brief tick
      requestAnimationFrame(() => setAnimateIn(true));
    }, 3000);

    return () => clearTimeout(timer);
  }, [user, hasTodayLog, dismissed, isExcludedPage]);

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      setDismissed(true);
      try {
        sessionStorage.setItem(DISMISS_KEY, todayISO);
      } catch {}
    }, 300);
  }

  function handleNavigate() {
    setAnimateIn(false);
    setTimeout(() => {
      setVisible(false);
      setDismissed(true);
      try {
        sessionStorage.setItem(DISMISS_KEY, todayISO);
      } catch {}
      navigate(calendarRoute);
    }, 150);
  }

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md transition-all duration-300 ease-out",
        animateIn
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      )}
    >
      <button
        type="button"
        onClick={handleNavigate}
        className="w-full flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white p-4 shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/40 active:scale-[0.98] transition-all group"
      >
        {/* Pulsing icon */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-white" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-purple-600 animate-pulse" />
        </div>

        <div className="flex-1 text-left">
          <p className="text-sm font-semibold leading-tight">
            You haven't logged today yet! 📝
          </p>
          <p className="text-[11px] text-white/75 mt-0.5 leading-snug">
            Tap to open the calendar and track your mood & symptoms
          </p>
        </div>

        <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors shrink-0" />

        {/* Dismiss button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:bg-white transition-colors"
          aria-label="Dismiss reminder"
        >
          <X className="w-3.5 h-3.5 text-purple-700" />
        </button>
      </button>
    </div>
  );
}
