import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import ScrollReveal from "@/components/ScrollReveal";
import { Bot, Sparkles, Phone, Calendar } from "lucide-react";

export default function Index() {
  const { t, simpleMode } = useLanguage();

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

      {/* Placeholder Section */}
      <section className="py-20 bg-muted/20 border-b border-border/60">
        <div className="container max-w-2xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Welcome to SwasthyaSakhi</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Start by logging your symptoms or exploring tools.
            </p>
            <div className="flex justify-center flex-wrap gap-4">
              <Link
                to="/calendar"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
              >
                <Calendar className="w-5 h-5" /> Log Symptoms
              </Link>
              <Link
                to="/tools"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-border bg-card font-semibold hover:bg-muted transition-colors"
              >
                Explore Tools →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
