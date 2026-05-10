import { cn } from "@/lib/utils";

export type SeverityLabel = "Mild" | "Moderate" | "Severe";

interface PubertySymptomCardProps {
  id: string;
  label: string;
  isActive: boolean;
  severity: SeverityLabel | null;
  onToggle: () => void;
  onSeverityChange: (id: string, severity: SeverityLabel) => void;
}

const SEVERITY_OPTIONS: { key: SeverityLabel; label: string }[] = [
  { key: "Mild", label: "MILD" },
  { key: "Moderate", label: "MODERATE" },
  { key: "Severe", label: "SEVERE" },
];

const SEVERITY_STYLES: Record<SeverityLabel, string> = {
  Mild: "bg-green-100 text-green-700 border-green-300",
  Moderate: "bg-amber-100 text-amber-700 border-amber-300",
  Severe: "bg-red-100 text-red-700 border-red-300",
};

export function PubertySymptomCard({
  id,
  label,
  isActive,
  severity,
  onToggle,
  onSeverityChange,
}: PubertySymptomCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border-2 transition-all overflow-hidden",
        isActive ? "border-blue-500" : "border-border"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full px-3 py-2.5 text-sm font-medium text-left transition-colors flex items-center justify-between",
          isActive ? "bg-blue-50/50" : "bg-card hover:bg-muted/50"
        )}
      >
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "w-3 h-3 rounded-full border-2 shrink-0 transition-colors",
              isActive ? "bg-blue-500 border-blue-500" : "border-muted-foreground/40"
            )}
          />
          {label}
        </span>
        {isActive && severity && (
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
              SEVERITY_STYLES[severity]
            )}
          >
            {severity}
          </span>
        )}
      </button>

      {isActive && (
        <div className="px-3 pb-3 pt-1">
          <div className="flex gap-1.5">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSeverityChange(id, opt.key);
                }}
                className={cn(
                  "flex-1 py-1.5 rounded-full text-xs font-bold border transition-all",
                  severity === opt.key
                    ? SEVERITY_STYLES[opt.key]
                    : "bg-background border-border text-muted-foreground hover:bg-muted/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
