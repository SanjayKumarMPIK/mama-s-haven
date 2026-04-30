/**
 * PreparationTips.tsx
 *
 * TTC Tool: Lifestyle guidance — nutrition, sleep, and stress management.
 * Provides actionable tips organized by category.
 */

import { useState } from "react";

interface TipCategory {
  id: string;
  emoji: string;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  tips: { text: string; detail: string }[];
}

const CATEGORIES: TipCategory[] = [
  {
    id: "nutrition",
    emoji: "🥗",
    title: "Nutrition",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    tips: [
      { text: "Include folate-rich foods", detail: "Dark leafy greens, lentils, and beans support early development" },
      { text: "Omega-3 fatty acids", detail: "Fish, walnuts, and flaxseeds may support reproductive health" },
      { text: "Iron-rich foods", detail: "Spinach, dates, and pomegranate may help maintain healthy iron levels" },
      { text: "Stay hydrated", detail: "Aim for 8-10 glasses of water daily for optimal body function" },
    ],
  },
  {
    id: "sleep",
    emoji: "😴",
    title: "Sleep & Rest",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    tips: [
      { text: "7-9 hours nightly", detail: "Consistent sleep supports hormonal regulation" },
      { text: "Regular sleep schedule", detail: "Going to bed and waking at the same time helps your body clock" },
      { text: "Reduce screen time before bed", detail: "Blue light can interfere with melatonin production" },
    ],
  },
  {
    id: "stress",
    emoji: "🧘‍♀️",
    title: "Stress Management",
    color: "text-violet-700",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    tips: [
      { text: "Deep breathing exercises", detail: "5 minutes of slow breathing can reduce cortisol levels" },
      { text: "Gentle yoga or stretching", detail: "Promotes relaxation and improves blood circulation" },
      { text: "Mindfulness meditation", detail: "Even 10 minutes daily may help reduce stress hormones" },
      { text: "Talk to a partner or friend", detail: "Emotional support is important during this journey" },
    ],
  },
  {
    id: "activity",
    emoji: "🚶‍♀️",
    title: "Physical Activity",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    tips: [
      { text: "30 minutes of walking", detail: "Light daily activity supports overall health" },
      { text: "Avoid excessive intensity", detail: "Over-exercising may impact hormonal balance" },
      { text: "Swimming or cycling", detail: "Low-impact activities are generally recommended" },
    ],
  },
  {
    id: "avoid",
    emoji: "🚭",
    title: "Things to Avoid",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    tips: [
      { text: "Tobacco and alcohol", detail: "Both may negatively impact fertility" },
      { text: "Excessive caffeine", detail: "Consider limiting to 1-2 cups of coffee daily" },
      { text: "Processed foods", detail: "High sugar and trans fats may affect hormonal balance" },
    ],
  },
];

export default function PreparationTips() {
  const [expandedId, setExpandedId] = useState<string | null>("nutrition");

  return (
    <div className="space-y-3">
      {CATEGORIES.map((cat) => {
        const isExpanded = expandedId === cat.id;
        return (
          <div
            key={cat.id}
            className={`rounded-xl border overflow-hidden transition-all duration-300 ${cat.borderColor} ${
              isExpanded ? cat.bgColor : "bg-white"
            }`}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : cat.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/50 transition-colors"
            >
              <span className="text-xl">{cat.emoji}</span>
              <span className={`text-sm font-semibold ${cat.color}`}>{cat.title}</span>
              <span className="ml-auto text-xs text-slate-400">{cat.tips.length} tips</span>
              <svg
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                maxHeight: isExpanded ? `${cat.tips.length * 80 + 16}px` : "0px",
                opacity: isExpanded ? 1 : 0,
              }}
            >
              <div className="px-4 pb-4 space-y-2">
                {cat.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/70 border border-white/80"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <span className="text-emerald-400 mt-0.5 text-xs">✦</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{tip.text}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{tip.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <p className="text-[10px] text-slate-400 text-center pt-2">
        🌿 These are general wellness suggestions, not medical advice. Consult a professional for personalized guidance.
      </p>
    </div>
  );
}
