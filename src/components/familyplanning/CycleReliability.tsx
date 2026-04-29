/**
 * CycleReliability.tsx
 *
 * Avoid Tool: Shows prediction accuracy based on cycle regularity.
 */

import { useFamilyPlanningProfile } from "@/hooks/useFamilyPlanningProfile";

export default function CycleReliability() {
  const { profile } = useFamilyPlanningProfile();
  const regularity = profile.cycleRegularity;

  const config = {
    regular: {
      emoji: "✅",
      label: "High Reliability",
      score: 85,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      barColor: "from-emerald-400 to-teal-500",
      message: "Your cycles appear regular. Predictions should be reasonably accurate.",
      tips: [
        "Continue tracking to maintain accuracy",
        "Log any cycle changes promptly",
        "Regular cycles generally mean more reliable predictions",
      ],
    },
    irregular: {
      emoji: "⚠️",
      label: "Lower Reliability",
      score: 40,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200",
      barColor: "from-red-400 to-rose-500",
      message: "Irregular cycles reduce prediction accuracy. Consider extra precautions.",
      tips: [
        "Natural cycle methods may be less reliable for you",
        "Consider combining with barrier methods",
        "Tracking multiple indicators may help improve accuracy",
        "Consult a healthcare provider for personalized guidance",
      ],
    },
    "not-sure": {
      emoji: "❓",
      label: "Unknown Reliability",
      score: 50,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
      barColor: "from-amber-400 to-orange-500",
      message: "We don't have enough information about your cycle regularity yet.",
      tips: [
        "Start tracking your cycle lengths for better accuracy",
        "Log at least 3 consecutive cycles for meaningful analysis",
        "Use extra caution until regularity is established",
      ],
    },
  };

  const conf = config[regularity];

  return (
    <div className="space-y-4">
      {/* Reliability Score */}
      <div className={`rounded-2xl p-6 border ${conf.bg} ${conf.border} text-center`}>
        <div className="text-4xl mb-2">{conf.emoji}</div>
        <p className={`text-lg font-bold ${conf.color}`}>{conf.label}</p>
        <p className="text-xs text-slate-500 mt-1">Prediction Confidence</p>

        {/* Score Ring */}
        <div className="relative w-24 h-24 mx-auto mt-4">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-200"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#reliability-gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${conf.score * 2.64} 264`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="reliability-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={regularity === "regular" ? "#34d399" : regularity === "irregular" ? "#f87171" : "#fbbf24"} />
                <stop offset="100%" stopColor={regularity === "regular" ? "#14b8a6" : regularity === "irregular" ? "#fb7185" : "#f97316"} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-black ${conf.color}`}>{conf.score}%</span>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className={`rounded-xl p-4 border ${conf.border} bg-white`}>
        <p className={`text-sm font-semibold ${conf.color} mb-2`}>{conf.message}</p>
        <ul className="space-y-1.5">
          {conf.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <span className="text-slate-400 mt-0.5">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-[10px] text-slate-400 text-center border-t border-dashed border-slate-200 pt-3">
        ⚕️ Reliability scores are estimates. Always use caution and consult healthcare professionals.
      </p>
    </div>
  );
}
