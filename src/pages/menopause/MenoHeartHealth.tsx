import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import { getHeartHealthStatus } from "@/lib/menopauseDashboardEngine";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const BP_CATEGORIES = [
  { label: "Normal", range: "< 120/80", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { label: "Elevated", range: "120-129/<80", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { label: "High", range: "≥ 130/80", color: "bg-rose-100 text-rose-700 border-rose-200" },
];

export default function MenoHeartHealth() {
  const { logs, addLog, getLogForDate } = useMenopause();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLog = getLogForDate(todayISO);
  const status = useMemo(() => getHeartHealthStatus(logs), [logs]);
  const [systolic, setSystolic] = useState(String((todayLog as any)?.bpSystolic ?? ""));
  const [diastolic, setDiastolic] = useState(String((todayLog as any)?.bpDiastolic ?? ""));
  const [palps, setPalps] = useState(String((todayLog as any)?.palpitations ?? ""));
  const [palpSev, setPalpSev] = useState<string>((todayLog as any)?.palpitationSeverity ?? "mild");

  const handleSave = () => {
    const base = todayLog || { date: todayISO, hotFlashCount: 0, nightSweats: 0, jointPain: 0, headache: 0, anxiety: 0, vaginalDryness: 0, fatigue: 0, mood: 3, sleepHrs: 7, symptoms: [], severity: "mild" as const, energyLevel: 3, sleepQuality: "average" as const, notes: "", painLevel: 0, periodOccurred: false };
    addLog({ ...base, date: todayISO, bpSystolic: Number(systolic) || undefined, bpDiastolic: Number(diastolic) || undefined, palpitations: Number(palps) || 0, palpitationSeverity: palpSev as any } as any);
  };

  const bpData = useMemo(() => {
    return logs.filter(l => (l as any).bpSystolic > 0).sort((a, b) => a.date.localeCompare(b.date)).slice(-14).map(l => ({
      label: `${new Date(l.date).getDate()}/${new Date(l.date).getMonth()+1}`,
      systolic: (l as any).bpSystolic, diastolic: (l as any).bpDiastolic,
    }));
  }, [logs]);

  const catColor = status.bpCategory === "normal" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : status.bpCategory === "elevated" ? "bg-amber-100 text-amber-700 border-amber-200" : status.bpCategory === "high" ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-slate-100 text-slate-500 border-slate-200";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-rose-50/20 to-pink-50/10">
      <div className="container max-w-3xl py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/dashboard" className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-600" /></Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md"><Heart className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-slate-800">Heart Health</h1><p className="text-xs text-slate-500">BP tracking & heart wellness</p></div>
        </div>

        {/* Alerts */}
        {status.alerts.map((a, i) => (
          <div key={i} className="rounded-xl border border-rose-200 bg-rose-50 p-3 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div><p className="text-xs font-medium text-rose-800">{a}</p>
              <a href="tel:104" className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-semibold">📞 Call 104</a>
            </div>
          </div>
        ))}

        {/* Current BP */}
        {status.latestBP && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-3">📊 Latest Reading</h2>
            <div className="flex items-center gap-4">
              <div className="text-center"><span className="text-3xl font-extrabold text-slate-800">{status.latestBP.systolic}/{status.latestBP.diastolic}</span><p className="text-[10px] text-slate-500 mt-1">mmHg</p></div>
              <span className={cn("px-3 py-1.5 rounded-full text-xs font-bold border capitalize", catColor)}>{status.bpCategory}</span>
              {status.palpitationFrequency > 0 && <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-pink-100 text-pink-700 border border-pink-200">💓 {status.palpitationFrequency} palpitation days</span>}
            </div>
          </div>
        )}

        {/* Log BP */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">📝 Log Today</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs font-semibold text-slate-700 block mb-1.5">Systolic (mmHg)</label>
              <input type="number" min={70} max={250} value={systolic} onChange={e => setSystolic(e.target.value)} placeholder="120" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50" /></div>
            <div><label className="text-xs font-semibold text-slate-700 block mb-1.5">Diastolic (mmHg)</label>
              <input type="number" min={40} max={150} value={diastolic} onChange={e => setDiastolic(e.target.value)} placeholder="80" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="text-xs font-semibold text-slate-700 block mb-1.5">Palpitations (count)</label>
              <input type="number" min={0} max={20} value={palps} onChange={e => setPalps(e.target.value)} placeholder="0" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50" /></div>
            <div><label className="text-xs font-semibold text-slate-700 block mb-1.5">Severity</label>
              <div className="flex gap-1.5">{(["mild","moderate","severe"] as const).map(s => (
                <button key={s} onClick={() => setPalpSev(s)} className={cn("flex-1 py-2.5 rounded-lg text-[10px] font-semibold border-2 capitalize transition-all", palpSev === s ? (s === "mild" ? "border-teal-400 bg-teal-50" : s === "moderate" ? "border-amber-400 bg-amber-50" : "border-rose-400 bg-rose-50") : "border-slate-200 text-slate-400")}>{s}</button>
              ))}</div></div>
          </div>
          <div className="flex gap-2 mt-1 mb-3">{BP_CATEGORIES.map(c => <span key={c.label} className={cn("flex-1 text-center text-[9px] font-semibold py-1 rounded-lg border", c.color)}>{c.label}<br/>{c.range}</span>)}</div>
          <button onClick={handleSave} className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]">Save Heart Health Log</button>
        </div>

        {/* BP Trend */}
        {bpData.length >= 2 && (
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4">📈 BP Trend</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bpData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[60, 180]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#a855f7" strokeWidth={2} dot={{ r: 3 }} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">❤️ Heart-Healthy Tips</h2>
          <div className="space-y-2">{status.tips.map((t,i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-rose-50/60 border border-rose-100/60"><span className="text-rose-400 mt-0.5">•</span><p className="text-xs text-slate-700">{t}</p></div>
          ))}</div>
        </div>
      </div>
    </div>
  );
}
