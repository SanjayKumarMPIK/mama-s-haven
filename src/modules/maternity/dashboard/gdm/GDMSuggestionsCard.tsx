import { Apple, Activity, HeartPulse, CheckCircle2 } from "lucide-react";

export default function GDMSuggestionsCard() {
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-5 sm:p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 p-32 bg-blue-100/40 rounded-bl-full -z-10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-base text-blue-900">GDM Care Suggestions</h2>
          <p className="text-xs text-blue-700/80 mt-0.5">Supportive daily guidance</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {/* Nutrition */}
        <div className="rounded-xl bg-white border border-blue-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Apple className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Nutrition</h3>
          </div>
          <ul className="space-y-1.5">
            {[
              "Choose low glycemic index foods",
              "Include fiber-rich meals (vegetables, legumes)",
              "Maintain balanced carbohydrate intake",
              "Stay hydrated throughout the day",
              "Follow suggested meal timing",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lifestyle */}
        <div className="rounded-xl bg-white border border-blue-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-800">Lifestyle</h3>
          </div>
          <ul className="space-y-1.5">
            {[
              "Take light walks after meals",
              "Practice safe pregnancy exercises",
              "Maintain a consistent sleep schedule",
              "Engage in stress reduction activities",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Monitoring */}
        <div className="rounded-xl bg-white border border-blue-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">Monitoring</h3>
          </div>
          <ul className="space-y-1.5">
            {[
              "Track your blood glucose regularly",
              "Watch for unusual fatigue or dizziness",
              "Attend all scheduled checkups",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
