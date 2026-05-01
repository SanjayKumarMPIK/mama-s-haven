import { useMemo } from "react";
import { useProfile } from "@/hooks/useProfile";
import { usePhase } from "@/hooks/usePhase";
import { Activity, Droplets, Flame, Scale } from "lucide-react";
import { Link } from "react-router-dom";

export default function FitnessCalculatorInline() {
  const { profile } = useProfile();
  const { phase } = usePhase();

  const metrics = useMemo(() => {
    const weight = profile.weight ?? 55;
    const height = profile.height ?? 160;
    const age = profile.age || 25;
    const isDefault = !profile.weight || !profile.height;

    // Mifflin-St Jeor BMR
    const bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    const activityMultiplier = profile.activityLevel === "active" ? 1.725 : profile.activityLevel === "moderate" ? 1.55 : 1.2;
    let calories = Math.round(bmr * activityMultiplier);

    // Phase adjustments
    if (phase === "maternity") calories += 340;
    else if (phase === "menopause") calories -= 50;

    // Protein
    const proteinMultiplier = profile.activityLevel === "active" ? 1.6 : profile.activityLevel === "moderate" ? 1.2 : 0.8;
    const protein = Math.round(weight * proteinMultiplier);

    // Water
    let waterMl = Math.round(weight * 35);
    if (profile.climate === "hot") waterMl += 500;
    if (phase === "maternity") waterMl += 300;
    const waterL = Math.round(waterMl / 100) / 10;

    // BMI
    const heightM = height / 100;
    const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
    const bmiCategory = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "High";

    return { calories, protein, waterL, bmi, bmiCategory, isDefault };
  }, [profile, phase]);

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5" id="fitness-calculator-inline">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏋️</span>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Fitness & Health</h3>
        </div>
        {metrics.isDefault && (
          <Link to="/profile" className="text-[10px] font-semibold text-primary hover:underline">
            Update profile →
          </Link>
        )}
      </div>

      {metrics.isDefault && (
        <p className="text-[10px] text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mb-3 border border-amber-100">
          ⓘ Based on estimated defaults. <Link to="/profile" className="underline font-semibold">Complete your profile</Link> for accuracy.
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 text-center">
          <Flame className="w-4 h-4 mx-auto text-orange-500 mb-1" />
          <p className="text-lg font-bold text-foreground">{metrics.calories}</p>
          <p className="text-[10px] text-muted-foreground font-medium">kcal/day</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center">
          <Activity className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
          <p className="text-lg font-bold text-foreground">{metrics.protein}g</p>
          <p className="text-[10px] text-muted-foreground font-medium">Protein/day</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-center">
          <Droplets className="w-4 h-4 mx-auto text-blue-500 mb-1" />
          <p className="text-lg font-bold text-foreground">{metrics.waterL}L</p>
          <p className="text-[10px] text-muted-foreground font-medium">Water/day</p>
        </div>
        <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3 text-center">
          <Scale className="w-4 h-4 mx-auto text-violet-500 mb-1" />
          <p className="text-lg font-bold text-foreground">{metrics.bmi}</p>
          <p className="text-[10px] text-muted-foreground font-medium">{metrics.bmiCategory}</p>
        </div>
      </div>
    </div>
  );
}
