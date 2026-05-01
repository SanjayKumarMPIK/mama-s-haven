/**
 * CareLog.tsx — Family Planning Care Log Module
 * Post-procedure recovery support with onboarding, daily tracking, and guidance.
 */

import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useCareLog, detectRedFlags, type CareProfile, type CareLogEntry, type CareChecklist, type WeeklyCheckIn, type ProcedureType, type ConcernId, type PainLevel } from "@/hooks/useCareLog";
import { PROCEDURE_OPTIONS, CONCERN_OPTIONS, RECOVERY_MESSAGES, PROCEDURE_GUIDANCE, CHECKLIST_ITEMS, SYMPTOM_WATCH_TOGGLES, WEEKLY_QUESTIONS, SAFETY_DISCLAIMER, RED_FLAG_WARNING } from "@/lib/careLogGuidance";
import { ArrowLeft, Shield, Phone, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, RotateCcw, Heart, Activity, ClipboardList, Calendar, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Onboarding ───────────────────────────────────────────────────────────────

function CareLogOnboarding({ onComplete }: { onComplete: (data: Omit<CareProfile, "onboardedAt">) => void }) {
  const [step, setStep] = useState(0);
  const [procedureType, setProcedureType] = useState<ProcedureType | null>(null);
  const [procedureDate, setProcedureDate] = useState("");
  const [concerns, setConcerns] = useState<ConcernId[]>([]);

  const toggleConcern = (id: ConcernId) => {
    if (id === "none") { setConcerns(["none"]); return; }
    setConcerns(prev => {
      const filtered = prev.filter(c => c !== "none");
      return filtered.includes(id) ? filtered.filter(c => c !== id) : [...filtered, id];
    });
  };

  const canProceed = step === 0 ? !!procedureType : step === 1 ? !!procedureDate : concerns.length > 0;

  const handleNext = () => {
    if (step < 2) { setStep(step + 1); return; }
    if (procedureType && procedureDate) {
      onComplete({ procedureType, procedureDate, concerns });
    }
  };

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-lg">
        <Link to="/family-planning" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-100 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-teal-600" />
          </div>
          <h1 className="text-2xl font-bold">Care Log Setup</h1>
          <p className="text-sm text-muted-foreground mt-2">A few questions to personalize your recovery support</p>
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2].map(i => (
              <div key={i} className={cn("h-1.5 rounded-full transition-all", i <= step ? "w-10 bg-teal-500" : "w-6 bg-muted")} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          {step === 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold mb-1">What procedure did you undergo?</h2>
              <p className="text-xs text-muted-foreground mb-4">This helps us provide relevant care guidance.</p>
              {PROCEDURE_OPTIONS.map(opt => (
                <button key={opt.id} onClick={() => setProcedureType(opt.id)}
                  className={cn("w-full text-left p-4 rounded-xl border-2 transition-all", procedureType === opt.id ? "border-teal-400 bg-teal-50" : "border-border hover:border-teal-200")}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div><p className="text-sm font-semibold">{opt.label}</p><p className="text-xs text-muted-foreground">{opt.description}</p></div>
                    {procedureType === opt.id && <CheckCircle2 className="w-5 h-5 text-teal-500 ml-auto shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold">When was the procedure?</h2>
              <p className="text-xs text-muted-foreground">We'll calculate your recovery stage automatically.</p>
              <input type="date" value={procedureDate} max={new Date().toISOString().slice(0, 10)}
                onChange={e => setProcedureDate(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-300" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold">Any current concerns?</h2>
              <p className="text-xs text-muted-foreground mb-2">Select all that apply.</p>
              <div className="grid grid-cols-2 gap-2">
                {CONCERN_OPTIONS.map(opt => {
                  const active = concerns.includes(opt.id);
                  return (
                    <button key={opt.id} onClick={() => toggleConcern(opt.id)}
                      className={cn("p-3 rounded-xl border text-left text-sm font-medium transition-all",
                        active ? "border-teal-400 bg-teal-50 text-teal-800" : "border-border hover:border-teal-200")}>
                      <span className="flex items-center gap-2">{opt.emoji} {opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors">Back</button>
            )}
            <button onClick={handleNext} disabled={!canProceed}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
                canProceed ? "bg-teal-600 text-white hover:bg-teal-700 shadow-sm" : "bg-muted text-muted-foreground cursor-not-allowed")}>
              {step === 2 ? "Start Care Log" : "Continue"}
            </button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-6 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> {SAFETY_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}

// ─── Recovery Summary Card ────────────────────────────────────────────────────

function RecoverySummaryCard({ profile, daysSince, stage }: { profile: CareProfile; daysSince: number; stage: string }) {
  const msg = RECOVERY_MESSAGES[stage as keyof typeof RECOVERY_MESSAGES];
  const procLabel = PROCEDURE_OPTIONS.find(p => p.id === profile.procedureType)?.label ?? "Procedure";
  const weeks = Math.floor(daysSince / 7);
  const days = daysSince % 7;
  const timeStr = weeks > 0 ? `${weeks} week${weeks > 1 ? "s" : ""}${days > 0 ? `, ${days} day${days > 1 ? "s" : ""}` : ""}` : `${days} day${days !== 1 ? "s" : ""}`;

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${msg.color} p-6 shadow-sm`}>
      <div className="flex items-start gap-4">
        <span className="text-4xl">{msg.emoji}</span>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Recovery Summary</p>
          <h3 className="text-lg font-bold mb-1">{msg.title}</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full bg-white/60 border border-current/10 px-2.5 py-0.5">🏥 {procLabel}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full bg-white/60 border border-current/10 px-2.5 py-0.5">📅 {timeStr} ago</span>
          </div>
          <p className="text-sm leading-relaxed opacity-80">{msg.message}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Daily Care Checklist ─────────────────────────────────────────────────────

function DailyCareChecklist({ checklist, onSave }: { checklist: CareChecklist; onSave: (c: CareChecklist) => void }) {
  const [local, setLocal] = useState(checklist);
  const checked = CHECKLIST_ITEMS.filter(i => local[i.key]).length;
  const total = CHECKLIST_ITEMS.length;

  const toggle = (key: string) => {
    const updated = { ...local, [key]: !(local as any)[key] };
    setLocal(updated);
    onSave(updated);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center"><ClipboardList className="w-4.5 h-4.5 text-emerald-600" /></div>
          <div><h3 className="text-sm font-bold">Daily Care Checklist</h3><p className="text-[11px] text-muted-foreground">{checked}/{total} completed</p></div>
        </div>
        <div className="w-10 h-10 rounded-full border-4 border-emerald-200 flex items-center justify-center">
          <span className="text-xs font-bold text-emerald-700">{Math.round((checked / total) * 100)}%</span>
        </div>
      </div>
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map(item => {
          const isChecked = (local as any)[item.key];
          return (
            <button key={item.key} onClick={() => toggle(item.key)}
              className={cn("w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                isChecked ? "bg-emerald-50 border-emerald-200" : "border-border hover:bg-muted/50")}>
              <span className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0",
                isChecked ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/30")}>
                {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </span>
              <span className="text-sm">{item.emoji} {item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Symptom Watch ────────────────────────────────────────────────────────────

function SymptomWatch({ log, onSave }: { log: CareLogEntry; onSave: (l: CareLogEntry) => void }) {
  const [local, setLocal] = useState(log);
  const redFlags = detectRedFlags(local);

  const toggleSymptom = (key: string) => {
    const updated = { ...local, [key]: !(local as any)[key] };
    setLocal(updated);
    onSave(updated);
  };

  const setPain = (level: PainLevel) => {
    const updated = { ...local, painLevel: level };
    setLocal(updated);
    onSave(updated);
  };

  const setNotes = (notes: string) => {
    const updated = { ...local, notes };
    setLocal(updated);
  };

  const saveNotes = () => onSave(local);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center"><Activity className="w-4.5 h-4.5 text-blue-600" /></div>
        <div><h3 className="text-sm font-bold">Symptom Watch</h3><p className="text-[11px] text-muted-foreground">Log how you're feeling today</p></div>
      </div>

      {/* Pain Level */}
      <div>
        <p className="text-xs font-semibold mb-2">Pain Level</p>
        <div className="flex gap-1.5">
          {([0, 1, 2, 3, 4, 5] as PainLevel[]).map(level => (
            <button key={level} onClick={() => setPain(level)}
              className={cn("flex-1 py-2 rounded-lg border text-xs font-bold transition-all",
                local.painLevel === level
                  ? level <= 1 ? "bg-green-100 border-green-300 text-green-700"
                    : level <= 3 ? "bg-amber-100 border-amber-300 text-amber-700"
                    : "bg-red-100 border-red-300 text-red-700"
                  : "border-border hover:bg-muted/50")}>
              {level}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-1"><span className="text-[10px] text-muted-foreground">No pain</span><span className="text-[10px] text-muted-foreground">Severe</span></div>
      </div>

      {/* Symptom toggles */}
      <div>
        <p className="text-xs font-semibold mb-2">Symptoms</p>
        <div className="grid grid-cols-2 gap-2">
          {SYMPTOM_WATCH_TOGGLES.map(s => {
            const active = !!(local as any)[s.key];
            return (
              <button key={s.key} onClick={() => toggleSymptom(s.key)}
                className={cn("p-2.5 rounded-xl border text-left text-xs font-medium transition-all",
                  active ? s.isRedFlag ? "bg-red-50 border-red-300 text-red-800" : "bg-blue-50 border-blue-300 text-blue-800"
                  : "border-border hover:bg-muted/50")}>
                {s.emoji} {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Red Flag Alert */}
      {redFlags.length > 0 && (
        <div className="rounded-xl border-2 border-red-300 bg-red-50 p-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800 mb-1">⚠️ Red Flag Detected</p>
              <ul className="text-xs text-red-700 space-y-0.5 mb-3">
                {redFlags.map(f => <li key={f}>• {f}</li>)}
              </ul>
              <p className="text-sm font-semibold text-red-900">{RED_FLAG_WARNING}</p>
              <a href="tel:104" className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold shadow hover:bg-red-700 transition-all">
                <Phone className="w-4 h-4" /> Call 104 Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <p className="text-xs font-semibold mb-1.5">Notes (optional)</p>
        <textarea value={local.notes} onChange={e => setNotes(e.target.value)} onBlur={saveNotes}
          rows={2} placeholder="How are you feeling today?"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300" />
      </div>
    </div>
  );
}

// ─── Procedure-Specific Guidance ──────────────────────────────────────────────

function ProcedureGuidanceSection({ procedureType }: { procedureType: ProcedureType }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const guidance = PROCEDURE_GUIDANCE[procedureType];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center"><Stethoscope className="w-4.5 h-4.5 text-purple-600" /></div>
        <div><h3 className="text-sm font-bold">{guidance.title}</h3><p className="text-[11px] text-muted-foreground">Tap a topic to expand</p></div>
      </div>
      <div className="space-y-2">
        {guidance.topics.map((topic, idx) => (
          <div key={idx} className="rounded-xl border border-border overflow-hidden">
            <button onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors">
              <span className="text-lg">{topic.emoji}</span>
              <span className="text-sm font-semibold flex-1">{topic.title}</span>
              {expandedIdx === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {expandedIdx === idx && (
              <div className="px-4 pb-4 pt-1 border-t border-border/50 animate-in fade-in duration-200">
                <ul className="space-y-1.5">
                  {topic.points.map((pt, i) => (
                    <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-teal-500 mt-0.5">•</span>{pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Weekly Check-in ──────────────────────────────────────────────────────────

function WeeklyCheckInSection({ weekNumber, checkIn, onSave }: { weekNumber: number; checkIn: WeeklyCheckIn | null; onSave: (w: WeeklyCheckIn) => void }) {
  const [local, setLocal] = useState<WeeklyCheckIn>(checkIn ?? {
    weekNumber, date: new Date().toISOString().slice(0, 10),
    painImproving: null, energyImproving: null, unusualSymptoms: null, attendedFollowup: null, emotionallyOkay: null, savedAt: "",
  });

  const setAnswer = (key: string, val: boolean) => {
    const updated = { ...local, [key]: val };
    setLocal(updated);
    onSave(updated);
  };

  const answered = WEEKLY_QUESTIONS.filter(q => (local as any)[q.key] !== null).length;
  const total = WEEKLY_QUESTIONS.length;

  // Determine progress message
  const progressMsg = useMemo(() => {
    if (answered < total) return null;
    const positive = [local.painImproving, local.energyImproving, local.emotionallyOkay].filter(Boolean).length;
    const concerning = local.unusualSymptoms === true;
    if (concerning) return { text: "Some symptoms need attention — consider contacting a healthcare worker", tone: "amber" as const };
    if (positive >= 2) return { text: "Recovery appears stable based on your logs", tone: "emerald" as const };
    return { text: "Keep tracking — your awareness helps your recovery", tone: "blue" as const };
  }, [local, answered, total]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center"><Calendar className="w-4.5 h-4.5 text-indigo-600" /></div>
        <div><h3 className="text-sm font-bold">Week {weekNumber} Check-in</h3><p className="text-[11px] text-muted-foreground">{answered}/{total} answered</p></div>
      </div>
      <div className="space-y-3">
        {WEEKLY_QUESTIONS.map(q => {
          const val = (local as any)[q.key];
          return (
            <div key={q.key} className="flex items-center justify-between p-3 rounded-xl border border-border">
              <span className="text-sm flex items-center gap-2">{q.emoji} {q.question}</span>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setAnswer(q.key, true)}
                  className={cn("px-3 py-1 rounded-lg text-xs font-semibold border transition-all",
                    val === true ? "bg-emerald-100 border-emerald-300 text-emerald-700" : "border-border hover:bg-muted/50")}>Yes</button>
                <button onClick={() => setAnswer(q.key, false)}
                  className={cn("px-3 py-1 rounded-lg text-xs font-semibold border transition-all",
                    val === false ? "bg-rose-100 border-rose-300 text-rose-700" : "border-border hover:bg-muted/50")}>No</button>
              </div>
            </div>
          );
        })}
      </div>
      {progressMsg && (
        <div className={cn("mt-4 p-3 rounded-xl border text-sm font-medium",
          progressMsg.tone === "emerald" ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : progressMsg.tone === "amber" ? "bg-amber-50 border-amber-200 text-amber-800"
          : "bg-blue-50 border-blue-200 text-blue-800")}>
          {progressMsg.tone === "emerald" ? "✅" : progressMsg.tone === "amber" ? "⚠️" : "💡"} {progressMsg.text}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CareLog() {
  const care = useCareLog();

  if (!care.isOnboarded || !care.profile) {
    return <CareLogOnboarding onComplete={data => { care.completeOnboarding(data); toast.success("Care Log set up successfully!"); }} />;
  }

  const todayDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Link to="/family-planning" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <button onClick={() => { if (confirm("Reset your Care Log profile? This will clear all data.")) { care.resetProfile(); } }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold mb-3">💗 Care Log</div>
          <h1 className="text-2xl md:text-3xl font-bold">Your Recovery Journal</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Track your daily recovery and stay informed.</p>
        </div>

        <div className="space-y-5">
          {/* 1. Recovery Summary */}
          <RecoverySummaryCard profile={care.profile} daysSince={care.daysSinceProcedure} stage={care.recoveryStage} />

          {/* 2. Daily Care Checklist */}
          <DailyCareChecklist checklist={care.getChecklist(todayDate)} onSave={care.saveChecklist} />

          {/* 3. Symptom Watch + Red Flags */}
          <SymptomWatch log={care.getLog(todayDate)} onSave={care.saveLog} />

          {/* 4. Procedure-Specific Guidance */}
          <ProcedureGuidanceSection procedureType={care.profile.procedureType} />

          {/* 5. Weekly Check-in */}
          <WeeklyCheckInSection weekNumber={care.currentWeekNumber} checkIn={care.currentWeeklyCheckIn} onSave={care.saveWeeklyCheckIn} />

          {/* 6. Emergency Help */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-blue-600" /></div>
            <div>
              <h3 className="text-base font-bold text-blue-900 mb-1">Need Help?</h3>
              <p className="text-sm text-blue-800 leading-relaxed mb-3">If you experience any concerning symptoms, contact a healthcare professional immediately.</p>
              <div className="flex flex-wrap gap-2">
                <a href="tel:104" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition-all">📞 Call 104</a>
                <a href="tel:108" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-all">🚑 Call 108</a>
                <Link to="/phc-nearby" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-300 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-all">📍 Find PHC</Link>
              </div>
            </div>
          </div>

          {/* 7. Safety Disclaimer */}
          <div className="rounded-2xl border border-border bg-muted/30 p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">{SAFETY_DISCLAIMER}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
