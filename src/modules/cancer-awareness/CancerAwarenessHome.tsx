import { Activity } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import CancerAwarenessLayout from "./CancerAwarenessLayout";
import AwarenessFeatureHubCard from "./AwarenessFeatureHubCard";
import { AWARENESS_CARDS } from "./cancerAwarenessContent";

export default function CancerAwarenessHome() {
  return (
    <CancerAwarenessLayout
      title="Cancer Awareness"
      subtitle="Your central hub for cancer education, early detection, and prevention awareness."
      showBack={false}
    >
      {/* Premium Awareness Hero Banner */}
      <ScrollReveal delay={80}>
        <div className="relative overflow-hidden rounded-2xl bg-white border border-rose-100 shadow-sm mb-8">
          {/* Decorative ribbon watermark */}
          <div className="absolute top-4 right-4 w-32 h-32 opacity-[0.04]">
            <svg viewBox="0 0 100 100" className="w-full h-full text-rose-500">
              <path d="M50 15 C30 15 15 30 15 50 C15 65 25 75 50 90 C75 75 85 65 85 50 C85 30 70 15 50 15Z" fill="currentColor" />
              <path d="M35 45 C35 35 42 28 50 28 C58 28 65 35 65 45 L65 65 C65 70 60 75 50 80 C40 75 35 70 35 65Z" fill="white" />
            </svg>
          </div>

          <div className="relative z-10 p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8 2 5 5 5 9C5 12 7 14 12 18C17 14 19 12 19 9C19 5 16 2 12 2Z" />
                  <path d="M9 10C9 8 10.5 7 12 7C13.5 7 15 8 15 10" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide">Knowledge Hub</p>
                <p className="text-sm text-slate-500">Breast Health Awareness</p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              Breast <span className="text-rose-500">Cancer</span> Awareness
            </h2>

            {/* Tagline */}
            <p className="text-sm font-medium text-rose-500 italic mb-3">
              Early awareness saves lives
            </p>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mb-5">
              Breast cancer is the most common cancer among women worldwide. Understanding your body, recognizing changes early, and maintaining regular self-awareness can make a significant difference. This educational module is designed to empower you with knowledge — not to cause fear.
            </p>

            {/* Ribbon Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-100">
              <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 5 5 5 9C5 12 7 14 12 18C17 14 19 12 19 9C19 5 16 2 12 2Z" />
                <path d="M9 10C9 8 10.5 7 12 7C13.5 7 15 8 15 10" />
              </svg>
              <span className="text-sm font-medium text-rose-600">Wear the ribbon. Spread awareness. Save lives.</span>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-purple-100 border-t border-rose-100 px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-slate-900">1 in 28</p>
                <p className="text-xs text-rose-600 mt-1 leading-snug">Indian women may develop breast cancer in their lifetime</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-slate-900">~50%</p>
                <p className="text-xs text-rose-600 mt-1 leading-snug">Of cases are detected at stage III or IV in India</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-slate-900">99%</p>
                <p className="text-xs text-rose-600 mt-1 leading-snug">5-year survival rate when detected early</p>
              </div>
              <div className="text-center">
                <p className="text-xl md:text-2xl font-bold text-slate-900">30 min/day</p>
                <p className="text-xs text-rose-600 mt-1 leading-snug">Of exercise can significantly reduce risk</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Intro Text */}
      <ScrollReveal delay={120}>
        <div className="mb-8">
          <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
            Cancer awareness is about understanding the risk factors, recognising early warning signs, and taking proactive steps for your health. Explore each section below to build your knowledge and stay informed.
          </p>
        </div>
      </ScrollReveal>

      {/* Feature Hub Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {AWARENESS_CARDS.map((card, index) => (
          <ScrollReveal key={card.id} delay={100 + index * 60}>
            <AwarenessFeatureHubCard card={card} delay={100 + index * 60} />
          </ScrollReveal>
        ))}
      </div>
    </CancerAwarenessLayout>
  );
}
