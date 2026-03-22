import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import ScrollReveal from "@/components/ScrollReveal";
import { Bot, Calendar, Apple, Search, ShieldAlert, BookOpen, Baby, Sparkles, Phone, Eye, Trophy } from "lucide-react";

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
];

export default function Index() {
  const { t, simpleMode, setSimpleMode } = useLanguage();

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
          <a href="tel:102" className="flex items-center gap-2 font-semibold hover:underline">
            <Phone className="w-4 h-4" /> {t("helplineAmbulance")}
          </a>
        </div>
      </div>

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
              <ScrollReveal key={f.titleKey} delay={i * 70}>
                <Link
                  to={f.link}
                  className="group block rounded-xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full"
                >
                  <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                    <f.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-sm">{t(f.titleKey)}</h3>
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
