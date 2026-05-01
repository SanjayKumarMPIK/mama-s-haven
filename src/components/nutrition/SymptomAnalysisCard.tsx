import type { SymptomAnalysisResult } from "@/lib/nutrition/nutritionTypes";
import { CheckCircle, Circle } from "lucide-react";

interface SymptomAnalysisCardProps {
  analysis: SymptomAnalysisResult;
  accentGradient?: string;
  onClose?: () => void;
}

export default function SymptomAnalysisCard({ analysis, accentGradient = "from-pink-500 to-rose-400", onClose }: SymptomAnalysisCardProps) {
  return (
    <div className="rounded-2xl border-2 border-primary/20 bg-card p-5 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300" id="symptom-analysis-card">
      {/* Close button */}
      {onClose && (
        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors text-xs font-bold">✕</button>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accentGradient} flex items-center justify-center shadow-md`}>
          <span className="text-2xl">{analysis.emoji}</span>
        </div>
        <div>
          <h3 className="text-base font-bold">{analysis.label}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {analysis.detected ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Detected in recent logs ({analysis.count}x)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                <Circle className="w-3 h-3" /> Not frequently logged
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Possible Reasons */}
      {analysis.possibleReasons.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Possible Reasons</p>
          <div className="space-y-1.5">
            {analysis.possibleReasons.map((r, i) => (
              <p key={i} className="text-sm text-foreground/85 leading-relaxed pl-3 border-l-2 border-primary/20">
                {r}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Helpful Nutrients */}
      {analysis.helpfulNutrients.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Helpful Nutrients</p>
          <div className="flex flex-wrap gap-2">
            {analysis.helpfulNutrients.map((n) => (
              <span key={n.nutrientId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs font-semibold">
                <span>{n.emoji}</span> {n.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Food Recommendations */}
      {analysis.foodRecommendations.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Foods That May Help</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {analysis.foodRecommendations.map((food) => (
              <div key={food.name} className="rounded-xl border border-border/40 bg-muted/20 p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{food.emoji}</span>
                  <p className="text-xs font-bold">{food.name}</p>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">{food.whyItHelps}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
