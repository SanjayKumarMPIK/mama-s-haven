import { type Badge } from "@/lib/gamificationData";
import { useLanguage } from "@/hooks/useLanguage";
import { Lock } from "lucide-react";

interface BadgeGridProps {
  unlocked: Badge[];
  locked: Badge[];
}

export default function BadgeGrid({ unlocked, locked }: BadgeGridProps) {
  const { language } = useLanguage();

  const getName = (b: Badge) => language === "hi" ? b.nameHi : language === "ta" ? b.nameTa : b.name;

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
      {unlocked.map((badge) => (
        <div
          key={badge.id}
          className="group relative flex flex-col items-center gap-1 p-2 rounded-xl bg-gradient-to-b from-amber-50 to-orange-50 border border-amber-200 shadow-sm hover:shadow-md transition-all cursor-default"
          title={`${getName(badge)} — ${badge.description}`}
        >
          <span className="text-2xl">{badge.emoji}</span>
          <span className="text-[9px] font-semibold text-amber-800 text-center leading-tight">{getName(badge)}</span>
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-36 bg-foreground text-background text-[10px] rounded-lg px-2 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 text-center shadow-lg">
            {badge.description}
            <br />
            <span className="text-[9px] opacity-70">{badge.criteria}</span>
          </div>
        </div>
      ))}
      {locked.map((badge) => (
        <div
          key={badge.id}
          className="group relative flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/50 border border-border opacity-40 cursor-default"
          title={`Locked: ${badge.criteria}`}
        >
          <div className="relative">
            <span className="text-2xl grayscale">{badge.emoji}</span>
            <Lock className="absolute -bottom-0.5 -right-0.5 w-3 h-3 text-muted-foreground" />
          </div>
          <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight">{getName(badge)}</span>
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 w-32 bg-foreground text-background text-[10px] rounded-lg px-2 py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 text-center shadow-lg">
            🔒 {badge.criteria}
          </div>
        </div>
      ))}
    </div>
  );
}
