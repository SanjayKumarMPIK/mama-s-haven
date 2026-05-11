import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Brain, ChevronRight, Shield, Snowflake, Sparkles, Wind, Wrench } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { useAuth } from "@/hooks/useAuth";
import { useHealthLog, type MenopauseEntry } from "@/hooks/useHealthLog";
import {
  countRecentCalendarPatterns,
  readMenopauseToolData,
  type BrainFogTask,
  type CalmRoutineRecord,
  type CoolingPlanRecord,
} from "@/lib/menopauseTools";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  to: string;
  icon: ReactNode;
  gradient: string;
  borderColor: string;
  iconBg: string;
  name: string;
  description: string;
  summaryLabel: string;
  summaryValue: string;
  accentClass: string;
  delay?: number;
}

function ToolCard({ to, icon, gradient, borderColor, iconBg, name, description, summaryLabel, summaryValue, accentClass, delay = 0 }: ToolCardProps) {
  return (
    <ScrollReveal delay={delay}>
      <Link
        to={to}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden rounded-3xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
          gradient,
          borderColor,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,.55),transparent_45%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="relative z-10 flex items-start gap-3.5">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md", iconBg)}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]", accentClass)}>
              Menopause tool
            </span>
            <h3 className="mt-1 text-sm font-bold text-slate-800">{name}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{description}</p>
          </div>
        </div>
        <div className="relative z-10 mt-4 rounded-2xl border border-white/80 bg-white/70 p-3 backdrop-blur-sm">
          <p className="text-[10px] font-medium text-slate-500">{summaryLabel}</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{summaryValue}</p>
        </div>
        <div className="relative z-10 mt-auto flex justify-end pt-4">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 transition-colors group-hover:text-slate-800">
            Open <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </ScrollReveal>
  );
}

export default function MenoTools() {
  const { user } = useAuth();
  const { getPhaseLogs } = useHealthLog();

  const menopauseCalendarLogs = useMemo(() => {
    const phaseLogs = getPhaseLogs("menopause");
    return Object.entries(phaseLogs)
      .map(([date, entry]) => ({ date, entry: entry as MenopauseEntry }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [getPhaseLogs]);

  const calendarSummary = useMemo(() => countRecentCalendarPatterns(menopauseCalendarLogs), [menopauseCalendarLogs]);

  const coolingSummary = useMemo(() => {
    const plans = readMenopauseToolData<CoolingPlanRecord[]>(user?.id, "coolingPlans", []);
    const latest = plans[0];
    if (!latest) return calendarSummary.nightSweatDays >= 3 ? "Night support plan recommended" : "Create your first comfort plan";
    return `${latest.completedItems.length} of ${latest.planItems.length} actions completed`;
  }, [calendarSummary.nightSweatDays, user?.id]);

  const calmSummary = useMemo(() => {
    const routines = readMenopauseToolData<CalmRoutineRecord[]>(user?.id, "calmRoutines", []);
    if (routines.length === 0) {
      if (calendarSummary.sleepDifficultyDays >= 3) return "Sleep reset routine recommended";
      if (calendarSummary.lowMoodDays >= 3) return "Gentle mixed routine recommended";
      return "Generate a short calming routine";
    }
    return routines[0].completed ? "Last routine completed" : `Last routine: ${routines[0].durationMinutes}-minute reset`;
  }, [calendarSummary.lowMoodDays, calendarSummary.sleepDifficultyDays, user?.id]);

  const brainFogSummary = useMemo(() => {
    const tasks = readMenopauseToolData<BrainFogTask[]>(user?.id, "brainFogTasks", []);
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = tasks.filter((task) => task.date === today);
    if (todayTasks.length > 0) return `${todayTasks.filter((task) => !task.completed).length} focus task${todayTasks.length > 1 ? "s" : ""} left today`;
    return calendarSummary.sleepDifficultyDays >= 3 ? "Low-sleep days suggest using notes today" : "Capture notes and reminders quickly";
  }, [calendarSummary.sleepDifficultyDays, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffaf5] via-[#f8fbff] to-[#f3fffb] font-[Poppins,sans-serif]">
      <div className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="container py-5">
          <ScrollReveal>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 shadow-lg shadow-amber-200/50">
                  <Wrench className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-800">Menopause Tools</h1>
                  <p className="text-xs text-slate-500">Action-focused tools that complement your calendar and wellness data</p>
                </div>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 sm:flex">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-[11px] font-medium text-slate-600">Practical, private, menopause-specific</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container max-w-5xl space-y-5 py-6">
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-gradient-to-br from-amber-200/60 to-emerald-200/60 blur-2xl" />
            <div className="relative z-[1] grid gap-4 sm:grid-cols-[1.4fr_1fr] sm:items-center">
              <div>
                <p className="text-xs leading-relaxed text-slate-600">
                  These four tools help you spot possible triggers, build comfort plans, reset your nervous system, and reduce mental overload without duplicating your existing symptom logging.
                </p>
                <p className="mt-2 text-[11px] text-slate-500">Everything stays on your device and builds from your menopause phase data.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Recent calendar signals</p>
                <div className="mt-2 space-y-1.5 text-[11px] text-slate-600">
                  <p>{calendarSummary.hotFlashDays} hot flash day{calendarSummary.hotFlashDays === 1 ? "" : "s"} in the last 14 days</p>
                  <p>{calendarSummary.nightSweatDays} night sweat day{calendarSummary.nightSweatDays === 1 ? "" : "s"} in the last 14 days</p>
                  <p>{calendarSummary.sleepDifficultyDays} low-sleep or sleep difficulty day{calendarSummary.sleepDifficultyDays === 1 ? "" : "s"}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ToolCard
            to="/menopause/tools/cooling-plan"
            icon={<Snowflake className="h-6 w-6" />}
            gradient="bg-gradient-to-br from-sky-50 to-cyan-50/90"
            borderColor="border-sky-200/70"
            iconBg="bg-gradient-to-br from-sky-500 to-cyan-500"
            name="Cooling Plan Builder"
            description="Create a personalized comfort plan for hot flashes and night sweats."
            summaryLabel="Plan status"
            summaryValue={coolingSummary}
            accentClass="border-sky-200 bg-sky-100/80 text-sky-700"
            delay={40}
          />

          <ToolCard
            to="/menopause/tools/calm-routine"
            icon={<Wind className="h-6 w-6" />}
            gradient="bg-gradient-to-br from-emerald-50 to-teal-50/90"
            borderColor="border-emerald-200/70"
            iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
            name="Calm Routine Generator"
            description="Build a short calming routine for stress, irritability, or sleep difficulty."
            summaryLabel="Routine summary"
            summaryValue={calmSummary}
            accentClass="border-emerald-200 bg-emerald-100/80 text-emerald-700"
            delay={80}
          />

          <ToolCard
            to="/menopause/tools/brain-fog-helper"
            icon={<Brain className="h-6 w-6" />}
            gradient="bg-gradient-to-br from-amber-50 to-rose-50/90"
            borderColor="border-amber-200/70"
            iconBg="bg-gradient-to-br from-amber-500 to-rose-500"
            name="Brain Fog Helper"
            description="Use quick notes, reminders, and light focus exercises for memory support."
            summaryLabel="Focus support"
            summaryValue={brainFogSummary}
            accentClass="border-amber-200 bg-amber-100/80 text-amber-700"
            delay={120}
          />
        </div>

        <ScrollReveal delay={200}>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 backdrop-blur-sm">
            <Shield className="h-5 w-5 shrink-0 text-slate-500" />
            <p className="text-[11px] leading-relaxed text-slate-500">
              These tools offer guidance and self-organization support only. They do not diagnose symptoms or replace clinical advice.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
