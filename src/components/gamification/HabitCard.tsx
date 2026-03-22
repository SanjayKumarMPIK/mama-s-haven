import { type HabitDef } from "@/lib/gamificationData";
import { useLanguage } from "@/hooks/useLanguage";
import { Check } from "lucide-react";

interface HabitCardProps {
  habit: HabitDef;
  completed: boolean;
  onToggle: () => void;
}

export default function HabitCard({ habit, completed, onToggle }: HabitCardProps) {
  const { language } = useLanguage();
  const name = language === "hi" ? habit.nameHi : language === "ta" ? habit.nameTa : habit.name;

  return (
    <button
      onClick={onToggle}
      className={`group relative w-full rounded-2xl border-2 p-4 text-left transition-all duration-300 active:scale-[0.97] ${
        completed
          ? "border-green-300 bg-green-50 shadow-sm shadow-green-100"
          : "border-border bg-card hover:border-primary/30 hover:shadow-md"
      }`}
      id={`habit-${habit.id}`}
    >
      <div className="flex items-center gap-3">
        {/* Emoji + check circle */}
        <div className="relative">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${
            completed ? "bg-green-100 scale-110" : "bg-muted group-hover:bg-primary/10"
          }`}>
            {completed ? (
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-[scale-in_0.3s_ease-out]">
                <Check className="w-5 h-5 text-white" strokeWidth={3} />
              </div>
            ) : (
              <span>{habit.emoji}</span>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm leading-tight ${completed ? "text-green-700" : ""}`}>
            {name}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{habit.description}</p>
        </div>

        {/* XP badge */}
        <div className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-bold ${
          completed ? "bg-green-200 text-green-800" : "bg-muted text-muted-foreground"
        }`}>
          +{habit.xp} XP
        </div>
      </div>

      {/* Target */}
      <div className={`mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full inline-block ${
        completed ? "bg-green-200/60 text-green-700" : "bg-muted/60 text-muted-foreground"
      }`}>
        🎯 {habit.target}
      </div>
    </button>
  );
}
