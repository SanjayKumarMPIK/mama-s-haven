import { useState, useEffect } from "react";
import { Eye, CheckCircle, Circle, Lightbulb, Sparkles, Trophy, ArrowRight, Share2 } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import CancerAwarenessLayout from "./CancerAwarenessLayout";
import { SELF_EXAM_CONTENT } from "./cancerAwarenessContent";

export default function SelfExamGuidePage() {
  const [checkedSteps, setCheckedSteps] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  const toggleStep = (key: string) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const totalSteps = SELF_EXAM_CONTENT.reduce((acc, section) => acc + section.steps.length, 0);
  const completedSteps = checkedSteps.size;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  useEffect(() => {
    if (progressPct === 100 && !showCelebration) {
      setShowCelebration(true);
    } else if (progressPct < 100) {
      setShowCelebration(false);
    }
  }, [progressPct]);

  return (
    <CancerAwarenessLayout
      title="Self-Exam Guide"
      subtitle="Becoming familiar with your body is a vital part of health awareness. This guide helps you perform regular checks with confidence."
    >
      <div className="space-y-10">
        {/* Progress Overview Section */}
        <ScrollReveal delay={50}>
          <div className="relative overflow-hidden rounded-3xl border border-sky-200 bg-white p-8 shadow-xl shadow-sky-100/50">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-sky-50 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-cyan-50 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-sky-100">
                      <Sparkles className="w-5 h-5 text-sky-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Your Progress</h3>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    {progressPct === 100 
                      ? "Excellent work! You've completed all the steps for this month." 
                      : "Complete all sections below to finish your monthly self-examination."}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500 transition-all duration-700 ease-out"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1 shrink-0">
                      <span className="text-2xl font-bold text-sky-600">{progressPct}</span>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 px-6 py-4 rounded-2xl bg-sky-50/50 border border-sky-100 shadow-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sky-700 leading-none mb-1">{completedSteps}</div>
                    <div className="text-[10px] font-bold text-sky-600 uppercase tracking-tighter">Done</div>
                  </div>
                  <div className="w-px h-8 bg-sky-200" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-700 leading-none mb-1">{totalSteps}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Celebration / Completion State */}
        {showCelebration && (
          <ScrollReveal delay={200}>
            <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white text-center shadow-lg shadow-emerald-200/50 relative overflow-hidden animate-in fade-in zoom-in duration-500">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
              <div className="relative z-10">
                <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-4 drop-shadow-md" />
                <h3 className="text-2xl font-bold mb-2">Self-Check Complete!</h3>
                <p className="text-emerald-50 text-sm mb-6 max-w-md mx-auto">
                  By taking this time for yourself, you're being proactive about your long-term health. 
                  Remember to check back same time next month.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button className="px-6 py-2 rounded-xl bg-white text-emerald-700 font-bold text-sm shadow-md hover:bg-emerald-50 transition-colors">
                    Add to Calendar
                  </button>
                  <button className="px-6 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-sm hover:bg-white/30 transition-colors inline-flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Awareness
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Guided Sections */}
        <div className="space-y-12">
          {SELF_EXAM_CONTENT.map((section, sectionIdx) => (
            <ScrollReveal key={sectionIdx} delay={100 + sectionIdx * 50}>
              <div className="relative group">
                {/* Visual Step Indicator */}
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-slate-100 rounded-full hidden lg:block overflow-hidden">
                  <div className="absolute top-0 left-0 w-full bg-sky-400 transition-all duration-500" style={{ height: `${(checkedSteps.size / totalSteps) * 100}%` }} />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:border-sky-200">
                  <div className="bg-gradient-to-r from-sky-50 to-cyan-50 px-8 py-6 border-b border-slate-100">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Part {sectionIdx + 1}</span>
                          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{section.title}</h3>
                        </div>
                        <p className="text-sm text-slate-500 font-medium italic">{section.method}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-white border border-sky-100 flex items-center justify-center shadow-sm">
                        <Eye className="w-6 h-6 text-sky-500" />
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Visual Placeholder (Simulated Illustration) */}
                    <div className="mb-8 rounded-2xl bg-slate-50 border border-slate-100 p-10 flex items-center justify-center relative group-hover:bg-sky-50/30 transition-colors">
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center mx-auto mb-4 shadow-inner">
                          <Eye className="w-10 h-10 text-sky-400" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{section.title} Positioning</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Checklist</h4>
                      <div className="grid gap-3">
                        {section.steps.map((step, stepIdx) => {
                          const key = `${sectionIdx}-${stepIdx}`;
                          const isChecked = checkedSteps.has(key);
                          return (
                            <button
                              key={stepIdx}
                              onClick={() => toggleStep(key)}
                              className={cn(
                                "w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden group/btn",
                                isChecked
                                  ? "bg-sky-50/50 border border-sky-100/50"
                                  : "bg-white border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30",
                              )}
                            >
                              <div className={cn(
                                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300",
                                isChecked ? "bg-sky-500 shadow-sm" : "bg-slate-50 border border-slate-200 group-hover/btn:border-sky-300"
                              )}>
                                {isChecked && <CheckCircle className="w-4 h-4 text-white" />}
                                {!isChecked && <Circle className="w-3 h-3 text-slate-300 group-hover/btn:text-sky-300" />}
                              </div>
                              <span className={cn(
                                "text-sm leading-relaxed transition-colors duration-300",
                                isChecked ? "text-slate-400 line-through italic" : "text-slate-700 font-medium"
                              )}>
                                {step}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8 flex items-start gap-4 p-5 rounded-2xl bg-amber-50/50 border border-amber-100/80">
                      <div className="p-2 rounded-xl bg-white shadow-sm shrink-0">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1 leading-none">Expert Tip</p>
                        <p className="text-xs text-amber-800 leading-relaxed italic">
                          {section.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Footer CTA */}
        <ScrollReveal delay={400}>
          <div className="text-center p-8 bg-slate-50 rounded-3xl border border-slate-200">
            <h4 className="font-bold text-slate-800 mb-2">Want to learn more?</h4>
            <p className="text-sm text-slate-500 mb-6">Explore myths vs facts about breast cancer awareness.</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm shadow-sm hover:border-sky-200 hover:text-sky-700 transition-all group">
              View Myths vs Facts
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </CancerAwarenessLayout>
  );
}
