import { useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { useMaternityAnalytics } from "../../analytics/useMaternityAnalytics";

type TimeRange = 7 | 30;
type ChartTab = "mood" | "energy" | "symptoms";

/* ── Custom Tooltip ─────────────────────────────────────── */
function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-100 text-xs">
      <p className="font-bold text-slate-600 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.stroke || p.fill }} className="font-semibold">
          {p.name}: {formatter ? formatter(p.value) : (typeof p.value === "number" ? p.value.toFixed(1) : p.value)}
        </p>
      ))}
    </div>
  );
}

function moodLabel(score: number): string {
  if (score >= 2.5) return "Good";
  if (score >= 1.5) return "Okay";
  return "Low";
}

function energyLabel(score: number): string {
  if (score >= 2.5) return "High";
  if (score >= 1.5) return "Mid";
  return "Low";
}

export default function VisualAnalyticsSplitPanel() {
  const [range, setRange] = useState<TimeRange>(7);
  const [tab, setTab] = useState<ChartTab>("mood");

  const analytics = useMaternityAnalytics(range);

  const tabs: { id: ChartTab; label: string; color: string }[] = [
    { id: "mood", label: "Mood", color: "from-violet-500 to-purple-600" },
    { id: "energy", label: "Energy", color: "from-amber-500 to-orange-500" },
    { id: "symptoms", label: "Symptoms", color: "from-rose-500 to-pink-500" },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-3xl p-6 border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)]"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%)",
        backdropFilter: "blur(20px)",
      }}
      aria-labelledby="analytics-heading"
    >
      {/* Decorative blob */}
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-violet-100/30 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <h2 id="analytics-heading" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
            Visual Analytics
          </h2>
        </div>
        {/* Weekly / Monthly toggle */}
        <div className="flex bg-slate-100 rounded-full p-0.5 shadow-inner">
          {([7, 30] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
                range === r
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* Chart Tabs */}
      <div className="flex gap-2 mb-5 relative z-10">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
              tab === t.id
                ? `bg-gradient-to-r ${t.color} text-white shadow-lg`
                : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart or empty state */}
      {analytics.hasData ? (
        <div className="relative z-10">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {tab === "mood" ? (
                <LineChart data={analytics.mood} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moodGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={8} />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    domain={[0, 3]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v: number) => moodLabel(v)}
                  />
                  <Tooltip content={<ChartTooltip formatter={moodLabel} />} />
                  <Line
                    type="monotone" dataKey="moodScore" name="Mood"
                    stroke="url(#moodGrad)" strokeWidth={3}
                    dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: "#7c3aed", strokeWidth: 2, stroke: "#fff" }}
                  />
                </LineChart>
              ) : tab === "energy" ? (
                <AreaChart data={analytics.activity} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={8} />
                  <YAxis
                    axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    domain={[0, 3]}
                    ticks={[1, 2, 3]}
                    tickFormatter={(v: number) => energyLabel(v)}
                  />
                  <Tooltip content={<ChartTooltip formatter={energyLabel} />} />
                  <Area
                    type="monotone" dataKey="activityLevel" name="Energy"
                    stroke="#f59e0b" strokeWidth={3}
                    fill="url(#energyFill)" fillOpacity={1}
                    dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                  />
                </AreaChart>
              ) : (
                <BarChart data={analytics.symptoms} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="symptomFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, 6]} />
                  <Tooltip content={<ChartTooltip formatter={(v: number) => Math.round(v)} />} />
                  <Bar dataKey="symptomCount" name="Symptom Count" fill="url(#symptomFill)" radius={[6, 6, 0, 0]} barSize={20} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <p className="text-[10px] text-center text-slate-400 mt-4 font-medium uppercase tracking-wider">
            {tab === "mood" && "Mood Trend • Low (1) → Good (3)"}
            {tab === "energy" && "Energy Level • Low (1) → High (3)"}
            {tab === "symptoms" && "Symptom Frequency • Count per day (max 6)"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[280px] text-center relative z-10">
          <p className="text-sm text-slate-400 font-medium">
            No analytics data available yet.
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Start logging your daily symptoms to see trends for the {range}-day view.
          </p>
        </div>
      )}
    </section>
  );
}
