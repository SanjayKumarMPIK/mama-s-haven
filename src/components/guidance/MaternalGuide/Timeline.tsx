import React, { useRef, useEffect } from "react";
import { WeekNode } from "./WeekNode";
import { type WeekData } from "./data";

interface TimelineProps {
  weeks: WeekData[];
  selectedWeek: number;
  currentRealWeek: number;
  onSelectWeek: (w: number) => void;
}

export function Timeline({ weeks, selectedWeek, currentRealWeek, onSelectWeek }: TimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to current real week or selected week on load
  useEffect(() => {
    if (scrollRef.current) {
      const targetWeek = currentRealWeek || selectedWeek;
      const nodeWidth = 60; // Approximate width including gap
      const targetPos = (targetWeek - 1) * nodeWidth;
      const containerWidth = scrollRef.current.clientWidth;
      
      scrollRef.current.scrollTo({
        left: Math.max(0, targetPos - containerWidth / 2 + nodeWidth / 2),
        behavior: 'smooth'
      });
    }
  }, [currentRealWeek, selectedWeek]);

  const getTrimesterColors = (tri: 1 | 2 | 3) => {
    switch(tri) {
      case 1: return { border: "border-emerald-500", bg: "bg-emerald-500", line: "bg-emerald-200" };
      case 2: return { border: "border-amber-500", bg: "bg-amber-500", line: "bg-amber-200" };
      case 3: return { border: "border-purple-500", bg: "bg-purple-500", line: "bg-purple-200" };
    }
  };

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-border/60 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-500 opacity-20" />
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 text-lg">Timeline Overview</h3>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> T1 (W1-12)</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"/> T2 (W13-26)</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500"/> T3 (W27-40)</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex items-center gap-6 overflow-x-auto pb-4 pt-10 px-4 snap-x snap-mandatory scrollbar-hide relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Background connector line */}
        <div className="absolute top-[52px] left-8 right-8 h-1 bg-slate-100 z-0" />

        {weeks.map((data) => {
          const colors = getTrimesterColors(data.trimester);
          return (
            <div key={data.week} className="snap-center relative z-10 shrink-0 flex items-center justify-center">
              <WeekNode 
                week={data.week}
                isActive={selectedWeek === data.week}
                isCompleted={currentRealWeek ? data.week < currentRealWeek : false}
                isCurrentRealWeek={data.week === currentRealWeek}
                trimesterBorderColor={colors.border}
                trimesterBgColor={colors.bg}
                onClick={onSelectWeek}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
