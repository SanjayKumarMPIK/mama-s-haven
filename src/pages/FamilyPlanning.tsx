import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { ArrowLeft, CalendarDays, Activity, Leaf, Stethoscope, AlertTriangle, CheckCircle2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Feature 1: Fertility & Cycle Insights ───────────────────────────────────

type UserIntent = "conceive" | "avoid";

interface CycleResult {
  ovulationDate: Date;
  fertileStart: Date;
  fertileEnd: Date;
  safeStart: Date;
  safeEnd: Date;
  nextPeriod: Date;
}

export function FertilityCycleInsights() {
  const [intent, setIntent] = useState<UserIntent>("conceive");
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLengthStr, setCycleLengthStr] = useState("");
  const [result, setResult] = useState<CycleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConceive = intent === "conceive";

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    if (!lastPeriod) {
      setError("Please select your last period date.");
      return;
    }
    const cycleLength = Number(cycleLengthStr);
    if (!cycleLengthStr || isNaN(cycleLength) || cycleLength < 1 || cycleLength > 60) {
      setError("Please enter a valid cycle length (1–60 days).");
      return;
    }

    const lmpDate = new Date(lastPeriod);
    if (isNaN(lmpDate.getTime())) {
      setError("Invalid date selected.");
      return;
    }

    // Ovulation ≈ 14 days before next cycle start
    const nextCycleStart = addDays(lmpDate, cycleLength);
    const ovulation = addDays(nextCycleStart, -14);
    const fertileStart = addDays(ovulation, -5);
    const fertileEnd = addDays(ovulation, 1);

    // Safe days: after period ends (approx day 6) to fertile start,
    // and from fertile end to next period
    const safeStart = addDays(fertileEnd, 1);
    const safeEnd = addDays(nextCycleStart, -1);

    setResult({
      ovulationDate: ovulation,
      fertileStart,
      fertileEnd,
      safeStart,
      safeEnd,
      nextPeriod: nextCycleStart,
    });
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  // ── Intent-driven styles ──
  const intentStyles = isConceive
    ? {
        resultBg: "bg-emerald-50 border-emerald-200",
        resultIcon: "text-emerald-600",
        resultTitle: "Your Cycle Predictions",
        cardPrimary: "bg-emerald-100 border-emerald-200",
        cardPrimaryLabel: "text-emerald-600",
        cardPrimaryValue: "text-emerald-900",
        cardHighlight: "bg-emerald-200/70 border-emerald-300",
        cardHighlightLabel: "text-emerald-700",
        cardHighlightValue: "text-emerald-950",
        messageText: "text-emerald-700",
        message: "High chance of conception during this window — best days to try.",
        ovulationLabel: "Peak Fertility",
        fertileLabel: "Best Days to Try",
        fertileStartLabel: "Fertile Start",
        fertileEndLabel: "Fertile End",
      }
    : {
        resultBg: "bg-amber-50 border-amber-200",
        resultIcon: "text-amber-600",
        resultTitle: "Your Risk Assessment",
        cardPrimary: "bg-red-100 border-red-200",
        cardPrimaryLabel: "text-red-600",
        cardPrimaryValue: "text-red-900",
        cardHighlight: "bg-red-200/70 border-red-300",
        cardHighlightLabel: "text-red-700",
        cardHighlightValue: "text-red-950",
        messageText: "text-red-700",
        message: "High risk of pregnancy during these days — take precautions or use protection.",
        ovulationLabel: "Highest Risk",
        fertileLabel: "High-Risk Days",
        fertileStartLabel: "Risk Starts",
        fertileEndLabel: "Risk Ends",
      };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden">
      {/* ── Section header ── */}
      <div className="p-6 md:p-8 pb-0 md:pb-0">
        <div className="flex items-center gap-3 mb-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isConceive ? "bg-emerald-100" : "bg-amber-100"} transition-colors duration-300`}>
            <CalendarDays className={`w-5 h-5 ${isConceive ? "text-emerald-600" : "text-amber-600"} transition-colors duration-300`} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Fertility &amp; Cycle Insights</h2>
            <p className="text-xs text-muted-foreground">Cycle-based predictions tailored to your goals</p>
          </div>
        </div>
      </div>

      {/* ── Intent toggle ── */}
      <div className="px-6 md:px-8 pt-5">
        <label className="block text-sm font-medium mb-2.5">What is your goal?</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setIntent("conceive"); clearResult(); }}
            className={`relative py-3.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-300 active:scale-[0.97] ${
              isConceive
                ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100"
                : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span className="block text-lg mb-0.5">🤱</span>
            Trying to Conceive
            {isConceive && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => { setIntent("avoid"); clearResult(); }}
            className={`relative py-3.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all duration-300 active:scale-[0.97] ${
              !isConceive
                ? "border-amber-400 bg-amber-50 text-amber-700 shadow-sm shadow-amber-100"
                : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/70"
            }`}
          >
            <span className="block text-lg mb-0.5">🛡️</span>
            Avoid Pregnancy
            {!isConceive && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* ── Input form ── */}
      <div className="p-6 md:p-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Last period date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={lastPeriod}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => { setLastPeriod(e.target.value); clearResult(); }}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

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
            onChange={(e) => { setCycleLengthStr(e.target.value); clearResult(); }}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleCalculate}
          className={`w-full py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 active:scale-[0.97] ${
            isConceive
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-amber-600 text-white hover:bg-amber-700"
          }`}
        >
          Get Cycle Predictions
        </button>

        {/* ── Results ── */}
        {result && (
          <div className={`p-5 rounded-xl border ${intentStyles.resultBg} space-y-4 animate-fadeIn`}>
            {/* Title */}
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-5 h-5 ${intentStyles.resultIcon}`} />
              <p className={`text-sm font-bold ${intentStyles.cardHighlightValue}`}>{intentStyles.resultTitle}</p>
            </div>

            {/* Primary message */}
            <div className={`flex items-start gap-2 p-3 rounded-lg ${isConceive ? "bg-emerald-100/60" : "bg-red-100/60"}`}>
              <span className="text-sm mt-0.5">{isConceive ? "💡" : "⚠️"}</span>
              <p className={`text-sm font-medium ${intentStyles.messageText}`}>{intentStyles.message}</p>
            </div>

            {/* Date cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className={`text-center p-3.5 rounded-xl border ${intentStyles.cardPrimary} transition-all`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${intentStyles.cardPrimaryLabel}`}>
                  {intentStyles.fertileStartLabel}
                </p>
                <p className={`text-sm font-bold ${intentStyles.cardPrimaryValue}`}>{formatDate(result.fertileStart)}</p>
              </div>
              <div className={`text-center p-3.5 rounded-xl border ${intentStyles.cardHighlight} transition-all`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${intentStyles.cardHighlightLabel}`}>
                  {intentStyles.ovulationLabel}
                </p>
                <p className={`text-sm font-bold ${intentStyles.cardHighlightValue}`}>{formatDate(result.ovulationDate)}</p>
              </div>
              <div className={`text-center p-3.5 rounded-xl border ${intentStyles.cardPrimary} transition-all`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${intentStyles.cardPrimaryLabel}`}>
                  {intentStyles.fertileEndLabel}
                </p>
                <p className={`text-sm font-bold ${intentStyles.cardPrimaryValue}`}>{formatDate(result.fertileEnd)}</p>
              </div>
            </div>

            {/* Safe days — shown for avoid mode */}
            {!isConceive && (
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="text-center p-3.5 rounded-xl border bg-green-100 border-green-200">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600 mb-1.5">Lower-Risk Start</p>
                  <p className="text-sm font-bold text-green-900">{formatDate(result.safeStart)}</p>
                </div>
                <div className="text-center p-3.5 rounded-xl border bg-green-100 border-green-200">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-green-600 mb-1.5">Lower-Risk End</p>
                  <p className="text-sm font-bold text-green-900">{formatDate(result.safeEnd)}</p>
                </div>
              </div>
            )}

            {/* Summary */}
            <p className={`text-xs text-center ${isConceive ? "text-emerald-700" : "text-amber-700"}`}>
              {isConceive
                ? <>Your best window is <strong>{formatDate(result.fertileStart)}</strong> to <strong>{formatDate(result.fertileEnd)}</strong>, with peak fertility on <strong>{formatDate(result.ovulationDate)}</strong>.</>
                : <>Avoid unprotected intercourse from <strong>{formatDate(result.fertileStart)}</strong> to <strong>{formatDate(result.fertileEnd)}</strong>. Lower-risk days are <strong>{formatDate(result.safeStart)}</strong> onwards.</>
              }
            </p>

            {/* Disclaimer */}
            <p className="text-[10px] text-muted-foreground text-center pt-1 border-t border-dashed border-current/10">
              ⚕️ This is an estimate based on a standard 14-day luteal phase. Results may vary. Consult a healthcare professional for personalised advice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Feature 2: Fertility Readiness Indicator ─────────────────────────────────

type HealthLevel = "good" | "fair" | "poor" | "";

function ReadinessIndicator({
  onChange,
}: {
  onChange: (args: { regular: boolean | null; health: HealthLevel }) => void;
}) {
  const [regular, setRegular] = useState<boolean | null>(null);
  const [health, setHealth] = useState<HealthLevel>("");
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readiness = regular && health === "good" ? "good" : regular !== null && health !== "" ? "attention" : null;

  const handleCheck = () => {
    setError(null);
    if (regular === null) {
      setError("Please select your cycle regularity.");
      return;
    }
    if (!health) {
      setError("Please select your general health status.");
      return;
    }
    setChecked(true);
    onChange({ regular, health });
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Activity className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Fertility Readiness Indicator</h2>
          <p className="text-xs text-muted-foreground">Quick assessment of your readiness</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Cycle regularity */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Are your cycles regular? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {[{ label: "Yes, regular", value: true }, { label: "No, irregular", value: false }].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => { setRegular(opt.value); setChecked(false); onChange({ regular: opt.value, health }); }}
                className={`flex-1 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                  regular === opt.value
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-border bg-muted/50 hover:bg-muted"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* General health */}
        <div>
          <label className="block text-sm font-medium mb-2">
            General health status <span className="text-red-500">*</span>
          </label>
          <select
            value={health}
            onChange={(e) => { setHealth(e.target.value as HealthLevel); setChecked(false); onChange({ regular, health: e.target.value as HealthLevel }); }}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          >
            <option value="">Select health status...</option>
            <option value="good">Good – I feel well and active</option>
            <option value="fair">Fair – Occasional tiredness or minor issues</option>
            <option value="poor">Poor – Frequent illness or health concerns</option>
          </select>
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
          Check Readiness
        </button>

        {checked && readiness && (
          <div
            className={`p-4 rounded-xl border text-center ${
              readiness === "good"
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            {readiness === "good" ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-base font-bold text-green-800">Good Readiness ✓</p>
                <p className="text-xs text-green-700 mt-1">
                  Your cycle regularity and health status are encouraging. Maintain your healthy routine.
                </p>
              </>
            ) : (
              <>
                <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-base font-bold text-amber-800">Needs Attention</p>
                <p className="text-xs text-amber-700 mt-1">
                  Some factors may need attention before or during fertility planning. See suggestions below.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Feature 3: Lifestyle & Emotional Guidance ────────────────────────────────

const LIFESTYLE_TIPS = [
  {
    emoji: "🧘‍♀️",
    title: "Manage Stress",
    desc: "Practice breathing exercises, yoga, or light meditation daily. Chronic stress can affect hormone balance and fertility.",
  },
  {
    emoji: "😴",
    title: "Maintain Sleep Schedule",
    desc: "7–9 hours of quality sleep per night supports hormonal regulation essential for reproductive health.",
  },
  {
    emoji: "🥗",
    title: "Balanced Nutrition",
    desc: "Eat a varied diet rich in folate (leafy greens), iron, calcium, and healthy fats. Begin folic acid supplementation.",
  },
  {
    emoji: "🚶‍♀️",
    title: "Regular Light Activity",
    desc: "30 minutes of walking, cycling, or swimming most days improves overall health and circulation.",
  },
  {
    emoji: "💬",
    title: "Emotional Wellbeing",
    desc: "Talk openly with your partner or a trusted friend about your journey. Emotional support is a key part of fertility readiness.",
  },
  {
    emoji: "🚭",
    title: "Avoid Harmful Substances",
    desc: "Avoid tobacco, alcohol, and excessive caffeine — these can significantly impact fertility for both partners.",
  },
];

function LifestyleGuidance() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Lifestyle & Emotional Guidance</h2>
          <p className="text-xs text-muted-foreground">Holistic preparation for family planning</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {LIFESTYLE_TIPS.map((tip, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 rounded-xl bg-muted/40 border border-border/50 hover:bg-muted/70 transition-colors"
          >
            <span className="text-2xl flex-shrink-0">{tip.emoji}</span>
            <div>
              <p className="text-sm font-semibold">{tip.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature 4: Doctor Consultation Trigger ───────────────────────────────────

function ConsultationTrigger({
  show,
}: {
  show: boolean;
}) {
  if (!show) return null;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 md:p-8 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Stethoscope className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-base font-bold text-blue-900 mb-1">👩‍⚕️ Professional Consultation Recommended</h2>
        <p className="text-sm text-blue-800 leading-relaxed">
          Consider consulting a healthcare professional if concerns persist. Irregular cycles or health conditions
          that affect general wellbeing may benefit from early evaluation by a gynaecologist or fertility specialist.
        </p>
        <a
          href="tel:104"
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition-all active:scale-[0.97]"
        >
          📞 Call 104 for Guidance
        </a>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FamilyPlanning() {
  const { setPhase } = usePhase();
  const [readinessState, setReadinessState] = useState<{
    regular: boolean | null;
    health: HealthLevel;
  }>({ regular: null, health: "" });

  useEffect(() => {
    setPhase("family-planning");
  }, [setPhase]);

  // Show consultation trigger if irregular OR health is not good
  const showConsultation =
    readinessState.regular === false ||
    (readinessState.health !== "" && readinessState.health !== "good");

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-4xl">
        <ScrollReveal>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold mb-3">
              🌿 Phase 3
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Family Planning <span className="text-gradient-bloom">Module</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Understand your fertile window, assess your readiness, and get holistic lifestyle
              guidance to support your family planning journey.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-6">
          {/* Fertility & Cycle Insights */}
          <ScrollReveal>
            <FertilityCycleInsights />
          </ScrollReveal>

          {/* Readiness indicator */}
          <ScrollReveal delay={80}>
            <ReadinessIndicator onChange={(args) => setReadinessState(args)} />
          </ScrollReveal>

          {/* Consultation trigger — shown if irregular or poor health */}
          <ScrollReveal delay={160}>
            <ConsultationTrigger show={showConsultation} />
          </ScrollReveal>

          {/* Lifestyle guidance */}
          <ScrollReveal delay={240}>
            <LifestyleGuidance />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
