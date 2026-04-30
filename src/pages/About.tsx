import { Link } from "react-router-dom";
import { ArrowLeft, Heart, Leaf, Shield } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

export default function About() {
  return (
    <div className="min-h-screen py-12">
      <div className="container max-w-3xl">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            About <span className="text-gradient-bloom">MomBloom</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            MomBloom was created with a simple belief: every mother deserves a calming, supportive space during one of life's most transformative journeys. We combine trusted health information with intuitive tools to help you feel prepared, connected, and cared for.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { icon: Heart, title: "Made with Love", desc: "Every feature is designed by parents who understand your journey.", color: "bg-peach/60" },
            { icon: Leaf, title: "Evidence-Based", desc: "Content reviewed by healthcare professionals and trusted sources.", color: "bg-mint/60" },
            { icon: Shield, title: "Private & Secure", desc: "Your health data stays on your device. Your privacy is our priority.", color: "bg-lavender/60" },
          ].map((v, i) => (
            <ScrollReveal key={v.title} delay={i * 80 + 120}>
              <div className={`rounded-xl ${v.color} p-6 text-center`}>
                <v.icon className="w-8 h-8 mx-auto text-foreground/60" />
                <h3 className="mt-3 font-bold text-sm">{v.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{v.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
