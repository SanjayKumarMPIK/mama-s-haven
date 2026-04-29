import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar } from "recharts";
import { TrendingUp, Brain, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import { getStageLabel, getStageDescription } from "@/hooks/useMenopause";
import { generateInsightCards } from "@/lib/menopauseWellnessEngine";

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SymptomAnalytics() {
  const { profile, logs } = useMenopause();

  // Last 30 days trend data
  const trendData = useMemo(() => {
    const data: { date: string; label: string; hotFlashes: number; sleep: number; mood: number }[] = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date === dateStr);
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;

      data.push({
        date: dateStr,
        label: dayLabel,
        hotFlashes: log?.hotFlashCount ?? 0,
        sleep: log?.sleepHrs ?? 0,
        mood: log?.mood ?? 0,
      });
    }
    return data;
  }, [logs]);

  // Radar chart data from profile symptoms
  const radarData = useMemo(() => {
    if (!profile) return [];
    const { symptoms } = profile;
    return [
      { symptom: "Hot Flashes", value: symptoms.hotFlashes, fullMark: 5 },
      { symptom: "Night Sweats", value: symptoms.nightSweats, fullMark: 5 },
      { symptom: "Sleep", value: symptoms.sleep, fullMark: 5 },
      { symptom: "Fatigue", value: symptoms.fatigue, fullMark: 5 },
      { symptom: "Mood Swings", value: symptoms.moodSwings, fullMark: 5 },
      { symptom: "Anxiety", value: symptoms.anxiety, fullMark: 5 },
      { symptom: "Brain Fog", value: symptoms.brainFog, fullMark: 5 },
      { symptom: "Joint Pain", value: symptoms.jointPain, fullMark: 5 },
      { symptom: "Headache", value: symptoms.headache, fullMark: 5 },
    ];
  }, [profile]);

  // Bar chart — hot flash frequency this month
  const barData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const data: { day: string; count: number }[] = [];

    for (let d = 1; d <= Math.min(daysInMonth, now.getDate()); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const log = logs.find((l) => l.date === dateStr);
      data.push({ day: String(d), count: log?.hotFlashCount ?? 0 });
    }
    return data;
  }, [logs]);

  // AI insight cards
  const insightCards = useMemo(() => generateInsightCards(logs, profile), [logs, profile]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60">
      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Symptom Analytics</h1>
            <p className="text-xs text-slate-500">Your health patterns at a glance</p>
          </div>
        </div>

        {/* Stage Badge */}
        {profile && (
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-4 mb-6 animate-fadeIn">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl flex-shrink-0">
                ✨
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold mb-1.5">
                  {getStageLabel(profile.stage)}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {getStageDescription(profile.stage)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 30-Day Trend Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5 animate-fadeIn">
          <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" /> 30-Day Trend
          </h2>
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              <p>📝 Start logging your symptoms to see trends here.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, "auto"]} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                  labelStyle={{ fontWeight: 700 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="hotFlashes" stroke="#f59e0b" strokeWidth={2} dot={false} name="Hot Flashes" />
                <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={2} dot={false} name="Sleep (hrs)" />
                <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} dot={false} name="Mood (1–5)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Two-column: Radar + Bar */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Radar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" /> Symptom Profile
            </h2>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="symptom" tick={{ fontSize: 9, fill: "#64748b" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 9 }} />
                  <Radar name="Severity" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">Complete onboarding to see your symptom profile.</div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-fadeIn">
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-orange-500" /> Hot Flashes This Month
            </h2>
            {barData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} interval={Math.max(0, Math.floor(barData.length / 10))} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Hot Flashes" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-slate-400 text-sm">No hot flash data logged yet this month.</div>
            )}
          </div>
        </div>

        {/* AI Insight Cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 px-1">
            <span className="text-base">🤖</span> Your Personal Insights
          </h2>
          {insightCards.map((card, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-2xl border p-4 flex items-start gap-3 animate-fadeIn transition-all hover:shadow-sm",
                card.color
              )}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <span className="text-2xl flex-shrink-0">{card.emoji}</span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-0.5">{card.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{card.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
