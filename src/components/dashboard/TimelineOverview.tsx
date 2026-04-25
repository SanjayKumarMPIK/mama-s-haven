import React, { useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useMaternalTestReminders, type TestReminderStatus } from "@/hooks/useMaternalTestReminders";

interface TimelineOverviewProps {
  currentWeek: number;
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
}

// ── Trimester color helpers (identical to MaternalGuide/Timeline) ──
function getTrimesterColors(w: number) {
  if (w <= 12) return { border: "border-emerald-500", bg: "bg-emerald-500", line: "bg-emerald-200" };
  if (w <= 26) return { border: "border-amber-500", bg: "bg-amber-500", line: "bg-amber-200" };
  return { border: "border-purple-500", bg: "bg-purple-500", line: "bg-purple-200" };
}

// ── Week Node (identical to MaternalGuide/WeekNode) ──
function WeekNode({
  week,
  isActive,
  isCompleted,
  isCurrentRealWeek,
  trimesterBorderColor,
  trimesterBgColor,
  onClick,
  testStatus,
}: {
  week: number;
  isActive: boolean;
  isCompleted: boolean;
  isCurrentRealWeek: boolean;
  trimesterBorderColor: string;
  trimesterBgColor: string;
  onClick: (w: number) => void;
  testStatus?: TestReminderStatus;
}) {
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
          isActive && `w-8 h-8 ${trimesterBgColor} shadow-lg scale-110`,
          isCompleted && !isActive && trimesterBgColor,
          !isCompleted && !isActive && "bg-white opacity-40",
          (isCompleted || isActive) && "opacity-100",
          !isActive && !isCompleted && "bg-white"
        )}
      >
        {isCurrentRealWeek && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-50 bg-current" />
        )}
        <span
          className={cn(
            "text-[10px] font-bold z-10",
            isActive || isCompleted ? "text-white" : trimesterBorderColor.replace("border-", "text-")
          )}
        >
          {week}
        </span>
      </div>
      {/* Test status indicator */}
      {testStatus && testStatus !== "upcoming" && testStatus !== "past" && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full mt-0.5",
            testStatus === "completed" && "bg-emerald-500",
            testStatus === "recommended" && "bg-purple-500 animate-pulse",
            testStatus === "reminder-set" && "bg-teal-500",
            testStatus === "due-today" && "bg-amber-500 animate-pulse",
            testStatus === "due-soon" && "bg-amber-400",
            testStatus === "ignored" && "bg-gray-300"
          )}
          title={`Test: ${testStatus}`}
        />
      )}
      <span
        className={cn(
          "mt-2 text-[10px] font-medium transition-colors",
          isActive ? "text-slate-900 font-bold" : "text-slate-400"
        )}
      >
        W{week}
      </span>
    </div>
  );
}

// ── Main Timeline Overview component ──
export function TimelineOverview({ currentWeek, selectedWeek, onSelectWeek }: TimelineOverviewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { testsWithStatus } = useMaternalTestReminders();

  // Map week -> best test status for that week
  const weekTestStatusMap = useMemo(() => {
    const map: Record<number, TestReminderStatus> = {};
    const priority: Record<TestReminderStatus, number> = {
      "due-today": 0,
      "due-soon": 1,
      "recommended": 2,
      "reminder-set": 3,
      "completed": 4,
      "ignored": 5,
      "upcoming": 6,
      "past": 7,
    };
    for (const test of testsWithStatus) {
      for (let w = test.weekStart; w <= test.weekEnd; w++) {
        const current = map[w];
        if (!current || priority[test.status] < priority[current]) {
          map[w] = test.status;
        }
      }
    }
    return map;
  }, [testsWithStatus]);

  // Auto-scroll to current real week on load
  useEffect(() => {
    if (scrollRef.current) {
      const targetWeek = currentWeek || selectedWeek;
      const nodeWidth = 60; // Approximate width including gap
      const targetPos = (targetWeek - 1) * nodeWidth;
      const containerWidth = scrollRef.current.clientWidth;

      scrollRef.current.scrollTo({
        left: Math.max(0, targetPos - containerWidth / 2 + nodeWidth / 2),
        behavior: "smooth",
      });
    }
  }, [currentWeek, selectedWeek]);

  const weeks = Array.from({ length: 40 }, (_, i) => i + 1);

  return (
    <div className="w-full bg-white rounded-3xl p-6 border border-border/60 shadow-sm relative overflow-hidden mt-4">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-purple-500 opacity-20" />

      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 text-lg">Timeline Overview</h3>
        <div className="flex gap-4 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" /> T1 (W1-12)
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> T2 (W13-26)
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" /> T3 (W27-40)
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-6 overflow-x-auto pb-4 pt-10 px-4 snap-x snap-mandatory scrollbar-hide relative"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Background connector line */}
        <div className="absolute top-[52px] left-8 right-8 h-1 bg-slate-100 z-0" />

        {weeks.map((w) => {
          const colors = getTrimesterColors(w);
          return (
            <div key={w} className="snap-center relative z-10 shrink-0 flex items-center justify-center">
              <WeekNode
                week={w}
                isActive={selectedWeek === w}
                isCompleted={currentWeek ? w < currentWeek : false}
                isCurrentRealWeek={w === currentWeek}
                trimesterBorderColor={colors.border}
                trimesterBgColor={colors.bg}
                onClick={onSelectWeek}
                testStatus={weekTestStatusMap[w]}
              />
            </div>
          );
        })}
      </div>

      {/* Hide scrollbar for webkit */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
