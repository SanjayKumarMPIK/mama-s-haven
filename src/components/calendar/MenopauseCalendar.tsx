import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Lock,
  CalendarDays,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  useHealthLog,
  type HealthLogEntry,
  type MenopauseEntry,
} from "@/hooks/useHealthLog";
import { useMenopause, getStageLabel } from "@/hooks/useMenopause";
import { MenopauseDayCell, getMenopauseSymptomCount, hasMenopauseData } from "./MenopauseDayCell";
import { MenopauseDayDetails } from "./MenopauseDayDetails";

// ─── Constants ────────────────────────────────────────────────────────────────

type CalendarMode = "year" | "month";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toISODate(y: number, m0: number, day: number) {
  return `${y}-${String(m0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ─── Smart Insight Generator ──────────────────────────────────────────────────

function getWeeklyInsight(stage: string): string {
  if (stage === "perimenopause") {
    return "Track cycle changes and symptom patterns. Your body is transitioning.";
  }
  if (stage === "menopause") {
    return "Focus on bone health, heart health, and symptom management.";
  }
  if (stage === "postmenopause") {
    return "Maintain wellness and monitor long-term health markers.";
  }
  return "Track your symptoms and wellness journey day by day.";
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MenopauseCalendar() {
  const { getPhaseLogs, clearAllLogs } = useHealthLog();
  const { profile } = useMenopause();

  const menopauseLogs = getPhaseLogs("menopause");

  const now = new Date();
  const [mode, setMode] = useState<CalendarMode>("month");
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function openModal(dateISO: string) {
    setSelectedDateISO(dateISO);
    setModalOpen(true);
  }

  // ─── Menopause Context Header ──────────────────────────────────────────────

  const stage = profile?.stage || "menopause";
  const stageLabel = getStageLabel(stage);
  const stageColor =
    stage === "perimenopause"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : stage === "menopause"
      ? "bg-orange-50 text-orange-700 border-orange-200"
      : "bg-purple-50 text-purple-700 border-purple-200";

  // ─── Mini Month (Year View) ────────────────────────────────────────────────

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
          <span className="text-xs font-bold text-foreground">
            {MONTH_NAMES[monthIndex0].slice(0, 3)}
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">{year}</span>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((h, i) => (
            <div
              key={`${h}-${i}`}
              className="text-[9px] text-muted-foreground text-center font-semibold"
            >
              {h}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="h-7 rounded-md" />;
            const iso = toISODate(year, monthIndex0, day);
            return (
              <MenopauseDayCell
                key={iso}
                dateISO={iso}
                todayISO={todayISO}
                entry={menopauseLogs[iso]}
                isSelected={iso === selectedDateISO}
                isMiniView
                onClick={openModal}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Month View ────────────────────────────────────────────────────────────

  function MonthView() {
    const firstDay = new Date(year, month0, 1);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();

    const cells: (string | null)[] = [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => toISODate(year, month0, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    // Monthly stats — menopause only
    const monthEntries = Object.entries(menopauseLogs).filter(([d]) => {
      const [y, m] = d.split("-").map(Number);
      return y === year && m === month0 + 1;
    });
    const totalLogged = monthEntries.length;
    const totalSymptoms = monthEntries.reduce(
      (acc, [, e]) => acc + getMenopauseSymptomCount(e),
      0
    );

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
              <div
                key={d}
                className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((iso, idx) => {
              if (!iso)
                return (
                  <div
                    key={`empty-${idx}`}
                    className="h-14 sm:h-16 border-b border-r border-border/20"
                  />
                );
              return (
                <MenopauseDayCell
                  key={iso}
                  dateISO={iso}
                  todayISO={todayISO}
                  entry={menopauseLogs[iso]}
                  isSelected={iso === selectedDateISO}
                  onClick={openModal}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="px-6 py-3 border-t border-border/40 flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Symptom logged
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Notes
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Moderate
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Severe
            </span>
            <span className="text-[10px] text-muted-foreground ml-auto">
              Click any day to log
            </span>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Days Logged
            </p>
            <p className="text-2xl font-bold mt-1">{totalLogged}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Symptoms
            </p>
            <p className="text-2xl font-bold mt-1">{totalSymptoms}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Avg / Day
            </p>
            <p className="text-2xl font-bold mt-1">
              {totalLogged > 0 ? (totalSymptoms / totalLogged).toFixed(1) : "–"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="container py-6 space-y-5">
          {/* Menopause Context Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-amber-500" />
                Menopause Calendar
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Log symptoms, track wellness, and navigate your transition.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to clear all your health logs? This action cannot be undone."
                    )
                  ) {
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

          {/* Menopause Info Cards */}
          {profile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={cn("rounded-xl border p-3 flex items-center gap-3", stageColor)}>
                <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                    Stage
                  </p>
                  <p className="text-sm font-bold">{stageLabel}</p>
                </div>
              </div>

              {/* Smart Insight */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 col-span-2 sm:col-span-3">
                <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">
                  💡 This Week
                </p>
                <p className="text-xs font-medium text-indigo-800 leading-relaxed">
                  {getWeeklyInsight(stage)}
                </p>
              </div>
            </div>
          )}

          {/* View Toggle */}
          <div>
            <Tabs value={mode} onValueChange={(v) => setMode(v as CalendarMode)}>
              <TabsList className="w-full max-w-[420px]">
                <TabsTrigger value="year" className="flex-1">
                  Year view
                </TabsTrigger>
                <TabsTrigger value="month" className="flex-1">
                  Month view
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-xs text-muted-foreground mt-3">
              {mode === "year"
                ? "Overview of all months. Click any date to log menopause data."
                : "Navigate months and click a date to log symptoms and wellness."}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {mode === "year" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <MiniMonth key={i} monthIndex0={i} />
            ))}
          </div>
        ) : (
          <MonthView />
        )}

        {/* Menopause Day Details Panel */}
        {modalOpen && selectedDateISO && (
          <MenopauseDayDetails
            dateISO={selectedDateISO}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </main>
  );
}
