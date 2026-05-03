/**
 * PostpartumRecoveryTimeline.tsx
 *
 * Horizontal recovery timeline component for Postpartum Dashboard.
 * Displays postpartum recovery milestones in a horizontal progression layout.
 * NOTE: This is the legacy/alternate timeline. The primary one is in recovery/PostpartumTimeline.tsx.
 */

import { CheckCircle2, Circle } from "lucide-react";
import { postpartumMilestones, getMilestoneForWeek } from "../recovery/postpartumMilestoneConfig";

export interface RecoveryTimelineWeek {
  weekStart: number;
  weekEnd: number;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

interface PostpartumRecoveryTimelineProps {
  currentWeek: number;
}

// Build timeline from milestone config (single source of truth)
function getPostpartumTimeline(currentWeek: number): RecoveryTimelineWeek[] {
  return postpartumMilestones.map(m => ({
    weekStart: m.weekStart,
    weekEnd: m.weekEnd,
    label: m.title,
    description: m.description,
    status: currentWeek > m.weekEnd
      ? "completed"
      : currentWeek >= m.weekStart && currentWeek <= m.weekEnd
        ? "current"
        : "upcoming",
  }));
}

export default function PostpartumRecoveryTimeline({ currentWeek }: PostpartumRecoveryTimelineProps) {
  const timeline = getPostpartumTimeline(currentWeek);

  return (
    <div className="w-full">
      {/* Horizontal scrollable container for mobile/tablet */}
      <div className="overflow-x-auto pb-4 -mx-5 px-5 sm:mx-0 sm:px-0 sm:pb-0">
        <div className="min-w-max sm:min-w-0">
          {/* Progress line background */}
          <div className="relative pt-8 pb-4">
            {/* Horizontal line */}
            <div className="absolute top-[26px] left-0 right-0 h-0.5 bg-border" />
            
            {/* Progress fill line */}
            <div 
              className="absolute top-[26px] left-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-400 transition-all duration-700 ease-out"
              style={{ 
                width: `${timeline.length > 1 ? ((timeline.findIndex(m => m.status === "current") + 1) / timeline.length) * 100 : 0}%`
              }}
            />

            {/* Milestone nodes */}
            <div className="relative flex justify-between gap-2 sm:gap-4">
              {timeline.map((milestone) => {
                const isCompleted = milestone.status === "completed";
                const isCurrent = milestone.status === "current";
                const weekLabel = milestone.weekStart === milestone.weekEnd
                  ? `Week ${milestone.weekStart}`
                  : `Week ${milestone.weekStart}–${milestone.weekEnd}`;

                return (
                  <div 
                    key={milestone.weekStart} 
                    className="flex flex-col items-center flex-1 min-w-[70px] sm:min-w-[80px] group cursor-pointer"
                  >
                    {/* Node circle */}
                    <div 
                      className={`
                        relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center
                        transition-all duration-300 ease-out
                        ${isCompleted 
                          ? "bg-rose-500 border-rose-500 shadow-md shadow-rose-500/20" 
                          : isCurrent 
                            ? "bg-pink-500 border-pink-500 shadow-lg shadow-pink-500/30 ring-4 ring-pink-100 scale-110" 
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
                      text-[10px] sm:text-xs font-bold mt-2
                      ${isCompleted 
                        ? "text-rose-700" 
                        : isCurrent 
                          ? "text-pink-700" 
                          : "text-muted-foreground/50"
                      }
                    `}>
                      {weekLabel}
                    </p>

                    {/* Label */}
                    <p className={`
                      text-[9px] sm:text-[10px] font-medium mt-0.5 text-center leading-tight max-w-[80px]
                      ${isCompleted 
                        ? "text-foreground" 
                        : isCurrent 
                          ? "text-foreground font-semibold" 
                          : "text-muted-foreground/40"
                      }
                    `}>
                      {milestone.label}
                    </p>

                    {/* Description tooltip on hover (desktop only) */}
                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 z-20">
                      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                        <p className="text-xs font-semibold text-foreground mb-1">{weekLabel}</p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Current phase description */}
      <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200/60">
        <p className="text-xs font-semibold text-rose-900 mb-1">
          Week {currentWeek} post-delivery
        </p>
        <p className="text-[11px] text-rose-700 leading-relaxed">
          {timeline.find(m => m.status === "current")?.description || 
           timeline.find(m => m.status === "completed")?.description || 
           "Your recovery journey has begun. Focus on rest and bonding with your baby."}
        </p>
      </div>
    </div>
  );
}
