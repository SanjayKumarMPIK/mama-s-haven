import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionItem {
  text: string;
  emoji: string;
  link?: string;
}

interface ActionListProps {
  actions: ActionItem[];
}

export default function ActionList({ actions }: ActionListProps) {
  const navigate = useNavigate();

  return (
    <section className="dashboard-section p-5 !bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]" aria-labelledby="action-heading">
      <h2 id="action-heading" className="dashboard-section-title !mb-4 !text-orange-600">
        <span className="dashboard-section-dot bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
        Recommended Actions
      </h2>

      <div className="space-y-3">
        {actions.map((action, i) => (
          <button
            key={i}
            className="group w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50/50 to-amber-50/30 border border-orange-100/50 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:from-orange-50 hover:to-amber-50/80 hover:border-orange-200"
            style={{ animationDelay: `${i * 100}ms` }}
            type="button"
            onClick={() => {
              if (action.link) navigate(action.link);
            }}
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 shadow-sm text-lg border border-orange-100/30 shrink-0">
              {action.emoji}
            </span>
            <span className="flex-1 text-sm font-semibold text-slate-700 text-left leading-snug group-hover:text-orange-900 transition-colors">
              {action.text}
            </span>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100/50 opacity-0 group-hover:opacity-100 transition-all duration-300 shrink-0">
              <ArrowRight className="w-4 h-4 text-orange-500 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
