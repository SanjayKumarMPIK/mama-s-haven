export interface ActivityItem {
  id: string;
  activity: string;
  category: string;
  intensity: 'Very Low' | 'Low' | 'Moderate';
  benefit: string;
  targetArea: string;
  caloriesBurned: string;
  duration: string;
  stages: string[];
  themes: string[];
  /** Optional — defaults supplied in scheduler utils when missing */
  safetyTip?: string;
  description?: string;
  icon?: string;
}

export const maternityActivitiesData: ActivityItem[] = [
  // --- Trimester 1 Activities ---

  // Mobility Week
  {
    id: 'slow-morning-walk',
    activity: 'Slow Morning Walk',
    category: 'Walking & Cardio',
    intensity: 'Low',
    benefit: 'Improves circulation and energy',
    targetArea: 'Legs, Heart',
    caloriesBurned: '80–110 kcal',
    duration: '20 min',
    stages: ['Trimester 1'],
    themes: ['Mobility Week']
  },
  {
    id: 'morning-energy-stretch',
    activity: 'Morning Energy Stretch',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Reduces stiffness and improves flexibility',
    targetArea: 'Full Body',
    caloriesBurned: '20–40 kcal',
    duration: '15 min',
    stages: ['Trimester 1'],
    themes: ['Mobility Week']
  },
  {
    id: 'prenatal-neck-shoulder-stretch',
    activity: 'Prenatal Neck & Shoulder Stretch',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Relieves upper-body tension',
    targetArea: 'Neck, Shoulders',
    caloriesBurned: '15–25 kcal',
    duration: '10 min',
    stages: ['Trimester 1'],
    themes: ['Mobility Week']
  },
  {
    id: 'guided-joint-mobility',
    activity: 'Guided Joint Mobility',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Improves flexibility',
    targetArea: 'Full Body Joints',
    caloriesBurned: '25–40 kcal',
    duration: '15 min',
    stages: ['Trimester 1'],
    themes: ['Mobility Week']
  },
  {
    id: 'gentle-prenatal-yoga',
    activity: 'Gentle Prenatal Yoga',
    category: 'Yoga',
    intensity: 'Low',
    benefit: 'Improves mobility and calmness',
    targetArea: 'Core, Hips, Back',
    caloriesBurned: '50–90 kcal',
    duration: '20 min',
    stages: ['Trimester 1'],
    themes: ['Mobility Week']
  },
  {
    id: 'pelvic-tilts',
    activity: 'Pelvic Tilts',
    category: 'Pelvic Health',
    intensity: 'Low',
    benefit: 'Supports lower-back comfort',
    targetArea: 'Pelvis, Lower Back',
    caloriesBurned: '20–35 kcal',
    duration: '10 min',
    stages: ['Trimester 1', 'Postpartum'],
    themes: ['Mobility Week', 'Pelvic Health Week']
  },
  {
    id: 'cat-cow-stretch',
    activity: 'Cat-Cow Stretch',
    category: 'Yoga',
    intensity: 'Low',
    benefit: 'Reduces spinal pressure',
    targetArea: 'Spine, Pelvis',
    caloriesBurned: '20–30 kcal',
    duration: '10 min',
    stages: ['Trimester 1', 'Trimester 3'],
    themes: ['Mobility Week', 'Labor Prep Week']
  },

  // Relaxation Week
  {
    id: 'deep-belly-breathing',
    activity: 'Deep Belly Breathing',
    category: 'Breathing & Relaxation',
    intensity: 'Low',
    benefit: 'Reduces stress and nausea',
    targetArea: 'Lungs, Nervous System',
    caloriesBurned: '10–15 kcal',
    duration: '5 min',
    stages: ['Trimester 1', 'Trimester 3'],
    themes: ['Relaxation Week']
  },
  {
    id: 'guided-deep-breathing',
    activity: 'Guided Deep Breathing',
    category: 'Breathing & Relaxation',
    intensity: 'Low',
    benefit: 'Improves oxygen flow',
    targetArea: 'Respiratory System',
    caloriesBurned: '10–20 kcal',
    duration: '8 min',
    stages: ['Trimester 1', 'Premature Stage'],
    themes: ['Relaxation Week']
  },
  {
    id: 'relaxation-yoga-session',
    activity: 'Relaxation Yoga Session',
    category: 'Yoga',
    intensity: 'Low',
    benefit: 'Supports calmness and sleep',
    targetArea: 'Full Body',
    caloriesBurned: '50–90 kcal',
    duration: '20 min',
    stages: ['Trimester 1', 'Trimester 3'],
    themes: ['Relaxation Week']
  },
  {
    id: 'body-scan-relaxation',
    activity: 'Body Scan Relaxation',
    category: 'Breathing & Relaxation',
    intensity: 'Very Low',
    benefit: 'Releases tension',
    targetArea: 'Nervous System',
    caloriesBurned: '5–15 kcal',
    duration: '10 min',
    stages: ['Trimester 1', 'Trimester 3', 'Premature Stage'],
    themes: ['Relaxation Week']
  },
  {
    id: 'chair-relaxation-stretch',
    activity: 'Chair Relaxation Stretch',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Relaxes muscles safely',
    targetArea: 'Back, Neck',
    caloriesBurned: '15–30 kcal',
    duration: '15 min',
    stages: ['Trimester 1'],
    themes: ['Relaxation Week']
  },
  {
    id: 'slow-recovery-walk',
    activity: 'Slow Recovery Walk',
    category: 'Walking & Cardio',
    intensity: 'Low',
    benefit: 'Gentle circulation improvement',
    targetArea: 'Legs, Circulation',
    caloriesBurned: '60–90 kcal',
    duration: '20 min',
    stages: ['Trimester 1'],
    themes: ['Relaxation Week']
  },

  // --- Trimester 2 Activities ---

  // Strength & Stability Week
  {
    id: 'resistance-band-arm-workout',
    activity: 'Resistance Band Arm Workout',
    category: 'Strength & Stability',
    intensity: 'Moderate',
    benefit: 'Builds upper-body support',
    targetArea: 'Arms, Shoulders',
    caloriesBurned: '60–100 kcal',
    duration: '20 min',
    stages: ['Trimester 2'],
    themes: ['Strength & Stability Week']
  },
  {
    id: 'standing-leg-raises',
    activity: 'Standing Leg Raises',
    category: 'Strength & Stability',
    intensity: 'Moderate',
    benefit: 'Improves hip balance',
    targetArea: 'Legs, Hips',
    caloriesBurned: '40–60 kcal',
    duration: '15 min',
    stages: ['Trimester 2'],
    themes: ['Strength & Stability Week']
  },
  {
    id: 'balance-practice-routine',
    activity: 'Balance Practice Routine',
    category: 'Strength & Stability',
    intensity: 'Low',
    benefit: 'Improves body stability',
    targetArea: 'Core, Legs',
    caloriesBurned: '30–50 kcal',
    duration: '15 min',
    stages: ['Trimester 2'],
    themes: ['Strength & Stability Week']
  },
  {
    id: 'stair-walking',
    activity: 'Stair Walking',
    category: 'Walking & Cardio',
    intensity: 'Moderate',
    benefit: 'Builds endurance / Improves stamina',
    targetArea: 'Legs, Glutes, Heart',
    caloriesBurned: '100–150 kcal',
    duration: '20 min',
    stages: ['Trimester 2'],
    themes: ['Strength & Stability Week', 'Cardio Wellness Week']
  },
  {
    id: 'light-resistance-workout',
    activity: 'Light Resistance Workout',
    category: 'Strength & Stability',
    intensity: 'Moderate',
    benefit: 'Maintains muscle strength',
    targetArea: 'Full Body',
    caloriesBurned: '70–120 kcal',
    duration: '20 min',
    stages: ['Trimester 2'],
    themes: ['Strength & Stability Week']
  },
  {
    id: 'supported-squats',
    activity: 'Supported Squats',
    category: 'Strength & Stability',
    intensity: 'Moderate',
    benefit: 'Strengthens hips and legs',
    targetArea: 'Glutes, Legs',
    caloriesBurned: '50–80 kcal',
    duration: '15 min',
    stages: ['Trimester 2'],
    themes: ['Strength & Stability Week']
  },

  // Cardio Wellness Week
  {
    id: 'brisk-walking',
    activity: 'Brisk Walking',
    category: 'Walking & Cardio',
    intensity: 'Moderate',
    benefit: 'Supports cardiovascular health',
    targetArea: 'Legs, Heart',
    caloriesBurned: '120–180 kcal',
    duration: '30 min',
    stages: ['Trimester 2'],
    themes: ['Cardio Wellness Week']
  },
  {
    id: 'swimming-water-walk',
    activity: 'Swimming / Water Walk',
    category: 'Water-Based Movement',
    intensity: 'Moderate',
    benefit: 'Low-impact cardio',
    targetArea: 'Full Body',
    caloriesBurned: '140–220 kcal',
    duration: '30 min',
    stages: ['Trimester 2'],
    themes: ['Cardio Wellness Week']
  },
  {
    id: 'indoor-walking-routine',
    activity: 'Indoor Walking Routine',
    category: 'Walking & Cardio',
    intensity: 'Low',
    benefit: 'Improves circulation',
    targetArea: 'Legs',
    caloriesBurned: '70–100 kcal',
    duration: '15 min',
    stages: ['Trimester 2'],
    themes: ['Cardio Wellness Week']
  },
  {
    id: 'light-dance-movement',
    activity: 'Light Dance Movement',
    category: 'Walking & Cardio',
    intensity: 'Moderate',
    benefit: 'Boosts mood and endurance',
    targetArea: 'Full Body',
    caloriesBurned: '90–140 kcal',
    duration: '20 min',
    stages: ['Trimester 2'],
    themes: ['Cardio Wellness Week']
  },

  // --- Trimester 3 Activities ---

  // Labor Prep Week
  {
    id: 'birth-ball-pelvic-circles',
    activity: 'Birth Ball Pelvic Circles',
    category: 'Labor Preparation',
    intensity: 'Low',
    benefit: 'Improves pelvic mobility',
    targetArea: 'Hips, Pelvis',
    caloriesBurned: '35–60 kcal',
    duration: '15 min',
    stages: ['Trimester 3'],
    themes: ['Labor Prep Week']
  },
  {
    id: 'pelvic-floor-strengthening',
    activity: 'Pelvic Floor Strengthening',
    category: 'Pelvic Health',
    intensity: 'Low',
    benefit: 'Prepares labor muscles',
    targetArea: 'Pelvic Floor',
    caloriesBurned: '20–40 kcal',
    duration: '10 min',
    stages: ['Trimester 3'],
    themes: ['Labor Prep Week']
  },
  {
    id: 'labor-breathing-practice',
    activity: 'Labor Breathing Practice',
    category: 'Breathing & Relaxation',
    intensity: 'Low',
    benefit: 'Improves breathing control',
    targetArea: 'Lungs, Core',
    caloriesBurned: '10–20 kcal',
    duration: '10 min',
    stages: ['Trimester 3'],
    themes: ['Labor Prep Week']
  },
  {
    id: 'supported-gentle-squats',
    activity: 'Supported Gentle Squats',
    category: 'Strength & Stability',
    intensity: 'Moderate',
    benefit: 'Opens hips for labor',
    targetArea: 'Glutes, Pelvis',
    caloriesBurned: '50–80 kcal',
    duration: '15 min',
    stages: ['Trimester 3'],
    themes: ['Labor Prep Week']
  },
  {
    id: 'hip-opening-stretch',
    activity: 'Hip Opening Stretch',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Improves pelvic flexibility / Reduces stiffness',
    targetArea: 'Hips, Pelvis',
    caloriesBurned: '20–35 kcal',
    duration: '10 min',
    stages: ['Trimester 3', 'Postpartum'],
    themes: ['Labor Prep Week', 'Pelvic Health Week']
  },

  // Relaxation Week
  {
    id: 'chair-stretching-routine',
    activity: 'Chair Stretching Routine',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Safe stretching support',
    targetArea: 'Back, Legs',
    caloriesBurned: '20–35 kcal',
    duration: '15 min',
    stages: ['Trimester 3'],
    themes: ['Relaxation Week']
  },
  {
    id: 'slow-comfort-walk',
    activity: 'Slow Comfort Walk',
    category: 'Walking & Cardio',
    intensity: 'Low',
    benefit: 'Improves circulation',
    targetArea: 'Legs, Heart',
    caloriesBurned: '70–100 kcal',
    duration: '20 min',
    stages: ['Trimester 3'],
    themes: ['Relaxation Week']
  },

  // --- Premature Activities ---

  // Recovery Week
  {
    id: 'bedside-stretch-routine',
    activity: 'Bedside Stretch Routine',
    category: 'Recovery Activities',
    intensity: 'Very Low',
    benefit: 'Prevents stiffness',
    targetArea: 'Arms, Legs',
    caloriesBurned: '10–20 kcal',
    duration: '10 min',
    stages: ['Premature Stage'],
    themes: ['Recovery Week']
  },
  {
    id: 'foot-rotation-exercise',
    activity: 'Foot Rotation Exercise',
    category: 'Recovery Activities',
    intensity: 'Very Low',
    benefit: 'Improves circulation',
    targetArea: 'Ankles, Feet',
    caloriesBurned: '5–15 kcal',
    duration: '5 min',
    stages: ['Premature Stage'],
    themes: ['Recovery Week']
  },
  {
    id: 'indoor-recovery-walk',
    activity: 'Indoor Recovery Walk',
    category: 'Walking & Cardio',
    intensity: 'Low',
    benefit: 'Builds gradual stamina',
    targetArea: 'Legs, Heart',
    caloriesBurned: '60–90 kcal',
    duration: '15 min',
    stages: ['Premature Stage'],
    themes: ['Recovery Week']
  },
  {
    id: 'shoulder-roll-routine',
    activity: 'Shoulder Roll Routine',
    category: 'Recovery Activities',
    intensity: 'Very Low',
    benefit: 'Reduces tension',
    targetArea: 'Shoulders, Neck',
    caloriesBurned: '10–20 kcal',
    duration: '5 min',
    stages: ['Premature Stage', 'Postpartum'],
    themes: ['Recovery Week']
  },
  {
    id: 'core-breathing-activation',
    activity: 'Core Breathing Activation',
    category: 'Pelvic Health',
    intensity: 'Low',
    benefit: 'Reconnects core muscles / abdominal control',
    targetArea: 'Deep Core, Pelvis',
    caloriesBurned: '15–30 kcal',
    duration: '8 min',
    stages: ['Premature Stage', 'Postpartum'],
    themes: ['Recovery Week', 'Pelvic Health Week']
  },

  // Relaxation Week
  {
    id: 'meditation-based-movement',
    activity: 'Meditation-Based Movement',
    category: 'Recovery Activities',
    intensity: 'Very Low',
    benefit: 'Promotes calmness',
    targetArea: 'Mind + Body',
    caloriesBurned: '15–25 kcal',
    duration: '10 min',
    stages: ['Premature Stage'],
    themes: ['Relaxation Week']
  },
  {
    id: 'gentle-stretch-flow',
    activity: 'Gentle Stretch Flow',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Relaxes muscles',
    targetArea: 'Full Body',
    caloriesBurned: '30–50 kcal',
    duration: '15 min',
    stages: ['Premature Stage'],
    themes: ['Relaxation Week']
  },
  {
    id: 'neck-relaxation-exercise',
    activity: 'Neck Relaxation Exercise',
    category: 'Stretching & Mobility',
    intensity: 'Very Low',
    benefit: 'Reduces neck tension',
    targetArea: 'Neck, Shoulders',
    caloriesBurned: '10–20 kcal',
    duration: '10 min',
    stages: ['Premature Stage'],
    themes: ['Relaxation Week']
  },

  // --- Postpartum Activities ---

  // Recovery Week
  {
    id: 'recovery-walking',
    activity: 'Recovery Walking',
    category: 'Walking & Cardio',
    intensity: 'Low',
    benefit: 'Restores endurance',
    targetArea: 'Legs, Heart',
    caloriesBurned: '80–130 kcal',
    duration: '20 min',
    stages: ['Postpartum'],
    themes: ['Recovery Week']
  },
  {
    id: 'gentle-mobility-routine',
    activity: 'Gentle Mobility Routine',
    category: 'Recovery Activities',
    intensity: 'Low',
    benefit: 'Improves movement recovery',
    targetArea: 'Full Body',
    caloriesBurned: '30–50 kcal',
    duration: '15 min',
    stages: ['Postpartum'],
    themes: ['Recovery Week']
  },
  {
    id: 'lower-back-stretch',
    activity: 'Lower Back Stretch',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Reduces posture pain',
    targetArea: 'Lower Back',
    caloriesBurned: '20–35 kcal',
    duration: '10 min',
    stages: ['Postpartum'],
    themes: ['Recovery Week']
  },
  {
    id: 'recovery-yoga-flow',
    activity: 'Recovery Yoga Flow',
    category: 'Yoga',
    intensity: 'Low',
    benefit: 'Supports healing',
    targetArea: 'Full Body',
    caloriesBurned: '50–90 kcal',
    duration: '20 min',
    stages: ['Postpartum'],
    themes: ['Recovery Week']
  },

  // Pelvic Health Week
  {
    id: 'pelvic-floor-recovery',
    activity: 'Pelvic Floor Recovery',
    category: 'Pelvic Health',
    intensity: 'Low',
    benefit: 'Restores pelvic strength',
    targetArea: 'Pelvic Floor',
    caloriesBurned: '20–35 kcal',
    duration: '10 min',
    stages: ['Postpartum'],
    themes: ['Pelvic Health Week']
  },
  {
    id: 'gentle-squats',
    activity: 'Gentle Squats',
    category: 'Strength & Stability',
    intensity: 'Moderate',
    benefit: 'Supports pelvic stability',
    targetArea: 'Legs, Pelvis',
    caloriesBurned: '45–70 kcal',
    duration: '15 min',
    stages: ['Postpartum'],
    themes: ['Pelvic Health Week']
  },

  // Posture Improvement — fills theme rotation gaps
  {
    id: 'seated-posture-reset-t1',
    activity: 'Seated Posture Reset',
    category: 'Stretching & Mobility',
    intensity: 'Very Low',
    benefit: 'Stacks ears over shoulders for lighter neck load',
    targetArea: 'Neck, Upper Back',
    caloriesBurned: '10–20 kcal',
    duration: '8 min',
    stages: ['Trimester 1'],
    themes: ['Posture Improvement']
  },
  {
    id: 'wall-angels-gentle-t1',
    activity: 'Wall Angels (Gentle)',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Opens chest without aggressive extension',
    targetArea: 'Shoulders, Thoracic Spine',
    caloriesBurned: '20–35 kcal',
    duration: '10 min',
    stages: ['Trimester 1'],
    themes: ['Posture Improvement']
  },
  {
    id: 'pregnancy-posture-stack-t2',
    activity: 'Pregnancy Posture Stack',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Practices neutral ribs over pelvis while standing',
    targetArea: 'Core, Pelvis',
    caloriesBurned: '25–40 kcal',
    duration: '12 min',
    stages: ['Trimester 2'],
    themes: ['Posture Improvement']
  },
  {
    id: 'wall-hip-hinge-t2',
    activity: 'Wall Hip Hinge Drill',
    category: 'Strength & Stability',
    intensity: 'Low',
    benefit: 'Trains hinge pattern with support for daily bending',
    targetArea: 'Hips, Hamstrings',
    caloriesBurned: '30–50 kcal',
    duration: '12 min',
    stages: ['Trimester 2'],
    themes: ['Posture Improvement']
  },
  {
    id: 'side-lying-alignment-t3',
    activity: 'Side-Lying Alignment Reset',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Unloads the lower back in a supported position',
    targetArea: 'Spine, Hips',
    caloriesBurned: '20–35 kcal',
    duration: '12 min',
    stages: ['Trimester 3'],
    themes: ['Posture Improvement']
  },
  {
    id: 'supported-thoracic-lift-t3',
    activity: 'Supported Thoracic Extension',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Eases upper-back stiffness from forward posture',
    targetArea: 'Upper Back, Chest',
    caloriesBurned: '25–40 kcal',
    duration: '10 min',
    stages: ['Trimester 3'],
    themes: ['Posture Improvement']
  },
  {
    id: 'in-bed-shoulder-slide-prem',
    activity: 'In-Bed Shoulder Blade Slides',
    category: 'Recovery Activities',
    intensity: 'Very Low',
    benefit: 'Maintains scapular glide with minimal exertion',
    targetArea: 'Shoulders, Upper Back',
    caloriesBurned: '8–15 kcal',
    duration: '6 min',
    stages: ['Premature Stage'],
    themes: ['Posture Improvement']
  },
  {
    id: 'nursing-neutral-spine-pp',
    activity: 'Nursing-Neutral Spine Reset',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Supports feeding posture without slumped shoulders',
    targetArea: 'Neck, Upper Back',
    caloriesBurned: '15–28 kcal',
    duration: '10 min',
    stages: ['Postpartum'],
    themes: ['Posture Improvement']
  },

  // Energy Boost Week
  {
    id: 'gentle-vitality-walk-t1',
    activity: 'Gentle Vitality Walk',
    category: 'Walking & Cardio',
    intensity: 'Low',
    benefit: 'Brightens energy without pushing pace',
    targetArea: 'Legs, Heart',
    caloriesBurned: '70–100 kcal',
    duration: '18 min',
    stages: ['Trimester 1'],
    themes: ['Energy Boost Week']
  },
  {
    id: 'mood-lifting-march-t2',
    activity: 'Mood-Lifting March in Place',
    category: 'Walking & Cardio',
    intensity: 'Moderate',
    benefit: 'Short bursts to lift mood and circulation',
    targetArea: 'Legs, Core',
    caloriesBurned: '60–95 kcal',
    duration: '12 min',
    stages: ['Trimester 2'],
    themes: ['Energy Boost Week']
  },
  {
    id: 'light-side-steps-t2',
    activity: 'Light Side Steps',
    category: 'Walking & Cardio',
    intensity: 'Low',
    benefit: 'Adds variety with lateral stability practice',
    targetArea: 'Hips, Legs',
    caloriesBurned: '40–65 kcal',
    duration: '12 min',
    stages: ['Trimester 2'],
    themes: ['Energy Boost Week']
  },
  {
    id: 'short-stamina-walk-t3',
    activity: 'Short Stamina Stride Walk',
    category: 'Walking & Cardio',
    intensity: 'Moderate',
    benefit: 'Builds sustainable stamina for late pregnancy',
    targetArea: 'Legs, Heart',
    caloriesBurned: '90–130 kcal',
    duration: '22 min',
    stages: ['Trimester 3'],
    themes: ['Energy Boost Week']
  },
  {
    id: 'standing-hip-circles-energy-t3',
    activity: 'Standing Hip Circles',
    category: 'Stretching & Mobility',
    intensity: 'Low',
    benefit: 'Loosens hips for a quick energy reset',
    targetArea: 'Hips, Pelvis',
    caloriesBurned: '25–40 kcal',
    duration: '10 min',
    stages: ['Trimester 3'],
    themes: ['Energy Boost Week']
  },
  {
    id: 'fresh-air-recovery-stride-pp',
    activity: 'Fresh Air Recovery Stride',
    category: 'Walking & Cardio',
    intensity: 'Low',
    benefit: 'Gentle outdoor pacing when cleared by your clinician',
    targetArea: 'Legs, Mood',
    caloriesBurned: '75–115 kcal',
    duration: '18 min',
    stages: ['Postpartum'],
    themes: ['Energy Boost Week']
  },
  {
    id: 'micro-energy-walk-prem',
    activity: 'Micro-Energy Indoor Walk',
    category: 'Walking & Cardio',
    intensity: 'Very Low',
    benefit: 'Short steps to lift alertness during recovery',
    targetArea: 'Legs, Circulation',
    caloriesBurned: '25–45 kcal',
    duration: '8 min',
    stages: ['Premature Stage'],
    themes: ['Energy Boost Week']
  }
];
