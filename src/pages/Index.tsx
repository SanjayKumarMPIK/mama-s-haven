import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import ScrollReveal from "@/components/ScrollReveal";
import { Bot, Sparkles, ArrowRight, ShieldCheck, Activity } from "lucide-react";

export default function Index() {
  const { t, simpleMode } = useLanguage();

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 ${simpleMode ? "simple-mode" : ""}`}>
      {/* Subtle top indicator bar */}
      <div className="h-1.5 w-full flex shadow-sm">
        <div className="flex-1 bg-amber-400" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-emerald-500" />
      </div>

      {/* Main minimal Hero */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Soft atmospheric gradient background */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-rose-50" />
        
        {/* Decorative blur shapes */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />
        <div className="absolute top-1/2 -right-32 w-80 h-80 bg-rose-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70" />

        <div className="container relative z-10 max-w-4xl pt-16 pb-20">
          <div className="flex flex-col items-center text-center space-y-8 p-10 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_8px_40px_rgba(0,0,0,0.04)] border border-white/80">
            
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold tracking-wide shadow-sm transition-all hover:bg-indigo-100">
                <Sparkles className="w-4 h-4" />
                {t("poweredBy")}
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">
                  {t("appName")}
                </h1>
                <p className="text-xl md:text-2xl font-medium text-slate-700 max-w-2xl mx-auto leading-relaxed">
                  {t("tagline")}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <p className="hidden md:block text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
                {t("subtitle")}
              </p>
            </ScrollReveal>

            <ScrollReveal>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
                <Link
                  to="/dashboard"
                  className="group flex flex-1 sm:flex-none items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-semibold text-lg shadow-lg hover:shadow-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {t("getStarted")}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/assistant"
                  className="flex flex-1 sm:flex-none items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-slate-700 font-semibold text-lg border-2 border-slate-200 shadow-sm hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <Bot className="w-5 h-5" /> 
                  {t("aiAssistant")}
                </Link>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </main>

      {/* Clean Trust / Features strip */}
      <footer className="w-full bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] relative z-20">
        <div className="container py-5 flex flex-wrap items-center justify-center gap-6 sm:gap-12 md:gap-16 text-sm text-slate-500">
          <div className="flex items-center gap-2.5 font-medium">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-500 shadow-inner">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span>100% Private & Secure</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-50 text-purple-500 shadow-inner">
              <Bot className="w-4 h-4" />
            </span>
            <span>24/7 AI Companion</span>
          </div>
          <div className="flex items-center gap-2.5 font-medium">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-500 shadow-inner">
              <Activity className="w-4 h-4" />
            </span>
            <span>Personal Insights</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
