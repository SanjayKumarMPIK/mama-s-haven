import { Lightbulb } from "lucide-react";

interface AnalyticsListProps {
  insights: string[];
}

export default function AnalyticsList({ insights }: AnalyticsListProps) {
  return (
    <section className="dashboard-section p-5 !bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" aria-labelledby="analytics-heading">
      <h2 id="analytics-heading" className="dashboard-section-title !mb-4 !text-violet-600">
        <span className="dashboard-section-dot bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
        Analytics & Insights
      </h2>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-violet-50/80 to-purple-50/50 border border-violet-100/60 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:from-violet-50 hover:to-purple-50/80"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-100/80 shrink-0 mt-0.5 shadow-inner">
              <Lightbulb className="w-4 h-4 text-violet-500" />
            </div>
            <p className="text-sm font-medium text-slate-700 leading-relaxed pt-1.5">{insight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
