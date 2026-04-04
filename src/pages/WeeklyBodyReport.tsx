import { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useHealthLog, type HealthLogs, type HealthLogEntry } from "@/hooks/useHealthLog";
import ScrollReveal from "@/components/ScrollReveal";
import {
  BarChart3, ArrowLeft, TrendingUp, TrendingDown,
  Minus, CalendarDays, Lightbulb, ListChecks, Sparkles,
} from "lucide-react";

// ─── Utilities ─────────────────────────────────────────────────────────────────

/** Return today as YYYY-MM-DD in LOCAL timezone (prevents UTC-shift bug) */
function localTodayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Add/subtract days from a local ISO date string without timezone shift */
function shiftISO(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00"); // noon prevents DST edge cases
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function datesInWindow(startISO: string, endISO: string): string[] {
  const dates: string[] = [];
  let cur = startISO;
  while (cur <= endISO) {
    dates.push(cur);
    cur = shiftISO(cur, 1);
  }
  return dates;
}

function prettify(key: string): string {
  // camelCase → Title Case  |  kebab-case → Title Case
  return key
    .replace(/-/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

function formatDateDisplay(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

/** Extract active symptom keys from any HealthLogEntry */
function extractSymptoms(entry: HealthLogEntry): string[] {
  if (!entry.symptoms) return [];
  return Object.entries(entry.symptoms as Record<string, boolean>)
    .filter(([, v]) => !!v)
    .map(([k]) => k);
}

// ─── Analytics Engine ──────────────────────────────────────────────────────────

interface SymptomStat {
  key: string;
  label: string;
  thisWeekDays: number;
  lastWeekDays: number;
  trend: "new" | "improved" | "worsened" | "same";
  changePct: number | null;
  dates: string[];
}

interface Pattern {
  type: "frequent" | "persistent";
  text: string;
}

interface WeekReport {
  thisStart: string;
  thisEnd: string;
  daysLogged: number;
  totalLogsDays: number;
  topSymptoms: SymptomStat[];
  patterns: Pattern[];
  actions: string[];
  summary: string;
  debugEntriesFound: number;
}

function buildFreqMap(logs: HealthLogs, dates: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const date of dates) {
    const entry = logs[date];
    if (!entry) continue;
    for (const key of extractSymptoms(entry)) {
      const existing = map.get(key) ?? [];
      existing.push(date);
      map.set(key, existing);
    }
  }
  return map;
}

function computeReport(logs: HealthLogs, thisWeekDates: string[], lastWeekDates: string[]): WeekReport {
  const thisStart = thisWeekDates[0];
  const thisEnd = thisWeekDates[thisWeekDates.length - 1];

  const thisMap = buildFreqMap(logs, thisWeekDates);
  const lastMap = buildFreqMap(logs, lastWeekDates);

  // Count days with any log
  const loggedDates = thisWeekDates.filter((d) => {
    const e = logs[d];
    return e && extractSymptoms(e).length > 0;
  });

  // Build stats
  const stats: SymptomStat[] = [];
  for (const [key, dates] of thisMap.entries()) {
    const lastDays = lastMap.get(key)?.length ?? 0;
    let trend: SymptomStat["trend"];
    let changePct: number | null = null;

    if (lastDays === 0) {
      trend = "new";
    } else {
      changePct = ((dates.length - lastDays) / lastDays) * 100;
      if (Math.abs(changePct) < 5) trend = "same";
      else if (changePct > 0) trend = "worsened";
      else trend = "improved";
    }

    stats.push({
      key,
      label: prettify(key),
      thisWeekDays: dates.length,
      lastWeekDays: lastDays,
      trend,
      changePct,
      dates,
    });
  }

  const topSymptoms = stats.sort((a, b) => b.thisWeekDays - a.thisWeekDays).slice(0, 5);

  // Pattern detection
  const patterns: Pattern[] = [];
  for (const s of topSymptoms) {
    if (s.thisWeekDays >= 3) {
      patterns.push({
        type: "frequent",
        text: `"${s.label}" appeared on ${s.thisWeekDays} day${s.thisWeekDays !== 1 ? "s" : ""} — a frequent pattern this week.`,
      });
    }
    // Consecutive-day check
    const sorted = [...s.dates].sort();
    let streak = 1, maxStreak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i] + "T12:00:00").getTime() - new Date(sorted[i - 1] + "T12:00:00").getTime()) / 86400000;
      if (diff === 1) { streak++; maxStreak = Math.max(maxStreak, streak); }
      else streak = 1;
    }
    if (maxStreak >= 2 && s.thisWeekDays >= 2 && !patterns.some(p => p.type === "persistent" && p.text.includes(s.label))) {
      patterns.push({
        type: "persistent",
        text: `"${s.label}" occurred on ${maxStreak} consecutive days — a persistent pattern.`,
      });
    }
  }

  // Action plan
  const actions: string[] = [];
  for (const s of topSymptoms) {
    if (s.thisWeekDays >= 2 && s.trend === "worsened") {
      actions.push(`"${s.label}" has increased compared to last week. Consider monitoring it more closely.`);
    }
    const k = s.key.toLowerCase();
    if ((k.includes("fatigue") || k === "fatigue") && s.thisWeekDays >= 2) {
      actions.push("Fatigue detected — aim for 7–8 hours of sleep and reduce screen time before bed.");
    }
    if (k.includes("headache") && s.thisWeekDays >= 2) {
      actions.push("Headaches logged — ensure adequate water intake throughout the day.");
    }
    if ((k.includes("cramp") || k.includes("pain")) && s.thisWeekDays >= 2) {
      actions.push(`"${s.label}" logged frequently — gentle stretching and warmth may help.`);
    }
    if ((k.includes("mood") || k.includes("stress")) && s.thisWeekDays >= 2) {
      actions.push("Mood/stress symptoms detected — short breathing exercises or walks can help.");
    }
  }
  // Deduplicate
  const uniqueActions = [...new Set(actions)];
  if (uniqueActions.length === 0) {
    uniqueActions.push("Keep logging symptoms daily to get more personalized suggestions.");
  }

  // Summary
  let summary: string;
  if (topSymptoms.length === 0) {
    summary = "No symptoms were logged this week. Open the calendar and start tracking to generate your report.";
  } else {
    const names = topSymptoms.slice(0, 3).map((s) => s.label);
    const freqCount = patterns.filter((p) => p.type === "frequent").length;
    const parts = [
      `This week, you logged symptoms on ${loggedDates.length} day${loggedDates.length !== 1 ? "s" : ""}.`,
      `Your most tracked symptom${names.length > 1 ? "s were" : " was"} ${names.join(", ")}.`,
      freqCount > 0
        ? `${freqCount} recurring pattern${freqCount > 1 ? "s were" : " was"} detected.`
        : "No strong recurring patterns yet — keep logging for better insights.",
    ];
    summary = parts.join(" ");
  }

  return {
    thisStart,
    thisEnd,
    daysLogged: loggedDates.length,
    totalLogsDays: Object.keys(logs).length,
    topSymptoms,
    patterns,
    actions: uniqueActions,
    summary,
    debugEntriesFound: loggedDates.length,
  };
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TrendBadge({ stat }: { stat: SymptomStat }) {
  if (stat.trend === "new")
    return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">✦ New</span>;
  if (stat.trend === "improved")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
        <TrendingDown className="w-3 h-3" /> {Math.abs(stat.changePct!).toFixed(0)}%
      </span>
    );
  if (stat.trend === "worsened")
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
        <TrendingUp className="w-3 h-3" /> {Math.abs(stat.changePct!).toFixed(0)}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
      <Minus className="w-3 h-3" /> Same
    </span>
  );
}

const PHASE_ACCENT: Record<string, { border: string; bg: string; text: string; pill: string; bar: string }> = {
  puberty:           { border: "border-pink-200",   bg: "bg-pink-50",   text: "text-pink-900",   pill: "bg-pink-100 text-pink-800",   bar: "bg-pink-400"   },
  maternity:         { border: "border-purple-200", bg: "bg-purple-50", text: "text-purple-900", pill: "bg-purple-100 text-purple-800", bar: "bg-purple-400" },
  "family-planning": { border: "border-teal-200",   bg: "bg-teal-50",   text: "text-teal-900",   pill: "bg-teal-100 text-teal-800",   bar: "bg-teal-400"   },
  menopause:         { border: "border-amber-200",  bg: "bg-amber-50",  text: "text-amber-900",  pill: "bg-amber-100 text-amber-800",  bar: "bg-amber-400"  },
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WeeklyBodyReport() {
  const { phase } = usePhase();
  const { logs } = useHealthLog();
  const accent = PHASE_ACCENT[phase] ?? PHASE_ACCENT.puberty;

  // Build date windows entirely in local time — no UTC shift
  const today = localTodayISO();
  const thisStart = shiftISO(today, -6);  // today - 6 = 7-day window
  const lastStart = shiftISO(today, -13); // previous 7-day window
  const lastEnd   = shiftISO(today, -7);

  const thisWeekDates = useMemo(() => datesInWindow(thisStart, today), [thisStart, today]);
  const lastWeekDates = useMemo(() => datesInWindow(lastStart, lastEnd), [lastStart, lastEnd]);

  const report = useMemo(
    () => computeReport(logs, thisWeekDates, lastWeekDates),
    [logs, thisWeekDates, lastWeekDates]
  );

  const isEmpty = report.topSymptoms.length === 0;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <Link
              to="/tools"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Tools
            </Link>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${accent.bg} flex items-center justify-center shadow-sm`}>
                <BarChart3 className={`w-5 h-5 ${accent.text}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Weekly Body Report</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDateDisplay(report.thisStart)} — {formatDateDisplay(report.thisEnd)}
                  &nbsp;·&nbsp;
                  {report.debugEntriesFound} day{report.debugEntriesFound !== 1 ? "s" : ""} of data found
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-8 max-w-3xl space-y-6">

        {/* ── Empty State ── */}
        {isEmpty && (
          <ScrollReveal>
            <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20">
              <BarChart3 className="w-14 h-14 text-muted-foreground/25 mb-5" />
              <h2 className="text-lg font-semibold mb-2">No data available yet</h2>
              <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed mb-6">
                No symptoms logged in the past 7 days. Start tracking from your calendar to generate your report.
              </p>
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:shadow-md active:scale-[0.97] transition-all"
              >
                <CalendarDays className="w-4 h-4" /> Open Calendar
              </Link>
            </div>
          </ScrollReveal>
        )}

        {/* ── Report Sections ── */}
        {!isEmpty && (
          <>
            {/* Summary */}
            <ScrollReveal>
              <div className={`rounded-2xl border-2 p-6 ${accent.border} ${accent.bg}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className={`w-4 h-4 ${accent.text}`} />
                  <h2 className={`text-xs font-bold uppercase tracking-widest ${accent.text}`}>Weekly Summary</h2>
                </div>
                <p className={`text-sm leading-relaxed ${accent.text}`}>{report.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${accent.pill}`}>
                    {report.daysLogged} day{report.daysLogged !== 1 ? "s" : ""} logged
                  </span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${accent.pill}`}>
                    {report.topSymptoms.length} symptom{report.topSymptoms.length !== 1 ? "s" : ""} tracked
                  </span>
                </div>
              </div>
            </ScrollReveal>

            {/* Top Symptoms */}
            <ScrollReveal>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
                  Top Symptoms This Week
                </h2>
                <div className="space-y-4">
                  {report.topSymptoms.map((s, i) => (
                    <div key={s.key} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-sm font-semibold truncate">{s.label}</span>
                          <TrendBadge stat={s} />
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${accent.bar}`}
                              style={{ width: `${Math.min((s.thisWeekDays / 7) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                            {s.thisWeekDays} / 7 day{s.thisWeekDays !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            {/* Changes vs Last Week */}
            <ScrollReveal>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  Changes vs Last Week
                </h2>
                {report.topSymptoms.every((s) => s.trend === "new") ? (
                  <p className="text-sm text-muted-foreground">First week of data — no comparison available yet.</p>
                ) : (
                  <div className="divide-y divide-border/40">
                    {report.topSymptoms.map((s) => {
                      if (s.trend === "new") {
                        return (
                          <div key={s.key} className="flex items-center justify-between py-2.5 text-sm">
                            <span className="text-foreground/80">{s.label}</span>
                            <span className="text-xs text-blue-600 font-semibold">Logged for the first time</span>
                          </div>
                        );
                      }
                      const arrow = s.trend === "improved" ? "↓" : s.trend === "worsened" ? "↑" : "→";
                      const color = s.trend === "improved" ? "text-green-600" : s.trend === "worsened" ? "text-rose-600" : "text-muted-foreground";
                      return (
                        <div key={s.key} className="flex items-center justify-between py-2.5 text-sm">
                          <span className="text-foreground/80">{s.label}</span>
                          <span className={`text-xs font-semibold ${color}`}>
                            {arrow} {s.changePct !== null ? `${Math.abs(s.changePct).toFixed(0)}%` : ""}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Pattern Insights */}
            {report.patterns.length > 0 && (
              <ScrollReveal>
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pattern Insights</h2>
                  </div>
                  <div className="space-y-3">
                    {report.patterns.map((p, i) => (
                      <div
                        key={i}
                        className={`rounded-xl p-4 text-sm leading-relaxed ${
                          p.type === "frequent"
                            ? "bg-amber-50 border border-amber-100 text-amber-900"
                            : "bg-rose-50 border border-rose-100 text-rose-900"
                        }`}
                      >
                        <span className="mr-1">{p.type === "frequent" ? "📊" : "🔁"}</span>
                        {p.text}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Action Plan */}
            <ScrollReveal>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ListChecks className="w-4 h-4 text-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Action Plan</h2>
                </div>
                <ul className="space-y-3">
                  {report.actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-primary/60" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>

            {/* Footer */}
            <ScrollReveal>
              <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-5 text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This report is generated purely from your logged calendar data.
                  The more consistently you log, the more accurate your insights become.
                </p>
                <Link
                  to="/calendar"
                  className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary hover:underline"
                >
                  <CalendarDays className="w-3.5 h-3.5" /> Log today's symptoms
                </Link>
              </div>
            </ScrollReveal>
          </>
        )}
      </div>
    </main>
  );
}
