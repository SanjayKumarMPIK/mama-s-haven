import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BarChart3, Link2, Save, Search, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog, type MenopauseEntry } from "@/hooks/useHealthLog";
import {
  TRIGGER_OPTIONS,
  analyzeTriggerPatterns,
  readMenopauseToolData,
  writeMenopauseToolData,
  fetchSyncedToolData,
  type MenopauseTriggerLog,
  type TriggerOptionId,
} from "@/lib/menopauseTools";
import { cn } from "@/lib/utils";

export default function MenoTriggerFinder() {
  const { user } = useAuth();
  const { getPhaseLogs } = useHealthLog();
  const today = new Date().toISOString().slice(0, 10);

  const calendarLogs = useMemo(() => {
    const phaseLogs = getPhaseLogs("menopause");
    return Object.entries(phaseLogs)
      .map(([date, entry]) => ({ date, entry: entry as MenopauseEntry }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getPhaseLogs]);

  const [triggerLogs, setTriggerLogs] = useState<MenopauseTriggerLog[]>(() => readMenopauseToolData(user?.id, "triggerLogs", []));

  useEffect(() => {
    if (!user) return;
    const sync = async () => {
      const data = await fetchSyncedToolData(user.id, "triggerLogs");
      if (data && data.length > 0) {
        const mapped: MenopauseTriggerLog[] = data.map((d: any) => ({
          date: d.date,
          triggers: d.triggers,
          notes: d.notes
        }));
        setTriggerLogs(prev => {
          const merged = [...mapped, ...prev.filter(p => !mapped.some(m => m.date === p.date))];
          return merged.sort((a, b) => b.date.localeCompare(a.date));
        });
      }
    };
    sync();
  }, [user]);

  const todayEntry = triggerLogs.find((log) => log.date === today);
  const [selectedTriggers, setSelectedTriggers] = useState<TriggerOptionId[]>(todayEntry?.triggers ?? []);
  const [notes, setNotes] = useState(todayEntry?.notes ?? "");

  useEffect(() => {
    if (todayEntry) {
      setSelectedTriggers(todayEntry.triggers);
      setNotes(todayEntry.notes ?? "");
    }
  }, [todayEntry]);

  const insights = useMemo(() => analyzeTriggerPatterns(triggerLogs, calendarLogs), [calendarLogs, triggerLogs]);
  const groupedBySymptom = useMemo(() => {
    const grouped = new Map<string, typeof insights>();
    for (const insight of insights) {
      const current = grouped.get(insight.symptom) ?? [];
      grouped.set(insight.symptom, [...current, insight]);
    }
    return Array.from(grouped.entries());
  }, [insights]);

  const toggleTrigger = (trigger: TriggerOptionId) => {
    setSelectedTriggers((prev) => {
      if (trigger === "no_obvious_trigger") return prev.includes(trigger) ? [] : [trigger];
      const withoutNoTrigger = prev.filter((item) => item !== "no_obvious_trigger");
      return withoutNoTrigger.includes(trigger)
        ? withoutNoTrigger.filter((item) => item !== trigger)
        : [...withoutNoTrigger, trigger];
    });
  };

  const saveTodayLog = () => {
    const nextLog: MenopauseTriggerLog = { date: today, triggers: selectedTriggers, notes: notes.trim() };
    const filtered = triggerLogs.filter((log) => log.date !== today);
    const next = selectedTriggers.length === 0 && !notes.trim() ? filtered : [nextLog, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    setTriggerLogs(next);
    writeMenopauseToolData(user?.id, "triggerLogs", next);
    toast.success("Today's trigger log was saved.");
  };

  const helpfulTips = useMemo(() => {
    if (insights.length === 0) {
      return [
        "Log triggers on the same day you log symptoms for clearer pattern signals.",
        "Use the calendar consistently for 2 to 4 weeks before expecting stronger patterns.",
        "Treat every insight as a possible link, not a confirmed cause.",
      ];
    }
    return [
      "If a trigger appears repeatedly, try changing one habit at a time and observe the next week.",
      "When a pattern looks stronger, pair the trigger note with symptom timing in your calendar entries.",
      "No single day proves a connection. Repeated co-occurrence matters more than one difficult day.",
    ];
  }, [insights.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/60 via-white to-fuchsia-50/40">
      <div className="container max-w-5xl space-y-6 py-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/tools" className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition-colors hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-md">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Trigger Finder</h1>
            <p className="text-xs text-slate-500">Discover possible links between daily triggers and menopause symptoms</p>
          </div>
        </div>

        <section className="rounded-3xl border border-violet-200/70 bg-white/85 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Today's Trigger Log</h2>
              <p className="mt-1 text-xs text-slate-500">Select anything that may have influenced symptoms today.</p>
            </div>
            <button onClick={saveTodayLog} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700">
              <Save className="h-4 w-4" /> Save
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {TRIGGER_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleTrigger(option.id)}
                className={cn(
                  "rounded-full border px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                  selectedTriggers.includes(option.id)
                    ? "border-violet-300 bg-violet-100 text-violet-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Optional note about today"
            className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white"
          />
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-bold text-slate-800">Recent Patterns</h2>
            </div>
            <div className="mt-4 space-y-3">
              {insights.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No clear pattern detected yet. Keep logging triggers with your calendar symptoms to build better insights.
                </div>
              ) : (
                insights.slice(0, 4).map((insight) => (
                  <div key={`${insight.trigger}-${insight.symptom}`} className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800">{insight.message}</p>
                      <span className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        insight.confidence === "Stronger pattern"
                          ? "bg-emerald-100 text-emerald-700"
                          : insight.confidence === "Possible pattern"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600",
                      )}>
                        {insight.confidence}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Logged on {insight.triggerDays} trigger day{insight.triggerDays === 1 ? "" : "s"}; symptom appeared on {insight.symptomDaysWithTrigger} of those days.
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-violet-600" />
              <h2 className="text-sm font-bold text-slate-800">Symptom Connections</h2>
            </div>
            <div className="mt-4 space-y-3">
              {groupedBySymptom.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Your symptom connection list will appear here after a few days of trigger logging.
                </div>
              ) : (
                groupedBySymptom.slice(0, 4).map(([symptom, symptomInsights]) => (
                  <div key={symptom} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <p className="text-sm font-semibold capitalize text-slate-800">{symptom.replace(/([A-Z])/g, " $1")}</p>
                    <p className="mt-1 text-xs text-slate-500">Most repeated link: {symptomInsights[0].message}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white/85 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">Helpful Tips</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {helpfulTips.map((tip) => (
              <div key={tip} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                {tip}
              </div>
            ))}
          </div>
        </section>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <Shield className="h-5 w-5 shrink-0 text-slate-500" />
          <p className="text-[11px] leading-relaxed text-slate-500">
            Trigger Finder highlights possible patterns only. It does not confirm causes or diagnose symptoms.
          </p>
        </div>
      </div>
    </div>
  );
}
