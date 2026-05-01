/**
 * prematureRecoveryTimeline.ts
 *
 * Premature baby recovery timeline configuration.
 * Defines week-by-week milestones specific to premature baby care,
 * distinct from postpartum maternal recovery timeline.
 */

export interface PrematureRecoveryMilestone {
  week: number;
  label: string;
  description: string;
}

export interface PrematureRecoveryTimelineWeek {
  weekNumber: number;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming";
}

/**
 * Premature baby recovery milestones - NICU-focused timeline
 */
export const PREMATURE_RECOVERY_MILESTONES: PrematureRecoveryMilestone[] = [
  {
    week: 1,
    label: "NICU Stabilization",
    description: "Baby stabilizing in NICU, monitoring vital signs and initial care",
  },
  {
    week: 2,
    label: "Feeding Response",
    description: "Establishing feeding patterns, tube feeding or bottle feeding progress",
  },
  {
    week: 3,
    label: "Weight Gain Tracking",
    description: "Monitoring weight gain trends, adjusting nutrition as needed",
  },
  {
    week: 4,
    label: "Oxygen Support Reduction",
    description: "Gradual reduction of oxygen support as breathing improves",
  },
  {
    week: 5,
    label: "Sleep Pattern Stability",
    description: "Developing more stable sleep patterns and longer rest periods",
  },
  {
    week: 6,
    label: "Development Monitoring",
    description: "Tracking developmental milestones and reflex development",
  },
  {
    week: 8,
    label: "Home Care Preparation",
    description: "Preparing for discharge, learning home care routines",
  },
  {
    week: 12,
    label: "Stable Progress Milestone",
    description: "Significant progress achieved, baby showing stable health indicators",
  },
];

/**
 * Generate the recovery timeline based on current week post-delivery
 */
export function getPrematureRecoveryTimeline(weeksPostDelivery: number): PrematureRecoveryTimelineWeek[] {
  return PREMATURE_RECOVERY_MILESTONES.map(milestone => ({
    weekNumber: milestone.week,
    label: milestone.label,
    description: milestone.description,
    status:
      weeksPostDelivery >= milestone.week + 1 ? "completed" :
      weeksPostDelivery >= milestone.week ? "current" :
      "upcoming",
  }));
}
