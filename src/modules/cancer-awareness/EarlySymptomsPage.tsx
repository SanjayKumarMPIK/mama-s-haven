import { AlertTriangle, Info, ArrowRight, Stethoscope, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { cn } from "@/lib/utils";
import CancerAwarenessLayout from "./CancerAwarenessLayout";
import { EARLY_SYMPTOMS_CONTENT } from "./cancerAwarenessContent";
import { AWARENESS_ROUTES } from "./awarenessRoutes";

export default function EarlySymptomsPage() {
  return (
    <CancerAwarenessLayout
      title="Early Symptoms of Cancer"
      subtitle="Early detection is your most powerful tool. Learning to recognise these subtle changes can make a life-saving difference."
    >
      <div className="space-y-12">
        {/* Intro Highlight Section */}
        <ScrollReveal delay={100}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 p-8 text-white shadow-xl shadow-rose-200/40">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-48 h-48 bg-pink-400/20 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                <ShieldAlert className="w-8 h-8 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-xl font-bold mb-2">Listen to Your Body</h2>
                <p className="text-rose-50 text-sm leading-relaxed max-w-2xl">
                  Most changes are not cancer, but your body knows when something is different. 
                  Don't wait for pain to appear—early symptoms are often painless.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Symptoms Grid */}
        <div className="grid gap-6">
          <div className="flex items-center justify-between mb-2 px-2">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-rose-500" />
              Key Signs to Watch
            </h3>
            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              {EARLY_SYMPTOMS_CONTENT.length} Points
            </span>
          </div>

          <div className="space-y-6">
            {EARLY_SYMPTOMS_CONTENT.map((symptom, index) => (
              <ScrollReveal key={index} delay={index * 50}>
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border bg-white p-0 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    "border-slate-200 hover:border-rose-200",
                  )}
                >
                  {/* Subtle accent line on hover */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-6">
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 transition-colors group-hover:bg-rose-50">
                        <AlertTriangle className="w-6 h-6 text-slate-400 transition-colors group-hover:text-rose-500" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-rose-700 transition-colors">
                          {symptom.title}
                        </h4>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                          {symptom.description}
                        </p>
                        
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100/80">
                          <div className="mt-0.5 p-1 rounded-full bg-white shadow-sm shrink-0">
                            <Info className="w-3.5 h-3.5 text-amber-600" />
                          </div>
                          <p className="text-xs text-amber-800 leading-relaxed italic">
                            <span className="font-bold uppercase tracking-wider text-[10px] mr-1">Medical Advice:</span> 
                            {symptom.consultation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Action Section */}
        <ScrollReveal delay={400}>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/50 p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Found something concerning?</h3>
            <p className="text-sm text-slate-600 mb-6 max-w-lg mx-auto">
              Early detection starts with you. If you've noticed any of these changes, the best next step is a professional clinical evaluation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to={AWARENESS_ROUTES.selfExamGuide}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm shadow-sm hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-700 transition-all"
              >
                Learn Self-Exam Steps
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/connect"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 text-white font-semibold text-sm shadow-md shadow-rose-200 hover:bg-rose-700 hover:-translate-y-0.5 transition-all"
              >
                Speak with a Doctor
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </CancerAwarenessLayout>
  );
}
