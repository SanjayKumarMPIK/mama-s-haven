import { useLanguage } from "@/hooks/useLanguage";
import { usePhase } from "@/hooks/usePhase";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import AffirmationBanner from "@/components/nutrition/AffirmationBanner";
import { Link } from "react-router-dom";
import { Apple, ArrowRight, ClipboardList, Scale, Salad, ShieldCheck } from "lucide-react";

const phaseAccent: Record<string, {
  gradient: string; bg: string; text: string; border: string;
  cardBg: string; badge: string;
}> = {
  puberty: {
    gradient: "from-pink-500 to-rose-400", bg: "bg-pink-50", text: "text-pink-700",
    border: "border-pink-200/60", cardBg: "bg-gradient-to-br from-pink-50 to-rose-50",
    badge: "bg-pink-100 text-pink-700",
  }
};

export default function PubertyNutritionGuide() {
  const { simpleMode } = useLanguage();
  const { phase } = usePhase();
  const accent = phaseAccent.puberty; // Force puberty styling

  return (
    <main className={`min-h-screen bg-background ${simpleMode ? "simple-mode" : ""}`}>
      <div className="border-b border-border bg-card/60 backdrop-blur-sm">
        <div className="container py-6">
          <ScrollReveal>
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center shadow-lg shadow-primary/10`}>
                <Apple className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Nutrition Guide</h1>
                <p className="text-sm text-muted-foreground">
                  Personalized nutrition guidance for a healthy puberty journey
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-6 space-y-8">
        <ScrollReveal>
          <AffirmationBanner />
        </ScrollReveal>

        <ScrollReveal delay={50}>
          <div>
            <h2 className="text-xl font-bold tracking-tight mb-1">Explore Nutrition Tools</h2>
            <p className="text-sm text-muted-foreground mb-6">Use these tools to track, analyze and improve your nutrition and overall well-being.</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard 
                to="/puberty/nutrition-guide/activities"
                icon={<div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center shrink-0"><ClipboardList className="w-8 h-8 text-purple-600" /></div>}
                title="Activities"
                titleColor="text-purple-700"
                desc="Explore your daily wellness plan, set health goals, and enjoy fun activities."
              />
              <FeatureCard 
                to="/puberty/nutrition-guide/fitness-health-calculator"
                icon={<div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Scale className="w-8 h-8 text-blue-600" /></div>}
                title="Fitness Calculator"
                titleColor="text-blue-700"
                desc="Calculate your daily calorie needs, protein, water intake and track your fitness goals."
              />
              <FeatureCard 
                to="/puberty/nutrition-guide/personalized-diet"
                icon={<div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center shrink-0"><Salad className="w-8 h-8 text-emerald-600" /></div>}
                title="Personalized Diet"
                titleColor="text-emerald-700"
                desc="Get a customized diet plan tailored to your needs and preferences."
              />
              <FeatureCard 
                to="/puberty/nutrition-guide/intelligence"
                icon={<div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center shrink-0"><Apple className="w-8 h-8 text-rose-600" /></div>}
                title="Nutrition Intelligence"
                titleColor="text-rose-600"
                desc="Advanced analysis of symptoms, nutrient risks and personalized food recommendations for smarter nutrition."
              />
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Footer awareness disclaimer */}
      <div className="container pb-6">
        <ScrollReveal delay={100}>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 mt-8 flex justify-center items-center">
            <p className="text-[11px] text-amber-800 flex items-center gap-1.5 text-center">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-blue-500 font-serif italic text-[12px] -mt-0.5">§</span>
              </span>
              <strong>This information is for awareness only — not a medical diagnosis. Always consult a certified healthcare worker.</strong>
            </p>
          </div>
        </ScrollReveal>
      </div>

      <SafetyDisclaimer />
    </main>
  );
}

function FeatureCard({ to, icon, title, titleColor, desc }: any) {
  return (
    <Link to={to} className="group relative rounded-[24px] border border-border/50 bg-card p-6 flex items-start gap-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {icon}
      <div className="flex-1 min-w-0 pr-10">
        <h3 className={`text-lg font-bold mb-2 ${titleColor}`}>{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        <ArrowRight className="w-5 h-5" />
      </div>
    </Link>
  );
}
