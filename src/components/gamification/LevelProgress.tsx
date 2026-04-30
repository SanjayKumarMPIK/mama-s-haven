import { type LevelDef } from "@/lib/gamificationData";
import { useLanguage } from "@/hooks/useLanguage";

interface LevelProgressProps {
  level: LevelDef;
  nextLevel: LevelDef | null;
  progress: number;
  totalXP: number;
}

export default function LevelProgress({ level, nextLevel, progress, totalXP }: LevelProgressProps) {
  const { language } = useLanguage();
  const levelName = language === "hi" ? level.nameHi : language === "ta" ? level.nameTa : level.name;
  const nextName = nextLevel ? (language === "hi" ? nextLevel.nameHi : language === "ta" ? nextLevel.nameTa : nextLevel.name) : null;

  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary/5 via-lavender/20 to-mint/20 border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{level.emoji}</span>
          <div>
            <p className="text-sm font-bold">Level {level.level} — {levelName}</p>
            <p className="text-[10px] text-muted-foreground">{totalXP} XP total</p>
          </div>
        </div>
        {nextLevel && (
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">Next: {nextName} {nextLevel.emoji}</p>
            <p className="text-[10px] text-muted-foreground">{nextLevel.minXP - totalXP} XP to go</p>
          </div>
        )}
      </div>

      {/* XP bar */}
      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-amber-400 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-muted-foreground">{level.minXP} XP</span>
        {nextLevel && <span className="text-[9px] text-muted-foreground">{nextLevel.minXP} XP</span>}
      </div>
    </div>
  );
}
