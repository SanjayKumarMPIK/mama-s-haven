import { ArrowLeft, ArrowRight, Baby, Heart, Brain, Shield, Activity, AlertTriangle, Sparkles, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { usePostpartumCheckin } from "@/hooks/usePostpartumCheckin";
import type { RiskLevel, CarePlan, Alert, Question } from "@/lib/postpartumEngine";

// ── Helpers ──────────────────────────────────────────────────────

function riskClass(level: RiskLevel) {
  return level === "LOW" ? "low" : level === "MEDIUM" ? "medium" : "high";
}

function riskEmoji(level: RiskLevel) {
  return level === "LOW" ? "🟢" : level === "MEDIUM" ? "🟡" : "🔴";
}

function pillColorClass(value: string) {
  const v = value.toUpperCase();
  if (["MILD", "HIGH", "GOOD", "EASY", "NO"].includes(v)) return "mild";
  if (["MODERATE", "MEDIUM", "DIFFICULT"].includes(v)) return "moderate";
  if (["SEVERE", "LOW", "CONCERNING", "VERY_DIFFICULT", "YES"].includes(v)) return "severe";
  return "neutral";
}

// ── Congrats View ───────────────────────────────────────────────

function CongratsView({
  title, message, cta, onStart,
}: { title: string; message: string; cta: string; onStart: () => void }) {
  return (
    <div className="text-center py-8" style={{ animation: "fadeIn 0.5s ease-out both" }}>
      <div className="pp-confetti text-7xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold mb-2" dangerouslySetInnerHTML={{
        __html: title.replace("Mama!", '<span class="text-gradient-bloom">Mama!</span>')
      }} />
      <p className="text-muted-foreground max-w-md mx-auto mb-6">{message}</p>
      <button
        id="pp-start-checkin"
        onClick={onStart}
        className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-md
          hover:shadow-lg transition-all active:scale-[0.97] text-base"
      >
        {cta} <ArrowRight className="w-4 h-4 inline ml-1" />
      </button>
    </div>
  );
}

// ── Delivery Type View ──────────────────────────────────────────

function DeliveryTypeView({
  question, onAnswer,
}: { question: Question; onAnswer: (id: string, val: string) => void }) {
  return (
    <div style={{ animation: "fadeIn 0.4s ease-out both" }}>
      <h2 className="text-xl font-bold mb-1">{question.label}</h2>
      <p className="text-sm text-muted-foreground mb-6">
        This helps us customize your physical recovery plan.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {question.options.map((opt) => (
          <div
            key={opt.value}
            id={`pp-select-${opt.value.toLowerCase()}`}
            className="pp-delivery-card"
            onClick={() => onAnswer(question.id, opt.value)}
          >
            <div className="text-4xl mb-3">
              {opt.value === "NORMAL" ? "👶" : "🏥"}
            </div>
            <div className="font-bold mb-1">{opt.label}</div>
            <div className="text-xs text-muted-foreground">{opt.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Question View ───────────────────────────────────────────────

function QuestionView({
  question, uiTitle, onAnswer,
}: { question: Question; uiTitle: string; onAnswer: (id: string, val: string) => void }) {
  const isMental = ["mood", "anxiety", "overwhelm", "sleep", "bonding"].includes(question.id);
  const sectionEmoji = isMental ? "🧠" : "💪";
  const sectionLabel = isMental ? "Mental Health" : "Physical Health";

  return (
    <div className="pp-question-card" key={question.id}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{sectionEmoji}</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {sectionLabel}
        </span>
        <span className="ml-auto text-xs text-muted-foreground/70">{uiTitle}</span>
      </div>
      <h3 className="text-lg font-bold mb-1">{question.label}</h3>
      <p className="text-xs text-muted-foreground mb-3">Select the option that best describes your experience</p>
      <div className="pp-option-pills">
        {question.options.map((opt) => (
          <button
            key={opt.value}
            id={`pp-option-${question.id}-${opt.value.toLowerCase()}`}
            className={`pp-option-pill ${pillColorClass(opt.value)}`}
            onClick={() => onAnswer(question.id, opt.value)}
          >
            <span className="pp-pill-indicator" />
            <div className="text-left">
              <div className="font-semibold text-sm">{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Processing View ─────────────────────────────────────────────

function ProcessingView() {
  return (
    <div className="pp-processing">
      <div className="pp-spinner" />
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">Analyzing your responses...</h3>
        <p className="text-sm text-muted-foreground">
          Creating your personalized postpartum care plan
        </p>
      </div>
    </div>
  );
}

// ── Result View ─────────────────────────────────────────────────

function ResultView({
  carePlan, alerts, ui, onReset,
}: { carePlan: CarePlan; alerts: Alert[]; ui: { title: string; message: string; cta: string }; onReset: () => void }) {
  const { summary, emotionalCare, physicalCare, activities } = carePlan;

  return (
    <div className="space-y-4" style={{ animation: "fadeIn 0.5s ease-out both" }}>
      {/* Summary */}
      <div className="pp-result-card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">{ui.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{ui.message}</p>

        <div className="flex flex-wrap gap-3 mb-3">
          <div className="text-xs">
            <span className="text-muted-foreground">Delivery: </span>
            <span className="font-semibold">{summary.deliveryType === "C_SECTION" ? "C-Section" : "Normal"}</span>
          </div>
          <div className="text-xs flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            <span className="text-muted-foreground">Mental: </span>
            <span className={`pp-risk-badge ${riskClass(summary.mentalRisk)}`}>
              {riskEmoji(summary.mentalRisk)} {summary.mentalRisk}
            </span>
          </div>
          <div className="text-xs flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span className="text-muted-foreground">Physical: </span>
            <span className={`pp-risk-badge ${riskClass(summary.physicalRisk)}`}>
              {riskEmoji(summary.physicalRisk)} {summary.physicalRisk}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div key={i} className="pp-alert-card">
              <div className="pp-alert-icon">
                <AlertTriangle className="w-3 h-3 text-red-600" />
              </div>
              <p className="text-sm leading-relaxed">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Emotional Care */}
      {emotionalCare.map((section, i) => (
        <div key={i} className="pp-care-section" style={{ animationDelay: `${i * 0.08}s` }}>
          <div className="pp-care-section-header">
            <Heart className="w-4 h-4 text-pink-500" />
            {section.level}
          </div>
          <div className="pp-care-section-body">
            <ul>{section.actions.map((a, j) => <li key={j}>{a}</li>)}</ul>
          </div>
        </div>
      ))}

      {/* Physical Care */}
      {physicalCare.map((section, i) => (
        <div key={i} className="pp-care-section" style={{ animationDelay: `${(emotionalCare.length + i) * 0.08}s` }}>
          <div className="pp-care-section-header">
            <Shield className="w-4 h-4 text-blue-500" />
            {section.focus}
          </div>
          <div className="pp-care-section-body">
            <ul>{section.actions.map((a, j) => <li key={j}>{a}</li>)}</ul>
          </div>
        </div>
      ))}

      {/* Activities */}
      {activities.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Recommended Activities
          </h3>
          <div className="space-y-2">
            {activities.map((act, i) => (
              <div key={i} className="pp-activity-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: act.type === "mental" ? "hsl(260 40% 93%)" : "hsl(160 35% 92%)" }}
                >
                  {act.type === "mental"
                    ? <Brain className="w-4 h-4 text-purple-600" />
                    : <Activity className="w-4 h-4 text-teal-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{act.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{act.frequency} · {act.duration}</div>
                  <div className="text-xs text-muted-foreground/80 mt-0.5">{act.notes}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
        ⚠️ This information is for wellness guidance only. It is NOT a medical diagnosis. Please consult a qualified healthcare provider for any medical concerns.
      </div>

      {/* Resources */}
      <div className="rounded-2xl bg-gradient-to-br from-lavender/40 via-peach/30 to-mint/30 p-6 text-center">
        <h3 className="text-base font-bold mb-2">Need to talk to someone?</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
          Postpartum depression affects 1 in 7 mothers. You are not alone.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <a href="tel:1-800-944-4773" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.97]">
            PSI Helpline
          </a>
          <a href="https://www.postpartum.net" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border-2 border-primary/20 font-medium text-sm hover:bg-primary/5 transition-all active:scale-[0.97]">
            Postpartum.net
          </a>
        </div>
      </div>

      {/* Track Again CTA */}
      <button
        id="pp-track-again"
        onClick={onReset}
        className="w-full py-3.5 rounded-xl font-semibold text-base
          bg-gradient-to-r from-primary/90 to-primary text-primary-foreground
          shadow-md hover:shadow-lg transition-all active:scale-[0.97]
          flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        {ui.cta}
      </button>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────

export default function Postpartum() {
  const {
    output,
    isProcessing,
    hasResult,
    startCheckin,
    answerQuestion,
    goBack,
    resetCheckin,
    progress,
  } = usePostpartumCheckin();

  const showProgressBar = ["MENTAL", "PHYSICAL", "DELIVERY_TYPE"].includes(output.stage) && !isProcessing;
  const showBackButton = ["DELIVERY_TYPE", "MENTAL", "PHYSICAL"].includes(output.stage) && !isProcessing;

  return (
    <div className="min-h-screen py-8">
      <div className="container" style={{ maxWidth: "580px" }}>
        {/* Top nav */}
        <div className="flex items-center gap-3 mb-6" style={{ animation: "fadeIn 0.3s ease-out both" }}>
          {showBackButton ? (
            <button id="pp-back" onClick={goBack}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
          )}
          <div className="flex-1" />
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-lavender to-peach flex items-center justify-center shadow-sm">
            <Baby className="w-5 h-5 text-foreground/70" />
          </div>
        </div>

        {/* Header (hidden during result + processing) */}
        {output.stage !== "RESULT" && !isProcessing && (
          <div className="mb-6" style={{ animation: "fadeIn 0.35s ease-out both" }}>
            <h1 className="text-2xl md:text-3xl font-bold">
              Postpartum <span className="text-gradient-bloom">Care</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">Your personalized recovery companion</p>
          </div>
        )}

        {/* Progress bar */}
        {showProgressBar && (
          <div>
            <div className="pp-step-counter">Step {progress.current} of {progress.total}</div>
            <div className="pp-progress-bar">
              {Array.from({ length: progress.total }).map((_, i) => (
                <div key={i} className={`pp-progress-dot ${i < progress.current ? "active" : ""}`} />
              ))}
            </div>
          </div>
        )}

        {/* ── Stage Rendering (driven by engine output) ── */}

        {/* Processing animation (frontend-only transition) */}
        {isProcessing && <ProcessingView />}

        {/* CONGRATS */}
        {!isProcessing && output.stage === "CONGRATS" && (
          <CongratsView
            title={output.ui.title}
            message={output.ui.message}
            cta={output.ui.cta}
            onStart={startCheckin}
          />
        )}

        {/* DELIVERY_TYPE */}
        {!isProcessing && output.stage === "DELIVERY_TYPE" && output.questions.length > 0 && (
          <DeliveryTypeView
            question={output.questions[0]}
            onAnswer={answerQuestion}
          />
        )}

        {/* MENTAL */}
        {!isProcessing && output.stage === "MENTAL" && output.questions.length > 0 && (
          <QuestionView
            question={output.questions[0]}
            uiTitle={output.ui.title}
            onAnswer={answerQuestion}
          />
        )}

        {/* PHYSICAL */}
        {!isProcessing && output.stage === "PHYSICAL" && output.questions.length > 0 && (
          <QuestionView
            question={output.questions[0]}
            uiTitle={output.ui.title}
            onAnswer={answerQuestion}
          />
        )}

        {/* RESULT */}
        {!isProcessing && hasResult && output.stage === "RESULT" && output.carePlan && (
          <ResultView
            carePlan={output.carePlan}
            alerts={output.alerts}
            ui={output.ui}
            onReset={resetCheckin}
          />
        )}
      </div>
    </div>
  );
}
