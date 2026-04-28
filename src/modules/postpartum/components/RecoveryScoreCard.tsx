import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const accent = {
  gradient: "from-rose-500 to-pink-400",
  bg: "bg-rose-50",
  text: "text-rose-700",
  border: "border-rose-200/60",
  cardBg: "bg-gradient-to-br from-rose-50 to-pink-50",
};

export default function RecoveryScoreCard() {
  const recoveryScore = 78; // Placeholder - should come from recovery engine
  const previousScore = 64; // Placeholder - should come from previous week
  const trendPercent = Math.round(((recoveryScore - previousScore) / previousScore) * 100);

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (recoveryScore / 100) * circumference;

  const recoveryStatus = useMemo(() => {
    if (recoveryScore >= 80) return { label: "Excellent", color: "text-emerald-600" };
    if (recoveryScore >= 60) return { label: "Good Progress", color: "text-rose-600" };
    if (recoveryScore >= 40) return { label: "Moderate", color: "text-amber-600" };
    return { label: "Needs Attention", color: "text-orange-600" };
  }, [recoveryScore]);

  const trendIcon = trendPercent > 0 ? TrendingUp : trendPercent < 0 ? TrendingDown : Minus;
  const trendColor = trendPercent > 0 ? "text-emerald-600" : trendPercent < 0 ? "text-rose-600" : "text-muted-foreground";
  const trendLabel = trendPercent > 0 ? `+${trendPercent}%` : `${trendPercent}%`;

  return (
    <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6 hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Recovery Score</h3>
          <p className="text-sm text-muted-foreground">Based on recovery indicators</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md`}>
          <span className="text-2xl">💪</span>
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative">
          <svg width="120" height="120" className="transform -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted-foreground/20"
            />
            <circle
              cx="60"
              cy="60"
              r="45"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-3xl font-bold text-foreground">{recoveryScore}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-center">
          <p className={`text-sm font-semibold ${recoveryStatus.color}`}>
            {recoveryStatus.label}
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          {trendPercent > 0 && <TrendingUp className={`w-3.5 h-3.5 ${trendColor}`} />}
          {trendPercent < 0 && <TrendingDown className={`w-3.5 h-3.5 ${trendColor}`} />}
          {trendPercent === 0 && <Minus className={`w-3.5 h-3.5 ${trendColor}`} />}
          <span className={trendColor}>{trendLabel}</span>
          <span>vs last week</span>
        </div>
      </div>
    </div>
  );
}
