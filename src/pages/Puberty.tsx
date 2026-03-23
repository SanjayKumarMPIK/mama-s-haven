import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { ArrowLeft, CalendarDays, AlertTriangle, Droplets, Sparkles, CheckCircle2, Info } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Add `days` to a Date and return a formatted string */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Rule-based suggestion engine ────────────────────────────────────────────

interface SuggestionInput {
  cycleLength: number | null;
  isIrregular: boolean;
  hb: number | null;
  hasHbWarning: boolean;
  periodPain?: boolean;
  fatigue?: boolean;
}

export interface SuggestionItem {
  text: string;
  because?: string;
  priority: number;
}

function generateSuggestions(input: SuggestionInput): SuggestionItem[] {
  const items: SuggestionItem[] = [];

  items.push({
    priority: 3,
    text: "Track your cycle dates and symptoms in one place so patterns are easier to spot.",
    because: "Consistent tracking helps you and any clinician see changes early.",
  });

  if (input.isIrregular && input.cycleLength !== null) {
    items.push({
      priority: 1,
      text: "Book a visit at your nearest PHC or clinic to discuss cycle irregularity.",
      because: `Your entered cycle length (${input.cycleLength} days) is outside the common 21–35 day range.`,
    });
    items.push({
      priority: 2,
      text: "Prioritise sleep and gentle stress care — stress can affect cycle regularity.",
      because: "Irregular cycles often improve when rest and stress load are addressed.",
    });
  } else if (input.cycleLength !== null && input.cycleLength >= 21 && input.cycleLength <= 35) {
    items.push({
      priority: 4,
      text: "Your cycle length looks within a typical range — keep logging each month.",
      because: `A ${input.cycleLength}-day pattern supports predictable next-period estimates.`,
    });
  }

  if (input.hasHbWarning && input.hb !== null) {
    items.push({
      priority: 1,
      text: "Add iron-rich foods (leafy greens, lentils, jaggery, dates) and pair with vitamin C sources.",
      because: `Your hemoglobin (${input.hb} g/dL) is below the common 12 g/dL reference used here.`,
    });
    items.push({
      priority: 2,
      text: "Ask about a formal blood test at a PHC if you feel tired, dizzy, or pale.",
      because: "Low Hb on self-report should be confirmed and managed with a professional.",
    });
  }

  if (!input.hasHbWarning && input.hb !== null && input.hb >= 12) {
    items.push({
      priority: 4,
      text: "Keep balanced meals with iron and protein to maintain your current energy.",
      because: `Your reported Hb (${input.hb} g/dL) looks adequate on this simple check.`,
    });
  }

  if (input.periodPain) {
    items.push({
      priority: 2,
      text: "Use a warm compress on the lower abdomen and stay lightly active if you can tolerate it.",
      because: "You reported period pain — simple comfort measures can help while you monitor severity.",
    });
  }

  if (input.fatigue) {
    items.push({
      priority: 2,
      text: "Prioritise iron-rich snacks with fruit for vitamin C, and avoid skipping meals on heavy-flow days.",
      because: "Fatigue can worsen with iron loss during periods — especially if Hb is low.",
    });
  }

  items.sort((a, b) => a.priority - b.priority);
  return items.slice(0, 5);
}

// ─── Feature 1 + 2: Cycle Tracker & Irregular Detection ──────────────────────

export function CycleTracker({
  onResultChange,
}: {
  onResultChange: (args: { cycleLength: number | null; isIrregular: boolean }) => void;
}) {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLengthStr, setCycleLengthStr] = useState("");
  const [nextPeriod, setNextPeriod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cycleLength = cycleLengthStr !== "" ? Number(cycleLengthStr) : null;
  const isIrregular = cycleLength !== null && (cycleLength < 21 || cycleLength > 35);

  const handleCalculate = () => {
    setError(null);
    setNextPeriod(null);

    if (!lastPeriod) {
      setError("Please select your last period date.");
      return;
    }
    if (cycleLength === null || isNaN(cycleLength)) {
      setError("Please enter a valid cycle length.");
      return;
    }
    if (cycleLength < 1 || cycleLength > 60) {
      setError("Cycle length must be between 1 and 60 days.");
      return;
    }

    const date = new Date(lastPeriod);
    if (isNaN(date.getTime())) {
      setError("Invalid date selected.");
      return;
    }

    const next = addDays(date, cycleLength);
    setNextPeriod(formatDate(next));
    onResultChange({ cycleLength, isIrregular });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Menstrual Cycle Tracker</h2>
          <p className="text-xs text-muted-foreground">Predict your next period date</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Last period date */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Last menstrual period <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={lastPeriod}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setLastPeriod(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {/* Cycle length */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Average cycle length (days) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={60}
            placeholder="e.g. 28"
            value={cycleLengthStr}
            onChange={(e) => {
              setCycleLengthStr(e.target.value);
              setNextPeriod(null);
              const val = Number(e.target.value);
              if (e.target.value !== "") {
                onResultChange({
                  cycleLength: isNaN(val) ? null : val,
                  isIrregular: !isNaN(val) && (val < 21 || val > 35),
                });
              }
            }}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
          <p className="mt-1 text-xs text-muted-foreground">Normal range: 21–35 days</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Irregular warning — Feature 2 */}
        {isIrregular && cycleLengthStr !== "" && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Irregular Cycle Detected</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Your cycle appears irregular. Monitoring is recommended. Consider visiting a healthcare professional.
              </p>
            </div>
          </div>
        )}

        {/* Calculate button */}
        <button
          onClick={handleCalculate}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.97]"
        >
          Calculate Next Period
        </button>

        {/* Result */}
        {nextPeriod && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Your next expected period is on:</p>
            <p className="mt-1 text-base font-bold text-green-800">{nextPeriod}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Feature 3: Hemoglobin Suggestions ───────────────────────────────────────

function HemoglobinPanel({
  onHbChange,
}: {
  onHbChange: (args: { hb: number | null; hasWarning: boolean }) => void;
}) {
  const [hbStr, setHbStr] = useState("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hb = hbStr !== "" ? parseFloat(hbStr) : null;
  const hasWarning = hb !== null && !isNaN(hb) && hb < 12;

  const handleCheck = () => {
    setError(null);
    if (hb === null || isNaN(hb)) {
      setError("Please enter a valid hemoglobin level.");
      return;
    }
    if (hb < 1 || hb > 25) {
      setError("Please enter a realistic hemoglobin value (1–25 g/dL).");
      return;
    }
    setChecked(true);
    onHbChange({ hb, hasWarning });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <Droplets className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Hemoglobin Level Check</h2>
          <p className="text-xs text-muted-foreground">Get iron & nutrition guidance</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200 mb-4">
        <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700">
          This is <strong>not a diagnosis</strong>. Values are for general awareness only. Please consult a certified health worker for medical advice.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Hemoglobin level (g/dL) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={25}
            step={0.1}
            placeholder="e.g. 11.5"
            value={hbStr}
            onChange={(e) => {
              setHbStr(e.target.value);
              setChecked(false);
            }}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleCheck}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.97]"
        >
          Check Hemoglobin
        </button>

        {checked && hb !== null && (
          <div className={`p-4 rounded-xl border ${hasWarning ? "bg-amber-50 border-amber-200" : "bg-green-50 border-green-200"}`}>
            {hasWarning ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <p className="text-sm font-bold text-amber-800">Possible low iron level</p>
                </div>
                <p className="text-xs text-amber-700 mb-3">Your hemoglobin is below 12 g/dL. Consider these steps:</p>
                <ul className="space-y-2">
                  {[
                    "🥬 Eat iron-rich foods: spinach, dates, lentils, jaggery, and drumsticks",
                    "💧 Stay well hydrated — drink 8–10 glasses of water daily",
                    "🏥 Visit your nearest PHC for a complete blood count (CBC) check",
                  ].map((tip, i) => (
                    <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                      <span className="flex-shrink-0">{tip.slice(0, 2)}</span>
                      <span>{tip.slice(2)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-800">
                  Your hemoglobin level ({hb} g/dL) appears healthy. Maintain a balanced, iron-rich diet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Feature 4: Personalized Suggestion Panel ────────────────────────────────

function SuggestionPanel({ suggestions }: { suggestions: SuggestionItem[] }) {
  if (suggestions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Your Personalized Suggestions</h2>
          <p className="text-xs text-muted-foreground">Priority order · short reasons where helpful</p>
        </div>
      </div>

      <div className="grid gap-3">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border/60 shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary text-xs font-bold mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="text-sm leading-relaxed">{s.text}</p>
              {s.because && (
                <p className="mt-1.5 text-xs text-muted-foreground border-l-2 border-primary/30 pl-2">
                  Because: {s.because}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        ⚕️ These are general wellness suggestions — not medical advice. Always consult a certified health worker.
      </p>
    </div>
  );
}

// ─── Mood + emotional support (rule-based) ───────────────────────────────────

const MOOD_GUIDE: Record<string, string> = {
  Calm: "You’re in a steady space — keep light routines that make you feel safe and rested.",
  Happy: "Enjoy this moment — short walks or talking to someone you trust can extend the good feeling.",
  Tired: "Fatigue is common — aim for a fixed sleep window and lighter evening screen time.",
  Anxious: "Try 4 slow breaths: in 4 counts, hold 2, out 6. If worry persists, consider speaking with a counsellor or PHC.",
  Low: "It’s okay to feel low — reach out to a trusted adult or helpline (104) if you need support.",
  Irritable: "Hormonal shifts can affect mood — hydrate, snack on time, and step away from stress triggers when you can.",
};

function MoodSupport({
  onSymptomsChange,
}: {
  onSymptomsChange: (s: { periodPain: boolean; fatigue: boolean }) => void;
}) {
  const moods = ["Calm", "Happy", "Tired", "Anxious", "Low", "Irritable"] as const;
  const [picked, setPicked] = useState<string | null>(null);
  const [periodPain, setPeriodPain] = useState(false);
  const [fatigue, setFatigue] = useState(false);

  useEffect(() => {
    onSymptomsChange({ periodPain, fatigue });
  }, [periodPain, fatigue, onSymptomsChange]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-lavender/80 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-lavender-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Mood & quick symptoms</h2>
          <p className="text-xs text-muted-foreground">Mood guidance + optional pain/fatigue (updates suggestions).</p>
        </div>
      </div>

      <p className="text-xs font-medium text-muted-foreground mb-2">Today I have…</p>
      <div className="flex flex-wrap gap-2 mb-5">
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={periodPain}
            onChange={(e) => setPeriodPain(e.target.checked)}
            className="rounded border-input"
          />
          Period pain / cramps
        </label>
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={fatigue}
            onChange={(e) => setFatigue(e.target.checked)}
            className="rounded border-input"
          />
          Fatigue
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {moods.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setPicked(m)}
            className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all active:scale-[0.98] ${
              picked === m ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      {picked && (
        <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border/60">
          <p className="text-sm leading-relaxed">{MOOD_GUIDE[picked]}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Puberty() {
  const { setPhase } = usePhase();
  useEffect(() => {
    setPhase("puberty");
  }, [setPhase]);

  const [cycleState, setCycleState] = useState<{ cycleLength: number | null; isIrregular: boolean }>({
    cycleLength: null,
    isIrregular: false,
  });

  const [hbState, setHbState] = useState<{ hb: number | null; hasWarning: boolean }>({
    hb: null,
    hasWarning: false,
  });

  const [symptoms, setSymptoms] = useState<{ periodPain: boolean; fatigue: boolean }>({
    periodPain: false,
    fatigue: false,
  });
  const onSymptomsChange = useCallback((s: { periodPain: boolean; fatigue: boolean }) => {
    setSymptoms(s);
  }, []);

  // Compute suggestions reactively whenever inputs change
  const suggestions = useMemo(
    () =>
      generateSuggestions({
        cycleLength: cycleState.cycleLength,
        isIrregular: cycleState.isIrregular,
        hb: hbState.hb,
        hasHbWarning: hbState.hasWarning,
        periodPain: symptoms.periodPain,
        fatigue: symptoms.fatigue,
      }),
    [cycleState, hbState, symptoms]
  );

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-4xl">
        {/* Breadcrumb */}
        <ScrollReveal>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Page Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-3">
              🌸 Phase 1
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Puberty <span className="text-gradient-bloom">Health Module</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Track your menstrual cycle, understand your hemoglobin levels, and receive personalized
              health guidance for your puberty journey.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-6">
          {/* Cycle tracker + irregular detection (Features 1 & 2) */}
          <ScrollReveal>
            <CycleTracker
              onResultChange={(args) => setCycleState(args)}
            />
          </ScrollReveal>

          {/* Hemoglobin panel (Feature 3) */}
          <ScrollReveal delay={80}>
            <HemoglobinPanel
              onHbChange={(args) => setHbState(args)}
            />
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <MoodSupport onSymptomsChange={onSymptomsChange} />
          </ScrollReveal>

          {/* Personalized suggestions (Feature 4) */}
          <ScrollReveal delay={160}>
            <SuggestionPanel suggestions={suggestions} />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
