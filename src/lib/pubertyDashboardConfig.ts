/**
 * Puberty Phase Dashboard Configuration
 * Provides isolated logic and content for puberty phase in the shared dashboard
 */

// Local enum definitions to avoid Prisma dependency in frontend
export enum PubertyStatus {
  early = 'early',
  normal = 'normal',
  late = 'late'
}

export enum HormonalCondition {
  none = 'none',
  PCOS = 'PCOS',
  PCOD = 'PCOD'
}

export interface PubertyProfile {
  dateOfBirth?: Date;
  menarcheDate?: Date;
  pubertyStatus: PubertyStatus;
  ageAtMenarche?: number;
  hormonalCondition: HormonalCondition;
}

export interface NutritionTip {
  title: string;
  description: string;
  category: 'nutrition' | 'lifestyle' | 'medical';
  priority: number;
}

export interface PubertyDashboardConfig {
  profile: PubertyProfile | null;
  tips: NutritionTip[];
  overrideReason?: string;
  visualAnalytics: {
    cycleData: any[];
    symptomData: any[];
    moodData: any[];
  };
}

// ─── Puberty Classification Logic ───────────────────────────────────

export function classifyPuberty(dateOfBirth?: Date, menarcheDate?: Date): {
  pubertyStatus: PubertyStatus;
  ageAtMenarche?: number;
  hasMenarche: boolean;
} {
  if (!dateOfBirth || !menarcheDate) {
    return {
      pubertyStatus: PubertyStatus.normal,
      hasMenarche: false,
    };
  }

  const MS_PER_YEAR = 1000 * 60 * 60 * 24 * 365.25;
  const ageAtMenarcheMs = menarcheDate.getTime() - dateOfBirth.getTime();
  const ageAtMenarche = ageAtMenarcheMs / MS_PER_YEAR;

  let pubertyStatus: PubertyStatus;

  if (ageAtMenarche < 10) {
    pubertyStatus = PubertyStatus.early;
  } else if (ageAtMenarche <= 15) {
    pubertyStatus = PubertyStatus.normal;
  } else {
    pubertyStatus = PubertyStatus.late;
  }

  return {
    pubertyStatus,
    ageAtMenarche: Math.round(ageAtMenarche * 10) / 10,
    hasMenarche: true,
  };
}

// ─── Nutrition & Lifestyle Tips Engine ─────────────────────────────

export function generatePubertyTips(
  pubertyStatus: PubertyStatus,
  hormonalCondition: HormonalCondition
): { tips: NutritionTip[]; overrideReason?: string } {
  // Case 4: PCOS / PCOD (Override Priority)
  if (hormonalCondition === 'PCOS' || hormonalCondition === 'PCOD') {
    return {
      tips: getPCOSPCODTips(hormonalCondition),
      overrideReason: `Hormonal condition (${hormonalCondition}) requires specialized management`,
    };
  }

  // Cases 1-3: Puberty-based tips
  switch (pubertyStatus) {
    case PubertyStatus.early:
      return { tips: getEarlyPubertyTips() };
    
    case PubertyStatus.late:
      return { tips: getLatePubertyTips() };
    
    case PubertyStatus.normal:
    default:
      return { tips: getNormalPubertyTips() };
  }
}

function getPCOSPCODTips(condition: HormonalCondition): NutritionTip[] {
  const baseTips = [
    {
      title: 'Low Glycemic Diet',
      description: 'Focus on whole grains, legumes, and non-starchy vegetables. Avoid refined sugars and processed foods.',
      category: 'nutrition' as const,
      priority: 1,
    },
    {
      title: 'Regular Exercise',
      description: 'Aim for 30 minutes of moderate activity like walking, swimming, or cycling 5 days a week.',
      category: 'lifestyle' as const,
      priority: 2,
    },
    {
      title: 'Hormone Balance Foods',
      description: 'Include foods rich in omega-3 fatty acids like fish, flaxseeds, and walnuts to support hormonal health.',
      category: 'nutrition' as const,
      priority: 3,
    },
    {
      title: 'Stress Management',
      description: 'Practice yoga, meditation, or deep breathing exercises to help regulate cortisol levels.',
      category: 'lifestyle' as const,
      priority: 4,
    },
    {
      title: 'Regular Medical Monitoring',
      description: 'Schedule regular check-ups with your healthcare provider to monitor hormonal levels and overall health.',
      category: 'medical' as const,
      priority: 5,
    },
  ];

  if (condition === 'PCOS') {
    baseTips.push({
      title: 'Weight Management',
      description: 'Maintain a healthy weight through balanced diet and regular exercise to improve insulin sensitivity.',
      category: 'lifestyle' as const,
      priority: 6,
    });
  }

  return baseTips;
}

function getEarlyPubertyTips(): NutritionTip[] {
  return [
    {
      title: 'Balanced Nutrition',
      description: 'Focus on a balanced diet with adequate protein, healthy fats, and complex carbohydrates for proper development.',
      category: 'nutrition' as const,
      priority: 1,
    },
    {
      title: 'Reduce Processed Foods',
      description: 'Limit processed foods, sugary drinks, and excessive junk food that may affect hormonal development.',
      category: 'nutrition' as const,
      priority: 2,
    },
    {
      title: 'Adequate Sleep',
      description: 'Ensure 8-10 hours of quality sleep each night to support healthy growth and hormonal balance.',
      category: 'lifestyle' as const,
      priority: 3,
    },
    {
      title: 'Stress Control',
      description: 'Practice relaxation techniques and maintain a calm environment to support healthy development.',
      category: 'lifestyle' as const,
      priority: 4,
    },
    {
      title: 'Regular Physical Activity',
      description: 'Engage in age-appropriate physical activities and sports for healthy development.',
      category: 'lifestyle' as const,
      priority: 5,
    },
  ];
}

function getLatePubertyTips(): NutritionTip[] {
  return [
    {
      title: 'Iron-Rich Foods',
      description: 'Increase intake of iron-rich foods like leafy greens, lentils, dates, and lean meats to support menstrual health.',
      category: 'nutrition' as const,
      priority: 1,
    },
    {
      title: 'Protein-Rich Diet',
      description: 'Ensure adequate protein intake through eggs, dairy, legumes, and lean meats for proper development.',
      category: 'nutrition' as const,
      priority: 2,
    },
    {
      title: 'Calcium and Vitamin D',
      description: 'Include dairy products, fortified foods, and sunlight exposure for bone health and development.',
      category: 'nutrition' as const,
      priority: 3,
    },
    {
      title: 'Medical Consultation',
      description: 'Consider consulting with a healthcare provider to ensure healthy development and address any concerns.',
      category: 'medical' as const,
      priority: 4,
    },
    {
      title: 'Healthy Fats',
      description: 'Include sources of healthy fats like nuts, seeds, and avocado for hormonal balance and brain development.',
      category: 'nutrition' as const,
      priority: 5,
    },
  ];
}

function getNormalPubertyTips(): NutritionTip[] {
  return [
    {
      title: 'Balanced Meals',
      description: 'Maintain regular, balanced meals with a variety of food groups for overall health.',
      category: 'nutrition' as const,
      priority: 1,
    },
    {
      title: 'Stay Hydrated',
      description: 'Drink 6-8 glasses of water daily to support overall health and bodily functions.',
      category: 'lifestyle' as const,
      priority: 2,
    },
    {
      title: 'Regular Exercise',
      description: 'Engage in physical activities you enjoy for at least 30 minutes most days of the week.',
      category: 'lifestyle' as const,
      priority: 3,
    },
    {
      title: 'Adequate Sleep',
      description: 'Aim for 8-9 hours of sleep each night to support growth and overall well-being.',
      category: 'lifestyle' as const,
      priority: 4,
    },
    {
      title: 'Track Your Cycle',
      description: 'Keep a simple calendar to track your menstrual cycle and understand your body patterns.',
      category: 'lifestyle' as const,
      priority: 5,
    },
  ];
}

// ─── Dashboard Configuration Generator ───────────────────────────────

export function createPubertyDashboardConfig(
  dateOfBirth?: Date,
  menarcheDate?: Date,
  hormonalCondition: HormonalCondition = HormonalCondition.none,
  logs: any[] = []
): PubertyDashboardConfig {
  // Classify puberty
  const classification = classifyPuberty(dateOfBirth, menarcheDate);
  
  // Generate tips
  const tipsResult = generatePubertyTips(classification.pubertyStatus, hormonalCondition);
  
  // Create profile
  const profile: PubertyProfile = {
    dateOfBirth,
    menarcheDate,
    pubertyStatus: classification.pubertyStatus,
    ageAtMenarche: classification.ageAtMenarche,
    hormonalCondition,
  };

  // Process analytics data
  const visualAnalytics = processPubertyAnalytics(logs);

  return {
    profile,
    tips: tipsResult.tips,
    overrideReason: tipsResult.overrideReason,
    visualAnalytics,
  };
}

function processPubertyAnalytics(logs: any[]) {
  // Process cycle data for line chart
  const cycleData = logs
    .filter((log) => log.phase === 'puberty' && log.periodStarted)
    .map((log, index, array) => {
      if (index === 0) return null;
      const prevPeriod = array[index - 1];
      const cycleLength = Math.floor((new Date(log.date).getTime() - new Date(prevPeriod.date).getTime()) / (1000 * 60 * 60 * 24));
      return {
        date: new Date(log.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        cycleLength: cycleLength > 0 && cycleLength <= 60 ? cycleLength : null,
        isPeriod: true,
      };
    })
    .filter(Boolean)
    .slice(-12);

  // Process symptom data for bar chart
  const symptomCounts: Record<string, number> = {};
  logs
    .filter((log) => log.phase === 'puberty')
    .forEach((log) => {
      Object.entries(log.symptoms || {}).forEach(([symptom, hasSymptom]) => {
        if (hasSymptom) {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        }
      });
    });

  const symptomData = Object.entries(symptomCounts)
    .map(([symptom, frequency]) => ({
      symptom: symptom.replace(/([A-Z])/g, ' $1').trim(),
      frequency,
      category: 'physical',
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8);

  // Process mood data
  const moodData = logs
    .filter((log) => log.phase === 'puberty' && log.mood)
    .map((log) => ({
      date: new Date(log.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      mood: log.mood,
      energy: log.symptoms?.fatigue ? 3 : 7, // Simple energy calculation
    }))
    .slice(-30);

  return {
    cycleData,
    symptomData,
    moodData,
  };
}
