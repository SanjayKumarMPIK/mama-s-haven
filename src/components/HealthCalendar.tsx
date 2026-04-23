import type { HealthLogs, HealthLogEntry, PubertyEntry, MaternityEntry, FamilyPlanningEntry, MenopauseEntry } from "@/hooks/useHealthLog";
import { usePhase } from "@/hooks/usePhase";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  year: number;
  month: number; // 0-indexed
  logs: HealthLogs;
  selectedDate: string | null;
  onDayClick: (dateISO: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Returns a brief tooltip string from a log entry */
function buildTooltip(entry: HealthLogEntry): string {
  const parts: string[] = [];
  if (entry.phase === "puberty") {
    const e = entry as PubertyEntry;
    if (e.periodStarted) parts.push("Period started");
    if (e.periodEnded) parts.push("Period ended");
    if (e.flowIntensity) parts.push(`Flow: ${e.flowIntensity}`);
    if ((e as any).bloodColor) parts.push(`Color: ${(e as any).bloodColor}`);
    const sx = Object.entries(e.symptoms)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").trim());
    parts.push(...sx);
    if (e.mood) parts.push(`Mood: ${e.mood}`);
  } else if (entry.phase === "maternity") {
    const e = entry as MaternityEntry;
    if (e.fatigueLevel) parts.push(`Fatigue: ${e.fatigueLevel}`);
    const sx = Object.entries(e.symptoms)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").trim());
    parts.push(...sx);
    if (e.mood) parts.push(`Mood: ${e.mood}`);
  } else if (entry.phase === "family-planning") {
    const e = entry as FamilyPlanningEntry;
    if (e.sleepHours) parts.push(`Sleep: ${e.sleepHours}h`);
    if (e.mood) parts.push(`Mood: ${e.mood}`);
    if (e.cycleLength) parts.push(`Cycle: ${e.cycleLength}d`);
    if ((e as any).bloodColor) parts.push(`Color: ${(e as any).bloodColor}`);
    if (e.symptoms.ovulationPain) parts.push("Ovulation pain");
    if (e.symptoms.moodChanges) parts.push("Mood changes");
    if (e.symptoms.irregularCycle) parts.push("Irregular cycle");
    if (e.symptoms.fatigue) parts.push("Fatigue");
    if (e.symptoms.stress) parts.push("Stress");
    if (e.symptoms.sleepIssues) parts.push("Sleep issues");
  } else if (entry.phase === "menopause") {
    const e = entry as MenopauseEntry;
    const sx = Object.entries(e.symptoms)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").trim());
    parts.push(...sx);
    if (e.mood) parts.push(`Mood: ${e.mood}`);
  }
  return parts.length ? `Logged: ${parts.slice(0, 3).join(", ")}${parts.length > 3 ? "…" : ""}` : "Logged";
}

/** Phase-specific dot colors */
const PHASE_DOT: Record<string, string> = {
  puberty: "bg-pink-400",
  maternity: "bg-purple-400",
  "family-planning": "bg-teal-400",
  menopause: "bg-amber-400",
};

export default function HealthCalendar({ year, month, logs, selectedDate, onDayClick, onPrev, onNext }: Props) {
  const { phase } = usePhase();
  const todayISO = new Date().toISOString().slice(0, 10);

  // Build calendar cells
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to fill last row
  while (cells.length % 7 !== 0) cells.push(null);

  function toISO(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <button
          type="button"
          onClick={onPrev}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h2 className="text-base font-bold">
          {MONTH_NAMES[month]} {year}
        </h2>
        <button
          type="button"
          onClick={onNext}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted border border-border/40 transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border/40">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="h-12 sm:h-14 border-b border-r border-border/20" />;
          }
          const iso = toISO(day);
          const isToday = iso === todayISO;
          const isSelected = iso === selectedDate;
          const entry = logs[iso];
          const isFuture = iso > todayISO;
          const tooltip = entry ? buildTooltip(entry) : undefined;
          const dotColor = entry ? (PHASE_DOT[entry.phase] ?? "bg-primary") : null;

          return (
            <button
              key={iso}
              type="button"
              disabled={isFuture}
              title={tooltip}
              onClick={() => !isFuture && onDayClick(iso)}
              className={[
                "relative h-12 sm:h-14 flex flex-col items-center justify-center border-b border-r border-border/20 transition-all text-sm font-medium",
                isFuture ? "text-muted-foreground/40 cursor-default" : "cursor-pointer hover:bg-muted/60",
                isSelected ? "bg-primary/10 ring-2 ring-inset ring-primary/50" : "",
                isToday && !isSelected ? "font-extrabold" : "",
              ].join(" ")}
              aria-label={`${iso}${entry ? " (logged)" : ""}`}
            >
              {/* Today ring */}
              {isToday && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelected ? "" : "border-2 border-primary"}`}>
                    <span className="text-sm font-extrabold text-primary">{day}</span>
                  </span>
                </span>
              )}
              {!isToday && <span className={isSelected ? "text-primary font-bold" : ""}>{day}</span>}

              {/* Logged dot */}
              {dotColor && (
                <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${dotColor}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-border/40 flex items-center gap-4 flex-wrap">
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className={`w-2 h-2 rounded-full ${PHASE_DOT[phase] ?? "bg-primary"}`} />
          Day logged
        </span>
        <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="w-6 h-5 rounded-full border-2 border-primary inline-flex items-center justify-center text-[9px] font-bold text-primary">
            {new Date().getDate()}
          </span>
          Today
        </span>
        <span className="text-[10px] text-muted-foreground">Click any past day to log or edit</span>
      </div>
    </div>
  );
}
