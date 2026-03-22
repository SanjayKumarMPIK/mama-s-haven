import { Link } from "react-router-dom";
import { ArrowLeft, Baby, Heart, Users, Dumbbell } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const milestones = [
  { age: "1 month", milestone: "First social smile", icon: "😊" },
  { age: "3 months", milestone: "Holds head up, coos", icon: "👶" },
  { age: "6 months", milestone: "Sits with support, babbles", icon: "🍼" },
  { age: "9 months", milestone: "Crawls, waves bye-bye", icon: "👋" },
  { age: "12 months", milestone: "First steps, first words", icon: "🎉" },
];

const recoveryTips = [
  { icon: Dumbbell, title: "Gentle Movement", desc: "Start with pelvic floor exercises and short walks. Listen to your body and progress slowly." },
  { icon: Heart, title: "Mental Health", desc: "Baby blues are common. If feelings persist beyond 2 weeks, reach out to your provider." },
  { icon: Users, title: "Partner Support", desc: "Share responsibilities, communicate openly, and take turns with nighttime duties." },
];

export default function Postpartum() {
  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-lavender flex items-center justify-center">
              <Baby className="w-5 h-5 text-foreground/70" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Postpartum <span className="text-gradient-bloom">Guide</span>
            </h1>
          </div>
          <p className="mt-3 text-muted-foreground max-w-lg">
            Recovery tips, milestone tracking, and support for your fourth trimester and beyond.
          </p>
        </ScrollReveal>

        {/* Recovery Tips */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {recoveryTips.map((tip, i) => (
            <ScrollReveal key={tip.title} delay={i * 80}>
              <div className="rounded-xl border border-border/60 bg-card p-6 h-full">
                <div className="w-10 h-10 rounded-lg bg-lavender/50 flex items-center justify-center mb-4">
                  <tip.icon className="w-5 h-5 text-foreground/70" />
                </div>
                <h3 className="font-bold">{tip.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{tip.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Baby Milestones */}
        <ScrollReveal delay={100}>
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Baby Milestone Tracker</h2>
            <div className="space-y-3">
              {milestones.map((m) => (
                <div key={m.age} className="flex items-center gap-4 p-4 rounded-xl bg-mint/30">
                  <span className="text-3xl">{m.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{m.age}</p>
                    <p className="text-sm text-muted-foreground">{m.milestone}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Resources */}
        <ScrollReveal delay={160}>
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-lavender/40 via-peach/30 to-mint/30 p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold">Need to talk to someone?</h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Postpartum depression affects 1 in 7 mothers. You are not alone, and help is always available.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="tel:1-800-944-4773"
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium shadow-sm hover:shadow-md transition-all active:scale-[0.97]"
              >
                PSI Helpline: 1-800-944-4773
              </a>
              <a
                href="https://www.postpartum.net"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg border-2 border-primary/20 font-medium hover:bg-primary/5 transition-all active:scale-[0.97]"
              >
                Visit Postpartum.net
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
