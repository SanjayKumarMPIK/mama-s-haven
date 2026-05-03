import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Moon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import { getSleepMoodSummary } from "@/lib/menopauseDashboardEngine";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<"inhale"|"hold"|"exhale">("inhale");
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const cycleRef = useRef(0);

  useEffect(() => {
    if (!active) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    let phaseIdx = 0; let phaseElapsed = 0;
    const phases: ("inhale"|"hold"|"exhale")[] = ["inhale","hold","exhale"];
    const dur = { inhale: 4, hold: 7, exhale: 8 };
    setPhase("inhale"); setSeconds(4); cycleRef.current = 0;
    intervalRef.current = setInterval(() => {
      phaseElapsed++;
      const rem = dur[phases[phaseIdx]] - phaseElapsed;
      setSeconds(rem);
      if (rem <= 0) { phaseIdx++; if (phaseIdx >= 3) { phaseIdx = 0; cycleRef.current++; if (cycleRef.current >= 4) { setActive(false); return; } }
        phaseElapsed = 0; setPhase(phases[phaseIdx]); setSeconds(dur[phases[phaseIdx]]); }
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  const circleColor = phase === "inhale" ? "from-indigo-300 to-purple-500" : phase === "hold" ? "from-purple-400 to-indigo-500" : "from-indigo-300 to-teal-400";
  const circleScale = phase === "exhale" ? "scale-50" : "scale-100";

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6 text-center">
      <h3 className="text-sm font-bold text-indigo-800 mb-1">🫁 4-7-8 Breathing</h3>
      <p className="text-xs text-indigo-600 mb-5">Inhale 4s · Hold 7s · Exhale 8s · 4 cycles</p>
      <div className="flex items-center justify-center mb-5">
        <div className={cn("w-28 h-28 rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-[1000ms]", circleColor, active ? circleScale : "scale-75")}>
          {active ? <div className="text-center"><p className="text-white text-2xl font-bold">{seconds}</p><p className="text-white/80 text-xs capitalize">{phase}</p></div> : <span className="text-white text-3xl">🫁</span>}
        </div>
      </div>
      <button onClick={() => setActive(!active)} className={cn("px-6 py-2.5 rounded-xl font-semibold text-sm transition-all", active ? "bg-white text-indigo-700 border border-indigo-200" : "bg-indigo-500 text-white shadow-lg")}>{active ? "Stop" : "Start Breathing"}</button>
    </div>
  );
}

const RELAXATION = [
  { emoji: "🧘", title: "Progressive Muscle Relaxation", desc: "Tense and release each muscle group from toes to head, 15 seconds each." },
  { emoji: "📝", title: "Gratitude Journaling", desc: "Write 3 things you're grateful for before bed." },
  { emoji: "🎵", title: "Calming Sounds", desc: "Listen to nature sounds or soft instrumental music for 10 minutes." },
  { emoji: "🌿", title: "Mindful Walking", desc: "A slow 10-minute walk focusing on each step and breath." },
];

export default function MenoSleepMood() {
  const { logs, addLog, getLogForDate } = useMenopause();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayLog = getLogForDate(todayISO);
  const summary = useMemo(() => getSleepMoodSummary(logs), [logs]);
  const [sleepHrs, setSleepHrs] = useState(String(todayLog?.sleepHrs ?? ""));
  const [sleepQual, setSleepQual] = useState(todayLog?.sleepQuality ?? "average");
  const [mood, setMood] = useState(todayLog?.mood ?? 3);

  const trendData = useMemo(() => {
    const data: { label: string; sleep: number; mood: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); const ds = d.toISOString().slice(0,10); const l = logs.find(x => x.date === ds);
      data.push({ label: `${d.getDate()}/${d.getMonth()+1}`, sleep: l?.sleepHrs ?? 0, mood: l?.mood ?? 0 }); }
    return data;
  }, [logs]);

  const handleSave = () => {
    const base = todayLog || { date: todayISO, hotFlashCount: 0, nightSweats: 0, jointPain: 0, headache: 0, anxiety: 0, vaginalDryness: 0, fatigue: 0, mood: 3, sleepHrs: 7, symptoms: [], severity: "mild" as const, energyLevel: 3, sleepQuality: "average" as const, notes: "", painLevel: 0, periodOccurred: false };
    addLog({ ...base, date: todayISO, sleepHrs: Number(sleepHrs) || 7, sleepQuality: sleepQual as any, mood } as any);
  };

  const TrendIcon = ({ dir, good }: { dir: string; good?: boolean }) => {
    if (dir === "stable") return <Minus className="w-3.5 h-3.5 text-slate-400" />;
    if (dir === "up") return <TrendingUp className={cn("w-3.5 h-3.5", good ? "text-emerald-500" : "text-rose-500")} />;
    return <TrendingDown className={cn("w-3.5 h-3.5", good ? "text-emerald-500" : "text-rose-500")} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <div className="container max-w-3xl py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/menopause/dashboard" className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><ArrowLeft className="w-4 h-4 text-slate-600" /></Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md"><Moon className="w-5 h-5 text-white" /></div>
          <div><h1 className="text-xl font-bold text-slate-800">Sleep & Mood</h1><p className="text-xs text-slate-500">Track, understand, and improve</p></div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/80 border border-indigo-200/60 p-4">
            <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">Avg Sleep</p>
            <div className="flex items-center gap-2"><span className="text-2xl font-bold text-slate-800">{summary.avgSleep || "–"}h</span><TrendIcon dir={summary.sleepTrend} good={summary.sleepTrend === "up"} /></div>
            <p className="text-[10px] text-slate-500 mt-1">{summary.sleepLabel}</p>
          </div>
          <div className="rounded-xl bg-white/80 border border-purple-200/60 p-4">
            <p className="text-[10px] font-semibold text-purple-500 uppercase tracking-wider mb-1">Avg Mood</p>
            <div className="flex items-center gap-2"><span className="text-2xl font-bold text-slate-800">{summary.avgMood || "–"}/5</span><TrendIcon dir={summary.moodTrend} good={summary.moodTrend === "up"} /></div>
            <p className="text-[10px] text-slate-500 mt-1">{summary.moodLabel}</p>
          </div>
        </div>

        {/* Log today */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">📝 Log Today</h2>
          <div className="space-y-4">
            <div><label className="text-xs font-semibold text-slate-700 block mb-1.5">Sleep hours</label>
              <input type="number" min={0} max={16} step={0.5} value={sleepHrs} onChange={e => setSleepHrs(e.target.value)} placeholder="7" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300/50" /></div>
            <div><label className="text-xs font-semibold text-slate-700 block mb-1.5">Sleep quality</label>
              <div className="flex gap-2">{(["good","average","poor"] as const).map(q => (
                <button key={q} onClick={() => setSleepQual(q)} className={cn("flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 capitalize transition-all", sleepQual === q ? (q === "good" ? "border-emerald-400 bg-emerald-50 text-emerald-700" : q === "average" ? "border-amber-400 bg-amber-50 text-amber-700" : "border-rose-400 bg-rose-50 text-rose-700") : "border-slate-200 text-slate-500")}>{q}</button>
              ))}</div></div>
            <div><label className="text-xs font-semibold text-slate-700 block mb-1.5">Mood (1–5)</label>
              <div className="flex gap-2">{[1,2,3,4,5].map(m => (
                <button key={m} onClick={() => setMood(m)} className={cn("flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all", mood === m ? "border-purple-400 bg-purple-50 text-purple-700" : "border-slate-200 text-slate-400")}>{["😔","😕","😐","🙂","😊"][m-1]}</button>
              ))}</div></div>
          </div>
          <button onClick={handleSave} className="w-full mt-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all active:scale-[0.98]">Save</button>
        </div>

        {/* 14-Day Trend */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">📈 14-Day Trend</h2>
          {logs.length === 0 ? <p className="text-center py-8 text-slate-400 text-sm">Log daily to see trends</p> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} domain={[0, "auto"]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={2} dot={false} name="Sleep (hrs)" />
                <Line type="monotone" dataKey="mood" stroke="#a855f7" strokeWidth={2} dot={false} name="Mood (1–5)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <BreathingExercise />

        {/* Relaxation */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-700 mb-4">🌿 Relaxation Suggestions</h2>
          <div className="grid sm:grid-cols-2 gap-3">{RELAXATION.map((r,i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100/60 hover:shadow-sm transition-all">
              <span className="text-xl flex-shrink-0">{r.emoji}</span>
              <div><p className="text-xs font-semibold text-slate-700">{r.title}</p><p className="text-[10px] text-slate-500 mt-0.5">{r.desc}</p></div>
            </div>
          ))}</div>
        </div>
      </div>
    </div>
  );
}
