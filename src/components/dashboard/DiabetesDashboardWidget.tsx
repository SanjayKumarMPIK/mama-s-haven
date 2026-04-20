import { useState, useEffect, useCallback } from "react";
import ScrollReveal from "@/components/ScrollReveal";

const MATERNITY_DIABETES_HEALTH_KEY = "maternity-module-diabetes-health";

type DiabetesStage = "pre" | "gestational" | "unknown" | "none";

type MaternityHealthState = {
  diabetesStage: DiabetesStage;
  diabetesPromptShown: boolean;
  recheckPromptShown: boolean;
  symptoms: string[];
  riskScore: number;
};

const DEFAULT_MATERNITY_HEALTH: MaternityHealthState = {
  diabetesStage: "none",
  diabetesPromptShown: false,
  recheckPromptShown: false,
  symptoms: [],
  riskScore: 0,
};

const DIABETES_STAGES: DiabetesStage[] = ["pre", "gestational", "unknown", "none"];

function loadMaternityHealthMerged(): MaternityHealthState {
  try {
    const raw = localStorage.getItem(MATERNITY_DIABETES_HEALTH_KEY);
    if (!raw) return { ...DEFAULT_MATERNITY_HEALTH };
    const parsed = JSON.parse(raw) as Partial<MaternityHealthState>;
    const stage =
      parsed.diabetesStage && DIABETES_STAGES.includes(parsed.diabetesStage as DiabetesStage)
        ? (parsed.diabetesStage as DiabetesStage)
        : DEFAULT_MATERNITY_HEALTH.diabetesStage;
    return {
      ...DEFAULT_MATERNITY_HEALTH,
      ...parsed,
      diabetesStage: stage,
      diabetesPromptShown: !!parsed.diabetesPromptShown,
      recheckPromptShown: !!parsed.recheckPromptShown,
      symptoms: Array.isArray(parsed.symptoms)
        ? parsed.symptoms.filter((s): s is string => typeof s === "string")
        : DEFAULT_MATERNITY_HEALTH.symptoms,
      riskScore:
        typeof parsed.riskScore === "number" && !Number.isNaN(parsed.riskScore)
          ? Math.min(100, Math.max(0, parsed.riskScore))
          : DEFAULT_MATERNITY_HEALTH.riskScore,
    };
  } catch {
    return { ...DEFAULT_MATERNITY_HEALTH };
  }
}

export function DiabetesDashboardWidget({ currentWeek }: { currentWeek: number }) {
  const [health, setHealth] = useState<MaternityHealthState>(() => loadMaternityHealthMerged());

  const updateStage = useCallback((stage: DiabetesStage) => {
    setHealth((prev) => ({
      ...(prev ?? DEFAULT_MATERNITY_HEALTH),
      diabetesStage: stage,
      diabetesPromptShown: true,
    }));
  }, []);

  const handleRecheck = useCallback((value: "yes" | "no" | "unknown") => {
    setHealth((prev) => ({
      ...(prev ?? DEFAULT_MATERNITY_HEALTH),
      diabetesStage:
        value === "yes" ? "gestational" : prev?.diabetesStage ?? DEFAULT_MATERNITY_HEALTH.diabetesStage,
      recheckPromptShown: true,
    }));
  }, []);

  const toggleDiabetesSymptom = useCallback((id: string) => {
    setHealth((prev) => {
      const base = prev ?? DEFAULT_MATERNITY_HEALTH;
      const symptoms = base.symptoms ?? [];
      const has = symptoms.includes(id);
      return {
        ...base,
        symptoms: has ? symptoms.filter((s) => s !== id) : [...symptoms, id],
      };
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(MATERNITY_DIABETES_HEALTH_KEY, JSON.stringify(health));
    } catch {
      /* ignore */
    }
  }, [health]);

  useEffect(() => {
    const symptoms = health?.symptoms ?? [];
    let score = 0;
    if (symptoms.includes("frequent_thirst")) score += 30;
    if (symptoms.includes("frequent_urination")) score += 30;
    if (symptoms.includes("fatigue")) score += 10;
    if (currentWeek >= 20) score += 20;
    const next = Math.min(score, 100);
    setHealth((prev) => {
      const p = prev ?? DEFAULT_MATERNITY_HEALTH;
      return p.riskScore === next ? p : { ...p, riskScore: next };
    });
  }, [health?.symptoms, currentWeek]);

  const showBloodSugarCare =
    health?.diabetesStage === "pre" ||
    health?.diabetesStage === "gestational" ||
    (health?.riskScore ?? 0) >= 40;

  const btnRow =
    "block w-full sm:w-auto text-left text-sm px-3 py-2 rounded-lg border border-border/60 bg-background hover:bg-muted/50 transition-colors";

  return (
    <div className="space-y-6">
      {!health?.diabetesPromptShown && (
        <ScrollReveal>
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm text-left p-5">
            <h4 className="font-bold mb-1 text-primary">Health Info Setup</h4>
            <p className="text-xs text-muted-foreground mb-3">Do any of these apply to your pregnancy regarding diabetes?</p>
            <div className="flex flex-col gap-2">
              <button type="button" className={btnRow} onClick={() => updateStage("pre")}>
                Had diabetes before pregnancy
              </button>
              <button type="button" className={btnRow} onClick={() => updateStage("gestational")}>
                Diagnosed during pregnancy
              </button>
              <button type="button" className={btnRow} onClick={() => updateStage("unknown")}>
                Not sure
              </button>
              <button type="button" className={btnRow} onClick={() => updateStage("none")}>
                None
              </button>
            </div>
          </div>
        </ScrollReveal>
      )}

      {currentWeek >= 20 && !health?.recheckPromptShown && (
        <ScrollReveal>
          <div className="rounded-2xl border border-border/60 bg-card shadow-sm text-left p-5">
            <h4 className="font-bold mb-1 text-primary">Mid-Pregnancy Health Check</h4>
            <p className="text-xs text-muted-foreground mb-3">Have you been diagnosed with gestational diabetes recently?</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2">
              <button type="button" className={btnRow} onClick={() => handleRecheck("yes")}>
                Yes
              </button>
              <button type="button" className={btnRow} onClick={() => handleRecheck("no")}>
                No
              </button>
              <button type="button" className={btnRow} onClick={() => handleRecheck("unknown")}>
                Not sure
              </button>
            </div>
          </div>
        </ScrollReveal>
      )}

      <ScrollReveal delay={100}>
        <div className="rounded-2xl border border-border/60 bg-card shadow-sm text-left p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <span className="text-pink-600 text-lg">🩸</span>
            </div>
            <div>
              <h4 className="font-bold text-sm">Blood sugar insights</h4>
              <p className="text-[10px] text-muted-foreground">Tick any that apply</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-sm mt-3">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-input text-primary focus:ring-primary"
                checked={!!health?.symptoms?.includes("frequent_thirst")}
                onChange={() => toggleDiabetesSymptom("frequent_thirst")}
              />
              Frequent thirst
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-input text-primary focus:ring-primary"
                checked={!!health?.symptoms?.includes("frequent_urination")}
                onChange={() => toggleDiabetesSymptom("frequent_urination")}
              />
              Frequent urination
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-input text-primary focus:ring-primary"
                checked={!!health?.symptoms?.includes("fatigue")}
                onChange={() => toggleDiabetesSymptom("fatigue")}
              />
              Fatigue
            </label>
          </div>
        </div>
      </ScrollReveal>

      {(health?.riskScore ?? 0) >= 40 && (
        <ScrollReveal delay={120}>
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 shadow-sm text-left p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-bold">!</span>
              </div>
              <h4 className="font-bold text-amber-900">Blood Sugar Insight</h4>
            </div>
            <p className="text-sm font-semibold text-amber-900/90">Risk Score: {health?.riskScore ?? 0}%</p>
            <p className="text-xs text-amber-900/80 mt-1">
              Based on your symptoms and stage, this may indicate blood sugar changes. Consider mentioning this at your next clinic visit.
            </p>
          </div>
        </ScrollReveal>
      )}

      {showBloodSugarCare && (
        <ScrollReveal delay={140}>
          <div className="rounded-2xl border border-teal-200 bg-teal-50/60 shadow-sm text-left p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                <span className="text-teal-600">🥗</span>
              </div>
              <h4 className="font-bold text-teal-900">Blood Sugar Care Tips</h4>
            </div>
            <ul className="list-disc pl-5 text-xs text-teal-800/80 space-y-1.5 marker:text-teal-400">
              <li>Prefer complex carbohydrates (whole grains, oats, lentils).</li>
              <li>Avoid high-sugar foods and sweet drinks.</li>
              <li>Eat smaller, frequent meals throughout the day.</li>
              <li>Stay active with light walking after meals if permitted by your doctor.</li>
            </ul>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
