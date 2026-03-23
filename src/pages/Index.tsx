import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { usePhase, type Phase } from "@/hooks/usePhase";
import ScrollReveal from "@/components/ScrollReveal";
import { Bot, Calendar, Apple, Search, ShieldAlert, BookOpen, Baby, Sparkles, Phone, Eye, Trophy, Flower2, HeartPulse, Users } from "lucide-react";

const features = [
  { icon: Bot, titleKey: "aiAssistant" as const, desc: "AI-powered pregnancy guidance in your language with voice support", color: "bg-primary/10 text-primary", link: "/assistant" },
  { icon: Calendar, titleKey: "weeklyGuide" as const, desc: "Personalized week-by-week pregnancy tracking and guidance", color: "bg-lavender text-lavender-foreground", link: "/weekly-guide" },
  { icon: Apple, titleKey: "nutritionGuide" as const, desc: "Region-specific diet plans for every trimester", color: "bg-mint text-mint-foreground", link: "/nutrition" },
  { icon: Search, titleKey: "symptomChecker" as const, desc: "Safe symptom awareness with escalation guidance", color: "bg-amber-100 text-amber-700", link: "/symptom-checker" },
  { icon: ShieldAlert, titleKey: "emergency" as const, desc: "Emergency helplines and high-risk warning signs", color: "bg-red-100 text-red-600", link: "/emergency" },
  { icon: Trophy, titleKey: "wellness" as const, desc: "Daily habit tracking, rewards, badges, and streaks", color: "bg-amber-100 text-amber-700", link: "/wellness" },
  { icon: Baby, titleKey: "postpartum" as const, desc: "Recovery tips and newborn care milestones", color: "bg-peach text-peach-foreground", link: "/postpartum" },
  { icon: BookOpen, titleKey: "articles" as const, desc: "Expert articles on maternal and child health", color: "bg-baby-blue text-baby-blue-foreground", link: "/articles" },
  { icon: Eye, titleKey: "stressRelief" as const, desc: "Breathing exercises, meditations, and relaxation", color: "bg-lavender text-lavender-foreground", link: "/stress-relief" },
  { icon: Flower2, titleKey: "aiAssistant" as const, desc: "Cycle tracker, hemoglobin guidance & personalized puberty health tips", color: "bg-pink-100 text-pink-600", link: "/puberty", customTitle: "Puberty Module" },
  { icon: HeartPulse, titleKey: "aiAssistant" as const, desc: "Trimester guidance, warning signs & daily care for pregnant mothers", color: "bg-purple-100 text-purple-600", link: "/maternity", customTitle: "Maternity Module" },
  { icon: Users, titleKey: "aiAssistant" as const, desc: "Fertility awareness, readiness check & lifestyle support for family planning", color: "bg-teal-100 text-teal-600", link: "/family-planning", customTitle: "Family Planning" },
];

const majorPhases: { phase: Phase; title: string; desc: string; to: string; color: string }[] = [
  { phase: "puberty", title: "Puberty Phase", desc: "Cycle tracking, iron awareness, mood support", to: "/puberty", color: "border-pink-200 bg-pink-50/80" },
  { phase: "maternity", title: "Maternity Phase", desc: "Trimester care, symptoms, daily guidance", to: "/maternity", color: "border-purple-200 bg-purple-50/80" },
  { phase: "family-planning", title: "Family Planning", desc: "Fertile window, readiness, lifestyle", to: "/family-planning", color: "border-teal-200 bg-teal-50/80" },
];

const supportModules: { emoji: string; title: string; desc: string; to: string }[] = [
  { emoji: "🧰", title: "Tools", desc: "Cycle, fertility, or pregnancy tools by phase", to: "/tools" },
  { emoji: "🌿", title: "Wellness", desc: "Habits, mood, and stress care", to: "/wellness" },
  { emoji: "🍎", title: "Nutrition Guide", desc: "Phase-aware food guidance", to: "/nutrition" },
  { emoji: "🏥", title: "PHC Nearby", desc: "Prototype facility list & map links", to: "/phc-nearby" },
  { emoji: "🛍️", title: "Care Essentials", desc: "₹ planning lists by life stage", to: "/shopping" },
  { emoji: "📚", title: "Articles", desc: "Short reads matched to your phase", to: "/articles" },
  { emoji: "🤖", title: "AI Guide", desc: "Ask questions with phase-aware context", to: "/assistant" },
  { emoji: "💉", title: "Vaccine Tracker", desc: "Simple schedule checklist", to: "/vaccine-tracker" },
];

export default function Index() {
  const { t, simpleMode, setSimpleMode } = useLanguage();
  const { phase, setPhase, phaseName, phaseEmoji } = usePhase();

  return (
    <div className={`min-h-screen ${simpleMode ? "simple-mode" : ""}`}>
      {/* Government tricolor top bar */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[hsl(22,90%,52%)]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[hsl(140,60%,35%)]" />
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-tricolor-gradient">
        <div className="container pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-2xl mx-auto text-center">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                {t("poweredBy")}
              </div>
            </ScrollReveal>
            <ScrollReveal>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] animate-fade-up">
                {t("appName")}
              </h1>
              <p className="mt-2 text-lg md:text-xl font-medium text-gradient-bloom animate-fade-up" style={{ animationDelay: "60ms" }}>
                {t("tagline")}
              </p>
            </ScrollReveal>
            <ScrollReveal>
              <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-lg mx-auto animate-fade-up" style={{ animationDelay: "120ms" }}>
                {t("subtitle")}
              </p>
            </ScrollReveal>
            <ScrollReveal>
              <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: "200ms" }}>
                <Link
                  to="/weekly-guide"
                  className="px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 active:scale-[0.97]"
                >
                  {t("getStarted")} →
                </Link>
                <Link
                  to="/assistant"
                  className="px-7 py-3.5 rounded-xl border-2 border-primary/20 text-foreground font-semibold hover:bg-primary/5 transition-all duration-300 active:scale-[0.97] flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" /> {t("aiAssistant")}
                </Link>
              </div>
            </ScrollReveal>
            {/* Simple mode toggle */}
            <ScrollReveal>
              <button
                onClick={() => setSimpleMode(!simpleMode)}
                className={`mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
                  simpleMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {t("simpleMode")} {simpleMode ? "ON" : "OFF"}
              </button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Helpline strip */}
      <div className="bg-red-600 text-white">
        <div className="container py-3 flex flex-wrap items-center justify-center gap-6 text-sm">
          <a href="tel:104" className="flex items-center gap-2 font-semibold hover:underline">
            <Phone className="w-4 h-4" /> {t("helplineMaternal")}
          </a>
          <a href="tel:108" className="flex items-center gap-2 font-semibold hover:underline">
            <Phone className="w-4 h-4" /> {t("helplineAmbulance")}
          </a>
        </div>
      </div>

      {/* Life stages + support modules (context layer) */}
      <section id="support-modules" className="py-14 bg-muted/20 border-b border-border/60">
        <div className="container max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Personalised journey</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-center">
              Current phase:{" "}
              <span className="text-gradient-bloom">
                {phaseEmoji} {phaseName}
              </span>
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-xl mx-auto">
              Pick one life stage — the rest of the app uses it for tools, nutrition, articles, and AI guidance.
            </p>
          </ScrollReveal>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {majorPhases.map((m, i) => (
              <ScrollReveal key={m.phase} delay={i * 70}>
                <Link
                  to={m.to}
                  onClick={() => setPhase(m.phase)}
                  className={`block rounded-2xl border-2 p-5 h-full transition-all hover:shadow-md hover:border-primary/30 ${m.color}`}
                >
                  <p className="text-xs font-semibold text-muted-foreground">Major module {i + 1}</p>
                  <h3 className="mt-1 text-lg font-bold">{m.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                  <span className="mt-4 inline-block text-xs font-semibold text-primary">Open module →</span>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={120}>
            <h3 className="mt-12 text-lg font-bold text-center">Support modules</h3>
            <p className="text-center text-xs text-muted-foreground">Fixed order — each adapts to your selected phase</p>
          </ScrollReveal>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {supportModules.map((mod, i) => (
              <ScrollReveal key={mod.to} delay={i * 40}>
                <Link
                  to={mod.to}
                  className="flex gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-md hover:border-primary/20 transition-all h-full"
                >
                  <span className="text-2xl shrink-0">{mod.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">
                      {i + 1}. {mod.title}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{mod.desc}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              Everything You Need, <span className="text-gradient-saffron">One Platform</span>
            </h2>
            <p className="mt-2 text-center text-muted-foreground text-sm max-w-md mx-auto">
              Safe, accessible tools and guidance for every stage of your pregnancy journey
            </p>
          </ScrollReveal>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.link} delay={i * 70}>
                <Link
                  to={f.link}
                  className="group block rounded-xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full"
                >
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{"customTitle" in f ? f.customTitle : t(f.titleKey)}</h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Trimester overview */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold text-center">
              Your Pregnancy, <span className="text-gradient-bloom">Week by Week</span>
            </h2>
          </ScrollReveal>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              { label: t("firstTrimester"), weeks: "1–12", tip: "Focus on folic acid, manage morning sickness. Baby's vital organs are forming.", color: "bg-orange-50 border-orange-100", icon: "🌱" },
              { label: t("secondTrimester"), weeks: "13–26", tip: "Energy returns! First kicks felt. Important anatomy scan. Eat well and stay active.", color: "bg-green-50 border-green-100", icon: "🌿" },
              { label: t("thirdTrimester"), weeks: "27–40", tip: "Prepare your hospital bag. Practice breathing. Monitor baby movements daily.", color: "bg-purple-50 border-purple-100", icon: "🌸" },
            ].map((tri, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className={`rounded-xl border ${tri.color} p-6`}>
                  <span className="text-3xl">{tri.icon}</span>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Weeks {tri.weeks}</p>
                  <h3 className="mt-1 text-lg font-bold">{tri.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{tri.tip}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <ScrollReveal>
            <div className="rounded-2xl bg-gov-gradient p-10 md:p-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold">{t("tagline")}</h2>
              <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">{t("govDisclaimer")}</p>
              <Link
                to="/weekly-guide"
                className="mt-8 inline-block px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-[0.97]"
              >
                {t("getStarted")} →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
