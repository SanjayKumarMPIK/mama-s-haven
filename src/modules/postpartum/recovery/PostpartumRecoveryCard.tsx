import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { usePostpartumRecovery } from "./usePostpartumRecovery";

const accent = {
  gradient: "from-rose-500 to-pink-400",
  bg: "bg-rose-50",
  text: "text-rose-700",
  border: "border-rose-200/60",
  cardBg: "bg-gradient-to-br from-rose-50 to-pink-50",
};

export function PostpartumRecoveryCard() {
  const { scoreResult, selectedWeek } = usePostpartumRecovery();
  const { score, statusLabel, trendPercent, dynamicRecommendations, hasInsufficientData } = scoreResult;

  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = hasInsufficientData ? circumference : circumference - (score / 100) * circumference;

  const statusColor = 
    statusLabel === "Strong Recovery" ? "text-emerald-600" :
    statusLabel === "Good Progress" ? "text-rose-600" :
    statusLabel === "Recovering" ? "text-amber-600" :
    "text-orange-600";

  const trendColor = trendPercent > 0 ? "text-emerald-600" : trendPercent < 0 ? "text-rose-600" : "text-muted-foreground";
  const trendLabel = trendPercent > 0 ? `+${trendPercent}%` : `${trendPercent}%`;

  return (
    <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6 flex flex-col h-full`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground">Recovery Score</h3>
          <p className="text-sm text-muted-foreground">Week {selectedWeek} Insights</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md`}>
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
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#ec4899" />
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

      <div className="space-y-3 mb-6">
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

      {/* Dynamic Motivational Note / Recommendation */}
      <div className="mt-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-rose-100/50">
          <p className="text-xs text-rose-800 leading-relaxed font-medium">
            💡 {dynamicRecommendations[0]}
          </p>
        </div>
      </div>
    </div>
  );
}
