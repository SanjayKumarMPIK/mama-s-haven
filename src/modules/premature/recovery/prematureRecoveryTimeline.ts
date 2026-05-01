/**
 * prematureRecoveryTimeline.ts
 *
 * Adaptive premature baby recovery timeline with 7 developmental phases.
 * Timeline advancement combines week progress with recovery score modifiers,
 * making progression responsive to actual health signals.
 *
 * ⚠️  Pure functions only — no React, no side-effects.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PrematureTimelinePhase {
  id: string;
  phaseNumber: number;
  label: string;
  weekStart: number;
  weekEnd: number;
  description: string;
  focusAreas: string[];
  detailedContent: string;
  status: "completed" | "current" | "upcoming";
  /** 0–100 progress within this phase */
  progress: number;
}

export interface PrematureRecoveryTimelineWeek {
  weekNumber: number;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

// ─── Phase Definitions ────────────────────────────────────────────────────────

interface PhaseDefinition {
  id: string;
  phaseNumber: number;
  label: string;
  weekStart: number;
  weekEnd: number;
  description: string;
  focusAreas: string[];
  detailedContent: string;
}

const PHASE_DEFINITIONS: PhaseDefinition[] = [
  {
    id: "immediate_stabilization",
    phaseNumber: 1,
    label: "Immediate Stabilization",
    weekStart: 0,
    weekEnd: 1,
    description: "Baby stabilizing in NICU with monitored vital signs",
    focusAreas: ["Breathing adaptation", "Temperature regulation", "NICU stabilization"],
    detailedContent: "Your baby is adapting to the outside world. The NICU team is monitoring breathing, heart rate, and temperature. Kangaroo care and gentle touch help stabilize vital signs during this critical phase.",
  },
  {
    id: "early_adaptation",
    phaseNumber: 2,
    label: "Early Adaptation",
    weekStart: 1,
    weekEnd: 2,
    description: "Building feeding tolerance and initial body regulation",
    focusAreas: ["Feeding tolerance", "Body regulation", "Sleep rhythm"],
    detailedContent: "Baby is beginning to tolerate feeds and developing early sleep-wake cycles. Consistent skin-to-skin contact supports digestive comfort and body temperature regulation.",
  },
  {
    id: "growth_support",
    phaseNumber: 3,
    label: "Growth Support",
    weekStart: 2,
    weekEnd: 4,
    description: "Supporting weight gain and digestive development",
    focusAreas: ["Weight support", "Digestion improvement", "Oxygen stability"],
    detailedContent: "Your baby is improving feeding stability and gaining developmental strength. Focus on consistent feeding patterns, monitoring weight trends, and supporting respiratory comfort.",
  },
  {
    id: "organ_development",
    phaseNumber: 4,
    label: "Organ Development",
    weekStart: 4,
    weekEnd: 6,
    description: "Critical organ maturation and coordination",
    focusAreas: ["Lung development", "Nervous system growth", "Feeding coordination"],
    detailedContent: "Baby's lungs and nervous system are maturing rapidly. Feeding coordination is improving as swallow-breathe-suck patterns strengthen. Reduced oxygen support may be possible.",
  },
  {
    id: "strength_building",
    phaseNumber: 5,
    label: "Strength Building",
    weekStart: 6,
    weekEnd: 8,
    description: "Building immunity and body stability",
    focusAreas: ["Immunity strengthening", "Temperature self-regulation", "Sleep pattern maturity"],
    detailedContent: "Your baby's immune system is getting stronger. Body temperature regulation is improving, and sleep patterns are becoming more predictable. This is a key phase for building resilience.",
  },
  {
    id: "home_readiness",
    phaseNumber: 6,
    label: "Home Readiness",
    weekStart: 8,
    weekEnd: 12,
    description: "Preparing for independent care at home",
    focusAreas: ["Independent feeding", "Reduced medical dependence", "Parent care confidence"],
    detailedContent: "Baby is approaching readiness for home care. Focus on establishing independent feeding, reducing monitoring equipment, and building your confidence as primary caregiver.",
  },
  {
    id: "development_monitoring",
    phaseNumber: 7,
    label: "Development Monitoring",
    weekStart: 12,
    weekEnd: 24,
    description: "Tracking developmental milestones and growth",
    focusAreas: ["Milestone tracking", "Movement development", "Cognitive response"],
    detailedContent: "Your baby has made incredible progress! Now focus on developmental milestones — tracking head control, visual following, responsive smiling, and early movement patterns. Regular pediatric check-ins help ensure continued healthy development.",
  },
];

// ─── Recovery Modifier ────────────────────────────────────────────────────────

/**
 * Recovery modifier adjusts timeline advancement speed
 * based on the recovery score.
 *
 * | Score   | Effect      | Modifier |
 * |---------|-------------|----------|
 * | 85–100  | Accelerate  | 1.20     |
 * | 65–84   | Normal      | 1.00     |
 * | 45–64   | Slower      | 0.80     |
 * | <45     | Delayed     | 0.60     |
 */
function getRecoveryModifier(recoveryScore: number): number {
  if (recoveryScore >= 85) return 1.20;
  if (recoveryScore >= 65) return 1.00;
  if (recoveryScore >= 45) return 0.80;
  return 0.60;
}

// ─── Timeline Generator ──────────────────────────────────────────────────────

/**
 * Generate the adaptive recovery timeline.
 * Combines actual week progress with recovery score modifier.
 *
 * @param weeksPostDelivery - actual weeks since birth
 * @param recoveryScore - 0–100 overall recovery score
 */
export function getPrematureRecoveryTimeline(
  weeksPostDelivery: number,
  recoveryScore: number = 50
): PrematureTimelinePhase[] {
  const modifier = getRecoveryModifier(recoveryScore);

  // Effective weeks = actual weeks adjusted by modifier
  const effectiveWeeks = weeksPostDelivery * modifier;

  return PHASE_DEFINITIONS.map(phase => {
    let status: "completed" | "current" | "upcoming";
    let progress = 0;

    if (effectiveWeeks >= phase.weekEnd) {
      status = "completed";
      progress = 100;
    } else if (effectiveWeeks >= phase.weekStart) {
      status = "current";
      const phaseSpan = phase.weekEnd - phase.weekStart;
      progress = phaseSpan > 0
        ? clamp(((effectiveWeeks - phase.weekStart) / phaseSpan) * 100)
        : 50;
    } else {
      status = "upcoming";
      progress = 0;
    }

    return {
      ...phase,
      status,
      progress,
    };
  });
}

/**
 * Get the currently active phase, or the most recently completed phase.
 */
export function getCurrentPhase(timeline: PrematureTimelinePhase[]): PrematureTimelinePhase | null {
  const current = timeline.find(p => p.status === "current");
  if (current) return current;

  // If all completed, return last one
  const completed = timeline.filter(p => p.status === "completed");
  return completed.length > 0 ? completed[completed.length - 1] : timeline[0] || null;
}

/**
 * Legacy-compatible: flat timeline weeks for existing consumers.
 */
export function getPrematureRecoveryTimelineFlat(weeksPostDelivery: number): PrematureRecoveryTimelineWeek[] {
  const phases = getPrematureRecoveryTimeline(weeksPostDelivery);
  return phases.map(p => ({
    weekNumber: p.weekStart,
    label: p.label,
    description: p.description,
    status: p.status,
  }));
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}
