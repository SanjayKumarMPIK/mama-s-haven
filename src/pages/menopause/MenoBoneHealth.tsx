import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bone, Sun, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import { getBoneHealthStatus } from "@/lib/menopauseDashboardEngine";

const CALCIUM_SOURCES = [
  { name: "Glass of milk", mg: 300, emoji: "🥛" },
  { name: "Curd / Yoghurt", mg: 250, emoji: "🥣" },
  { name: "Ragi porridge", mg: 350, emoji: "🌾" },
  { name: "Sesame seeds (1 tbsp)", mg: 90, emoji: "🌰" },
  { name: "Paneer (50g)", mg: 200, emoji: "🧀" },
  { name: "Fortified soy milk", mg: 300, emoji: "🥛" },
  { name: "Spinach (cooked)", mg: 250, emoji: "🥬" },
  { name: "Calcium supplement", mg: 500, emoji: "💊" },
  { name: "Tofu (100g)", mg: 350, emoji: "🫘" },
  { name: "Dried figs (4 pcs)", mg: 65, emoji: "🫐" },
];

export default function MenoBoneHealth() {
  const { profile, logs, addLog, getLogForDate } = useMenopause();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLog = getLogForDate(todayISO);
  const status = useMemo(() => getBoneHealthStatus(logs, profile), [logs, profile]);
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [vitDTaken, setVitDTaken] = useState((todayLog as any)?.vitaminDTaken ?? false);
  const [sunMin, setSunMin] = useState(String((todayLog as any)?.sunExposureMin ?? ""));
  const calciumToday = selectedFoods.reduce((s, n) => s + (CALCIUM_SOURCES.find((x) => x.name === n)?.mg ?? 0), (todayLog as any)?.calciumMg ?? 0);
  const calciumPct = Math.min(100, Math.round((calciumToday / 1200) * 100));

  const handleSave = () => {
    const base = todayLog || { date: todayISO, hotFlashCount: 0, nightSweats: 0, jointPain: 0, headache: 0, anxiety: 0, vaginalDryness: 0, fatigue: 0, mood: 3, sleepHrs: 7, symptoms: [], severity: "mild" as const, energyLevel: 3, sleepQuality: "average" as const, notes: "", painLevel: 0, periodOccurred: false };
    addLog({ ...base, date: todayISO, calciumMg: calciumToday, vitaminDTaken: vitDTaken, sunExposureMin: Number(sunMin) || 0 } as any);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">
      <div className="container max-w-3xl py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/dashboard" className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-600" /></Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-md"><Bone className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-slate-800">Bone Health</h1><p className="text-xs text-slate-500">Calcium, Vitamin D & bone protection</p></div>
        </div>

        {status.alerts.map((a, i) => (
          <div key={i} className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-2.5"><AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" /><p className="text-xs font-medium text-amber-800">{a}</p></div>
        ))}

        <div className="rounded-2xl border border-teal-200/60 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-1">🥛 Today's Calcium</h2>
          <p className="text-xs text-slate-500 mb-4">Target: 1200mg/day</p>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-2xl font-bold text-teal-700">{calciumToday}mg</span>
            <span className="text-xs font-medium text-slate-500">{calciumPct}%</span>
          </div>
          <div className="h-3 rounded-full bg-teal-100 overflow-hidden mb-4">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all" style={{ width: `${calciumPct}%` }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CALCIUM_SOURCES.map((src) => {
              const sel = selectedFoods.includes(src.name);
              return (
                <button key={src.name} onClick={() => setSelectedFoods(p => sel ? p.filter(n => n !== src.name) : [...p, src.name])}
                  className={cn("flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all", sel ? "border-teal-400 bg-teal-50" : "border-slate-200 hover:border-teal-200")}>
                  <span className="text-lg">{src.emoji}</span>
                  <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-700 truncate">{src.name}</p><p className="text-[10px] text-teal-600">{src.mg}mg</p></div>
                  {sel && <Check className="w-4 h-4 text-teal-600" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200/60 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">☀️ Vitamin D</h2>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setVitDTaken(!vitDTaken)} className={cn("p-4 rounded-xl border-2 text-center transition-all", vitDTaken ? "border-amber-400 bg-amber-50" : "border-slate-200")}>
              <Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" /><p className="text-xs font-semibold">{vitDTaken ? "✓ Taken" : "Supplement / Sun"}</p>
            </button>
            <div className="p-4 rounded-xl border border-slate-200">
              <label className="text-xs font-semibold text-slate-700 block mb-2">Sun (min)</label>
              <input type="number" min={0} max={120} value={sunMin} onChange={e => setSunMin(e.target.value)} placeholder="15" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50" />
            </div>
          </div>
          <p className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-800">🌤️ Streak: {status.vitaminDStreak} days</p>
        </div>

        <button onClick={handleSave} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]">Save Bone Health Log</button>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">🦴 Bone Health Tips</h2>
          <div className="space-y-2">{status.tips.map((t, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-teal-50/60 border border-teal-100/60"><span className="text-teal-500 mt-0.5">•</span><p className="text-xs text-slate-700">{t}</p></div>
          ))}</div>
        </div>
      </div>
    </div>
  );
}
