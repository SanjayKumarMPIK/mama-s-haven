import { CheckCircle2, Circle, ClipboardList, Flame, Sparkles } from "lucide-react";
import { usePregnancyDashboard } from "@/hooks/usePregnancyDashboard";
import { DAILY_CHECKLIST } from "@/lib/pregnancyDashboardData";

// ─── Category icons for checklist ────────────────────────────────────────────
function getCategoryIcon(cat: string) {
  switch (cat) {
    case "supplement": return <span className="w-3.5 h-3.5">💊</span>;
    case "nutrition":  return <span className="w-3.5 h-3.5">🍎</span>;
    case "hydration":  return <span className="w-3.5 h-3.5">💧</span>;
    case "activity":   return <span className="w-3.5 h-3.5">🏃</span>;
    case "rest":       return <span className="w-3.5 h-3.5">😴</span>;
    default:           return <span className="w-3.5 h-3.5">•</span>;
  }
}

function getCategoryColor(cat: string) {
  switch (cat) {
    case "supplement": return "bg-purple-100 text-purple-700 border-purple-200";
    case "nutrition":  return "bg-green-100 text-green-700 border-green-200";
    case "hydration":  return "bg-blue-100 text-blue-700 border-blue-200";
    case "activity":   return "bg-amber-100 text-amber-700 border-amber-200";
    case "rest":       return "bg-indigo-100 text-indigo-700 border-indigo-200";
    default:           return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

interface DailyHealthChecklistProps {
  currentWeek: number;
}

export default function DailyHealthChecklist({ currentWeek }: DailyHealthChecklistProps) {
  const dash = usePregnancyDashboard(currentWeek);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-mint flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-mint-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Today's Health Checklist</h2>
            <p className="text-[10px] text-muted-foreground">{dash.checklistCompleted}/{dash.checklistTotal} completed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {dash.checklistStreak > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
              <Flame className="w-3.5 h-3.5" /> {dash.checklistStreak}d
            </div>
          )}
          {/* Mini completion ring */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                stroke={dash.checklistPct === 100 ? "hsl(140,60%,40%)" : "hsl(var(--primary))"}
                strokeWidth="4" strokeDasharray={`${dash.checklistPct}, 100`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
              {dash.checklistPct}%
            </div>
          </div>
        </div>
      </div>

      {dash.checklistPct === 100 && (
        <div className="mb-3 rounded-lg bg-green-50 border border-green-200 p-2.5 text-center">
          <p className="text-xs font-semibold text-green-700 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> All done for today! Great job! 🎉
          </p>
        </div>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {DAILY_CHECKLIST.map((item) => {
          const done = !!dash.todayItems[item.id];
          return (
            <button
              key={item.id}
              onClick={() => dash.toggleChecklistItem(item.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 active:scale-[0.98] ${
                done
                  ? "bg-green-50/80 border-green-200 shadow-sm"
                  : "bg-background border-border/60 hover:border-primary/20 hover:shadow-sm"
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                done ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium leading-tight ${done ? "line-through text-muted-foreground" : ""}`}>
                  {item.emoji} {item.label}
                </p>
              </div>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 ${getCategoryColor(item.category)}`}>
                {getCategoryIcon(item.category)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
