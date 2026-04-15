import { cn } from "@/lib/utils";
import { type HealthLogEntry, type MaternityEntry } from "@/hooks/useHealthLog";
import { Lock, FileText, Stethoscope, Activity } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMaternitySymptomCount(entry: HealthLogEntry | undefined): number {
  if (!entry || entry.phase !== "maternity") return 0;
  if (!entry.symptoms) return 0;
  return Object.values(entry.symptoms).filter(Boolean).length;
}

function hasMaternityData(entry: HealthLogEntry | undefined): boolean {
  if (!entry || entry.phase !== "maternity") return false;
  const e = entry as MaternityEntry;
  if (getMaternitySymptomCount(entry) > 0) return true;
  if (e.mood) return true;
  if (e.notes) return true;
  if (e.sleepHours !== null) return true;
  return false;
}

function getMaternityIndicators(entry: HealthLogEntry | undefined) {
  if (!entry || entry.phase !== "maternity") return { symptoms: false, notes: false, appointments: false };
  const e = entry as MaternityEntry;
  return {
    symptoms: getMaternitySymptomCount(entry) > 0,
    notes: !!(e.notes && e.notes.trim()),
    appointments: false, // placeholder for future appointment tracking
  };
}

function getSeverityColor(entry: HealthLogEntry | undefined): string {
  if (!entry || entry.phase !== "maternity") return "";
  const count = getMaternitySymptomCount(entry);
  const e = entry as MaternityEntry;
  if (e.fatigueLevel === "High" || count >= 4) return "bg-rose-500";
  if (count >= 2) return "bg-amber-400";
  if (count >= 1) return "bg-purple-400";
  return "bg-blue-300";
}

// ─── Component ────────────────────────────────────────────────────────────────

interface MaternityDayCellProps {
  dateISO: string;
  todayISO: string;
  entry: HealthLogEntry | undefined;
  isSelected: boolean;
  isMiniView?: boolean;
  onClick: (dateISO: string) => void;
}

export function MaternityDayCell({
  dateISO,
  todayISO,
  entry,
  isSelected,
  isMiniView = false,
  onClick,
}: MaternityDayCellProps) {
  const isFuture = dateISO > todayISO;
  const isToday = dateISO === todayISO;
  const hasData = hasMaternityData(entry);
  const indicators = getMaternityIndicators(entry);
  const sympCount = getMaternitySymptomCount(entry);
  const sevColor = getSeverityColor(entry);

  if (isMiniView) {
    return (
      <button
        type="button"
        title={isFuture ? "Future date" : hasData ? `Logged: ${sympCount} symptom(s)` : undefined}
        disabled={isFuture}
        onClick={() => !isFuture && onClick(dateISO)}
        className={cn(
          "relative h-7 w-full rounded-md flex flex-col items-center justify-center transition-all",
          isFuture
            ? "text-muted-foreground/30 cursor-not-allowed"
            : isSelected
            ? "bg-blue-100 ring-2 ring-blue-400/40"
            : "hover:bg-muted/50",
          isToday ? "font-extrabold text-blue-600" : isFuture ? "" : "text-foreground"
        )}
      >
        <span className="text-[11px] leading-none">{Number(dateISO.slice(-2))}</span>
        {hasData && (
          <span className={cn("absolute bottom-0.5 w-1.5 h-1.5 rounded-full", sevColor)} />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isFuture}
      onClick={() => !isFuture && onClick(dateISO)}
      className={cn(
        "relative h-14 sm:h-16 w-full border-b border-r border-border/20 flex flex-col items-center justify-center transition-all text-sm font-medium",
        isFuture
          ? "text-muted-foreground/30 cursor-not-allowed bg-muted/10"
          : hasData
          ? "bg-blue-50/50 hover:bg-blue-100/60 cursor-pointer"
          : "hover:bg-muted/55 cursor-pointer",
        isSelected ? "bg-blue-100 ring-2 ring-inset ring-blue-500/50" : "",
        isToday ? "font-extrabold text-blue-600" : ""
      )}
    >
      {isFuture && (
        <Lock className="absolute top-1 right-1 w-2.5 h-2.5 text-muted-foreground/20" />
      )}
      {isToday ? (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "" : "border-2 border-blue-500"}`}>
            <span className="text-sm font-extrabold text-blue-600">{Number(dateISO.slice(-2))}</span>
          </span>
        </span>
      ) : (
        <span className={isSelected ? "text-blue-600 font-bold" : ""}>{Number(dateISO.slice(-2))}</span>
      )}

      {/* Indicator dots row */}
      <div className="absolute bottom-1 flex items-center gap-0.5">
        {indicators.symptoms && (
          <span className={cn("w-2 h-2 rounded-full", sevColor)} title="Symptoms logged" />
        )}
        {indicators.notes && (
          <span className="w-2 h-2 rounded-full bg-indigo-400" title="Notes" />
        )}
      </div>

      {sympCount > 0 && (
        <span className="absolute top-1 right-1.5 text-[9px] text-muted-foreground font-semibold">
          {sympCount}
        </span>
      )}
    </button>
  );
}

export { getMaternitySymptomCount, hasMaternityData };
