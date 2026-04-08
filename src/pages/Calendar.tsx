import { useMemo, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Activity, TrendingUp, BarChart3, PieChart as PieChartIcon, Lock, Droplets, Moon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

import { useHealthLog, type HealthLogEntry, type HealthLogs, type PubertyEntry } from "@/hooks/useHealthLog";
import { usePhase, type Phase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import {
  KEY_SYMPTOMS_BY_PHASE,
  analyzePhaseSymptom,
  type KeySymptomId,
} from "@/lib/symptomAnalysis";
import { cn } from "@/lib/utils";

type CalendarMode = "year" | "month";
type SymptomTime = "morning" | "afternoon" | "evening";

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

/** Check if a date is a period day (puberty phase with periodStarted) */
function isPeriodDay(entry: HealthLogEntry | undefined): boolean {
  if (!entry) return false;
  if (entry.phase !== "puberty") return false;
  const e = entry as PubertyEntry;
  return e.periodStarted || !!(e as any)._periodAutoMarked;
}

/** Check if a date has any logged data at all (symptoms OR mood OR notes) */
function hasAnyLogData(entry: HealthLogEntry | undefined): boolean {
  if (!entry) return false;
  const sympCount = getSymptomCountFromEntry(entry);
  if (sympCount > 0) return true;
  if ((entry as any).mood) return true;
  if ((entry as any).notes) return true;
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
  if (parts.length === 0) return "Logged";
  return `Logged: ${parts.join(", ")}`;
}

// ─── Calendar Page Component ──────────────────────────────────────────────────

export default function CalendarPage() {
  const { logs, saveLog, saveBulkLogs, getLog } = useHealthLog();
  const { phase } = usePhase();
  const { profile } = useProfile();

  const now = new Date();
  const [mode, setMode] = useState<CalendarMode>("year");
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loggingDuringPeriod, setLoggingDuringPeriod] = useState(true);

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
            const entry = logs[iso];
            const hasData = hasAnyLogData(entry);
            const sympCount = getSymptomCountFromEntry(entry);
            const maxSev = getMaxSeverityFromEntry(entry);
            const isToday = iso === todayISO;
            const isSelected = iso === selectedDateISO;
            const tooltip = isFuture ? "Future date – not available yet" : buildTooltipForEntry(entry);
            const dotColor = entry ? (PHASE_DOT[entry.phase] ?? "bg-primary") : null;
            const isPeriod = isPeriodDay(entry);

            return (
              <button
                key={iso}
                type="button"
                title={tooltip}
                disabled={isFuture}
                onClick={() => !isFuture && openModal(iso)}
                className={cn(
                  "relative h-7 w-full rounded-md flex flex-col items-center justify-center transition-all",
                  isFuture
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : isSelected
                    ? "bg-primary/15 ring-2 ring-primary/40 border-primary/40"
                    : isPeriod
                    ? "bg-pink-100 hover:bg-pink-200"
                    : "hover:bg-muted/50",
                  isToday ? "font-extrabold text-primary" : isFuture ? "" : "text-foreground"
                )}
                aria-label={`${iso}${hasData ? " (logged)" : ""}${isPeriod ? " (period)" : ""}${isFuture ? " (future)" : ""}`}
              >
                <span className="text-[11px] leading-none">{day}</span>
                {isPeriod && (
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
    const entry = logs[dateISO];
    const hasData = hasAnyLogData(entry);
    const sympCount = getSymptomCountFromEntry(entry);
    const maxSev = getMaxSeverityFromEntry(entry);
    const isToday = dateISO === todayISO;
    const isSelected = dateISO === selectedDateISO;
    const tooltip = isFuture ? "Future date – not available yet" : buildTooltipForEntry(entry);
    const dotColor = entry ? (PHASE_DOT[entry.phase] ?? "bg-primary") : null;
    const isPeriod = isPeriodDay(entry);

    return (
      <button
        type="button"
        title={tooltip}
        disabled={isFuture}
        onClick={() => !isFuture && openModal(dateISO)}
        className={cn(
          "relative h-14 sm:h-16 w-full border-b border-r border-border/20 flex flex-col items-center justify-center transition-all text-sm font-medium",
          isFuture
            ? "text-muted-foreground/30 cursor-not-allowed bg-muted/10"
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
        {isPeriod && (
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
    const monthEntries = Object.entries(logs).filter(([d, e]) => {
      const [y, m] = d.split("-").map(Number);
      return y === year && m === month0 + 1 && e.phase === phase;
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
            {phase === "puberty" && (
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                Period day
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
            </div>

            <div className="flex items-center gap-3">
              {mode === "year" ? (
                <div className="flex items-center gap-2 border border-border/50 rounded-xl bg-background px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setYear((y) => y - 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Previous year"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <select
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-semibold"
                    aria-label="Select year"
                  >
                    {Array.from({ length: 8 }, (_, i) => now.getFullYear() - 2 + i).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setYear((y) => y + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
                    aria-label="Next year"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
            {phase === "puberty" && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 max-w-md">
                <Switch
                  id="period-phase-log"
                  checked={loggingDuringPeriod}
                  onCheckedChange={setLoggingDuringPeriod}
                />
                <Label htmlFor="period-phase-log" className="text-sm font-medium leading-snug cursor-pointer">
                  Log these entries as period-phase symptoms
                </Label>
              </div>
            )}
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
            logs={logs}
            symptomOptions={symptomOptions}
            loggingDuringPeriod={loggingDuringPeriod}
            onClose={() => setModalOpen(false)}
            onSave={saveLog}
            onSaveBulk={saveBulkLogs}
            getLog={getLog}
            periodDuration={profile.periodDuration}
            cycleLength={profile.cycleLength ?? 28}
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
  loggingDuringPeriod: boolean;
  onClose: () => void;
  onSave: (dateISO: string, entry: HealthLogEntry) => void;
  onSaveBulk: (entries: Record<string, HealthLogEntry>) => void;
  getLog: (dateISO: string) => HealthLogEntry | undefined;
  periodDuration: number;
  cycleLength: number;
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
  symptomOptions,
  loggingDuringPeriod,
  onClose,
  onSave,
  onSaveBulk,
  getLog,
  periodDuration,
  cycleLength,
}: SymptomLogPanelProps) {
  const existingEntry = getLog(dateISO);

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
  const [periodStarted, setPeriodStarted] = useState<boolean>(() => {
    if (existingEntry?.phase === "puberty") {
      return (existingEntry as PubertyEntry).periodStarted || !!(existingEntry as any)._periodAutoMarked;
    }
    return false;
  });

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
    const hasPeriod = phase === "puberty" && periodStarted;
    if (!hasSymptoms && !hasMood && !hasSleep && !hasNotes && !hasPeriod) {
      toast.error("Please select at least one symptom, sleep log, mood, or add a note before saving.");
      return;
    }

    setSaving(true);

    // Build the correct entry for the current phase
    let entry: HealthLogEntry;
    const moodValue = mood !== "" ? (mood as "Good" | "Okay" | "Low") : null;
    const sleepHoursValue = sleepHours !== "" ? Number(sleepHours) : null;
    const sleepQualityValue = sleepQuality !== "" ? (sleepQuality as "Good" | "Okay" | "Poor") : null;

    if (phase === "puberty") {
      entry = {
        phase: "puberty",
        periodStarted: periodStarted,
        periodEnded: false,
        flowIntensity: null,
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

    onSave(dateISO, entry);

    // Auto-mark ALL future period windows for 12 months using cycle length
    if (phase === "puberty" && periodStarted) {
      const bulkEntries: Record<string, HealthLogEntry> = {};
      const startDate = new Date(dateISO + "T12:00:00");
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1); // Project 12 months ahead

      let cycleStart = new Date(startDate);
      let totalCyclesMarked = 0;

      while (cycleStart < endDate) {
        // For each cycle, mark the period duration days
        for (let dayOffset = 0; dayOffset < periodDuration; dayOffset++) {
          const periodDay = new Date(cycleStart);
          periodDay.setDate(periodDay.getDate() + dayOffset);
          const periodISO = periodDay.toISOString().slice(0, 10);

          // Skip the original start date (already saved above)
          if (periodISO === dateISO) continue;

          // Don't overwrite existing manually-set period starts
          const existing = logs[periodISO];
          if (existing && existing.phase === "puberty" && (existing as PubertyEntry).periodStarted && !(existing as any)._periodAutoMarked) {
            continue;
          }

          // Merge with existing entry data or create new
          const base: any = existing?.phase === "puberty" ? { ...existing } : {
            phase: "puberty",
            periodStarted: false,
            periodEnded: false,
            flowIntensity: null,
            symptoms: { cramps: false, fatigue: false, moodSwings: false, headache: false, acne: false, breastTenderness: false },
            mood: null,
          };
          base._periodAutoMarked = true;
          // First day of each cycle is the predicted start, rest are continuation
          base.periodStarted = dayOffset === 0;
          bulkEntries[periodISO] = base as HealthLogEntry;
        }

        totalCyclesMarked++;

        // Move to next cycle start
        cycleStart = new Date(cycleStart);
        cycleStart.setDate(cycleStart.getDate() + cycleLength);
      }

      if (Object.keys(bulkEntries).length > 0) {
        onSaveBulk(bulkEntries);
      }

      const totalDaysMarked = Object.keys(bulkEntries).length + 1; // +1 for the original date
      toast.success(`Period projected for ${totalCyclesMarked} cycles over the next 12 months`, {
        description: `${totalDaysMarked} day(s) marked based on ${cycleLength}-day cycle. You can edit any day to adjust for irregularity or pregnancy.`,
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
          {/* Period Start Toggle (Puberty only) */}
          {phase === "puberty" && (
            <section className="rounded-xl border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-rose-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-pink-900">Period Started</p>
                    <p className="text-[11px] text-pink-600">
                      {periodStarted
                        ? `Will auto-mark ${periodDuration}-day periods every ${cycleLength} days for 12 months`
                        : "Toggle if your period started on this day"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={periodStarted}
                  onCheckedChange={setPeriodStarted}
                  className="data-[state=checked]:bg-pink-500"
                />
              </div>
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
              <input 
                type="range" 
                min="0" max="15" step="0.5" 
                value={sleepHours !== "" ? sleepHours : 0} 
                onChange={(e) => setSleepHours(Number(e.target.value))} 
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0h</span><span>5h</span><span>10h+</span>
              </div>
            </div>

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
