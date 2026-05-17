import { useState } from "react";
import { Activity, Apple, Moon, Ban, Scale, Baby, Check, Sparkles, Trophy } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import CancerAwarenessLayout from "./CancerAwarenessLayout";
import { PREVENTION_CONTENT } from "./cancerAwarenessContent";

const iconMap: Record<string, typeof Activity> = {
  Activity,
  Apple,
  Moon,
  Ban,
  Scale,
  Baby,
};

const colorMap: Record<string, {
  gradient: string;
  border: string;
  bg: string;
  iconBg: string;
  accent: string;
  glow: string;
  cardBg: string;
}> = {
  "Regular Exercise": {
    gradient: "from-emerald-400 to-teal-500",
    border: "border-emerald-100 hover:border-emerald-300",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-100/50",
    accent: "text-emerald-600",
    glow: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    cardBg: "from-white to-emerald-50/10",
  },
  "Healthy Diet": {
    gradient: "from-green-400 to-emerald-500",
    border: "border-green-100 hover:border-green-300",
    bg: "bg-green-50",
    iconBg: "bg-green-100/50",
    accent: "text-green-600",
    glow: "shadow-green-500/10 hover:shadow-green-500/20",
    cardBg: "from-white to-green-50/10",
  },
  "Quality Sleep": {
    gradient: "from-indigo-400 to-purple-500",
    border: "border-indigo-100 hover:border-indigo-300",
    bg: "bg-indigo-50",
    iconBg: "bg-indigo-100/50",
    accent: "text-indigo-600",
    glow: "shadow-indigo-500/10 hover:shadow-indigo-500/20",
    cardBg: "from-white to-indigo-50/10",
  },
  "Avoid Smoking & Limit Alcohol": {
    gradient: "from-red-400 to-rose-500",
    border: "border-red-100 hover:border-red-300",
    bg: "bg-red-50",
    iconBg: "bg-red-100/50",
    accent: "text-red-600",
    glow: "shadow-red-500/10 hover:shadow-red-500/20",
    cardBg: "from-white to-red-50/10",
  },
  "Maintain Healthy Weight": {
    gradient: "from-blue-400 to-sky-500",
    border: "border-blue-100 hover:border-blue-300",
    bg: "bg-blue-50",
    iconBg: "bg-blue-100/50",
    accent: "text-blue-600",
    glow: "shadow-blue-500/10 hover:shadow-blue-500/20",
    cardBg: "from-white to-blue-50/10",
  },
  "Breastfeeding Benefits": {
    gradient: "from-pink-400 to-rose-500",
    border: "border-pink-100 hover:border-pink-300",
    bg: "bg-pink-50",
    iconBg: "bg-pink-100/50",
    accent: "text-pink-600",
    glow: "shadow-pink-500/10 hover:shadow-pink-500/20",
    cardBg: "from-white to-pink-50/10",
  },
};

export default function PreventionPage() {
  const [completedHabits, setCompletedHabits] = useState<Record<string, boolean>>({});

  const toggleHabit = (title: string) => {
    setCompletedHabits(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const completedCount = Object.values(completedHabits).filter(Boolean).length;
  const progressPercentage = Math.round((completedCount / PREVENTION_CONTENT.length) * 100);

  return (
    <CancerAwarenessLayout
      title="Lifestyle Prevention"
      subtitle="Empower yourself with lifestyle choices that can reduce your cancer risk. Small daily habits make a lasting difference."
    >
      <div className="space-y-8">
        {/* Dynamic Habit Tracker Banner */}
        <ScrollReveal>
          <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50/50 via-pink-50/30 to-white p-6 shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Sparkles className="w-24 h-24 text-rose-500" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                    <Trophy className="w-5 h-5" />
                  </span>
                  <h2 className="text-lg font-bold text-gray-900">Your Daily Prevention Habits Tracker</h2>
                </div>
                <p className="text-sm text-slate-600 max-w-md">
                  Commit to these protective habits. Check off what you practiced today to see your risk reduction score!
                </p>
              </div>

              {/* Progress Ring / Counter */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-inner border border-rose-100/50">
                  <div className="text-center">
                    <span className="text-2xl font-black text-rose-600">{completedCount}</span>
                    <span className="text-[10px] text-slate-400 block border-t border-slate-100 mt-0.5 pt-0.5">/ {PREVENTION_CONTENT.length}</span>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block mb-1">Completion Score</span>
                  <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                      className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">{progressPercentage}% habit adherence today</span>
                </div>
              </div>
            </div>

            {/* Quick Toggle Checklist buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              {PREVENTION_CONTENT.map((item) => {
                const colors = colorMap[item.title] || {
                  gradient: "from-emerald-400 to-teal-500",
                  border: "border-emerald-100",
                  bg: "bg-emerald-50",
                  iconBg: "bg-emerald-100/50",
                  accent: "text-emerald-600",
                  glow: "shadow-emerald-500/10",
                  cardBg: "from-white to-emerald-50/10",
                };
                const isCompleted = !!completedHabits[item.title];

                return (
                  <button
                    key={item.title}
                    onClick={() => toggleHabit(item.title)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-semibold transition-all duration-200",
                      isCompleted 
                        ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm" 
                        : "bg-white border-slate-200/60 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all",
                      isCompleted 
                        ? "bg-rose-500 border-rose-500 text-white" 
                        : "border-slate-300 bg-white"
                    )}>
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{item.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Informative Prevention Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PREVENTION_CONTENT.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Activity;
            const colors = colorMap[item.title] || {
              gradient: "from-emerald-400 to-teal-500",
              border: "border-emerald-100 hover:border-emerald-300",
              bg: "bg-emerald-50",
              iconBg: "bg-emerald-100/50",
              accent: "text-emerald-600",
              glow: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
              cardBg: "from-white to-emerald-50/10",
            };
            const isCompleted = !!completedHabits[item.title];

            return (
              <ScrollReveal key={index} delay={index * 50}>
                <div
                  className={cn(
                    "group relative rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-md",
                    colors.cardBg,
                    colors.border,
                    colors.glow,
                    isCompleted && "ring-2 ring-rose-200/80 border-rose-200/80"
                  )}
                >
                  {/* Subtle completed badge indicator */}
                  {isCompleted && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-fade-in">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>PRACTICED TODAY</span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 shrink-0",
                        `bg-gradient-to-br ${colors.gradient}`,
                      )}
                    >
                      {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-800 transition-colors group-hover:text-black">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1.5 mb-4">
                        {item.description}
                      </p>
                      
                      <div className="border-t border-slate-100/80 pt-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Practical Tips
                        </span>
                        <ul className="space-y-2">
                          {item.tips.map((tip, tipIdx) => (
                            <li key={tipIdx} className="flex items-start gap-2 text-xs text-slate-700">
                              <Check className={cn("w-4 h-4 mt-0.5 shrink-0 stroke-[2.5]", colors.accent)} />
                              <span className="leading-relaxed">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </CancerAwarenessLayout>
  );
}
