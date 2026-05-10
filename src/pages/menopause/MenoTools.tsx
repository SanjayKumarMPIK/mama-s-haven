import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, Moon, Bone, Scale, ChevronRight, Wrench, Shield, Sparkles, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMenopause } from "@/hooks/useMenopause";
import { getSleepMoodSummary, getBoneHealthStatus, getWeightStatus } from "@/lib/menopauseDashboardEngine";
import ScrollReveal from "@/components/ScrollReveal";

// ─── Tool Card ───────────────────────────────────────────────────────────────

interface ToolCardProps {
  to: string;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  iconBg: string;
  name: string;
  description: string;
  miniStat?: string;
  miniStatLabel?: string;
  accentClass: string;
  tag: string;
  delay?: number;
}

function ToolCard({ to, icon, gradient, borderColor, iconBg, name, description, miniStat, miniStatLabel, accentClass, tag, delay = 0 }: ToolCardProps) {
  return (
    <ScrollReveal delay={delay}>
      <Link
        to={to}
        className={cn(
          "group relative flex flex-col h-full rounded-3xl border p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden isolate",
          gradient, borderColor
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(255,255,255,.5),transparent_45%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex items-start gap-3.5 relative z-10">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all duration-300", iconBg)}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em]", accentClass)}>{tag}</span>
            <h3 className="mt-1 text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">{name}</h3>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">{description}</p>
          </div>
        </div>

        {miniStat && (
          <div className="mt-3 flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white/70 border border-white/80 relative z-10 backdrop-blur-sm">
            <span className="text-[10px] font-medium text-slate-500">{miniStatLabel}</span>
            <span className="text-base font-bold text-slate-800">{miniStat}</span>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-end relative z-10">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 group-hover:text-slate-800 transition-colors">
            Open <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </ScrollReveal>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MenoTools() {
  const { logs, profile, hotFlashEvents, getHotFlashEventsForDays } = useMenopause();

  // Mini summaries for cards
  const weekHotFlashes = useMemo(() => getHotFlashEventsForDays(7).length, [getHotFlashEventsForDays]);
  const sleepMood = useMemo(() => getSleepMoodSummary(logs), [logs]);
  const boneHealth = useMemo(() => getBoneHealthStatus(logs, profile), [logs, profile]);
  const weightStatus = useMemo(() => getWeightStatus(logs, null), [logs]);
  const completion = useMemo(() => {
    let done = 0;
    if (weekHotFlashes > 0) done++;
    if (sleepMood.avgSleep) done++;
    if (boneHealth.calciumAdequacy > 0) done++;
    if (weightStatus.bmi) done++;
    return Math.round((done / 4) * 100);
  }, [boneHealth.calciumAdequacy, sleepMood.avgSleep, weekHotFlashes, weightStatus.bmi]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffaf5] via-[#f8fbff] to-[#f3fffb] font-[Poppins,sans-serif]">
      <div className="border-b border-slate-200/70 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="container py-5">
          <ScrollReveal>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 tracking-tight">Menopause Tools</h1>
                  <p className="text-xs text-slate-500">Interactive wellness toolkit for daily clarity</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-medium text-slate-600">Simple, private, personalized</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container max-w-5xl py-6 space-y-5">
        <ScrollReveal>
          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm relative overflow-hidden">
            <div className="absolute -top-12 -right-10 h-36 w-36 rounded-full bg-gradient-to-br from-amber-200/60 to-emerald-200/60 blur-2xl" />
            <div className="relative z-[1] grid gap-4 sm:grid-cols-[1.4fr_1fr] sm:items-center">
              <div>
                <p className="text-xs text-slate-600 leading-relaxed">Track symptoms, monitor health indicators, and build better routines with quick actionable tools.</p>
                <p className="mt-2 text-[11px] text-slate-500">Everything remains on your device.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Toolkit activity</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-500" style={{ width: `${completion}%` }} />
                </div>
                <p className="mt-1 text-[11px] font-medium text-slate-600">{completion}% tools active this week</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ToolCard
            to="/menopause/hot-flash-tracker"
            icon={<Flame className="w-6 h-6 text-white" />}
            gradient="bg-gradient-to-br from-rose-50 to-orange-50/90"
            borderColor="border-rose-200/70"
            iconBg="bg-gradient-to-br from-rose-500 to-orange-500"
            name="Hot Flash Tracker"
            description="Track hot flashes and night sweats, identify triggers, and understand patterns."
            miniStat={weekHotFlashes > 0 ? String(weekHotFlashes) : undefined}
            miniStatLabel={weekHotFlashes > 0 ? "this week" : undefined}
            accentClass="text-rose-600 border-rose-200 bg-rose-100/80"
            tag="Comfort"
            delay={40}
          />

          <ToolCard
            to="/menopause/sleep-mood"
            icon={<Moon className="w-6 h-6 text-white" />}
            gradient="bg-gradient-to-br from-indigo-50 to-purple-50/80"
            borderColor="border-indigo-200/80"
            iconBg="bg-gradient-to-br from-indigo-500 to-purple-500"
            name="Sleep & Mood Tracker"
            description="Track sleep quality and emotional wellbeing. Guided breathing included."
            miniStat={sleepMood.avgSleep ? `${sleepMood.avgSleep}h` : undefined}
            miniStatLabel={sleepMood.avgSleep ? "avg sleep" : undefined}
            accentClass="text-indigo-600 border-indigo-200 bg-indigo-100/80"
            tag="Restore"
            delay={80}
          />

          <ToolCard
            to="/menopause/bone-health"
            icon={<Bone className="w-6 h-6 text-white" />}
            gradient="bg-gradient-to-br from-teal-50 to-emerald-50/80"
            borderColor="border-teal-200/80"
            iconBg="bg-gradient-to-br from-teal-500 to-emerald-500"
            name="Bone Health Calculator"
            description="Track calcium, vitamin D, and activities that support bone strength."
            miniStat={boneHealth.calciumAdequacy > 0 ? `${boneHealth.calciumAdequacy}%` : undefined}
            miniStatLabel={boneHealth.calciumAdequacy > 0 ? "calcium today" : undefined}
            accentClass="text-teal-700 border-teal-200 bg-teal-100/80"
            tag="Strength"
            delay={120}
          />

          <ToolCard
            to="/menopause/weight-metabolism"
            icon={<Scale className="w-6 h-6 text-white" />}
            gradient="bg-gradient-to-br from-blue-50 to-cyan-50/80"
            borderColor="border-blue-200/80"
            iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
            name="Weight & Metabolism"
            description="Monitor BMI, weight trends, and get metabolism support insights."
            miniStat={weightStatus.bmi ? String(weightStatus.bmi) : undefined}
            miniStatLabel={weightStatus.bmi ? "BMI" : undefined}
            accentClass="text-blue-700 border-blue-200 bg-blue-100/80"
            tag="Balance"
            delay={160}
          />
        </div>

        <ScrollReveal delay={200}>
          <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 flex items-center gap-3 backdrop-blur-sm">
            <Shield className="w-5 h-5 text-slate-500 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              All health data stays on your device. These tools are for awareness only — always consult a certified healthcare worker.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
