import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { usePostpartumRecovery } from "./usePostpartumRecovery";

export function PostpartumRecoveryCard() {
  const { scoreResult, selectedWeek, currentWeek } = usePostpartumRecovery();
  const { score, statusLabel, trendPercent, dynamicRecommendations, hasInsufficientData } = scoreResult;

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = hasInsufficientData ? circumference : circumference - (score / 100) * circumference;

  // Dynamic gradient based on score
  const gradientColors = score >= 75
    ? { start: "#10b981", end: "#34d399", border: "border-emerald-200/60", bg: "bg-gradient-to-br from-emerald-50 to-teal-50", iconBg: "from-emerald-500 to-teal-400" }
    : score < 40
      ? { start: "#f59e0b", end: "#fbbf24", border: "border-amber-200/60", bg: "bg-gradient-to-br from-amber-50 to-orange-50", iconBg: "from-amber-500 to-orange-400" }
      : { start: "#f43f5e", end: "#ec4899", border: "border-rose-200/60", bg: "bg-gradient-to-br from-rose-50 to-pink-50", iconBg: "from-rose-500 to-pink-400" };

  const statusColor = 
    statusLabel === "Strong Recovery" ? "text-emerald-600" :
    statusLabel === "Good Progress" ? "text-rose-600" :
    statusLabel === "Recovering" ? "text-amber-600" :
    "text-orange-600";

  const trendColor = trendPercent > 0 ? "text-emerald-600" : trendPercent < 0 ? "text-rose-600" : "text-muted-foreground";
  const trendLabel = trendPercent > 0 ? `+${trendPercent}%` : `${trendPercent}%`;

  return (
    <div className={`rounded-2xl border-2 ${gradientColors.border} ${gradientColors.bg} p-6 flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Recovery Score</h3>
          <p className="text-sm text-muted-foreground">
            {selectedWeek === currentWeek ? `Week ${selectedWeek} · Now` : `Week ${selectedWeek}`}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColors.iconBg} flex items-center justify-center shadow-md`}>
          <Activity className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex items-center justify-center py-4 relative">
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
              stroke="url(#gradient-recovery)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient-recovery" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientColors.start} />
                <stop offset="100%" stopColor={gradientColors.end} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {hasInsufficientData ? (
                <span className="text-sm font-semibold text-muted-foreground max-w-[70px] leading-tight block">
                  No Data
                </span>
              ) : (
                <span className="text-3xl font-bold text-foreground">{score}%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="text-center">
          <p className={`text-sm font-semibold ${hasInsufficientData ? "text-muted-foreground" : statusColor}`}>
            {hasInsufficientData ? "Start Logging to Track Recovery" : statusLabel}
          </p>
        </div>
        
        {!hasInsufficientData && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            {trendPercent > 0 && <TrendingUp className={`w-3.5 h-3.5 ${trendColor}`} />}
            {trendPercent < 0 && <TrendingDown className={`w-3.5 h-3.5 ${trendColor}`} />}
            {trendPercent === 0 && <Minus className={`w-3.5 h-3.5 ${trendColor}`} />}
            <span className={trendColor}>{trendLabel}</span>
            <span>vs last week</span>
          </div>
        )}
      </div>

      {/* Score Breakdown Signals */}
      {!hasInsufficientData && (
        <div className="grid grid-cols-2 gap-1.5 mb-4">
          {[
            { label: "Symptoms", weight: "40%" },
            { label: "Energy", weight: "20%" },
            { label: "Mood", weight: "15%" },
            { label: "Sleep", weight: "15%" },
          ].map(({ label, weight }) => (
            <div key={label} className="flex items-center justify-between px-2 py-1 rounded-md bg-white/50 border border-border/30">
              <span className="text-[9px] font-medium text-foreground/70">{label}</span>
              <span className="text-[9px] text-muted-foreground">{weight}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Recommendations */}
      <div className="mt-auto space-y-2">
        {dynamicRecommendations.slice(0, 2).map((rec, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-border/30">
            <p className="text-[11px] text-foreground/80 leading-relaxed font-medium">
              {i === 0 ? "💡" : "🌱"} {rec}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
