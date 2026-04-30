import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useFitnessMetrics } from "@/hooks/useFitnessMetrics";
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
  Zap,
} from "lucide-react";

function RequirementCard({
  icon: Icon,
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
  return (
    <div className={`rounded-[26px] border border-white/70 bg-gradient-to-br ${gradient} p-6 shadow-[0_12px_30px_rgba(200,146,170,0.12)]`}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75 shadow-sm">
          <Icon className="w-5 h-5 text-[#9f79be]" />
        </div>
        <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
      </div>
      <p className="mb-2 text-[28px] font-bold leading-tight text-foreground">{value}</p>
      <p className="mb-5 text-xs leading-relaxed text-foreground/70">{explanation}</p>
      <button
        type="button"
        className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:shadow"
      >
        {cta}
      </button>
    </div>
  );
}

function CalculatorCard({
  icon: Icon,
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
  return (
    <div className="rounded-[24px] border border-[#f0e9f3] bg-white p-5 shadow-[0_8px_22px_rgba(188,174,203,0.13)]">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f4efff] text-[#8b75d2]">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-foreground">{result}</p>
      <p className="mt-2 text-xs text-muted-foreground">{explanation}</p>
      {children}
      <button type="button" className="mt-4 rounded-full bg-[#f6f2fb] px-3.5 py-1.5 text-xs font-semibold text-[#7f6ebf]">
        {cta}
      </button>
    </div>
  );
}

export default function FitnessHealthCalculatorPage() {
  const { metrics, profile, healthSignals } = useFitnessMetrics();
  const bmiProgress = Math.min(100, Math.max(12, (metrics.bmi.score / 40) * 100));
  const activityLabel = metrics.activity.level === "light" ? "Light" : metrics.activity.level === "moderate" ? "Moderate" : metrics.activity.level === "active" ? "Active" : "Sedentary";

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fff8fb] via-[#fbfbff] to-[#f9fffc] py-6 md:py-8">
      <div className="container mx-auto max-w-6xl space-y-7 px-4 md:px-6">
        <div className="rounded-[28px] border border-[#f0e6f3] bg-white/80 p-5 shadow-[0_12px_30px_rgba(195,171,192,0.13)] backdrop-blur-sm md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                to="/nutrition"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f1e9f4] bg-[#fdf9ff] text-[#7f70bb]"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Fitness Health Calculator</h1>
                <p className="text-sm text-muted-foreground">Calculate your body's needs. Plan your fitness better.</p>
                <p className="mt-1 text-xs text-[#8e7a9e]">
                  Personalized from profile, calendar symptoms, health logs, and phase context.
                </p>
              </div>
            </div>
            <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fff3f8] text-[#be7ca0]">
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        <section className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b18cab]">Daily Requirements</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">What your body needs today</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
          <RequirementCard
            icon={Flame}
            title="Calories You Need"
            value={`${metrics.caloriesNeeded} kcal/day`}
            explanation="Mifflin-St Jeor + activity, goal preference, and health phase adjustments."
            cta="Auto from profile"
            gradient="from-[#ffdfe9] to-[#ffeede]"
          />
          <RequirementCard
            icon={Dumbbell}
            title="Protein You Need"
            value={`${metrics.proteinNeededG} g/day`}
            explanation="Adjusted by weight, activity level, phase-specific recovery demand, and goal."
            cta="Auto from logs"
            gradient="from-[#efe2ff] to-[#f5efff]"
          />
          <RequirementCard
            icon={Droplets}
            title="Water You Need"
            value={`${metrics.waterNeeded.liters} L/day`}
            explanation="Influenced by body weight, climate, activity, and hydration-related symptoms."
            cta="Signal-aware target"
            gradient="from-[#dff4ff] to-[#ebf8ff]"
          />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#9f78b0]" />
            <h2 className="text-base font-bold">Health Calculators</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <CalculatorCard
              icon={Scale}
              title="BMI Calculator"
              result={`${metrics.bmi.score} -> ${metrics.bmi.category}`}
              explanation="BMI reflects body mass status using height and current body weight."
              cta="Auto recalculated"
            >
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Low</span>
                  <span>Healthy</span>
                  <span>High</span>
                </div>
                <div className="h-2 rounded-full bg-[#f3ecf8]">
                  <div className="h-2 rounded-full bg-gradient-to-r from-[#8bd3dd] via-[#f8cf7a] to-[#f39c9c]" style={{ width: `${bmiProgress}%` }} />
                </div>
              </div>
            </CalculatorCard>

            <CalculatorCard
              icon={Zap}
              title="TDEE Calculator"
              result={`${metrics.tdee.maintenance} kcal`}
              explanation="Daily expenditure insights for maintenance, fat-loss mode, and muscle-gain mode."
              cta="Live requirement"
            >
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                  <p>Maintenance -&gt; {metrics.tdee.maintenance} kcal</p>
                  <p>Weight loss -&gt; {metrics.tdee.weightLoss} kcal</p>
                  <p>Muscle gain -&gt; {metrics.tdee.muscleGain} kcal</p>
              </div>
            </CalculatorCard>

            <CalculatorCard
              icon={Gauge}
              title="Metabolism Score"
              result={metrics.metabolism.label}
              explanation="Derived from age, BMI, TDEE, activity signal, and weight trend stability."
              cta={`Score ${metrics.metabolism.score}/100`}
            >
              <p className="mt-2 text-xs text-muted-foreground">{metrics.metabolism.estimatedBurn} kcal/day estimated burn</p>
            </CalculatorCard>

            <CalculatorCard
              icon={Activity}
              title="Activity Level"
              result={activityLabel}
              explanation="Inferred from profile lifestyle context, goals, and movement consistency in logs."
              cta="Context-derived"
            >
              <p className="mt-2 text-xs text-muted-foreground">{metrics.activity.score.toFixed(1)} / 10</p>
            </CalculatorCard>
          </div>
        </section>
        <section className="rounded-[24px] border border-[#efe7f3] bg-white/80 p-4 text-xs text-[#7f7391]">
          Auto-updating signals: sleep {healthSignals.avgSleepHours ?? "N/A"}h avg, fatigue {(healthSignals.fatigueFrequency * 100).toFixed(0)}%, hydration-risk {(healthSignals.hydrationLowFrequency * 100).toFixed(0)}%, phase {profile.phase}.
        </section>
      </div>
    </main>
  );
}
