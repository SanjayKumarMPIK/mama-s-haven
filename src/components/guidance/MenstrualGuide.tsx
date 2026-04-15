import React, { useState } from "react";
import SafetyDisclaimer from "@/components/SafetyDisclaimer";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Droplets,
  AlertTriangle,
  Zap,
  Heart,
  Smile,
  Moon,
  Sun,
  Thermometer,
  Activity,
  ChevronDown,
  Clock,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  CalendarDays,
  Coffee,
  BedDouble,
  Flower2,
  ActivitySquare
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Phase {
  id: string;
  name: string;
  tag: string;
  days: string;
  emoji: string;
  theme: {
    base: string;
    light: string;
    border: string;
    text: string;
    gradient: string;
  };
  what: string;
  symptoms: string[];
  energyMood: string;
  helps: string[];
  avoids: string[];
}

interface Symptom {
  name: string;
  emoji: string;
  category: "physical" | "emotional";
  desc: string;
  relief: string[];
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PHASES: Phase[] = [
  {
    id: "menstrual",
    name: "Menstrual Phase",
    tag: "Low energy phase",
    days: "Days 1–5",
    emoji: "🩸",
    theme: {
      base: "bg-rose-500",
      light: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-700",
      gradient: "from-rose-500 to-pink-500",
    },
    what: "Your body sheds its uterine lining. This causes bleeding, which is a normal and healthy part of your cycle.",
    symptoms: ["Cramps in lower belly", "Feeling extra tired", "Lower back pain", "Mood changes"],
    energyMood: "Your energy is usually at its lowest. You might feel quiet, reflective, or a bit emotional.",
    helps: ["Rest as much as you can", "Use a warm heating pad", "Eat iron-rich foods like spinach", "Gentle walks to ease cramps"],
    avoids: ["Pushing yourself too hard", "Skipping meals", "Intense workouts"],
  },
  {
    id: "follicular",
    name: "Follicular Phase",
    tag: "Build-up phase",
    days: "Days 6–13",
    emoji: "🌱",
    theme: {
      base: "bg-emerald-500",
      light: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      gradient: "from-emerald-500 to-teal-500",
    },
    what: "Your brain tells your body to grow a new egg. Estrogen levels go up, making you feel refreshed.",
    symptoms: ["Clearer skin", "Better focus", "Feeling stronger"],
    energyMood: "Energy builds up day by day. You will likely feel optimistic, curious, and ready to socialize.",
    helps: ["Try new activities or workouts", "Eat healthy proteins", "Drink plenty of water", "Focus on big tasks or projects"],
    avoids: ["Staying up too late", "Forgetting to hydrate"],
  },
  {
    id: "ovulation",
    name: "Ovulation Phase",
    tag: "Peak phase",
    days: "Day 14",
    emoji: "🌟",
    theme: {
      base: "bg-amber-500",
      light: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      gradient: "from-amber-400 to-orange-500",
    },
    what: "A mature egg is released from your ovary. Your hormones are at their highest peak right now.",
    symptoms: ["A quick pinch in your belly", "More discharge than usual", "Feeling very confident"],
    energyMood: "You have peak energy! You might feel your best, most expressive, and social right now.",
    helps: ["Do high-energy workouts", "Hang out with friends", "Tackle creative projects", "Eat foods with zinc, like seeds"],
    avoids: ["Overcommitting your schedule", "Ignoring your body's signals"],
  },
  {
    id: "luteal",
    name: "Luteal Phase",
    tag: "Recovery phase",
    days: "Days 15–28",
    emoji: "🌙",
    theme: {
      base: "bg-purple-500",
      light: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
      gradient: "from-purple-500 to-indigo-500",
    },
    what: "Your body prepares just in case of pregnancy. If it doesn't happen, hormones drop, which can cause PMS.",
    symptoms: ["Feeling bloated", "Tender breasts", "Mood swings or crying easily", "Craving snacks"],
    energyMood: "Energy slowly drops off. You might feel a bit sensitive, irritable, or anxious as days pass.",
    helps: ["Practice gentle yoga or stretching", "Eat dark chocolate or bananas", "Prioritize sleep and rest", "Be kind to yourself"],
    avoids: ["Too much caffeine or salt", "Heavy, stressful workloads", "Late nights screen time"],
  },
];

const SYMPTOMS: Symptom[] = [
  {
    name: "Cramps",
    emoji: "⚡",
    category: "physical",
    desc: "Uterine muscles contracting to shed the lining.",
    relief: ["Heat pad for 15-20 mins", "Warm ginger tea", "Light stretching"],
  },
  {
    name: "Bloating",
    emoji: "💧",
    category: "physical",
    desc: "Hormones cause the body to retain water.",
    relief: ["Less salty foods", "Peppermint tea", "Stay hydrated"],
  },
  {
    name: "Fatigue",
    emoji: "😴",
    category: "physical",
    desc: "Energy drain from hormone shifts and blood loss.",
    relief: ["Short naps", "Iron-rich foods", "Early bedtime"],
  },
  {
    name: "Mood Swings",
    emoji: "🌊",
    category: "emotional",
    desc: "Hormone fluctuations affecting brain chemistry.",
    relief: ["Journaling", "Talking to friends", "Light walks"],
  },
];

const WARNING_SIGNS = [
  {
    icon: "🩸",
    title: "Very Heavy Bleeding",
    desc: "Soaking a pad/tampon every hour for 2+ hours.",
    action: "See a doctor — could indicate underlying issues.",
    urgent: true,
  },
  {
    icon: "💢",
    title: "Severe Pain",
    desc: "Pain so bad it stops you from daily activities.",
    action: "Consult a doctor — endometriosis or similar conditions.",
    urgent: true,
  },
  {
    icon: "📅",
    title: "Missed/Irregular",
    desc: "No period for 3+ months or very irregular.",
    action: "Check for PCOS, thyroid, or stress causes.",
    urgent: false,
  },
  {
    icon: "😵",
    title: "Dizziness",
    desc: "Feeling faint or passing out during period.",
    action: "Lie down, sip water, rule out anaemia.",
    urgent: true,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function PhaseCard({ phase }: { phase: Phase }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`overflow-hidden rounded-3xl border-2 transition-all duration-300 ${open ? phase.theme.border : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full text-left p-5 flex items-center justify-between group ${open ? phase.theme.light : ''}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${phase.theme.gradient} text-white shadow-inner`}>
            {phase.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`text-lg font-bold ${open ? phase.theme.text : 'text-slate-900'}`}>{phase.name}</h3>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${open ? 'bg-white bg-opacity-60' : phase.theme.light} ${phase.theme.text}`}>
                {phase.tag}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">{phase.days}</p>
          </div>
        </div>
        <div className={`p-2 rounded-full transition-colors ${open ? phase.theme.base + ' text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
          <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <div className={`grid transition-all duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className={`p-6 pt-2 ${phase.theme.light} space-y-6`}>
            
            <div>
              <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 mb-2">
                📌 What is happening:
              </h4>
              <p className="text-sm font-medium leading-relaxed text-slate-700 bg-white/60 p-4 rounded-xl border border-white/80 shadow-sm">
                {phase.what}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 mb-3">
                    ⚡ Common Symptoms:
                  </h4>
                  <ul className="space-y-2">
                    {phase.symptoms.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                        <span className="text-slate-400 shrink-0 mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 mb-3">
                    💪 Energy & Mood:
                  </h4>
                  <p className="text-sm font-medium text-slate-700 bg-white/40 p-3 rounded-lg border border-white/50">
                    {phase.energyMood}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 mb-3">
                    🍲 What helps:
                  </h4>
                  <ul className="space-y-2">
                    {phase.helps.map((tip, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 bg-white/60 p-2.5 px-3.5 rounded-xl border border-white/80 shadow-sm">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${phase.theme.text}`} />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2 text-slate-900 mb-3">
                    ⚠️ What to avoid:
                  </h4>
                  <ul className="space-y-2">
                    {phase.avoids.map((avoid, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 bg-white/40 p-2.5 px-3.5 rounded-xl border border-rose-100 shadow-sm">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                        {avoid}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════

export default function MenstrualGuide() {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white border-b border-border/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-100 rounded-full blur-[80px] -mr-32 -mt-32 opacity-60" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-[80px] -ml-32 -mb-32 opacity-60" />
        
        <div className="container relative py-12 md:py-16">
          <ScrollReveal>
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold uppercase tracking-widest mb-6 border border-pink-100">
                <Sparkles className="w-3.5 h-3.5" /> Educational Guide
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
                The Menstrual Guide
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Your body goes through 4 incredible phases every month. 
                Understand your cycle to harness your energy, manage symptoms, and feel in sync with yourself.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-12 space-y-20">
        
        {/* ── AT A GLANCE ─────────────────────────────────────────────────── */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Clock />, label: "Duration", val: "3-7 Days", bg: "bg-rose-50", color: "text-rose-600" },
              { icon: <CalendarDays />, label: "Cycle Length", val: "21-35 Days", bg: "bg-indigo-50", color: "text-indigo-600" },
              { icon: <ActivitySquare />, label: "Phases", val: "4 Distinct", bg: "bg-emerald-50", color: "text-emerald-600" },
              { icon: <Heart />, label: "Health", val: "Vital Sign", bg: "bg-amber-50", color: "text-amber-600" },
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} rounded-3xl p-5 flex flex-col items-center justify-center text-center border border-black/[0.03]`}>
                <div className={`${stat.color} mb-3`}>{React.cloneElement(stat.icon as any, { className: "w-6 h-6" })}</div>
                <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── UNDERSTANDING YOUR CYCLE ────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <div className="bg-sky-50 rounded-3xl p-6 md:p-8 border border-sky-100 flex flex-col md:flex-row items-start md:items-center gap-5">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm shrink-0 border border-sky-100">
                📘
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Understanding Your Cycle</h2>
                <p className="text-slate-600 font-medium leading-relaxed text-base">
                  Your menstrual cycle is made up of 4 distinct phases. As your hormones rise and fall throughout the month, each phase affects your body, energy levels, and mood differently.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* ── THE 4 PHASES ────────────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <Flower2 className="w-6 h-6 text-pink-500" />
                The 4 Phases
              </h2>
              <p className="text-slate-500 mt-2 font-medium">Follow the flow of your cycle and click on any phase to explore what happens biologically.</p>
            </div>
            
            {/* Visual Flow Indicator */}
            <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-3 rounded-2xl border border-black/5 shadow-sm">
              {PHASES.map((p, i) => (
                <React.Fragment key={p.id}>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${p.theme.light} ${p.theme.text} border ${p.theme.border} shrink-0`}>
                    <span className="text-lg leading-none">{p.emoji}</span> {p.name}
                  </div>
                  {i < PHASES.length - 1 && <span className="text-slate-300 font-bold shrink-0 mx-1">→</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="space-y-4">
              {PHASES.map((phase) => (
                <PhaseCard key={phase.id} phase={phase} />
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ── SYMPTOMS & RELIEF ───────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <Thermometer className="w-6 h-6 text-purple-500" />
                  Symptoms & Relief
                </h2>
                <p className="text-slate-500 mt-2 font-medium">Simple ways to manage common cycle discomforts.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {SYMPTOMS.map((sym, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100">
                        {sym.emoji}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{sym.name}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mt-1 inline-block ${sym.category === 'physical' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                          {sym.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-5 font-medium leading-relaxed">{sym.desc}</p>
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 ml-1">Try this</p>
                    <ul className="space-y-2">
                      {sym.relief.map((r, ri) => (
                        <li key={ri} className="flex items-start gap-2.5 text-sm font-medium text-slate-700">
                          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 border border-slate-200 mt-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          </div>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ── EVERYDAY SUPPORT ────────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Coffee className="w-6 h-6 text-amber-500" />
              Everyday Support
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Nutrition", icon: "🥗", color: "bg-green-50 text-green-700", items: ["Iron-rich foods (spinach, lentils) during period", "Magnesium (dark chocolate, bananas) for cramps", "Hydration is critical for bloating"] },
                { title: "Movement", icon: "🧘", color: "bg-blue-50 text-blue-700", items: ["Rest during days 1-3", "Yoga and walking for cramp relief", "HIIT/Cardio during ovulation phase"] },
                { title: "Rest", icon: "🌙", color: "bg-indigo-50 text-indigo-700", items: ["8+ hours sleep minimum", "Heat pads for pain relief", "Reduce screen time before bed"] }
              ].map((group, i) => (
                <div key={i} className={`${group.color.split(' ')[0]} rounded-3xl p-6 border border-black/5`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">
                      {group.icon}
                    </div>
                    <h3 className={`font-bold text-lg ${group.color.split(' ')[1]}`}>{group.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {group.items.map((item, ii) => (
                      <li key={ii} className="flex items-start gap-2 text-sm font-medium opacity-80 mix-blend-multiply">
                        <span className="shrink-0 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </section>

        {/* ── WHEN TO SEE A DOCTOR ────────────────────────────────────────── */}
        <section>
          <ScrollReveal>
            <div className="bg-rose-50 rounded-3xl p-6 md:p-8 border border-rose-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <ShieldAlert className="w-6 h-6 text-rose-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">When to see a doctor</h2>
                    <p className="text-sm font-medium text-rose-600">Don't ignore these warning signs</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {WARNING_SIGNS.map((sign, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-rose-100 flex gap-4">
                      <div className="text-2xl mt-1 shrink-0">{sign.icon}</div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{sign.title}</h4>
                          {sign.urgent && <span className="bg-rose-100 text-rose-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">Urgent</span>}
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-3">{sign.desc}</p>
                        <p className="text-[11px] font-bold text-rose-600 uppercase flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3" /> {sign.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </section>

      </div>
      <SafetyDisclaimer />
    </main>
  );
}
