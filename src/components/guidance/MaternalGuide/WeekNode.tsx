import React from "react";
import { cn } from "@/lib/utils";

interface WeekNodeProps {
  week: number;
  isActive: boolean;
  isCompleted: boolean;
  isCurrentRealWeek: boolean;
  trimesterBorderColor: string;
  trimesterBgColor: string;
  onClick: (w: number) => void;
}

export function WeekNode({ 
  week, 
  isActive, 
  isCompleted, 
  isCurrentRealWeek,
  trimesterBorderColor,
  trimesterBgColor,
  onClick 
}: WeekNodeProps) {
  
  return (
    <div className="relative flex flex-col items-center group cursor-pointer" onClick={() => onClick(week)}>
      {/* Tooltip on hover */}
      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap pointer-events-none z-10">
        Week {week}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45" />
      </div>

      <div 
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative z-10",
          trimesterBorderColor,
          isActive ? `w-8 h-8 ${trimesterBgColor} shadow-lg shadow-${trimesterBgColor.split('-')[1]}-500/50 scale-110` : "bg-white",
          isCompleted && !isActive ? trimesterBgColor : "bg-white",
          !isCompleted && !isActive ? "opacity-40" : "opacity-100"
        )}
      >
        {isCurrentRealWeek && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-50 bg-current"></span>
        )}
        <span className={cn(
          "text-[10px] font-bold z-10",
          isActive || isCompleted ? "text-white" : trimesterBorderColor.replace("border-", "text-")
        )}>{week}</span>
      </div>
      <span className={cn(
        "mt-2 text-[10px] font-medium transition-colors",
        isActive ? "text-slate-900 font-bold" : "text-slate-400"
      )}>
        W{week}
      </span>
    </div>
  );
}
