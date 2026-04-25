import { Activity, Target } from "lucide-react";
import { NutritionChecklistItem } from "@/lib/nutrition/nutritionChecklistEngine";

interface ChecklistSummaryProps {
  items: NutritionChecklistItem[];
}

export default function ChecklistSummary({ items }: ChecklistSummaryProps) {
  const total = items.length;
  const completed = items.filter((item) => item.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-blue-600/80 uppercase tracking-wider mb-0.5">
            Progress
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-blue-900">{percentage}%</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-emerald-600/80 uppercase tracking-wider mb-0.5">
            Tasks
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-emerald-900">{completed}</span>
            <span className="text-sm font-semibold text-emerald-700/60">/ {total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
