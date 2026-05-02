export interface PostpartumMilestone {
  weekStart: number;
  weekEnd: number;
  title: string;
  description: string;
  tags: string[];
  recommendations: string[];
}

export const postpartumMilestones: PostpartumMilestone[] = [
  {
    weekStart: 1,
    weekEnd: 1,
    title: "Initial Recovery",
    description: "Focus on bleeding recovery, fatigue management, hydration, and bonding with your baby.",
    tags: ["Bleeding Recovery", "Fatigue", "Hydration", "Bonding"],
    recommendations: [
      "Sleep when the baby sleeps",
      "Drink at least 8 glasses of water daily",
      "Keep physical activity to a minimum",
      "Focus on skin-to-skin bonding with your baby"
    ]
  },
  {
    weekStart: 2,
    weekEnd: 2,
    title: "Healing Stabilization",
    description: "Soreness begins to reduce, feeding rhythm develops, and sleep recovery starts.",
    tags: ["Soreness Reduction", "Feeding Rhythm", "Sleep Recovery"],
    recommendations: [
      "Start short, gentle walks inside the home",
      "Focus on nutrient-dense, warm meals",
      "Establish a feeding schedule that works for you",
      "Monitor any pain or swelling closely"
    ]
  },
  {
    weekStart: 3,
    weekEnd: 4,
    title: "Body Adjustment",
    description: "Hormonal adaptation continues, routines begin to form, and energy levels start to stabilize.",
    tags: ["Hormonal Adaptation", "Routine Building", "Energy Stabilization"],
    recommendations: [
      "Gradually increase walk duration if comfortable",
      "Check in on your mood and stress levels",
      "Begin establishing a daily routine",
      "Ask for help with household chores"
    ]
  },
  {
    weekStart: 5,
    weekEnd: 6,
    title: "Recovery Checkpoint",
    description: "Discomfort reduces noticeably. Focus on emotional balance and rebuilding strength.",
    tags: ["Reduced Discomfort", "Emotional Balance", "Strength Rebuilding"],
    recommendations: [
      "Prepare questions for your 6-week postpartum checkup",
      "Discuss any lingering pain or emotional struggles",
      "Evaluate and adjust feeding routines as needed",
      "Begin light strengthening exercises if cleared by doctor"
    ]
  },
  {
    weekStart: 7,
    weekEnd: 8,
    title: "Strength Building",
    description: "Stamina returns, breastfeeding stabilizes, and mobility improves noticeably.",
    tags: ["Stamina Return", "Breastfeeding Stability", "Mobility Improvement"],
    recommendations: [
      "Begin gentle pelvic floor exercises (Kegels)",
      "Incorporate light, restorative stretching",
      "Continue prioritizing hydration and protein",
      "Gradually increase daily activity levels"
    ]
  },
  {
    weekStart: 9,
    weekEnd: 12,
    title: "Strong Recovery",
    description: "Recovery confidence grows. Body normalization and emotional balance are well underway.",
    tags: ["Recovery Confidence", "Body Normalization", "Emotional Balance"],
    recommendations: [
      "Establish a consistent, manageable daily routine",
      "Gradually return to moderate activities if medically cleared",
      "Prioritize self-care moments and mental wellness",
      "Celebrate how far you have come in your recovery"
    ]
  }
];

export function getMilestoneForWeek(week: number): PostpartumMilestone {
  for (const m of postpartumMilestones) {
    if (week >= m.weekStart && week <= m.weekEnd) return m;
  }
  // If beyond week 12, return the last milestone
  if (week > 12) return postpartumMilestones[postpartumMilestones.length - 1];
  // Fallback to first
  return postpartumMilestones[0];
}
