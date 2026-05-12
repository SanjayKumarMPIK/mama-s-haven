import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog, calcFertileWindow, calcAverageCycleLength } from "@/hooks/useHealthLog";
import type { PubertyEntry } from "@/hooks/useHealthLog";
import ScrollReveal from "@/components/ScrollReveal";
import PubertyFertilityInsights from "@/components/dashboard/PubertyFertilityInsights";
import { createPubertyDashboardConfig, HormonalCondition, PubertyStatus } from "@/lib/pubertyDashboardConfig";
import {
  computeWellnessScore,
  generatePriorityActions,
  computeBodySignals,
  generateSmartPredictions,
  getCompletedActions,
  toggleActionComplete,
} from "@/lib/wellnessCommandEngine";
import type { BodySignal } from "@/lib/wellnessCommandEngine";
import {
  Calendar, Utensils, Activity, Heart, AlertTriangle, Zap, Sparkles,
  TrendingUp, Clock, Flower2, CalendarDays, ShieldAlert, Droplets,
  Moon, Sun, TrendingDown, Minus, Apple, CheckCircle2 as Check,
  Leaf, Bell, ChevronRight,
} from "lucide-react";

// Helper functions
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function fmtDateLong(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

// Dynamic Nutrition Tips Engine
interface NutritionTip {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  priority: number;
  category: 'nutrition' | 'lifestyle' | 'medical';
}

interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  color: string;
  titleColor: string;
  priority: number;
}

function generateDynamicNutritionTips(
  pubertyStage: PubertyStatus,
  condition: HormonalCondition,
  symptoms: string[]
): NutritionTip[] {
  let tips: NutritionTip[] = [];

  // Base tips by puberty stage
  if (pubertyStage === PubertyStatus.early) {
    tips = [
      {
        id: 'early-1',
        icon: <Activity className="w-4 h-4 text-green-600" />,
        title: "Reduce Processed Foods",
        description: "Minimize sugar and processed foods to support hormonal balance",
        color: "bg-green-100",
        priority: 1,
        category: 'nutrition'
      },
      {
        id: 'early-2',
        icon: <Heart className="w-4 h-4 text-red-500" />,
        title: "Balanced Protein & Fiber",
        description: "Include lean proteins and high-fiber foods for growth",
        color: "bg-red-100",
        priority: 2,
        category: 'nutrition'
      },
      {
        id: 'early-3',
        icon: <Activity className="w-4 h-4 text-blue-500" />,
        title: "Regular Physical Activity",
        description: "Encourage daily movement and sports participation",
        color: "bg-blue-100",
        priority: 3,
        category: 'lifestyle'
      },
      {
        id: 'early-4',
        icon: <Moon className="w-4 h-4 text-purple-500" />,
        title: "Maintain Sleep Cycle",
        description: "Consistent sleep schedule supports healthy development",
        color: "bg-purple-100",
        priority: 4,
        category: 'lifestyle'
      }
    ];
  } else if (pubertyStage === PubertyStatus.late) {
    tips = [
      {
        id: 'late-1',
        icon: <Heart className="w-4 h-4 text-red-500" />,
        title: "Iron-Rich Foods",
        description: "Focus on red meat, spinach, and legumes for energy",
        color: "bg-red-100",
        priority: 1,
        category: 'nutrition'
      },
      {
        id: 'late-2',
        icon: <Sun className="w-4 h-4 text-yellow-500" />,
        title: "Healthy Fats",
        description: "Include avocados, nuts, and olive oil for development",
        color: "bg-yellow-100",
        priority: 2,
        category: 'nutrition'
      },
      {
        id: 'late-3',
        icon: <Activity className="w-4 h-4 text-green-600" />,
        title: "Protein-Rich Diet",
        description: "Support muscle and tissue development with quality protein",
        color: "bg-green-100",
        priority: 3,
        category: 'nutrition'
      },
      {
        id: 'late-4',
        icon: <Activity className="w-4 h-4 text-blue-500" />,
        title: "Stress Reduction",
        description: "Practice relaxation techniques and mindfulness",
        color: "bg-blue-100",
        priority: 4,
        category: 'lifestyle'
      }
    ];
  } else { // Normal Puberty
    tips = [
      {
        id: 'normal-1',
        icon: <Activity className="w-4 h-4 text-green-600" />,
        title: "Balanced Diet",
        description: "Include proteins, carbs, and healthy fats in proper ratios",
        color: "bg-green-100",
        priority: 1,
        category: 'nutrition'
      },
      {
        id: 'normal-2',
        icon: <Sun className="w-4 h-4 text-yellow-500" />,
        title: "Calcium & Vitamin D",
        description: "Support bone health with dairy and sunlight exposure",
        color: "bg-yellow-100",
        priority: 2,
        category: 'nutrition'
      },
      {
        id: 'normal-3',
        icon: <Activity className="w-4 h-4 text-blue-500" />,
        title: "Regular Exercise",
        description: "Maintain consistent physical activity routine",
        color: "bg-blue-100",
        priority: 3,
        category: 'lifestyle'
      }
    ];
  }

  // Override for PCOS/PCOD conditions - Comprehensive PCOD/PCOS Management
  if (condition === HormonalCondition.PCOS || condition === HormonalCondition.PCOD) {
    tips = [
      // 🍽️ Diet Rules (Core)
      {
        id: 'pcos-1',
        icon: <Utensils className="w-4 h-4 text-green-600" />,
        title: "Low Glycemic Index Focus",
        description: "Prioritize oats, millets, brown rice, quinoa. Avoid white rice, maida, refined sugar",
        color: "bg-green-100",
        priority: 1,
        category: 'medical'
      },
      {
        id: 'pcos-2',
        icon: <Heart className="w-4 h-4 text-red-500" />,
        title: "High Protein Meals",
        description: "Include eggs, paneer, legumes, chicken, fish. Aim for 35% protein in daily calories",
        color: "bg-red-100",
        priority: 2,
        category: 'medical'
      },
      {
        id: 'pcos-3',
        icon: <Leaf className="w-4 h-4 text-green-500" />,
        title: "High Fiber Foods",
        description: "Load up on leafy greens, vegetables, whole grains. Essential for blood sugar control",
        color: "bg-green-100",
        priority: 3,
        category: 'medical'
      },
      {
        id: 'pcos-4',
        icon: <Droplets className="w-4 h-4 text-blue-500" />,
        title: "Omega-3 & Healthy Fats",
        description: "Include nuts, seeds, olive oil, avocado. Anti-inflammatory for hormonal balance",
        color: "bg-blue-100",
        priority: 4,
        category: 'medical'
      },
      {
        id: 'pcos-5',
        icon: <ShieldAlert className="w-4 h-4 text-orange-500" />,
        title: "Foods to Avoid",
        description: "Eliminate junk food, bakery items, fried foods, excess dairy, sugary drinks",
        color: "bg-orange-100",
        priority: 5,
        category: 'medical'
      },
      // 🕒 Meal Pattern
      {
        id: 'pcos-6',
        icon: <Clock className="w-4 h-4 text-purple-500" />,
        title: "Small Frequent Meals",
        description: "Eat every 3-4 hours to prevent insulin spikes. Never skip breakfast!",
        color: "bg-purple-100",
        priority: 6,
        category: 'medical'
      },
      // 🧘 Lifestyle Rules
      {
        id: 'pcos-7',
        icon: <Activity className="w-4 h-4 text-blue-600" />,
        title: "30-45 Mins Daily Exercise",
        description: "Strength training (IMPORTANT) + walking/cardio + yoga for hormone balance",
        color: "bg-blue-100",
        priority: 7,
        category: 'lifestyle'
      },
      {
        id: 'pcos-8',
        icon: <Moon className="w-4 h-4 text-indigo-500" />,
        title: "7-8 Hours Quality Sleep",
        description: "Very important for hormone balance. Consistent sleep schedule",
        color: "bg-indigo-100",
        priority: 8,
        category: 'lifestyle'
      },
      {
        id: 'pcos-9',
        icon: <Sparkles className="w-4 h-4 text-pink-500" />,
        title: "Stress Management",
        description: "Meditation, breathing exercises, consistent routine. Reduce caffeine",
        color: "bg-pink-100",
        priority: 9,
        category: 'lifestyle'
      },
      // 🥦 Nutrition Focus
      {
        id: 'pcos-10',
        icon: <Apple className="w-4 h-4 text-red-600" />,
        title: "Key Nutrients Focus",
        description: "Protein, Fiber, Omega-3, Magnesium & Zinc for hormonal balance",
        color: "bg-red-100",
        priority: 10,
        category: 'medical'
      },
      // 🌟 Special Tips
      {
        id: 'pcos-11',
        icon: <Sun className="w-4 h-4 text-yellow-500" />,
        title: "Never Skip Breakfast",
        description: "Start day with protein-rich meal (eggs, paneer, oats)",
        color: "bg-yellow-100",
        priority: 11,
        category: 'medical'
      },
      {
        id: 'pcos-12',
        icon: <Droplets className="w-4 h-4 text-cyan-500" />,
        title: "Stay Hydrated",
        description: "Drink 6-8 glasses of water daily. Essential for metabolism",
        color: "bg-cyan-100",
        priority: 12,
        category: 'lifestyle'
      }
    ];
  }

  // Symptom-based overrides (highest priority)
  const symptomOverrides: NutritionTip[] = [];
  if (symptoms.includes('fatigue')) {
    symptomOverrides.push({
      id: 'symptom-fatigue',
      icon: <Heart className="w-4 h-4 text-red-500" />,
      title: "Iron + Hydration Focus",
      description: "Combat fatigue with iron-rich foods and plenty of water",
      color: "bg-red-100",
      priority: 0,
      category: 'medical'
    });
  }
  
  if (symptoms.includes('acne')) {
    symptomOverrides.push({
      id: 'symptom-acne',
      icon: <ShieldAlert className="w-4 h-4 text-orange-500" />,
      title: "Skin-Friendly Nutrition",
      description: "Focus on zinc-rich foods and reduce dairy for clearer skin",
      color: "bg-orange-100",
      priority: 0,
      category: 'medical'
    });
  }

  return [...symptomOverrides, ...tips];
}

function generateAlerts(
  logs: PubertyEntry[],
  cycleInfo: any,
  pubertyStage: PubertyStatus
): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  // Cycle irregularity alerts
  if (cycleInfo && cycleInfo.cycleLen > 35) {
    alerts.push({
      id: 'cycle-irregular',
      title: "Cycle Irregularity",
      description: "Your cycle is longer than usual. Consider consulting a healthcare provider.",
      timestamp: now.toLocaleString(),
      color: "bg-amber-50",
      titleColor: "text-amber-700",
      priority: 2
    });
  }

  // Puberty stage specific alerts
  if (pubertyStage === PubertyStatus.early) {
    alerts.push({
      id: 'early-puberty',
      title: "Early Puberty Support",
      description: "Focus on nutrition and emotional support during this important phase.",
      timestamp: now.toLocaleString(),
      color: "bg-blue-50",
      titleColor: "text-blue-700",
      priority: 1
    });
  }

  return alerts;
}

export default function PubertyGuide() {
  const { profile } = useProfile();

  // Extract user data for dynamic tips
  const userData = useMemo(() => {
    if (!profile) return null;
    
    // Extract hormonal condition
    let hormonalCondition: HormonalCondition = HormonalCondition.none;
    const medicalConditionsRaw = (profile as any).medicalConditions;
    const medicalConditions = Array.isArray(medicalConditionsRaw)
      ? medicalConditionsRaw.join(" ").toLowerCase()
      : typeof medicalConditionsRaw === "string"
        ? medicalConditionsRaw.toLowerCase()
        : "";

    if (medicalConditions) {
      const conditions = medicalConditions;
      if (conditions.includes('pcos') || conditions.includes('pcod/pcos')) {
        hormonalCondition = HormonalCondition.PCOS;
      } else if (conditions.includes('pcod')) {
        hormonalCondition = HormonalCondition.PCOD;
      }
    } else if (typeof profile.knownConditions === "string" && profile.knownConditions.trim()) {
      // Fallback to knownConditions string
      const conditions = profile.knownConditions.toLowerCase();
      if (conditions.includes('pcos')) {
        hormonalCondition = HormonalCondition.PCOS;
      } else if (conditions.includes('pcod')) {
        hormonalCondition = HormonalCondition.PCOD;
      }
    }
    
    console.log("DEBUG: Final hormonal condition:", hormonalCondition);
    
    // Calculate puberty stage
    let pubertyStage: PubertyStatus = PubertyStatus.normal;
    if (profile.dob) {
      const age = new Date().getFullYear() - new Date(profile.dob).getFullYear();
      if (age < 11) pubertyStage = PubertyStatus.early;
      else if (age > 16) pubertyStage = PubertyStatus.late;
    }

    return {
      pubertyStage,
      hormonalCondition,
      symptoms: [] as string[]
    };
  }, [profile]);

  // Generate dynamic content based on user data
  const dynamicTips = useMemo(() => {
    if (!userData) return [];
    return generateDynamicNutritionTips(userData.pubertyStage, userData.hormonalCondition, userData.symptoms);
  }, [userData]);

  // Create puberty dashboard config
  const pubertyConfig = useMemo(() => {
    if (!userData || !profile) return null;
    return createPubertyDashboardConfig(
      profile.dob ? new Date(profile.dob) : undefined,
      profile.menarcheDate ? new Date(profile.menarcheDate) : undefined,
      userData.hormonalCondition
    );
  }, [userData, profile]);

  if (!pubertyConfig) {
    return (
      <div className="min-h-screen py-12 bg-background">
        <div className="container max-w-4xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Puberty Dashboard</h2>
            <p className="text-muted-foreground">Loading your personalized dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* ═══ 1. TODAY STATUS ═══════════════════════════════════════════════ */}
      <div className="bg-white border-b border-border/50">
        <div className="container py-6">
          <ScrollReveal>
            <div className="rounded-2xl p-5 border-2 bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border bg-blue-100 border-blue-200">
                  ✨
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-slate-900 mb-1">Your Puberty Guide</h1>
                  <p className="text-sm text-slate-600 font-medium">Personalized nutrition and lifestyle recommendations</p>
                  <p className="text-xs text-slate-500 mt-1 italic">💡 Track your health and get personalized tips</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-8">

        {/* ═══ FERTILITY & CYCLE INSIGHTS ═══════════════════════════════════ */}
        <section>
          <ScrollReveal delay={20}>
            <PubertyFertilityInsights />
          </ScrollReveal>
        </section>

      </div>
    </main>
  );
}
