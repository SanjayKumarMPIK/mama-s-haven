// ─── TodayTipCard Component ───────────────────────────────────────────────────
// Displays a daily rotating pregnancy tip with context awareness

import { Lightbulb, ChevronRight, Droplets, Moon, Apple, Activity, Heart, Baby, Calendar, Stethoscope, Shield } from "lucide-react";
import { useDailyTip } from "./useDailyTip";
import { PregnancyTipCategory } from "./maternityTips";

// ─── Category Icon Mapping ───────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<PregnancyTipCategory, typeof Lightbulb> = {
  hydration: Droplets,
  sleep: Moon,
  nutrition: Apple,
  exercise: Activity,
  emotional_wellness: Heart,
  swelling: Activity,
  baby_development: Baby,
  scan_reminders: Calendar,
  posture: Activity,
  breathing: Activity,
  labor_preparation: Stethoscope,
  iron_calcium: Shield,
  movement: Baby,
  stress_reduction: Heart,
};

// ─── Category Color Mapping ───────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<PregnancyTipCategory, { bg: string; icon: string; border: string }> = {
  hydration: { bg: "bg-blue-50", icon: "bg-blue-100 text-blue-600", border: "border-blue-200" },
  sleep: { bg: "bg-indigo-50", icon: "bg-indigo-100 text-indigo-600", border: "border-indigo-200" },
  nutrition: { bg: "bg-green-50", icon: "bg-green-100 text-green-600", border: "border-green-200" },
  exercise: { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", border: "border-amber-200" },
  emotional_wellness: { bg: "bg-pink-50", icon: "bg-pink-100 text-pink-600", border: "border-pink-200" },
  swelling: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", border: "border-purple-200" },
  baby_development: { bg: "bg-peach", icon: "bg-peach/80 text-peach-foreground", border: "border-peach/30" },
  scan_reminders: { bg: "bg-lavender", icon: "bg-lavender/80 text-lavender-foreground", border: "border-lavender/30" },
  posture: { bg: "bg-teal-50", icon: "bg-teal-100 text-teal-600", border: "border-teal-200" },
  breathing: { bg: "bg-cyan-50", icon: "bg-cyan-100 text-cyan-600", border: "border-cyan-200" },
  labor_preparation: { bg: "bg-rose-50", icon: "bg-rose-100 text-rose-600", border: "border-rose-200" },
  iron_calcium: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-600", border: "border-orange-200" },
  movement: { bg: "bg-peach", icon: "bg-peach/80 text-peach-foreground", border: "border-peach/30" },
  stress_reduction: { bg: "bg-violet-50", icon: "bg-violet-100 text-violet-600", border: "border-violet-200" },
};

// ─── Main Component ─────────────────────────────────────────────────────────────

interface TodayTipCardProps {
  className?: string;
}

export default function TodayTipCard({ className = "" }: TodayTipCardProps) {
  const { dailyTip, currentDate, pregnancyWeek } = useDailyTip();

  if (!dailyTip) {
    return null;
  }

  const Icon = CATEGORY_ICONS[dailyTip.category] || Lightbulb;
  const colors = CATEGORY_COLORS[dailyTip.category] || CATEGORY_COLORS.emotional_wellness;

  // Format date for display
  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO + "T00:00:00");
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className={`rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md transition-shadow ${className} h-full`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${colors.icon} flex items-center justify-center shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Today's Tip</h2>
            <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
              Week {pregnancyWeek} • {formatDate(currentDate)}
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors cursor-pointer">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>

      {/* Content */}
      <div className={`${colors.bg} rounded-2xl border border-white/40 shadow-sm p-5`}>
        <h3 className="font-bold text-[15px] mb-2">{dailyTip.title}</h3>
        <p className="text-[13px] text-foreground/80 leading-relaxed font-medium">{dailyTip.description}</p>
      </div>

      {/* Category Badge */}
      <div className="mt-4 flex items-center justify-between px-1">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${colors.bg} ${colors.border} border shadow-sm`}>
          {dailyTip.category.replace(/_/g, " ")}
        </span>
        {dailyTip.severity === "high" && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Important
          </span>
        )}
      </div>
    </div>
  );
}
