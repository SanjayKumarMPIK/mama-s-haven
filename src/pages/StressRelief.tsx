import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Wind, Sparkles, Quote } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const affirmations = [
  "You are strong, capable, and doing an amazing job.",
  "Your body knows exactly what to do. Trust it.",
  "Every day you grow closer to meeting your little one.",
  "You are not alone on this journey.",
  "Rest is productive. You deserve it.",
  "You are creating a miracle — be gentle with yourself.",
  "Your love is already shaping your baby's world.",
  "It's okay to ask for help. Strength comes in many forms.",
];

function BreathingExercise() {
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) { setPhase("idle"); return; }
    let timeout: number;
    const cycle = () => {
      setPhase("inhale");
      timeout = window.setTimeout(() => {
        setPhase("hold");
        timeout = window.setTimeout(() => {
          setPhase("exhale");
          timeout = window.setTimeout(cycle, 6000);
        }, 4000);
      }, 4000);
    };
    cycle();
    return () => clearTimeout(timeout);
  }, [running]);

  const circleScale = phase === "inhale" ? "scale-125" : phase === "hold" ? "scale-125" : phase === "exhale" ? "scale-100" : "scale-100";
  const label = phase === "idle" ? "Tap to begin" : phase === "inhale" ? "Breathe in..." : phase === "hold" ? "Hold..." : "Breathe out...";

  return (
    <div className="rounded-xl border border-border/60 bg-card p-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-mint flex items-center justify-center">
          <Wind className="w-5 h-5 text-foreground/70" />
        </div>
        <h2 className="text-xl font-bold">Breathing Exercise</h2>
      </div>
      <button
        onClick={() => setRunning(!running)}
        className="mx-auto block"
      >
        <div
          className={`w-40 h-40 rounded-full bg-gradient-to-br from-mint to-baby-blue flex items-center justify-center transition-transform duration-[3000ms] ease-in-out ${circleScale} shadow-lg`}
        >
          <span className="text-sm font-medium text-foreground/70">{label}</span>
        </div>
      </button>
      {running && (
        <button onClick={() => setRunning(false)} className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Stop
        </button>
      )}
    </div>
  );
}

export default function StressRelief() {
  const [affIdx, setAffIdx] = useState(0);

  return (
    <div className="min-h-screen py-12">
      <div className="container">
        <ScrollReveal>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">
            Stress <span className="text-gradient-bloom">Relief</span>
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg">
            Take a moment for yourself. You deserve peace and calm.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal>
            <BreathingExercise />
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <div className="rounded-xl border border-border/60 bg-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-lavender flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-foreground/70" />
                </div>
                <h2 className="text-xl font-bold">Daily Affirmation</h2>
              </div>
              <div className="relative bg-lavender/30 rounded-xl p-8 min-h-[180px] flex items-center justify-center">
                <Quote className="absolute top-4 left-4 w-6 h-6 text-lavender-foreground/20" />
                <p className="text-center text-lg font-medium leading-relaxed max-w-sm">
                  {affirmations[affIdx]}
                </p>
              </div>
              <button
                onClick={() => setAffIdx((i) => (i + 1) % affirmations.length)}
                className="mt-6 w-full py-3 rounded-lg bg-lavender text-lavender-foreground font-medium hover:shadow-md transition-all active:scale-[0.97]"
              >
                Next Affirmation
              </button>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={160}>
          <div className="mt-10 rounded-xl bg-mint/30 p-8 md:p-10">
            <h2 className="text-xl font-bold mb-4">Wellness Reminders</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { emoji: "💧", title: "Stay Hydrated", tip: "Aim for 8–10 glasses of water daily." },
                { emoji: "🧘", title: "Gentle Movement", tip: "A short walk or prenatal yoga does wonders." },
                { emoji: "😴", title: "Rest Well", tip: "Listen to your body and nap when you need to." },
              ].map((r) => (
                <div key={r.title} className="bg-card rounded-lg p-5 shadow-sm">
                  <span className="text-2xl">{r.emoji}</span>
                  <h3 className="mt-2 font-semibold text-sm">{r.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{r.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
