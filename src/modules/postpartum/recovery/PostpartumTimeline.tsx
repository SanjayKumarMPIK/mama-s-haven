import { CheckCircle2, Circle, Heart, AlertTriangle } from "lucide-react";
import { usePostpartumRecovery } from "./usePostpartumRecovery";

export function PostpartumTimeline() {
  const { currentWeek, selectedWeek, setSelectedWeek, activeMilestone, milestones, scoreResult } = usePostpartumRecovery();
  const recoveryScore = scoreResult.score;

  // Find the index of the current milestone based on range-based matching
  const currentMilestoneIndex = milestones.findIndex(
    m => currentWeek >= m.weekStart && currentWeek <= m.weekEnd
  );
  // If beyond all milestones, treat last as current
  const activeMilestoneIndex = currentMilestoneIndex === -1
    ? (currentWeek > milestones[milestones.length - 1].weekEnd ? milestones.length : -1)
    : currentMilestoneIndex;

  // Progress fill calculation: fill up to and including the current milestone
  const fillPercentage = milestones.length > 1
    ? Math.min(100, ((activeMilestoneIndex + 0.5) / (milestones.length - 1)) * 100)
    : 0;

  // Score-aware accent: green when recovery > 75, amber when < 40, default rose
  const scoreAccent = recoveryScore >= 75
    ? { ring: "ring-emerald-200/60", glow: "shadow-emerald-400/40", dot: "bg-emerald-500 border-emerald-500", badge: "bg-emerald-100 text-emerald-800" }
    : recoveryScore < 40
      ? { ring: "ring-amber-200/60", glow: "shadow-amber-400/40", dot: "bg-amber-500 border-amber-500", badge: "bg-amber-100 text-amber-800" }
      : { ring: "ring-pink-200/50", glow: "shadow-pink-500/30", dot: "bg-pink-500 border-pink-500", badge: "bg-rose-200 text-rose-800" };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
          <Heart className="w-4 h-4 text-rose-700" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-sm">Recovery Timeline</h2>
          <p className="text-[10px] text-muted-foreground">Week {currentWeek} post-delivery</p>
        </div>
        {/* Score confidence badge */}
        {recoveryScore < 40 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
            <AlertTriangle className="w-3 h-3" />
            Recovery Warning
          </div>
        )}
        {recoveryScore >= 75 && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
            ✓ Strong
          </div>
        )}
      </div>

      <div className="w-full mb-2">
        {/* Horizontal scrollable container for mobile/tablet */}
        <div className="overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:px-0 sm:pb-0">
          <div className="min-w-max sm:min-w-0">
            {/* Progress line background */}
            <div className="relative pt-6 pb-6">
              {/* Horizontal line */}
              <div className="absolute top-[36px] left-0 right-0 h-0.5 bg-border" />
              
              {/* Progress fill line */}
              <div 
                className="absolute top-[36px] left-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-700 ease-out"
                style={{ width: `${fillPercentage}%` }}
              />

              {/* Milestone nodes */}
              <div className="relative flex justify-between gap-2 sm:gap-4">
                {milestones.map((milestone, index) => {
                  const isCompleted = currentWeek > milestone.weekEnd;
                  const isCurrent = currentWeek >= milestone.weekStart && currentWeek <= milestone.weekEnd;
                  const isSelected = selectedWeek >= milestone.weekStart && selectedWeek <= milestone.weekEnd;
                  const weekLabel = milestone.weekStart === milestone.weekEnd
                    ? `Week ${milestone.weekStart}`
                    : `Week ${milestone.weekStart}–${milestone.weekEnd}`;

                  return (
                    <div 
                      key={milestone.weekStart} 
                      onClick={() => setSelectedWeek(milestone.weekStart)}
                      className="flex flex-col items-center flex-1 min-w-[70px] sm:min-w-[80px] group cursor-pointer"
                    >
                      {/* Current phase badge */}
                      {isCurrent && (
                        <span className={`text-[8px] font-bold uppercase tracking-wider mb-1 px-1.5 py-0.5 rounded-full ${scoreAccent.badge}`}>
                          Current
                        </span>
                      )}
                      {!isCurrent && <div className="h-[18px]" />}

                      {/* Node circle */}
                      <div 
                        className={`
                          relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center
                          transition-all duration-300 ease-out
                          ${isSelected && !isCurrent ? "ring-4 ring-pink-200/50 scale-110" : ""}
                          ${isCompleted 
                            ? "bg-rose-500 border-rose-500 shadow-md shadow-rose-500/20" 
                            : isCurrent 
                              ? `${scoreAccent.dot} shadow-lg ${scoreAccent.glow} ring-4 ${scoreAccent.ring} scale-110 animate-pulse` 
                              : "bg-background border-border opacity-50"
                          }
                          group-hover:scale-110 group-hover:opacity-100
                        `}
                      >
                        {isCompleted && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />}
                        {isCurrent && <Circle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white fill-white" />}
                      </div>

                      {/* Week number */}
                      <p className={`
                        text-[10px] sm:text-xs font-bold mt-3
                        ${isSelected ? "text-pink-700" : isCompleted ? "text-rose-700" : isCurrent ? "text-pink-600" : "text-muted-foreground/50"}
                      `}>
                        {weekLabel}
                      </p>

                      {/* Label */}
                      <p className={`
                        text-[9px] sm:text-[10px] mt-0.5 text-center leading-tight max-w-[80px]
                        ${isSelected ? "text-foreground font-semibold" : isCompleted ? "text-muted-foreground" : isCurrent ? "text-foreground font-medium" : "text-muted-foreground/40"}
                      `}>
                        {milestone.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Milestone Details Panel */}
      <div className="mt-auto pt-4 border-t border-border/50">
        <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-rose-900">{activeMilestone.title}</h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-200 text-rose-800">
              {activeMilestone.weekStart === activeMilestone.weekEnd
                ? `Week ${activeMilestone.weekStart}`
                : `Week ${activeMilestone.weekStart}–${activeMilestone.weekEnd}`}
            </span>
          </div>
          <p className="text-xs text-rose-800/80 leading-relaxed mb-3">
            {activeMilestone.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {activeMilestone.tags.map((tag) => (
              <span key={tag} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white text-rose-600 border border-rose-100 shadow-sm">
                {tag}
              </span>
            ))}
          </div>

          <div className="space-y-1.5">
            <p className="text-[10px] font-bold text-rose-900 uppercase tracking-wider">Recommendations</p>
            <ul className="space-y-1">
              {activeMilestone.recommendations.map((rec, i) => (
                <li key={i} className="text-[11px] text-rose-700 flex gap-1.5 items-start">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
