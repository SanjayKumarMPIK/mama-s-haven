// ─── Maternity-Specific Tip Dataset ─────────────────────────────────────────────
// Pregnancy tips organized by category, trimester, and week ranges

export type PregnancyTipCategory =
  | "hydration"
  | "sleep"
  | "nutrition"
  | "exercise"
  | "emotional_wellness"
  | "swelling"
  | "baby_development"
  | "scan_reminders"
  | "posture"
  | "breathing"
  | "labor_preparation"
  | "iron_calcium"
  | "movement"
  | "stress_reduction";

export type PregnancyTipSeverity = "low" | "medium" | "high";

export interface PregnancyTip {
  id: string;
  title: string;
  description: string;
  category: PregnancyTipCategory;
  pregnancyWeeks?: number[]; // Specific weeks this tip applies to
  trimester?: 1 | 2 | 3; // Trimester this tip applies to
  symptomTags?: string[]; // Related symptoms (e.g., "nausea", "back_pain")
  severity?: PregnancyTipSeverity;
  priority?: number; // Higher priority tips shown first
}

// ─── Tip Dataset ─────────────────────────────────────────────────────────────────

export const MATERNITY_TIPS: PregnancyTip[] = [
  // ─── Hydration ───────────────────────────────────────────────────────────────
  {
    id: "hydration-1",
    title: "Stay Hydrated",
    description: "Drink 8–10 glasses of water daily to support amniotic fluid levels and prevent constipation.",
    category: "hydration",
    trimester: 1,
    severity: "medium",
    priority: 10,
  },
  {
    id: "hydration-2",
    title: "Morning Hydration",
    description: "Start your day with a glass of warm water with lemon to ease morning nausea.",
    category: "hydration",
    pregnancyWeeks: [5, 6, 7, 8, 9, 10, 11, 12],
    symptomTags: ["nausea"],
    severity: "medium",
    priority: 8,
  },
  {
    id: "hydration-3",
    title: "Increase Fluid Intake",
    description: "Hydration helps support increased blood volume during pregnancy. Aim for 3L daily.",
    category: "hydration",
    trimester: 2,
    severity: "medium",
    priority: 9,
  },
  {
    id: "hydration-4",
    title: "Prevent Dehydration",
    description: "Carry a water bottle everywhere. Dehydration can trigger contractions in late pregnancy.",
    category: "hydration",
    trimester: 3,
    pregnancyWeeks: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    severity: "high",
    priority: 10,
  },

  // ─── Sleep ───────────────────────────────────────────────────────────────────
  {
    id: "sleep-1",
    title: "Rest When Needed",
    description: "Your body is working hard. Listen to fatigue signals and rest when tired.",
    category: "sleep",
    trimester: 1,
    severity: "medium",
    priority: 9,
  },
  {
    id: "sleep-2",
    title: "Left Side Sleeping",
    description: "Start practicing sleeping on your left side to improve blood flow to the baby.",
    category: "sleep",
    pregnancyWeeks: [16, 17, 18, 19, 20],
    severity: "medium",
    priority: 8,
  },
  {
    id: "sleep-3",
    title: "Left Side Position",
    description: "Sleep on your left side to optimize blood flow and reduce pressure on the vena cava.",
    category: "sleep",
    trimester: 3,
    pregnancyWeeks: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    severity: "high",
    priority: 10,
  },
  {
    id: "sleep-4",
    title: "Pillow Support",
    description: "Use pregnancy pillows between your knees and under your belly for better sleep comfort.",
    category: "sleep",
    trimester: 2,
    severity: "low",
    priority: 7,
  },

  // ─── Nutrition ─────────────────────────────────────────────────────────────────
  {
    id: "nutrition-1",
    title: "Small Frequent Meals",
    description: "Small meals may reduce nausea. Eat 5-6 small meals instead of 3 large ones.",
    category: "nutrition",
    pregnancyWeeks: [5, 6, 7, 8, 9, 10, 11, 12],
    symptomTags: ["nausea"],
    severity: "medium",
    priority: 9,
  },
  {
    id: "nutrition-2",
    title: "Protein Intake",
    description: "Include protein in every meal - eggs, lentils, lean meat, dairy for baby's growth.",
    category: "nutrition",
    trimester: 2,
    severity: "medium",
    priority: 8,
  },
  {
    id: "nutrition-3",
    title: "Iron-Rich Foods",
    description: "Include spinach, lentils, and fortified cereals to support increased blood volume.",
    category: "nutrition",
    trimester: 2,
    severity: "medium",
    priority: 9,
  },
  {
    id: "nutrition-4",
    title: "Calcium for Baby",
    description: "Dairy, leafy greens, and fortified foods help build baby's bones and teeth.",
    category: "nutrition",
    trimester: 3,
    severity: "medium",
    priority: 8,
  },
  {
    id: "nutrition-5",
    title: "Fiber for Digestion",
    description: "Whole grains, fruits, and vegetables help prevent pregnancy constipation.",
    category: "nutrition",
    trimester: 2,
    severity: "low",
    priority: 7,
  },

  // ─── Exercise ─────────────────────────────────────────────────────────────────
  {
    id: "exercise-1",
    title: "Gentle Movement",
    description: "Light walking for 20-30 minutes daily helps circulation and mood.",
    category: "exercise",
    trimester: 1,
    severity: "low",
    priority: 7,
  },
  {
    id: "exercise-2",
    title: "Prenatal Yoga",
    description: "Consider prenatal yoga classes to maintain flexibility and reduce back pain.",
    category: "exercise",
    trimester: 2,
    severity: "low",
    priority: 7,
  },
  {
    id: "exercise-3",
    title: "Light Stretching",
    description: "Light stretching helps reduce back tightness as your belly grows.",
    category: "exercise",
    pregnancyWeeks: [16, 17, 18, 19, 20],
    symptomTags: ["back_pain"],
    severity: "medium",
    priority: 8,
  },
  {
    id: "exercise-4",
    title: "Pelvic Floor Exercises",
    description: "Kegel exercises strengthen pelvic muscles for labor and postpartum recovery.",
    category: "exercise",
    trimester: 2,
    severity: "medium",
    priority: 8,
  },
  {
    id: "exercise-5",
    title: "Stay Active",
    description: "Gentle walking helps with labor preparation. Aim for 30 minutes daily.",
    category: "exercise",
    trimester: 3,
    severity: "low",
    priority: 7,
  },

  // ─── Emotional Wellness ───────────────────────────────────────────────────────
  {
    id: "emotional-1",
    title: "Mood Swings",
    description: "Hormonal changes affect mood. Be kind to yourself during emotional moments.",
    category: "emotional_wellness",
    trimester: 1,
    severity: "low",
    priority: 6,
  },
  {
    id: "emotional-2",
    title: "Connect with Others",
    description: "Join pregnancy support groups or connect with other expectant mothers.",
    category: "emotional_wellness",
    trimester: 2,
    severity: "low",
    priority: 6,
  },
  {
    id: "emotional-3",
    title: "Prepare Emotionally",
    description: "Talk to your partner about fears and expectations for labor and parenthood.",
    category: "emotional_wellness",
    trimester: 3,
    pregnancyWeeks: [32, 33, 34, 35, 36],
    severity: "medium",
    priority: 7,
  },
  {
    id: "emotional-4",
    title: "Reduce Anxiety",
    description: "Practice deep breathing or meditation to reduce pregnancy anxiety.",
    category: "emotional_wellness",
    trimester: 2,
    severity: "medium",
    priority: 7,
  },

  // ─── Swelling Management ──────────────────────────────────────────────────────
  {
    id: "swelling-1",
    title: "Elevate Your Feet",
    description: "Elevate your feet when resting to reduce ankle and foot swelling.",
    category: "swelling",
    trimester: 2,
    severity: "low",
    priority: 6,
  },
  {
    id: "swelling-2",
    title: "Manage Swelling",
    description: "Avoid standing for long periods. Elevate feet and wear comfortable shoes.",
    category: "swelling",
    trimester: 3,
    pregnancyWeeks: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    severity: "medium",
    priority: 8,
  },
  {
    id: "swelling-3",
    title: "Reduce Salt Intake",
    description: "Moderate salt intake to help reduce water retention and swelling.",
    category: "swelling",
    trimester: 3,
    severity: "low",
    priority: 6,
  },

  // ─── Baby Development Awareness ─────────────────────────────────────────────────
  {
    id: "baby-1",
    title: "Baby's Heartbeat",
    description: "You may hear your baby's heartbeat at your next prenatal visit around week 12.",
    category: "baby_development",
    pregnancyWeeks: [10, 11, 12],
    severity: "low",
    priority: 6,
  },
  {
    id: "baby-2",
    title: "First Movements",
    description: "You may feel baby's first movements (quickening) between weeks 16-20.",
    category: "baby_development",
    pregnancyWeeks: [16, 17, 18, 19, 20],
    severity: "low",
    priority: 7,
  },
  {
    id: "baby-3",
    title: "Baby's Patterns",
    description: "Notice your baby's movement patterns. Report any decrease in movements.",
    category: "baby_development",
    trimester: 3,
    pregnancyWeeks: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    severity: "high",
    priority: 10,
  },
  {
    id: "baby-4",
    title: "Baby Position",
    description: "Baby starts settling into head-down position around week 34.",
    category: "baby_development",
    pregnancyWeeks: [32, 33, 34, 35, 36],
    severity: "medium",
    priority: 7,
  },

  // ─── Scan Reminders ────────────────────────────────────────────────────────────
  {
    id: "scan-1",
    title: "Dating Scan",
    description: "Your dating scan around week 8-12 confirms your due date and checks for heartbeat.",
    category: "scan_reminders",
    pregnancyWeeks: [8, 9, 10, 11, 12],
    severity: "medium",
    priority: 9,
  },
  {
    id: "scan-2",
    title: "Anomaly Scan",
    description: "The anomaly scan (18-22 weeks) checks baby's development in detail.",
    category: "scan_reminders",
    pregnancyWeeks: [18, 19, 20, 21, 22],
    severity: "medium",
    priority: 9,
  },
  {
    id: "scan-3",
    title: "Growth Scan",
    description: "Growth scans in third trimester monitor baby's size and position.",
    category: "scan_reminders",
    trimester: 3,
    pregnancyWeeks: [28, 32, 36],
    severity: "medium",
    priority: 8,
  },

  // ─── Posture ───────────────────────────────────────────────────────────────────
  {
    id: "posture-1",
    title: "Good Posture",
    description: "Maintain good posture to reduce back strain as your center of gravity shifts.",
    category: "posture",
    trimester: 2,
    severity: "medium",
    priority: 7,
  },
  {
    id: "posture-2",
    title: "Avoid Heavy Lifting",
    description: "Avoid heavy lifting. If you must, lift with your legs, not your back.",
    category: "posture",
    trimester: 2,
    severity: "medium",
    priority: 8,
  },
  {
    id: "posture-3",
    title: "Support Your Back",
    description: "Use chairs with good back support. Consider a lumbar cushion.",
    category: "posture",
    trimester: 3,
    severity: "medium",
    priority: 7,
  },

  // ─── Breathing ─────────────────────────────────────────────────────────────────
  {
    id: "breathing-1",
    title: "Deep Breathing",
    description: "Practice deep breathing exercises to prepare for labor and reduce stress.",
    category: "breathing",
    trimester: 2,
    severity: "low",
    priority: 6,
  },
  {
    id: "breathing-2",
    title: "Labor Breathing",
    description: "Learn labor breathing techniques - slow breathing for early labor, patterned for active labor.",
    category: "breathing",
    trimester: 3,
    pregnancyWeeks: [32, 33, 34, 35, 36],
    severity: "medium",
    priority: 8,
  },

  // ─── Labor Preparation ────────────────────────────────────────────────────────
  {
    id: "labor-1",
    title: "Birth Plan",
    description: "Start thinking about your birth plan preferences around week 32.",
    category: "labor_preparation",
    pregnancyWeeks: [30, 31, 32, 33, 34],
    severity: "medium",
    priority: 7,
  },
  {
    id: "labor-2",
    title: "Hospital Bag",
    description: "Pack your hospital bag by week 36 with essentials for you and baby.",
    category: "labor_preparation",
    pregnancyWeeks: [34, 35, 36],
    severity: "high",
    priority: 9,
  },
  {
    id: "labor-3",
    title: "Labor Signs",
    description: "Learn the difference between Braxton Hicks contractions and true labor signs.",
    category: "labor_preparation",
    pregnancyWeeks: [36, 37, 38],
    severity: "high",
    priority: 10,
  },
  {
    id: "labor-4",
    title: "Watch for Early Labor",
    description: "Watch for early labor signs: regular contractions, water breaking, bloody show.",
    category: "labor_preparation",
    pregnancyWeeks: [38, 39, 40],
    severity: "high",
    priority: 10,
  },

  // ─── Iron/Calcium Awareness ─────────────────────────────────────────────────────
  {
    id: "iron-1",
    title: "Iron Supplements",
    description: "Take iron supplements with vitamin C for better absorption, if prescribed.",
    category: "iron_calcium",
    trimester: 2,
    severity: "medium",
    priority: 8,
  },
  {
    id: "iron-2",
    title: "Calcium Needs",
    description: "Pregnancy requires 1000mg calcium daily. Dairy, almonds, and leafy greens are good sources.",
    category: "iron_calcium",
    trimester: 2,
    severity: "medium",
    priority: 8,
  },
  {
    id: "iron-3",
    title: "Folic Acid",
    description: "Continue folic acid through first trimester for neural tube development.",
    category: "iron_calcium",
    trimester: 1,
    severity: "high",
    priority: 10,
  },

  // ─── Movement Tracking ─────────────────────────────────────────────────────────
  {
    id: "movement-1",
    title: "Kick Counting",
    description: "Start counting baby's movements daily from week 28. 10 movements in 2 hours is normal.",
    category: "movement",
    pregnancyWeeks: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40],
    severity: "high",
    priority: 10,
  },
  {
    id: "movement-2",
    title: "Movement Patterns",
    description: "Learn your baby's active and quiet periods. Report significant changes.",
    category: "movement",
    trimester: 3,
    severity: "high",
    priority: 9,
  },

  // ─── Stress Reduction ───────────────────────────────────────────────────────────
  {
    id: "stress-1",
    title: "Manage Stress",
    description: "High stress can affect pregnancy. Find relaxation techniques that work for you.",
    category: "stress_reduction",
    trimester: 1,
    severity: "medium",
    priority: 7,
  },
  {
    id: "stress-2",
    title: "Prenatal Massage",
    description: "Consider prenatal massage to relieve tension and reduce stress.",
    category: "stress_reduction",
    trimester: 2,
    severity: "low",
    priority: 6,
  },
  {
    id: "stress-3",
    title: "Stay Calm",
    description: "Practice relaxation techniques. A calm mind supports a healthy pregnancy.",
    category: "stress_reduction",
    trimester: 3,
    severity: "medium",
    priority: 7,
  },
];
