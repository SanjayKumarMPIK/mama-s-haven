import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PubertyOnboardingData } from "@/hooks/useOnboarding";

interface PubertyQuestionsProps {
  onComplete: (data: PubertyOnboardingData) => void;
  onBack: () => void;
  userDob?: string;
}

type Step = "awareness" | "menstrual_status" | "cycle_regularity" | "completion";

function calcAgeFromDob(dob?: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function PubertyQuestions({ onComplete, onBack, userDob }: PubertyQuestionsProps) {
  const [step, setStep] = useState<Step>("awareness");
  const [data, setData] = useState<PubertyOnboardingData>({});
  const [firstPeriodMonth, setFirstPeriodMonth] = useState("");
  const [firstPeriodYear, setFirstPeriodYear] = useState("");

  const userAge = useMemo(() => calcAgeFromDob(userDob), [userDob]);
  const currentYear = new Date().getFullYear();

  const menarcheInsights = useMemo(() => {
    if (!data.has_started_periods || !firstPeriodMonth || !firstPeriodYear || userAge === null) return null;
    const year = Number(firstPeriodYear);
    const month = Number(firstPeriodMonth);
    if (Number.isNaN(year) || Number.isNaN(month)) return null;
    const firstPeriodDate = new Date(year, month - 1, 1);
    if (isNaN(firstPeriodDate.getTime())) return null;
    const now = new Date();
    let yearsSinceMenarche = now.getFullYear() - year;
    const monthDiff = now.getMonth() - (month - 1);
    if (monthDiff < 0) yearsSinceMenarche--;
    const menarcheAge = userAge - yearsSinceMenarche;
    if (menarcheAge < 0) return null;
    const category =
      menarcheAge < 8 ? "Early Puberty" : menarcheAge > 15 ? "Late Puberty" : "Normal";
    return { menarcheAge, category } as const;
  }, [data.has_started_periods, firstPeriodMonth, firstPeriodYear, userAge]);

  const totalSteps = 3;
  const currentStepIndex = step === "awareness" ? 1 : step === "menstrual_status" ? 2 : step === "cycle_regularity" ? 3 : 3;

  const finalize = () => {
    const payload: PubertyOnboardingData = {
      ...data,
      first_period_month: firstPeriodMonth || undefined,
      first_period_year: firstPeriodYear || undefined,
      menarche_age: menarcheInsights?.menarcheAge,
      menarche_category: menarcheInsights?.category,
    };
    onComplete(payload);
  };

  if (step === "completion") {
    return (
      <div className="animate-fadeIn text-center flex flex-col justify-center items-center h-full max-w-md mx-auto py-20 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-3">You're all set 🎉</h2>
        <p className="text-slate-600 mb-10 leading-relaxed text-lg">
          We’ll personalize your experience based on your answers.
        </p>
        <button
          onClick={finalize}
          className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
        >
          Go to Dashboard <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full max-w-xl mx-auto flex flex-col h-[70vh] sm:h-auto min-h-[400px]">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => {
            if (step === "awareness") onBack();
            else if (step === "menstrual_status") setStep("awareness");
            else setStep("menstrual_status");
          }}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 max-w-[200px] mx-4 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStepIndex / totalSteps) * 100}%` }}
          />
        </div>

        <button
          onClick={() => {
            if (step === "awareness") setStep("menstrual_status");
            else if (step === "menstrual_status") setStep("cycle_regularity");
            else setStep("completion");
          }}
          className="text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors px-2"
        >
          Skip
        </button>
      </div>

      {step === "awareness" && (
        <>
          <div className="flex-1 flex flex-col justify-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 leading-tight">
              Do you know about periods?
            </h2>
          </div>
          <div className="space-y-3 mb-8">
            {["Yes", "No"].map((opt) => {
              const isSelected = data.period_awareness === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setData((prev) => ({ ...prev, period_awareness: opt as "Yes" | "No" }))}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                  </div>
                </button>
              );
            })}
            {data.period_awareness === "No" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 space-y-2">
                <p className="font-semibold flex items-center gap-2"><Info className="w-4 h-4" /> Basic education + daily affirmations</p>
                <p>"Periods are a natural and healthy part of growing up."</p>
                <p>"Your body changes are normal."</p>
                <p>"It's okay to learn at your own pace."</p>
              </div>
            )}
          </div>
        </>
      )}

      {step === "menstrual_status" && (
        <>
          <div className="flex-1 flex flex-col justify-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 leading-tight">
              Have you started your periods?
            </h2>
          </div>
          <div className="space-y-3 mb-6">
            {["Yes", "No"].map((opt) => {
              const selected = data.has_started_periods === (opt === "Yes");
              return (
                <button
                  key={opt}
                  onClick={() => setData((prev) => ({ ...prev, has_started_periods: opt === "Yes" }))}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium",
                    selected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {selected && <Check className="w-5 h-5 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
          {data.has_started_periods && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 mb-8 space-y-3">
              <p className="text-sm font-semibold text-slate-700">When did your first period start? (Menarche)</p>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={firstPeriodMonth}
                  onChange={(e) => setFirstPeriodMonth(e.target.value)}
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={String(m)}>{String(m).padStart(2, "0")}</option>
                  ))}
                </select>
                <select
                  value={firstPeriodYear}
                  onChange={(e) => setFirstPeriodYear(e.target.value)}
                  className="h-11 rounded-lg border border-slate-200 px-3 text-sm"
                >
                  <option value="">Year</option>
                  {Array.from({ length: 20 }, (_, i) => currentYear - i).map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
              {menarcheInsights && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-sm">
                  <p className="font-semibold text-slate-800">
                    Age at menarche: {menarcheInsights.menarcheAge} years ({menarcheInsights.category})
                  </p>
                  {menarcheInsights.category === "Early Puberty" && (
                    <p className="text-slate-600 mt-1">Care tips: focus on nutrition, emotional support, and regular check-ins with trusted caregivers.</p>
                  )}
                  {menarcheInsights.category === "Late Puberty" && (
                    <p className="text-slate-600 mt-1">Reassurance: puberty timing can vary. Consider a health check if concerns continue.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {step === "cycle_regularity" && (
        <>
          <div className="flex-1 flex flex-col justify-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 leading-tight">
              How frequent are your periods?
            </h2>
            <p className="text-slate-500 text-sm sm:text-base">
              This helps us personalize your cycle guidance.
            </p>
          </div>
          <div className="space-y-3 mb-8">
            {["Regular", "Irregular", "Not sure"].map((opt) => {
              const isSelected = data.cycle_regularity === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setData((prev) => ({ ...prev, cycle_regularity: opt as "Regular" | "Irregular" | "Not sure" }))}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:border-primary/40 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {isSelected && <Check className="w-5 h-5 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Bottom: Next Button */}
      <div className="mt-auto pb-4">
        <button
          onClick={() => {
            if (step === "awareness") setStep("menstrual_status");
            else if (step === "menstrual_status") setStep("cycle_regularity");
            else if (step === "cycle_regularity") setStep("completion");
          }}
          disabled={
            (step === "awareness" && !data.period_awareness) ||
            (step === "menstrual_status" &&
              data.has_started_periods === undefined) ||
            (step === "cycle_regularity" && !data.cycle_regularity)
          }
          className="w-full py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 disabled:hover:shadow-none"
        >
          Next <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
