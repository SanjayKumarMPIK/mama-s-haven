import { ArrowRight } from "lucide-react";

interface ActionItem {
  text: string;
  emoji: string;
}

interface ActionListProps {
  actions: ActionItem[];
}

export default function ActionList({ actions }: ActionListProps) {
  return (
    <section className="dashboard-section" aria-labelledby="action-heading">
      <h2 id="action-heading" className="dashboard-section-title">
        <span className="dashboard-section-dot bg-orange-400" />
        Actions for You
      </h2>

      <div className="space-y-3">
        {actions.map((action, i) => (
          <button
            key={i}
            className="dashboard-action-card"
            style={{ animationDelay: `${i * 80}ms` }}
            type="button"
          >
            <span className="dashboard-action-emoji">{action.emoji}</span>
            <span className="flex-1 text-sm font-medium text-slate-700 text-left leading-snug">
              {action.text}
            </span>
            <ArrowRight className="w-4 h-4 text-orange-400 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </section>
  );
}
