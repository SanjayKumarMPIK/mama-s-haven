import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight } from "lucide-react";

import SymptomLogModal from "@/components/calendar/SymptomLogModal";
import { getSymptomLogsInRange, type CalendarSymptomLogItem, type CalendarSymptomLogResponse, postSymptomLogsForDate } from "@/api/symptomsApi";
import { KEY_SYMPTOMS_BY_PHASE } from "@/lib/symptomAnalysis";
import { cn } from "@/lib/utils";
import type { SymptomOption } from "@/components/calendar/SymptomLogModal";
import { useAuth } from "@/hooks/useAuth";

type CalendarMode = "year" | "month";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function toISODate(y: number, m0: number, day: number) {
  return `${y}-${String(m0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getMonthRangeISO(year: number, month0: number) {
  const start = new Date(year, month0, 1);
  const end = new Date(year, month0 + 1, 0);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);
  return { startISO, endISO };
}

function severityDotClass(sev: number | null) {
  if (!sev || sev < 1) return "bg-primary/20";
  if (sev <= 2) return "bg-primary/30";
  if (sev <= 3) return "bg-primary/60";
  if (sev <= 4) return "bg-amber-500/85";
  return "bg-red-500";
}

function formatMiniMonthTitle(monthIndex0: number) {
  return MONTH_NAMES[monthIndex0].slice(0, 3);
}

export default function CalendarPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userKey = user?.id;

  const now = new Date();
  const [mode, setMode] = useState<CalendarMode>("year");
  const [year, setYear] = useState(now.getFullYear());
  const [month0, setMonth0] = useState(now.getMonth());

  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loggingDuringPeriod, setLoggingDuringPeriod] = useState(true);

  const symptomOptions: SymptomOption[] = useMemo(() => {
    const map = new Map<string, SymptomOption>();
    for (const phase of Object.keys(KEY_SYMPTOMS_BY_PHASE) as Array<keyof typeof KEY_SYMPTOMS_BY_PHASE>) {
      for (const s of KEY_SYMPTOMS_BY_PHASE[phase]) {
        if (!map.has(s.id)) map.set(s.id, { id: s.id, label: s.label });
      }
    }
    if (!map.has("bloating")) map.set("bloating", { id: "bloating", label: "Bloating" });
    return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, []);
  const symptomLabelById = useMemo(() => new Map(symptomOptions.map((o) => [o.id, o.label])), [symptomOptions]);

  const selectedRange = useMemo(() => {
    if (mode === "year") {
      const startISO = `${year}-01-01`;
      const endISO = `${year}-12-31`;
      return { startISO, endISO, key: `year-${year}` };
    }
    const { startISO, endISO } = getMonthRangeISO(year, month0);
    return { startISO, endISO, key: `month-${year}-${month0}` };
  }, [mode, year, month0]);

  const calendarRangeQuery = useQuery({
    queryKey: ["symptomLogsRange", selectedRange.key, userKey ?? "default"],
    queryFn: () => getSymptomLogsInRange(selectedRange.startISO, selectedRange.endISO, userKey),
    staleTime: 5 * 60 * 1000,
  });

  const logsByDate = useMemo(() => {
    const out: Record<string, CalendarSymptomLogItem[]> = {};
    if (!calendarRangeQuery.data) return out;
    for (const day of calendarRangeQuery.data) {
      out[day.date] = day.symptoms ?? [];
    }
    return out;
  }, [calendarRangeQuery.data]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function openModal(dateISO: string) {
    setSelectedDateISO(dateISO);
    setModalOpen(true);
  }

  function buildTooltipForDate(dateISO: string, symptoms: CalendarSymptomLogItem[]): string | undefined {
    if (!symptoms || symptoms.length === 0) return undefined;
    const sorted = [...symptoms].sort((a, b) => b.severity - a.severity);
    const max = 2;
    const parts = sorted.slice(0, max).map((s) => `${symptomLabelById.get(s.name) ?? s.name} (sev ${s.severity}, ${s.time})`);
    const extra = sorted.length > max ? ` +${sorted.length - max} more` : "";
    return parts.join("; ") + extra;
  }

  function MiniMonth({ monthIndex0 }: { monthIndex0: number }) {
    const firstDay = new Date(year, monthIndex0, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, monthIndex0 + 1, 0).getDate();
    const cells: (number | null)[] = [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className="rounded-2xl border border-border bg-card p-2">
        <div className="flex items-center justify-between px-1 py-1">
          <span className="text-xs font-bold">{formatMiniMonthTitle(monthIndex0)}</span>
          <span className="text-[10px] text-muted-foreground">{year}</span>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((h) => (
            <div key={h} className="text-[10px] text-muted-foreground text-center">
              {h}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="h-7 border border-border/20 rounded-md" />;
            const iso = toISODate(year, monthIndex0, day);
            const symptoms = logsByDate[iso] ?? [];
            const maxSeverity = symptoms.reduce((acc, s) => Math.max(acc, s.severity), 0);
            const isToday = iso === todayISO;
            const isSelected = iso === selectedDateISO;
            const tooltip = buildTooltipForDate(iso, symptoms);

            return (
              <button
                key={iso}
                type="button"
                title={tooltip}
                onClick={() => openModal(iso)}
                className={cn(
                  "relative h-7 w-full rounded-md border border-border/20 flex flex-col items-center justify-center transition-colors",
                  isSelected ? "bg-primary/10 ring-2 ring-primary/30 border-primary/40" : "hover:bg-muted/40",
                  isToday ? "font-extrabold text-primary" : "text-foreground"
                )}
                aria-label={`${iso}${symptoms.length ? " (logged)" : ""}`}
              >
                <span className="text-[11px] leading-none">{day}</span>
                {symptoms.length > 0 && (
                  <span className={cn("absolute bottom-1 w-1.5 h-1.5 rounded-full", severityDotClass(maxSeverity))} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function DayCell({ dateISO }: { dateISO: string }) {
    const symptoms = logsByDate[dateISO] ?? [];
    const maxSeverity = symptoms.reduce((acc, s) => Math.max(acc, s.severity), 0);
    const isToday = dateISO === todayISO;
    const isSelected = dateISO === selectedDateISO;
    const tooltip = buildTooltipForDate(dateISO, symptoms);

    return (
      <button
        type="button"
        title={tooltip}
        onClick={() => openModal(dateISO)}
        className={cn(
          "relative h-14 sm:h-16 w-full border-b border-r border-border/20 flex flex-col items-center justify-center transition-colors text-sm font-medium",
          "hover:bg-muted/55",
          isSelected ? "bg-primary/10 ring-2 ring-inset ring-primary/50" : "",
          isToday ? "font-extrabold text-primary" : ""
        )}
      >
        <span className={cn(isSelected ? "text-primary font-bold" : "")}>{Number(dateISO.slice(-2))}</span>
        {symptoms.length > 0 && (
          <span
            className={cn(
              "absolute bottom-2 w-2 h-2 rounded-full",
              severityDotClass(maxSeverity)
            )}
          />
        )}
      </button>
    );
  }

  function YearView() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 12 }, (_, i) => (
          <MiniMonth key={i} monthIndex0={i} />
        ))}
      </div>
    );
  }

  function MonthView() {
    const firstDay = new Date(year, month0, 1);
    const firstWeekday = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();

    const cells: (string | null)[] = [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => toISODate(year, month0, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
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
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border/60 bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">Calendar</h1>
              <p className="text-sm text-muted-foreground mt-1">Log symptoms by date and power analytics instantly.</p>
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
              {mode === "year" ? "Hover to see symptom summaries. Click any date to log or edit." : "Use arrows to navigate months. Click a date to log symptoms."}
            </p>
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
          </div>
        </div>
      </div>

      <div className="container py-6">
        {calendarRangeQuery.isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Loading calendar…</p>
          </div>
        ) : calendarRangeQuery.isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-sm font-semibold text-red-700">Could not load calendar data.</p>
            <p className="text-sm text-red-600 mt-1">{String((calendarRangeQuery.error as Error)?.message ?? calendarRangeQuery.error)}</p>
          </div>
        ) : (
          <>
            {mode === "year" ? <YearView /> : <MonthView />}

            {/* Modal */}
            {modalOpen && selectedDateISO && (
              <SymptomLogModal
                dateISO={selectedDateISO}
                initialSymptoms={logsByDate[selectedDateISO] ?? []}
                symptomOptions={symptomOptions}
                onClose={() => setModalOpen(false)}
                onSave={async (d, symptoms) => {
                  await postSymptomLogsForDate(d, symptoms, userKey, {
                    menstrualPhase: loggingDuringPeriod ? "period" : "other",
                  });
                  // Update the cached range immediately for “instant” calendar sync.
                  queryClient.setQueryData(["symptomLogsRange", selectedRange.key, userKey ?? "default"], (old?: CalendarSymptomLogResponse[]) => {
                    const prev = old ?? [];
                    const idx = prev.findIndex((x) => x.date === d);
                    const entry: CalendarSymptomLogResponse = { date: d, symptoms };
                    if (symptoms.length === 0) {
                      if (idx >= 0) return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
                      return prev;
                    }
                    if (idx >= 0) {
                      const next = [...prev];
                      next[idx] = entry;
                      return next;
                    }
                    return [...prev, entry];
                  });
                  await queryClient.invalidateQueries({ queryKey: ["symptomLogsRange", selectedRange.key, userKey ?? "default"] });
                  await queryClient.invalidateQueries({ queryKey: ["weeklyGuidance"] });
                }}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}

