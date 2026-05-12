/**
 * CareLog.tsx — Family Planning Care Log Module
 * Recovery dashboard for post-procedure tracking and support.
 */

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  useCareLog,
  detectRedFlags,
  type CareProfile,
  type CareLogEntry,
  type CareChecklist,
  type WeeklyCheckIn,
  type ProcedureType,
  type ConcernId,
  type PainLevel,
} from "@/hooks/useCareLog";
import {
  PROCEDURE_OPTIONS,
  CONCERN_OPTIONS,
  RECOVERY_MESSAGES,
  PROCEDURE_GUIDANCE,
  CHECKLIST_ITEMS,
  SYMPTOM_WATCH_TOGGLES,
  WEEKLY_QUESTIONS,
  SAFETY_DISCLAIMER,
} from "@/lib/careLogGuidance";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Heart,
  RotateCcw,
  Shield,
  Stethoscope,
} from "lucide-react";
import SOSButton from "@/components/emergency/SOSButton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const TIMELINE_STAGES = [
  {
    key: "first-week",
    label: "First week",
    range: "Days 0-7",
    description: "Rest, hydration, medicine adherence, and watching for warning signs.",
    reminder: "Take recovery gently and follow your doctor's instructions.",
  },
  {
    key: "2-6-weeks",
    label: "2-6 weeks",
    range: "Weeks 2-6",
    description: "Gradual recovery, follow-up visits, and avoiding strain.",
    reminder: "Keep tracking symptoms and return to routine only as advised.",
  },
  {
    key: "6-weeks-plus",
    label: "6+ weeks",
    range: "Weeks 7-12",
    description: "Continue monitoring and resume activities only as advised.",
    reminder: "Notice whether comfort, energy, and mobility continue improving.",
  },
  {
    key: "follow-up",
    label: "Follow-up stage",
    range: "Longer-term",
    description: "Keep follow-ups, monitor ongoing concerns, and ask about long-term care.",
    reminder: "Use your log to guide questions during health visits.",
  },
] as const;

const PRIMARY_CHECKLIST_KEYS: Array<keyof Omit<CareChecklist, "date" | "savedAt">> = [
  "medicineTaken",
  "hydration",
  "rest",
  "avoidedHeavyLifting",
];

const EXTRA_CHECKLIST_KEYS: Array<keyof Omit<CareChecklist, "date" | "savedAt">> = [
  "woundChecked",
  "followupDone",
];

function formatDate(date: string) {
  return dateFormatter.format(new Date(`${date}T12:00:00`));
}

function formatTimeSince(daysSince: number) {
  const weeks = Math.floor(daysSince / 7);
  const days = daysSince % 7;

  if (weeks <= 0) {
    return `${daysSince} day${daysSince === 1 ? "" : "s"} since procedure`;
  }

  return `${weeks} week${weeks === 1 ? "" : "s"}, ${days} day${days === 1 ? "" : "s"} since procedure`;
}

function getDisplayStage(daysSince: number) {
  if (daysSince <= 7) {
    return {
      badge: "Early Recovery",
      summary: "You are in the earliest recovery phase. Focus on rest, routine care, and noticing any symptoms that may need attention.",
      progress: 18,
      timelineIndex: 0,
    };
  }

  if (daysSince <= 42) {
    return {
      badge: "Mid Recovery",
      summary: "Your recovery is underway. Keep up daily care, monitor symptoms, and follow up as advised.",
      progress: 52,
      timelineIndex: 1,
    };
  }

  if (daysSince <= 84) {
    return {
      badge: "Advanced Recovery",
      summary: "You are in a later recovery phase. Keep monitoring symptoms and attend follow-ups as advised.",
      progress: 82,
      timelineIndex: 2,
    };
  }

  return {
    badge: "Long-term Follow-up",
    summary: "Your recovery may now be in longer-term follow-up. Continue tracking anything ongoing and follow your doctor's advice.",
    progress: 100,
    timelineIndex: 3,
  };
}

function CareLogOnboarding({ onComplete }: { onComplete: (data: Omit<CareProfile, "onboardedAt">) => void }) {
  const [step, setStep] = useState(0);
  const [procedureType, setProcedureType] = useState<ProcedureType | null>(null);
  const [procedureDate, setProcedureDate] = useState("");
  const [concerns, setConcerns] = useState<ConcernId[]>([]);

  const toggleConcern = (id: ConcernId) => {
    if (id === "none") {
      setConcerns(["none"]);
      return;
    }

    setConcerns((prev) => {
      const filtered = prev.filter((concern) => concern !== "none");
      return filtered.includes(id) ? filtered.filter((concern) => concern !== id) : [...filtered, id];
    });
  };

  const canProceed = step === 0 ? !!procedureType : step === 1 ? !!procedureDate : concerns.length > 0;

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
      return;
    }

    if (procedureType && procedureDate) {
      onComplete({ procedureType, procedureDate, concerns });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 md:py-14">
      <div className="container max-w-2xl px-4">
        <Link to="/family-planning" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="rounded-[28px] border border-teal-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,118,110,0.35)] md:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                <Heart className="h-3.5 w-3.5" />
                Care Log Setup
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Personalize your recovery support</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                A few details help tailor your care dashboard and recovery guidance.
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index <= step ? "w-10 bg-teal-500" : "w-6 bg-slate-200",
                  )}
                />
              ))}
            </div>
          </div>

          {step === 0 ? (
            <div>
              <h2 className="text-base font-semibold text-slate-900">What procedure did you undergo?</h2>
              <p className="mt-1 text-sm text-slate-500">This helps us show more relevant recovery guidance.</p>
              <div className="mt-5 grid gap-3">
                {PROCEDURE_OPTIONS.map((option) => {
                  const selected = procedureType === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setProcedureType(option.id)}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all duration-200",
                        selected
                          ? "border-teal-300 bg-teal-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-xl">{option.emoji}</div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{option.description}</p>
                        </div>
                        {selected ? <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" /> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="text-base font-semibold text-slate-900">When was the procedure?</h2>
              <p className="mt-1 text-sm text-slate-500">Your recovery stage will update automatically based on this date.</p>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Procedure date</label>
                <input
                  type="date"
                  value={procedureDate}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setProcedureDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none ring-0 transition focus:border-teal-300"
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="text-base font-semibold text-slate-900">Any current concerns?</h2>
              <p className="mt-1 text-sm text-slate-500">Select what feels most relevant right now.</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {CONCERN_OPTIONS.map((option) => {
                  const selected = concerns.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      onClick={() => toggleConcern(option.id)}
                      className={cn(
                        "rounded-2xl border p-3 text-left text-sm transition-all duration-200",
                        selected
                          ? "border-teal-300 bg-teal-50 text-teal-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-slate-50",
                      )}
                    >
                      <span className="font-medium">{option.emoji} {option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex gap-3">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
            ) : null}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                "flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition",
                canProceed ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-slate-200 text-slate-500",
              )}
            >
              {step === 2 ? "Start Care Log" : "Continue"}
            </button>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 p-4 text-xs leading-5 text-slate-500">
          <div className="flex items-start gap-2.5">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <p>{SAFETY_DISCLAIMER}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecoverySummaryCard({ profile, daysSince, stage }: { profile: CareProfile; daysSince: number; stage: string }) {
  const procedureLabel = PROCEDURE_OPTIONS.find((item) => item.id === profile.procedureType)?.label ?? "Procedure";
  const displayStage = getDisplayStage(daysSince);
  const stageMessage = RECOVERY_MESSAGES[stage as keyof typeof RECOVERY_MESSAGES];

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900">{displayStage.badge}</p>
          <div className="flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 px-3 py-1">{procedureLabel}</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">{formatTimeSince(daysSince)}</span>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">{stageMessage?.message ?? displayStage.summary}</p>
        </div>
        <div className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
          {displayStage.badge}
        </div>
      </div>
    </section>
  );
}

function DailyCareChecklist({ checklist, onSave }: { checklist: CareChecklist; onSave: (entry: CareChecklist) => void }) {
  const [local, setLocal] = useState(checklist);

  useEffect(() => {
    setLocal(checklist);
  }, [checklist]);

  const visibleItems = CHECKLIST_ITEMS.filter((item) => PRIMARY_CHECKLIST_KEYS.includes(item.key));
  const completed = visibleItems.filter((item) => local[item.key]).length;
  const total = visibleItems.length;
  const progress = Math.round((completed / total) * 100);

  const toggleItem = (key: keyof Omit<CareChecklist, "date" | "savedAt">) => {
    const updated = { ...local, [key]: !local[key] };
    setLocal(updated);
    onSave(updated);
  };

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Today's Care Checklist</h2>
          <p className="mt-1 text-sm text-slate-500">{completed} of {total} completed</p>
        </div>
        <span className="text-sm font-medium text-slate-600">{progress}%</span>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-teal-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid gap-3">
        {visibleItems.map((item) => {
          const checked = local[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={cn(
                "rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                checked
                  ? "border-teal-200 bg-teal-50"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                    checked ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300 bg-white text-transparent",
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {completed === total ? (
        <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          Great job. You completed today's recovery care.
        </div>
      ) : null}
    </section>
  );
}

function ExtraChecklistItems({ checklist, onSave }: { checklist: CareChecklist; onSave: (entry: CareChecklist) => void }) {
  const [local, setLocal] = useState(checklist);

  useEffect(() => {
    setLocal(checklist);
  }, [checklist]);

  const extraItems = CHECKLIST_ITEMS.filter((item) => EXTRA_CHECKLIST_KEYS.includes(item.key));

  const toggleItem = (key: keyof Omit<CareChecklist, "date" | "savedAt">) => {
    const updated = { ...local, [key]: !local[key] };
    setLocal(updated);
    onSave(updated);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Extra checklist items</h3>
      <div className="mt-3 grid gap-2">
        {extraItems.map((item) => {
          const checked = local[item.key];
          return (
            <button
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                checked ? "border-teal-200 bg-teal-50" : "border-slate-200 bg-white hover:bg-slate-50",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all",
                  checked ? "border-teal-500 bg-teal-500 text-white" : "border-slate-300 bg-white text-transparent",
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <span className="text-slate-800">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SymptomWatchPanel({ log, onSave }: { log: CareLogEntry; onSave: (entry: CareLogEntry) => void }) {
  const [local, setLocal] = useState(log);

  useEffect(() => {
    setLocal(log);
  }, [log]);

  const redFlags = detectRedFlags(local);
  const monitoringSymptoms = SYMPTOM_WATCH_TOGGLES.filter((item) => !item.isRedFlag);
  const warningSymptoms = SYMPTOM_WATCH_TOGGLES.filter((item) => item.isRedFlag);

  const saveUpdate = (updated: CareLogEntry) => {
    setLocal(updated);
    onSave(updated);
  };

  const toggleSymptom = (key: keyof CareLogEntry) => {
    saveUpdate({ ...local, [key]: !local[key] });
  };

  const setPainLevel = (level: PainLevel) => {
    saveUpdate({ ...local, painLevel: level });
  };

  const painMeta = (level: PainLevel) => {
    if (level === 0) return { label: "No pain", tone: "text-emerald-700 bg-emerald-50 border-emerald-200" };
    if (level <= 2) return { label: "Mild", tone: "text-teal-700 bg-teal-50 border-teal-200" };
    if (level <= 4) return { label: "Moderate", tone: "text-amber-700 bg-amber-50 border-amber-200" };
    return { label: "Severe", tone: "text-rose-700 bg-rose-50 border-rose-200" };
  };

  const currentPain = painMeta(local.painLevel);

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Symptom Watch</h2>
        <p className="mt-1 text-sm text-slate-500">Log how you feel today.</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Pain level</p>
            </div>
            <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", currentPain.tone)}>{currentPain.label}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {([0, 1, 2, 3, 4, 5] as PainLevel[]).map((level) => {
              const active = local.painLevel === level;
              const label = level === 0 ? "No pain" : level <= 2 ? "Mild" : level <= 4 ? "Moderate" : "Severe";

              return (
                <button
                  key={level}
                  onClick={() => setPainLevel(level)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-center transition-all duration-200",
                    active
                      ? level <= 2
                        ? "border-teal-300 bg-teal-50 text-teal-800"
                        : level <= 4
                          ? "border-amber-300 bg-amber-50 text-amber-800"
                          : "border-rose-300 bg-rose-50 text-rose-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  )}
                >
                  <p className="text-sm font-semibold">{level}</p>
                  <p className="mt-0.5 text-[10px]">{label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2">
              <p className="text-sm font-semibold text-slate-900">Normal monitoring symptoms</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {monitoringSymptoms.map((item) => {
                const active = !!local[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleSymptom(item.key)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-all duration-200",
                      active
                        ? "border-sky-200 bg-sky-50 text-sky-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50/60",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2">
              <p className="text-sm font-semibold text-slate-900">Warning symptoms</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {warningSymptoms.map((item) => {
                const active = !!local[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleSymptom(item.key)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-sm transition-all duration-200",
                      active
                        ? "border-rose-300 bg-rose-100 text-rose-800"
                        : "border-rose-200 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50",
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {redFlags.length > 0 ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <p>Please contact a healthcare professional if these symptoms continue or worsen.</p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-900">Notes</label>
          <textarea
            value={local.notes}
            onChange={(event) => setLocal({ ...local, notes: event.target.value })}
            onBlur={() => onSave(local)}
            rows={3}
            placeholder="Add anything you want to remember or tell your doctor."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-300"
          />
        </div>
      </div>
    </section>
  );
}

function MoreRecoveryDetailsSection({
  daysSince,
  procedureType,
  weekNumber,
  checkIn,
  onSaveCheckIn,
  checklist,
  onSaveChecklist,
  procedureDate,
  recoveryStage,
}: {
  daysSince: number;
  procedureType: ProcedureType;
  weekNumber: number;
  checkIn: WeeklyCheckIn | null;
  onSaveCheckIn: (entry: WeeklyCheckIn) => void;
  checklist: CareChecklist;
  onSaveChecklist: (entry: CareChecklist) => void;
  procedureDate: string;
  recoveryStage: string;
}) {
  const [open, setOpen] = useState(false);
  const stageMessage = RECOVERY_MESSAGES[recoveryStage as keyof typeof RECOVERY_MESSAGES];

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div>
          <h2 className="text-base font-semibold text-slate-900">More Recovery Details</h2>
          <p className="mt-1 text-sm text-slate-500">Timeline, guidance, weekly check-in, and extra checklist items.</p>
        </div>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />}
      </button>

      <div className={cn("grid transition-all duration-300 ease-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <div className="space-y-5 border-t border-slate-200 px-5 py-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              <p className="font-medium text-slate-900">Detailed recovery education</p>
              <p className="mt-2">Procedure date: {formatDate(procedureDate)}</p>
              <p className="mt-1">{stageMessage?.message}</p>
            </div>
            <ExtraChecklistItems checklist={checklist} onSave={onSaveChecklist} />
            <RecoveryTimelineSection daysSince={daysSince} />
            <ProcedureGuidanceCards procedureType={procedureType} />
            <WeeklyCheckInCard weekNumber={weekNumber} checkIn={checkIn} onSave={onSaveCheckIn} />
          </div>
        </div>
      </div>
    </section>
  );
}

function RecoveryTimelineSection({ daysSince }: { daysSince: number }) {
  const currentIndex = getDisplayStage(daysSince).timelineIndex;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Calendar className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recovery Timeline</h2>
          <p className="mt-1 text-sm text-slate-500">See where you are now and what each stage is generally focused on.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {TIMELINE_STAGES.map((item, index) => {
          const state = index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";
          return (
            <div
              key={item.key}
              className={cn(
                "rounded-3xl border p-4 transition-all duration-200",
                state === "complete" && "border-emerald-200 bg-emerald-50/60",
                state === "current" && "border-sky-200 bg-sky-50/70 shadow-sm",
                state === "upcoming" && "border-slate-200 bg-slate-50/70",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.range}</span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                    state === "complete" && "bg-emerald-100 text-emerald-700",
                    state === "current" && "bg-sky-100 text-sky-700",
                    state === "upcoming" && "bg-slate-200 text-slate-600",
                  )}
                >
                  {state === "current" ? "Current" : state === "complete" ? "Covered" : "Upcoming"}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900">{item.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className="mt-4 rounded-2xl border border-white/80 bg-white/80 p-3 text-xs leading-5 text-slate-500">
                {item.reminder}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ProcedureGuidanceCards({ procedureType }: { procedureType: ProcedureType }) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const guidance = PROCEDURE_GUIDANCE[procedureType];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Procedure-Specific Guidance</h2>
          <p className="mt-1 text-sm text-slate-500">{guidance.title}. Follow your doctor's advice if it differs from general guidance here.</p>
        </div>
      </div>

      <div className="grid gap-3">
        {guidance.topics.map((topic, index) => {
          const isOpen = expanded === index;
          return (
            <div key={`${topic.title}-${index}`} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/70 transition-all duration-200">
              <button
                onClick={() => setExpanded(isOpen ? null : index)}
                className="flex w-full items-start gap-4 p-4 text-left transition hover:bg-white/70"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">{topic.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{topic.preview}</p>
                    </div>
                    {isOpen ? <ChevronUp className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" /> : <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />}
                  </div>
                </div>
              </button>
              <div className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <div className="border-t border-slate-200 px-4 pb-4 pt-3">
                    <ul className="space-y-2">
                      {topic.points.map((point) => (
                        <li key={point} className="flex gap-2 text-sm leading-6 text-slate-600">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function WeeklyCheckInCard({ weekNumber, checkIn, onSave }: { weekNumber: number; checkIn: WeeklyCheckIn | null; onSave: (entry: WeeklyCheckIn) => void }) {
  const [local, setLocal] = useState<WeeklyCheckIn>(
    checkIn ?? {
      weekNumber,
      date: new Date().toISOString().slice(0, 10),
      painImproving: null,
      energyImproving: null,
      unusualSymptoms: null,
      attendedFollowup: null,
      emotionallyOkay: null,
      savedAt: "",
    },
  );

  useEffect(() => {
    setLocal(
      checkIn ?? {
        weekNumber,
        date: new Date().toISOString().slice(0, 10),
        painImproving: null,
        energyImproving: null,
        unusualSymptoms: null,
        attendedFollowup: null,
        emotionallyOkay: null,
        savedAt: "",
      },
    );
  }, [checkIn, weekNumber]);

  const answered = WEEKLY_QUESTIONS.filter((question) => local[question.key] !== null).length;
  const total = WEEKLY_QUESTIONS.length;
  const progress = Math.round((answered / total) * 100);

  const updateAnswer = (key: keyof Omit<WeeklyCheckIn, "weekNumber" | "date" | "savedAt">, value: boolean) => {
    const updated = { ...local, [key]: value };
    setLocal(updated);
    onSave(updated);
  };

  const summary = useMemo(() => {
    if (answered < total) return null;

    const needsAttention =
      local.unusualSymptoms === true ||
      local.painImproving === false ||
      local.energyImproving === false ||
      local.emotionallyOkay === false;

    if (needsAttention) {
      return {
        tone: "amber",
        text: "Some answers may need attention. Consider contacting a healthcare professional.",
      } as const;
    }

    return {
      tone: "emerald",
      text: "Recovery appears stable based on your answers.",
    } as const;
  }, [answered, total, local]);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Weekly Check-in</h2>
            <p className="mt-1 text-sm text-slate-500">Week {weekNumber} summary</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{answered}/{total}</p>
          <p className="text-xs text-slate-500">answered</p>
        </div>
      </div>

      <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-sky-400 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-3">
        {WEEKLY_QUESTIONS.map((question) => {
          const value = local[question.key];
          return (
            <div key={question.key} className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{question.question}</p>
                </div>
                <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1">
                  <button
                    onClick={() => updateAnswer(question.key, true)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                      value === true ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => updateAnswer(question.key, false)}
                    className={cn(
                      "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                      value === false ? "bg-rose-100 text-rose-800" : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {summary ? (
        <div
          className={cn(
            "mt-5 rounded-2xl border p-4 text-sm font-medium",
            summary.tone === "emerald"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800",
          )}
        >
          {summary.text}
        </div>
      ) : null}
    </section>
  );
}

function CareLogHelpSection() {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Need Help / Emergency</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <div className="grid gap-3 sm:grid-cols-2">
          <a href="tel:104" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50">
            Call 104
          </a>
          <a href="tel:108" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50">
            Call 108
          </a>
          <Link to="/phc-nearby" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-50">
            Find PHC
          </Link>
          <button disabled className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-500">
            Contact Doctor
          </button>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3">
          <p className="mb-2 text-xs font-semibold text-rose-700">SOS</p>
          <div className="max-h-[150px] overflow-hidden">
            <div className="origin-top scale-[0.72]">
              <SOSButton />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SafetyDisclaimerCard() {
  return (
    <section className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p className="text-xs leading-5 text-slate-500">{SAFETY_DISCLAIMER}</p>
      </div>
    </section>
  );
}

export default function CareLog() {
  const care = useCareLog();

  if (!care.isOnboarded || !care.profile) {
    return (
      <CareLogOnboarding
        onComplete={(data) => {
          care.completeOnboarding(data);
          toast.success("Care Log set up successfully!");
        }}
      />
    );
  }

  const todayDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-10">
      <div className="container max-w-4xl px-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link to="/family-planning" className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <button
            onClick={() => {
              if (confirm("Reset your Care Log profile? This will clear all data.")) {
                care.resetProfile();
              }
            }}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:text-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Care Log</h1>
            <p className="mt-1 text-sm text-slate-500">Track recovery and know when to seek help.</p>
          </div>

          <RecoverySummaryCard profile={care.profile} daysSince={care.daysSinceProcedure} stage={care.recoveryStage} />
          <DailyCareChecklist checklist={care.getChecklist(todayDate)} onSave={care.saveChecklist} />
          <SymptomWatchPanel log={care.getLog(todayDate)} onSave={care.saveLog} />
          <MoreRecoveryDetailsSection
            daysSince={care.daysSinceProcedure}
            procedureType={care.profile.procedureType}
            weekNumber={care.currentWeekNumber}
            checkIn={care.currentWeeklyCheckIn}
            onSaveCheckIn={care.saveWeeklyCheckIn}
            checklist={care.getChecklist(todayDate)}
            onSaveChecklist={care.saveChecklist}
            procedureDate={care.profile.procedureDate}
            recoveryStage={care.recoveryStage}
          />
          <CareLogHelpSection />
          <SafetyDisclaimerCard />
        </div>
      </div>
    </div>
  );
}
