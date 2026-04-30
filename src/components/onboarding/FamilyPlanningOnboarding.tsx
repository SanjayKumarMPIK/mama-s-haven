/**
 * FamilyPlanningOnboarding.tsx
 *
 * 4-step onboarding wizard for the Family Planning module:
 *   Step 1 — Reproductive History (children count + birth types)
 *   Step 2 — User Intent (TTC / Avoid / Just Tracking)
 *   Step 3 — Cycle Awareness (Regular / Irregular / Not sure)
 *   Step 4 — Optional Health Context (conditions, recent childbirth)
 *
 * Matches the existing OnboardingFlow.tsx / PubertyQuestions.tsx design patterns.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, Plus, Minus, Baby, Heart, Shield, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FPChild, FPIntent, CycleRegularity } from "@/hooks/useFamilyPlanningProfile";

interface FamilyPlanningOnboardingProps {
  onComplete: (data: {
    hasChildren: boolean;
    children: FPChild[];
    intent: FPIntent;
    cycleRegularity: CycleRegularity;
    knownConditions: string;
    recentChildbirth: boolean;
  }) => void;
}

type Step = "children" | "intent" | "cycle" | "health" | "done";

const STEP_ORDER: Step[] = ["children", "intent", "cycle", "health", "done"];
const TOTAL_STEPS = 4;

function getStepIndex(step: Step): number {
  const idx = STEP_ORDER.indexOf(step);
  return idx >= 0 ? Math.min(idx, TOTAL_STEPS - 1) : 0;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            i === current
              ? "w-8 bg-teal-500"
              : i < current
              ? "w-2 bg-teal-400/60"
              : "w-2 bg-slate-200",
          )}
        />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FamilyPlanningOnboarding({ onComplete }: FamilyPlanningOnboardingProps) {
  const [step, setStep] = useState<Step>("children");

  // Step 1
  const [hasChildren, setHasChildren] = useState<boolean | null>(null);
  const [children, setChildren] = useState<FPChild[]>([]);

  // Step 2
  const [intent, setIntent] = useState<FPIntent | null>(null);

  // Step 3
  const [cycleRegularity, setCycleRegularity] = useState<CycleRegularity | null>(null);

  // Step 4
  const [knownConditions, setKnownConditions] = useState("");
  const [recentChildbirth, setRecentChildbirth] = useState<boolean | null>(null);

  // ─── Children helpers ───────────────────────────────────────────────────────

  const addChild = () => {
    if (children.length < 10) {
      setChildren((prev) => [...prev, { birthType: "normal" }]);
    }
  };

  const removeChild = () => {
    if (children.length > 1) {
      setChildren((prev) => prev.slice(0, -1));
    }
  };

  const updateChildBirthType = (index: number, type: "normal" | "c-section") => {
    setChildren((prev) =>
      prev.map((c, i) => (i === index ? { ...c, birthType: type } : c)),
    );
  };

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const goNext = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx < STEP_ORDER.length - 1) setStep(STEP_ORDER[idx + 1]);
  };

  const goBack = () => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx > 0) setStep(STEP_ORDER[idx - 1]);
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case "children":
        return hasChildren !== null && (hasChildren === false || children.length > 0);
      case "intent":
        return intent !== null;
      case "cycle":
        return cycleRegularity !== null;
      case "health":
        return true; // optional
      default:
        return false;
    }
  };

  const handleFinish = () => {
    onComplete({
      hasChildren: hasChildren ?? false,
      children: hasChildren ? children : [],
      intent: intent ?? "tracking",
      cycleRegularity: cycleRegularity ?? "not-sure",
      knownConditions,
      recentChildbirth: recentChildbirth ?? false,
    });
  };

  // ─── Done Screen ───────────────────────────────────────────────────────────

  if (step === "done") {
    return (
      <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-teal-50 via-white to-emerald-50 overflow-y-auto">
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <div className="animate-fadeIn text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-200/50">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">You're all set! 🌿</h2>
            <p className="text-slate-500 mb-4 leading-relaxed">
              Your family planning experience has been personalized based on your answers.
            </p>

            {/* Quick summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-left space-y-3 mb-8 shadow-sm">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base">👶</span>
                <span className="text-slate-600">
                  {hasChildren ? `${children.length} child${children.length > 1 ? "ren" : ""}` : "No children yet"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base">
                  {intent === "ttc" ? "💕" : intent === "avoid" ? "🛡️" : "📊"}
                </span>
                <span className="text-slate-600">
                  {intent === "ttc"
                    ? "Trying to conceive"
                    : intent === "avoid"
                    ? "Avoiding pregnancy"
                    : "Tracking cycles"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-base">📅</span>
                <span className="text-slate-600">
                  Cycles: {cycleRegularity === "regular" ? "Regular" : cycleRegularity === "irregular" ? "Irregular" : "Not sure"}
                </span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-lg shadow-teal-200/40 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              Go to Dashboard <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render Steps ──────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-teal-50 via-white to-emerald-50 overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold mb-3">
            🌿 Family Planning Setup
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Personalize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Journey</span>
          </h1>
        </div>

        <StepBar current={getStepIndex(step)} total={TOTAL_STEPS} />

        <div className="w-full max-w-xl">
          {/* ───── Step 1: Reproductive History ───── */}
          {step === "children" && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                  Do you have children?
                </h2>
                <p className="text-sm text-slate-500">
                  This helps us provide relevant spacing and recovery guidance.
                </p>
              </div>

              {/* Yes / No */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { val: true, label: "Yes", emoji: "👶" },
                  { val: false, label: "No", emoji: "🌱" },
                ].map((opt) => {
                  const selected = hasChildren === opt.val;
                  return (
                    <button
                      key={String(opt.val)}
                      onClick={() => {
                        setHasChildren(opt.val);
                        if (opt.val && children.length === 0) setChildren([{ birthType: "normal" }]);
                        if (!opt.val) setChildren([]);
                      }}
                      className={cn(
                        "relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 active:scale-[0.97]",
                        selected
                          ? "border-teal-400 bg-teal-50 shadow-sm shadow-teal-100"
                          : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50",
                      )}
                    >
                      <span className="text-3xl">{opt.emoji}</span>
                      <span className="text-sm font-semibold text-slate-700">{opt.label}</span>
                      {selected && (
                        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Children details */}
              {hasChildren && children.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">
                      Number of children: {children.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={removeChild}
                        disabled={children.length <= 1}
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-30 transition-all"
                      >
                        <Minus className="w-4 h-4 text-slate-600" />
                      </button>
                      <button
                        onClick={addChild}
                        disabled={children.length >= 10}
                        className="w-8 h-8 rounded-lg border border-teal-200 bg-teal-50 flex items-center justify-center hover:bg-teal-100 disabled:opacity-30 transition-all"
                      >
                        <Plus className="w-4 h-4 text-teal-600" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {children.map((child, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center shrink-0">
                          <Baby className="w-4 h-4 text-teal-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-600 shrink-0">
                          Child {idx + 1}
                        </span>
                        <div className="flex gap-2 ml-auto">
                          {(["normal", "c-section"] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => updateChildBirthType(idx, type)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                child.birthType === type
                                  ? "bg-teal-500 text-white shadow-sm"
                                  : "bg-white border border-slate-200 text-slate-600 hover:border-teal-200",
                              )}
                            >
                              {type === "normal" ? "Normal" : "C-Section"}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───── Step 2: User Intent ───── */}
          {step === "intent" && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                  What are you planning right now?
                </h2>
                <p className="text-sm text-slate-500">
                  We'll adapt your entire experience based on your goal.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    val: "ttc" as FPIntent,
                    emoji: "💕",
                    icon: Heart,
                    title: "Trying to get pregnant",
                    desc: "Fertility window predictions, best days to try, health preparation tips",
                    gradient: "from-rose-50 to-pink-50",
                    border: "border-rose-200 hover:border-rose-400",
                    activeBorder: "border-rose-400 ring-2 ring-rose-200",
                    activeBg: "bg-rose-50",
                  },
                  {
                    val: "avoid" as FPIntent,
                    emoji: "🛡️",
                    icon: Shield,
                    title: "Avoiding pregnancy",
                    desc: "Safe days, daily risk guidance, contraception awareness",
                    gradient: "from-amber-50 to-orange-50",
                    border: "border-amber-200 hover:border-amber-400",
                    activeBorder: "border-amber-400 ring-2 ring-amber-200",
                    activeBg: "bg-amber-50",
                  },
                  {
                    val: "tracking" as FPIntent,
                    emoji: "📊",
                    icon: BarChart3,
                    title: "Not sure / just tracking",
                    desc: "Neutral cycle tracking with educational content",
                    gradient: "from-slate-50 to-gray-50",
                    border: "border-slate-200 hover:border-slate-400",
                    activeBorder: "border-teal-400 ring-2 ring-teal-200",
                    activeBg: "bg-teal-50",
                  },
                ].map((opt) => {
                  const selected = intent === opt.val;
                  return (
                    <button
                      key={opt.val}
                      onClick={() => setIntent(opt.val)}
                      className={cn(
                        "relative w-full text-left rounded-2xl border-2 p-5 transition-all duration-300 active:scale-[0.98]",
                        `bg-gradient-to-br ${opt.gradient}`,
                        selected ? opt.activeBorder + " " + opt.activeBg : opt.border,
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl mt-0.5">{opt.emoji}</span>
                        <div className="flex-1">
                          <h3 className="text-base font-bold text-slate-800 mb-1">{opt.title}</h3>
                          <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                        </div>
                        {selected && (
                          <span className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mt-1">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ───── Step 3: Cycle Awareness ───── */}
          {step === "cycle" && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                  Are your cycles regular?
                </h2>
                <p className="text-sm text-slate-500">
                  This helps us fine-tune fertility predictions and risk assessments.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    val: "regular" as CycleRegularity,
                    label: "Regular",
                    desc: "My period comes around the same time each month",
                    emoji: "✅",
                  },
                  {
                    val: "irregular" as CycleRegularity,
                    label: "Irregular",
                    desc: "My cycle length varies significantly",
                    emoji: "🔄",
                  },
                  {
                    val: "not-sure" as CycleRegularity,
                    label: "Not sure",
                    desc: "I haven't been tracking my cycle",
                    emoji: "❓",
                  },
                ].map((opt) => {
                  const selected = cycleRegularity === opt.val;
                  return (
                    <button
                      key={opt.val}
                      onClick={() => setCycleRegularity(opt.val)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium active:scale-[0.98]",
                        selected
                          ? "border-teal-400 bg-teal-50 shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-slate-50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{opt.emoji}</span>
                          <div>
                            <span className="text-sm font-semibold text-slate-800">{opt.label}</span>
                            <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                        {selected && <Check className="w-5 h-5 text-teal-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Warning for irregular cycles */}
              {cycleRegularity === "irregular" && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 animate-fadeIn">
                  <p className="font-semibold mb-1">📋 Note</p>
                  <p className="text-xs leading-relaxed">
                    Irregular cycles may affect the accuracy of natural fertility predictions.
                    We'll account for this in your guidance and recommend extra caution.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ───── Step 4: Optional Health Context ───── */}
          {step === "health" && (
            <div className="animate-fadeIn">
              <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">
                  Any health details? <span className="text-slate-400 text-lg">(Optional)</span>
                </h2>
                <p className="text-sm text-slate-500">
                  This is optional but helps us personalize your guidance further.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-5 shadow-sm">
                {/* Known conditions */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Any known health conditions
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., PCOS, Thyroid, Diabetes (optional)"
                    value={knownConditions}
                    onChange={(e) => setKnownConditions(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 transition-all"
                  />
                </div>

                {/* Recent childbirth */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Recent childbirth (within 6 months)?
                  </label>
                  <div className="flex gap-3">
                    {[
                      { val: true, label: "Yes" },
                      { val: false, label: "No" },
                    ].map((opt) => (
                      <button
                        key={String(opt.val)}
                        onClick={() => setRecentChildbirth(opt.val)}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                          recentChildbirth === opt.val
                            ? "border-teal-400 bg-teal-50 text-teal-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-200",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {recentChildbirth && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800 animate-fadeIn">
                    <p className="font-semibold mb-1">💡 Postpartum Note</p>
                    <p className="leading-relaxed">
                      After recent childbirth, your body needs time to recover. We'll include
                      spacing awareness and postpartum-specific guidance in your dashboard.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ───── Navigation Buttons ───── */}
          <div className="flex flex-col items-center gap-3 mt-8">
            <button
              onClick={() => {
                if (step === "health") {
                  goNext(); // goes to "done"
                } else {
                  goNext();
                }
              }}
              disabled={!canAdvance()}
              className="w-full max-w-xs py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold shadow-lg shadow-teal-200/40 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {step === "health" ? "Complete Setup" : "Next"} <ChevronRight className="w-4 h-4" />
            </button>

            {step !== "children" && (
              <button
                onClick={goBack}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}

            {step === "health" && (
              <button
                onClick={() => setStep("done")}
                className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
