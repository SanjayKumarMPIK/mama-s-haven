import { useState } from "react";
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
  Apple,
  Thermometer,
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Phase {
  id: string;
  name: string;
  days: string;
  emoji: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
  what: string;
  symptoms: string[];
  energy: string;
  mood: string;
  body: string;
  tips: string[];
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
    name: "Menstrual",
    days: "Days 1–5",
    emoji: "🩸",
    color: "rose",
    bgGradient: "from-rose-50 to-rose-100/60",
    borderColor: "border-rose-200",
    textColor: "text-rose-700",
    badgeBg: "bg-rose-100 text-rose-700",
    what: "Your uterus sheds its lining. This is your period — totally normal and healthy.",
    symptoms: ["Cramps", "Lower back pain", "Fatigue", "Bloating", "Mood dips"],
    energy: "Low — your body is working hard. Rest is key.",
    mood: "Quiet, reflective, or emotional. That's okay.",
    body: "Bleeding occurs. Uterine muscles contract to shed the lining.",
    tips: [
      "Use a heating pad on your lower belly",
      "Drink warm ginger or chamomile tea",
      "Light walking can ease cramps",
      "Eat iron-rich foods: spinach, lentils, dates",
      "Sleep 8+ hours and take naps if needed",
    ],
  },
  {
    id: "follicular",
    name: "Follicular",
    days: "Days 6–13",
    emoji: "🌱",
    color: "emerald",
    bgGradient: "from-emerald-50 to-emerald-100/60",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-700",
    badgeBg: "bg-emerald-100 text-emerald-700",
    what: "Your body starts growing a new egg. Estrogen rises, and you begin to feel better.",
    symptoms: ["Increased energy", "Clearer skin", "Better focus", "Mild appetite increase"],
    energy: "Rising — this is a great time to be active.",
    mood: "Optimistic, social, curious. You feel fresh.",
    body: "Follicles in the ovary grow. The uterine lining rebuilds.",
    tips: [
      "Try a new workout or activity you enjoy",
      "Eat protein-rich foods for muscle repair",
      "Great time to study or tackle big tasks",
      "Stay hydrated — at least 8 glasses of water",
      "Enjoy fruits, veggies, and whole grains",
    ],
  },
  {
    id: "ovulation",
    name: "Ovulation",
    days: "Day 14",
    emoji: "🌟",
    color: "amber",
    bgGradient: "from-amber-50 to-amber-100/60",
    borderColor: "border-amber-200",
    textColor: "text-amber-700",
    badgeBg: "bg-amber-100 text-amber-700",
    what: "A mature egg is released from the ovary. You're at peak hormone levels.",
    symptoms: ["Slight pelvic twinge", "Increased discharge (clear, stretchy)", "Heightened senses", "Feeling confident"],
    energy: "Peak — you feel your best right now.",
    mood: "Social, confident, and expressive.",
    body: "The egg travels down the fallopian tube. LH hormone surges.",
    tips: [
      "Perfect time for high-intensity workouts",
      "Engage in social activities or creative work",
      "Eat zinc-rich foods: pumpkin seeds, chickpeas",
      "Notice discharge changes — it's just your body",
      "You may feel extra warm — dress in layers",
    ],
  },
  {
    id: "luteal",
    name: "Luteal",
    days: "Days 15–28",
    emoji: "🌙",
    color: "purple",
    bgGradient: "from-purple-50 to-purple-100/60",
    borderColor: "border-purple-200",
    textColor: "text-purple-700",
    badgeBg: "bg-purple-100 text-purple-700",
    what: "Progesterone rises to prepare for pregnancy. If no pregnancy, levels drop — causing PMS.",
    symptoms: ["Bloating", "Breast tenderness", "Mood swings", "Fatigue", "Food cravings", "Headaches"],
    energy: "Declining — especially in the last few days.",
    mood: "Sensitive, irritable, or anxious — PMS is real.",
    body: "Uterus prepares for possible pregnancy. If no fertilisation, the cycle restarts.",
    tips: [
      "Reduce caffeine and salty foods for less bloating",
      "Magnesium-rich foods help: bananas, dark chocolate",
      "Gentle yoga or stretching over intense workouts",
      "Journal your feelings — it helps process emotions",
      "Prioritise sleep and limit screen time at night",
    ],
  },
];

const SYMPTOMS: Symptom[] = [
  {
    name: "Cramps",
    emoji: "⚡",
    category: "physical",
    desc: "Your uterine muscles contract to shed the lining — that's what causes cramping.",
    relief: ["Apply a heat pad for 15–20 mins", "Drink warm ginger tea"],
  },
  {
    name: "Bloating",
    emoji: "💧",
    category: "physical",
    desc: "Hormonal changes cause the body to retain water, making your belly feel puffy.",
    relief: ["Avoid salty and processed foods", "Drink peppermint tea"],
  },
  {
    name: "Fatigue",
    emoji: "😴",
    category: "physical",
    desc: "Blood loss and hormone shifts drain your energy, especially on heavy days.",
    relief: ["Nap when needed — rest is productive", "Eat iron-rich foods daily"],
  },
  {
    name: "Mood Swings",
    emoji: "🌊",
    category: "emotional",
    desc: "Hormone levels rise and fall across your cycle, affecting brain chemistry and mood.",
    relief: ["Track your mood daily to spot patterns", "Talk to someone you trust"],
  },
  {
    name: "Irritability",
    emoji: "😤",
    category: "emotional",
    desc: "Dropping progesterone before your period can make you more short-tempered.",
    relief: ["Try 5 mins of deep breathing", "Reduce caffeine and sugar intake"],
  },
];

const SUPPORT_ITEMS = [
  {
    group: "🥗 Food",
    color: "bg-green-50 border-green-200",
    headerColor: "text-green-700",
    items: [
      { icon: "🫘", tip: "Lentils, spinach, dates for iron replenishment" },
      { icon: "🍌", tip: "Bananas and dark chocolate for magnesium" },
      { icon: "💧", tip: "8+ glasses of water daily — staying hydrated reduces cramps" },
      { icon: "🫚", tip: "Omega-3 foods: flaxseeds, walnuts, fish" },
      { icon: "🚫", tip: "Limit salt, caffeine, and sugar during luteal phase" },
    ],
  },
  {
    group: "🏃 Habits",
    color: "bg-blue-50 border-blue-200",
    headerColor: "text-blue-700",
    items: [
      { icon: "🧘", tip: "Light yoga or stretching eases cramps and boosts mood" },
      { icon: "🌙", tip: "Aim for 8 hours of sleep — your body repairs overnight" },
      { icon: "📓", tip: "Track your cycle to predict phases and prep ahead" },
      { icon: "🚶", tip: "Even a 10-min walk helps with energy and bloating" },
      { icon: "📵", tip: "Reduce screen time before bed for better sleep quality" },
    ],
  },
  {
    group: "🩹 Relief",
    color: "bg-rose-50 border-rose-200",
    headerColor: "text-rose-700",
    items: [
      { icon: "🔥", tip: "Heating pad on your lower belly — 15–20 mins at a time" },
      { icon: "🫖", tip: "Ginger or chamomile tea soothes cramps and bloating" },
      { icon: "💊", tip: "Ibuprofen or paracetamol if pain is strong — ask an adult" },
      { icon: "🛁", tip: "Warm baths help relax muscles and reduce discomfort" },
      { icon: "😌", tip: "Rest without guilt — it's your body's signal to slow down" },
    ],
  },
];

const WARNING_SIGNS = [
  {
    icon: "🩸",
    title: "Very Heavy Bleeding",
    desc: "Soaking a pad/tampon every hour for 2+ hours in a row.",
    action: "See a doctor — this can indicate fibroids or a clotting issue.",
    level: "urgent",
  },
  {
    icon: "💢",
    title: "Severe Pain",
    desc: "Pain so bad it stops you from attending school or daily activities.",
    action: "Talk to a doctor — conditions like endometriosis can cause this.",
    level: "urgent",
  },
  {
    icon: "📅",
    title: "Missed or Irregular Periods",
    desc: "No period for 3+ months (and you're not pregnant), or very irregular timing.",
    action: "Consult a doctor to check for PCOS, thyroid, or stress-related causes.",
    level: "watch",
  },
  {
    icon: "😵",
    title: "Dizziness or Fainting",
    desc: "Feeling faint, seeing spots, or passing out during your period.",
    action: "Lie down, sip water, and see a doctor — could signal anaemia.",
    level: "urgent",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <span className="text-3xl shrink-0">{emoji}</span>
      <div>
        <h2 className="text-lg font-bold leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function PhaseCard({ phase }: { phase: Phase }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl border-2 ${phase.borderColor} bg-gradient-to-br ${phase.bgGradient} overflow-hidden transition-all duration-300`}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 flex items-center gap-3"
        aria-expanded={open}
      >
        <span className="text-3xl">{phase.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-base font-bold ${phase.textColor}`}>{phase.name} Phase</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${phase.badgeBg}`}>
              {phase.days}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{phase.what}</p>
        </div>
        <span className={`ml-auto shrink-0 ${phase.textColor}`}>
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 pb-5 space-y-4 border-t border-current/10">
          {/* Symptoms */}
          <div className="pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Common Symptoms
            </p>
            <div className="flex flex-wrap gap-2">
              {phase.symptoms.map((s) => (
                <span
                  key={s}
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${phase.badgeBg}`}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Impact grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Energy", value: phase.energy, icon: <Zap className="w-3.5 h-3.5" /> },
              { label: "Mood", value: phase.mood, icon: <Smile className="w-3.5 h-3.5" /> },
              { label: "Body", value: phase.body, icon: <Heart className="w-3.5 h-3.5" /> },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-white/70 border border-white/60 p-3"
              >
                <div className={`flex items-center gap-1 mb-1 ${phase.textColor} font-semibold text-[10px] uppercase tracking-wide`}>
                  {item.icon} {item.label}
                </div>
                <p className="text-xs text-foreground/80 leading-snug">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              What Helps
            </p>
            <ul className="space-y-1.5">
              {phase.tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-foreground/80">
                  <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${phase.textColor}`} />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function SymptomCard({ symptom }: { symptom: Symptom }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl">{symptom.emoji}</span>
        <div>
          <p className="font-semibold text-sm">{symptom.name}</p>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
              symptom.category === "physical"
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {symptom.category}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{symptom.desc}</p>
      <div className="space-y-1">
        {symptom.relief.map((r) => (
          <div key={r} className="flex items-start gap-1.5 text-xs text-foreground/70">
            <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 text-primary" /> {r}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Main Export
// ═════════════════════════════════════════════════════════════════════════════
export default function WeeklyGuide() {
  return (
    <main className="min-h-screen bg-background">

      {/* ── HERO HEADER ───────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="container py-8">
          <ScrollReveal>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
                <Droplets className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-0.5">
                  Educational Guide
                </p>
                <h1 className="text-2xl font-bold">Menstrual Guide</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your body, your cycle — understand it all
                </p>
              </div>
            </div>

            {/* Phase indicator pills */}
            <div className="flex gap-2 mt-5 flex-wrap">
              {[
                { label: "🩸 Menstrual", color: "bg-rose-100 text-rose-700" },
                { label: "🌱 Follicular", color: "bg-emerald-100 text-emerald-700" },
                { label: "🌟 Ovulation", color: "bg-amber-100 text-amber-700" },
                { label: "🌙 Luteal", color: "bg-purple-100 text-purple-700" },
              ].map((p) => (
                <span
                  key={p.label}
                  className={`${p.color} text-xs font-semibold px-3 py-1.5 rounded-full`}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="container py-8 space-y-10">

        {/* ── SECTION 1: WHAT IS A PERIOD? ────────────────────────────────── */}
        <ScrollReveal>
          <section id="what-is-period">
            <SectionHeader
              emoji="💬"
              title="What is a Period?"
              subtitle="Quick, simple, no-drama explanation"
            />
            <div className="rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50 p-5 space-y-3">
              <p className="text-sm leading-relaxed text-foreground/80">
                A period is when the uterus sheds its lining each month — blood and tissue leave the body through the vagina over 3–7 days.
              </p>
              <p className="text-sm leading-relaxed text-foreground/80">
                It's a sign your reproductive system is healthy and working. It begins in puberty (usually ages 10–15) and continues until menopause (around 45–55).
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: <Clock className="w-4 h-4" />, label: "Duration", value: "3–7 days" },
                  { icon: <Activity className="w-4 h-4" />, label: "Cycle Length", value: "21–35 days" },
                  { icon: <Moon className="w-4 h-4" />, label: "Starts", value: "Ages 10–15" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl bg-white/80 border border-pink-100 p-3 text-center"
                  >
                    <div className="text-pink-500 flex justify-center mb-1">{stat.icon}</div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                    <p className="text-sm font-bold text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-white/60 border border-pink-100 px-4 py-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Image tip:</span> Search "menstrual cycle diagram simple illustration" for a clean educational visual.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── SECTION 2: CYCLE PHASES ─────────────────────────────────────── */}
        <ScrollReveal delay={60}>
          <section id="cycle-phases">
            <SectionHeader
              emoji="🔄"
              title="Menstrual Cycle Phases"
              subtitle="Tap each phase to explore what happens, symptoms & tips"
            />
            <div className="space-y-3">
              {PHASES.map((phase) => (
                <PhaseCard key={phase.id} phase={phase} />
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-muted/50 border border-border px-4 py-3 flex items-start gap-2">
              <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Image tip:</span> Search "4 phases of menstrual cycle diagram color coded" for a great visual reference.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* ── SECTION 3: COMMON SYMPTOMS ──────────────────────────────────── */}
        <ScrollReveal delay={80}>
          <section id="common-symptoms">
            <SectionHeader
              emoji="🌡️"
              title="Common Symptoms"
              subtitle="Know what to expect — and how to handle it"
            />

            {/* Category labels */}
            <div className="flex gap-2 mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                🧍 Physical
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                💭 Emotional
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {SYMPTOMS.map((symptom) => (
                <SymptomCard key={symptom.name} symptom={symptom} />
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-muted/50 border border-border px-4 py-3 flex items-start gap-2">
              <Thermometer className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Image tip:</span> Search "menstrual symptoms icon set flat illustration" for simple icons.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* ── SECTION 4: DAILY SUPPORT ────────────────────────────────────── */}
        <ScrollReveal delay={100}>
          <section id="daily-support">
            <SectionHeader
              emoji="💪"
              title="What Helps"
              subtitle="Daily habits that actually make a difference"
            />

            <div className="space-y-3">
              {SUPPORT_ITEMS.map((group) => (
                <div
                  key={group.group}
                  className={`rounded-2xl border ${group.color} p-5`}
                >
                  <p className={`font-bold text-sm mb-3 ${group.headerColor}`}>{group.group}</p>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.tip} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="text-base shrink-0">{item.icon}</span>
                        {item.tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-muted/50 border border-border px-4 py-3 flex items-start gap-2">
              <Apple className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Image tip:</span> Search "menstrual health lifestyle illustration food exercise rest" for a warm, relatable visual.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* ── SECTION 5: WARNING SIGNS ────────────────────────────────────── */}
        <ScrollReveal delay={120}>
          <section id="warning-signs">
            <SectionHeader
              emoji="🚨"
              title="Warning Signs"
              subtitle="Know when to reach out for help — it's always okay to ask"
            />

            <div className="space-y-3">
              {WARNING_SIGNS.map((ws) => (
                <div
                  key={ws.title}
                  className={`rounded-2xl border-2 p-4 ${
                    ws.level === "urgent"
                      ? "border-red-200 bg-red-50/60"
                      : "border-amber-200 bg-amber-50/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">{ws.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className={`font-bold text-sm ${ws.level === "urgent" ? "text-red-800" : "text-amber-800"}`}>
                          {ws.title}
                        </p>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            ws.level === "urgent"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {ws.level === "urgent" ? "See a doctor" : "Monitor"}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed mb-2 ${ws.level === "urgent" ? "text-red-700" : "text-amber-700"}`}>
                        {ws.desc}
                      </p>
                      <div className={`flex items-start gap-1.5 text-xs font-medium ${ws.level === "urgent" ? "text-red-800" : "text-amber-800"}`}>
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {ws.action}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-muted/50 border border-border px-4 py-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Image tip:</span> Search "medical warning sign period health icon flat" for a clear, simple visual.
              </p>
            </div>
          </section>
        </ScrollReveal>

        {/* ── SECTION 6: WHAT TO EXPECT NEXT ──────────────────────────────── */}
        <ScrollReveal delay={140}>
          <section id="whats-next">
            <SectionHeader
              emoji="🗓️"
              title="What to Expect Next"
              subtitle="Your cycle is predictable — once you know the pattern"
            />

            <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-primary/5 p-5 space-y-4">

              {/* Flow arrows */}
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { label: "🩸 Period", bg: "bg-rose-100 text-rose-700" },
                  { label: "→", bg: "" },
                  { label: "🌱 Energy up", bg: "bg-emerald-100 text-emerald-700" },
                  { label: "→", bg: "" },
                  { label: "🌟 Peak", bg: "bg-amber-100 text-amber-700" },
                  { label: "→", bg: "" },
                  { label: "🌙 PMS", bg: "bg-purple-100 text-purple-700" },
                  { label: "→", bg: "" },
                  { label: "🔁 Repeat", bg: "bg-muted text-foreground" },
                ].map((item, i) => (
                  item.bg === "" ? (
                    <span key={i} className="text-muted-foreground font-bold">{item.label}</span>
                  ) : (
                    <span key={i} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.bg}`}>
                      {item.label}
                    </span>
                  )
                ))}
              </div>

              {/* Phase previews */}
              <div className="space-y-2">
                {[
                  {
                    phase: "After your period ends",
                    hint: "Energy returns. Great time to exercise, study, and socialise.",
                    color: "border-emerald-200 bg-emerald-50/50",
                  },
                  {
                    phase: "Around mid-cycle",
                    hint: "You feel confident and sharp — your peak performance window.",
                    color: "border-amber-200 bg-amber-50/50",
                  },
                  {
                    phase: "Week before your period",
                    hint: "PMS symptoms begin. Slow down, prioritise rest and comfort foods.",
                    color: "border-purple-200 bg-purple-50/50",
                  },
                ].map((item) => (
                  <div
                    key={item.phase}
                    className={`rounded-xl border px-4 py-3 ${item.color}`}
                  >
                    <p className="text-sm font-semibold">{item.phase}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.hint}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/10 px-4 py-3 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Pro tip:</span> Log your cycle for 2–3 months and you'll clearly see your patterns — mood, energy, and symptoms.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Image tip:</span> Search "menstrual cycle flow chart circular diagram simple" for an intuitive visual.
                </p>
              </div>
            </div>
          </section>
        </ScrollReveal>

      </div>

      <SafetyDisclaimer />
    </main>
  );
}
