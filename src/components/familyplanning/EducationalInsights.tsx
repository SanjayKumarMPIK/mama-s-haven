/**
 * EducationalInsights.tsx
 *
 * Neutral/Tracking Tool: Provides basic knowledge about cycles and health.
 * Uses a carousel of educational cards without strong predictions.
 */

import { useState } from "react";

interface InsightCard {
  id: string;
  emoji: string;
  title: string;
  content: string;
  category: string;
  categoryColor: string;
}

const INSIGHTS: InsightCard[] = [
  {
    id: "phases",
    emoji: "🔄",
    title: "The 4 Phases of Your Cycle",
    content:
      "Your menstrual cycle has four phases: Menstrual (period), Follicular (preparation), Ovulation (egg release), and Luteal (post-ovulation). Each phase brings different hormonal changes that affect how you feel.",
    category: "Cycle Basics",
    categoryColor: "bg-teal-100 text-teal-700",
  },
  {
    id: "ovulation",
    emoji: "🥚",
    title: "What is Ovulation?",
    content:
      "Ovulation is when an ovary releases an egg, usually around the middle of your cycle. The egg survives about 12-24 hours. Knowing when this happens can help you understand your body better.",
    category: "Cycle Basics",
    categoryColor: "bg-teal-100 text-teal-700",
  },
  {
    id: "hormones",
    emoji: "⚡",
    title: "Hormones and Your Mood",
    content:
      "Estrogen and progesterone levels change throughout your cycle. Higher estrogen (follicular phase) often brings more energy, while rising progesterone (luteal phase) may cause tiredness or mood shifts.",
    category: "Hormonal Health",
    categoryColor: "bg-violet-100 text-violet-700",
  },
  {
    id: "nutrition",
    emoji: "🥗",
    title: "Cycle-Synced Nutrition",
    content:
      "Different phases may benefit from different nutrients. Iron-rich foods during periods, protein during the follicular phase, and complex carbs during the luteal phase may support your body's needs.",
    category: "Nutrition",
    categoryColor: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "exercise",
    emoji: "🏃‍♀️",
    title: "Exercise Through Your Cycle",
    content:
      "Light exercise during your period, more intense workouts during the follicular phase, and gentler activities during the luteal phase can work with your body's natural rhythms.",
    category: "Fitness",
    categoryColor: "bg-sky-100 text-sky-700",
  },
  {
    id: "tracking",
    emoji: "📝",
    title: "Why Track Your Cycle?",
    content:
      "Regular cycle tracking helps you understand your body's patterns, predict your next period, identify irregularities early, and have more informed conversations with healthcare providers.",
    category: "Awareness",
    categoryColor: "bg-amber-100 text-amber-700",
  },
  {
    id: "pms",
    emoji: "🌧️",
    title: "Understanding PMS",
    content:
      "Premenstrual Syndrome (PMS) affects many women in the days before their period. Symptoms like bloating, mood changes, and fatigue are common and usually manageable with lifestyle adjustments.",
    category: "Symptoms",
    categoryColor: "bg-rose-100 text-rose-700",
  },
  {
    id: "irregular",
    emoji: "📊",
    title: "Irregular Cycles",
    content:
      "Cycle lengths can vary from 21 to 35 days and still be normal. Stress, diet changes, exercise, and health conditions can cause irregularity. If your cycles are consistently irregular, consider consulting a doctor.",
    category: "Awareness",
    categoryColor: "bg-amber-100 text-amber-700",
  },
];

export default function EducationalInsights() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const visibleInsights = showAll ? INSIGHTS : INSIGHTS.slice(0, 4);

  return (
    <div className="space-y-4">
      {/* Featured Card */}
      <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${INSIGHTS[activeIdx].categoryColor}`}>
            {INSIGHTS[activeIdx].category}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{INSIGHTS[activeIdx].emoji}</span>
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-1.5">{INSIGHTS[activeIdx].title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{INSIGHTS[activeIdx].content}</p>
          </div>
        </div>

        {/* Dots Navigator */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {INSIGHTS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === activeIdx ? "w-5 bg-indigo-400" : "bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Quick Browse */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Browse Topics
        </p>
        <div className="space-y-2">
          {visibleInsights.map((insight, i) => (
            <button
              key={insight.id}
              onClick={() => setActiveIdx(INSIGHTS.indexOf(insight))}
              className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-200 ${
                activeIdx === INSIGHTS.indexOf(insight)
                  ? "bg-indigo-50 border-indigo-200 shadow-sm"
                  : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
              }`}
            >
              <span className="text-lg">{insight.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-700 truncate">{insight.title}</p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${insight.categoryColor}`}>
                  {insight.category}
                </span>
              </div>
              <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {!showAll && INSIGHTS.length > 4 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-indigo-300 text-indigo-600 text-xs font-medium hover:bg-indigo-50 transition-colors"
          >
            Show {INSIGHTS.length - 4} More Topics →
          </button>
        )}
      </div>

      <p className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-200 pt-3">
        📚 Educational content for awareness. Not a substitute for professional medical advice.
      </p>
    </div>
  );
}
