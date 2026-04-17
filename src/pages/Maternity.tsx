import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePhase } from "@/hooks/usePhase";
import { useMedicineReminder } from "@/hooks/useMedicineReminder";
import { ArrowLeft, Layers, ShieldAlert, Droplets, Sun, Pill, ChevronRight, CheckCircle2, Clock, AlertTriangle, Hourglass, Timer } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

// ─── Trimester content lookup ─────────────────────────────────────────────────

export type Trimester = "first" | "second" | "third";

interface TrimesterContent {
  emoji: string;
  label: string;
  weeks: string;
  color: string;
  badgeColor: string;
  guidance: { category: string; tips: string[] }[];
}

const TRIMESTER_CONTENT: Record<Trimester, TrimesterContent> = {
  first: {
    emoji: "🌱",
    label: "First Trimester",
    weeks: "Weeks 1–12",
    color: "bg-orange-50 border-orange-200",
    badgeColor: "bg-orange-100 text-orange-700",
    guidance: [
      {
        category: "Rest & Fatigue",
        tips: [
          "Take short naps during the day — fatigue is very common in early pregnancy.",
          "Aim for 8–9 hours of sleep each night.",
          "Avoid heavy lifting or strenuous physical activity.",
          "Ask for help with household chores when needed.",
        ],
      },
      {
        category: "Nausea Management",
        tips: [
          "Eat small, frequent meals (every 2–3 hours) to keep blood sugar stable.",
          "Avoid spicy, greasy, or strong-smelling foods that may trigger nausea.",
          "Sip cold water or ginger tea — ginger is known to ease nausea.",
          "Keep dry crackers or toast near your bed to eat before getting up.",
        ],
      },
    ],
  },
  second: {
    emoji: "🌿",
    label: "Second Trimester",
    weeks: "Weeks 13–26",
    color: "bg-green-50 border-green-200",
    badgeColor: "bg-green-100 text-green-700",
    guidance: [
      {
        category: "Nutritional Intake",
        tips: [
          "Increase protein intake: eggs, lentils, paneer, fish (if non-vegetarian).",
          "Take iron and calcium supplements as prescribed by your doctor.",
          "Eat green leafy vegetables daily — spinach, fenugreek, and amaranth.",
          "Limit sugary drinks and junk food; opt for seasonal fruits instead.",
        ],
      },
      {
        category: "Light Physical Activity",
        tips: [
          "Walk for 20–30 minutes daily in the morning or evening.",
          "Try prenatal yoga or light stretching to ease back pain.",
          "Avoid lying flat on your back for extended periods.",
          "Swim or do water aerobics if available — gentle and effective.",
        ],
      },
    ],
  },
  third: {
    emoji: "🌸",
    label: "Third Trimester",
    weeks: "Weeks 27–40",
    color: "bg-purple-50 border-purple-200",
    badgeColor: "bg-purple-100 text-purple-700",
    guidance: [
      {
        category: "Birth Preparation",
        tips: [
          "Pack your hospital bag (documents, clothes, snacks, baby essentials) by week 36.",
          "Attend antenatal check-ups every 2 weeks, then weekly near your due date.",
          "Discuss your birth plan with your doctor or midwife.",
          "Learn about signs of labour: contractions, water breaking, bloody show.",
        ],
      },
      {
        category: "Monitoring Body Changes",
        tips: [
          "Track baby movements daily — aim for 10 kicks in 2 hours.",
          "Watch for swelling in hands and feet; elevate legs when resting.",
          "Measure and record blood pressure regularly if advised by your doctor.",
          "Sleep on your left side with a pillow between your knees for comfort.",
        ],
      },
    ],
  },
};

// ─── Emergency warning signs ──────────────────────────────────────────────────

const WARNING_SIGNS = [
  { icon: "🩸", label: "Vaginal bleeding of any amount" },
  { icon: "😣", label: "Severe or persistent abdominal pain" },
  { icon: "💫", label: "Dizziness, fainting, or sudden headache" },
  { icon: "👁️", label: "Blurred vision or seeing spots" },
  { icon: "🤒", label: "High fever (above 38°C / 100.4°F)" },
  { icon: "🚿", label: "Sudden gush or leaking of fluid from the vagina" },
];

// ─── Daily care tips ──────────────────────────────────────────────────────────

const DAILY_CARE = [
  { icon: "💧", tip: "Drink 8–10 glasses of water daily to stay hydrated." },
  { icon: "😴", tip: "Maintain a consistent sleep schedule — sleep and wake at the same time." },
  { icon: "🚶‍♀️", tip: "Do light walking or gentle stretching for at least 20 minutes." },
  { icon: "🥗", tip: "Eat small, balanced meals every 3–4 hours throughout the day." },
  { icon: "📅", tip: "Keep all your antenatal appointment dates noted and never skip them." },
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

export function TrimesterSelector({
  value,
  onChange,
}: {
  value: Trimester;
  onChange: (t: Trimester) => void;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-lavender flex items-center justify-center">
          <Layers className="w-5 h-5 text-lavender-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Select Your Trimester</h2>
          <p className="text-xs text-muted-foreground">All guidance below will update based on your selection</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(TRIMESTER_CONTENT) as Trimester[]).map((key) => {
          const content = TRIMESTER_CONTENT[key];
          const isSelected = value === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`p-4 rounded-xl border-2 text-center transition-all duration-200 active:scale-[0.97] ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-transparent bg-muted/50 hover:bg-muted"
              }`}
            >
              <span className="text-2xl block mb-1">{content.emoji}</span>
              <span className="text-xs font-semibold block">{content.label}</span>
              <span className="text-[10px] text-muted-foreground block mt-0.5">{content.weeks}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrimesterGuidancePanel({ trimester }: { trimester: Trimester }) {
  const content = TRIMESTER_CONTENT[trimester];

  return (
    <div className={`rounded-2xl border p-6 md:p-8 ${content.color}`}>
      <div className="flex items-center gap-3 mb-5">
        <span className="text-3xl">{content.emoji}</span>
        <div>
          <h2 className="text-lg font-bold">{content.label} Guidance</h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${content.badgeColor}`}>
            {content.weeks}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {content.guidance.map((section) => (
          <div key={section.category}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
              {section.category}
            </h3>
            <ul className="space-y-2">
              {section.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="text-primary/70 flex-shrink-0 mt-1">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function WarningSigns() {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-red-800">Seek Medical Attention If You Experience:</h2>
          <p className="text-xs text-red-600">Go to your nearest PHC or emergency room immediately</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {WARNING_SIGNS.map((sign, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-red-200 shadow-sm"
          >
            <span className="text-xl flex-shrink-0">{sign.icon}</span>
            <p className="text-sm font-medium text-red-800">{sign.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href="tel:104"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold shadow hover:bg-red-700 transition-all active:scale-[0.97]"
        >
          📞 Call 104 – Maternal Helpline
        </a>
        <a
          href="tel:108"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-red-400 text-red-700 text-sm font-semibold hover:bg-red-100 transition-all active:scale-[0.97]"
        >
          🚑 Call 108 – Ambulance
        </a>
      </div>
    </div>
  );
}

function SymptomCheckIn({ trimester }: { trimester: Trimester }) {
  const [nausea, setNausea] = useState(false);
  const [dizzy, setDizzy] = useState(false);
  const [headache, setHeadache] = useState(false);

  const tips = useMemo(() => {
    const t: string[] = [];
    if (nausea) {
      t.push("Because you noted nausea: try small dry snacks before getting up and sip ginger or ORS.");
    }
    if (dizzy) {
      t.push("Because you feel dizzy: sit or lie on your left side, hydrate, and avoid sudden standing.");
    }
    if (headache) {
      t.push("Because of headache: rest in a dark room; if severe or with vision changes, seek urgent care.");
    }
    if (trimester === "first" && (nausea || dizzy)) {
      t.push("First trimester: these symptoms are common — still mention them at your next ANC visit.");
    }
    if (t.length === 0) {
      t.push("Tick any symptoms you have today — you’ll see simple, non-clinical care ideas.");
    }
    return t.slice(0, 5);
  }, [nausea, dizzy, headache, trimester]);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-mint/80 flex items-center justify-center">
          <Droplets className="w-5 h-5 text-mint-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Symptom check-in</h2>
          <p className="text-xs text-muted-foreground">Nausea, dizziness, headache — gentle suggestions only</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={nausea} onChange={(e) => setNausea(e.target.checked)} className="rounded border-input" />
          Nausea
        </label>
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={dizzy} onChange={(e) => setDizzy(e.target.checked)} className="rounded border-input" />
          Dizziness
        </label>
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={headache} onChange={(e) => setHeadache(e.target.checked)} className="rounded border-input" />
          Headache
        </label>
      </div>
      <ul className="space-y-2">
        {tips.map((line, i) => (
          <li key={i} className="text-sm text-muted-foreground flex gap-2">
            <span className="text-primary shrink-0">•</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmotionalReassurance({ trimester }: { trimester: Trimester }) {
  const copy: Record<Trimester, string> = {
    first: "The first months can feel overwhelming — it’s okay to take things hour by hour. Many mothers feel unsure; you’re not alone.",
    second: "Many women feel more energy now — celebrate small wins. It’s normal to still have worries about scans and the future.",
    third: "As birth nears, nerves are common. Focus on breathing, your support person, and your care team’s plan.",
  };
  return (
    <div className="rounded-2xl border border-lavender/40 bg-lavender/10 p-6 md:p-8">
      <h2 className="text-lg font-bold mb-2">Emotional reassurance</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{copy[trimester]}</p>
    </div>
  );
}

function DailyCare() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
          <Sun className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Daily Care Recommendations</h2>
          <p className="text-xs text-muted-foreground">Simple habits for a healthy pregnancy</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {DAILY_CARE.map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border/50">
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <p className="text-sm leading-relaxed">{item.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function MedicineReminderCard() {
  const { getTodayStats, getNextDose, medicines } = useMedicineReminder();
  const stats = getTodayStats();
  const nextDose = getNextDose();
  const pct = stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0;

  return (
    <Link
      to="/medicine-reminder"
      className="block rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/80 via-violet-50/60 to-fuchsia-50/40 p-6 md:p-8 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-200/50">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Medicine Reminder</h2>
            <p className="text-xs text-muted-foreground">Track your prescribed medicines</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </div>

      {medicines.length === 0 ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/60 border border-purple-100">
          <Pill className="w-5 h-5 text-purple-400" />
          <div>
            <p className="text-sm font-medium">No medicines added yet</p>
            <p className="text-xs text-muted-foreground">Tap to add your prescribed medicines</p>
          </div>
        </div>
      ) : (
        <>
          {/* Next dose indicator */}
          {nextDose && (
            <div className={`flex items-center gap-2.5 p-3 rounded-xl mb-3 ${
              nextDose.minutesUntil === 0
                ? "bg-purple-100/80 border border-purple-200"
                : "bg-white/60 border border-purple-100"
            }`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                nextDose.minutesUntil === 0
                  ? "bg-purple-200"
                  : "bg-blue-100"
              }`}>
                {nextDose.minutesUntil === 0 ? (
                  <Pill className="w-4 h-4 text-purple-600 animate-bounce" />
                ) : (
                  <Timer className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {nextDose.minutesUntil === 0 ? "Take now:" : "Next:"} {nextDose.medicineName}
                </p>
                <p className="text-[10px] text-muted-foreground">{nextDose.dosage} at {nextDose.scheduledTime}</p>
              </div>
              <span className={`text-xs font-bold ${
                nextDose.minutesUntil === 0 ? "text-purple-700" : "text-blue-700"
              }`}>
                {nextDose.minutesUntil === 0 ? "Due Now" : `${Math.floor(nextDose.minutesUntil / 60) > 0 ? Math.floor(nextDose.minutesUntil / 60) + "h " : ""}${nextDose.minutesUntil % 60}m`}
              </span>
            </div>
          )}

          {/* Progress bar */}
          <div className="h-2.5 rounded-full bg-white/60 overflow-hidden mb-3">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct === 100
                  ? "linear-gradient(135deg, #10b981, #34d399)"
                  : "linear-gradient(135deg, #8b5cf6, #a78bfa)",
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> {stats.taken} taken
              </span>
              {stats.pending > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700">
                  <Clock className="w-3.5 h-3.5" /> {stats.pending} pending
                </span>
              )}
              {stats.scheduled > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
                  <Hourglass className="w-3.5 h-3.5" /> {stats.scheduled} upcoming
                </span>
              )}
              {stats.missed > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                  <AlertTriangle className="w-3.5 h-3.5" /> {stats.missed} missed
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-purple-700">{pct}%</span>
          </div>
        </>
      )}
    </Link>
  );
}

export default function Maternity() {
  const { setPhase } = usePhase();
  const [trimester, setTrimester] = useState<Trimester>("first");

  useEffect(() => {
    setPhase("maternity");
  }, [setPhase]);

  return (
    <div className="min-h-screen py-12 bg-background">
      <div className="container max-w-4xl">
        <ScrollReveal>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold mb-3">
              🤰 Phase 2
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Maternity <span className="text-gradient-bloom">Support Module</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl">
              Trimester-specific guidance, warning signs to watch for, and daily care recommendations
              to support you throughout your pregnancy.
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-6">
          {/* Trimester selector */}
          <ScrollReveal>
            <TrimesterSelector value={trimester} onChange={setTrimester} />
          </ScrollReveal>

          {/* Trimester-specific guidance */}
          <ScrollReveal delay={80}>
            <TrimesterGuidancePanel trimester={trimester} />
          </ScrollReveal>

          {/* Medicine Reminder card */}
          <ScrollReveal delay={140}>
            <MedicineReminderCard />
          </ScrollReveal>

          {/* Warning signs — always visible */}
          <ScrollReveal delay={200}>
            <WarningSigns />
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <SymptomCheckIn trimester={trimester} />
          </ScrollReveal>

          <ScrollReveal delay={220}>
            <EmotionalReassurance trimester={trimester} />
          </ScrollReveal>

          {/* Daily care — always visible */}
          <ScrollReveal delay={240}>
            <DailyCare />
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
