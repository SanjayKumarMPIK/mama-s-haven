import type { Phase } from "@/hooks/usePhase";
import { cn } from "@/lib/utils";

interface PhaseSelectorProps {
  value: Phase;
  onChange: (phase: Phase) => void;
  className?: string;
  labelClassName?: string;
  selectClassName?: string;
}

export default function PhaseSelector({
  value,
  onChange,
  className,
  labelClassName,
  selectClassName,
}: PhaseSelectorProps) {
  return (
    <label className={cn("flex items-center gap-2", className)}>
      <span className={cn("text-xs font-semibold text-muted-foreground", labelClassName)}>Phase</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Phase)}
        className={cn(
          "h-9 rounded-md border border-input bg-background px-2.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selectClassName,
        )}
        aria-label="Select health phase"
      >
        <option value="puberty">Puberty</option>
        <option value="maternity">Maternity</option>
        <option value="family-planning">Family Planning</option>
        <option value="menopause">Menopause</option>
      </select>
    </label>
  );
}
