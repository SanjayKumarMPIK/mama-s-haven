import { useState, useMemo, useEffect } from "react";
import { Target, Flame, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Progress Ring ───────────────────────────────────────────────────────────

function ProgressRing({ percentage, size = 80, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#f1f5f9" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={percentage >= 80 ? "#10b981" : percentage >= 50 ? "#f59e0b" : "#94a3b8"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-800">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MaternityDailyGoals() {
  const [completedGoals, setCompletedGoals] = useState<string[]>(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const saved = JSON.parse(localStorage.getItem(`maternity-goals-${today}`) || "[]");
      return saved;
    } catch {
      return [];
    }
  });

  const toggleGoal = (id: string) => {
    setCompletedGoals((prev) => {
      const next = prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id];
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(`maternity-goals-${today}`, JSON.stringify(next));
      return next;
    });
  };

  const goals = useMemo(() => [
    { id: "m-water", block: "morning", emoji: "💧", label: "Drink a large glass of water on waking" },
    { id: "m-vitamin", block: "morning", emoji: "💊", label: "Take prenatal vitamins with breakfast" },
    { id: "m-stretch", block: "morning", emoji: "🧘", label: "Morning gentle stretching (10 mins)" },
    { id: "a-protein", block: "afternoon", emoji: "🍱", label: "Include lean protein with lunch" },
    { id: "a-water", block: "afternoon", emoji: "💧", label: "Reach 50% of daily hydration goal" },
    { id: "a-walk", block: "afternoon", emoji: "🚶", label: "Short post-lunch walk for digestion" },
    { id: "e-dinner", block: "evening", emoji: "🍽️", label: "Eat a balanced, reflux-friendly dinner" },
    { id: "e-wind", block: "evening", emoji: "📖", label: "Read a book or bond with baby bump" },
    { id: "e-screen", block: "evening", emoji: "📵", label: "Screen-off time 60 mins before sleep" },
  ], []);

  const totalGoals = goals.length;
  const completedCount = completedGoals.length;
  const percentage = totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0;

  const morningGoals = goals.filter((g) => g.block === "morning");
  const afternoonGoals = goals.filter((g) => g.block === "afternoon");
  const eveningGoals = goals.filter((g) => g.block === "evening");

  const GoalBlock = ({ title, emoji, items, color }: { title: string; emoji: string; items: any[]; color: string }) => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={cn("px-4 py-2.5 flex items-center gap-2 border-b", color)}>
        <span className="text-lg">{emoji}</span>
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>
      <div className="p-3 space-y-1">
        {items.map((goal) => {
          const isComplete = completedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                isComplete ? "bg-green-50 border border-green-200" : "hover:bg-slate-50 border border-transparent"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                isComplete ? "border-green-500 bg-green-500" : "border-slate-300"
              )}>
                {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </div>
              <span className="text-lg">{goal.emoji}</span>
              <span className={cn(
                "text-sm transition-all",
                isComplete ? "text-green-700 line-through" : "text-slate-700"
              )}>
                {goal.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-transparent mt-8">
      {/* Header with progress ring */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-md shadow-purple-200">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Daily Goals</h1>
            <p className="text-xs text-slate-500">{completedCount}/{totalGoals} completed</p>
            <p className="text-[10px] text-purple-700">Healthy habits for a healthy pregnancy</p>
          </div>
        </div>
        <ProgressRing percentage={percentage} />
      </div>

      {/* Streak */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800">1</p>
            <p className="text-[10px] text-slate-500">day streak this week</p>
          </div>
        </div>
      </div>

      {/* Goal blocks */}
      <div className="space-y-4 mb-6">
        <GoalBlock title="Morning" emoji="🌅" items={morningGoals} color="bg-orange-50 border-orange-100" />
        <GoalBlock title="Afternoon" emoji="☀️" items={afternoonGoals} color="bg-purple-50 border-purple-100" />
        <GoalBlock title="Evening" emoji="🌙" items={eveningGoals} color="bg-indigo-50 border-indigo-100" />
      </div>
    </div>
  );
}
