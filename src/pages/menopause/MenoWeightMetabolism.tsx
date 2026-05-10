import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import { getWeightStatus } from "@/lib/menopauseDashboardEngine";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BMI_RANGES = [
  { label: "Underweight", range: "< 18.5", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "Normal", range: "18.5 - 24.9", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { label: "Overweight", range: "25 - 29.9", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "Obese", range: ">= 30", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

export default function MenoWeightMetabolism() {
  const { logs, addLog, getLogForDate } = useMenopause();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLog = getLogForDate(todayISO);
  const [weight, setWeight] = useState(String((todayLog as any)?.weightKg ?? ""));
  const [height, setHeight] = useState(() => {
    try {
      return localStorage.getItem("ss-meno-height") ?? "";
    } catch {
      return "";
    }
  });

  const status = useMemo(() => getWeightStatus(logs, null, Number(height) || undefined), [logs, height]);

  const handleSave = () => {
    if (height) localStorage.setItem("ss-meno-height", height);
    const base = todayLog || { date: todayISO, hotFlashCount: 0, nightSweats: 0, jointPain: 0, headache: 0, anxiety: 0, vaginalDryness: 0, fatigue: 0, mood: 3, sleepHrs: 7, symptoms: [], severity: "mild" as const, energyLevel: 3, sleepQuality: "average" as const, notes: "", painLevel: 0, periodOccurred: false };
    addLog({ ...base, date: todayISO, weightKg: Number(weight) || undefined } as any);
  };

  const weightData = useMemo(() => {
    return logs
      .filter((l) => (l as any).weightKg > 0)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-20)
      .map((l) => ({
        label: `${new Date(l.date).getDate()}/${new Date(l.date).getMonth() + 1}`,
        weight: (l as any).weightKg,
      }));
  }, [logs]);

  const bmi = Number(weight) && Number(height) ? Number((Number(weight) / ((Number(height) / 100) ** 2)).toFixed(1)) : status.bmi;
  const bmiCat = bmi ? (bmi < 18.5 ? "underweight" : bmi < 25 ? "normal" : bmi < 30 ? "overweight" : "obese") : "unknown";
  const trendIcon = status.weightTrend === "up"
    ? <TrendingUp className="w-4 h-4 text-amber-500" />
    : status.weightTrend === "down"
      ? <TrendingDown className="w-4 h-4 text-emerald-500" />
      : <Minus className="w-4 h-4 text-slate-400" />;

  const bmiMeta = bmiCat === "normal"
    ? { title: "Healthy zone", note: "Keep your routine consistent and strength-focused.", ring: "from-emerald-400 to-teal-500" }
    : bmiCat === "underweight"
      ? { title: "Needs support", note: "Focus on balanced meals and muscle-preserving activity.", ring: "from-blue-400 to-indigo-500" }
      : bmiCat === "overweight"
        ? { title: "Manageable shift", note: "Small daily habits can improve energy and metabolic health.", ring: "from-amber-400 to-orange-500" }
        : bmiCat === "obese"
          ? { title: "High-risk range", note: "Partner with a clinician for a safe, sustainable plan.", ring: "from-rose-400 to-red-500" }
          : { title: "Start tracking", note: "Log weight and height to unlock personalized guidance.", ring: "from-slate-400 to-slate-500" };

  const bmiProgress = bmi ? Math.min(100, Math.max(0, Math.round((bmi / 40) * 100))) : 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fbff_34%,#f4fbff_100%)] font-[Poppins,sans-serif]">
      <div className="container max-w-4xl py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/tools" className="w-9 h-9 rounded-xl border border-slate-200 bg-white/90 flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600" />
          </Link>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Weight & Metabolism</h1>
            <p className="text-xs text-slate-500">Track, understand, and improve with confidence</p>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-100 bg-white/85 backdrop-blur-sm p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-600 font-semibold">Today's Focus</p>
              <h2 className="mt-1 text-lg font-bold text-slate-800">Build metabolic resilience</h2>
              <p className="mt-1 text-xs text-slate-600 max-w-xl">Track BMI trends, save daily weight logs, and use practical habits tailored for menopause-related metabolism changes.</p>
            </div>
            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-blue-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.16em] text-cyan-700 font-semibold">Current trend</p>
              <div className="mt-1 flex items-center gap-2">
                {trendIcon}
                <span className="text-sm font-semibold capitalize text-slate-700">{status.weightTrend}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-blue-200/60 bg-white/90 p-5 shadow-sm backdrop-blur-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">BMI & Body Trends</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Weight (kg)</label>
              <input type="number" min={20} max={200} value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="60" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Height (cm)</label>
              <input type="number" min={80} max={250} value={height} onChange={(e) => setHeight(e.target.value)} placeholder="160" className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4">
            <div className="flex items-start gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <div className="absolute inset-0 rounded-full bg-slate-100" />
                <div className={cn("absolute inset-0 rounded-full bg-gradient-to-br", bmiMeta.ring)} style={{ clipPath: `inset(${100 - bmiProgress}% 0 0 0)` }} />
                <div className="absolute inset-1.5 rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-slate-600">{bmi ? `${bmi}` : "--"}</div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Your BMI</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex px-3 py-1 rounded-full text-xs font-bold border", BMI_RANGES.find((r) => r.label.toLowerCase() === bmiCat)?.color || "bg-slate-100 text-slate-600 border-slate-200")}>{bmiCat === "unknown" ? "Unknown" : bmiCat.charAt(0).toUpperCase() + bmiCat.slice(1)}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] text-slate-600">{trendIcon}<span className="capitalize">{status.weightTrend}</span></span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-700">{bmiMeta.title}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{bmiMeta.note}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
            {BMI_RANGES.map((r) => (
              <span key={r.label} className={cn("text-center text-[10px] font-semibold py-2 rounded-xl border", r.color)}>
                {r.label}
                <br />
                {r.range}
              </span>
            ))}
          </div>

          <button onClick={handleSave} className="w-full mt-4 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 text-white font-semibold shadow-lg shadow-cyan-200/50 hover:shadow-xl transition-all active:scale-[0.99]">
            Save Weight Log
          </button>
        </div>

        {weightData.length >= 2 && (
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Weight Trend (Recent 20 Logs)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="weight" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5e9" }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Weight Management Tips</h2>
          <div className="grid gap-2">
            {status.tips.map((t, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-2xl bg-blue-50/60 border border-blue-100/60">
                <span className="text-blue-500 mt-0.5">•</span>
                <p className="text-xs text-slate-700">{t}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-200/70 bg-gradient-to-r from-cyan-50 to-sky-50 p-4">
          <p className="text-xs text-cyan-900"><strong>Metabolism note:</strong> After menopause, metabolism can naturally slow by 5-10%. Strength training 2-3 times per week, adequate protein, and regular sleep help preserve muscle and support healthy energy balance.</p>
        </div>
      </div>
    </div>
  );
}
