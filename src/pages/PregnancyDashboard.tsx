import { useState, useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import MaternityRouteGuard from "@/components/MaternityRouteGuard";
import { useLanguage } from "@/hooks/useLanguage";
import { usePregnancyProfile, isValidLMP, isValidUserEDD, getEDDRange, calcWeeksAtBirth, type DeliveryData } from "@/hooks/usePregnancyProfile";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyDashboard } from "@/hooks/usePregnancyDashboard";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog } from "@/hooks/useHealthLog";
import { WEEK_DATA } from "@/lib/pregnancyData";
import { DAILY_CHECKLIST } from "@/lib/pregnancyDashboardData";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { TimelineOverview } from "@/components/dashboard/TimelineOverview";
import PrematureCareView from "@/components/dashboard/PrematureCareView";
import { DiabetesDashboardWidget } from "@/components/dashboard/DiabetesDashboardWidget";
import { DueDateChecker } from "@/components/dashboard/due-date/DueDateChecker";
import { CelebrationFlow } from "@/components/dashboard/due-date/CelebrationFlow";
import TodayTipCard from "@/modules/maternity/dashboard/todayTip/TodayTipCard";
import { AnalyticsCarousel } from "@/modules/maternity/analytics";
import WeeklyProgressCard from "@/modules/maternity/dashboard/weeklyProgress/WeeklyProgressCard";
import UpcomingAppointmentsCard from "@/modules/maternity/dashboard/upcomingAppointments/UpcomingAppointmentsCard";
import SymptomsOverviewCard from "@/modules/maternity/dashboard/symptomsOverview/SymptomsOverviewCard";
import VisualAnalyticsSplitPanel from "@/modules/maternity/dashboard/visualAnalyticsMenu/VisualAnalyticsSplitPanel";
import HealthSummaryCards from "@/components/shared/HealthSummaryCards";
import { phaseAccent } from "@/components/shared/StatCard";
import { getMaternityDashboardMetrics } from "@/modules/maternity/dashboard/adapters/maternityDashboardMetricsAdapter";
import {
  Calendar, ChevronRight, CheckCircle2, Circle, Clock,
  Baby, Heart, Apple, Droplets, Activity, AlertTriangle,
  Syringe, ClipboardList, Milestone as MilestoneIcon, Shield,
  Flame, ArrowLeft, Sparkles, Phone, FileText, RotateCcw,
  Edit3, X, CalendarDays, Info, Stethoscope
} from "lucide-react";

// ─── Baby size visuals per trimester range ───────────────────────────────────
function getBabyVisual(week: number) {
  if (week <= 4)  return { emoji: "🌱", size: "Poppy seed",         compare: "size of a poppy seed" };
  if (week <= 6)  return { emoji: "🫘", size: "Sweet pea",          compare: "size of a sweet pea" };
  if (week <= 8)  return { emoji: "🫐", size: "Raspberry",          compare: "size of a raspberry" };
  if (week <= 10) return { emoji: "🍒", size: "Cherry",             compare: "size of a cherry" };
  if (week <= 12) return { emoji: "🍋", size: "Lime",               compare: "size of a lime" };
  if (week <= 14) return { emoji: "🍑", size: "Peach",              compare: "size of a peach" };
  if (week <= 16) return { emoji: "🥑", size: "Avocado",            compare: "size of an avocado" };
  if (week <= 18) return { emoji: "🫑", size: "Bell pepper",        compare: "size of a bell pepper" };
  if (week <= 20) return { emoji: "🍌", size: "Banana",             compare: "length of a banana" };
  if (week <= 22) return { emoji: "🥕", size: "Carrot",             compare: "length of a carrot" };
  if (week <= 24) return { emoji: "🌽", size: "Corn cob",           compare: "size of a corn cob" };
  if (week <= 26) return { emoji: "🥬", size: "Lettuce head",       compare: "size of a lettuce head" };
  if (week <= 28) return { emoji: "🥥", size: "Coconut",            compare: "size of a coconut" };
  if (week <= 30) return { emoji: "🥬", size: "Cabbage",            compare: "size of a cabbage" };
  if (week <= 32) return { emoji: "🍍", size: "Pineapple",          compare: "size of a pineapple" };
  if (week <= 34) return { emoji: "🍈", size: "Cantaloupe",         compare: "size of a cantaloupe" };
  if (week <= 36) return { emoji: "🥬", size: "Romaine lettuce",    compare: "length of romaine lettuce" };
  return              { emoji: "🍉", size: "Watermelon",         compare: "size of a watermelon" };
}

// ─── Category icons for checklist ────────────────────────────────────────────
function getCategoryIcon(cat: string) {
  switch (cat) {
    case "supplement": return <Shield className="w-3.5 h-3.5" />;
    case "nutrition":  return <Apple className="w-3.5 h-3.5" />;
    case "hydration":  return <Droplets className="w-3.5 h-3.5" />;
    case "activity":   return <Activity className="w-3.5 h-3.5" />;
    case "rest":       return <Clock className="w-3.5 h-3.5" />;
    default:           return <Circle className="w-3.5 h-3.5" />;
  }
}

function getCategoryColor(cat: string) {
  switch (cat) {
    case "supplement": return "bg-purple-100 text-purple-700 border-purple-200";
    case "nutrition":  return "bg-green-100 text-green-700 border-green-200";
    case "hydration":  return "bg-blue-100 text-blue-700 border-blue-200";
    case "activity":   return "bg-amber-100 text-amber-700 border-amber-200";
    case "rest":       return "bg-indigo-100 text-indigo-700 border-indigo-200";
    default:           return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getMilestoneTypeColor(type: string) {
  switch (type) {
    case "vaccination":  return "bg-purple-100 text-purple-700 border-purple-200";
    case "checkup":      return "bg-blue-100 text-blue-700 border-blue-200";
    case "preparation":  return "bg-amber-100 text-amber-700 border-amber-200";
    case "government":   return "bg-teal-100 text-teal-700 border-teal-200";
    default:             return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

// ─── Format a YYYY-MM-DD string for display ──────────────────────────────────
function formatDate(isoDate: string): string {
  if (!isoDate) return "";
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Setup Screen ────────────────────────────────────────────────────────────
function SetupScreen({ simpleMode }: { simpleMode: boolean }) {
  const { saveProfile, profile: pregnancyProfile } = usePregnancyProfile();
  const { profile: userProfile } = useProfile();
  const { isLoading } = useAuth();
  const navigate = useNavigate();
  const [lmp, setLmp] = useState(pregnancyProfile.lmp || "");
  const [lmpError, setLmpError] = useState("");

  if (isLoading) {
    return (
      <main className={`min-h-screen bg-background flex flex-col items-center justify-center p-4 ${simpleMode ? "simple-mode" : ""}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium text-muted-foreground">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!userProfile?.isProfileAvailable) {
    return (
      <main className={`min-h-screen bg-background flex flex-col items-center justify-center p-4 ${simpleMode ? "simple-mode" : ""}`}>
        <div className="text-center p-6 bg-card rounded-2xl border border-border shadow-sm max-w-sm w-full mx-4">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Profile Unavailable</h2>
          <p className="text-sm text-muted-foreground mt-2">Please complete your user profile first.</p>
          <Link to="/register" className="mt-5 block w-full bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            Go to Profile
          </Link>
        </div>
      </main>
    );
  }

  const name = userProfile?.name || "User";
  const age = userProfile?.age || null;
  const region = (pregnancyProfile.region || "north") as any;

  // Auto-calculate EDD preview whenever LMP changes
  const previewEDD = lmp
    ? (() => {
        const d = new Date(lmp + "T00:00:00");
        d.setDate(d.getDate() + 280);
        return d.toISOString().slice(0, 10);
      })()
    : "";

  const handleLmpChange = (val: string) => {
    setLmp(val);
    setLmpError("");
    if (val && !isValidLMP(val)) {
      setLmpError("LMP cannot be a future date.");
    }
  };

  const canSubmit = !!lmp && !lmpError && isValidLMP(lmp);

  const handleSubmit = () => {
    if (!lmp || !userProfile?.isProfileAvailable) {
      alert("Missing required data");
      return;
    }
    if (!canSubmit) return;
    saveProfile({ name, lmp, region });
    navigate("/", { replace: true });
  };

  // Max date for LMP input = today
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      <div className="container py-16 max-w-lg">
        <ScrollReveal>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Baby className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Set Up Your Dashboard</h1>
            <p className="mt-2 text-muted-foreground text-sm">
              Enter your Last Menstrual Period (LMP) date to personalise your pregnancy tracker.
            </p>
          </div>
        </ScrollReveal>
        <div className="space-y-4 bg-card rounded-2xl border border-border p-6 shadow-sm">
          {/* Welcome User Enhancement */}
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
               {name.charAt(0).toUpperCase()}
             </div>
             <div>
               <p className="text-sm font-semibold">Welcome, {name}</p>
               <p className="text-[10px] text-muted-foreground">Using your profile information</p>
             </div>
          </div>

          {/* LMP */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Last Menstrual Period (LMP)
            </label>
            <input
              type="date"
              value={lmp}
              max={todayISO}
              onChange={(e) => handleLmpChange(e.target.value)}
              className={`w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                lmpError
                  ? "border-red-400 focus:ring-red-300"
                  : "border-border focus:ring-primary/30"
              }`}
            />
            {lmpError && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {lmpError}
              </p>
            )}
          </div>

          {/* Auto-calculated EDD Preview */}
          {previewEDD && !lmpError && (
            <div className="rounded-xl bg-gradient-to-r from-primary/5 to-violet-50 border border-primary/20 p-4 flex items-center gap-3 animate-fadeIn">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Your estimated due date
                </p>
                <p className="text-sm font-bold text-primary">
                  {formatDate(previewEDD)}
                </p>
              </div>
            </div>
          )}

          {/* Info note */}
          <div className="flex items-start gap-2 bg-blue-50 rounded-lg p-3 border border-blue-100">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Your due date is auto-calculated from LMP (LMP&nbsp;+&nbsp;280&nbsp;days). You can adjust it later from the dashboard if your doctor gives a different date.
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-40"
          >
            Start Tracking →
          </button>
        </div>
      </div>
    </main>
  );
}

// ─── EDD Override Card (inside dashboard) ────────────────────────────────────
function EDDOverrideCard() {
  const { profile, activeEDD, setUserEDD } = usePregnancyProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(activeEDD);
  const [eddError, setEddError] = useState("");

  const hasOverride = !!profile.userEDD;
  const eddRange = profile.lmp ? getEDDRange(profile.lmp) : null;

  const startEdit = () => {
    setEditValue(activeEDD);
    setEddError("");
    setIsEditing(true);
  };

  const handleChange = (val: string) => {
    setEditValue(val);
    setEddError("");
    if (val && profile.lmp && !isValidUserEDD(val, profile.lmp)) {
      const range = getEDDRange(profile.lmp);
      setEddError(
        `Please enter a medically valid due date (between ${formatDate(range.min)} and ${formatDate(range.max)}).`
      );
    }
  };

  const handleSave = () => {
    if (!editValue || eddError) return;
    if (editValue === profile.calculatedEDD) {
      // User set it back to calculated — clear override
      setUserEDD(null);
    } else {
      setUserEDD(editValue);
    }
    setIsEditing(false);
  };

  const handleReset = () => {
    setUserEDD(null);
    setIsEditing(false);
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Expected Due Date</p>
            {!isEditing && (
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold">{formatDate(activeEDD)}</p>
                {hasOverride && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    custom
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <button
            onClick={startEdit}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit due date"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Inline editor */}
      {isEditing && (
        <div className="mt-3 space-y-2 animate-fadeIn">
          <input
            type="date"
            value={editValue}
            min={eddRange?.min}
            max={eddRange?.max}
            onChange={(e) => handleChange(e.target.value)}
            className={`w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${
              eddError
                ? "border-red-400 focus:ring-red-300"
                : "border-border focus:ring-primary/30"
            }`}
          />
          {eddError && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {eddError}
            </p>
          )}

          {/* Calculated EDD info */}
          <p className="text-[10px] text-muted-foreground">
            Auto-calculated: <strong>{formatDate(profile.calculatedEDD)}</strong> (from LMP: {formatDate(profile.lmp)})
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!!eddError || !editValue}
              className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97] disabled:opacity-40"
            >
              Save
            </button>
            {hasOverride && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
            <button
              onClick={() => setIsEditing(false)}
              className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Dashboard
// ═════════════════════════════════════════════════════════════════════════════
export default function PregnancyDashboard() {
  const { simpleMode } = useLanguage();
  const { profile, activeEDD, currentWeek, daysLeft, trimester, progress, mode } = usePregnancyProfile();
  const { phase } = usePhase();

  // Route guard: only maternity users can access this page
  if (phase !== "maternity") {
    return <Navigate to="/" replace />;
  }

  if (!profile.isSetup) {
    return <SetupScreen simpleMode={simpleMode} />;
  }

  // Mode-based rendering
  if (mode === "premature") {
    return <PrematureCareView />;
  }

  return (
    <MaternityRouteGuard expectedState="pregnancy">
      <DashboardView
        currentWeek={currentWeek}
        daysLeft={daysLeft}
        trimester={trimester}
        progress={progress}
        profileName={profile.name}
        simpleMode={simpleMode}
      />
    </MaternityRouteGuard>
  );
}

function DashboardView({
  currentWeek, daysLeft, trimester, progress, profileName, simpleMode
}: {
  currentWeek: number; daysLeft: number; trimester: number; progress: number;
  profileName: string; simpleMode: boolean;
}) {
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const dash = usePregnancyDashboard(currentWeek);
  const { getPhaseLogs } = useHealthLog();
  const maternityLogs = getPhaseLogs("maternity");

  // Calculate health summary metrics using maternity dashboard adapter
  const healthMetrics = useMemo(() => {
    return getMaternityDashboardMetrics(maternityLogs);
  }, [maternityLogs]);
  const { profile, clearProfile, openGTTPopup } = usePregnancyProfile();
  const weekData = WEEK_DATA[Math.min(selectedWeek, 40) - 1];
  const babyVisual = getBabyVisual(selectedWeek);
  const trimesterLabel = trimester === 1 ? "1st Trimester" : trimester === 2 ? "2nd Trimester" : "3rd Trimester";
  const trimesterColor = trimester === 1 ? "text-teal-600" : trimester === 2 ? "text-amber-600" : "text-primary";

  const showGDMRcard = currentWeek >= 25 && (profile.gdmStatus === null || profile.gdmStatus === "not_done" || profile.gdmStatus === "not_sure");

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      <DueDateChecker />
      {/* ─── Hero Header ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-purple-50/80 via-white to-pink-50/50 border-b border-border shadow-sm">
        <div className="container py-8 sm:py-10">
          <ScrollReveal>
            <div className="flex items-center justify-between mb-4">
              <Link to="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Home
              </Link>
              <button
                onClick={clearProfile}
                title="Clear pregnancy data"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Data
              </button>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${trimesterColor}`}>{trimesterLabel}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">Week {currentWeek} of 40</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Pregnancy Dashboard
                </h1>
                {profileName && <p className="text-sm text-muted-foreground mt-0.5">Welcome, {profileName} 🤰</p>}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{daysLeft}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">days left</p>
                </div>
                {/* Progress ring */}
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" strokeDasharray={`${progress}, 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progress}%</div>
                </div>
              </div>
            </div>

            {/* EDD Override Card */}
            <div className="mt-4">
              <EDDOverrideCard />
            </div>

            {/* Persistent GDM Follow-Up Card */}
            {showGDMRcard && (
              <div className="mt-3">
                <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-violet-900">GDM Follow-Up</h4>
                      <p className="text-xs text-violet-700">
                        {profile.gdmStatus === null && "GTT update required"}
                        {profile.gdmStatus === "not_done" && "GTT test pending"}
                        {profile.gdmStatus === "not_sure" && "GTT result pending"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={openGTTPopup}
                    className="px-4 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700 transition-colors shadow-sm active:scale-[0.97]"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            )}

            {/* Delivery Arrival Prompt */}
            {currentWeek >= 28 && !profile.delivery.isDelivered && (
              <div className="mt-3">
                <DeliveryArrivalCard />
              </div>
            )}

            {/* Timeline Overview Component */}
            <TimelineOverview 
              currentWeek={currentWeek} 
              selectedWeek={selectedWeek} 
              onSelectWeek={setSelectedWeek} 
            />
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* ─── Section 1: Baby Development & Today's Tip ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Baby Development (Left - 2 columns) */}
          <ScrollReveal className="lg:col-span-2 h-full">
            <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm hover:shadow-md transition-all h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-peach flex items-center justify-center">
                  <Baby className="w-4 h-4 text-peach-foreground" />
                </div>
                <h2 className="font-bold text-sm">Baby Development — Week {selectedWeek}</h2>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 mt-2">
                {/* Baby size visual */}
                <div className="flex items-center sm:flex-col gap-4 sm:w-40 shrink-0">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-peach to-pink-100 flex items-center justify-center text-5xl shadow-sm border border-white/50 animate-float">
                    {babyVisual.emoji}
                  </div>
                  <div className="sm:text-center flex-1">
                    <p className="text-sm font-bold text-foreground/90">{babyVisual.size}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{babyVisual.compare}</p>
                  </div>
                </div>
                {/* Development details */}
                <div className="flex-1 space-y-4">
                  {weekData && (
                    <>
                      <div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Development</p>
                        <p className="text-[15px] text-foreground/90 leading-relaxed font-medium">{weekData.development}</p>
                      </div>
                      <div className="bg-pink-50/50 border border-pink-100/50 rounded-xl p-4 mt-2">
                        <p className="text-[11px] font-bold text-pink-600 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
                          <Heart className="w-3.5 h-3.5 fill-pink-500" /> How Mom Feels
                        </p>
                        <p className="text-sm text-foreground/80 leading-relaxed">{weekData.momFeels}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Today's Tip (Right - 1 column) */}
          <ScrollReveal delay={60} className="lg:col-span-1">
            <TodayTipCard />
          </ScrollReveal>
        </div>

        {/* ─── Section 2: Health Summary Metrics ─────────────────────── */}
        <ScrollReveal delay={100}>
          <HealthSummaryCards
            loggedDays={healthMetrics.loggedDays}
            symptomsTracked={healthMetrics.symptomsTracked}
            avgSleep={healthMetrics.avgSleep}
            avgMood={healthMetrics.avgMood}
            accent={phaseAccent.maternity}
          />
        </ScrollReveal>

        {/* ─── Section 3: Visual Analytics ─────────────────────────── */}
        <ScrollReveal delay={120}>
          <VisualAnalyticsSplitPanel />
        </ScrollReveal>

        {/* ─── Section 4: Weekly Progress ─────────────────────────── */}
        <ScrollReveal delay={140}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            <WeeklyProgressCard />
            <UpcomingAppointmentsCard />
            <SymptomsOverviewCard />
          </div>
        </ScrollReveal>

        {/* ─── Section 5: Government Schemes Quick Access ──────────── */}
        <ScrollReveal delay={200}>
          <div className="rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50/80 to-white p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shadow-sm border border-teal-200/50">
                <FileText className="w-5 h-5 text-teal-700" />
              </div>
              <h2 className="font-bold text-base text-teal-900">Government Schemes & Support</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: "Janani Suraksha Yojana (JSY)", desc: "Cash benefit for institutional delivery", emoji: "🏛️" },
                { title: "PMMVY (₹5,000)", desc: "Matru Vandana for first pregnancy", emoji: "💰" },
                { title: "ASHA Worker Support", desc: "Free home visits and health monitoring", emoji: "👩‍⚕️" },
                { title: "Free Institutional Delivery", desc: "Government hospitals — no charges", emoji: "🏥" },
              ].map((scheme) => (
                <div key={scheme.title} className="flex items-start gap-3 rounded-xl border border-teal-100 bg-white p-4 shadow-sm hover:border-teal-300 transition-colors">
                  <span className="text-2xl shrink-0 mt-0.5">{scheme.emoji}</span>
                  <div>
                    <p className="text-sm font-bold text-teal-900">{scheme.title}</p>
                    <p className="text-xs text-teal-700/80 mt-0.5">{scheme.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-teal-700 font-medium text-center">Contact your nearest PHC or ASHA worker to avail these benefits</p>
          </div>
        </ScrollReveal>

        {/* ─── Quick navigation ────────────────────────────────────── */}
        <ScrollReveal delay={300}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { to: "/weekly-guide", label: "Weekly Guide", emoji: "📅", color: "bg-blue-50 border-blue-100" },
              { to: "/nutrition", label: "Nutrition", emoji: "🍎", color: "bg-green-50 border-green-100" },
              { to: "/vaccine-tracker", label: "Vaccines", emoji: "💉", color: "bg-purple-50 border-purple-100" },
              { to: "/symptom-checker", label: "Symptoms", emoji: "🔍", color: "bg-rose-50 border-rose-100" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 rounded-2xl border ${link.color} bg-card p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group`}
              >
                <span className="text-xl shrink-0 transition-transform group-hover:scale-110">{link.emoji}</span>
                <span className="text-sm font-bold text-foreground/90">{link.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground/60 ml-auto group-hover:text-foreground transition-colors" />
              </Link>
            ))}
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}

// ─── Delivery Arrival Card ───────────────────────────────────────────────────
function DeliveryArrivalCard() {
  const { profile, saveDelivery, activeEDD } = usePregnancyProfile();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [manualWeeks, setManualWeeks] = useState("");
  const [birthWeight, setBirthWeight] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationTriggered, setCelebrationTriggered] = useState(false);

  if (dismissed) return null;

  const autoWeeks = birthDate && profile.lmp ? calcWeeksAtBirth(profile.lmp, birthDate) : 0;
  const weeksAtBirth = manualWeeks ? parseInt(manualWeeks, 10) : autoWeeks;
  const todayISO = new Date().toISOString().slice(0, 10);

  const canSubmit = !!birthDate && weeksAtBirth > 0 && weeksAtBirth <= 45;

  const handleSubmit = () => {
    if (!canSubmit) return;

    // Trigger celebration first, delay save until modal closes to prevent component unmount
    if (!celebrationTriggered) {
      setCelebrationTriggered(true);
      setShowCelebration(true);
    }
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
    
    // Save data AFTER modal closes so navigation/unmount happens safely
    const data: DeliveryData = {
      isDelivered: true,
      birthDate,
      weeksAtBirth,
      birthWeight: birthWeight ? parseInt(birthWeight, 10) : null,
    };
    saveDelivery(data);
  };

  if (!expanded) {
    return (
      <div className="rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 text-xl">
            👀
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-violet-800">You're close to your due date</p>
            <p className="text-xs text-violet-600 mt-0.5">Any updates on your baby's arrival?</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setExpanded(true)}
            className="flex-1 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
          >
            Add Details
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="flex-1 py-2 rounded-lg border border-violet-200 text-violet-700 text-xs font-semibold hover:bg-violet-100 transition-all"
          >
            Not yet
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border-2 border-violet-200 bg-card p-5 shadow-sm space-y-4 animate-fadeIn">
        <div className="flex items-center gap-2 mb-1">
          <Baby className="w-5 h-5 text-violet-600" />
          <h3 className="text-sm font-bold">Delivery Details</h3>
        </div>

        {/* Birth date */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Date of Birth</label>
          <input
            type="date"
            value={birthDate}
            max={todayISO}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Weeks at birth */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Weeks at Birth {autoWeeks > 0 && !manualWeeks && <span className="text-primary">(auto-calculated: {autoWeeks} weeks)</span>}
          </label>
          <input
            type="number"
            value={manualWeeks}
            min={20}
            max={45}
            placeholder={autoWeeks > 0 ? `${autoWeeks} (auto)` : "e.g. 34"}
            onChange={(e) => setManualWeeks(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-[10px] text-muted-foreground mt-1">Leave empty to use auto-calculated value from your LMP</p>
        </div>

        {/* Birth weight (optional) */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Birth Weight — grams (optional)</label>
          <input
            type="number"
            value={birthWeight}
            placeholder="e.g. 2100"
            onChange={(e) => setBirthWeight(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Preview */}
        {weeksAtBirth > 0 && weeksAtBirth < 37 && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> Baby born at {weeksAtBirth} weeks is considered premature. Your dashboard will switch to Premature Baby Care mode.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-40"
          >
            Save Delivery Details
          </button>
          <button
            onClick={() => setExpanded(false)}
            className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground text-sm font-medium hover:bg-muted transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Celebration Flow */}
      {showCelebration && <CelebrationFlow onClose={handleCelebrationClose} />}
    </>
  );
}
