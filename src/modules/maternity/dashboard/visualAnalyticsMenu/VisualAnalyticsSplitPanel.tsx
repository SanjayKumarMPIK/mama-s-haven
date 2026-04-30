// ─── Visual Analytics Split Panel ───────────────────────────────────────────
// Premium analytics matching Family Planning Wellness Tracker reference.
// 3 tabs: MOOD (purple), ENERGY (orange), SYMPTOMS (pink)
// 7/30 day toggle, animated chart transitions.
// STRICTLY isolated to Maternity Phase only — uses maternity data only.

import { useState, useMemo, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import { useMaternityAnalytics } from "../../analytics/useMaternityAnalytics";
import SymptomsTrendChart from "../../analytics/charts/SymptomsTrendChart";
import MoodTrendChart from "../../analytics/charts/MoodTrendChart";
import ActivityTrendChart from "../../analytics/charts/ActivityTrendChart";

type AnalyticsTab = "mood" | "energy" | "symptoms";
type TimeRange = 7 | 30;

/* ─── Tab config with per-tab gradient colors ────────────────────────────── */
const TABS: { id: AnalyticsTab; label: string; activeGrad: string; activeShadow: string }[] = [
  {
    id: "mood",
    label: "MOOD",
    activeGrad: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    activeShadow: "0 4px 20px rgba(139, 92, 246, 0.35)",
  },
  {
    id: "energy",
    label: "ENERGY",
    activeGrad: "linear-gradient(135deg, #f59e0b, #f97316)",
    activeShadow: "0 4px 20px rgba(245, 158, 11, 0.35)",
  },
  {
    id: "symptoms",
    label: "SYMPTOMS",
    activeGrad: "linear-gradient(135deg, #f43f5e, #db2777)",
    activeShadow: "0 4px 20px rgba(244, 63, 94, 0.35)",
  },
];

/* ─── Inject animation CSS once ──────────────────────────────────────────── */
const STYLE_ID = "__va-panel-animations";
function ensurePanelStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes vaChartFadeIn {
      0%   { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes vaChartFadeOut {
      0%   { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-6px); }
    }
    .va-chart-enter {
      animation: vaChartFadeIn 350ms cubic-bezier(0.25,0.46,0.45,0.94) both;
    }
    @media (prefers-reduced-motion: reduce) {
      .va-chart-enter { animation: none !important; }
    }
  `;
  document.head.appendChild(s);
}

export default function VisualAnalyticsSplitPanel() {
  ensurePanelStyles();

  const [activeTab, setActiveTab] = useState<AnalyticsTab>("mood");
  const [timeRange, setTimeRange] = useState<TimeRange>(7);
  const [chartKey, setChartKey] = useState(0);
  const analytics = useMaternityAnalytics(timeRange);

  // Re-key chart on tab or time-range change to trigger entrance animation
  useEffect(() => {
    setChartKey((k) => k + 1);
  }, [activeTab, timeRange]);

  const maxSymptom = useMemo(() => {
    if (!analytics.symptoms || analytics.symptoms.length === 0) return 6;
    return Math.max(...analytics.symptoms.map((d) => d.symptomCount), 6);
  }, [analytics.symptoms]);

  const chartCaption = useMemo(() => {
    switch (activeTab) {
      case "mood":
        return "MOOD TREND • LOW (1) → GOOD (3)";
      case "energy":
        return "ENERGY LEVEL • LOW (1) → HIGH (3)";
      case "symptoms":
        return `SYMPTOM FREQUENCY • COUNT PER DAY (MAX ${maxSymptom})`;
    }
  }, [activeTab, maxSymptom]);

  /* ─── Empty state ────────────────────────────────────────────────────── */
  if (!analytics.hasData) {
    return (
      <div className="rounded-3xl bg-gradient-to-b from-white to-slate-50/80 border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-extrabold text-sm tracking-widest uppercase text-slate-800">Visual Analytics</h2>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-sm text-slate-400 font-medium">No analytics data available yet. Start logging to see trends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-gradient-to-b from-white to-slate-50/80 border border-slate-100 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="px-6 sm:px-8 pt-7 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h2 className="font-extrabold text-sm tracking-widest uppercase text-slate-800">Visual Analytics</h2>
        </div>

        {/* Time Range Toggle */}
        <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200/60">
          {([7, 30] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all duration-200 ${
                timeRange === r
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────────── */}
      <div className="px-6 sm:px-8 pt-5 pb-3">
        <div className="flex items-center p-1.5 bg-slate-50/50 border border-slate-100/80 rounded-full">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={isActive ? {
                  background: tab.activeGrad,
                  boxShadow: tab.activeShadow,
                } : undefined}
                className={`flex-1 py-3 rounded-full text-[11px] font-extrabold tracking-widest uppercase transition-all duration-300 ${
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Chart Area ──────────────────────────────────────────── */}
      <div className="px-6 sm:px-8 pt-2 pb-2">
        <div key={chartKey} className="va-chart-enter min-h-[200px]">
          {activeTab === "mood" && <MoodTrendChart data={analytics.mood} />}
          {activeTab === "energy" && <ActivityTrendChart data={analytics.activity} />}
          {activeTab === "symptoms" && <SymptomsTrendChart data={analytics.symptoms} />}
        </div>
      </div>

      {/* ─── Caption ─────────────────────────────────────────────── */}
      <div className="px-6 sm:px-8 pb-7 pt-1">
        <p className="text-center text-[10px] font-bold tracking-[0.15em] uppercase text-slate-300">
          {chartCaption}
        </p>
      </div>
    </div>
  );
}
