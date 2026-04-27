// ─── Visual Analytics Menu Panel ───────────────────────────────────────────
// Left-side analytics navigation menu for pregnancy dashboard
// STRICTLY isolated to Maternity Phase only

import { Heart, Moon, Smile, TrendingUp } from "lucide-react";

export type AnalyticsType = "symptoms" | "sleep" | "mood" | "activity";

interface AnalyticsMenuItem {
  id: AnalyticsType;
  label: string;
  icon: React.ElementType;
}

interface VisualAnalyticsMenuProps {
  activeType: AnalyticsType;
  onSelect: (type: AnalyticsType) => void;
}

const ANALYTICS_MENU_ITEMS: AnalyticsMenuItem[] = [
  { id: "symptoms", label: "Symptoms Trend", icon: Heart },
  { id: "sleep", label: "Sleep Trend", icon: Moon },
  { id: "mood", label: "Mood Trend", icon: Smile },
  { id: "activity", label: "Activity Trend", icon: TrendingUp },
];

export default function VisualAnalyticsMenu({ activeType, onSelect }: VisualAnalyticsMenuProps) {
  return (
    <>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shadow-sm border border-purple-100">
          <TrendingUp className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="font-bold text-base">Visual Analytics</h2>
      </div>
      <div className="space-y-2.5">
        {ANALYTICS_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeType === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-3.5 rounded-2xl p-3 text-left transition-all ${
                isActive
                  ? "bg-purple-50 shadow-sm border border-purple-100"
                  : "hover:bg-muted/60 border border-transparent"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isActive ? "bg-purple-100" : "bg-white border border-border/50"}`}>
                <Icon className={`w-4 h-4 ${isActive ? "text-purple-600" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-sm font-bold ${isActive ? "text-purple-900" : "text-muted-foreground"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
