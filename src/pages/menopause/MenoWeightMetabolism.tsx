import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import { getWeightStatus } from "@/lib/menopauseDashboardEngine";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BMI_RANGES = [
  { label: "Underweight", range: "< 18.5", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "Normal", range: "18.5 – 24.9", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { label: "Overweight", range: "25 – 29.9", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "Obese", range: "≥ 30", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

export default function MenoWeightMetabolism() {
  const { logs, addLog, getLogForDate } = useMenopause();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLog = getLogForDate(todayISO);
  const [weight, setWeight] = useState(String((todayLog as any)?.weightKg ?? ""));
  const [height, setHeight] = useState(() => { try { return localStorage.getItem("ss-meno-height") ?? ""; } catch { return ""; } });

  const status = useMemo(() => getWeightStatus(logs, null, Number(height) || undefined), [logs, height]);

  const handleSave = () => {
    if (height) localStorage.setItem("ss-meno-height", height);
    const base = todayLog || { date: todayISO, hotFlashCount: 0, nightSweats: 0, jointPain: 0, headache: 0, anxiety: 0, vaginalDryness: 0, fatigue: 0, mood: 3, sleepHrs: 7, symptoms: [], severity: "mild" as const, energyLevel: 3, sleepQuality: "average" as const, notes: "", painLevel: 0, periodOccurred: false };
    addLog({ ...base, date: todayISO, weightKg: Number(weight) || undefined } as any);
  };

  // Weight trend data
  const weightData = useMemo(() => {
    return logs.filter(l => (l as any).weightKg > 0).sort((a, b) => a.date.localeCompare(b.date)).slice(-20).map(l => ({
      label: `${new Date(l.date).getDate()}/${new Date(l.date).getMonth()+1}`, weight: (l as any).weightKg,
    }));
  }, [logs]);

  const bmi = Number(weight) && Number(height) ? Number((Number(weight) / ((Number(height)/100)**2)).toFixed(1)) : status.bmi;
  const bmiCat = bmi ? (bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : bmi < 30 ? "overweight" : "obese") : "unknown";
  const bmiColor = bmiCat === "normal" ? "text-emerald-600" : bmiCat === "overweight" ? "text-amber-600" : bmiCat === "obese" ? "text-rose-600" : bmiCat === "underweight" ? "text-blue-600" : "text-slate-500";

  const trendIcon = status.weightTrend === "up" ? <TrendingUp className="w-4 h-4 text-amber-500" /> : status.weightTrend === "down" ? <TrendingDown className="w-4 h-4 text-emerald-500" /> : <Minus className="w-4 h-4 text-slate-400" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-cyan-50/20">
      <div className="container max-w-3xl py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/dashboard" className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-600" /></Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md"><Scale className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-slate-800">Weight & Metabolism</h1><p className="text-xs text-slate-500">Track, understand, manage</p></div>
        </div>

        {/* BMI Card */}
        <div className="rounded-2xl border border-blue-200/60 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">📊 BMI Calculator</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="text-xs font-semibold text-slate-700 block mb-1.5">Weight (kg)</label>
              <input type="number" min={20} max={200} value={weight} onChange={e => setWeight(e.target.value)} placeholder="60" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/50" /></div>
            <div><label className="text-xs font-semibold text-slate-700 block mb-1.5">Height (cm)</label>
              <input type="number" min={80} max={250} value={height} onChange={e => setHeight(e.target.value)} placeholder="160" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300/50" /></div>
          </div>
          {bmi && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div><p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Your BMI</p><span className={cn("text-3xl font-extrabold", bmiColor)}>{bmi}</span></div>
              <div className="flex-1"><span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-bold border", BMI_RANGES.find(r => r.label.toLowerCase() === bmiCat)?.color || "bg-slate-100")}>{bmiCat === "unknown" ? "–" : bmiCat.charAt(0).toUpperCase() + bmiCat.slice(1)}</span></div>
              <div className="flex items-center gap-1.5">{trendIcon}<span className="text-xs text-slate-500 capitalize">{status.weightTrend}</span></div>
            </div>
          )}
          <div className="flex gap-2 mt-3">{BMI_RANGES.map(r => <span key={r.label} className={cn("flex-1 text-center text-[9px] font-semibold py-1 rounded-lg border", r.color)}>{r.label}<br/>{r.range}</span>)}</div>
        </div>

        {/* Log */}
        <button onClick={handleSave} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]">Save Weight Log</button>

        {/* Trend Chart */}
        {weightData.length >= 2 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4">📈 Weight Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">💡 Weight Management Tips</h2>
          <div className="space-y-2">{status.tips.map((t,i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/60 border border-blue-100/60"><span className="text-blue-500 mt-0.5">•</span><p className="text-xs text-slate-700">{t}</p></div>
          ))}</div>
        </div>

        {/* Metabolism info */}
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
          <p className="text-xs text-cyan-800"><strong>Metabolism note:</strong> After menopause, metabolism naturally slows by 5-10%. Strength training 2-3x per week helps maintain muscle mass and metabolic rate. Focus on protein-rich meals.</p>
        </div>
      </div>
    </div>
  );
}
