import { useMemo, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EnhancedSlider, type Checkpoint } from "@/components/ui/enhanced-slider";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Activity, TrendingUp, BarChart3, PieChart as PieChartIcon, Lock, Droplets, Moon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

import { useHealthLog, type HealthLogEntry, type HealthLogs, type PubertyEntry, type PeriodBloodColor } from "@/hooks/useHealthLog";
import { usePhase, type Phase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import {
  KEY_SYMPTOMS_BY_PHASE,
  analyzePhaseSymptom,
  type KeySymptomId,
} from "@/lib/symptomAnalysis";
import { cn } from "@/lib/utils";
import MaternityCalendar from "@/components/calendar/MaternityCalendar";

type CalendarMode = "year" | "month";
type SymptomTime = "morning" | "afternoon" | "evening";

const SLEEP_CHECKPOINTS: Checkpoint[] = [
  { value: 4, label: "4h (Low)", priority: "low" },
  { value: 6, label: "6h (Min)", priority: "medium" },
  { value: 8, label: "8h (Optimal)", priority: "high" },
  { value: 10, label: "10h+ (High)", priority: "medium" },
];

interface CalendarSymptomEntry {
  id: string;        // symptom key id
  label: string;
  severity: number;  // 1-5
  time: SymptomTime;
  notes: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISODate(y: number, m0: number, day: number) {
  return `${y}-${String(m0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const BLOOD_COLOR_OPTIONS: PeriodBloodColor[] = [
  "Bright Red",
  "Dark Red / Maroon",
  "Brown",
  "Black",
  "Pink",
  "Orange",
  "Grey",
];

function bloodColorInsight(color: PeriodBloodColor): string {
  switch (color) {
    case "Bright Red":
      return "Fresh blood, normal flow.";
    case "Dark Red / Maroon":
      return "Older blood, common at start or end.";
    case "Brown":
      return "Old blood, normal at beginning or end.";
    case "Black":
      return "Older blood. Usually normal, monitor if unusual symptoms.";
    case "Pink":
      return "Light flow or low estrogen. Ensure proper nutrition.";
    case "Orange":
      return "May indicate infection if paired with odor or irritation.";
    case "Grey":
      return "Possible infection. Consider consulting a doctor.";
  }
}

function addDaysISO(dateISO: string, deltaDays: number): string {
  const d = new Date(dateISO + "T12:00:00");
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

function shouldShowDoctorAlert(args: {
  dateISO: string;
  allLogs: HealthLogs;
  selectedColor: PeriodBloodColor | "";
  periodSymptoms: { badSmell: boolean; itching: boolean; severePain: boolean };
  lookbackDays?: number;
  repeatThreshold?: number;
}): boolean {
  const {
    dateISO,
    allLogs,
    selectedColor,
    periodSymptoms,
    lookbackDays = 7,
    repeatThreshold = 2,
  } = args;

  const hasConcernSymptoms = Object.values(periodSymptoms).some(Boolean);
  const isRiskColor = selectedColor === "Grey" || selectedColor === "Orange";
  if (!isRiskColor || !hasConcernSymptoms) return false;

  // Count risky colors in recent history (excluding today, then add today)
  let priorRiskyCount = 0;
  for (let i = 1; i <= lookbackDays; i++) {
    const iso = addDaysISO(dateISO, -i);
    const e = allLogs[iso];
    const c = (e as any)?.bloodColor as PeriodBloodColor | undefined;
    if (c === "Grey" || c === "Orange") priorRiskyCount += 1;
  }
  const totalWithToday = priorRiskyCount + 1;
  return totalWithToday >= repeatThreshold;
}

function severityDotClass(sev: number) {
  if (sev <= 1) return "bg-emerald-400";
  if (sev <= 2) return "bg-blue-400";
  if (sev <= 3) return "bg-amber-400";
  if (sev <= 4) return "bg-orange-500";
  return "bg-red-500";
}

function severityLabel(s: number) {
  if (s <= 1) return "Mild";
  if (s <= 2) return "Mild";
  if (s <= 3) return "Moderate";
  if (s <= 4) return "Moderate";
  return "Severe";
}

function formatMiniMonthTitle(monthIndex0: number) {
  return MONTH_NAMES[monthIndex0].slice(0, 3);
}

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

/** Check if a date is a period day (puberty or family-planning phase with periodStarted, auto-marked, or irregular) */
function isPeriodDay(entry: HealthLogEntry | undefined): boolean {
  if (!entry) return false;
  if (entry.phase === "puberty") return (entry as PubertyEntry).periodStarted || !!(entry as any)._periodAutoMarked || !!(entry as any)._irregular;
  if (entry.phase === "family-planning") return !!(entry as any).periodStarted || !!(entry as any)._periodAutoMarked || !!(entry as any)._irregular;
  return false;
}

/** Check if a date is a period START day (not a continuation day) */
function isPeriodStartDay(entry: HealthLogEntry | undefined): boolean {
  if (!entry) return false;
  if (entry.phase === "puberty") return (entry as PubertyEntry).periodStarted === true;
  if (entry.phase === "family-planning") return (entry as any).periodStarted === true;
  return false;
}

/** Check if a date is an auto-marked continuation day (not a manual start) */
function isAutoMarkedContinuation(entry: HealthLogEntry | undefined): boolean {
  if (!entry) return false;
  if (entry.phase === "puberty") return !!(entry as any)._periodAutoMarked && !(entry as PubertyEntry).periodStarted;
  if (entry.phase === "family-planning") return !!(entry as any)._periodAutoMarked && !(entry as any).periodStarted;
  return false;
}

// ─── Irregular Period Detection ───────────────────────────────────────────────

/** Default fallback threshold if cycle length is unknown */
const DEFAULT_CYCLE_LENGTH = 28;

/** Check if an entry is an irregular single-day period entry */
function isIrregularPeriodDay(entry: HealthLogEntry | undefined): boolean {
  if (!entry) return false;
  return !!(entry as any)._irregular;
}

/**
 * Detect whether a new period toggle on `dateISO` should be treated as irregular.
 * Returns { irregular: true, reason: string } or { irregular: false }.
 *
 * A date is irregular if:
 * 1. It already has auto-marked period data on it, OR
 * 2. It falls within an existing predicted/auto-marked period range, OR
 * 3. It occurs within `thresholdDays` of ANY genuine (non-auto, non-irregular) period start
 */
function detectIrregularEntry(
  dateISO: string,
  logs: HealthLogs,
  cycleLengthDays: number = DEFAULT_CYCLE_LENGTH
): { irregular: boolean; reason?: string } {
  const dateMs = new Date(dateISO + "T12:00:00").getTime();

  // 0. Check if this date already has auto-marked period data
  const existingEntry = logs[dateISO];
  if (existingEntry && (existingEntry.phase === "puberty" || existingEntry.phase === "family-planning")) {
    if ((existingEntry as any)._periodAutoMarked) {
      return { irregular: true, reason: "This date is already part of a predicted period range." };
    }
  }

  // 1. Check if within an existing predicted period range
  const rangeStart = findPeriodRangeForDate(dateISO, logs);
  if (rangeStart !== null && rangeStart !== dateISO) {
    return { irregular: true, reason: "This date falls within an already predicted period range." };
  }

  // 2. Check if too close to ANY genuine manual period start (exclude auto-generated and irregular)
  const genuineStarts = Object.entries(logs)
    .filter(([d, e]) => {
      if (d === dateISO) return false;
      if (e.phase !== "puberty" && e.phase !== "family-planning") return false;
      if (!(e as any).periodStarted) return false;
      if ((e as any)._irregular) return false;       // don't count irregular entries
      if ((e as any)._periodAutoMarked) return false; // don't count auto-generated predicted starts
      return true;
    })
    .map(([d]) => d);

  for (const startDate of genuineStarts) {
    const startMs = new Date(startDate + "T12:00:00").getTime();
    const dayGap = Math.round(Math.abs(dateMs - startMs) / (1000 * 60 * 60 * 24));
    if (dayGap > 0 && dayGap < cycleLengthDays) {
      return { irregular: true, reason: `Only ${dayGap} days since your period on ${startDate} — within your ${cycleLengthDays}-day cycle.` };
    }
  }

  return { irregular: false };
}

/**
 * Check if a date falls within any existing period range in logs.
 * Returns the start date ISO of the range it belongs to, or null.
 */
function findPeriodRangeForDate(dateISO: string, logs: HealthLogs): string | null {
  // Find all period start dates
  const periodStarts = Object.entries(logs)
    .filter(([, e]) => (e.phase === "puberty" || e.phase === "family-planning") && (e as any).periodStarted)
    .map(([d]) => d)
    .sort();

  for (const startISO of periodStarts) {
    // Check if dateISO is on or after this start, and within a reasonable period window (max 10 days)
    const startMs = new Date(startISO + "T12:00:00").getTime();
    const dateMs = new Date(dateISO + "T12:00:00").getTime();
    const dayDiff = Math.round((dateMs - startMs) / (1000 * 60 * 60 * 24));
    if (dayDiff >= 0 && dayDiff < 10) {
      // Check if consecutive auto-marked days exist from start to this date
      let inRange = true;
      for (let d = 1; d <= dayDiff; d++) {
        const checkDate = new Date(startISO + "T12:00:00");
        checkDate.setDate(checkDate.getDate() + d);
        const checkISO = checkDate.toISOString().slice(0, 10);
        const checkEntry = logs[checkISO];
        if (!isPeriodDay(checkEntry)) {
          inRange = false;
          break;
        }
      }
      if (inRange) return startISO;
    }
  }
  return null;
}

/** Check if a date has any logged data at all (symptoms OR mood OR notes) */
function hasAnyLogData(entry: HealthLogEntry | undefined): boolean {
  if (!entry) return false;
  const sympCount = getSymptomCountFromEntry(entry);
  if (sympCount > 0) return true;
  if ((entry as any).mood) return true;
  if ((entry as any).notes) return true;
  if ((entry as any).bloodColor) return true;
  if ((entry as any).periodSymptoms && Object.values((entry as any).periodSymptoms).some(Boolean)) return true;
  if (isPeriodDay(entry)) return true;
  return false;
}

/** Extract logged symptom count from HealthLogEntry */
function getSymptomCountFromEntry(entry: HealthLogEntry | undefined): number {
  if (!entry) return 0;
  if (!entry.symptoms) return 0;
  return Object.values(entry.symptoms).filter(Boolean).length;
}

/** Derive a max severity (1-3 scale) from a health log entry */
function getMaxSeverityFromEntry(entry: HealthLogEntry | undefined): number {
  if (!entry) return 0;
  let sev = 0;
  const sympCount = getSymptomCountFromEntry(entry);
  if (sympCount >= 4) sev = 3;
  else if (sympCount >= 2) sev = 2;
  else if (sympCount >= 1) sev = 1;

  // Check for specific high-severity indicators
  if (entry.phase === "maternity") {
    const e = entry as any;
    if (e.fatigueLevel === "High") sev = Math.max(sev, 3);
    if (e.sleepHours !== null && e.sleepHours < 5) sev = Math.max(sev, 3);
  }
  if (entry.phase === "menopause" || entry.phase === "family-planning") {
    const e = entry as any;
    if (e.sleepHours !== null && e.sleepHours < 5) sev = Math.max(sev, 3);
  }
  return sev;
}

/** Get the phase-specific dot color */
const PHASE_DOT: Record<string, string> = {
  puberty: "bg-pink-400",
  maternity: "bg-purple-400",
  "family-planning": "bg-teal-400",
  menopause: "bg-amber-400",
};

/** Build tooltip for a logged date */
function buildTooltipForEntry(entry: HealthLogEntry | undefined): string | undefined {
  if (!entry) return undefined;
  const parts: string[] = [];
  const symptoms = entry.symptoms;
  if (symptoms) {
    const active = Object.entries(symptoms)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").trim());
    parts.push(...active.slice(0, 3));
  }
  if ((entry as any).mood) parts.push(`Mood: ${(entry as any).mood}`);
  if ((entry as any).bloodColor) parts.push(`Color: ${(entry as any).bloodColor}`);
  if (parts.length === 0) return "Logged";
  return `Logged: ${parts.join(", ")}`;
}

// ─── Calendar Page Component ──────────────────────────────────────────────────

export default function CalendarPage() {
  const { phase } = usePhase();

  // Phase isolation: render dedicated MaternityCalendar for maternity users
  if (phase === "maternity") {
    return <MaternityCalendar />;
  }

  // All code below is for puberty / other phases — completely unaffected
  return <PubertyCalendarView />;
}

function PubertyCalendarView() {
  const { getPhaseLogs, saveLog, saveBulkLogs, deleteBulkLogs, clearAllLogs } = useHealthLog();
  const { phase } = usePhase();
  const { profile } = useProfile();

  const phaseLogs = getPhaseLogs(phase);

  const now = new Date();
  const [mode, setMode] = useState<CalendarMode>("year");
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const symptomOptions = useMemo(() => {
    const phaseSymptoms = KEY_SYMPTOMS_BY_PHASE[phase] ?? [];
    return phaseSymptoms.map((s) => ({ id: s.id, label: s.label }));
  }, [phase]);

  function openModal(dateISO: string) {
    setSelectedDateISO(dateISO);
    setModalOpen(true);
  }

  // ─── Mini Month (Year View) ───────────────────────────────────────────────

  function MiniMonth({ monthIndex0 }: { monthIndex0: number }) {
    const firstDay = new Date(year, monthIndex0, 1).getDay();
    const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className="rounded-2xl border border-border bg-card p-2.5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between px-1 py-1.5">
          <span className="text-xs font-bold text-foreground">{formatMiniMonthTitle(monthIndex0)}</span>
          <span className="text-[10px] text-muted-foreground font-medium">{year}</span>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((h, i) => (
            <div key={`${h}-${i}`} className="text-[9px] text-muted-foreground text-center font-semibold">
              {h}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, idx) => {
            if (day === null)
              return <div key={`empty-${idx}`} className="h-7 rounded-md" />;
            const iso = toISODate(year, monthIndex0, day);
            const isFuture = iso > todayISO;
            const phaseEntry = phaseLogs[iso];
            const periodEntry = phaseLogs[iso];
            const hasData = hasAnyLogData(phaseEntry) || isPeriodDay(periodEntry);
            const sympCount = getSymptomCountFromEntry(phaseEntry);
            const maxSev = getMaxSeverityFromEntry(phaseEntry);
            const isToday = iso === todayISO;
            const isSelected = iso === selectedDateISO;
            const tooltip = isFuture ? "Future date – not available yet" : buildTooltipForEntry(phaseEntry);
            const dotColor = phaseEntry ? (PHASE_DOT[phaseEntry.phase] ?? "bg-primary") : null;
            const isPeriod = isPeriodDay(periodEntry);
            const isIrregular = isIrregularPeriodDay(periodEntry);

            return (
              <button
                key={iso}
                type="button"
                title={isIrregular ? "Irregular entry — not affecting predictions" : tooltip}
                disabled={isFuture}
                onClick={() => !isFuture && openModal(iso)}
                className={cn(
                  "relative h-7 w-full rounded-md flex flex-col items-center justify-center transition-all",
                  isFuture
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : isSelected
                    ? "bg-primary/15 ring-2 ring-primary/40 border-primary/40"
                    : isIrregular
                    ? "bg-orange-100 hover:bg-orange-200 border border-dashed border-orange-300"
                    : isPeriod
                    ? "bg-pink-100 hover:bg-pink-200"
                    : "hover:bg-muted/50",
                  isToday ? "font-extrabold text-primary" : isFuture ? "" : "text-foreground"
                )}
                aria-label={`${iso}${hasData ? " (logged)" : ""}${isIrregular ? " (irregular)" : isPeriod ? " (period)" : ""}${isFuture ? " (future)" : ""}`}
              >
                <span className="text-[11px] leading-none">{day}</span>
                {isIrregular && (
                  <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-orange-500" />
                )}
                {isPeriod && !isIrregular && (
                  <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-pink-500" />
                )}
                {hasData && !isPeriod && (
                  <span
                    className={cn(
                      "absolute bottom-0.5 w-1.5 h-1.5 rounded-full",
                      sympCount === 0
                        ? "bg-blue-300"
                        : maxSev >= 3
                        ? "bg-red-500"
                        : maxSev >= 2
                        ? "bg-amber-400"
                        : dotColor ?? "bg-primary/60"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Day Cell (Month View) ────────────────────────────────────────────────

  function DayCell({ dateISO }: { dateISO: string }) {
    const isFuture = dateISO > todayISO;
    const phaseEntry = phaseLogs[dateISO];
    const periodEntry = phaseLogs[dateISO];
    const hasData = hasAnyLogData(phaseEntry) || isPeriodDay(periodEntry);
    const sympCount = getSymptomCountFromEntry(phaseEntry);
    const maxSev = getMaxSeverityFromEntry(phaseEntry);
    const isToday = dateISO === todayISO;
    const isSelected = dateISO === selectedDateISO;
    const tooltip = isFuture ? "Future date – not available yet" : buildTooltipForEntry(phaseEntry);
    const dotColor = phaseEntry ? (PHASE_DOT[phaseEntry.phase] ?? "bg-primary") : null;
    const isPeriod = isPeriodDay(periodEntry);
    const isIrregular = isIrregularPeriodDay(periodEntry);

    return (
      <button
        type="button"
        title={isIrregular ? "Irregular entry — not affecting predictions" : tooltip}
        disabled={isFuture}
        onClick={() => !isFuture && openModal(dateISO)}
        className={cn(
          "relative h-14 sm:h-16 w-full border-b border-r border-border/20 flex flex-col items-center justify-center transition-all text-sm font-medium",
          isFuture
            ? "text-muted-foreground/30 cursor-not-allowed bg-muted/10"
            : isIrregular
            ? "bg-orange-50 hover:bg-orange-100 cursor-pointer border-dashed !border-orange-300"
            : isPeriod
            ? "bg-pink-50 hover:bg-pink-100 cursor-pointer"
            : "hover:bg-muted/55 cursor-pointer",
          isSelected ? "bg-primary/10 ring-2 ring-inset ring-primary/50" : "",
          isToday ? "font-extrabold text-primary" : ""
        )}
      >
        {isFuture && (
          <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-muted-foreground/20" />
        )}
        {isToday ? (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "" : "border-2 border-primary"}`}>
              <span className="text-sm font-extrabold text-primary">{Number(dateISO.slice(-2))}</span>
            </span>
          </span>
        ) : (
          <span className={isSelected ? "text-primary font-bold" : ""}>{Number(dateISO.slice(-2))}</span>
        )}
        {isIrregular && (
          <span className="absolute bottom-1.5 w-2 h-2 rounded-full bg-orange-500" />
        )}
        {isPeriod && !isIrregular && (
          <span className="absolute bottom-1.5 w-2 h-2 rounded-full bg-pink-500" />
        )}
        {hasData && !isPeriod && (
          <span
            className={cn(
              "absolute bottom-1.5 w-2 h-2 rounded-full",
              sympCount === 0
                ? "bg-blue-300"
                : maxSev >= 3 ? "bg-red-500" : maxSev >= 2 ? "bg-amber-400" : dotColor ?? "bg-primary/60"
            )}
          />
        )}
        {sympCount > 0 && (
          <span className="absolute top-1 right-1.5 text-[9px] text-muted-foreground font-semibold">
            {sympCount}
          </span>
        )}
      </button>
    );
  }

  // ─── Year View ────────────────────────────────────────────────────────────

  function YearView() {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 12 }, (_, i) => (
          <MiniMonth key={i} monthIndex0={i} />
        ))}
      </div>
    );
  }

  // ─── Month View ───────────────────────────────────────────────────────────

  function MonthView() {
    const firstDay = new Date(year, month0, 1);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();

    const cells: (string | null)[] = [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => toISODate(year, month0, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    // Monthly summary
    const monthEntries = Object.entries(phaseLogs).filter(([d]) => {
      const [y, m] = d.split("-").map(Number);
      return y === year && m === month0 + 1;
    });
    const totalLogged = monthEntries.length;
    const totalSymptoms = monthEntries.reduce((acc, [, e]) => acc + getSymptomCountFromEntry(e), 0);

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
            <button
              type="button"
              onClick={() => {
                const d = new Date(year, month0 - 1, 1);
                setYear(d.getFullYear());
                setMonth0(d.getMonth());
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold">
              {MONTH_NAMES[month0]} {year}
            </h2>
            <button
              type="button"
              onClick={() => {
                const d = new Date(year, month0 + 1, 1);
                setYear(d.getFullYear());
                setMonth0(d.getMonth());
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-border/40">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((iso, idx) => {
              if (!iso) return <div key={`empty-${idx}`} className="h-14 sm:h-16 border-b border-r border-border/20" />;
              return <DayCell key={iso} dateISO={iso} />;
            })}
          </div>

          {/* Legend */}
          <div className="px-6 py-3 border-t border-border/40 flex items-center gap-4 flex-wrap">
            {(phase === "puberty" || phase === "family-planning") && (
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Period day
              </span>
            )}
            {(phase === "puberty" || phase === "family-planning") && (
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Irregular
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className={`w-2 h-2 rounded-full ${PHASE_DOT[phase] ?? "bg-primary"}`} />
              Symptom logged
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Moderate
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Severe
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto">Click any day to log or edit</span>
          </div>
        </div>

        {/* Monthly Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Days Logged</p>
            <p className="text-2xl font-bold mt-1">{totalLogged}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Symptoms</p>
            <p className="text-2xl font-bold mt-1">{totalSymptoms}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Avg / Day</p>
            <p className="text-2xl font-bold mt-1">
              {totalLogged > 0 ? (totalSymptoms / totalLogged).toFixed(1) : "–"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Render ──────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">Calendar</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Log symptoms by date and power analytics instantly.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to clear all your health logs? This action cannot be undone.")) {
                    clearAllLogs();
                    toast.success("All data logs cleared successfully");
                  }
                }}
                className="mt-3 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All Data
              </button>
            </div>

            <div className="flex items-center gap-3">
              {mode === "year" ? (
                <div className="flex items-center gap-2 border border-border/50 rounded-xl bg-background px-2 py-1.5">
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="rounded-lg border-0 bg-transparent px-2 py-1 text-sm font-semibold focus:ring-0 focus:outline-none flex-1 text-center"
                    aria-label="Select year"
                  >
                    {Array.from({ length: 8 }, (_, i) => now.getFullYear() - 2 + i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 border border-border/50 rounded-xl bg-background px-2 py-1.5">
                  <span className="text-sm font-semibold text-foreground/80 px-2">
                    {MONTH_NAMES[month0]}
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">{year}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5">
            <Tabs value={mode} onValueChange={(v) => setMode(v as CalendarMode)}>
              <TabsList className="w-full max-w-[420px]">
                <TabsTrigger value="year" className="flex-1">Year view</TabsTrigger>
                <TabsTrigger value="month" className="flex-1">Month view</TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground mt-3">
              {mode === "year"
                ? "Hover to see symptom summaries. Click any date to log or edit."
                : "Use arrows to navigate months. Click a date to log symptoms."}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {mode === "year" ? <YearView /> : <MonthView />}

        {/* Symptom Log Modal */}
        {modalOpen && selectedDateISO && (
          <SymptomLogPanel
            dateISO={selectedDateISO}
            phase={phase}
            logs={phaseLogs}
            symptomOptions={symptomOptions}
            onClose={() => setModalOpen(false)}
            onSave={saveLog}
            onSaveBulk={saveBulkLogs}
            onDeleteBulk={deleteBulkLogs}
            periodDuration={profile.periodDuration}
            cycleLength={profile.cycleLength}
          />
        )}
      </div>
    </main>
  );
}

// ─── Symptom Log Panel (Slide-over Modal) ────────────────────────────────────

interface SymptomLogPanelProps {
  dateISO: string;
  phase: Phase;
  logs: HealthLogs;
  symptomOptions: { id: string; label: string }[];
  onClose: () => void;
  onSave: (dateISO: string, entry: HealthLogEntry) => void;
  onSaveBulk: (entries: Record<string, HealthLogEntry>) => void;
  onDeleteBulk: (dateISOs: string[], phase?: Phase) => void;
  periodDuration: number;
  cycleLength: number | null;
}

const SYMPTOM_TIME_OPTIONS: { value: SymptomTime; label: string }[] = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

const PIE_COLORS = ["#8BC6A6", "#F2C574", "#E99696"];

function SymptomLogPanel({
  dateISO,
  phase,
  logs,
  allLogs,
  symptomOptions,
  onClose,
  onSave,
  onSaveBulk,
  onDeleteBulk,
  periodDuration,
  cycleLength,
}: SymptomLogPanelProps) {
  // STRICT SEPARATION: the phaseLogs passed here only contain the current phase's data
  const existingEntry = logs[dateISO];

  // Build initial symptom selection from existing entry
  const initialSymptoms = useMemo<Record<string, boolean>>(() => {
    if (!existingEntry || existingEntry.phase !== phase) return {};
    const symp = existingEntry.symptoms as Record<string, boolean>;
    return { ...symp };
  }, [existingEntry, phase, dateISO]);

  const [selectedSymptoms, setSelectedSymptoms] = useState<Record<string, boolean>>(initialSymptoms);
  const [mood, setMood] = useState<"Good" | "Okay" | "Low" | "">(() => {
    if (existingEntry && (existingEntry as any).mood) return (existingEntry as any).mood;
    return "";
  });
  const [sleepHours, setSleepHours] = useState<number | "">(() => {
    if (existingEntry && (existingEntry as any).sleepHours != null) return (existingEntry as any).sleepHours;
    return "";
  });
  const [sleepQuality, setSleepQuality] = useState<"Good" | "Okay" | "Poor" | "">(() => {
    if (existingEntry && (existingEntry as any).sleepQuality) return (existingEntry as any).sleepQuality;
    return "";
  });
  const [notes, setNotes] = useState<string>(() => {
    if (existingEntry && (existingEntry as any).notes) return (existingEntry as any).notes;
    return "";
  });
  const [selectedAnalyticsId, setSelectedAnalyticsId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const periodEntry = logs[dateISO];
  // Determine if this date is already within an existing period range
  const existingPeriodRange = useMemo(() => findPeriodRangeForDate(dateISO, logs), [dateISO, logs]);
  const isExistingPeriodStart = isPeriodStartDay(periodEntry);
  const isExistingContinuation = isAutoMarkedContinuation(periodEntry);
  const isWithinExistingRange = existingPeriodRange !== null;
  const isExistingIrregular = isIrregularPeriodDay(periodEntry);

  // Pre-detect if toggling ON would create an irregular entry
  // Threshold = user's cycle length (e.g. 28 days) — any period within the full cycle is irregular
  const irregularDetection = useMemo(
    () => detectIrregularEntry(dateISO, logs, cycleLength || DEFAULT_CYCLE_LENGTH),
    [dateISO, logs, cycleLength]
  );

  // Period Started toggle should only reflect actual period start status (not continuation days)
  const [periodStarted, setPeriodStarted] = useState<boolean>(() => {
    if (periodEntry?.phase === "puberty") {
      // Only show as "started" if this is an actual period start date
      return (periodEntry as PubertyEntry).periodStarted === true;
    }
    if (periodEntry?.phase === "family-planning") {
      return (periodEntry as any).periodStarted === true;
    }
    return false;
  });

  // Track whether the user explicitly changed the period toggle in this session
  const [periodToggleChanged, setPeriodToggleChanged] = useState(false);
  const handlePeriodToggle = useCallback((checked: boolean) => {
    setPeriodStarted(checked);
    setPeriodToggleChanged(true);
  }, []);

  const [bloodColor, setBloodColor] = useState<PeriodBloodColor | "">(() => {
    const existingColor = (periodEntry as any)?.bloodColor as PeriodBloodColor | undefined;
    return existingColor ?? "";
  });

  const [periodInfectionSymptoms, setPeriodInfectionSymptoms] = useState<{
    badSmell: boolean;
    itching: boolean;
    severePain: boolean;
  }>(() => {
    const existingSymptoms = (periodEntry as any)?.periodSymptoms as
      | { badSmell: boolean; itching: boolean; severePain: boolean }
      | undefined;
    return existingSymptoms ?? { badSmell: false, itching: false, severePain: false };
  });

  const showBloodColorSection = (phase === "puberty" || phase === "family-planning") && (
    isPeriodDay(periodEntry) || periodStarted || isWithinExistingRange || isExistingIrregular || isExistingContinuation
  );

  const doctorAlert = useMemo(() => {
    if (!showBloodColorSection) return false;
    return shouldShowDoctorAlert({
      dateISO,
      allLogs,
      selectedColor: bloodColor,
      periodSymptoms: periodInfectionSymptoms,
      lookbackDays: 7,
      repeatThreshold: 2,
    });
  }, [showBloodColorSection, dateISO, allLogs, bloodColor, periodInfectionSymptoms]);

  const activeSymptomIds = useMemo(
    () => Object.entries(selectedSymptoms).filter(([, v]) => v).map(([k]) => k),
    [selectedSymptoms]
  );

  const toggleSymptom = useCallback((id: string) => {
    setSelectedSymptoms((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Compute analytics for selected symptom
  const analyticsResult = useMemo(() => {
    if (!selectedAnalyticsId) return null;
    try {
      return analyzePhaseSymptom({
        phase,
        logs,
        symptomId: selectedAnalyticsId as KeySymptomId,
        viewMode: "weekly",
      });
    } catch {
      return null;
    }
  }, [selectedAnalyticsId, phase, logs]);

  function handleSave() {
    if (saving) return;

    // Require at least one piece of data
    const hasSymptoms = Object.values(selectedSymptoms).some(Boolean);
    const hasMood = mood !== "";
    const hasSleep = sleepHours !== "" || sleepQuality !== "";
    const hasNotes = notes.trim().length > 0;
    const hasPeriod = (phase === "puberty" || phase === "family-planning") && periodStarted;
    const hasBloodColor = bloodColor !== "";
    const hasPeriodConcerns = Object.values(periodInfectionSymptoms).some(Boolean);
    if (!hasSymptoms && !hasMood && !hasSleep && !hasNotes && !hasPeriod && !hasBloodColor && !hasPeriodConcerns) {
      toast.error("Please select at least one symptom, sleep log, mood, or add a note before saving.");
      return;
    }

    setSaving(true);

    // Build the correct entry for the current phase
    let entry: HealthLogEntry;
    const moodValue = mood !== "" ? (mood as "Good" | "Okay" | "Low") : null;
    const sleepHoursValue = sleepHours !== "" ? Number(sleepHours) : null;
    const sleepQualityValue = sleepQuality !== "" ? (sleepQuality as "Good" | "Okay" | "Poor") : null;
    const periodSymptomsHasAny = Object.values(periodInfectionSymptoms).some(Boolean);

    if (phase === "puberty") {
      entry = {
        phase: "puberty",
        periodStarted: periodStarted,
        periodEnded: false,
        flowIntensity: null,
        bloodColor: bloodColor !== "" ? bloodColor : undefined,
        periodSymptoms: periodSymptomsHasAny ? periodInfectionSymptoms : undefined,
        symptoms: {
          cramps: !!selectedSymptoms.cramps,
          fatigue: !!selectedSymptoms.fatigue,
          moodSwings: !!selectedSymptoms.moodSwings,
          headache: !!selectedSymptoms.headache,
          acne: !!selectedSymptoms.acne,
          breastTenderness: !!selectedSymptoms.breastTenderness,
        },
        mood: moodValue,
        sleepHours: sleepHoursValue,
        sleepQuality: sleepQualityValue,
        notes: notes || undefined,
      };
    } else if (phase === "maternity") {
      entry = {
        phase: "maternity",
        fatigueLevel: selectedSymptoms.fatigue ? "Medium" : null,
        hydrationGlasses: null,
        sleepHours: sleepHoursValue,
        sleepQuality: sleepQualityValue,
        symptoms: {
          nausea: !!selectedSymptoms.nausea,
          dizziness: !!selectedSymptoms.dizziness,
          swelling: !!selectedSymptoms.swelling,
          backPain: !!selectedSymptoms.backPain,
          sleepDisturbance: !!selectedSymptoms.sleepDisturbance,
        },
        mood: moodValue,
        notes: notes || undefined,
      };
    } else if (phase === "family-planning") {
      const existingFP = existingEntry?.phase === "family-planning" ? existingEntry as any : null;
      entry = {
        phase: "family-planning",
        lastPeriodDate: existingFP?.lastPeriodDate ?? "",
        cycleLength: existingFP?.cycleLength ?? null,
        periodStarted: periodStarted,
        bloodColor: bloodColor !== "" ? bloodColor : undefined,
        periodSymptoms: periodSymptomsHasAny ? periodInfectionSymptoms : undefined,
        symptoms: {
          irregularCycle: !!selectedSymptoms.irregularCycle,
          ovulationPain: !!selectedSymptoms.ovulationPain,
          moodChanges: !!selectedSymptoms.moodChanges,
          fatigue: !!selectedSymptoms.fatigue,
          stress: !!selectedSymptoms.stress,
          sleepIssues: !!selectedSymptoms.sleepIssues,
        },
        mood: moodValue,
        sleepHours: sleepHoursValue,
        sleepQuality: sleepQualityValue,
        notes: notes || undefined,
      };
    } else {
      // menopause
      entry = {
        phase: "menopause",
        symptoms: {
          hotFlashes: !!selectedSymptoms.hotFlashes,
          nightSweats: !!selectedSymptoms.nightSweats,
          moodSwings: !!selectedSymptoms.moodSwings,
          jointPain: !!selectedSymptoms.jointPain,
          sleepDisturbance: !!selectedSymptoms.sleepDisturbance,
          fatigue: !!selectedSymptoms.fatigue,
        },
        sleepHours: sleepHoursValue,
        sleepQuality: sleepQualityValue,
        mood: moodValue,
        notes: notes || undefined,
      };
    }

    // If this date is within an existing period range and user didn't explicitly toggle period,
    // preserve the period markers from the existing entry
    if ((phase === "puberty" || phase === "family-planning") && isWithinExistingRange && !periodToggleChanged) {
      if (periodEntry?.phase === "puberty" || periodEntry?.phase === "family-planning") {
        (entry as any).periodStarted = (periodEntry as any).periodStarted;
        if ((periodEntry as any)._periodAutoMarked) {
          (entry as any)._periodAutoMarked = true;
        }
        if ((periodEntry as any)._irregular) {
          (entry as any)._irregular = true;
        }
        if ((periodEntry as any)._periodGroupId) {
          (entry as any)._periodGroupId = (periodEntry as any)._periodGroupId;
        }
      }
    }

    // For family-planning, save the symptom entry as family-planning but handle period separately
    const isPeriodRelevantPhase = phase === "puberty" || phase === "family-planning";

    onSave(dateISO, entry);

    // ── PERIOD TOGGLE OFF ──
    if (isPeriodRelevantPhase && periodToggleChanged && !periodStarted) {

      // Case A: Removing an IRREGULAR entry → only remove this single day
      if (isExistingIrregular) {
        const updated: any = { ...periodEntry, periodStarted: false };
        delete updated._irregular;
        delete updated._periodGroupId;
        delete updated._periodAutoMarked;
        onSave(dateISO, updated as HealthLogEntry);

        toast.success("Irregular entry removed", {
          description: "Only this single day was removed. Predictions are unchanged.",
        });

        setSaving(false);
        onClose();
        return;
      }

      // Case B: Removing a REGULAR period start → remove entire block + predictions
      if (isExistingPeriodStart) {
        const datesToRemove: string[] = [];
        for (let dayOffset = 1; dayOffset < 15; dayOffset++) {
          const checkDate = new Date(dateISO + "T12:00:00");
          checkDate.setDate(checkDate.getDate() + dayOffset);
          const checkISO = checkDate.toISOString().slice(0, 10);
          const checkEntry = logs[checkISO];
          if (checkEntry && (checkEntry.phase === "puberty" || checkEntry.phase === "family-planning") && (checkEntry as any)._periodAutoMarked) {
            datesToRemove.push(checkISO);
          } else {
            break;
          }
        }

        // Also remove predicted future cycles
        const actualCycleLenForRemoval = cycleLength || 28;
        for (let cycle = 1; cycle <= 3; cycle++) {
          const futureStart = new Date(dateISO + "T12:00:00");
          futureStart.setDate(futureStart.getDate() + cycle * actualCycleLenForRemoval);
          for (let dayOffset = 0; dayOffset < periodDuration; dayOffset++) {
            const futureDay = new Date(futureStart);
            futureDay.setDate(futureDay.getDate() + dayOffset);
            const futureISO = futureDay.toISOString().slice(0, 10);
            const futureEntry = logs[futureISO];
            if (futureEntry && (futureEntry.phase === "puberty" || futureEntry.phase === "family-planning") && (futureEntry as any)._periodAutoMarked) {
              datesToRemove.push(futureISO);
            }
          }
        }

        // Update the start day itself: remove period flag
        if (periodEntry?.phase === "puberty" || periodEntry?.phase === "family-planning") {
          const updatedStart: any = { ...periodEntry, periodStarted: false };
          delete updatedStart._periodAutoMarked;
          delete updatedStart._periodGroupId;
          onSave(dateISO, updatedStart as HealthLogEntry);
        }

        if (datesToRemove.length > 0) {
          onDeleteBulk(datesToRemove, phase);
        }

        toast.success(`Period range removed`, {
          description: `Cleared ${datesToRemove.length + 1} marked days including predicted cycles.`,
        });

        setSaving(false);
        onClose();
        return;
      }
    }

    // ── PERIOD TOGGLE ON ──
    // Only trigger when user explicitly toggled ON and it's a NEW period start
    const isNewPeriodStart = isPeriodRelevantPhase
      && periodStarted 
      && periodToggleChanged 
      && !isExistingPeriodStart;

    if (isNewPeriodStart) {
      // ── Check for IRREGULAR entry ──
      // If the date is within a predicted range or too close to last start, mark as irregular
      if (irregularDetection.irregular) {
        // Save as single-day irregular entry — NO multi-day expansion, NO predictions
        const irregularEntry: any = { ...entry };
        irregularEntry.periodStarted = true;
        irregularEntry._irregular = true;
        delete irregularEntry._periodAutoMarked;
        delete irregularEntry._periodGroupId;
        onSave(dateISO, irregularEntry as HealthLogEntry);

        toast.info("Marked as irregular entry", {
          description: irregularDetection.reason || "This day was marked as irregular — predictions are unchanged.",
          duration: 5000,
        });

        setSaving(false);
        onClose();
        return;
      }

      // ── Regular period start — full cycle generation ──
      const existingStarts = Object.entries(logs)
        .filter(([, e]) => (e.phase === "puberty" || e.phase === "family-planning") && (e as any).periodStarted && !(e as any)._irregular)
        .map(([d]) => d)
        .sort();

      const startMs = new Date(dateISO + "T12:00:00").getTime();
      const hasOverlap = existingStarts.some((s) => {
        const sMs = new Date(s + "T12:00:00").getTime();
        const dayDiff = Math.abs(Math.round((sMs - startMs) / (1000 * 60 * 60 * 24)));
        return dayDiff > 0 && dayDiff < periodDuration;
      });

      if (hasOverlap) {
        toast.warning("Period range overlaps with an existing cycle", {
          description: "This date is too close to another period start. Adjust the existing cycle or choose a different date.",
        });
      } else {
        const groupId = `cycle_${dateISO}`;
        const bulkEntries: Record<string, HealthLogEntry> = {};
        const cyclesToPredict = 3;
        const actualCycleLength = cycleLength || 28;

        // Tag the start day with group ID
        const startEntry: any = { ...entry };
        startEntry._periodGroupId = groupId;
        onSave(dateISO, startEntry as HealthLogEntry);

        for (let cycle = 0; cycle <= cyclesToPredict; cycle++) {
          const cycleStartDate = new Date(dateISO + "T12:00:00");
          cycleStartDate.setDate(cycleStartDate.getDate() + cycle * actualCycleLength);

          for (let dayOffset = 0; dayOffset < periodDuration; dayOffset++) {
            const periodDay = new Date(cycleStartDate);
            periodDay.setDate(periodDay.getDate() + dayOffset);
            const periodISO = periodDay.toISOString().slice(0, 10);

            // Skip the very first day (already saved above)
            if (cycle === 0 && dayOffset === 0) continue;

            const existingLog = logs[periodISO];
            // Don't overwrite manually-set start days or irregular entries
            if (existingLog && (existingLog.phase === "puberty" || existingLog.phase === "family-planning")) {
              if ((existingLog as any).periodStarted && !(existingLog as any)._periodAutoMarked) continue;
              if ((existingLog as any)._irregular) continue;
            }

            let base: any;
            if (existingLog?.phase === phase) {
              base = { ...existingLog };
            } else if (phase === "family-planning") {
              base = {
                phase: "family-planning",
                periodStarted: false,
                lastPeriodDate: dateISO,
                cycleLength: actualCycleLength,
                symptoms: { irregularCycle: false, ovulationPain: false, moodChanges: false, fatigue: false, stress: false, sleepIssues: false },
                mood: null,
                sleepHours: null,
                sleepQuality: null,
              };
            } else {
              base = {
                phase: "puberty",
                periodStarted: false,
                periodEnded: false,
                flowIntensity: null,
                symptoms: { cramps: false, fatigue: false, moodSwings: false, headache: false, acne: false, breastTenderness: false },
                mood: null,
              };
            }
            base._periodAutoMarked = true;
            base._periodGroupId = groupId;
            base.periodStarted = dayOffset === 0; 
            base.periodEnded = dayOffset === periodDuration - 1;
            bulkEntries[periodISO] = base as HealthLogEntry;
          }
        }

        if (Object.keys(bulkEntries).length > 0) {
          onSaveBulk(bulkEntries);
        }

        toast.success(`Period marked for ${periodDuration} days/cycle`, {
          description: `Predicted cycles for the next 3 months based on a ${actualCycleLength}-day cycle length.`,
        });
      }
    } else if (isPeriodRelevantPhase && periodStarted && isExistingPeriodStart && !periodToggleChanged) {
      toast.success(`Symptoms updated for ${formatDisplayDate(dateISO)}`, {
        description: "Period start preserved. Symptoms and mood updated.",
      });
    } else {
      toast.success(`Symptoms logged for ${formatDisplayDate(dateISO)}`, {
        description: hasSymptoms
          ? `${Object.values(selectedSymptoms).filter(Boolean).length} symptom(s)${hasMood ? " + mood" : ""} saved`
          : hasMood ? "Mood logged successfully" : "Note saved",
      });
    }

    setSaving(false);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Log symptoms for ${dateISO}`}
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-300"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-border/60">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{formatDisplayDate(dateISO)}</p>
            <h2 className="text-lg font-bold mt-0.5">Daily Symptom Log</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Select symptoms, then tap one to see analytics.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors mt-0.5"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {/* Period Start Toggle (Puberty + Family Planning) */}
          {(phase === "puberty" || phase === "family-planning") && (
            <section className={cn(
              "rounded-xl border-2 p-4",
              isExistingIrregular
                ? "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50"
                : isExistingContinuation
                ? "border-pink-100 bg-gradient-to-r from-pink-50/50 to-rose-50/50 opacity-75"
                : "border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isExistingIrregular ? "bg-orange-100" : "bg-pink-100"
                  )}>
                    <Droplets className={cn("w-5 h-5", isExistingIrregular ? "text-orange-600" : "text-pink-600")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", isExistingIrregular ? "text-orange-900" : "text-pink-900")}>
                      {isExistingIrregular
                        ? "Irregular Period Day"
                        : isExistingContinuation
                        ? "Period Day (auto-marked)"
                        : isExistingPeriodStart
                        ? "Period Start Day"
                        : "Period Started"}
                    </p>
                    <p className={cn("text-[11px]", isExistingIrregular ? "text-orange-600" : "text-pink-600")}>
                      {isExistingIrregular
                        ? periodStarted
                          ? "Marked as irregular — not affecting cycle predictions. Toggle OFF to remove."
                          : "Toggle OFF will remove only this irregular day. Predictions stay unchanged."
                        : isExistingContinuation
                        ? `Part of period starting ${existingPeriodRange ?? "unknown"}. Log symptoms without affecting the period range.`
                        : periodStarted && !isExistingPeriodStart && irregularDetection.irregular
                        ? `⚠ Will be marked as irregular: ${irregularDetection.reason}`
                        : periodStarted
                        ? "Will predict 3 months based on your duration and cycle length"
                        : "Toggle if your period started on this day"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={periodStarted}
                  onCheckedChange={handlePeriodToggle}
                  disabled={isExistingContinuation}
                  className={cn(
                    isExistingIrregular || (periodStarted && irregularDetection.irregular)
                      ? "data-[state=checked]:bg-orange-500"
                      : "data-[state=checked]:bg-pink-500"
                  )}
                />
              </div>
            </section>
          )}

          {/* Blood Color Logging (period days only) */}
          {showBloodColorSection && (
            <section className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold">What is the color of your flow today?</h3>
                <p className="text-xs text-muted-foreground">
                  Select one option for instant insight.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {BLOOD_COLOR_OPTIONS.map((opt) => {
                  const active = bloodColor === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setBloodColor(active ? "" : opt)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                        active
                          ? "bg-primary/15 border-primary/50 text-primary shadow-sm"
                          : "bg-background border-border hover:bg-muted/50 text-foreground"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn(
                          "w-3 h-3 rounded-full border-2 transition-colors",
                          active ? "bg-primary border-primary" : "border-muted-foreground/40"
                        )} />
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {bloodColor !== "" && (
                <div className={cn(
                  "rounded-lg border p-3 text-sm",
                  bloodColor === "Grey" || bloodColor === "Orange"
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                )}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1">
                    Insight
                  </p>
                  <p className="text-sm leading-relaxed">{bloodColorInsight(bloodColor)}</p>
                </div>
              )}

              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Symptoms to watch (optional)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {([
                    { key: "badSmell", label: "Bad smell" },
                    { key: "itching", label: "Itching" },
                    { key: "severePain", label: "Severe pain" },
                  ] as const).map((s) => {
                    const active = periodInfectionSymptoms[s.key];
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() =>
                          setPeriodInfectionSymptoms((prev) => ({ ...prev, [s.key]: !prev[s.key] }))
                        }
                        className={cn(
                          "px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-left",
                          active
                            ? "bg-orange-50 border-orange-200 text-orange-800"
                            : "bg-background border-border hover:bg-muted/50 text-foreground"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className={cn(
                            "w-3 h-3 rounded-full border-2 transition-colors",
                            active ? "bg-orange-500 border-orange-500" : "border-muted-foreground/40"
                          )} />
                          {s.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {doctorAlert && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-semibold text-red-800 uppercase tracking-wider mb-1">
                    Smart alert
                  </p>
                  <p className="text-sm text-red-800 leading-relaxed">
                    We recommend consulting a doctor for further evaluation.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Symptom Toggle Grid */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Symptoms
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {symptomOptions.map((opt) => {
                const isActive = !!selectedSymptoms[opt.id];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSymptom(opt.id)}
                    className={cn(
                      "px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left",
                      isActive
                        ? "bg-primary/15 border-primary/50 text-primary shadow-sm"
                        : "bg-card border-border hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        "w-3 h-3 rounded-full border-2 transition-colors",
                        isActive ? "bg-primary border-primary" : "border-muted-foreground/40"
                      )} />
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Mood */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Mood</h3>
            <div className="flex gap-2">
              {(["Good", "Okay", "Low"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(mood === m ? "" : m)}
                  className={cn(
                    "flex-1 py-2 rounded-xl border text-sm font-medium transition-all",
                    mood === m
                      ? "bg-primary/15 border-primary/50 text-primary"
                      : "bg-card border-border hover:bg-muted/50 text-foreground"
                  )}
                >
                  {m === "Good" ? "😊" : m === "Okay" ? "😐" : "😔"} {m}
                </button>
              ))}
            </div>
          </section>

          {/* Sleep Tracking */}
          <section className="space-y-4 rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              Sleep Tracking
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Duration (hours)</span>
                <span className="text-sm font-bold text-indigo-700">{sleepHours !== "" ? sleepHours : "–"} h</span>
              </div>
              <EnhancedSlider
                phase={phase as any}
                checkpoints={SLEEP_CHECKPOINTS}
                min={0}
                max={15}
                step={0.5}
                value={sleepHours !== "" ? sleepHours : 0}
                onChange={(val) => setSleepHours(val)}
                className="w-full [&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-indigo-500 [&_.relative.h-full]:bg-indigo-500"
              />
            </div>

            {phase === "menopause" && (
              <div className="space-y-2 mt-4 pt-4 border-t border-border/50">
                <span className="text-xs font-medium text-foreground">Quality</span>
                <div className="flex gap-2">
                  {(["Good", "Okay", "Poor"] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSleepQuality(sleepQuality === q ? "" : q)}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                        sleepQuality === q
                          ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                          : "bg-background border-border hover:bg-muted/50 text-foreground"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="space-y-2">
            <h3 className="text-sm font-semibold">Notes (optional)</h3>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder="e.g., mild discomfort, took medicine..."
            />
          </section>

          {/* Active symptoms summary + analytics selector */}
          {activeSymptomIds.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Symptom Analytics
              </h3>
              <p className="text-xs text-muted-foreground">Tap a symptom below to view its trend analysis.</p>
              <div className="flex flex-wrap gap-2">
                {activeSymptomIds.map((id) => {
                  const opt = symptomOptions.find((o) => o.id === id);
                  const isAnalyticsActive = selectedAnalyticsId === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setSelectedAnalyticsId(isAnalyticsActive ? null : id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
                        isAnalyticsActive
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card border-border hover:bg-muted/50"
                      )}
                    >
                      {opt?.label ?? id}
                    </button>
                  );
                })}
              </div>

              {/* Analytics Display */}
              {analyticsResult && selectedAnalyticsId && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold">
                      {symptomOptions.find((o) => o.id === selectedAnalyticsId)?.label} Analysis
                    </h4>
                    <span className={cn(
                      "ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full",
                      analyticsResult.confidence === "High Confidence"
                        ? "bg-emerald-100 text-emerald-700"
                        : analyticsResult.confidence === "Moderate Confidence"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    )}>
                      {analyticsResult.confidence}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Insight</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{analyticsResult.insight}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Prediction</p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{analyticsResult.prediction}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted/50 py-2">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Trend</p>
                      <p className="text-xs font-bold mt-0.5">{analyticsResult.trendDirection}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 py-2">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Timing</p>
                      <p className="text-xs font-bold mt-0.5">{analyticsResult.timing}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 py-2">
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase">Frequency</p>
                      <p className="text-xs font-bold mt-0.5">{analyticsResult.trend}</p>
                    </div>
                  </div>

                  {/* Bar Chart */}
                  {analyticsResult.barData.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Frequency Timeline</p>
                      <div className="h-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsResult.barData}>
                            <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#93c5fd" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Pie Chart */}
                  {analyticsResult.pieData.some((d) => d.value > 0) && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Severity Distribution</p>
                      <div className="h-32">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsResult.pieData.filter((d) => d.value > 0)}
                              dataKey="value"
                              nameKey="name"
                              outerRadius={50}
                              label
                            >
                              {analyticsResult.pieData.filter((d) => d.value > 0).map((entry, index) => (
                                <Cell key={entry.name} fill={PIE_COLORS[index % 3]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {analyticsResult.showSuggestions && analyticsResult.suggestions.length > 0 && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1.5">💡 Suggestions</p>
                      <ul className="space-y-1">
                        {analyticsResult.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-amber-700">• {s}</li>
                        ))}
                      </ul>
                      {analyticsResult.showPHC && (
                        <p className="text-xs text-amber-800 font-semibold mt-2">
                          Consider visiting your nearest PHC for personalized care.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border/60 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold hover:bg-muted/50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all ${
              saving
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:shadow-md active:scale-[0.97]"
            }`}
          >
            {saving ? "Saving…" : "Save log"}
          </button>
        </div>
      </div>
    </>
  );
}
