/**
 * BabySupportiveHelper.tsx
 *
 * A standalone guided workflow for premature baby care guidance.
 * Collects answers through a multi-step flow and generates a structured care guide.
 * Only visible in Premature Mode (weeksAtBirth < 37).
 */

import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import { usePhase } from "@/hooks/usePhase";
import {
  BABY_HELPER_QUESTIONS,
  generateStructuredGuide,
  type StructuredCareGuide,
} from "@/lib/prematureCareData";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Thermometer,
  Moon,
  Activity,
  AlertTriangle,
  Phone,
  RotateCcw,
} from "lucide-react";

type Step = "intro" | "questions" | "results";

export default function BabySupportiveHelper() {
  const { mode } = usePregnancyProfile();
  const { phase } = usePhase();

  // Visibility check: only show in premature mode
  if (mode !== "premature") {
    return <Navigate to="/tools" replace />;
  }

  return <BabyHelperWorkflow />;
}

function BabyHelperWorkflow() {
  const [step, setStep] = useState<Step>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [guide, setGuide] = useState<StructuredCareGuide | null>(null);

  const handleAnswer = (value: boolean) => {
    const currentQuestion = BABY_HELPER_QUESTIONS[currentQuestionIndex];
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));

    // Move to next question or show results
    moveToNextOrFinish();
  };

  const handleSkip = () => {
    // Skip without recording an answer
    moveToNextOrFinish();
  };

  const moveToNextOrFinish = () => {
    if (currentQuestionIndex < BABY_HELPER_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // All questions answered - generate guide
      const generatedGuide = generateStructuredGuide(answers);
      setGuide(generatedGuide);
      setStep("results");
    }
  };

  const handleStart = () => {
    setStep("questions");
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setGuide(null);
    setStep("intro");
  };

  const progress = ((currentQuestionIndex + 1) / BABY_HELPER_QUESTIONS.length) * 100;

  if (step === "intro") {
    return <IntroScreen onStart={handleStart} />;
  }

  if (step === "questions") {
    return (
      <QuestionFlow
        currentQuestionIndex={currentQuestionIndex}
        progress={progress}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
      />
    );
  }

  if (step === "results" && guide) {
    return <ResultsScreen guide={guide} onReset={handleReset} />;
  }

  return null;
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container py-12 max-w-2xl">
        <ScrollReveal>
          <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold mb-2">Baby Supportive Helper</h1>
            <p className="text-muted-foreground text-sm">
              Answer a few quick questions to receive care guidance for your premature baby.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-6">
            <h2 className="font-bold text-sm mb-4">What to expect</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p className="text-sm text-foreground/90">Answer {BABY_HELPER_QUESTIONS.length} simple questions about your baby</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p className="text-sm text-foreground/90">Receive a personalized care guide</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p className="text-sm text-foreground/90">Get actionable recommendations for daily care</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/50 p-4 mb-6">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> This tool provides guidance only and is not a medical diagnosis. Consult your healthcare provider for medical concerns.
              </span>
            </p>
          </div>

          <button
            onClick={onStart}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
        </ScrollReveal>
      </div>
    </main>
  );
}

function QuestionFlow({
  currentQuestionIndex,
  progress,
  onAnswer,
  onSkip,
}: {
  currentQuestionIndex: number;
  progress: number;
  onAnswer: (value: boolean) => void;
  onSkip: () => void;
}) {
  const currentQuestion = BABY_HELPER_QUESTIONS[currentQuestionIndex];

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-12 max-w-2xl">
        <ScrollReveal>
          <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>

          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {BABY_HELPER_QUESTIONS.length}
              </span>
              <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
            <div className="text-4xl mb-4">{currentQuestion.emoji}</div>
            <h2 className="text-lg font-bold mb-6">{currentQuestion.question}</h2>

            <div className="flex gap-3 max-w-md mx-auto">
              <button
                onClick={() => onAnswer(true)}
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Yes
              </button>
              <button
                onClick={() => onAnswer(false)}
                className="flex-1 py-2.5 rounded-lg border-2 border-border bg-background text-foreground font-semibold text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <span className="w-4 h-4 rounded-full border-2 border-border" /> No
              </button>
            </div>

            {currentQuestion.skippable && (
              <button
                onClick={onSkip}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Skip this question
              </button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Answer honestly to get the most helpful guidance
          </p>
        </ScrollReveal>
      </div>
    </main>
  );
}

function ResultsScreen({ guide, onReset }: { guide: StructuredCareGuide; onReset: () => void }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="container py-12 max-w-2xl">
        <ScrollReveal>
          <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Tools
          </Link>

          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold mb-2">Your Care Guide</h1>
            <p className="text-muted-foreground text-sm">
              Personalized recommendations based on your answers
            </p>
          </div>

          {/* Priority Focus */}
          <div className="rounded-2xl border-2 border-primary bg-primary/5 p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-sm text-primary">Priority Focus</h2>
            </div>
            <p className="text-base font-semibold text-foreground">{guide.priorityFocus}</p>
          </div>

          {/* Immediate Care */}
          {guide.immediateCare.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <h2 className="font-bold text-sm">Immediate Care Priority</h2>
              </div>
              <ul className="space-y-2">
                {guide.immediateCare.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Feeding Guidance */}
          {guide.feedingGuidance.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-bold text-sm">Feeding Guidance</h2>
              </div>
              <ul className="space-y-2">
                {guide.feedingGuidance.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comfort & Recovery */}
          {guide.comfortGuidance.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-bold text-sm">Comfort & Recovery Guidance</h2>
              </div>
              <ul className="space-y-2">
                {guide.comfortGuidance.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Monitoring Advice */}
          {guide.monitoringAdvice.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-bold text-sm">Monitoring Advice</h2>
              </div>
              <ul className="space-y-2">
                {guide.monitoringAdvice.map((item, i) => (
                  <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* When To Seek Medical Help */}
          {guide.medicalHelp.length > 0 && (
            <div className="rounded-2xl border-2 border-destructive bg-destructive/5 p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                </div>
                <h2 className="font-bold text-sm text-destructive">When To Seek Medical Help</h2>
              </div>
              <ul className="space-y-2">
                {guide.medicalHelp.map((item, i) => (
                  <li key={i} className="text-sm text-destructive flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="rounded-xl border border-border bg-muted/50 p-4 mb-6">
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> This guide provides general care tips for premature babies. It is NOT a substitute for medical advice. Always consult your doctor or NICU team for your baby's specific needs.
              </span>
            </p>
          </div>

          {/* Emergency contacts */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <a href="tel:104" className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive hover:text-destructive/80">
              <Phone className="w-4 h-4" /> 104 — Health Helpline
            </a>
            <a href="tel:108" className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive hover:text-destructive/80">
              <Phone className="w-4 h-4" /> 108 — Ambulance
            </a>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onReset}
              className="flex-1 py-2.5 rounded-lg border border-border bg-background font-semibold text-sm hover:bg-muted transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Start Over
            </button>
            <Link
              to="/tools"
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              Back to Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </main>
  );
}
