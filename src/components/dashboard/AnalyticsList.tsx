import { Lightbulb } from "lucide-react";

interface AnalyticsListProps {
  insights: string[];
}

export default function AnalyticsList({ insights }: AnalyticsListProps) {
  return (
    <section className="dashboard-section" aria-labelledby="analytics-heading">
      <h2 id="analytics-heading" className="dashboard-section-title">
        <span className="dashboard-section-dot bg-violet-400" />
        Analytics
      </h2>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="dashboard-insight-card"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="dashboard-insight-icon-wrap">
              <Lightbulb className="w-4 h-4 text-violet-500" />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
