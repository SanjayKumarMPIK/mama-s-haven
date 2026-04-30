export interface PostpartumMilestone {
  week: number;
  title: string;
  description: string;
  tags: string[];
  recommendations: string[];
}

export const postpartumMilestones: PostpartumMilestone[] = [
  {
    week: 1,
    title: "Initial Recovery",
    description: "Focus on rest, hydration, and bonding with your baby. Your body is beginning the healing process.",
    tags: ["Rest", "Hydration", "Bonding"],
    recommendations: [
      "Sleep when the baby sleeps",
      "Drink at least 8 glasses of water daily",
      "Keep physical activity to a minimum"
    ]
  },
  {
    week: 2,
    title: "Early Healing",
    description: "Incision healing begins, energy levels may start to improve. Continue prioritizing rest and nutrition.",
    tags: ["Nutrition", "Gentle Movement", "Healing"],
    recommendations: [
      "Start short, gentle walks inside the home",
      "Focus on nutrient-dense, warm meals",
      "Monitor any pain or swelling closely"
    ]
  },
  {
    week: 3,
    title: "Body Stabilizing",
    description: "Physical recovery continues. Bleeding decreases, and you may feel more capable of light activities.",
    tags: ["Light Activity", "Emotional Check-in"],
    recommendations: [
      "Gradually increase walk duration if comfortable",
      "Check in on your mood and stress levels",
      "Ask for help with household chores"
    ]
  },
  {
    week: 5,
    title: "Recovery Checkpoint",
    description: "Important milestone for postpartum checkup. Discuss breastfeeding, emotional health, and physical recovery.",
    tags: ["Doctor Visit", "Breastfeeding", "Wellness"],
    recommendations: [
      "Prepare questions for your 6-week postpartum checkup",
      "Discuss any lingering pain or emotional struggles",
      "Evaluate and adjust feeding routines as needed"
    ]
  },
  {
    week: 7,
    title: "Strength Building",
    description: "Gradually increase activity levels. Pelvic floor exercises and gentle stretching can begin.",
    tags: ["Pelvic Floor", "Stretching", "Strength"],
    recommendations: [
      "Begin gentle pelvic floor exercises (Kegels)",
      "Incorporate light, restorative stretching",
      "Continue prioritizing hydration and protein"
    ]
  },
  {
    week: 9,
    title: "Strong Recovery",
    description: "Most physical recovery complete. Focus on building strength, emotional wellness, and establishing routines.",
    tags: ["Routine", "Strength", "Wellness"],
    recommendations: [
      "Establish a consistent, manageable daily routine",
      "Gradually return to moderate activities if medically cleared",
      "Prioritize self-care moments and mental wellness"
    ]
  }
];

export function getMilestoneForWeek(week: number): PostpartumMilestone {
  const sorted = [...postpartumMilestones].sort((a, b) => b.week - a.week);
  for (const m of sorted) {
    if (week >= m.week) return m;
  }
  return postpartumMilestones[0];
}
