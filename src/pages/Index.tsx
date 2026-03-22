import { Link } from "react-router-dom";
import { Baby, Calculator, Heart, ShoppingBag, BookOpen, Sparkles, Timer, Activity } from "lucide-react";
import heroImage from "@/assets/hero-bloom.jpg";
import ScrollReveal from "@/components/ScrollReveal";

const features = [
  { icon: Calculator, title: "Due Date Calculator", desc: "Find your estimated due date instantly.", color: "bg-peach", link: "/tools" },
  { icon: Activity, title: "Kick Counter", desc: "Track baby movements with easy taps.", color: "bg-mint", link: "/tools" },
  { icon: Timer, title: "Contraction Timer", desc: "Time and log contractions accurately.", color: "bg-baby-blue", link: "/tools" },
  { icon: Heart, title: "Mood & Symptom Log", desc: "Daily check-ins for your wellbeing.", color: "bg-lavender", link: "/tools" },
  { icon: ShoppingBag, title: "Smart Shopping", desc: "Curated essentials by trimester.", color: "bg-peach", link: "/shopping" },
  { icon: Sparkles, title: "Stress Relief", desc: "Breathing exercises & meditations.", color: "bg-mint", link: "/stress-relief" },
  { icon: Baby, title: "Postpartum Guide", desc: "Recovery tips & milestone tracking.", color: "bg-lavender", link: "/postpartum" },
  { icon: BookOpen, title: "Expert Articles", desc: "Trusted advice from professionals.", color: "bg-baby-blue", link: "/articles" },
];

const weeklyTips = [
  { week: "Weeks 1–12", title: "First Trimester", tip: "Focus on prenatal vitamins and managing morning sickness. Your baby's vital organs are forming.", color: "bg-peach/60" },
  { week: "Weeks 13–26", title: "Second Trimester", tip: "Energy returns! Start feeling those first flutters. Time for the anatomy scan.", color: "bg-mint/60" },
  { week: "Weeks 27–40", title: "Third Trimester", tip: "Pack your hospital bag. Practice breathing exercises and enjoy the final stretch.", color: "bg-lavender/60" },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img src={heroImage} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="max-w-2xl">
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] animate-fade-up"
            >
              Your journey to motherhood,{" "}
              <span className="text-gradient-bloom">beautifully supported</span>
            </h1>
            <p
              className="mt-6 text-lg text-muted-foreground max-w-lg animate-fade-up"
              style={{ animationDelay: "100ms" }}
            >
              Track your pregnancy, find expert guidance, and connect with a caring community — all in one calming space.
            </p>
            <div
              className="mt-8 flex flex-wrap gap-3 animate-fade-up"
              style={{ animationDelay: "200ms" }}
            >
              <Link
                to="/tools"
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 active:scale-[0.97]"
              >
                Explore Tools
              </Link>
              <Link
                to="/articles"
                className="px-6 py-3 rounded-lg border-2 border-primary/20 text-foreground font-medium hover:bg-primary/5 transition-all duration-300 active:scale-[0.97]"
              >
                Read Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              Everything you need, <span className="text-gradient-bloom">one place</span>
            </h2>
            <p className="mt-3 text-center text-muted-foreground max-w-md mx-auto">
              Tools, guidance, and community crafted for every stage of your motherhood journey.
            </p>
          </ScrollReveal>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <Link
                  to={f.link}
                  className="group block rounded-xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <div className={`w-11 h-11 rounded-lg ${f.color} flex items-center justify-center mb-4`}>
                    <f.icon className="w-5 h-5 text-foreground/70" />
                  </div>
                  <h3 className="font-semibold text-sm">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Progress Preview */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center">
              Your pregnancy, <span className="text-gradient-bloom">week by week</span>
            </h2>
          </ScrollReveal>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {weeklyTips.map((t, i) => (
              <ScrollReveal key={t.week} delay={i * 100}>
                <div className={`rounded-xl ${t.color} p-6 md:p-8`}>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t.week}</span>
                  <h3 className="mt-2 text-xl font-bold">{t.title}</h3>
                  <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{t.tip}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <ScrollReveal>
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-lavender/40 to-mint/40 p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to bloom?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-md mx-auto">
                Join thousands of mothers who trust MomBloom for their pregnancy and postpartum journey.
              </p>
              <Link
                to="/tools"
                className="mt-8 inline-block px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 active:scale-[0.97]"
              >
                Get Started Free
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
