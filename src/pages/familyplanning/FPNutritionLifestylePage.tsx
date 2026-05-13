import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useProfile } from "@/hooks/useProfile";
import { useHealthLog } from "@/hooks/useHealthLog";
import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";
import ScrollReveal from "@/components/ScrollReveal";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import { Activity, ArrowLeft, Droplets, Leaf, Moon, Wind } from "lucide-react";
import { FP_NUTRITION_ACCENT, FP_NUTRITION_HOME, getFPIntentMeta, summarizeFPLogs } from "./fpNutritionShared";

const DAILY_ROUTINE: Record<string, string[]> = {
  ttc: [
    "Keep sleep and wake times as steady as possible.",
    "Sip water through the day instead of waiting until you feel thirsty.",
    "Choose moderate activity like walking or yoga most days.",
    "Add one stress reset habit before dinner or bedtime.",
    "Track cycle signs consistently, not only around fertile days.",
  ],
  avoid: [
    "Track cycle dates consistently and review changes early.",
    "Use protection awareness reminders instead of relying only on app predictions.",
    "Keep sleep and stress routines steady for clearer body signals.",
    "Notice energy, bleeding, and symptom shifts month to month.",
    "Follow doctor or health worker advice where contraception guidance is needed.",
  ],
  tracking: [
    "Build a simple routine for cycle and symptom awareness.",
    "Track sleep, hydration, and mood alongside period dates.",
    "Use gentle movement to support energy and comfort.",
    "Keep meals regular so energy dips are easier to notice.",
    "Review your symptoms weekly instead of waiting for them to pile up.",
  ],
};

export default function FPNutritionLifestylePage() {
  const { setPhase } = usePhase();
  const { profile } = useProfile();
  const { logs } = useHealthLog();
  const { profile: fpProfile } = useFamilyPlanningProfile();
  const intent = fpProfile.intent ?? "tracking";

  useEffect(() => {
    void setPhase("family-planning");
  }, [setPhase]);

  const summary = useMemo(() => summarizeFPLogs(logs, 14), [logs]);
  const intentMeta = getFPIntentMeta(intent);
  const accent = FP_NUTRITION_ACCENT;

  const stressTips = [
    "Take one 60-second breathing pause before meals or bed.",
    "Use a 5-minute calm break when you notice stress building.",
    "Choose a gentle walk to settle restless energy.",
    "Reduce screen time for 30 minutes before sleep.",
  ];

  const activityTips = useMemo(() => {
    const base = [
      "Light walking supports circulation and steady energy.",
      "Stretching can ease tension around the lower back and hips.",
      "Moderate exercise is usually more sustainable than intense bursts.",
      "Avoid overexertion when sleep, fatigue, or stress signals are high.",
    ];

    if (profile.bmiCategory === "Underweight") {
      return [...base, "Prioritize recovery meals after activity so weight and energy stay supported."];
    }

    if (profile.bmiCategory === "Overweight" || profile.bmiCategory === "Obese") {
      return [...base, "Aim for consistency over intensity, such as brisk walks and simple strength work."];
    }

    return base;
  }, [profile.bmiCategory]);

  const sleepHydrationTips = useMemo(() => {
    const tips: string[] = [];

    if (summary.avgSleepHours !== null && summary.avgSleepHours < 7) {
      tips.push("Your recent sleep looks low. Try a fixed bedtime, lighter late meals, and a quieter evening routine.");
    } else {
      tips.push("Protect a consistent 7 to 8 hour sleep window to support hormones, mood, and recovery.");
    }

    if (summary.avgHydrationGlasses !== null && summary.avgHydrationGlasses < 6) {
      tips.push("Hydration has been low. Keep a water bottle nearby and pair water with meals and snacks.");
    } else {
      tips.push("Keep water intake steady through the day, especially around activity and warmer weather.");
    }

    if (!summary.hasLogs) {
      tips.push("Start logging sleep and hydration in the calendar to unlock more specific guidance here.");
    }

    return tips;
  }, [summary]);

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <Link to={FP_NUTRITION_HOME} className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center hover:bg-muted/50 transition-colors">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Lifestyle</h1>
                <p className="text-sm text-muted-foreground">
                  Daily routines that support {intentMeta.label.toLowerCase()}, energy, and cycle awareness
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-6">
        <ScrollReveal>
          <div className={`rounded-2xl border ${accent.border} ${accent.bg} p-5`}>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">Current focus</p>
            <p className="text-sm font-medium text-foreground/90">
              {intentMeta.emoji} {intentMeta.label} with {profile.activityLevel} activity and {profile.bmiCategory.toLowerCase()} BMI guidance.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-2">
          <ScrollReveal>
            <SectionCard icon={Leaf} title="Daily Routine" subtitle="Goal-based habits">
              {DAILY_ROUTINE[intent].map((tip) => (
                <TipRow key={tip} text={tip} />
              ))}
            </SectionCard>
          </ScrollReveal>

          <ScrollReveal delay={20}>
            <SectionCard icon={Wind} title="Stress Management" subtitle="Simple calm resets">
              {stressTips.map((tip) => (
                <TipRow key={tip} text={tip} />
              ))}
            </SectionCard>
          </ScrollReveal>

          <ScrollReveal delay={30}>
            <SectionCard icon={Activity} title="Physical Activity" subtitle="Light to moderate movement">
              {activityTips.map((tip) => (
                <TipRow key={tip} text={tip} />
              ))}
            </SectionCard>
          </ScrollReveal>

          <ScrollReveal delay={40}>
            <SectionCard icon={Moon} title="Sleep & Hydration" subtitle="Log-aware reminders">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <MetricCard label="Avg sleep" value={summary.avgSleepHours !== null ? `${summary.avgSleepHours}h` : "No logs"} tone="indigo" />
                <MetricCard label="Avg hydration" value={summary.avgHydrationGlasses !== null ? `${summary.avgHydrationGlasses} glasses` : "No logs"} tone="blue" />
              </div>
              {sleepHydrationTips.map((tip) => (
                <TipRow key={tip} text={tip} />
              ))}
            </SectionCard>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={50}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-4 h-4 text-indigo-600" />
                <p className="text-sm font-semibold text-indigo-900">Sleep signal</p>
              </div>
              <p className="text-sm text-indigo-800 leading-relaxed">
                {summary.lowSleepDays > 0
                  ? `${summary.lowSleepDays} low-sleep day${summary.lowSleepDays === 1 ? "" : "s"} were logged recently. Prioritize wind-down time and keep bedtime more regular.`
                  : "No recent low-sleep signal was detected. Keep protecting a consistent sleep routine."}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-4 h-4 text-sky-600" />
                <p className="text-sm font-semibold text-sky-900">Hydration signal</p>
              </div>
              <p className="text-sm text-sky-800 leading-relaxed">
                {summary.lowHydrationDays > 0
                  ? `${summary.lowHydrationDays} low-hydration day${summary.lowHydrationDays === 1 ? "" : "s"} showed up in recent logs. Pair water with each meal and snack to make it easier to maintain.`
                  : "Hydration looks steady from recent logs. Keep spacing water through the day instead of drinking it all at once."}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children }: any) {
  return (
    <div className="rounded-[24px] border border-border/50 bg-card p-5 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function TipRow({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-muted/20 px-3.5 py-3 text-sm text-foreground/85 leading-relaxed">
      {text}
    </div>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string; tone: "indigo" | "blue" }) {
  const styles = tone === "indigo"
    ? "border-indigo-200 bg-indigo-50 text-indigo-700"
    : "border-sky-200 bg-sky-50 text-sky-700";

  return (
    <div className={`rounded-2xl border p-3 ${styles}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
