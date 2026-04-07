import { useEffect, useState } from "react";
import { Sparkles, Zap, Brain, Flame } from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */
export interface HealthScoreData {
  score: number;           // 0‒100
  phase: string;
  dailyInsight: string;
  predictions: {
    cramps: number;        // probability 0‒100
    moodSwings: number;
    fatigue: number;
  };
}

/* ── Circular Progress Ring ─────────────────────────────── */
function ScoreRing({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = 58;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - animatedScore) / 100) * circumference;

  // Determine color based on score
  const getColor = (s: number) => {
    if (s >= 75) return { main: "#10b981", glow: "rgba(16,185,129,0.35)", label: "Excellent" };
    if (s >= 50) return { main: "#f59e0b", glow: "rgba(245,158,11,0.35)", label: "Moderate" };
    return { main: "#f43f5e", glow: "rgba(244,63,94,0.35)", label: "Needs Care" };
  };
  const color = getColor(score);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * score));
      if (t < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="relative flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140" className="drop-shadow-lg">
        {/* Background ring */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke="currentColor"
          className="text-slate-100"
          strokeWidth={stroke}
        />
        {/* Progress ring */}
        <circle
          cx="70" cy="70" r={radius}
          fill="none"
          stroke={color.main}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          transform="rotate(-90 70 70)"
          style={{
            filter: `drop-shadow(0 0 6px ${color.glow})`,
            transition: "stroke-dashoffset 0.3s ease",
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight" style={{ color: color.main }}>
          {animatedScore}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
          {color.label}
        </span>
      </div>
    </div>
  );
}

/* ── Prediction Pill ────────────────────────────────────── */
function PredictionPill({
  label,
  probability,
  icon: Icon,
  color,
}: {
  label: string;
  probability: number;
  icon: React.ElementType;
  color: string;
}) {
  const barColor =
    probability >= 70 ? "bg-rose-500" : probability >= 40 ? "bg-amber-400" : "bg-emerald-400";
  const textColor =
    probability >= 70 ? "text-rose-600" : probability >= 40 ? "text-amber-600" : "text-emerald-600";

  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/70 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
          style={{ width: `${probability}%` }}
        />
      </div>
      <span className={`text-xs font-extrabold ${textColor}`}>{probability}%</span>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function HealthScoreHero({ data }: { data: HealthScoreData }) {
  return (
    <section
      className="relative overflow-hidden rounded-3xl p-6 border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)]"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(252,231,243,0.4) 50%, rgba(237,233,254,0.4) 100%)",
        backdropFilter: "blur(20px)",
      }}
      aria-labelledby="health-score-heading"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-pink-200/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-violet-200/30 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md shadow-pink-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2 id="health-score-heading" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Health Score
        </h2>
        {/* Phase pill */}
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">{data.phase}</span>
        </div>
      </div>

      {/* Score Ring + Insight */}
      <div className="flex items-center gap-6 mb-6">
        <ScoreRing score={data.score} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 leading-relaxed mb-2">
            {data.dailyInsight}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-pink-500 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            AI-Powered Insight
          </div>
        </div>
      </div>

      {/* Prediction Cards */}
      <div className="grid grid-cols-3 gap-3">
        <PredictionPill
          label="Cramps"
          probability={data.predictions.cramps}
          icon={Flame}
          color="bg-rose-500"
        />
        <PredictionPill
          label="Mood"
          probability={data.predictions.moodSwings}
          icon={Brain}
          color="bg-violet-500"
        />
        <PredictionPill
          label="Fatigue"
          probability={data.predictions.fatigue}
          icon={Zap}
          color="bg-amber-500"
        />
      </div>
    </section>
  );
}
