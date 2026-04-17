import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, TrendingUp, Info } from "lucide-react";
import { usePhase } from "@/hooks/usePhase";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import {
  useHealthLog,
  calcFertileWindow,
  calcAverageCycleLength,
  summarizeMaternityByWeek,
  getMaternityWeekForDate,
  calcCycleConsistency,
  detectFrequentSymptoms,
  detectMaternityAlerts,
  summarizeMenopauseByWeek,
  type PubertyEntry,
  type FamilyPlanningEntry,
} from "@/hooks/useHealthLog";
import HealthCalendar from "@/components/HealthCalendar";
import DayLogModal from "@/components/DayLogModal";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";

const PHASE_HEADER: Record<string, { title: string; desc: string; accent: string }> = {
  puberty: {
    title: "Period & Wellness Log",
    desc: "Track your cycle, symptoms, and mood day by day.",
    accent: "from-pink-100 to-rose-50 border-pink-200",
  },
  maternity: {
    title: "Pregnancy Daily Log",
    desc: "Record hydration, sleep, symptoms, and mood to spot patterns early.",
    accent: "from-purple-100 to-violet-50 border-purple-200",
  },
  "family-planning": {
    title: "Fertility & Cycle Log",
    desc: "Log your cycle and symptoms to surface your fertile window.",
    accent: "from-teal-100 to-emerald-50 border-teal-200",
  },
  menopause: {
    title: "Wellness & Symptom Log",
    desc: "Monitor your symptoms week by week to discover patterns.",
    accent: "from-amber-100 to-orange-50 border-amber-200",
  },
};

// ─── Derived Insights Panels ──────────────────────────────────────────────────

function PubertyInsights() {
  const { logs } = useHealthLog();

  const avgCycle = useMemo(() => calcAverageCycleLength(logs), [logs]);

  const lastPeriodStartISO = useMemo(() => {
    const dates = Object.entries(logs)
      .filter(([, e]) => e.phase === "puberty" && (e as PubertyEntry).periodStarted)
      .map(([d]) => d)
      .sort()
      .reverse();
    return dates[0] ?? null;
  }, [logs]);

  const nextPredicted = useMemo(() => {
    if (!lastPeriodStartISO || !avgCycle) return null;
    const d = new Date(lastPeriodStartISO);
    d.setDate(d.getDate() + avgCycle);
    return d.toISOString().slice(0, 10);
  }, [lastPeriodStartISO, avgCycle]);

  const fertileWindow = useMemo(() => {
    if (!lastPeriodStartISO || !avgCycle) return null;
    return calcFertileWindow(lastPeriodStartISO, avgCycle);
  }, [lastPeriodStartISO, avgCycle]);

  const totalLogged = Object.values(logs).filter((e) => e.phase === "puberty").length;

  if (totalLogged === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Log at least one day to see cycle insights here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-pink-600">{totalLogged}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Days Logged</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-pink-600">{avgCycle ?? "—"}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Avg Cycle (days)</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-base font-bold text-pink-600">{nextPredicted ?? "—"}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Next Period (est.)</p>
        </div>
      </div>
      {fertileWindow && (
        <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
          <p className="text-xs font-semibold text-pink-800 mb-2">Estimated Fertile Window</p>
          <div className="flex items-center justify-between text-xs text-pink-700">
            <span>{fertileWindow.fertileStart}</span>
            <span className="font-bold bg-pink-200 px-2 py-0.5 rounded-lg">Ovulation: {fertileWindow.ovulation}</span>
            <span>{fertileWindow.fertileEnd}</span>
          </div>
          <p className="mt-2 text-[10px] text-pink-600">Based on average cycle. Log more entries to improve accuracy.</p>
        </div>
      )}
    </div>
  );
}

function MaternityInsights() {
  const { logs } = useHealthLog();
  const { activeEDD } = usePregnancyProfile();
  const alerts = useMemo(() => detectMaternityAlerts(logs), [logs]);
  const todayISO = new Date().toISOString().slice(0, 10);
  const currentWeek = activeEDD ? getMaternityWeekForDate(activeEDD, todayISO) : null;
  const weeklySummaries = useMemo(
    () => (activeEDD ? summarizeMaternityByWeek(logs, activeEDD, 4) : []),
    [logs, activeEDD]
  );
  const totalLogged = Object.values(logs).filter((e) => e.phase === "maternity").length;

  if (totalLogged === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Log at least one day to see wellness insights here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalLogged}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Days Logged</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{alerts.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Pattern Alerts</p>
        </div>
      </div>
      {alerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Wellness Alerts (recent days)
          </p>
          <ul className="space-y-1.5">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-center justify-between text-xs text-amber-700">
                <span>{a.date}</span>
                <span className="font-medium">{a.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
        <p className="text-xs font-semibold text-purple-800 mb-2">
          Weekly Pregnancy Tracking{activeEDD ? "" : " (set LMP in pregnancy dashboard)"}
        </p>
        <div className="flex items-center justify-between text-[11px] text-purple-800">
          <span>
            Current week: <span className="font-bold">{currentWeek ?? "—"}</span>
          </span>
          <span className="text-purple-700">Based on due date</span>
        </div>
        {weeklySummaries.length > 0 ? (
          <div className="mt-3 space-y-2">
            {weeklySummaries.map((s) => (
              <div key={s.week} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-purple-900">Week {s.week}</p>
                  <p className="text-[10px] text-purple-700">{s.weekStartISO} - {s.weekEndISO}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-purple-900">
                    {s.avgSleepHours ?? "—"}h sleep · {s.avgHydrationGlasses ?? "—"} glasses
                  </p>
                  {s.lowSleepDays > 0 || s.lowHydrationDays > 0 ? (
                    <p className="text-[10px] text-purple-700">
                      Low: {s.lowSleepDays} sleep, {s.lowHydrationDays} hydration
                    </p>
                  ) : (
                    <p className="text-[10px] text-purple-700">No low-sleep/hydration days</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-[10px] text-purple-700">Log a few maternity days to see weekly summaries.</p>
        )}
      </div>
    </div>
  );
}

function FamilyPlanningInsights() {
  const { logs } = useHealthLog();

  const latestFP = useMemo(() => {
    const entries = Object.entries(logs)
      .filter(([, e]) => e.phase === "family-planning")
      .sort(([a], [b]) => b.localeCompare(a));
    return entries[0]?.[1] as FamilyPlanningEntry | undefined;
  }, [logs]);

  const fw = useMemo(() => {
    if (!latestFP?.lastPeriodDate || !latestFP.cycleLength) return null;
    return calcFertileWindow(latestFP.lastPeriodDate, latestFP.cycleLength);
  }, [latestFP]);

  const consistency = useMemo(() => calcCycleConsistency(logs), [logs]);
  const totalLogged = Object.values(logs).filter((e) => e.phase === "family-planning").length;

  if (totalLogged === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Log at least one day to see fertility insights here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-teal-600">{totalLogged}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Days Logged</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-base font-bold text-teal-600">{latestFP?.cycleLength ?? "—"} days</p>
          <p className="text-[11px] text-muted-foreground mt-1">Last Cycle Length</p>
        </div>
      </div>
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
        <p className="text-xs font-semibold text-teal-800 mb-2">Cycle Consistency</p>
        <div className="flex items-center justify-between text-[11px] text-teal-700">
          <span>{consistency.sampleSize} cycle entry{consistency.sampleSize !== 1 ? "ies" : ""}</span>
          <span className="font-bold bg-teal-200 px-2 py-0.5 rounded-lg">
            {consistency.variabilityLevel ?? "—"} variability
          </span>
        </div>
        <p className="mt-2 text-[10px] text-teal-700">
          Avg: {consistency.averageCycleLength ?? "—"} days · Range: {consistency.rangeDays ?? "—"} days
        </p>
      </div>
      {fw && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
          <p className="text-xs font-semibold text-teal-800 mb-2">Fertile Window (from latest entry)</p>
          <div className="flex items-center justify-between text-xs text-teal-700">
            <span>{fw.fertileStart}</span>
            <span className="font-bold bg-teal-200 px-2 py-0.5 rounded-lg">Ovulation: {fw.ovulation}</span>
            <span>{fw.fertileEnd}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MenopauseInsights() {
  const { logs } = useHealthLog();
  const freqSymptoms = useMemo(() => detectFrequentSymptoms(logs), [logs]);
  const weeklySummaries = useMemo(() => summarizeMenopauseByWeek(logs, 4), [logs]);
  const totalLogged = Object.values(logs).filter((e) => e.phase === "menopause").length;

  if (totalLogged === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Log at least one day to see symptom summaries here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{totalLogged}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Days Logged</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{freqSymptoms.length}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Unique Symptoms</p>
        </div>
      </div>
      {freqSymptoms.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-800 mb-3">Symptom Frequency</p>
          <div className="space-y-2">
            {freqSymptoms.map(({ symptom, count }) => {
              const pct = Math.round((count / totalLogged) * 100);
              return (
                <div key={symptom}>
                  <div className="flex justify-between text-xs text-amber-800 mb-1">
                    <span>{symptom}</span>
                    <span>{count} day{count !== 1 ? "s" : ""} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-amber-200">
                    <div
                      className="h-1.5 rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {weeklySummaries.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold text-amber-800 mb-2">Weekly Summaries (recent)</p>
          <div className="space-y-2">
            {weeklySummaries.map((s) => (
              <div key={s.weekStartISO} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Week of {s.weekStartISO}</p>
                  <p className="text-[10px] text-amber-700">
                    {s.totalLoggedDays} day{s.totalLoggedDays !== 1 ? "s" : ""} · {s.weekStartISO} - {s.weekEndISO}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-amber-900">{s.avgSleepHours ?? "—"}h avg sleep</p>
                  {s.topSymptoms.length > 0 ? (
                    <p className="text-[10px] text-amber-700">
                      Top: {s.topSymptoms[0].symptom}{s.topSymptoms[0].count ? ` (${s.topSymptoms[0].count})` : ""}
                    </p>
                  ) : (
                    <p className="text-[10px] text-amber-700">No symptom flags this week</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function HealthLog() {
  const { phase, phaseName, phaseEmoji } = usePhase();
  const { logs } = useHealthLog();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const header = PHASE_HEADER[phase] ?? PHASE_HEADER.puberty;

  function goPrev() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function goNext() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  // Close modal on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedDate(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Page header */}
      <div className={`bg-gradient-to-br ${header.accent} border-b`}>
        <div className="container py-8">
          <ScrollReveal>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{phaseEmoji}</span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {phaseName} phase
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2.5">
                  <CalendarDays className="w-7 h-7 text-primary" />
                  {header.title}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground max-w-lg">{header.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold text-primary">
                  {Object.values(logs).filter((e) => e.phase === phase).length}
                </p>
                <p className="text-xs text-muted-foreground">days logged</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-8 space-y-8 max-w-3xl">
        {/* Calendar */}
        <ScrollReveal>
          <HealthCalendar
            year={year}
            month={month}
            logs={logs}
            selectedDate={selectedDate}
            onDayClick={setSelectedDate}
            onPrev={goPrev}
            onNext={goNext}
          />
        </ScrollReveal>

        {/* Derived Insights */}
        <ScrollReveal delay={100}>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Derived Insights</h2>
                <p className="text-[11px] text-muted-foreground">Calculated from your logged entries</p>
              </div>
            </div>

            {phase === "puberty" && <PubertyInsights />}
            {phase === "maternity" && <MaternityInsights />}
            {phase === "family-planning" && <FamilyPlanningInsights />}
            {phase === "menopause" && <MenopauseInsights />}
          </div>
        </ScrollReveal>

        <SafetyDisclaimer />
      </div>

      {/* Day Log Modal */}
      {selectedDate && (
        <DayLogModal
          dateISO={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </main>
  );
}
