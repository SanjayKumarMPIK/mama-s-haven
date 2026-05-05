import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog, calcFertileWindow, calcAverageCycleLength } from "@/hooks/useHealthLog";
import type { PubertyEntry } from "@/hooks/useHealthLog";
import ScrollReveal from "@/components/ScrollReveal";
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
    console.log("DEBUG: Full profile object:", profile);
    console.log("DEBUG: Profile medical conditions:", profile.medicalConditions);
    console.log("DEBUG: Profile known conditions:", profile.knownConditions);
    console.log("DEBUG: Medical conditions type:", typeof profile.medicalConditions);
    console.log("DEBUG: Medical conditions length:", profile.medicalConditions?.length);
    
    if (profile.medicalConditions && profile.medicalConditions.length > 0) {
      const conditions = profile.medicalConditions.join(' ').toLowerCase();
      console.log("DEBUG: Medical conditions string:", conditions);
      if (conditions.includes('pcos') || conditions.includes('pcod/pcos')) {
        hormonalCondition = HormonalCondition.PCOS;
        console.log("DEBUG: Detected PCOS condition");
      } else if (conditions.includes('pcod')) {
        hormonalCondition = HormonalCondition.PCOD;
        console.log("DEBUG: Detected PCOD condition");
      }
    } else if (profile.knownConditions) {
      // Fallback to knownConditions string
      const conditions = profile.knownConditions.toLowerCase();
      console.log("DEBUG: Known conditions string:", conditions);
      if (conditions.includes('pcos')) {
        hormonalCondition = HormonalCondition.PCOS;
        console.log("DEBUG: Detected PCOS from known conditions");
      } else if (conditions.includes('pcod')) {
        hormonalCondition = HormonalCondition.PCOD;
        console.log("DEBUG: Detected PCOD from known conditions");
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
    if (!userData) return null;
    return createPubertyDashboardConfig(userData.pubertyStage, userData.hormonalCondition);
  }, [userData]);

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
            <div className="rounded-2xl p-5 border-2 bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border bg-teal-100 border-teal-200">
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

        
        {/* ═══ PUBERTY PROFILE STATUS ═══════════════════════════════════════ */}
        <section>
          <ScrollReveal delay={40}>
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Your Puberty Profile</h2>
                  <p className="text-xs text-muted-foreground">
                    {pubertyConfig.overrideReason || `Based on your ${pubertyConfig.profile?.pubertyStatus} puberty status`}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pubertyConfig.profile?.pubertyStatus === PubertyStatus.early ? 'bg-amber-100 text-amber-700' :
                    pubertyConfig.profile?.pubertyStatus === PubertyStatus.late ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {pubertyConfig.profile?.pubertyStatus === PubertyStatus.early ? 'Early Puberty' :
                     pubertyConfig.profile?.pubertyStatus === PubertyStatus.late ? 'Late Puberty' :
                     'Normal Puberty'}
                  </span>
                  {pubertyConfig.profile?.ageAtMenarche && (
                    <span className="text-xs text-muted-foreground">
                      (Age at menarche: {pubertyConfig.profile.ageAtMenarche} years)
                    </span>
                  )}
                </div>
                {pubertyConfig.profile?.hormonalCondition !== HormonalCondition.none && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Hormonal Condition:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pubertyConfig.profile?.hormonalCondition === HormonalCondition.PCOS ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {pubertyConfig.profile?.hormonalCondition}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ═══ PCOD/PCOS COMPREHENSIVE MEAL PLAN ═══════════════════════════════════════ */}
        {pubertyConfig.profile?.hormonalCondition === HormonalCondition.PCOS || pubertyConfig.profile?.hormonalCondition === HormonalCondition.PCOD ? (
          <section>
            <ScrollReveal delay={50}>
              <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-sm border border-pink-200">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">PCOD/PCOS Meal Plan</h2>
                    <p className="text-sm text-gray-600">Insulin-resistance-friendly nutrition plan for hormonal balance</p>
                  </div>
                </div>

                {/* Meal Plan Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Breakfast */}
                  <div className="bg-white/70 rounded-xl p-4 border border-pink-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Sun className="w-4 h-4 text-yellow-500" />
                      <h3 className="font-semibold text-gray-900">Breakfast (Never Skip!)</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Protein-rich: Eggs, paneer, Greek yogurt
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Complex carbs: Oats, millets, quinoa
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Add berries for antioxidants
                      </li>
                    </ul>
                  </div>

                  {/* Lunch */}
                  <div className="bg-white/70 rounded-xl p-4 border border-pink-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Sun className="w-4 h-4 text-orange-500" />
                      <h3 className="font-semibold text-gray-900">Lunch</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Lean protein: Chicken, fish, legumes
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Brown rice + lots of vegetables
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Olive oil dressing
                      </li>
                    </ul>
                  </div>

                  {/* Snack */}
                  <div className="bg-white/70 rounded-xl p-4 border border-pink-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <h3 className="font-semibold text-gray-900">Snack (Every 3-4 hours)</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Handful of nuts & seeds
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Low-sugar fruit: Apple, pear, berries
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Greek yogurt or paneer cubes
                      </li>
                    </ul>
                  </div>

                  {/* Dinner */}
                  <div className="bg-white/70 rounded-xl p-4 border border-pink-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Moon className="w-4 h-4 text-indigo-500" />
                      <h3 className="font-semibold text-gray-900">Dinner (Light & Early)</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Vegetable soup + salad
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Small portion of quinoa/millets
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0" />
                        Light protein: Fish or legumes
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Key Rules */}
                <div className="bg-white/70 rounded-xl p-4 border border-pink-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <h3 className="font-semibold text-gray-900">Key Rules to Follow</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500">✅</span>
                        <span className="text-gray-600">Small frequent meals every 3-4 hours</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500">✅</span>
                        <span className="text-gray-600">35% protein, 35% complex carbs, 30% healthy fats</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500">✅</span>
                        <span className="text-gray-600">6-8 glasses of water daily</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-red-500">❌</span>
                        <span className="text-gray-600">No white rice, maida, refined sugar</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-500">❌</span>
                        <span className="text-gray-600">No junk food, bakery items, fried food</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-500">❌</span>
                        <span className="text-gray-600">Limit caffeine and processed foods</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>
        ) : null}

        {/* ═══ PERSONALIZED NUTRITION TIPS ═══════════════════════════════════════ */}
        <section>
          <ScrollReveal delay={60}>
            <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm border border-green-100">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Nutrition Tips</h2>
                  <p className="text-sm text-gray-600">Personalized recommendations for your health journey.</p>
                </div>
              </div>

              {/* Dynamic Content List */}
              <div className="space-y-4">
                {dynamicTips && dynamicTips.length > 0 ? dynamicTips.slice(0, 5).map((tip, index) => (
                  <div key={tip.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-all duration-200 cursor-pointer">
                    <div className={`w-8 h-8 rounded-full ${tip.color} flex items-center justify-center flex-shrink-0`}>
                      {tip.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900">{tip.title}</h4>
                      <p className="text-xs text-gray-500">{tip.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                )) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">Loading nutrition tips...</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </section>
      </div>
    </main>
  );
}
