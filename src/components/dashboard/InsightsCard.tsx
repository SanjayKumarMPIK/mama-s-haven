import { Lightbulb, Zap, Scale, Moon, Activity } from "lucide-react";

/* ── Types ──────────────────────────────────────────────── */

export interface InsightItem {
  text: string;
  icon: "scale" | "energy" | "mood" | "sleep" | "activity";
  tone: "positive" | "neutral" | "warning";
}

interface InsightsCardProps {
  insights: InsightItem[];
}

/* ── Icon Map ───────────────────────────────────────────── */

const ICON_MAP = {
  scale: Scale,
  energy: Zap,
  mood: Lightbulb,
  sleep: Moon,
  activity: Activity,
};

const TONE_STYLES = {
  positive: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    icon: "bg-emerald-100 text-emerald-600",
    text: "text-emerald-800",
  },
  neutral: {
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: "bg-blue-100 text-blue-600",
    text: "text-blue-800",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: "bg-amber-100 text-amber-600",
    text: "text-amber-800",
  },
};

/* ── Component ──────────────────────────────────────────── */

export default function InsightsCard({ insights }: InsightsCardProps) {
  if (insights.length === 0) return null;

  return (
    <div
      className="rounded-3xl p-5 border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.06)] relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(243,232,255,0.3) 50%, rgba(252,231,243,0.3) 100%)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Decorative blob */}
      <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-violet-100/30 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4 relative">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
          <Lightbulb className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Smart Insights
        </h2>
      </div>

      {/* Insight items */}
      <div className="space-y-2.5 relative">
        {insights.map((insight, i) => {
          const Icon = ICON_MAP[insight.icon] || Lightbulb;
          const style = TONE_STYLES[insight.tone];

          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${style.bg} ${style.border} transition-all duration-300 hover:shadow-sm hover:-translate-y-0.5`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.icon}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className={`text-xs font-semibold leading-relaxed ${style.text}`}>
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
