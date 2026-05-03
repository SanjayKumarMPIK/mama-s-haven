/**
 * PrematureRecoveryTimeline.tsx
 *
 * Horizontal milestone-progression timeline for Premature Dashboard.
 * Displays 7 adaptive recovery phases as connected nodes in a left-to-right
 * journey layout with an active-phase content panel below.
 */

import { CheckCircle2, Circle } from "lucide-react";
import type { PrematureTimelinePhase } from "@/modules/premature/recovery/usePrematureRecovery";

interface PrematureRecoveryTimelineProps {
  phases: PrematureTimelinePhase[];
  currentPhase: PrematureTimelinePhase | null;
}

export default function PrematureRecoveryTimeline({ phases, currentPhase }: PrematureRecoveryTimelineProps) {
  return (
    <div className="prem-htl-root">
      {/* ── Horizontal scrollable track ── */}
      <div className="prem-htl-scroll">
        <div className="prem-htl-track">
          {/* Background rail */}
          <div className="prem-htl-rail" />

          {/* Filled progress rail */}
          {(() => {
            const currentIdx = phases.findIndex(p => p.status === "current");
            const filledIdx = currentIdx >= 0 ? currentIdx : phases.filter(p => p.status === "completed").length - 1;
            const totalSegments = phases.length - 1;
            const fillPercent = totalSegments > 0
              ? ((filledIdx + (currentPhase?.progress || 0) / 100) / totalSegments) * 100
              : 0;
            return (
              <div
                className="prem-htl-rail-fill"
                style={{ width: `${Math.min(100, Math.max(0, fillPercent))}%` }}
              />
            );
          })()}

          {/* Phase nodes */}
          <div className="prem-htl-nodes">
            {phases.map((phase) => {
              const isCompleted = phase.status === "completed";
              const isCurrent = phase.status === "current";

              return (
                <div key={phase.id} className="prem-htl-node-col">
                  {/* Circle node */}
                  <div
                    className={`prem-htl-circle ${
                      isCompleted ? "completed" :
                      isCurrent ? "current" :
                      "upcoming"
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />}
                    {isCurrent && <Circle className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white fill-white" />}
                  </div>

                  {/* Phase label */}
                  <span className={`prem-htl-phase-num ${
                    isCompleted ? "completed" : isCurrent ? "current" : "upcoming"
                  }`}>
                    P{phase.phaseNumber}
                  </span>
                  <p className={`prem-htl-label ${
                    isCompleted ? "completed" : isCurrent ? "current" : "upcoming"
                  }`}>
                    {phase.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Active phase content panel ── */}
      {currentPhase && (
        <div className="prem-htl-panel">
          <div className="prem-htl-panel-header">
            <span className="prem-htl-panel-badge">Phase {currentPhase.phaseNumber}</span>
            <h4 className="prem-htl-panel-title">{currentPhase.label}</h4>
            {currentPhase.progress > 0 && (
              <span className="prem-htl-panel-progress">{currentPhase.progress}%</span>
            )}
          </div>

          <p className="prem-htl-panel-desc">{currentPhase.detailedContent}</p>

          {currentPhase.focusAreas.length > 0 && (
            <div className="prem-htl-focus">
              <span className="prem-htl-focus-label">Focus</span>
              <div className="prem-htl-focus-list">
                {currentPhase.focusAreas.map((area, i) => (
                  <span key={i} className="prem-htl-focus-chip">{area}</span>
                ))}
              </div>
            </div>
          )}

          {/* Progress bar */}
          {currentPhase.progress > 0 && (
            <div className="prem-htl-prog-wrap">
              <div className="prem-htl-prog-bg">
                <div className="prem-htl-prog-fill" style={{ width: `${currentPhase.progress}%` }} />
              </div>
              <span className="prem-htl-prog-text">
                Week {currentPhase.weekStart}–{currentPhase.weekEnd}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
