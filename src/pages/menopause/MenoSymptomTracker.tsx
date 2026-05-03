import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowLeft, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause, SYMPTOM_OPTIONS, type SymptomId } from "@/hooks/useMenopause";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── Severity badge ──────────────────────────────────────────────────────────

function SeverityBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 font-medium">None</span>;
  if (value <= 2) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-semibold">Mild</span>;
  if (value <= 3) return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">Moderate</span>;
  return <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-semibold">Severe</span>;
}

// ─── Quick-log panel ─────────────────────────────────────────────────────────

const FULL_SYMPTOMS: { id: SymptomId; label: string; emoji: string; field: string }[] = [
  { id: "hot_flashes", label: "Hot flashes", emoji: "🔥", field: "hotFlashCount" },
  { id: "night_sweats", label: "Night sweats", emoji: "🌙", field: "nightSweats" },
  { id: "sleep_issues", label: "Sleep issues", emoji: "😴", field: "sleepHrs" },
  { id: "mood_swings", label: "Mood swings", emoji: "🎭", field: "mood" },
  { id: "anxiety", label: "Anxiety", emoji: "😰", field: "anxiety" },
  { id: "brain_fog", label: "Brain fog", emoji: "🌫️", field: "brainFog" },
  { id: "fatigue", label: "Fatigue", emoji: "🪫", field: "fatigue" },
  { id: "joint_pain", label: "Joint pain", emoji: "🦴", field: "jointPain" },
  { id: "muscle_stiffness", label: "Muscle stiffness", emoji: "💪", field: "muscleStiffness" },
  { id: "weight_gain", label: "Weight gain", emoji: "⚖️", field: "weightGainFeeling" },
  { id: "vaginal_dryness", label: "Vaginal dryness", emoji: "💧", field: "vaginalDryness" },
  { id: "low_libido", label: "Low libido", emoji: "💜", field: "lowLibido" },
  { id: "dry_skin", label: "Dry skin", emoji: "🧴", field: "drySkin" },
  { id: "hair_thinning", label: "Hair thinning", emoji: "💇", field: "hairThinning" },
  { id: "palpitations", label: "Palpitations", emoji: "💓", field: "palpitations" },
];

const SEVERITY_LEVELS = [
  { value: 0, label: "None", color: "bg-slate-100 text-slate-500 border-slate-200" },
  { value: 1, label: "Mild", color: "bg-teal-50 text-teal-700 border-teal-300" },
  { value: 3, label: "Moderate", color: "bg-amber-50 text-amber-700 border-amber-300" },
  { value: 5, label: "Severe", color: "bg-rose-50 text-rose-700 border-rose-300" },
];

export default function MenoSymptomTracker() {
  const { logs, addLog, getLogForDate } = useMenopause();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLog = getLogForDate(todayISO);
  const [range, setRange] = useState<7 | 14 | 30>(7);

  // State for quick-log
  const [editing, setEditing] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    FULL_SYMPTOMS.forEach((s) => {
      init[s.field] = (todayLog as any)?.[s.field] ?? 0;
    });
    return init;
  });

  const handleSave = () => {
    const entry = {
      ...(todayLog || {
        date: todayISO, hotFlashCount: 0, nightSweats: 0, jointPain: 0, headache: 0,
        anxiety: 0, vaginalDryness: 0, fatigue: 0, mood: 3, sleepHrs: 7,
        symptoms: [], severity: "mild" as const, energyLevel: 3, sleepQuality: "average" as const,
        notes: "", painLevel: 0, periodOccurred: false,
      }),
      ...editing,
      date: todayISO,
    };
    addLog(entry as any);
  };

  // Trend data
  const trendData = useMemo(() => {
    const data: { date: string; label: string; hotFlashes: number; sleep: number; mood: number; fatigue: number; anxiety: number }[] = [];
    const now = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const log = logs.find((l) => l.date === dateStr);
      data.push({
        date: dateStr,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        hotFlashes: log?.hotFlashCount ?? 0,
        sleep: log?.sleepHrs ?? 0,
        mood: log?.mood ?? 0,
        fatigue: log?.fatigue ?? 0,
        anxiety: log?.anxiety ?? 0,
      });
    }
    return data;
  }, [logs, range]);

  // Doctor alert check
  const last3 = useMemo(() => {
    const now = new Date();
    return logs.filter((l) => {
      const diff = (now.getTime() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
      return diff <= 3;
    });
  }, [logs]);
  const showDoctorAlert = last3.length >= 3 && last3.every((l) => (l.jointPain ?? 0) >= 4 || (l.fatigue ?? 0) >= 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-teal-50/20">
      <div className="container max-w-3xl py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to="/menopause/dashboard" className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Symptom Tracker</h1>
            <p className="text-xs text-slate-500">Track and understand your symptoms</p>
          </div>
        </div>

        {/* Doctor alert */}
        {showDoctorAlert && (
          <div className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4 flex items-start gap-3 animate-fadeIn">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-rose-800">Severe symptoms for 3+ days</p>
              <p className="text-xs text-rose-700 mt-1">Persistent severe pain or fatigue may need medical attention. Consider consulting your doctor.</p>
              <a href="tel:104" className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors">📞 Call 104</a>
            </div>
          </div>
        )}

        {/* Quick-log today */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">📝 Log Today's Symptoms</h2>
          <div className="space-y-2.5">
            {FULL_SYMPTOMS.map((sym) => (
              <div key={sym.id} className="flex items-center gap-3">
                <span className="text-lg w-7 text-center flex-shrink-0">{sym.emoji}</span>
                <span className="text-xs font-medium text-slate-700 w-28 flex-shrink-0">{sym.label}</span>
                <div className="flex gap-1.5 flex-1">
                  {SEVERITY_LEVELS.map((sev) => (
                    <button
                      key={sev.value}
                      onClick={() => setEditing((prev) => ({ ...prev, [sym.field]: sev.value }))}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-[10px] font-semibold border-2 transition-all",
                        editing[sym.field] === sev.value ? sev.color + " shadow-sm" : "border-transparent bg-slate-50 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      {sev.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg shadow-purple-200/50 hover:shadow-xl transition-all active:scale-[0.98]"
          >
            Save Today's Log
          </button>
        </div>

        {/* Trend Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" /> Symptom Trends
            </h2>
            <div className="flex gap-1">
              {([7, 14, 30] as const).map((r) => (
                <button key={r} onClick={() => setRange(r)}
                  className={cn("px-3 py-1 rounded-lg text-[10px] font-semibold transition-all",
                    range === r ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  )}>
                  {r}D
                </button>
              ))}
            </div>
          </div>
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">📝 Start logging to see trends</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, "auto"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="hotFlashes" stroke="#7c3aed" strokeWidth={2} dot={false} name="Hot Flashes" />
                <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={2} dot={false} name="Sleep (hrs)" />
                <Line type="monotone" dataKey="mood" stroke="#14b8a6" strokeWidth={2} dot={false} name="Mood (1–5)" />
                <Line type="monotone" dataKey="fatigue" stroke="#f59e0b" strokeWidth={2} dot={false} name="Fatigue" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Severity heatmap mini month */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-3">📅 This Month's Symptom Map</h2>
          <MiniHeatmap logs={logs} />
        </div>
      </div>
    </div>
  );
}

// ─── Mini Heatmap ────────────────────────────────────────────────────────────

function MiniHeatmap({ logs }: { logs: any[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  return (
    <div className="grid grid-cols-7 gap-1">
      {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
        <div key={i} className="text-[9px] text-slate-400 text-center font-semibold">{d}</div>
      ))}
      {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
      {Array.from({ length: daysInMonth }).map((_, i) => {
        const day = i + 1;
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const log = logs.find((l: any) => l.date === dateStr);
        let severity = 0;
        if (log) {
          const vals = [log.hotFlashCount, log.nightSweats, log.jointPain, log.fatigue, log.anxiety, log.headache].filter(Boolean);
          severity = vals.length > 0 ? vals.reduce((a: number, b: number) => a + b, 0) / vals.length : 0;
        }
        const bg = !log ? "bg-slate-50" : severity >= 4 ? "bg-rose-400" : severity >= 2.5 ? "bg-amber-300" : severity > 0 ? "bg-teal-200" : "bg-slate-100";
        return (
          <div key={day} className={cn("w-full aspect-square rounded-sm transition-colors", bg)}
            title={`${dateStr}${log ? ` — avg severity: ${severity.toFixed(1)}` : ""}`} />
        );
      })}
    </div>
  );
}
