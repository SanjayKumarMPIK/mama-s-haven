interface DeficiencySummaryInlineProps {
  deficiencyScore: number;
  deficiencySeverity: string;
  priorityNutrient: string | null;
  riskCounts: { high: number; moderate: number; low: number; good: number };
  accentGradient?: string;
}

export default function DeficiencySummaryInline({
  deficiencyScore, deficiencySeverity, priorityNutrient, riskCounts, accentGradient = "from-pink-500 to-rose-400",
}: DeficiencySummaryInlineProps) {
  const severityColor =
    deficiencySeverity === "Critical" || deficiencySeverity === "High" ? "text-red-600"
    : deficiencySeverity === "Moderate" ? "text-amber-600"
    : "text-emerald-600";

  const ringColor =
    deficiencySeverity === "Critical" || deficiencySeverity === "High" ? "border-red-200"
    : deficiencySeverity === "Moderate" ? "border-amber-200"
    : "border-emerald-200";

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5" id="deficiency-summary-inline">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">⚡</span>
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Nutrition Risk Summary</h3>
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-4">
        {/* Score Circle */}
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-full border-[6px] ${ringColor} flex flex-col items-center justify-center bg-background`}>
            <span className="text-2xl font-bold leading-none">{deficiencyScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
          <span className={`text-xs font-semibold mt-2 ${severityColor}`}>{deficiencySeverity} Risk</span>
        </div>

        {/* Details */}
        <div className="space-y-2.5">
          {priorityNutrient && (
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 px-3 py-2">
              <span className="text-xs text-muted-foreground">Priority Nutrient</span>
              <span className="text-xs font-bold text-foreground">{priorityNutrient}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-red-100 bg-red-50/50 px-2.5 py-1.5 text-center">
              <p className="text-xs font-semibold text-red-600">High</p>
              <p className="text-lg font-bold text-foreground">{riskCounts.high}</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/50 px-2.5 py-1.5 text-center">
              <p className="text-xs font-semibold text-amber-600">Moderate</p>
              <p className="text-lg font-bold text-foreground">{riskCounts.moderate}</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-2.5 py-1.5 text-center">
              <p className="text-xs font-semibold text-emerald-600">Mild</p>
              <p className="text-lg font-bold text-foreground">{riskCounts.low}</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 px-2.5 py-1.5 text-center">
              <p className="text-xs font-semibold text-blue-600">Good</p>
              <p className="text-lg font-bold text-foreground">{riskCounts.good}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
