import { useState, useRef, useEffect, useMemo } from "react";
import { usePregnancyProfile } from "@/hooks/usePregnancyProfile";
import ScrollReveal from "@/components/ScrollReveal";
import {
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Baby,
  FileText,
  Clock,
  AlertTriangle,
  Shield,
} from "lucide-react";
import {
  MATERNAL_TESTS,
  groupTestsByTrimester,
  getTestStatus,
  getNextUpcomingTest,
  CATEGORY_COLORS,
  STATUS_STYLES,
  type MaternalTest,
  type TestStatus,
} from "@/lib/maternalTestsData";

// ─── Trimester Header ────────────────────────────────────────────────────────

const TRIMESTER_LABELS: Record<1 | 2 | 3, { title: string; weeks: string; gradient: string }> = {
  1: { title: "First Trimester", weeks: "Weeks 1–13", gradient: "from-pink-500 to-rose-400" },
  2: { title: "Second Trimester", weeks: "Weeks 14–27", gradient: "from-violet-500 to-purple-400" },
  3: { title: "Third Trimester", weeks: "Weeks 28–40", gradient: "from-blue-500 to-indigo-400" },
};

// ─── Timeline Card ───────────────────────────────────────────────────────────

function TimelineCard({
  test,
  status,
  isLast,
}: {
  test: MaternalTest;
  status: TestStatus;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusStyle = STATUS_STYLES[status];
  const categoryColor = CATEGORY_COLORS[test.category];

  const isCurrent = status === "current";
  const isCompleted = status === "completed";

  return (
    <div className="flex gap-4">
      {/* Left: connector */}
      <div className="flex flex-col items-center w-8 shrink-0">
        {/* Dot */}
        <div
          className={`w-4 h-4 rounded-full border-[3px] shrink-0 z-10 transition-all duration-300 ${
            isCurrent
              ? "border-purple-500 bg-purple-200 ring-4 ring-purple-100 scale-125"
              : isCompleted
              ? "border-emerald-400 bg-emerald-100"
              : status === "recommended-soon"
              ? "border-amber-400 bg-amber-100 animate-pulse"
              : status === "missed"
              ? "border-red-400 bg-red-100"
              : "border-slate-300 bg-slate-100"
          }`}
        />
        {/* Line */}
        {!isLast && (
          <div
            className={`w-0.5 flex-1 min-h-[24px] transition-colors ${
              isCompleted ? "bg-emerald-300" : "bg-border"
            }`}
          />
        )}
      </div>

      {/* Right: card */}
      <div
        className={`flex-1 mb-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
          isCurrent
            ? "border-purple-300 bg-gradient-to-br from-purple-50/80 to-violet-50/60 shadow-lg shadow-purple-100/40 ring-1 ring-purple-200/50"
            : isCompleted
            ? "border-emerald-200/60 bg-emerald-50/30 opacity-75"
            : status === "recommended-soon"
            ? "border-amber-200 bg-amber-50/30 shadow-md"
            : status === "missed"
            ? "border-red-200 bg-red-50/30"
            : "border-border/50 bg-card"
        }`}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left p-4 sm:p-5"
        >
          {/* Top row: badges */}
          <div className="flex items-center gap-2 flex-wrap mb-2.5">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${categoryColor.bg} ${categoryColor.text} ${categoryColor.border}`}
            >
              {test.category}
            </span>
            {test.optional && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                Optional
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
              {statusStyle.label}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-sm font-bold text-foreground leading-snug mb-1.5">
            {test.title}
          </h4>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {test.description}
          </p>

          {/* Week range + expand */}
          <div className="flex items-center justify-between mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Clock className="w-3.5 h-3.5" />
              WHEN TO TAKE:{" "}
              <span className="text-rose-500 font-bold">
                {test.weekStart === test.weekEnd
                  ? `${test.weekStart} WEEKS`
                  : `${test.weekStart} - ${test.weekEnd} WEEKS`}
              </span>
            </span>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expandable details */}
        <div
          className="transition-all duration-300 ease-in-out overflow-hidden"
          style={{
            maxHeight: expanded ? "500px" : "0px",
            opacity: expanded ? 1 : 0,
          }}
        >
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3 border-t border-border/30 pt-4">
            {/* Why it matters */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Why this test matters
                </p>
                <p className="text-xs text-foreground/85 leading-relaxed">
                  {test.whyItMatters}
                </p>
              </div>
            </div>

            {/* Risk notes */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Important notes
                </p>
                <p className="text-xs text-foreground/85 leading-relaxed">
                  {test.riskNotes}
                </p>
              </div>
            </div>

            {/* Doctor recommendation */}
            <div className="rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 p-3 flex items-start gap-2.5">
              <Stethoscope className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <p className="text-xs text-purple-800 leading-relaxed">
                <strong>Doctor Tip:</strong> Discuss the timing and necessity of this test with your healthcare provider based on your specific pregnancy needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Trimester Section ───────────────────────────────────────────────────────

function TrimesterSection({
  trimester,
  tests,
  currentWeek,
  defaultOpen,
}: {
  trimester: 1 | 2 | 3;
  tests: MaternalTest[];
  currentWeek: number;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const label = TRIMESTER_LABELS[trimester];
  const completedCount = tests.filter((t) => getTestStatus(t, currentWeek) === "completed").length;

  return (
    <div className="mb-2">
      {/* Section header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all mb-3"
      >
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${label.gradient} flex items-center justify-center shadow-sm`}
        >
          <Baby className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 text-left">
          <h3 className="text-sm font-bold text-foreground">{label.title}</h3>
          <p className="text-[11px] text-muted-foreground">
            {label.weeks} • {completedCount}/{tests.length} done
          </p>
        </div>
        {/* Progress ring */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">
            {Math.round((completedCount / tests.length) * 100)}%
          </span>
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Timeline cards */}
      <div
        className="transition-all duration-400 ease-in-out overflow-hidden"
        style={{
          maxHeight: isOpen ? `${tests.length * 400}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="pl-2">
          {tests.map((test, idx) => (
            <TimelineCard
              key={test.id}
              test={test}
              status={getTestStatus(test, currentWeek)}
              isLast={idx === tests.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Timeline Component ─────────────────────────────────────────────────

export default function MaternalTestsTimeline() {
  const { currentWeek, trimester } = usePregnancyProfile();
  const grouped = useMemo(() => groupTestsByTrimester(MATERNAL_TESTS), []);
  const nextTest = useMemo(
    () => getNextUpcomingTest(MATERNAL_TESTS, currentWeek),
    [currentWeek],
  );

  return (
    <div className="space-y-5">
      {/* Sticky header */}
      <ScrollReveal delay={80}>
        <div className="rounded-2xl border-2 border-purple-200/60 bg-gradient-to-br from-purple-50 to-violet-50/80 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-[80px] opacity-10 bg-gradient-to-br from-purple-500 to-violet-500" />
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600/70 mb-1">
                Your Pregnancy Journey
              </p>
              <h2 className="text-lg font-bold text-foreground leading-snug">
                Week {currentWeek} • Trimester {trimester}
              </h2>
              {nextTest ? (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Next test:{" "}
                  <strong className="text-purple-700">{nextTest.title}</strong>{" "}
                  <span className="text-rose-500 font-semibold">
                    (Week {nextTest.weekStart}
                    {nextTest.weekEnd !== nextTest.weekStart
                      ? `–${nextTest.weekEnd}`
                      : ""}
                    )
                  </span>
                </p>
              ) : (
                <p className="text-xs text-emerald-600 mt-1.5 font-medium">
                  All recommended tests completed! 🎉
                </p>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Timeline sections by trimester */}
      {([1, 2, 3] as const).map((tri) => (
        <ScrollReveal key={tri} delay={100 + tri * 40}>
          <TrimesterSection
            trimester={tri}
            tests={grouped[tri]}
            currentWeek={currentWeek}
            defaultOpen={tri === trimester}
          />
        </ScrollReveal>
      ))}

      {/* Disclaimer */}
      <ScrollReveal delay={300}>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              <strong>Disclaimer:</strong> This timeline provides general
              recommendations. Your doctor may adjust the schedule based on
              your individual pregnancy needs and risk factors. Always follow
              your healthcare provider's advice.
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
