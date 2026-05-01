import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useMedicineReminder } from "@/hooks/useMedicineReminder";
import { useAppointments } from "@/hooks/useAppointments";
import { usePregnancyDashboard } from "@/hooks/usePregnancyDashboard";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import ScrollReveal from "@/components/ScrollReveal";
import {
  ArrowLeft,
  Pill,
  History,
  CalendarDays,
  FileText,
  Calendar as CalendarIcon,
  CalendarCheck,
  AlertTriangle,
  Bell,
  BellOff,
} from "lucide-react";
import MaternityCareLogHeader from "@/components/maternity/carelog/MaternityCareLogHeader";
import MaternityCareLogGrid from "@/components/maternity/carelog/MaternityCareLogGrid";
import { CareCardData } from "@/components/maternity/carelog/MaternityCareCard";

type Tab = "today" | "medicines" | "history" | "tests" | "appointments" | "anc";

const CARE_LOG_ROUTES: Record<string, string> = {
  today: "/medicine-reminder",
  medicines: "/medicine-reminder",
  history: "/health-log",
  tests: "/vaccine-tracker",
  appointments: "/calendar",
  anc: "/pregnancy-dashboard"
};

// ─── Notification Banner ────────────────────────────────────────────────────────

function NotificationBanner({
  permission,
  onRequest,
}: {
  permission: NotificationPermission;
  onRequest: () => void;
}) {
  if (permission === "granted") return null;
  return (
    <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 flex items-start gap-4 animate-fadeIn">
      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
        {permission === "denied" ? (
          <BellOff className="w-5 h-5 text-amber-600" />
        ) : (
          <Bell className="w-5 h-5 text-amber-600" />
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm text-amber-900">
          {permission === "denied" ? "Notifications Blocked" : "Enable Notifications"}
        </h3>
        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
          {permission === "denied"
            ? "Notifications are blocked. Please enable them in your browser settings to receive care log reminders."
            : "Allow notifications so we can remind you when it's time to take your medicines."}
        </p>
        {permission !== "denied" && (
          <button
            onClick={onRequest}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow-sm hover:bg-amber-700 transition-all active:scale-[0.97]"
          >
            <Bell className="w-3.5 h-3.5" />
            Allow Notifications
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function MedicineReminder() {
  const navigate = useNavigate();
  const { phase, setPhase } = usePhase();

  // Route guard: only allow access in maternity phase
  if (phase !== "maternity") {
    return (
      <div className="min-h-screen py-12 bg-background">
        <div className="container max-w-2xl">
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Feature Not Available</h2>
            <p className="text-sm text-muted-foreground mb-6">
              The Care Log with Tests & Scans is only available during the Maternity phase.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    medicines,
    notificationPermission,
    getTodayStats,
    getAdherenceRate,
    requestNotificationPermission,
  } = useMedicineReminder();

  const {
    stats: appointmentStats,
  } = useAppointments();

  // ANC Timeline data (maternity only)
  const { currentWeek } = usePregnancyProfile();
  const dash = usePregnancyDashboard(currentWeek || 1);

  useEffect(() => {
    setPhase("maternity");
  }, [setPhase]);

  const todayStats = getTodayStats();
  const adherenceRate = getAdherenceRate(30);

  // Care log cards data
  const careCards: CareCardData[] = [
    {
      id: "today",
      title: "Today Medicines",
      description: "View your scheduled doses for today and track your progress",
      icon: CalendarDays,
      iconBg: "bg-gradient-to-br from-purple-100 to-violet-100",
      iconColor: "text-purple-600",
      accentColor: "bg-gradient-to-r from-purple-500 to-violet-500",
      badge: todayStats.total > 0 ? `${todayStats.taken}/${todayStats.total} taken` : undefined,
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      id: "medicines",
      title: "Medicines",
      description: "Manage your prescribed medicines and dosage schedules",
      icon: Pill,
      iconBg: "bg-gradient-to-br from-pink-100 to-rose-100",
      iconColor: "text-pink-600",
      accentColor: "bg-gradient-to-r from-pink-500 to-rose-500",
      badge: `${medicines.length} added`,
      badgeColor: "bg-pink-100 text-pink-700",
    },
    {
      id: "history",
      title: "History",
      description: "Review your medicine adherence and past dose records",
      icon: History,
      iconBg: "bg-gradient-to-br from-emerald-100 to-green-100",
      iconColor: "text-emerald-600",
      accentColor: "bg-gradient-to-r from-emerald-500 to-green-500",
      badge: `${adherenceRate}% adherence`,
      badgeColor: "bg-emerald-100 text-emerald-700",
    },
    ...(phase === "maternity" ? [
      {
        id: "tests",
        title: "Tests & Scans",
        description: "Track recommended maternal tests and scan schedules",
        icon: FileText,
        iconBg: "bg-gradient-to-br from-blue-100 to-cyan-100",
        iconColor: "text-blue-600",
        accentColor: "bg-gradient-to-r from-blue-500 to-cyan-500",
      } as CareCardData,
    ] : []),
    ...(phase === "maternity" ? [
      {
        id: "appointments",
        title: "Appointments",
        description: "Schedule and manage your doctor checkups and visits",
        icon: CalendarIcon,
        iconBg: "bg-gradient-to-br from-orange-100 to-amber-100",
        iconColor: "text-orange-600",
        accentColor: "bg-gradient-to-r from-orange-500 to-amber-500",
        badge: appointmentStats.total > 0 ? `${appointmentStats.total} scheduled` : undefined,
        badgeColor: "bg-orange-100 text-orange-700",
      } as CareCardData,
    ] : []),
    ...(phase === "maternity" ? [
      {
        id: "anc",
        title: "ANC Visits",
        description: "Track your antenatal care visits and NHM guidelines",
        icon: CalendarCheck,
        iconBg: "bg-gradient-to-br from-violet-100 to-purple-100",
        iconColor: "text-violet-600",
        accentColor: "bg-gradient-to-r from-violet-500 to-purple-500",
        badge: `${dash.ancCompletedCount}/8 visits`,
        badgeColor: "bg-violet-100 text-violet-700",
      } as CareCardData,
    ] : []),
  ];

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-6xl">
        <MaternityCareLogHeader />

        <div className="space-y-5">
          {/* Notification banner */}
          <ScrollReveal>
            <NotificationBanner
              permission={notificationPermission}
              onRequest={requestNotificationPermission}
            />
          </ScrollReveal>

          {/* Card Grid Navigation */}
          <ScrollReveal delay={50}>
            <MaternityCareLogGrid
              cards={careCards}
              routeMapping={CARE_LOG_ROUTES}
              onNavigate={navigate}
              delay={50}
            />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
