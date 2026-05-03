import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause, classifyStage, type MenopauseProfile, type MenopauseSymptoms } from "@/hooks/useMenopause";

// ─── Constants ───────────────────────────────────────────────────────────────

const SYMPTOM_LABELS: { key: keyof MenopauseSymptoms; label: string; emoji: string }[] = [
  { key: "hotFlashes", label: "Hot flashes", emoji: "🔥" },
  { key: "nightSweats", label: "Night sweats", emoji: "🌙" },
  { key: "sleep", label: "Sleep problems", emoji: "😴" },
  { key: "fatigue", label: "Fatigue", emoji: "🪫" },
  { key: "moodSwings", label: "Mood swings", emoji: "🎭" },
  { key: "anxiety", label: "Anxiety / stress", emoji: "😰" },
  { key: "brainFog", label: "Brain fog", emoji: "🌫️" },
  { key: "jointPain", label: "Joint pain", emoji: "🦴" },
  { key: "headache", label: "Headache", emoji: "🤕" },
];

const SEVERITY_LABELS = ["None", "Mild", "Moderate", "Noticeable", "Strong", "Severe"];

const CONDITION_OPTIONS = [
  { id: "thyroid", label: "Thyroid issues" },
  { id: "diabetes", label: "Diabetes" },
  { id: "pcos", label: "PCOS" },
  { id: "hypertension", label: "Hypertension" },
];

const FAMILY_HISTORY_OPTIONS = [
  { id: "osteoporosis", label: "Osteoporosis" },
  { id: "heartDisease", label: "Heart disease" },
];

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
              i < current
                ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                : i === current
                ? "bg-amber-100 text-amber-700 ring-2 ring-amber-400"
                : "bg-slate-100 text-slate-400"
            )}
          >
            {i < current ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={cn(
                "w-12 h-0.5 rounded-full transition-all",
                i < current ? "bg-amber-400" : "bg-slate-200"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MenopauseOnboarding() {
  const navigate = useNavigate();
  const { saveMenopauseProfile } = useMenopause();

  const [step, setStep] = useState(0); // 0, 1, 2

  // Section A state
  const [stillGettingPeriods, setStillGettingPeriods] = useState<"yes" | "no" | "sometimes" | "">("");
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [periodRegularity, setPeriodRegularity] = useState<"regular" | "irregular" | "unpredictable" | "stopped" | "">("");

  // Section B state
  const [symptoms, setSymptoms] = useState<MenopauseSymptoms>({
    hotFlashes: 0, nightSweats: 0, sleep: 0, fatigue: 0,
    moodSwings: 0, anxiety: 0, brainFog: 0, jointPain: 0, headache: 0,
  });

  // Section C state
  const [diet, setDiet] = useState<"veg" | "mixed" | "junk" | "">("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [familyHistory, setFamilyHistory] = useState<string[]>([]);
  const [onHRT, setOnHRT] = useState(false);
  const [hrtDetails, setHrtDetails] = useState("");

  // Validation
  const canProceedStep0 = stillGettingPeriods !== "" && lastPeriodDate !== "" && periodRegularity !== "";
  const canProceedStep1 = true; // symptoms all have defaults
  const canSubmit = diet !== "";

  const handleSymptomChange = (key: keyof MenopauseSymptoms, value: number) => {
    setSymptoms((prev) => ({ ...prev, [key]: value }));
  };

  const toggleCondition = (id: string) => {
    setConditions((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const toggleFamilyHistory = (id: string) => {
    setFamilyHistory((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    const stage = classifyStage(lastPeriodDate);
    const profile: MenopauseProfile = {
      stage,
      stillGettingPeriods: stillGettingPeriods as "yes" | "no" | "sometimes",
      lastPeriodDate,
      periodRegularity: periodRegularity as "regular" | "irregular" | "unpredictable" | "stopped",
      symptoms,
      diet: diet as "veg" | "mixed" | "junk",
      conditions,
      familyHistory,
      onHRT,
      hrtDetails,
      onboardingDone: true,
    };
    saveMenopauseProfile(profile);
    navigate("/menopause/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-3">
            ✨ Let's personalise your experience
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            Welcome to Your <span className="text-amber-600">Menopause Journey</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Answer a few questions so we can tailor everything just for you.
          </p>
        </div>

        <StepIndicator current={step} total={3} />

        {/* ───── STEP 0: Cycle Status ───── */}
        {step === 0 && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <span className="text-2xl">📅</span> Cycle Status
              </h2>
              <p className="text-sm text-slate-500 mb-6">Help us understand where you are in your journey.</p>

              {/* Still getting periods? */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Are you still getting periods?</label>
                <div className="flex flex-wrap gap-2">
                  {([["yes", "Yes"], ["no", "No"], ["sometimes", "Sometimes"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setStillGettingPeriods(val)}
                      className={cn(
                        "px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                        stillGettingPeriods === val
                          ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-200"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Last period date */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">When was your last period?</label>
                <input
                  type="date"
                  value={lastPeriodDate}
                  onChange={(e) => setLastPeriodDate(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50 focus:border-amber-300"
                />
                {lastPeriodDate && (
                  <p className="mt-2 text-xs text-amber-600 font-medium">
                    → Your stage: <span className="font-bold capitalize">{classifyStage(lastPeriodDate).replace("postmenopause", "post-menopause")}</span>
                  </p>
                )}
              </div>

              {/* Regularity */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">How regular are your periods?</label>
                <div className="flex flex-wrap gap-2">
                  {([["regular", "Regular"], ["irregular", "Irregular"], ["unpredictable", "Very unpredictable"], ["stopped", "Stopped"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setPeriodRegularity(val)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                        periodRegularity === val
                          ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-200"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(1)}
                disabled={!canProceedStep0}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ───── STEP 1: Symptom Severity ───── */}
        {step === 1 && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <span className="text-2xl">📊</span> Symptom Severity
              </h2>
              <p className="text-sm text-slate-500 mb-6">Rate each symptom from 0 (none) to 5 (severe). This helps us personalise your wellness plan.</p>

              <div className="space-y-5">
                {SYMPTOM_LABELS.map(({ key, label, emoji }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">
                        {emoji} {label}
                      </span>
                      <span className={cn(
                        "text-xs font-bold px-2.5 py-0.5 rounded-full",
                        symptoms[key] === 0 ? "bg-slate-100 text-slate-400" :
                        symptoms[key] <= 2 ? "bg-green-100 text-green-700" :
                        symptoms[key] <= 3 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {SEVERITY_LABELS[symptoms[key]]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4">0</span>
                      <input
                        type="range"
                        min={0}
                        max={5}
                        step={1}
                        value={symptoms[key]}
                        onChange={(e) => handleSymptomChange(key, parseInt(e.target.value))}
                        className="flex-1 h-2 appearance-none bg-slate-200 rounded-full cursor-pointer accent-amber-500
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-md
                          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                      />
                      <span className="text-xs text-slate-400 w-4">5</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all disabled:opacity-40"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ───── STEP 2: Lifestyle & Medical ───── */}
        {step === 2 && (
          <div className="animate-fadeIn space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
                <span className="text-2xl">🌿</span> Lifestyle & Medical Background
              </h2>
              <p className="text-sm text-slate-500 mb-6">This helps us give you the most relevant wellness advice.</p>

              {/* Diet type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">What best describes your diet?</label>
                <div className="flex flex-wrap gap-2">
                  {([["veg", "🥬 Vegetarian"], ["mixed", "🍗 Mixed"], ["junk", "🍔 Mostly convenience food"]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setDiet(val)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                        diet === val
                          ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-200"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Medical conditions */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Any existing medical conditions? <span className="text-slate-400 font-normal">(select all that apply)</span></label>
                <div className="flex flex-wrap gap-2">
                  {CONDITION_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => toggleCondition(opt.id)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2",
                        conditions.includes(opt.id)
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-200"
                      )}
                    >
                      {conditions.includes(opt.id) && <Check className="w-3.5 h-3.5" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Family history */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Family history <span className="text-slate-400 font-normal">(select if applicable)</span></label>
                <div className="flex flex-wrap gap-2">
                  {FAMILY_HISTORY_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => toggleFamilyHistory(opt.id)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-2",
                        familyHistory.includes(opt.id)
                          ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-amber-200"
                      )}
                    >
                      {familyHistory.includes(opt.id) && <Check className="w-3.5 h-3.5" />}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* HRT */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-3">Are you on hormone therapy or any medications?</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setOnHRT(false)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                      !onHRT ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600"
                    )}
                  >
                    No
                  </button>
                  <button
                    onClick={() => setOnHRT(true)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl border-2 text-sm font-medium transition-all",
                      onHRT ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-600"
                    )}
                  >
                    Yes
                  </button>
                </div>
                {onHRT && (
                  <input
                    type="text"
                    value={hrtDetails}
                    onChange={(e) => setHrtDetails(e.target.value)}
                    placeholder="What are you taking? (optional)"
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                  />
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 text-white font-semibold text-sm shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start My Journey ✨
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
