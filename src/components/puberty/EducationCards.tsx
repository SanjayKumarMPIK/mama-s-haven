import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, Lightbulb, Heart, Droplets, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface EducationCard {
  id: string;
  icon: typeof BookOpen;
  iconBg: string;
  title: string;
  summary: string;
  detail: string;
}

const EDUCATION_CARDS: EducationCard[] = [
  {
    id: "cramps",
    icon: Heart,
    iconBg: "bg-rose-100 text-rose-500",
    title: "Why cramps happen",
    summary: "During your period, your uterus contracts to shed its lining — this causes cramps.",
    detail:
      "These contractions are triggered by prostaglandins, which are chemicals your body produces. Higher levels mean stronger cramps. Gentle heat, light exercise, and staying hydrated can help reduce discomfort. If cramps are severe and interfere with daily activities, consider visiting a clinic.",
  },
  {
    id: "hormones",
    icon: Brain,
    iconBg: "bg-purple-100 text-purple-500",
    title: "Hormonal changes explained",
    summary: "Estrogen and progesterone levels rise and fall throughout your cycle, affecting mood and energy.",
    detail:
      "In the first half of your cycle (follicular phase), estrogen rises — you may feel more energetic. After ovulation, progesterone rises and can cause tiredness or mood changes. Understanding these patterns helps you plan activities and practice self-care during low-energy days.",
  },
  {
    id: "periods",
    icon: Droplets,
    iconBg: "bg-pink-100 text-pink-500",
    title: "What's a normal period?",
    summary: "Periods typically last 3–7 days, with cycles ranging from 21 to 35 days.",
    detail:
      "It's completely normal for cycles to be irregular in the first couple of years after your first period. Flow can vary from light to heavy. Tracking your cycle helps you learn what's normal for YOUR body. If you soak through a pad/tampon every hour for several hours, consult a healthcare provider.",
  },
  {
    id: "skin",
    icon: Lightbulb,
    iconBg: "bg-amber-100 text-amber-500",
    title: "Skin changes during puberty",
    summary: "Hormones cause oil glands to become more active, which can lead to acne.",
    detail:
      "Washing your face twice daily with a gentle cleanser can help. Avoid touching your face frequently. If acne is persistent or severe, a dermatologist can suggest safe treatments. Remember: acne is very common during puberty and usually improves with time.",
  },
  {
    id: "nutrition",
    icon: BookOpen,
    iconBg: "bg-green-100 text-green-500",
    title: "Nutrition during puberty",
    summary: "Your body needs extra iron, calcium, and protein during this growth phase.",
    detail:
      "Iron-rich foods like spinach, lentils, and dates help replace iron lost during periods. Calcium from dairy or fortified foods supports bone growth. Protein from eggs, pulses, and nuts fuels muscle development. Aim for balanced meals and avoid skipping breakfast — it impacts energy and concentration.",
  },
];

export default function EducationCards() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Understanding Your Body</h2>
          <p className="text-xs text-muted-foreground">Daily tips & simple explanations</p>
        </div>
      </div>

      <div className="space-y-3">
        {EDUCATION_CARDS.map((card) => {
          const Icon = card.icon;
          const isOpen = expandedId === card.id;

          return (
            <button
              key={card.id}
              onClick={() => setExpandedId(isOpen ? null : card.id)}
              className={cn(
                "w-full text-left rounded-xl border p-4 transition-all duration-200",
                isOpen
                  ? "border-primary/30 bg-primary/5 shadow-sm"
                  : "border-border/60 bg-background hover:border-primary/20 hover:shadow-sm",
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", card.iconBg)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-800">{card.title}</h3>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.summary}</p>
                  {isOpen && (
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed border-t border-border/40 pt-3 animate-fadeIn">
                      {card.detail}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
