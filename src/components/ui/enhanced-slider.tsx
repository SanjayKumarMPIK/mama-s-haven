import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type Phase = "puberty" | "maternity" | "family_planning" | "menopause";

export type Checkpoint = {
  value: number;
  label: string;
  priority?: "low" | "medium" | "high";
};

export type EnhancedSliderProps = {
  min: number;
  max: number;
  step?: number;
  value: number;
  checkpoints: Checkpoint[];
  phase: Phase;
  onChange: (value: number) => void;
  className?: string;
};

export function EnhancedSlider({
  min,
  max,
  step = 1,
  value,
  checkpoints,
  phase,
  onChange,
  className,
}: EnhancedSliderProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  // Soft snap threshold (e.g. 5% of range or 0.5 whichever is reasonable)
  const snapThreshold = Math.max((max - min) * 0.05, step);

  const handleValueChange = (vals: number[]) => {
    let val = vals[0];
    let snapped = val;

    // Apply soft snapping
    for (const cp of checkpoints) {
      if (Math.abs(val - cp.value) <= snapThreshold) {
        snapped = cp.value;
        break;
      }
    }

    onChange(snapped);
  };

  return (
    <div className={cn("relative pt-4 pb-6 w-full", className)}>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={handleValueChange}
        onPointerDown={() => setIsDragging(true)}
        onPointerUp={() => setIsDragging(false)}
        className="relative z-10"
      />
      
      {/* Checkpoints overlay */}
      <div className="absolute left-0 right-0 top-6 h-2 pointer-events-none px-2.5">
        {checkpoints.map((cp, i) => {
          const percent = ((cp.value - min) / (max - min)) * 100;
          const isReached = value >= cp.value;
          const isNear = Math.abs(value - cp.value) <= snapThreshold;
          const isCurrent = value === cp.value;

          let colorClass = "bg-muted-foreground/30";
          let shadowClass = "";
          let scaleClass = "scale-100";

          if (isCurrent || isNear) {
            scaleClass = "scale-125";
            if (phase === "maternity") {
              colorClass = "bg-purple-500";
              shadowClass = "shadow-[0_0_8px_rgba(168,85,247,0.8)]";
            } else if (phase === "puberty") {
              colorClass = "bg-pink-500";
              shadowClass = "shadow-[0_0_8px_rgba(236,72,153,0.6)]";
            } else if (phase === "family_planning") {
              colorClass = "bg-teal-500";
              shadowClass = "shadow-[0_0_8px_rgba(20,184,166,0.6)]";
            } else {
               colorClass = "bg-primary";
            }
          } else if (isReached) {
            if (phase === "maternity") {
               colorClass = "bg-purple-400";
            } else if (phase === "puberty") {
               colorClass = "bg-pink-400";
            } else if (phase === "family_planning") {
               colorClass = "bg-teal-400";
            } else {
               colorClass = "bg-primary";
            }
          }

          return (
            <div
              key={i}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
              style={{ left: `${percent}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  colorClass,
                  shadowClass,
                  scaleClass
                )}
              />
              <span className={cn(
                "absolute top-4 text-[10px] whitespace-nowrap transition-colors",
                isCurrent || isNear ? "text-foreground font-bold" : isReached ? "text-foreground font-medium" : "text-muted-foreground/70"
              )}>
                {cp.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
