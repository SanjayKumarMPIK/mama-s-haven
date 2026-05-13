import { useEffect, useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import {
  Activity,
  ArrowLeft,
  Droplets,
  Dumbbell,
  Flame,
  Gauge,
  Info,
  Scale,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { FP_NUTRITION_ACCENT, FP_NUTRITION_HOME, getFPIntentMeta, getFPSymptomLabel, summarizeFPLogs } from "./fpNutritionShared";

function RequirementCard({
  icon,
  title,
  value,
  explanation,
  cta,
  gradient,
}: {
  icon: any;
  title: string;
  value: string;
  explanation: string;
  cta: string;
  gradient: string;
}) {
  const Icon = icon;

  return (
    <div className={`rounded-[26px] border border-white/70 bg-gradient-to-br ${gradient} p-6 shadow-[0_12px_30px_rgba(97,177,166,0.12)]`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75 shadow-sm">
          <Icon className="w-5 h-5 text-teal-700" />
        </div>
        <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
      </div>
      <p className="mb-2 text-[28px] font-bold leading-tight text-foreground">{value}</p>
      <p className="mb-5 text-xs leading-relaxed text-foreground/70">{explanation}</p>
      <button type="button" className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:shadow">
        {cta}
      </button>
    </div>
  );
}

function CalculatorCard({
  icon,
  title,
  result,
  explanation,
  cta,
  children,
}: {
  icon: any;
  title: string;
  result: string;
  explanation: string;
  cta: string;
  children?: ReactNode;
}) {
  const Icon = icon;

  return (
    <div className="rounded-[24px] border border-[#d8efeb] bg-white p-5 shadow-[0_8px_22px_rgba(124,182,171,0.12)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ebfbf7] text-[#17876f]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-foreground">{result}</p>
      <p className="mt-2 text-xs text-muted-foreground">{explanation}</p>
      {children}
      <button type="button" className="mt-4 rounded-full bg-[#edf8f5] px-3.5 py-1.5 text-xs font-semibold text-[#167a67]">
        {cta}
      </button>
    </div>
  );
}

export default function FPNutritionFitnessCalculatorPage() {
  const { setPhase } = usePhase();
  const { profile } = useProfile();
  const { logs } = useHealthLog();
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const intent = fpProfile.intent ?? "tracking";
  const intentMeta = getFPIntentMeta(intent);
  const summary = useMemo(() => summarizeFPLogs(logs, 14), [logs]);
  const accent = FP_NUTRITION_ACCENT;

  useEffect(() => {
    void setPhase("family-planning");
  }, [setPhase]);

  const metrics = useMemo(() => {
    const age = profile.age || 28;
    const heightCm = profile.height ?? 160;
    const weightKg = profile.weight ?? 55;
    const bmi = profile.bmi ?? Number((weightKg / ((heightCm / 100) * (heightCm / 100))).toFixed(1));
    const bmiCategory = profile.bmiCategory !== "N/A"
      ? profile.bmiCategory
      : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";

    const activityFactor = profile.activityLevel === "active" ? 1.6 : profile.activityLevel === "moderate" ? 1.45 : 1.2;
    const bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
    const maintenance = Math.round(bmr * activityFactor);

    let calorieTarget = maintenance;
    if (intent === "ttc") {
      if (bmi < 18.5) calorieTarget += 180;
      else if (bmi >= 30) calorieTarget -= 120;
    } else if (intent === "avoid") {
      if (bmi < 18.5) calorieTarget += 160;
      else if (bmi >= 25) calorieTarget -= 150;
    } else {
      if (bmi < 18.5) calorieTarget += 180;
      else if (bmi >= 25) calorieTarget -= 120;
    }

    if ((summary.symptomCounts.fatigue ?? 0) >= 2) calorieTarget += 80;
    if (profile.activityLevel === "active") calorieTarget += 60;

    let proteinFactor = intent === "ttc" ? 1.15 : intent === "avoid" ? 1.05 : 1.1;
    if (profile.activityLevel === "active") proteinFactor += 0.15;
    if (bmi < 18.5) proteinFactor += 0.1;
    const proteinNeededG = Math.round(weightKg * proteinFactor);

    let waterLiters = weightKg * 0.033;
    if (profile.activityLevel === "moderate") waterLiters += 0.2;
    if (profile.activityLevel === "active") waterLiters += 0.4;
    if (summary.lowHydrationDays > 1) waterLiters += 0.3;
    if ((summary.symptomCounts.ovulationPain ?? 0) > 0) waterLiters += 0.2;
    waterLiters = Number(waterLiters.toFixed(1));

    let metabolismScore = 62;
    if (profile.activityLevel === "moderate") metabolismScore += 8;
    if (profile.activityLevel === "active") metabolismScore += 14;
    if (bmi >= 18.5 && bmi < 25) metabolismScore += 10;
    if (bmi < 18.5 || bmi >= 30) metabolismScore -= 8;
    if ((summary.symptomCounts.fatigue ?? 0) >= 2) metabolismScore -= 8;
    if ((summary.symptomCounts.stress ?? 0) >= 2) metabolismScore -= 6;
    if (summary.avgSleepHours !== null && summary.avgSleepHours < 6.5) metabolismScore -= 7;
    if (summary.avgHydrationGlasses !== null && summary.avgHydrationGlasses < 6) metabolismScore -= 4;
    metabolismScore = Math.max(38, Math.min(92, metabolismScore));

    const metabolismLabel = metabolismScore >= 78 ? "High" : metabolismScore >= 60 ? "Steady" : "Needs support";
    const activityScore = profile.activityLevel === "active" ? 8.7 : profile.activityLevel === "moderate" ? 7.1 : 5.2;

    const guidance = [];
    if (intent === "ttc") {
      guidance.push("Keep energy intake steady and avoid aggressive calorie cuts.");
      guidance.push("Aim for a healthy BMI with protein, iron-rich meals, folate foods, and hydration.");
    } else if (intent === "avoid") {
      guidance.push("Focus on balanced weight, stable energy, hydration, and regular meals.");
      guidance.push("Cycle awareness is clearer when sleep, stress, and food patterns stay steady.");
    } else {
      guidance.push("Use these targets as a guide for steady cycle health and daily wellness.");
      guidance.push("Balanced meals, regular activity, and hydration support clearer body signals.");
    }

    if (bmiCategory === "Underweight") {
      guidance.push("Add gentle calorie support with milk, curd, nuts, dal, eggs, or paneer instead of skipping meals.");
    }
    if (bmiCategory === "Overweight" || bmiCategory === "Obese") {
      guidance.push("Choose gentle weight management with walking, fiber, hydration, and protein-rich meals, not harsh restriction.");
    }

    return {
      age,
      heightCm,
      weightKg,
      bmi,
      bmiCategory,
      caloriesNeeded: calorieTarget,
      proteinNeededG,
      waterLiters,
      tdee: {
        maintenance,
        gentleCut: Math.max(maintenance - 220, 1200),
        gentleSupport: maintenance + 180,
      },
      metabolism: {
        score: metabolismScore,
        label: metabolismLabel,
        estimatedBurn: maintenance,
      },
      activity: {
        level: profile.activityLevel,
        score: activityScore,
      },
      guidance,
    };
  }, [intent, profile.activityLevel, profile.age, profile.bmi, profile.bmiCategory, profile.height, profile.weight, summary]);

  const bmiProgress = Math.min(100, Math.max(12, (metrics.bmi / 40) * 100));
  const recentSymptoms = summary.topSymptoms.slice(0, 3).map(getFPSymptomLabel);

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f4fffc] via-[#fbfffe] to-[#f8fbff] py-6 md:py-8">
      <div className="container mx-auto max-w-6xl space-y-7 px-4 md:px-6">
        <div className="rounded-[28px] border border-[#d8efeb] bg-white/80 p-5 shadow-[0_12px_30px_rgba(128,193,181,0.13)] backdrop-blur-sm md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link to={FP_NUTRITION_HOME} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dff1ed] bg-[#f8fffd] text-[#1a816c]">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Fitness Health Calculator</h1>
                <p className="text-sm text-muted-foreground">Profile-driven calorie, protein, hydration, and metabolism guidance.</p>
                <p className="mt-1 text-xs text-[#5e8f84]">
                  Personalized from age, height, weight, activity, goal, BMI, and family planning symptom logs.
                </p>
              </div>
            </div>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebfbf7] text-[#15836c]">
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        <section className="rounded-[24px] border border-[#d8efeb] bg-white/80 p-4 text-sm text-foreground/80 shadow-[0_8px_22px_rgba(128,193,181,0.1)]">
          <div className="flex flex-wrap gap-3">
            <span><strong>Goal:</strong> {intentMeta.label}</span>
            <span><strong>Age:</strong> {metrics.age}</span>
            <span><strong>Height:</strong> {metrics.heightCm} cm</span>
            <span><strong>Weight:</strong> {metrics.weightKg} kg</span>
            <span><strong>Activity:</strong> {metrics.activity.level}</span>
            <span><strong>BMI:</strong> {metrics.bmi} ({metrics.bmiCategory})</span>
            {recentSymptoms.length > 0 && <span><strong>Recent symptoms:</strong> {recentSymptoms.join(", ")}</span>}
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#3f8f7f]">Daily Requirements</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">What your body may need today</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <RequirementCard
              icon={Flame}
              title="Calories You Need"
              value={`${metrics.caloriesNeeded} kcal/day`}
              explanation="Built from age, height, weight, activity, BMI context, and gentle goal-aware adjustments."
              cta={intent === "ttc" ? "Steady energy focus" : "Balanced target"}
              gradient="from-[#dff8f0] to-[#eefdf8]"
            />
            <RequirementCard
              icon={Dumbbell}
              title="Protein You Need"
              value={`${metrics.proteinNeededG} g/day`}
              explanation="Adjusted for weight, activity level, family planning goal, and recent energy demands."
              cta="Protein spread matters"
              gradient="from-[#e7efff] to-[#f3f7ff]"
            />
            <RequirementCard
              icon={Droplets}
              title="Water You Need"
              value={`${metrics.waterLiters} L/day`}
              explanation="Influenced by body weight, activity, hydration logs, and cycle-related comfort needs."
              cta="Sip through the day"
              gradient="from-[#def5ff] to-[#eefbff]"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#15836c]" />
            <h2 className="text-base font-bold">Health Calculators</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <CalculatorCard
              icon={Scale}
              title="BMI Calculator"
              result={`${metrics.bmi} -> ${metrics.bmiCategory}`}
              explanation="BMI reflects current body mass status using your stored height and weight."
              cta="Auto recalculated"
            >
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Low</span>
                  <span>Healthy</span>
                  <span>High</span>
                </div>
                <div className="h-2 rounded-full bg-[#eaf5f2]">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#7ecde5] via-[#8ad0a6] to-[#f0b16c]" style={{ width: `${bmiProgress}%` }} />
                </div>
              </div>
            </CalculatorCard>

            <CalculatorCard
              icon={Zap}
              title="TDEE Calculator"
              result={`${metrics.tdee.maintenance} kcal`}
              explanation="Maintenance energy estimate, plus gentle cut or support ranges when needed."
              cta="Use as planning range"
            >
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p>Maintenance -&gt; {metrics.tdee.maintenance} kcal</p>
                <p>Gentle cut -&gt; {metrics.tdee.gentleCut} kcal</p>
                <p>Gentle support -&gt; {metrics.tdee.gentleSupport} kcal</p>
              </div>
            </CalculatorCard>

            <CalculatorCard
              icon={Gauge}
              title="Metabolism Score"
              result={metrics.metabolism.label}
              explanation="Derived from activity, BMI range, sleep, hydration, fatigue, and stress signals."
              cta={`Score ${metrics.metabolism.score}/100`}
            >
              <p className="mt-2 text-xs text-muted-foreground">{metrics.metabolism.estimatedBurn} kcal/day estimated maintenance burn</p>
            </CalculatorCard>

            <CalculatorCard
              icon={Target}
              title="Goal Focus"
              result={intentMeta.shortLabel}
              explanation="Keeps recommendations aligned to conception support, cycle awareness, or neutral tracking."
              cta="Family planning aware"
            >
              <p className="mt-2 text-xs text-muted-foreground">Recent log days: {summary.loggedDays} in the last 14 days</p>
            </CalculatorCard>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-[#d8efeb] bg-white/85 p-5 shadow-[0_8px_22px_rgba(128,193,181,0.1)]">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#15836c]" />
              <h2 className="text-base font-bold">Activity and body signals</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Activity level is read as <strong>{metrics.activity.level}</strong> with a signal score of {metrics.activity.score.toFixed(1)} / 10.
            </p>
            <p className="mt-3 text-sm text-foreground/80">
              {intent === "ttc"
                ? "Focus on a healthy BMI, steady energy, and consistent hydration. Extreme dieting is not recommended here."
                : intent === "avoid"
                ? "The goal here is weight balance, metabolic steadiness, hydration, and better cycle awareness."
                : "Use these numbers to keep meals and movement steady rather than chasing aggressive changes."}
            </p>
          </div>

          <div className="rounded-[24px] border border-[#d8efeb] bg-white/85 p-5 shadow-[0_8px_22px_rgba(128,193,181,0.1)]">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#15836c]" />
              <h2 className="text-base font-bold">Gentle guidance</h2>
            </div>
            <div className="space-y-2.5">
              {metrics.guidance.map((tip) => (
                <div key={tip} className="rounded-xl border border-border/40 bg-muted/20 px-3.5 py-3 text-sm text-foreground/85">
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`rounded-[24px] border ${accent.border} ${accent.bg} p-4 text-xs ${accent.text}`}>
          Auto-updating signals: sleep {summary.avgSleepHours ?? "N/A"}h avg, hydration {summary.avgHydrationGlasses ?? "N/A"} glasses avg, fatigue {(summary.symptomCounts.fatigue ?? 0)}x, stress {(summary.symptomCounts.stress ?? 0)}x, goal {intentMeta.label}.
        </section>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}
