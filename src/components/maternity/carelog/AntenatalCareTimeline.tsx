// ─── Antenatal Care Timeline Component ─────────────────────────────────────────
// Reusable ANC timeline for maternity care log

import { Calendar, CheckCircle2 } from "lucide-react";
import type { ANCVisit } from "@/lib/pregnancyDashboardData";

interface ANCVisitWithStatus extends ANCVisit {
  completed: boolean;
  isCurrent?: boolean;
  isPast?: boolean;
  isUpcoming?: boolean;
}

interface AntenatalCareTimelineProps {
  ancWithStatus: ANCVisitWithStatus[];
  nextANC?: ANCVisitWithStatus;
  ancCompletedCount: number;
  toggleANC: (visitId: string) => void;
  className?: string;
}

export default function AntenatalCareTimeline({
  ancWithStatus,
  nextANC,
  ancCompletedCount,
  toggleANC,
  className = "",
}: AntenatalCareTimelineProps) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lavender flex items-center justify-center">
            <Calendar className="w-4 h-4 text-lavender-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-sm">Antenatal Care Visits</h2>
            <p className="text-[10px] text-muted-foreground">{ancCompletedCount}/8 visits completed • NHM Guidelines</p>
          </div>
        </div>
      </div>

      {/* Next visit highlight */}
      {nextANC && !nextANC.completed && (
        <div className="mb-4 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-semibold text-primary">Next Visit — Week {nextANC.week}</p>
          </div>
          <p className="text-sm font-semibold">{nextANC.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{nextANC.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {nextANC.tests.slice(0, 4).map((t, i) => (
              <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{t}</span>
            ))}
            {nextANC.tests.length > 4 && (
              <span className="text-[10px] text-muted-foreground">+{nextANC.tests.length - 4} more</span>
            )}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-0">
        {ancWithStatus.map((visit, i) => (
          <div key={visit.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => toggleANC(visit.id)}
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                  visit.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : visit.isCurrent
                    ? "bg-primary/10 border-primary text-primary animate-pulse-glow"
                    : "bg-muted border-border text-muted-foreground"
                }`}
                title={visit.completed ? "Mark incomplete" : "Mark complete"}
              >
                {visit.completed ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className="text-[10px] font-bold">{i + 1}</span>
                )}
              </button>
              {i < ancWithStatus.length - 1 && (
                <div className={`w-0.5 flex-1 min-h-[2rem] ${visit.completed ? "bg-green-300" : "bg-border"}`} />
              )}
            </div>
            {/* Visit card */}
            <div className={`flex-1 pb-4 ${i === ancWithStatus.length - 1 ? "" : ""}`}>
              <div className="flex items-center gap-2">
                <p className={`text-xs font-semibold ${visit.completed ? "text-green-600" : visit.isCurrent ? "text-primary" : "text-foreground"}`}>
                  {visit.title}
                </p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  visit.completed ? "bg-green-100 text-green-700" : visit.isCurrent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  Wk {visit.week}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{visit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
