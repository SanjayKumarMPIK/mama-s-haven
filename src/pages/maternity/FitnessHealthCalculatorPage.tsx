import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { calculateHealthMetrics, type HealthCalculationResult, type UserProfile } from "@/lib/nutrition/healthCalculator";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import {
  Flame, Droplets, Dumbbell, ChevronRight, Info, ArrowLeft, TrendingUp,
} from "lucide-react";

// ─── Sub-components ───────────────────────────────────────────────────────────

function AnalyticsMetricCard({
  icon: Icon,
  title,
  value,
  unit,
  insight,
  accent,
}: {
  icon: any;
  title: string;
  value: string | number;
  unit: string;
  insight: string;
  accent: any;
}) {
  return (
    <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-5 hover:shadow-md transition-all`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-md shrink-0`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>

      <p className="text-xs text-foreground/70 leading-relaxed">
        {insight}
      </p>
    </div>
  );
}

function ProfileStatChip({ label, value, accent }: { label: string; value: string; accent: any }) {
  return (
    <div className={`px-3 py-2 rounded-lg border ${accent.border} ${accent.bg} flex flex-col items-center min-w-[70px]`}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">{label}</span>
      <span className="text-sm font-bold text-foreground">{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FitnessHealthCalculatorPage() {
  const { profile } = useProfile();
  const { currentWeek, trimester } = usePregnancyProfile();

  const accent = {
    gradient: "from-purple-500 to-violet-400",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200/60",
    cardBg: "bg-gradient-to-br from-purple-50 to-violet-50",
    badge: "bg-purple-100 text-purple-700",
  };

  // Build user profile for calculations
  const userProfile: UserProfile = useMemo(() => {
    return {
      age: profile?.age || 28,
      height: profile?.height || 160,
      weight: profile?.weight || 65,
      trimester: (trimester || 2) as 1 | 2 | 3,
      activityLevel: "moderate", // Default to moderate if not available
      healthConditions: [],
    };
  }, [profile, trimester]);

  // Calculate health metrics
  const metrics = useMemo<HealthCalculationResult>(() => {
    return calculateHealthMetrics(userProfile);
  }, [userProfile]);

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Fitness & Health Calculator</h1>
                <p className="text-sm text-muted-foreground">
                  Personalized nutrition recommendations for women's health and pregnancy
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        {/* Profile Snapshot Bar */}
        <ScrollReveal>
          <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className={`w-4 h-4 ${accent.text}`} />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Profile Analytics
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ProfileStatChip label="Age" value={`${userProfile.age}y`} accent={accent} />
              <ProfileStatChip label="Height" value={`${userProfile.height}cm`} accent={accent} />
              <ProfileStatChip label="Weight" value={`${userProfile.weight}kg`} accent={accent} />
              {userProfile.trimester && (
                <ProfileStatChip label="Trimester" value={`T${userProfile.trimester}`} accent={accent} />
              )}
              <ProfileStatChip label="Activity" value={userProfile.activityLevel} accent={accent} />
            </div>
          </div>
        </ScrollReveal>

        {/* Primary Analytics Grid */}
        <ScrollReveal delay={50}>
          <div className="grid gap-4 md:grid-cols-3">
            <AnalyticsMetricCard
              icon={Flame}
              title="Daily Calorie Intake"
              value={metrics.calories.dailyCalories.toLocaleString()}
              unit="kcal"
              insight="Energy adjusted for pregnancy trimester and activity level"
              accent={accent}
            />
            <AnalyticsMetricCard
              icon={Dumbbell}
              title="Daily Protein Goal"
              value={metrics.protein.dailyProtein}
              unit="grams"
              insight="Supports baby's tissue development and body repair"
              accent={accent}
            />
            <AnalyticsMetricCard
              icon={Droplets}
              title="Daily Water Intake"
              value={metrics.water.dailyWaterLiters}
              unit="liters"
              insight="Hydration for amniotic fluid and blood volume"
              accent={accent}
            />
          </div>
        </ScrollReveal>

        {/* Visual Health Summary */}
        <ScrollReveal delay={100}>
          <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className={`w-5 h-5 ${accent.text}`} />
              <h2 className="text-base font-bold">Nutrition Balance Snapshot</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground">Calories</span>
                  <span className="text-xs font-bold text-foreground">{metrics.calories.dailyCalories} kcal</span>
                </div>
                <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-500"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground">Protein</span>
                  <span className="text-xs font-bold text-foreground">{metrics.protein.dailyProtein}g</span>
                </div>
                <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                    style={{ width: "78%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-muted-foreground">Hydration</span>
                  <span className="text-xs font-bold text-foreground">{metrics.water.dailyWaterLiters}L</span>
                </div>
                <div className="h-2 rounded-full bg-background/60 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    style={{ width: "90%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Daily Target Snapshot */}
        <ScrollReveal delay={150}>
          <div className={`rounded-2xl border-2 ${accent.border} ${accent.cardBg} p-6`}>
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className={`w-5 h-5 ${accent.text}`} />
              <h2 className="text-base font-bold">Today's Recommended Targets</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-background/60 rounded-xl p-4 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Calories</p>
                <p className="text-2xl font-bold text-foreground">{metrics.calories.dailyCalories} kcal</p>
              </div>
              <div className="bg-background/60 rounded-xl p-4 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Protein</p>
                <p className="text-2xl font-bold text-foreground">{metrics.protein.dailyProtein}g</p>
              </div>
              <div className="bg-background/60 rounded-xl p-4 border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Water</p>
                <p className="text-2xl font-bold text-foreground">{metrics.water.dailyWaterLiters}L</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Back to Nutrition Guide */}
        <ScrollReveal delay={200}>
          <Link
            to="/nutrition"
            className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Nutrition Guide
          </Link>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
