import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Flame, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause, HOT_FLASH_TRIGGER_OPTIONS } from "@/hooks/useMenopause";
import type { HotFlashType, HotFlashSeverity, HotFlashTrigger } from "@/hooks/useMenopause";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTimeOfDay(iso: string): "morning" | "afternoon" | "evening" | "night" {
  const hr = new Date(iso).getHours();
  if (hr < 6) return "night";
  if (hr < 12) return "morning";
  if (hr < 18) return "afternoon";
  return "evening";
}

const TIME_LABELS: Record<string, string> = { morning: "🌅 Morning", afternoon: "☀️ Afternoon", evening: "🌇 Evening", night: "🌙 Night" };

function computeWeeklySummary(events: ReturnType<typeof useMenopause>["hotFlashEvents"]) {
  if (events.length === 0) return null;

  // Total count
  const total = events.length;

  // Most common trigger
  const triggerCounts: Record<string, number> = {};
  events.forEach((e) => e.triggers.forEach((t) => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; }));
  const topTrigger = Object.entries(triggerCounts).sort(([, a], [, b]) => b - a)[0];
  const topTriggerOption = topTrigger ? HOT_FLASH_TRIGGER_OPTIONS.find((o) => o.id === topTrigger[0]) : null;

  // Most frequent time
  const timeCounts: Record<string, number> = {};
  events.forEach((e) => { const t = getTimeOfDay(e.dateTime); timeCounts[t] = (timeCounts[t] || 0) + 1; });
  const topTime = Object.entries(timeCounts).sort(([, a], [, b]) => b - a)[0];

  // Trend: compare first half vs second half of this week's events
  const sorted = [...events].sort((a, b) => a.dateTime.localeCompare(b.dateTime));
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid).length;
  const secondHalf = sorted.slice(mid).length;
  const trend: "increasing" | "stable" | "reducing" = secondHalf > firstHalf + 1 ? "increasing" : firstHalf > secondHalf + 1 ? "reducing" : "stable";

  // Severity breakdown
  const severityCounts = { mild: 0, moderate: 0, severe: 0 };
  events.forEach((e) => { severityCounts[e.severity]++; });

  return { total, topTrigger: topTriggerOption, topTime: topTime?.[0], trend, severityCounts };
}

function buildDailyChartData(events: ReturnType<typeof useMenopause>["hotFlashEvents"]) {
  const now = new Date();
  const data: { label: string; count: number; day: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayISO = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString("en-IN", { weekday: "short" });
    const count = events.filter((e) => e.dateTime.slice(0, 10) === dayISO).length;
    data.push({ label: dayLabel, count, day: dayISO });
  }
  return data;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MenoHotFlashTracker() {
  const { hotFlashEvents, addHotFlashEvent, getHotFlashEventsForDays } = useMenopause();

  // Form state
  const [type, setType] = useState<HotFlashType>("hot_flash");
  const [severity, setSeverity] = useState<HotFlashSeverity>("moderate");
  const [triggers, setTriggers] = useState<HotFlashTrigger[]>([]);
  const [notes, setNotes] = useState("");
  const [showRecent, setShowRecent] = useState(false);

  // Summary from last 7 days
  const weekEvents = useMemo(() => getHotFlashEventsForDays(7), [getHotFlashEventsForDays]);
  const summary = useMemo(() => computeWeeklySummary(weekEvents), [weekEvents]);
  const chartData = useMemo(() => buildDailyChartData(weekEvents), [weekEvents]);

  const toggleTrigger = (t: HotFlashTrigger) => {
    setTriggers((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  };

  const handleLog = () => {
    addHotFlashEvent({
      dateTime: new Date().toISOString(),
      type,
      severity,
      triggers: triggers.length > 0 ? triggers : ["unknown"],
      notes,
    });
    // Reset form
    setTriggers([]);
    setNotes("");
    toast.success("Hot flash logged!");
  };

  // Recent events (last 10)
  const recentEvents = hotFlashEvents.slice(0, 10);

  // Guidance
  const guidance = useMemo(() => {
    if (!summary) return "Start logging your hot flashes to see patterns and get personalized guidance.";
    const parts: string[] = [];
    if (summary.topTime === "night" || summary.topTime === "evening") {
      parts.push("Hot flashes appear more often at night. Keeping your bedroom cool and using breathable fabrics may help.");
    }
    if (summary.topTrigger?.id === "caffeine") {
      parts.push("Caffeine appears to be a trigger. Consider reducing intake, especially after noon.");
    } else if (summary.topTrigger?.id === "stress") {
      parts.push("Stress may be triggering your hot flashes. Try deep breathing or short walks.");
    } else if (summary.topTrigger?.id === "spicy_food") {
      parts.push("Spicy food seems linked. Consider milder meals and see if it helps.");
    }
    if (summary.trend === "increasing") {
      parts.push("Hot flashes seem to be increasing. Stay hydrated and track consistently.");
    } else if (summary.trend === "reducing") {
      parts.push("Great news — your hot flashes seem to be reducing. Keep up your current routine!");
    }
    if (parts.length === 0) parts.push("Keep logging to identify triggers and patterns over time.");
    return parts.join(" ");
  }, [summary]);

  const hasSevere = summary && summary.severityCounts.severe >= 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff8f6] via-[#fffaf7] to-[#fff5ef] font-[Poppins,sans-serif]">
      <div className="container max-w-3xl py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/tools" className="w-9 h-9 rounded-xl border border-slate-200 bg-white/90 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-md">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Hot Flash Tracker</h1>
            <p className="text-xs text-slate-500">Track, understand triggers, and manage</p>
          </div>
        </div>

        {hasSevere && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-medium text-rose-800">You've logged several severe hot flashes this week. Please consult a healthcare professional if symptoms are severe or concerning.</p>
          </div>
        )}

        {summary && (
          <div className="rounded-3xl border border-rose-200/60 bg-white/85 p-5 shadow-sm backdrop-blur-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4">📊 This Week's Summary</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-rose-50/80 border border-rose-100/60 p-3 text-center">
                <p className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1">Total</p>
                <span className="text-2xl font-bold text-slate-800">{summary.total}</span>
              </div>
              <div className="rounded-xl bg-orange-50/80 border border-orange-100/60 p-3 text-center">
                <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-1">Top Trigger</p>
                <span className="text-sm font-bold text-slate-800">{summary.topTrigger ? `${summary.topTrigger.emoji} ${summary.topTrigger.label}` : "–"}</span>
              </div>
              <div className="rounded-xl bg-amber-50/80 border border-amber-100/60 p-3 text-center">
                <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-1">Peak Time</p>
                <span className="text-sm font-bold text-slate-800">{summary.topTime ? TIME_LABELS[summary.topTime] : "–"}</span>
              </div>
              <div className="rounded-xl bg-purple-50/80 border border-purple-100/60 p-3 text-center">
                <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider mb-1">Trend</p>
                <span className={cn("text-sm font-bold capitalize", summary.trend === "reducing" ? "text-emerald-600" : summary.trend === "increasing" ? "text-rose-600" : "text-slate-600")}>{summary.trend}</span>
              </div>
            </div>

            {/* Severity breakdown */}
            <div className="flex gap-2 mt-3">
              <span className="flex-1 text-center text-[9px] font-semibold py-1.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-200">Mild: {summary.severityCounts.mild}</span>
              <span className="flex-1 text-center text-[9px] font-semibold py-1.5 rounded-lg border bg-amber-50 text-amber-700 border-amber-200">Moderate: {summary.severityCounts.moderate}</span>
              <span className="flex-1 text-center text-[9px] font-semibold py-1.5 rounded-lg border bg-rose-50 text-rose-700 border-rose-200">Severe: {summary.severityCounts.severe}</span>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">📈 7-Day Overview</h2>
          {weekEvents.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">Log hot flashes to see your weekly chart</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="count" fill="url(#hotFlashGrad)" radius={[6, 6, 0, 0]} name="Hot Flashes" />
                <defs>
                  <linearGradient id="hotFlashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#fb923c" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">🔥 Log a Hot Flash</h2>
          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Type</label>
              <div className="flex gap-2">
                {([{ id: "hot_flash", label: "Hot Flash", emoji: "🔥" }, { id: "night_sweat", label: "Night Sweat", emoji: "🌙" }] as const).map((t) => (
                    <button key={t.id} onClick={() => setType(t.id)} className={cn("flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5", type === t.id ? "border-rose-400 bg-rose-50 text-rose-700" : "border-slate-200 text-slate-500 hover:border-rose-200")}> 
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Severity</label>
              <div className="flex gap-2">
                {([{ id: "mild", label: "Mild", color: "border-emerald-400 bg-emerald-50 text-emerald-700" }, { id: "moderate", label: "Moderate", color: "border-amber-400 bg-amber-50 text-amber-700" }, { id: "severe", label: "Severe", color: "border-rose-400 bg-rose-50 text-rose-700" }] as const).map((s) => (
                  <button key={s.id} onClick={() => setSeverity(s.id)} className={cn("flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all capitalize hover:-translate-y-0.5", severity === s.id ? s.color : "border-slate-200 text-slate-500")}>{s.label}</button>
                ))}
              </div>
            </div>

            {/* Triggers */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Possible Triggers</label>
              <div className="flex flex-wrap gap-2">
                {HOT_FLASH_TRIGGER_OPTIONS.map((t) => (
                  <button key={t.id} onClick={() => toggleTrigger(t.id)} className={cn("inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all hover:-translate-y-0.5", triggers.includes(t.id) ? "border-orange-400 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-500 hover:border-orange-200")}>
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Notes (optional)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any extra details..." rows={2} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 resize-none" />
            </div>
          </div>

          <button onClick={handleLog} className="w-full mt-5 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]">
            Log Hot Flash
          </button>
        </div>

        <div className="rounded-3xl border border-purple-200/60 bg-gradient-to-br from-purple-50/80 to-indigo-50/40 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-2">💡 Insight</h2>
          <p className="text-xs text-slate-700 leading-relaxed">{guidance}</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">🌿 Management Tips</h2>
          <div className="space-y-2">
            {[
              "Stay hydrated — drink cool water throughout the day",
              "Wear layered, breathable clothing for quick adjustments",
              "Keep your bedroom cool and use cotton bed linen",
              "Reduce caffeine and spicy food, especially after noon",
              "Practice slow breathing when a hot flash begins",
              "Regular moderate exercise may reduce frequency over time",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-rose-50/60 border border-rose-100/60">
                <span className="text-rose-400 mt-0.5">•</span>
                <p className="text-xs text-slate-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-5 shadow-sm">
          <button onClick={() => setShowRecent(!showRecent)} className="w-full flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700">📋 Recent Logs ({hotFlashEvents.length})</h2>
            <span className="text-xs text-slate-400">{showRecent ? "Hide" : "Show"}</span>
          </button>
          {showRecent && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {recentEvents.length === 0 ? (
                <p className="text-center py-4 text-slate-400 text-xs">No logs yet</p>
              ) : recentEvents.map((e) => {
                const dt = new Date(e.dateTime);
                return (
                  <div key={e.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-lg flex-shrink-0">{e.type === "hot_flash" ? "🔥" : "🌙"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-700">{e.type === "hot_flash" ? "Hot Flash" : "Night Sweat"}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", e.severity === "mild" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : e.severity === "moderate" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-rose-50 text-rose-700 border-rose-200")}>{e.severity}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                      {e.triggers.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {e.triggers.map((t) => {
                            const opt = HOT_FLASH_TRIGGER_OPTIONS.find((o) => o.id === t);
                            return <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600 border border-orange-100">{opt?.emoji} {opt?.label}</span>;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] text-slate-400 text-center">This tool is for awareness only — not a medical diagnosis. Please consult a healthcare professional for personalized guidance.</p>
        </div>
      </div>
    </div>
  );
}
