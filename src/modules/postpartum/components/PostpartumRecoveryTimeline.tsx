/**
 * PostpartumRecoveryTimeline.tsx
 *
 * Horizontal recovery timeline component for Postpartum Dashboard.
 * Displays postpartum recovery milestones in a horizontal progression layout.
 */

import { CheckCircle2, Circle } from "lucide-react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";

export interface RecoveryTimelineWeek {
  weekNumber: number;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

interface PostpartumRecoveryTimelineProps {
  currentWeek: number;
}

// Postpartum recovery milestones based on weeks post-delivery
function getPostpartumTimeline(currentWeek: number): RecoveryTimelineWeek[] {
  const milestones: RecoveryTimelineWeek[] = [
    {
      weekNumber: 1,
      label: "Initial Recovery",
      description: "Focus on rest, hydration, and bonding with your baby. Your body is beginning the healing process.",
      status: currentWeek > 1 ? "completed" : currentWeek === 1 ? "current" : "upcoming",
    },
    {
      weekNumber: 2,
      label: "Early Healing",
      description: "Incision healing begins, energy levels may start to improve. Continue prioritizing rest and nutrition.",
      status: currentWeek > 2 ? "completed" : currentWeek === 2 ? "current" : "upcoming",
    },
    {
      weekNumber: 3,
      label: "Body Stabilizing",
      description: "Physical recovery continues. Bleeding decreases, and you may feel more capable of light activities.",
      status: currentWeek > 4 ? "completed" : currentWeek >= 3 && currentWeek <= 4 ? "current" : "upcoming",
    },
    {
      weekNumber: 5,
      label: "Recovery Checkpoint",
      description: "Important milestone for postpartum checkup. Discuss breastfeeding, emotional health, and physical recovery.",
      status: currentWeek > 6 ? "completed" : currentWeek >= 5 && currentWeek <= 6 ? "current" : "upcoming",
    },
    {
      weekNumber: 7,
      label: "Strength Building",
      description: "Gradually increase activity levels. Pelvic floor exercises and gentle stretching can begin.",
      status: currentWeek > 8 ? "completed" : currentWeek >= 7 && currentWeek <= 8 ? "current" : "upcoming",
    },
    {
      weekNumber: 9,
      label: "Strong Recovery",
      description: "Most physical recovery complete. Focus on building strength, emotional wellness, and establishing routines.",
      status: currentWeek > 12 ? "completed" : currentWeek >= 9 ? "current" : "upcoming",
    },
  ];

  return milestones;
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
              {timeline.map((milestone, index) => {
                const isCompleted = milestone.status === "completed";
                const isCurrent = milestone.status === "current";
                const isUpcoming = milestone.status === "upcoming";

                return (
                  <div 
                    key={milestone.weekNumber} 
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
                            : "bg-background border-border"
                        }
                        group-hover:scale-110
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
                          : "text-muted-foreground"
                      }
                    `}>
                      Week {milestone.weekNumber}
                    </p>

                    {/* Label */}
                    <p className={`
                      text-[9px] sm:text-[10px] font-medium mt-0.5 text-center leading-tight max-w-[80px]
                      ${isCompleted 
                        ? "text-foreground" 
                        : isCurrent 
                          ? "text-foreground font-semibold" 
                          : "text-muted-foreground"
                      }
                    `}>
                      {milestone.label}
                    </p>

                    {/* Description tooltip on hover (desktop only) */}
                    <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 z-20">
                      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                        <p className="text-xs font-semibold text-foreground mb-1">Week {milestone.weekNumber}</p>
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
