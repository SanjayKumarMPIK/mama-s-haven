interface StreakBadgeProps {
  streak: number;
  size?: "sm" | "md" | "lg";
}

export default function StreakBadge({ streak, size = "md" }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2",
  };

  if (streak <= 0) {
    return (
      <div className={`inline-flex items-center rounded-full bg-muted text-muted-foreground font-medium ${sizeClasses[size]}`}>
        <span>🔥</span>
        <span>0</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center rounded-full font-bold transition-all duration-300 ${sizeClasses[size]} ${
      streak >= 30
        ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-300/40 animate-pulse"
        : streak >= 7
        ? "bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-md shadow-orange-200/40"
        : streak >= 3
        ? "bg-orange-100 text-orange-700 border border-orange-200"
        : "bg-amber-50 text-amber-700 border border-amber-200"
    }`}>
      <span className={streak >= 7 ? "animate-bounce" : ""}>🔥</span>
      <span>{streak}</span>
      {streak >= 7 && <span className="text-[10px] font-normal opacity-80">day streak!</span>}
    </div>
  );
}
